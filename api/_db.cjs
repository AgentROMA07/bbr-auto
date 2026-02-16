const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) return pool;

  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error('DATABASE_URL is not set');
  }

  let connectionString = raw;

  const match = raw.match(/(postgresql:\/\/.*)/);
  if (match) {
    connectionString = match[1].replace(/^'+|'+$/g, '');
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  return pool;
}

async function ensureSchema() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      price BIGINT NOT NULL,
      engine_ru TEXT,
      engine_kz TEXT,
      transmission_ru TEXT,
      transmission_kz TEXT,
      dimensions TEXT,
      clearance_ru TEXT,
      clearance_kz TEXT,
      options_ru TEXT,
      options_kz TEXT,
      finance JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id SERIAL PRIMARY KEY,
      car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      is_base BOOLEAN DEFAULT FALSE,
      color_name TEXT,
      color_hex TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      salon_name TEXT,
      whatsapp_number TEXT,
      logo_url TEXT
    );

    INSERT INTO settings (id)
    VALUES (1)
    ON CONFLICT (id) DO NOTHING;
  `);
}

async function query(text, params) {
  await ensureSchema();
  return getPool().query(text, params);
}

module.exports = {
  query,
};
