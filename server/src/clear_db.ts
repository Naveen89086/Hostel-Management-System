import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config(); 
}

import User from './models/User';
import Room from './models/Room';
import Request from './models/Request';
import Notice from './models/Notice';
import ChatMessage from './models/ChatMessage';

export const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri as string);
    console.log('MongoDB Connected for clearing');

    // Delete all users EXCEPT the Admin account
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await User.deleteMany({ _id: { $ne: adminUser._id } });
      console.log('All Wardens and Students deleted.');
    }

    // Reset all rooms to empty
    await Room.updateMany({}, { $set: { occupants: [], status: 'available' } });
    console.log('All rooms reset to available.');

    // Delete all complaints, notices, and chats
    await Request.deleteMany({});
    await Notice.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('All complaints, requests, notices, and chats deleted.');

    console.log('Database successfully cleared for production use!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
