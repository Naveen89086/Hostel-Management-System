import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User';
import Room from '../models/Room';
import RequestModel from '../models/Request';
import Notice from '../models/Notice';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalRequests,
      pendingRequests,
      totalNotices
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'maintenance' }),
      RequestModel.countDocuments(),
      RequestModel.countDocuments({ status: 'pending' }),
      Notice.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        totalRequests,
        pendingRequests,
        totalNotices
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get requests by status
    const byStatus = await RequestModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get requests by type
    const byType = await RequestModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get requests over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const byDate = await RequestModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byType,
        byDate
      }
    });
  } catch (error) {
    next(error);
  }
};
