// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma





// import { PrismaClient } from '@prisma/client'

// declare global {
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined
// }

// export const prisma = global.prisma ?? new PrismaClient()
// if (process.env.NODE_ENV !== 'production') global.prisma = prisma




// import { PrismaClient } from "@prisma/client"

// declare global {
//   var prisma: PrismaClient | undefined
// }

// export const prisma =
//   global.prisma ||
//   new PrismaClient({
//     log: ["query", "error", "warn"],
//   })

// if (process.env.NODE_ENV !== "production") global.prisma = prisma





// src/lib/prisma.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

declare global {
  var prisma: PrismaClient | undefined;

  interface PrismaGlobals {
    prisma?: PrismaClient
    __prisma?: PrismaClient
  }

  // Extend NodeJS.Global for environments that use it
  namespace NodeJS {
    interface Global extends PrismaGlobals {}
  }

  // Ensure globalThis can also expose the prisma symbols
  interface GlobalThis extends PrismaGlobals {}

  var __prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> | undefined;
}

const prisma = global.__prisma ?? new PrismaClient();

export const db = global.prisma || new PrismaClient();

export { prisma };

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
// export { db as prisma }; // Export as prisma for compatibility