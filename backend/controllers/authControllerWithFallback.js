import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/emailService.js';

// In-memory user store (fallback when MongoDB is not available)
const memoryUsers = new Map();
let userIdCounter = 1;
const pendingRegistrations = new Map();
const loginAttemptsByEmail = new Map();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password helper
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const LOGIN_LOCK_MINUTES = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const OTP_MAIL_TIMEOUT_MS = Number(process.env.OTP_MAIL_TIMEOUT_MS || 4000);
const ALLOW_PROD_OTP_FALLBACK =
  String(process.env.ALLOW_PROD_OTP_FALLBACK ?? 'true').toLowerCase() === 'true';

const DEV_OTP_FALLBACK =
  process.env.NODE_ENV !== 'production' ||
  ALLOW_PROD_OTP_FALLBACK;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const isRoleMetaValid = (role, meta = {}) => {
  if (role === 'student') return true;
  if (role === 'staff' || role === 'hr' || role === 'admin' || role === 'recruiter') {
    return Boolean(String(meta.department || '').trim());
  }
  return true;
};

const getRoleMetaError = (role) => {
  if (role === 'staff' || role === 'hr' || role === 'admin' || role === 'recruiter') {
    return 'Department is required for selected role';
  }
  return 'Invalid role metadata';
};

const getLockState = (email) => {
  const key = normalizeEmail(email);
  const entry = loginAttemptsByEmail.get(key);
  if (!entry) return { locked: false, attempts: 0 };
  const now = Date.now();
  if (entry.lockUntil && entry.lockUntil > now) {
    return { locked: true, attempts: entry.attempts, lockUntil: entry.lockUntil };
  }
  if (entry.lockUntil && entry.lockUntil <= now) {
    loginAttemptsByEmail.delete(key);
  }
  return { locked: false, attempts: entry.attempts || 0 };
};

const registerFailedAttempt = (email) => {
  const key = normalizeEmail(email);
  const existing = loginAttemptsByEmail.get(key) || { attempts: 0, lockUntil: null };
  const nextAttempts = Number(existing.attempts || 0) + 1;
  const lockUntil = nextAttempts >= MAX_LOGIN_ATTEMPTS
    ? Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000
    : null;
  loginAttemptsByEmail.set(key, { attempts: nextAttempts, lockUntil });
  return { attempts: nextAttempts, lockUntil };
};

const clearFailedAttempts = (email) => {
  loginAttemptsByEmail.delete(normalizeEmail(email));
};

const isMongoReady = () => mongoose?.connection?.readyState === 1;

