import { Pool } from 'pg'

// Main xenoCampus platform DB
// Stores: schools, billing, plans, branding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export default pool

// Helper for single queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Get school DB connection by subdomain
export async function getSchoolDB(subdomain: string) {
  const result = await query(
    'SELECT * FROM schools WHERE subdomain = $1 AND status = $2',
    [subdomain, 'active']
  )
  return result.rows[0] || null
}
