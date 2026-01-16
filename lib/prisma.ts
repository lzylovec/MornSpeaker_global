import { PrismaClient } from "@prisma/client"
import { PrismaMariaDB } from "@prisma/adapter-mariadb"
import mysql from "mariadb"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  const pool = mysql.createPool(databaseUrl)
  const adapter = new PrismaMariaDB(pool)
  const prisma = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  return prisma
}
