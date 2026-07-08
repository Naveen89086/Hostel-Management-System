import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../types';
import RequestModel from '../models/Request';
import { AppError } from '../middleware/errorHandler';
import { emitToUser, emitToRole } from '../sockets';
import User from '../models/User';

export const getRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, type, urgency } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Students can only see their own requests
    if (req.user!.role === 'student') {
      filter.user = req.user!.id;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (urgency) filter.urgency = urgency;

    const [requests, total] = await Promise.all([
      RequestModel.find(filter)
        .populate('user', 'name email roomNumber')
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      RequestModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id)
      .populate('user', 'name email roomNumber')
      .populate('assignedTo', 'name email');

    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    // Students can only view their own requests
    if (
      req.user!.role === 'student' &&
      request.user._id.toString() !== req.user!.id
    ) {
      return next(new AppError('Not authorized to view this request', 403));
    }

    res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userDoc = await User.findById(req.user!.id);
    const roomNumber = req.body.roomNumber || userDoc?.roomNumber || undefined;

    const request = await RequestModel.create({
      ...req.body,
      roomNumber,
      user: req.user!.id,
    });

    const populatedRequest = await RequestModel.findById(request._id).populate(
      'user',
      'name email roomNumber'
    );

    // Emit to wardens and admins
    emitToRole('warden', 'request:created', populatedRequest);
    emitToRole('admin', 'request:created', populatedRequest);

    res.status(201).json({
      success: true,
      data: { request: populatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, response, assignedTo } = req.body;

    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    // Only warden/admin can update status and response
    if (req.user!.role === 'student') {
      return next(new AppError('Not authorized to update requests', 403));
    }

    if (status) request.status = status;
    if (response) request.response = response;
    if (assignedTo) request.assignedTo = assignedTo;

    await request.save();

    const updatedRequest = await RequestModel.findById(request._id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    // Emit to request owner, wardens, and admins
    emitToUser(request.user.toString(), 'request:updated', updatedRequest);
    emitToRole('warden', 'request:updated', updatedRequest);
    emitToRole('admin', 'request:updated', updatedRequest);

    res.status(200).json({
      success: true,
      data: { request: updatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchStage: any = {};

    if (req.user!.role === 'student') {
      matchStage.user = new mongoose.Types.ObjectId(req.user!.id);
    }

    const [statusStats, typeStats, urgencyStats, totalCount] =
      await Promise.all([
        RequestModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        RequestModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        RequestModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$urgency', count: { $sum: 1 } } },
        ]),
        RequestModel.countDocuments(matchStage),
      ]);

    const formatStats = (stats: any[]) =>
      stats.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        byStatus: formatStats(statusStats),
        byType: formatStats(typeStats),
        byUrgency: formatStats(urgencyStats),
      },
    });
  } catch (error) {
    next(error);
  }
};
