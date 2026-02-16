const { pool, ensureInitialized } = require('./_db.cjs')

module.exports = async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Database is not configured' })
    return
  }

  await ensureInitialized()

  if (req.method === 'GET') {
    const result = await pool.query(
      'select data from settings where id = 1'
    )

    if (result.rows.length === 0) {
      res.status(200).json({})
      return
    }

    res.status(200).json(result.rows[0].data)
    return
  }

  if (req.method === 'PUT') {
    const body = req.body

    if (!body) {
      res.status(400).json({ error: 'Body required' })
      return
    }

    await pool.query(
      `
        insert into settings (id, data)
        values (1, $1)
        on conflict (id) do update set data = excluded.data
      `,
      [body]
    )

    res.status(200).json(body)
    return
  }

  res.setHeader('Allow', 'GET,PUT')
  res.status(405).end('Method Not Allowed')
}

