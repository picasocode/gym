import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * Database client with two backends:
 *
 * - If TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set, all traffic goes to the
 *   Turso (libSQL) cloud database through Prisma's libSQL driver adapter.
 * - Otherwise it falls back to the local SQLite file from DATABASE_URL.
 *
 * The client is cached on globalThis keyed by its connection config, so Next.js
 * dev hot-reloads rebuild the client when the backend env vars change instead of
 * silently reusing a stale connection.
 */

type CacheShape = { key: string; client: PrismaClient }

const globalForPrisma = globalThis as unknown as {
  __deathProtocolPrisma?: CacheShape
}

/**
 * Which backend the current connection config resolves to.
 * Read per-call (not at import time) so dev env reloads are reflected.
 */
export function currentDbBackend(): 'turso' | 'sqlite' {
  return process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
    ? 'turso'
    : 'sqlite'
}

function createDbClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    // PrismaLibSQL takes the libSQL client config directly and manages
    // the underlying @libsql/client connection itself.
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken })
    return new PrismaClient({ adapter })
  }

  return new PrismaClient({
    log: ['query'],
  })
}

function getClient(): PrismaClient {
  const key = `${process.env.TURSO_DATABASE_URL ?? ''}|${process.env.DATABASE_URL ?? 'local'}`

  const cached = globalForPrisma.__deathProtocolPrisma
  if (cached && cached.key === key) return cached.client

  const client = createDbClient()
  globalForPrisma.__deathProtocolPrisma = { key, client }
  return client
}

export const db = getClient()
