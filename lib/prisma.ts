import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  const adapter = new PrismaMariaDb(databaseUrl)
  const prisma = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  return prisma
}
