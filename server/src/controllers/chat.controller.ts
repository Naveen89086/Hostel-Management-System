import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import ChatMessage from '../models/ChatMessage';
import RequestModel from '../models/Request';
import User from '../models/User';
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

    // Fetch context data based on role
    let contextString = '';
    let studentRoom = '';
    if (req.user!.role === 'admin' || req.user!.role === 'warden') {
      const [totalStudents, pendingComplaints, activeAlerts, pendingLeaves] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        RequestModel.countDocuments({ status: { $in: ['pending', 'in_progress'] }, category: { $nin: ['Emergency', 'Leave'] } }),
        RequestModel.countDocuments({ status: { $ne: 'resolved' }, $or: [{ category: 'Emergency' }, { urgency: 'critical' }] }),
        RequestModel.countDocuments({ status: 'pending', category: 'Leave' })
      ]);
      contextString = `DASHBOARD STATS: Total Students: ${totalStudents} | Pending Complaints: ${pendingComplaints} | Active Emergency Alerts: ${activeAlerts} | Pending Leave Requests: ${pendingLeaves}. Share these exact numbers if asked about stats.`;
    } else {
      const userDoc = await User.findById(req.user!.id);
      studentRoom = userDoc?.roomNumber || '';
      const roomNum = studentRoom || 'Not assigned';
      const myRequests = await RequestModel.find({ user: req.user!.id, status: { $ne: 'resolved' } }).select('title category status').limit(5);
      
      const requestList = myRequests.map(r => `${r.title} (${r.category}) - ${r.status}`).join(', ');
      contextString = `USER PROFILE: Room Number: ${roomNum}. ACTIVE REQUESTS/LEAVES: ${requestList || 'None'}. Share these details if asked about their room or status.`;
    }

    // Fetch conversation history
    const history = await ChatMessage.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(8);
      
    const chatHistory = history.reverse().map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.message
    }));

    // Save user message (after fetching history so it doesn't duplicate the current message if we change order, but we can just save it first, wait, if we saved it first, it would be in history. Let's save it after fetching history to keep history strictly previous messages).
    
    // Save user message
    const userMessage = await ChatMessage.create({
      user: req.user!.id,
      message: message.trim(),
      sender: 'user',
    });

    // Parse with AI
    const parsed = await parseHostelRequest(message.trim(), req.user!.role, contextString, chatHistory);

    let createdRequest = null;

    // If actionable, create a request
    if (parsed.isActionable) {
      createdRequest = await RequestModel.create({
        user: req.user!.id,
        type: parsed.type,
        title: parsed.title,
        description: parsed.description,
        roomNumber: parsed.roomNumber || studentRoom || undefined,
        category: parsed.category || undefined,
        urgency: parsed.urgency,
        aiParsed: true,
        aiExtractedData: parsed,
      });

      // Emit to wardens and admins
      const populatedRequest = await RequestModel.findById(
        createdRequest._id
      ).populate('user', 'name email roomNumber');
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
