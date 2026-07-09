import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config(); 
}

import User from './models/User';
import Request from './models/Request';
import Notice from './models/Notice';
import Room from './models/Room';
import ChatMessage from './models/ChatMessage';

export const purgeData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri as string);
    console.log('MongoDB Connected for purging');

    // 1. Delete all requests, notices, rooms, chat messages
    await Request.deleteMany({});
    await Notice.deleteMany({});
    await Room.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('Requests, Notices, Rooms, and Chat Messages completely cleared');

    // 2. Delete all students and dummy users. Keep only admins and wardens.
    const deletedUsers = await User.deleteMany({ role: { $nin: ['admin', 'warden'] } });
    console.log(`Deleted ${deletedUsers.deletedCount} students / dummy users.`);

    process.exit(0);
  } catch (error) {
    console.error('Error purging data:', error);
    process.exit(1);
  }
};

purgeData();
