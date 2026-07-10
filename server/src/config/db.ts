import mongoose from 'mongoose';
import { config } from './env';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedData } from '../seed'; // Assuming we export it

let mongoServer: MongoMemoryServer;

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`Standard MongoDB connection failed: ${error.message}`);
    console.log('Falling back to In-Memory MongoDB Server for development purposes...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      console.log('Seeding in-memory database...');
      await seedData(false); // Pass false to prevent process.exit(0)
    } catch (memError) {
      console.error('In-Memory MongoDB connection error:', memError);
      process.exit(1);
    }
  }
};

export default connectDB;