const withTimeout = async (promise, timeoutMs, fallbackValue) => {
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const sendOtpMail = async (email, otp, purpose) => {
  const safePurpose = purpose === 'reset-password' ? 'Password Reset' : 'Registration';
  return await withTimeout(
    sendEmail({
      to: email,
      subject: `Your ${safePurpose} OTP`,
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    }),
    OTP_MAIL_TIMEOUT_MS,
    { success: false, message: 'Email timeout' }
  );
};

export const checkAvailability = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email || '');
    const phone = String(req.query.phone || '').trim();
    let emailAvailable = true;
    let phoneAvailable = true;

    if (email) {
      if (isMongoReady()) {
        try {
          const User = (await import('../models/User.js')).default;
          const existing = await User.findOne({ email }).select('_id');
          emailAvailable = !existing;
        } catch (_error) {
          emailAvailable = !Array.from(memoryUsers.values()).some((u) => normalizeEmail(u.email) === email);
        }
      } else {
        emailAvailable = !Array.from(memoryUsers.values()).some((u) => normalizeEmail(u.email) === email);
      }
    }

    if (phone) {
      if (isMongoReady()) {
        try {
          const User = (await import('../models/User.js')).default;
          const existing = await User.findOne({ phone }).select('_id');
          phoneAvailable = !existing;
        } catch (_error) {
          phoneAvailable = !Array.from(memoryUsers.values()).some((u) => String(u.phone || '').trim() === phone);
        }
      } else {
        phoneAvailable = !Array.from(memoryUsers.values()).some((u) => String(u.phone || '').trim() === phone);
      }
    }

    return res.status(200).json({ success: true, emailAvailable, phoneAvailable });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const initiateRegister = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, studentRollNumber, employeeId, agreeTerms } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' });
    }
    if (!agreeTerms) {
      return res.status(400).json({ success: false, message: 'Please accept Terms & Conditions' });
    }

    const selectedRole = role || 'student';
    if (!isRoleMetaValid(selectedRole, { department, studentRollNumber, employeeId })) {
      return res.status(400).json({ success: false, message: getRoleMetaError(selectedRole) });
    }

    if (isMongoReady()) {
      try {
        const User = (await import('../models/User.js')).default;
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'User already exists' });
        }
      } catch (_dbError) {
        const existsInMemory = Array.from(memoryUsers.values()).some((u) => normalizeEmail(u.email) === normalizedEmail);
        if (existsInMemory) {
          return res.status(400).json({ success: false, message: 'User already exists' });
        }
      }
    } else {
      const existsInMemory = Array.from(memoryUsers.values()).some((u) => normalizeEmail(u.email) === normalizedEmail);
      if (existsInMemory) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    }

    const otp = generateOtp();
    pendingRegistrations.set(normalizedEmail, {
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: selectedRole,
      phone: String(phone || '').trim(),
      department: String(department || '').trim(),
      studentRollNumber: String(studentRollNumber || '').trim(),
      employeeId: String(employeeId || '').trim(),
      otp,
      otpExpiry: Date.now() + OTP_EXPIRY_MS,
      termsAcceptedAt: new Date().toISOString()
    });

    const emailResult = await sendOtpMail(normalizedEmail, otp, 'register');

    if (!emailResult?.success && !DEV_OTP_FALLBACK) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(503).json({
        success: false,
        message: 'Unable to send OTP email right now. Please try again later.'
      });
    }

    const responsePayload = {
      success: true,
      message: emailResult?.success
        ? 'Registration OTP sent to your email.'
        : 'Email service is not configured. OTP is shown below.',
      otpRequired: true,
      otp: otp // Always include OTP for UI display
    };
    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('initiateRegister error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').replace(/\D/g, '').slice(0, 6);
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pending = pendingRegistrations.get(normalizedEmail);
    if (!pending) {
      return res.status(400).json({ success: false, message: 'Registration session not found. Please start registration again.' });
    }
    if (Date.now() > pending.otpExpiry) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }
    if (pending.otp !== otp) {
      if (DEV_OTP_FALLBACK) {
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. Please use latest OTP: ${pending.otp}`,
          devOtp: pending.otp
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    let user;
    try {
      const User = (await import('../models/User.js')).default;
      user = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role || 'student',
        phone: pending.phone,
        department: pending.department,
        studentRollNumber: pending.studentRollNumber,
        employeeId: pending.employeeId,
        otpVerified: true,
        termsAcceptedAt: pending.termsAcceptedAt
      });
      user = user.toJSON();
    } catch (_dbError) {
      const hashedPassword = await hashPassword(pending.password);
      user = {
        _id: userIdCounter.toString(),
        name: pending.name,
        email: pending.email,
        password: hashedPassword,
        role: pending.role || 'student',
        phone: pending.phone,
        department: pending.department,
        studentRollNumber: pending.studentRollNumber,
        employeeId: pending.employeeId,
        otpVerified: true,
        termsAcceptedAt: pending.termsAcceptedAt,
        createdAt: new Date()
      };
      memoryUsers.set(user._id, user);
      userIdCounter += 1;
    }

    pendingRegistrations.delete(normalizedEmail);
    const token = generateToken(user._id, user.role);
    const userResponse = { ...user };
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('verifyRegisterOtp error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = null;
    let usingDb = false;
    try {
      const User = (await import('../models/User.js')).default;
      user = await User.findOne({ email: normalizedEmail }).select('+otp +otpPurpose +otpExpiry');
      usingDb = Boolean(user);
    } catch (_dbError) {
      user = Array.from(memoryUsers.values()).find((u) => normalizeEmail(u.email) === normalizedEmail) || null;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email' });
    }

    const otp = generateOtp();
    if (usingDb) {
      user.otp = otp;
      user.otpPurpose = 'reset-password';
      user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
      await user.save();
    } else {
      user.otp = otp;
      user.otpPurpose = 'reset-password';
      user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
      memoryUsers.set(user._id, user);
    }

    const emailResult = await sendOtpMail(normalizedEmail, otp, 'reset-password');

    if (!emailResult?.success && !DEV_OTP_FALLBACK) {
      return res.status(503).json({ success: false, message: 'Unable to send OTP email right now. Please try again later.' });
    }

    const responsePayload = {
      success: true,
      message: emailResult?.success
        ? 'Password reset OTP sent to your email'
        : 'Email service is not configured. Use the OTP shown below (development mode).'
    };

    if (!emailResult?.success && DEV_OTP_FALLBACK) {
      responsePayload.devOtp = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' });
    }

    let user = null;
    let usingDb = false;
    try {
      const User = (await import('../models/User.js')).default;
      user = await User.findOne({ email: normalizedEmail }).select('+password +otp +otpPurpose +otpExpiry');
      usingDb = Boolean(user);
    } catch (_dbError) {
      user = Array.from(memoryUsers.values()).find((u) => normalizeEmail(u.email) === normalizedEmail) || null;
    }

    if (!user || !user.otp || user.otpPurpose !== 'reset-password') {
      return res.status(400).json({ success: false, message: 'Invalid reset request. Please request OTP again.' });
    }
    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (String(user.otp) !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (usingDb) {
      user.password = newPassword;
      user.otp = undefined;
      user.otpPurpose = null;
      user.otpExpiry = undefined;
      await user.save();
    } else {
      user.password = await hashPassword(newPassword);
      user.otp = undefined;
      user.otpPurpose = null;
      user.otpExpiry = undefined;
      memoryUsers.set(user._id, user);
    }

    clearFailedAttempts(normalizedEmail);
    return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Register - with Memory Fallback
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      });
    }

    let user;
    let isDbAvailable = false;

    try {
      // Try MongoDB first
      const User = (await import('../models/User.js')).default;
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      user = await User.create({
        name,
        email,
        password,
        role: role || 'student'
      });

      isDbAvailable = true;
      user = user.toJSON();
    } catch (dbError) {
      // MongoDB not available, use in-memory storage
      console.log('📝 Using in-memory storage for user registration');

      // Check if user exists in memory
      for (let u of memoryUsers.values()) {
        if (u.email === email) {
          return res.status(400).json({
            success: false,
            message: 'User already exists'
          });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user in memory
      user = {
        _id: userIdCounter.toString(),
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        createdAt: new Date()
      };

      memoryUsers.set(user._id, user);
      userIdCounter++;
    }

    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login - with Memory Fallback
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Validate input
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const lockState = getLockState(normalizedEmail);
    if (lockState.locked) {
      const minutesLeft = Math.max(1, Math.ceil((lockState.lockUntil - Date.now()) / 60000));
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${minutesLeft} minute(s).`
      });
    }

    let user;

    try {
      // Try MongoDB first
      const User = (await import('../models/User.js')).default;
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        registerFailedAttempt(normalizedEmail);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      user = user.toJSON();
    } catch (dbError) {
      // MongoDB not available, check in-memory
      console.log('📝 Using in-memory storage for user login');

      user = null;
      for (let u of memoryUsers.values()) {
        if (normalizeEmail(u.email) === normalizedEmail) {
          user = u;
          break;
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        registerFailedAttempt(normalizedEmail);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    clearFailedAttempts(normalizedEmail);

    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    let user;

    try {
      // Try MongoDB first
      const User = (await import('../models/User.js')).default;
      user = await User.findById(userId);
    } catch (dbError) {
      // MongoDB not available, check in-memory
      user = memoryUsers.get(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: typeof user.toJSON === 'function' ? user.toJSON() : user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    let user;
    
    try {
      // Try MongoDB first
      const User = (await import('../models/User.js')).default;
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
        user.email = email;
      }

      user.name = name;
      if (avatar) {
        user.avatar = avatar;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: user.toJSON()
      });
    } catch (dbError) {
      // MongoDB not available, use in-memory
      user = memoryUsers.get(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken
      let emailExists = false;
      for (const u of memoryUsers.values()) {
        if (u.email === email && u.id !== userId) {
          emailExists = true;
          break;
        }
      }

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }

      user.name = name;
      user.email = email;
      if (avatar) {
        user.avatar = avatar;
      }

      memoryUsers.set(userId, user);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user avatar with file upload
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;

    try {
      // Try MongoDB first
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create avatar URL - accessible via /uploads/filename
      const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      user.avatar = avatarUrl;
      await user.save();

      const updatedUser = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        avatar: avatarUrl,
        user: updatedUser
      });
    } catch (dbError) {
      console.error('MongoDB error, using fallback:', dbError);
      
      // Fallback: still save the file and return success
      const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      // Update in-memory user
      const user = memoryUsers.get(userId);
      if (user) {
        user.avatar = avatarUrl;
        memoryUsers.set(userId, user);
      }
      
      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatar: avatarUrl,
        user: user || { avatar: avatarUrl }
      });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update avatar'
    });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
