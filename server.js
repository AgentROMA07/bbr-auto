import http from 'http';
import { URL } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';
import { cars as initialCars } from './src/data.js';

dotenv.config();

const { Pool } = pkg;

const hasProcess = typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env;
const connectionString = hasProcess
  ? globalThis.process.env.NEON_DATABASE_URL || globalThis.process.env.DATABASE_URL
  : undefined;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

async function ensureSchema() {
  if (!pool) {
    return;
  }

  await pool.query(`
    create table if not exists cars (
      id serial primary key,
      data jsonb not null
    )
  `);

  await pool.query(`
    create table if not exists settings (
      id integer primary key,
      data jsonb not null
    )
  `);

  const countResult = await pool.query('select count(*)::int as count from cars');
  if (countResult.rows[0].count === 0) {
    const client = await pool.connect();
    try {
      await client.query('begin');
      for (const car of initialCars) {
        await client.query('insert into cars (data) values ($1)', [car]);
      }
      await client.query('commit');
    } catch (e) {
      await client.query('rollback');
      console.error('Failed to seed cars', e);
    } finally {
      client.release();
    }
  }

  const settingsResult = await pool.query('select count(*)::int as count from settings where id = 1');
  if (settingsResult.rows[0].count === 0) {
    const defaultSettings = {
      logo: null,
      whatsappNumber: '+7 707 123 45 67',
    };
    await pool.query('insert into settings (id, data) values (1, $1)', [defaultSettings]);
  }
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve(null);
        return;
      }
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  if (data === null) {
    res.end();
  } else {
    res.end(JSON.stringify(data));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (url.pathname === '/api/cars' && req.method === 'GET') {
      if (!pool) {
        sendJson(res, 200, initialCars);
        return;
      }
      const result = await pool.query('select id, data from cars order by id desc');
      const rows = result.rows.map((row) => ({
        id: row.id,
        ...row.data,
      }));
      sendJson(res, 200, rows);
      return;
    }

    if (url.pathname === '/api/cars' && req.method === 'POST') {
      if (!pool) {
        sendJson(res, 503, { error: 'Database is not configured' });
        return;
      }
      const body = await readJsonBody(req);
      if (!body) {
        sendJson(res, 400, { error: 'Body required' });
        return;
      }
      const result = await pool.query(
        'insert into cars (data) values ($1) returning id, data',
        [body]
      );
      const row = result.rows[0];
      sendJson(res, 201, { id: row.id, ...row.data });
      return;
    }

    if (url.pathname.startsWith('/api/cars/') && (req.method === 'PUT' || req.method === 'DELETE')) {
      if (!pool) {
        sendJson(res, 503, { error: 'Database is not configured' });
        return;
      }
      const idPart = url.pathname.split('/')[3];
      const carId = parseInt(idPart, 10);
      if (!Number.isFinite(carId)) {
        sendJson(res, 400, { error: 'Invalid id' });
        return;
      }

      if (req.method === 'DELETE') {
        await pool.query('delete from cars where id = $1', [carId]);
        sendJson(res, 204, null);
        return;
      }

      const body = await readJsonBody(req);
      if (!body) {
        sendJson(res, 400, { error: 'Body required' });
        return;
      }
      const result = await pool.query(
        'update cars set data = $2 where id = $1 returning id, data',
        [carId, body]
      );
      if (result.rows.length === 0) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      const row = result.rows[0];
      sendJson(res, 200, { id: row.id, ...row.data });
      return;
    }

    if (url.pathname === '/api/settings' && req.method === 'GET') {
      if (!pool) {
        sendJson(res, 200, {
          logo: null,
          whatsappNumber: '+7 707 123 45 67',
        });
        return;
      }
      const result = await pool.query('select data from settings where id = 1');
      if (result.rows.length === 0) {
        sendJson(res, 200, {});
        return;
      }
      sendJson(res, 200, result.rows[0].data);
      return;
    }

    if (url.pathname === '/api/settings' && req.method === 'PUT') {
      if (!pool) {
        sendJson(res, 503, { error: 'Database is not configured' });
        return;
      }
      const body = await readJsonBody(req);
      if (!body) {
        sendJson(res, 400, { error: 'Body required' });
        return;
      }
      await pool.query(
        `
        insert into settings (id, data)
        values (1, $1)
        on conflict (id) do update set data = excluded.data
      `,
        [body]
      );
      sendJson(res, 200, body);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

if (connectionString) {
  ensureSchema()
    .then(() => {
      const port =
        hasProcess && globalThis.process.env.PORT ? Number(globalThis.process.env.PORT) || 3000 : 3000;
      server.listen(port, () => {
        console.log(`API server listening on port ${port}`);
      });
    })
    .catch((e) => {
      console.error('Failed to initialize database', e);
      const port = 3000;
      server.listen(port, () => {
        console.log(`API server listening on port ${port} (database init failed)`);
      });
    });
} else {
  const port = 3000;
  server.listen(port, () => {
    console.log(`API server listening on port ${port} (no database connection)`);
  });
}
