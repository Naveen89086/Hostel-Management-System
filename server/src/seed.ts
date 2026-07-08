import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Fallback if root .env not found
if (!process.env.MONGODB_URI) {
    dotenv.config(); 
}

import User from './models/User';
import Room from './models/Room';
import Request from './models/Request';
import Notice from './models/Notice';
import ChatMessage from './models/ChatMessage';

export const seedData = async (exitOnComplete: boolean = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelhub';
      console.log(`Connecting to MongoDB at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected for seeding');
    } else {
      console.log('Using existing MongoDB connection for seeding');
    }

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Request.deleteMany({});
    await Notice.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('Collections cleared');

    // Create Users
    const salt = await bcrypt.genSalt(12);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const wardenPassword = await bcrypt.hash('warden123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const naveenPassword = await bcrypt.hash('naveen1', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@gmail.com', password: adminPassword, role: 'admin' },
      { name: 'Warden Kumar', email: 'warden@gmail.com', password: wardenPassword, role: 'warden' },
      { name: 'Naveen Student', email: 'naveen@gmail.com', password: naveenPassword, role: 'student' },
      { name: 'Rahul Student', email: 'rahul@gmail.com', password: studentPassword, role: 'student' },
    ]);
    console.log('Users created');

    const adminId = users.find(u => u.email === 'admin@gmail.com')?._id;
    const wardenId = users.find(u => u.email === 'warden@gmail.com')?._id;

    // Create Rooms
    const roomsToCreate = [];
    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 5; num++) {
        // Block A
        roomsToCreate.push({
          roomNumber: `A-${floor}0${num}`,
          floor,
          block: 'A',
          capacity: num % 3 === 0 ? 3 : (num % 2 === 0 ? 2 : 1),
          type: num % 3 === 0 ? 'triple' : (num % 2 === 0 ? 'double' : 'single'),
          amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', num % 2 === 0 ? 'AC' : 'Fan'],
          status: 'available',
          occupants: []
        });
        // Block B
        roomsToCreate.push({
          roomNumber: `B-${floor}0${num}`,
          floor,
          block: 'B',
          capacity: num % 3 === 0 ? 3 : (num % 2 === 0 ? 2 : 1),
          type: num % 3 === 0 ? 'triple' : (num % 2 === 0 ? 'double' : 'single'),
          amenities: ['Bed', 'Study Table', 'Chair', 'Cupboard', num % 2 === 0 ? 'AC' : 'Fan'],
          status: 'available',
          occupants: []
        });
      }
    }
    
    const rooms = await Room.insertMany(roomsToCreate);
    console.log('Rooms created (empty)');

    console.log('Seed completed successfully!');
    if (exitOnComplete) {
        process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    if (exitOnComplete) {
        process.exit(1);
    }
  }
};

// If run directly from command line
if (require.main === module) {
    seedData(true);
}
