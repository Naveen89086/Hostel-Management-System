import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Notice from '../models/Notice';
import { AppError } from '../middleware/errorHandler';
import { emitToAll } from '../sockets';

export const getNotices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    // Filter out expired notices
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } },
    ];

    const priorityOrder: Record<string, number> = {
      urgent: 0,
      important: 1,
      normal: 2,
    };

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate('author', 'name role')
        .skip(skip)
        .limit(limit)
        .sort({ priority: 1, createdAt: -1 }),
      Notice.countDocuments(filter),
    ]);

    // Sort by priority order (urgent first) then by date
    const sortedNotices = notices.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    res.status(200).json({
      success: true,
      data: {
        notices: sortedNotices,
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

export const createNotice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notice = await Notice.create({
      ...req.body,
      author: req.user!.id,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
    });

    const populatedNotice = await Notice.findById(notice._id).populate(
      'author',
      'name role'
    );

    // Emit to all connected clients
    emitToAll('notice:posted', populatedNotice);

    res.status(201).json({
      success: true,
      data: { notice: populatedNotice },
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return next(new AppError('Notice not found', 404));
    }

    // Only the author or admin can update
    if (
      notice.author.toString() !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to update this notice', 403));
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        expiresAt: req.body.expiresAt
          ? new Date(req.body.expiresAt)
          : undefined,
      },
      { new: true, runValidators: true }
    ).populate('author', 'name role');

    res.status(200).json({
      success: true,
      data: { notice: updatedNotice },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return next(new AppError('Notice not found', 404));
    }

    // Only the author or admin can delete
    if (
      notice.author.toString() !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to delete this notice', 403));
    }

    // Soft delete - set isActive to false
    notice.isActive = false;
    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
