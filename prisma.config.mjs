// Prisma v7+ ESM config for migrations
// Load local .env so the Prisma CLI can see `DATABASE_URL` when parsing this file.
import 'dotenv/config';

// Use the singular `datasource` key and minimal fields Prisma expects.
export default {
  datasource: {
    // Maps to the `datasource db {}` in `schema.prisma`
    url: process.env.DATABASE_URL,
    // optional: shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    // Explicit migrations path; Prisma uses ./prisma/migrations by default
    path: './prisma/migrations',
  },
};
