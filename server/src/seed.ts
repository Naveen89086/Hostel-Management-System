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

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@gmail.com', password: adminPassword, role: 'admin' },
      { name: 'Warden Kumar', email: 'warden@gmail.com', password: wardenPassword, role: 'warden' },
      { name: 'Rahul Sharma', email: 'rahul@gmail.com', password: studentPassword, role: 'student', department: 'Computer Science', year: 2 },
      { name: 'Priya Patel', email: 'priya@gmail.com', password: studentPassword, role: 'student', department: 'Electronics', year: 3 },
      { name: 'Amit Singh', email: 'amit@gmail.com', password: studentPassword, role: 'student', department: 'Mechanical', year: 1 },
      { name: 'Neha Gupta', email: 'neha@gmail.com', password: studentPassword, role: 'student', department: 'Civil', year: 2 },
      { name: 'Arjun Das', email: 'arjun@gmail.com', password: studentPassword, role: 'student', department: 'Computer Science', year: 4 },
    ]);
    console.log('Users created');

    const rahulId = users.find(u => u.email === 'rahul@gmail.com')?._id;
    const priyaId = users.find(u => u.email === 'priya@gmail.com')?._id;
    const amitId = users.find(u => u.email === 'amit@gmail.com')?._id;
    const nehaId = users.find(u => u.email === 'neha@gmail.com')?._id;
    const arjunId = users.find(u => u.email === 'arjun@gmail.com')?._id;
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
    console.log('Rooms created');

    // Assign Students to Rooms
    const roomA101 = await Room.findOneAndUpdate({ roomNumber: 'A-102' }, { $push: { occupants: { $each: [rahulId, amitId] } }, status: 'occupied' }, { new: true });
    await User.findByIdAndUpdate(rahulId, { roomNumber: 'A-102' });
    await User.findByIdAndUpdate(amitId, { roomNumber: 'A-102' });

    const roomB203 = await Room.findOneAndUpdate({ roomNumber: 'B-201' }, { $push: { occupants: priyaId }, status: 'occupied' }, { new: true });
    await User.findByIdAndUpdate(priyaId, { roomNumber: 'B-201' });

    const roomA105 = await Room.findOneAndUpdate({ roomNumber: 'A-104' }, { $push: { occupants: { $each: [nehaId, arjunId] } }, status: 'occupied' }, { new: true });
    await User.findByIdAndUpdate(nehaId, { roomNumber: 'A-104' });
    await User.findByIdAndUpdate(arjunId, { roomNumber: 'A-104' });
    
    console.log('Students assigned to rooms');

    // Create Requests
    await Request.insertMany([
      { user: rahulId, type: 'maintenance', title: 'Leaking Tap', description: 'The tap in the bathroom is leaking continuously.', roomNumber: 'A-102', urgency: 'medium', status: 'pending', category: 'plumbing' },
      { user: priyaId, type: 'complaint', title: 'Loud Noise', description: 'Students in the adjacent room are playing loud music late at night.', roomNumber: 'B-201', urgency: 'high', status: 'in_progress', category: 'noise' },
      { user: nehaId, type: 'room_change', title: 'Request for Room Change', description: 'I would like to move to a single room next semester.', roomNumber: 'A-104', urgency: 'low', status: 'resolved', response: 'Approved. You will be moved to B-301 next semester.' },
      { user: amitId, type: 'maintenance', title: 'Broken Chair', description: 'My study chair is broken.', roomNumber: 'A-102', urgency: 'low', status: 'rejected', category: 'furniture', response: 'Please visit the admin office to collect a replacement.' }
    ]);
    console.log('Requests created');

    // Create Notices
    await Notice.insertMany([
      { title: 'Hostel Fees Due', content: 'Please pay the hostel fees for the upcoming semester by the end of the month.', author: adminId, priority: 'urgent', tags: ['Fees', 'Important'] },
      { title: 'Maintenance Work', content: 'There will be plumbing maintenance work in Block A tomorrow from 10 AM to 2 PM.', author: wardenId, priority: 'important', tags: ['Maintenance', 'Block A'] },
      { title: 'New Wi-Fi Network', content: 'A new high-speed Wi-Fi network has been installed in the common areas.', author: adminId, priority: 'normal', tags: ['Wi-Fi', 'Facilities'] },
      { title: 'Upcoming Hostel Party', content: 'Join us for the annual hostel party next Friday!', author: wardenId, priority: 'normal', tags: ['Event', 'Social'] },
      { title: 'Pest Control', content: 'Pest control will be carried out in all rooms this weekend. Please secure your food items.', author: wardenId, priority: 'important', tags: ['Maintenance', 'Health'] }
    ]);
    console.log('Notices created');

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
