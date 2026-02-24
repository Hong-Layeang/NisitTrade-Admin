import dotenv from 'dotenv';
import seedData from './seed.js';
import connectDB from '../config/database.js'

dotenv.config();

const runSeeder = async () => {
  try {
    // Test database connection
    await connectDB.authenticate();
    console.log('✅ Database connection established');

    // Drop all tables and recreate schema
    await connectDB.sync({ force: true });
    console.log('✅ Database dropped and recreated');

    // Run seeder
    await seedData();

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

runSeeder();
