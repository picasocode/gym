/**
 * Direct Turso verification (bypasses Prisma): confirms the cloud DB is
 * reachable, holds the protocol schema, and reports row counts.
 * Run: bun scripts/verify-turso.ts   (Bun auto-loads .env)
 */
import { createClient } from '@libsql/client'

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  if (!url || !token) {
    console.error('FAIL: TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not set')
    process.exit(1)
  }

  const client = createClient({ url, authToken: token })
  console.log('url:', url)

  const ping = await client.execute('SELECT 1 AS one')
  console.log('ping:', JSON.stringify(ping.rows))

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name",
  )
  console.log('tables:', tables.rows.map((r) => r.name).join(', '))

  for (const t of ['Athlete', 'Exercise', 'Week', 'Completion']) {
    const res = await client.execute(`SELECT COUNT(*) AS n FROM "${t}"`)
    console.log(`${t}: ${res.rows[0]?.n}`)
  }

  const athletes = await client.execute('SELECT name, color FROM Athlete ORDER BY createdAt')
  console.log('athletes:', athletes.rows.map((r) => `${r.name}(${r.color})`).join(', '))

  const weeks = await client.execute('SELECT key FROM Week ORDER BY key')
  console.log('weeks:', weeks.rows.map((r) => r.key).join(', '))
}

main().catch((err) => {
  console.error('FAIL:', err instanceof Error ? err.message : err)
  process.exit(1)
})
