import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let db: Pool;

// Ensure there's only one pool instance in development with hot-reloading
// In production, this check isn't necessary but doesn't hurt.
if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
  });
} else {
  // In development, use a global variable to preserve the pool across HMR
  if (!global.dbPool) {
    global.dbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        }
    });
  }
  db = global.dbPool;
}

export { db };

// Augment the NodeJS global type to include our custom property
declare global {
  var dbPool: Pool;
}