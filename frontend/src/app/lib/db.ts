import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(` Query ejecutada en ${duration}ms: ${text}`);
    return res;
  } catch (error) {
    console.error(' Error en base de datos:', error);
    throw error;
  }
};