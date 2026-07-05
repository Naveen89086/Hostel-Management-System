import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import ChatMessage from '../models/ChatMessage';
import RequestModel from '../models/Request';
import { parseHostelRequest } from '../services/gemini.service';
import { AppError } from '../middleware/errorHandler';
import { emitToRole } from '../sockets';

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      return next(new AppError('Message is required', 400));
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      user: req.user!.id,
      message: message.trim(),
      sender: 'user',
    });

    // Parse with AI
    const parsed = await parseHostelRequest(message.trim(), req.user!.role);

    let createdRequest = null;

    // If actionable, create a request
    if (parsed.isActionable) {
      createdRequest = await RequestModel.create({
        user: req.user!.id,
        type: parsed.type,
        title: parsed.title,
        description: parsed.description,
        roomNumber: parsed.roomNumber || undefined,
        category: parsed.category || undefined,
        urgency: parsed.urgency,
        aiParsed: true,
        aiExtractedData: parsed,
      });

      // Emit to wardens and admins
      const populatedRequest = await RequestModel.findById(
        createdRequest._id
      ).populate('user', 'name email');
      emitToRole('warden', 'request:created', populatedRequest);
      emitToRole('admin', 'request:created', populatedRequest);
    }

    // Save AI response message
    const aiMessage = await ChatMessage.create({
      user: req.user!.id,
      message: parsed.friendlyResponse,
      sender: 'ai',
      requestCreated: createdRequest?._id,
      parsedIntent: parsed.type,
    });

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        parsed,
        requestCreated: createdRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ChatMessage.find({ user: req.user!.id })
        .populate('requestCreated', 'type title status')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      ChatMessage.countDocuments({ user: req.user!.id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages,
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
