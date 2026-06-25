import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Import routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import detailedApplicationRoutes from './routes/detailedApplications.js';
import interviewRoutes from './routes/interviews.js';
import interviewExamRoutes from './routes/interviewExams.js';
import statsRoutes from './routes/stats.js';
import aiRoutes from './routes/ai.js';
import placementRoutes from './routes/placements.js';
import placementStatsRoutes from './routes/placementStats.js';
import examRoutes from './routes/exams.js';
import resumeAnalysisRoutes from './routes/resumeAnalysis.js';
import onboardingRoutes from './routes/onboarding.js';
import jobRequisitionsRoutes from './routes/jobRequisitions.js';
import adminRoutes from './routes/admin.js';
import emailRoutes from './routes/emails.js';
import notificationRoutes from './routes/notifications.js';
import oauthRoutes from './routes/oauth.js';
import authOAuthRoutes from './routes/authOAuth.js';
import otpRoutes from './routes/otp.js';

// 1a. Import Kaggle data service
import { loadKagglePlacementData } from './utils/kaggleDataService.js';
import { startApplicationReminderScheduler } from './utils/reminderScheduler.js';

// 2. Initialize configuration
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
// Socket.IO setup
import { initSocket } from './utils/socketServer.js';
initSocket(server);

// 3. ✅ CORS Configuration
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  'http://localhost:5184',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://172.16.0.2:5175',
  'http://192.168.56.1:5175',
  'http://10.57.3.1:5175'
]);

const addAllowedOrigin = (origin) => {
  const value = (origin || '').trim().replace(/\/+$/, '');
  if (value) {
    allowedOrigins.add(value);
  }
};

addAllowedOrigin(process.env.FRONTEND_URL);

if (process.env.FRONTEND_URLS) {
  process.env.FRONTEND_URLS
    .split(',')
    .forEach((origin) => addAllowedOrigin(origin));
}

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = (origin || '').trim().replace(/\/+$/, '');

    // Allow server-to-server calls and tools without Origin header
    if (!normalizedOrigin) {
      return callback(null, true);
    }

    let isVercelApp = false;
    try {
      const hostname = new URL(normalizedOrigin).hostname;
      isVercelApp = /\.vercel\.app$/i.test(hostname);
    } catch (_error) {
      isVercelApp = /\.vercel\.app$/i.test(normalizedOrigin);
    }

    if (allowedOrigins.has(normalizedOrigin) || isVercelApp) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options(/.*/, cors(corsOptions));

// 4. Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// 5. MongoDB Connection
const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (dbURI) {
  mongoose.connect(dbURI)
    .then(() => {
      console.log('✅ MongoDB Connected');
      // Load Kaggle data on startup
      loadKagglePlacementData().then(result => {
        console.log(`📊 Placement Data: ${result.message}`);
      });
    })
    .catch(err => console.error('❌ MongoDB Error:', err.message));
} else {
  console.warn('⚠️ MongoDB URI not configured');
}

// 6. ✅ Route Mounting
// Note: aiRoutes is now mounted once, correctly, after app initialization
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/oauth', otpRoutes); // OTP verification endpoint
app.use('/api/auth', authOAuthRoutes); // Real OAuth GET endpoints for frontend redirects
app.use('/api/oauth', authOAuthRoutes); // Compatibility alias for legacy OAuth callback URLs
app.use('/api/students', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-requisitions', jobRequisitionsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/placement-stats', placementStatsRoutes); // Kaggle Placement Data
app.use('/api/detailed-applications', detailedApplicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview-exams', interviewExamRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes); // Gemini AI Endpoint
app.use('/api/resume-analysis', resumeAnalysisRoutes); // Resume Analysis & ATS Scoring
app.use('/api/placements', placementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes); // Admin management endpoints
app.use('/api/emails', emailRoutes); // Email communication
app.use('/api/notifications', notificationRoutes); // Notification system

// 7. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!', ai_status: 'Connected to Gemini' });
});

// 8. Global Error Handling
app.use((err, req, res, next) => {
  console.error('Critical Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 9. Start Server
const PORT = process.env.PORT || 5000;

// Start application reminder scheduler
startApplicationReminderScheduler();

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is already in use. Another backend instance is likely already running.`);
    console.warn(`ℹ️ Use http://localhost:${PORT}/api/health to verify the active instance.`);
    process.exit(0);
  }

  console.error('❌ Server startup error:', error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✨ Gemini AI ready at http://localhost:${PORT}/api/ai/chat`);
  console.log(`🔌 Socket.IO signaling server running`);
});