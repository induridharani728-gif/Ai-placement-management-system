import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import Student from '../models/Student.js';



const ALLOWED_NOTIFICATION_TYPES = new Set([
  'email',
  'application',
  'interview',
  'placement',
  'system',
  'alert',
  'job',
  'internship'
]);

const normalizeNotificationType = (rawType) => {
  const normalized = String(rawType || '').toLowerCase();
  if (ALLOWED_NOTIFICATION_TYPES.has(normalized)) {
    return normalized;
  }
  if (['critical', 'warning', 'info'].includes(normalized)) {
    return 'alert';
  }
  return 'system';
};

const getRequestUserId = (req) => {
  const userId = req?.user?.id || req?.user?._id || req?.user?.userId;
  return typeof userId === 'string' ? userId : String(userId || '');
};

const parseLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 50;
  }
  return Math.min(parsed, 200);
};

// Send notification(s) to multiple users (STAFF/ADMIN ONLY)
export const sendBulkNotification = async (req, res) => {
  try {
    const { userIds, title, message, type = 'system' } = req.body;
    const safeTitle = String(title || '').trim();
    const safeMessage = String(message || '').trim();

    if (!Array.isArray(userIds) || userIds.length === 0 || !safeTitle || !safeMessage) {
      return res.status(400).json({ message: 'userIds (array), title, and message are required' });
    }

    const validUserIds = [...new Set(userIds
      .map((id) => String(id || '').trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id)))];

    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'No valid recipient user IDs were provided' });
    }

    const existingUsers = await User.find({ _id: { $in: validUserIds } }).select('_id');
    const existingUserIds = new Set(existingUsers.map((userDoc) => String(userDoc._id)));
    const deliverableUserIds = validUserIds.filter((id) => existingUserIds.has(id));

    if (deliverableUserIds.length === 0) {
      return res.status(404).json({ message: 'No matching users found for provided user IDs' });
    }

    const safeType = normalizeNotificationType(type);
    const docsToInsert = deliverableUserIds.map((userId) => ({
      userId,
      type: safeType,
      title: safeTitle,
      message: safeMessage
    }));



    let notifications = [];
    try {
      notifications = await Notification.insertMany(docsToInsert, { ordered: false });
    } catch (bulkError) {
      const inserted = Array.isArray(bulkError?.insertedDocs) ? bulkError.insertedDocs : [];
      if (inserted.length === 0) {
        throw bulkError;
      }
      notifications = inserted;
    }

    const sentCount = notifications.length;
    const skippedCount = userIds.length - sentCount;
    if (sentCount === 0) {
      return res.status(500).json({ message: 'Failed to send notifications' });
    }

    res.status(201).json({
      message: `Notifications sent to ${sentCount} users`,
      notifications,
      sentCount,
      skippedRecipients: skippedCount
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    const { limit = 50, unreadOnly = false } = req.query;

    const query = { userId };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseLimit(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({ 
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification request' });
    }

    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ message: 'No readable notifications for current user context' });
    }

    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getRequestUserId(req);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification request' });
    }

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

// Create notification (utility function for other controllers)
export const createNotification = async (userId, type, title, message, relatedId, relatedModel) => {
  try {
    const payload = {
      userId,
      type,
      title,
      message
    };

    const hasRelatedModel = typeof relatedModel === 'string' && relatedModel.trim().length > 0;
    const hasValidRelatedId = relatedId && mongoose.Types.ObjectId.isValid(String(relatedId));

    if (hasRelatedModel && hasValidRelatedId) {
      payload.relatedModel = relatedModel;
      payload.relatedId = relatedId;
    }

    const notification = new Notification(payload);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const autoImportStudentFromCSV = async (identifier) => {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'students.csv');
    if (!fs.existsSync(csvPath)) return null;

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const idStr = String(identifier).trim().toLowerCase();
    const record = records.find(r => {
      const studentId = String(r.Student_ID || r.student_id || r.id || '').trim().toLowerCase();
      const email = `student${studentId}@college.edu`;
      const altEmail = `student${studentId}@demo.edu`;
      return studentId === idStr || email === idStr || altEmail === idStr;
    });

    if (!record) return null;

    const studentId = String(record.Student_ID || record.student_id || record.id || '').trim();
    const email = `student${studentId}@college.edu`;

    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: record.Name || `Student ${studentId}`,
        email,
        password: passwordHash,
        role: 'student'
      });
    }

    const skills = [];
    if (record.Coding_Skills) skills.push(`Coding: ${record.Coding_Skills}`);
    if (record.Communication_Skills) skills.push(`Communication: ${record.Communication_Skills}`);
    if (record.Soft_Skills_Rating) skills.push(`Soft Skills: ${record.Soft_Skills_Rating}`);
    if (record.Aptitude_Test_Score) skills.push(`Aptitude: ${record.Aptitude_Test_Score}`);
    if (record.Certifications) skills.push(`Certifications: ${record.Certifications}`);

    await Student.findOneAndUpdate(
      { user: user._id },
      {
        _id: studentId,
        user: user._id,
        rollNumber: studentId,
        branch: record.Branch || 'CSE',
        cgpa: parseFloat(record.CGPA) || 8.0,
        age: parseInt(record.Age) || 21,
        gender: record.Gender || 'Male',
        degree: record.Degree || 'B.Tech',
        skills,
        placementStatus: record.Placement_Status || 'Not Placed',
        isPlaced: record.Placement_Status === 'Placed'
      },
      { upsert: true, new: true }
    );

    return user;
  } catch (err) {
    console.error('Failed to auto-import student from CSV:', err);
    return null;
  }
};

