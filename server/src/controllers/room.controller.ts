import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Room from '../models/Room';
import RequestModel from '../models/Request';
import { AppError } from '../middleware/errorHandler';

export const getRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, type, block, floor } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (block) filter.block = block;
    if (floor) filter.floor = parseInt(floor as string);

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .populate('occupants', 'name email roomNumber')
        .skip(skip)
        .limit(limit)
        .sort({ block: 1, roomNumber: 1 }),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        rooms,
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

export const getRoomById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id).populate(
      'occupants',
      'name email roomNumber'
    );

    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('occupants', 'name email roomNumber');

    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const requestAllocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomNumber, preferences } = req.body;

    const request = await RequestModel.create({
      user: req.user!.id,
      type: 'room_allocation',
      title: `Room Allocation Request${roomNumber ? ` - Room ${roomNumber}` : ''}`,
      description:
        preferences ||
        `Requesting room allocation${roomNumber ? ` for room ${roomNumber}` : ''}`,
      roomNumber,
      urgency: 'medium',
    });

    res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
