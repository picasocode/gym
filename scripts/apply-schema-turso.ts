import { createClient } from '@libsql/client'
import { execSync } from 'child_process'

/**
 * Applies the Prisma schema to the Turso (libSQL) database.
 *
 * Prisma's `db push` / migrate commands cannot target libsql:// URLs, so we:
 *   1. Generate the CREATE TABLE/INDEX DDL from prisma/schema.prisma with
 *      `prisma migrate diff --from-empty`.
 *   2. Rewrite every CREATE into CREATE ... IF NOT EXISTS so the script is
 *      idempotent and safe against an existing database.
 *   3. Execute the DDL over the libSQL wire protocol.
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the environment.
 */

function die(msg: string): never {
  console.error(msg)
  process.exit(1)
}

const url = process.env.TURSO_DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN
if (!url || !token) {
  die('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running this script.')
}

// 1. Generate DDL from the schema data model.
const ddl = execSync(
  'bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
  { cwd: process.cwd(), encoding: 'utf-8' },
)

// 2. Make it idempotent.
const idempotent = ddl
  .replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ')
  .replace(/CREATE UNIQUE INDEX /g, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
  .replace(/CREATE INDEX /g, 'CREATE INDEX IF NOT EXISTS ')

// 3. Apply to Turso.
const client = createClient({ url, authToken: token })

const before = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
)
console.log(
  'tables before:',
  before.rows.map((r) => r.name).join(', ') || '(none)',
)

await client.executeMultiple(idempotent)

const after = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
)
console.log(
  'tables after:',
  after.rows.map((r) => r.name).join(', '),
)

client.close()
console.log('schema applied to', url)
