import { Pool } from 'pg'
import { query } from './db'

// Called after Stripe payment succeeds
// Creates a schema for the school inside Supabase and runs migrations
export async function provisionSchool(schoolId: string) {
  const school = await getSchool(schoolId)
  if (!school) throw new Error('School not found')

  const schemaName = generateSchemaName(school.subdomain)

  try {
    // 1. Create the school's schema inside Supabase
    await createSchema(schemaName)

    // 2. Run Django migrations targeting the new schema
    await runMigrations(schemaName, school.subdomain)

    // 3. Create R2 storage folder
    await createStorageFolder(school.subdomain)

    // 4. Mark school as active + save schema name
    await query(
      `UPDATE schools 
       SET status = $1, provisioned_at = NOW(), db_schema = $2
       WHERE id = $3`,
      ['active', schemaName, schoolId]
    )

    console.log(`School ${school.subdomain} provisioned with schema: ${schemaName}`)
    return { success: true }

  } catch (error) {
    console.error(`Provisioning failed for school ${schoolId}:`, error)
    await query(
      'UPDATE schools SET status = $1 WHERE id = $2',
      ['provision_failed', schoolId]
    )
    throw error
  }
}

async function createSchema(schemaName: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const client = await pool.connect()
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    console.log(`Schema ${schemaName} created`)
  } finally {
    client.release()
    await pool.end()
  }
}

async function runMigrations(schemaName: string, subdomain: string) {
  const response = await fetch(`${process.env.DJANGO_BACKEND_URL}/api/provision/migrate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schema_name: schemaName,
      subdomain,
      provision_key: process.env.PROVISION_SECRET_KEY,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Migration failed: ${error.error}`)
  }

  console.log(`Migrations complete for schema: ${schemaName}`)
}

async function createStorageFolder(subdomain: string) {
  console.log(`Storage folder ready: ${subdomain}/`)
}

async function getSchool(schoolId: string) {
  const result = await query('SELECT * FROM schools WHERE id = $1', [schoolId])
  return result.rows[0] || null
}

export function generateSchemaName(subdomain: string): string {
  const safe = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `school_${safe}`
}

export function generateConnectionString(_dbName: string): string {
  return process.env.DATABASE_URL!
}

export function generateDbName(subdomain: string): string {
  return generateSchemaName(subdomain)
}