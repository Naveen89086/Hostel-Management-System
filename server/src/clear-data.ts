import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config(); 
}

import Request from './models/Request';
import Notice from './models/Notice';
import ChatMessage from './models/ChatMessage';

export const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri as string);
    console.log('MongoDB Connected for clearing');

    await Request.deleteMany({});
    await Notice.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('Requests, Notices, and Chat Messages cleared');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
