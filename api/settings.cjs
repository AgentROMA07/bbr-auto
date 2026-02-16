const { query } = require('./_db.cjs');

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function getSettings(req, res) {
  const result = await query('SELECT * FROM settings WHERE id = 1');
  const row = result.rows[0] || {};
  sendJson(res, 200, {
    salonName: row.salon_name || '',
    whatsappNumber: row.whatsapp_number || '',
    logoUrl: row.logo_url || '',
  });
}

async function saveSettings(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const { salonName, whatsappNumber, logoUrl } = data;

      await query(
        `
        INSERT INTO settings (id, salon_name, whatsapp_number, logo_url)
        VALUES (1, $1, $2, $3)
        ON CONFLICT (id)
        DO UPDATE SET
          salon_name = EXCLUDED.salon_name,
          whatsapp_number = EXCLUDED.whatsapp_number,
          logo_url = EXCLUDED.logo_url
      `,
        [salonName || '', whatsappNumber || '', logoUrl || '']
      );

      sendJson(res, 200, { success: true });
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: 'Internal Server Error' });
    }
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      await getSettings(req, res);
    } else if (req.method === 'POST') {
      await saveSettings(req, res);
    } else {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET,POST');
      res.end('Method Not Allowed');
    }
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
};

