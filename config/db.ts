import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    console.error('MongoDB connection failed: environment variable `MONGO_URL` or `MONGO_URI` is not set.');
    console.error('Set it in your .env file or environment and restart the server.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: process.env.DATABASE_NAME });
    console.log('MongoDB connected DATABASE:', process.env.DATABASE_NAME);
  } catch (error) {
    console.error('MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;