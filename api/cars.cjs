const { query } = require('./_db.cjs');

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function getCars(req, res) {
  const carsResult = await query('SELECT * FROM cars ORDER BY id ASC');
  const imagesResult = await query(
    'SELECT * FROM car_images ORDER BY sort_order ASC, id ASC'
  );

  const imagesByCar = new Map();
  for (const img of imagesResult.rows) {
    if (!imagesByCar.has(img.car_id)) {
      imagesByCar.set(img.car_id, []);
    }
    imagesByCar.get(img.car_id).push(img);
  }

  const cars = carsResult.rows.map((row) => {
    const imgs = imagesByCar.get(row.id) || [];
    const gallery = imgs
      .filter((img) => img.is_base)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url);

    const colorMap = new Map();
    imgs
      .filter((img) => !img.is_base && img.color_name)
      .forEach((img) => {
        const key = `${img.color_name}__${img.color_hex || ''}`;
        if (!colorMap.has(key)) {
          colorMap.set(key, {
            id: img.id,
            name: img.color_name,
            hex: img.color_hex || '#ffffff',
            images: [],
          });
        }
        colorMap.get(key).images.push(img.url);
      });

    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      price: Number(row.price),
      engine: {
        ru: row.engine_ru || '',
        kz: row.engine_kz || '',
      },
      transmission: {
        ru: row.transmission_ru || '',
        kz: row.transmission_kz || '',
      },
      dimensions: row.dimensions || '',
      clearance: {
        ru: row.clearance_ru || '',
        kz: row.clearance_kz || '',
      },
      options: {
        ru: row.options_ru || '',
        kz: row.options_kz || '',
      },
      finance: row.finance || null,
      image: gallery[0] || '',
      gallery,
      colorVariants: Array.from(colorMap.values()),
    };
  });

  sendJson(res, 200, { cars });
}

async function saveCar(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const {
        id,
        brand,
        model,
        price,
        engine,
        transmission,
        dimensions,
        clearance,
        options,
        finance,
        gallery,
        colorVariants,
      } = data;

      if (!brand || !model || !price) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }

      let carId = id || null;

      if (carId) {
        await query(
          `
          UPDATE cars
          SET brand = $1,
              model = $2,
              price = $3,
              engine_ru = $4,
              engine_kz = $5,
              transmission_ru = $6,
              transmission_kz = $7,
              dimensions = $8,
              clearance_ru = $9,
              clearance_kz = $10,
              options_ru = $11,
              options_kz = $12,
              finance = $13,
              updated_at = now()
          WHERE id = $14
        `,
          [
            brand,
            model,
            price,
            engine?.ru || '',
            engine?.kz || '',
            transmission?.ru || '',
            transmission?.kz || '',
            dimensions || '',
            clearance?.ru || '',
            clearance?.kz || '',
            options?.ru || '',
            options?.kz || '',
            finance || null,
            carId,
          ]
        );

        await query('DELETE FROM car_images WHERE car_id = $1', [carId]);
      } else {
        const insertResult = await query(
          `
          INSERT INTO cars
            (brand, model, price, engine_ru, engine_kz, transmission_ru, transmission_kz,
             dimensions, clearance_ru, clearance_kz, options_ru, options_kz, finance)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          RETURNING id
        `,
          [
            brand,
            model,
            price,
            engine?.ru || '',
            engine?.kz || '',
            transmission?.ru || '',
            transmission?.kz || '',
            dimensions || '',
            clearance?.ru || '',
            clearance?.kz || '',
            options?.ru || '',
            options?.kz || '',
            finance || null,
          ]
        );
        carId = insertResult.rows[0].id;
      }

      const baseGallery = Array.isArray(gallery) ? gallery : [];
      let index = 0;
      for (const url of baseGallery) {
        await query(
          `
          INSERT INTO car_images (car_id, url, is_base, sort_order)
          VALUES ($1, $2, TRUE, $3)
        `,
          [carId, url, index]
        );
        index += 1;
      }

      const variants = Array.isArray(colorVariants) ? colorVariants : [];
      for (const variant of variants) {
        const imgs = Array.isArray(variant.images) ? variant.images : [];
        for (const url of imgs) {
          await query(
            `
            INSERT INTO car_images (car_id, url, is_base, color_name, color_hex, sort_order)
            VALUES ($1, $2, FALSE, $3, $4, $5)
          `,
            [
              carId,
              url,
              variant.name || '',
              variant.hex || '#ffffff',
              index,
            ]
          );
          index += 1;
        }
      }

      sendJson(res, 200, { success: true, id: carId });
    } catch (err) {
      console.error(err);
      sendJson(res, 500, {
        error: 'Internal Server Error',
        detail: err.message || 'Unknown error',
      });
    }
  });
}

async function deleteCar(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');

  if (!id) {
    return sendJson(res, 400, { error: 'Missing id' });
  }

  await query('DELETE FROM car_images WHERE car_id = $1', [id]);
  await query('DELETE FROM cars WHERE id = $1', [id]);

  sendJson(res, 200, { success: true });
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      await getCars(req, res);
    } else if (req.method === 'POST') {
      await saveCar(req, res);
    } else if (req.method === 'DELETE') {
      await deleteCar(req, res);
    } else {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET,POST,DELETE');
      res.end('Method Not Allowed');
    }
  } catch (err) {
    console.error(err);
    sendJson(res, 500, {
      error: 'Internal Server Error',
      detail: err.message || 'Unknown error',
    });
  }
};
