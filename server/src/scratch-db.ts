import mongoose from 'mongoose';
import { config } from './config/env';
import User from './models/User';
import Request from './models/Request';

(async () => {
  try {
    console.log(`Connecting to: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri);
    
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
