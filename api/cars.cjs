const { pool, ensureInitialized } = require('./_db.cjs')

module.exports = async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Database is not configured' })
    return
  }

  await ensureInitialized()

  if (req.method === 'GET') {
    const result = await pool.query(
      'select id, data from cars order by id desc'
    )
    const rows = result.rows.map((row) => ({
      id: row.id,
      ...row.data,
    }))
    res.status(200).json(rows)
    return
  }

  if (req.method === 'POST') {
    const body = req.body
    if (!body) {
      res.status(400).json({ error: 'Body required' })
      return
    }
    const result = await pool.query(
      'insert into cars (data) values ($1) returning id, data',
      [body]
    )
    const row = result.rows[0]
    res.status(201).json({ id: row.id, ...row.data })
    return
  }

  if (req.method === 'PUT' || req.method === 'DELETE') {
    const { id } = req.query
    const carId = parseInt(id, 10)

    if (!Number.isFinite(carId)) {
      res.status(400).json({ error: 'Invalid id' })
      return
    }

    if (req.method === 'DELETE') {
      await pool.query('delete from cars where id = $1', [carId])
      res.status(204).end()
      return
    }

    const body = req.body
    if (!body) {
      res.status(400).json({ error: 'Body required' })
      return
    }

    const result = await pool.query(
      'update cars set data = $2 where id = $1 returning id, data',
      [carId, body]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not found' })
      return
    }

    const row = result.rows[0]
    res.status(200).json({ id: row.id, ...row.data })
    return
  }

  res.setHeader('Allow', 'GET,POST,PUT,DELETE')
  res.status(405).end('Method Not Allowed')
}

