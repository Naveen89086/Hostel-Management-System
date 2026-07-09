import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config(); 
}

import User from './models/User';

export const seedStudent = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri as string);
    console.log('MongoDB Connected for seeding student');

    // Check if user exists first to prevent duplicates
    const existing = await User.findOne({ email: 'rahul@gmail.com' });
    if (!existing) {
        await User.create({ 
            name: 'Rahul Student', 
            email: 'rahul@gmail.com', 
            password: 'student123', 
            role: 'student' 
        });
        console.log('Test student created successfully!');
    } else {
        // Update password just in case
        existing.password = 'student123';
        await existing.save();
        console.log('Test student updated successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedStudent();
