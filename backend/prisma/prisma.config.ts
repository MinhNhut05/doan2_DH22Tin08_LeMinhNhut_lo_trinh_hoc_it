// prisma.config.ts
// Prisma 7 configuration file for migrations
// Docs: https://pris.ly/d/config-datasource

import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// File này đang được TypeScript check theo CommonJS semantics trong repo hiện tại,
// nên dùng __dirname thay vì import.meta.dirname để tránh TS1470.
const configDir = typeof __dirname === 'string' ? __dirname : process.cwd();
const envPath = path.resolve(configDir, '../.env');
dotenv.config({ path: envPath });

export default defineConfig({
  schema: path.resolve(configDir, 'schema.prisma'),

  datasource: {
    url: process.env.DATABASE_URL!,
  },

  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
