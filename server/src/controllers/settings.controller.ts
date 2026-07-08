import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Settings from '../models/Settings';
import { AppError } from '../middleware/errorHandler';
import { emitToAll } from '../sockets';

// Get current settings (or create default if none exists)
export const getSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update settings
export const updateSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hostelName, contactEmail, supportPhone, maintenanceMode, autoApproveLeaves, enableGlobalNotifications } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({});
    }

    const previousMaintenanceMode = settings.maintenanceMode;

    if (hostelName !== undefined) settings.hostelName = hostelName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (autoApproveLeaves !== undefined) settings.autoApproveLeaves = autoApproveLeaves;
    if (enableGlobalNotifications !== undefined) settings.enableGlobalNotifications = enableGlobalNotifications;

    await settings.save();

    // If maintenance mode was turned on/off, notify all connected clients
    if (previousMaintenanceMode !== settings.maintenanceMode) {
      emitToAll('system:maintenance', { enabled: settings.maintenanceMode });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

