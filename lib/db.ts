import { PrismaClient } from "@prisma/client";

// This file implements the Singleton pattern for PrismaClient.
// It prevents the Next.js development server (Hot Module Replacement)
// from creating a new PrismaClient instance every time your code changes,
// which would deplete your database connection pool quickly.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // FIX: Added "error" to logging array to help debug database connection/write failures
    log: ["query", "error"],
  });

// In development, store the client on the global object
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}