import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const poolMax = toPositiveInt(process.env.DB_POOL_MAX, 20);
const poolMin = toPositiveInt(process.env.DB_POOL_MIN, 0);
const poolAcquireMs = toPositiveInt(process.env.DB_POOL_ACQUIRE_MS, 60000);
const poolIdleMs = toPositiveInt(process.env.DB_POOL_IDLE_MS, 10000);

const connectDB = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  pool: {
    max: poolMax,
    min: poolMin,
    acquire: poolAcquireMs,
    idle: poolIdleMs,
  },
});

export const testConnection = async () => {
  try {
    await connectDB.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default connectDB;
