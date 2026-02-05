// prisma.config.ts
// Prisma 7 configuration file for migrations
// Docs: https://pris.ly/d/config-datasource

import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Load environment variables from .env file
import 'dotenv/config';

export default defineConfig({
  // Schema file location
  schema: path.resolve(__dirname, 'schema.prisma'),

  // Datasource configuration for migrations
  datasource: {
    // Database URL for migrations
    url: process.env.DATABASE_URL!,
  },
});
