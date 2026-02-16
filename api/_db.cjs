const { Pool } = require('pg')

const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null

let initialized = false

async function ensureInitialized() {
  if (!pool || initialized) return

  await pool.query(`
    create table if not exists cars (
      id serial primary key,
      data jsonb not null
    )
  `)

  await pool.query(`
    create table if not exists settings (
      id integer primary key,
      data jsonb not null
    )
  `)

  const countResult = await pool.query(
    'select count(*)::int as count from cars'
  )

  if (countResult.rows[0].count === 0) {
    const { cars: initialCars } = await import('../src/data.js')
    const client = await pool.connect()
    try {
      await client.query('begin')
      for (const car of initialCars) {
        await client.query('insert into cars (data) values ($1)', [car])
      }
      await client.query('commit')
    } catch (e) {
      await client.query('rollback')
      console.error('Failed to seed cars', e)
    } finally {
      client.release()
    }
  }

  const settingsResult = await pool.query(
    'select count(*)::int as count from settings where id = 1'
  )

  if (settingsResult.rows[0].count === 0) {
    const defaultSettings = {
      logo: null,
      whatsappNumber: '+7 707 123 45 67',
    }
    await pool.query(
      'insert into settings (id, data) values (1, $1)',
      [defaultSettings]
    )
  }

  initialized = true
}

module.exports = {
  pool,
  ensureInitialized,
}

