import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { emitToAll } from '../sockets';

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, phone, department, year, roomNumber, block, rollNo } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user without generating tokens or setting cookies
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      department,
      year,
      roomNumber,
      block,
      rollNo,
    });

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    // Emit event for real-time updates
    emitToAll('user:created', userResponse);

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, department, year } = req.body;
    
    // Only allow updating specific fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { name, phone, department, year } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Emit event for real-time updates
    emitToAll('user:updated', updatedUser);

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, page = '1', limit = '10' } = req.query;
    const query: any = {};
    if (role) {
      query.role = role;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ createdAt: 1 });
      
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    emitToAll('user:updated', user);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    emitToAll('user:updated', user);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    emitToAll('user:deleted', { id: req.params.id });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
