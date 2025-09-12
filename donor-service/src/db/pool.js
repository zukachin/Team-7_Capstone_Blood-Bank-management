// db/pool.js
require('dotenv').config();
const { Pool } = require('pg');

const {
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
  PG_PORT
} = process.env;

// sanity checks
if (!PG_HOST) {
  console.error('FATAL: PG_HOST is not set in .env');
  process.exit(1);
}
if (!PG_USER) {
  console.error('FATAL: PG_USER is not set in .env');
  process.exit(1);
}
if (typeof PG_PASSWORD === 'undefined') {
  console.error('FATAL: PG_PASSWORD is not set in .env');
  process.exit(1);
}
if (!PG_DATABASE) {
  console.error('FATAL: PG_DATABASE is not set in .env');
  process.exit(1);
}

const pool = new Pool({
  host: PG_HOST,
  user: PG_USER,
  password: String(PG_PASSWORD),
  database: PG_DATABASE,
  port: Number(PG_PORT || 5432)
});

// check connection once on startup
(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();

// listen for pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