// One-to-one notification utility
export const sendDirectNotification = async (req, res) => {
  try {
    const {
      recipientId,
      userId,
      recipientEmail,
      targetRole,
      title,
      message,
      type = 'system',
      relatedId,
      relatedModel
    } = req.body;

    const directRecipientId = String(recipientId || userId || '').trim();
    const emailRecipient = String(recipientEmail || '').trim().toLowerCase();
    const safeTitle = String(title || '').trim();
    const safeMessage = String(message || '').trim();

    if ((!directRecipientId && !emailRecipient) || !safeTitle || !safeMessage) {
      return res.status(400).json({ message: 'recipientId or recipientEmail, title, and message are required' });
    }

    let recipientUser = null;

    if (directRecipientId) {
      if (mongoose.Types.ObjectId.isValid(directRecipientId)) {
        recipientUser = await User.findById(directRecipientId).select('_id role email');
      } else {
        recipientUser = await autoImportStudentFromCSV(directRecipientId);
      }
    } else {
      recipientUser = await User.findOne({ email: emailRecipient }).select('_id role email');
      if (!recipientUser) {
        recipientUser = await autoImportStudentFromCSV(emailRecipient);
      }
    }

    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }


    if (targetRole && String(targetRole).toLowerCase() !== String(recipientUser.role || '').toLowerCase()) {
      return res.status(400).json({ message: `Recipient is not in target role '${targetRole}'` });
    }

    const safeType = normalizeNotificationType(type);
    const notif = await createNotification(recipientUser._id, safeType, safeTitle, safeMessage, relatedId, relatedModel);
    res.status(201).json({ message: 'Direct notification sent', notification: notif });
  } catch (error) {
    console.error('Error sending direct notification:', error);
    res.status(500).json({ message: 'Failed to send direct notification', error: error.message });
  }
};

// Get all notifications for HR (from staff, students, admin, and system)
export const getAllNotificationsForHR = async (req, res) => {
  try {
    const userRole = req.user?.role || '';
    const normalizedRole = String(userRole).toLowerCase();

    // Only HR, Admin, and Staff can view all notifications
    if (!['hr', 'admin', 'staff'].includes(normalizedRole)) {
      return res.status(403).json({ message: 'Unauthorized: Only HR, Admin, and Staff can view all notifications' });
    }

    const { limit = '100', unreadOnly = 'false', type, source } = req.query;
    const query = {};

    if (String(unreadOnly).toLowerCase() === 'true') {
      query.read = false;
    }

    if (type) {
      query.type = String(type).toLowerCase();
    }

    try {
      // Fetch notifications with source information, using lean for better performance
      let notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseLimit(limit))
        .populate({
          path: 'userId',
          select: 'role email name department',
          options: { lean: true }
        })
        .exec();

      // Ensure notifications is an array
      if (!Array.isArray(notifications)) {
        notifications = [];
      }

      // If source filter is specified, filter by the sender's role
      if (source) {
        const sourceRole = String(source).toLowerCase();
        notifications = notifications.filter((notif) => {
          const senderRole = String(notif?.userId?.role || '').toLowerCase();
          return senderRole === sourceRole;
        });
      }

      const unreadCount = await Notification.countDocuments({ ...query, read: false });
      const totalCount = await Notification.countDocuments(query);

      return res.status(200).json({
        notifications: notifications || [],
        unreadCount,
        totalCount
      });
    } catch (dbError) {
      console.error('Database error fetching notifications:', dbError.message);
      // Return empty list on DB error instead of failing
      return res.status(200).json({
        notifications: [],
        unreadCount: 0,
        totalCount: 0
      });
    }
  } catch (error) {
    console.error('Error fetching all notifications for HR:', error.message);
    // Return empty list instead of error to prevent UI from breaking
    return res.status(200).json({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      warning: 'Unable to fetch notifications'
    });
  }
};
