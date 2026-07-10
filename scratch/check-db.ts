import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

import User from '../server/src/models/User';
import Request from '../server/src/models/Request';

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelhub';
    console.log(`Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    
    const user = await User.findOne({ email: 'rahul@gmail.com' });
    console.log('User rahul@gmail.com:', user ? {
      name: user.name,
      email: user.email,
      role: user.role,
      block: user.block,
      roomNumber: user.roomNumber
    } : 'Not found');

    const requests = await Request.find({}).populate('user');
    console.log(`Total Requests/Complaints in DB: ${requests.length}`);
    requests.forEach((r: any) => {
      console.log(`- Request: "${r.title}", Category: "${r.category}", Status: "${r.status}", User block: "${r.user?.block}", User room: "${r.user?.roomNumber}"`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
})();
