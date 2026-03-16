// Run this once to create your superadmin account
// Command: npx ts-node --project tsconfig.json scripts/seed-admin.ts
// Or: node -r ts-node/register scripts/seed-admin.ts

import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// ── Fill these in ─────────────────────────────────────
const ADMIN_NAME = 'Your Name'
const ADMIN_EMAIL = 'you@xenocampus.com'
const ADMIN_PASSWORD = 'your_strong_password_here'
// ─────────────────────────────────────────────────────

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  await pool.query(`
    INSERT INTO admins (name, email, password_hash)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash
  `, [ADMIN_NAME, ADMIN_EMAIL, hash])

  console.log(`Admin created: ${ADMIN_EMAIL}`)
  await pool.end()
}

seed().catch(console.error)