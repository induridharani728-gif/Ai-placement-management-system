import React, { useState, useEffect, useRef, useMemo } from 'react';
import ExamDesk from './ExamDesk';
import { jobRequisitionsAPI, placementsAPI, interviewAPI, applicationsAPI, jobAPI, studentAPI, notificationsAPI } from '../../services/api';
import { onboardingAPI } from '../../services/api';
import ImageCropUpload from '../../components/common/ImageCropUpload';

// Utility to normalize avatar URL
function getAvatarUrl(avatar) {
  if (!avatar) return '';
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (avatar.startsWith('/uploads/')) {
    return baseUrl + avatar;
  }
  return avatar;
}

// Mock data for development fallback
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const mockOffers = [
  {
    id: 'OFFER001',
    candidateName: 'Aarav Mehta',
    position: 'Frontend Developer',
    status: 'Pending',
    offerDate: '2026-03-01',
    salary: '₹12 LPA',
    joiningDate: '2026-06-15',
    recruiter: 'HR Team',
  },
  {
    id: 'OFFER002',
    candidateName: 'Isha Reddy',
    position: 'Backend Developer',
    status: 'Accepted',
    offerDate: '2026-03-05',
    salary: '₹14 LPA',
    joiningDate: '2026-07-01',
    recruiter: 'HR Team',
  },
];

const mockOnboardingTasks = [
  {
    id: 'TASK001',
    candidateName: 'Aarav Mehta',
    task: 'Submit Documents',
    status: 'Pending',
    dueDate: '2026-06-01',
  },
  {
    id: 'TASK002',
    candidateName: 'Isha Reddy',
    task: 'Complete Orientation',
    status: 'In Progress',
    dueDate: '2026-07-10',
  },
];
import HRJobs from './Jobs';
import VideoConference from '../../components/VideoConference';
import Modal from '../../components/Modal';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';


import EnhancedEmailModal from "../../components/EnhancedEmailModal";

import ProfileModal from '../../components/common/ProfileModal';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);



import {
  Users, Briefcase, Award, TrendingUp, BarChart3, PieChart,
  CheckCircle, Clock, Star, Filter, Plus, Eye,
  Search, MoreVertical, MapPin, DollarSign, Calendar, ArrowLeft,
  Mail, Phone, FileText, ChevronRight, Zap, Brain, MessageSquare,
  TrendingDown, ArrowUp, ArrowDown, Sparkles, Target, AlertCircle,
  LayoutDashboard, Settings, LogOut, Bell, Shield, Layers, Activity,
  GitBranch, Database, RefreshCw, Sun, Moon, ChevronDown, Monitor,
  Copy, ThumbsUp, ThumbsDown, Flag, Building2, User,
  Video, FileCheck, Users2, Archive, Trash2, Edit, Share2, X,
  Briefcase as JobIcon, UserPlus, CheckSquare, Sliders, Download,
  Upload, File, BarChart2, LineChart, HelpCircle, ZapOff, Database as DatabaseIcon,
  TrendingUp as TrendingUpIcon, Zap as ZapIcon, Save, GraduationCap, Inbox
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSelector } from '../../contexts/LanguageContext';
const HRDashboard = () => {
  const { t } = useLanguage();
      // State for New Job modal
      const [showCreateModal, setShowCreateModal] = useState(false);
    // Inline StatCard component for analytics cards
    const StatCard = ({ icon: Icon, label, value, trend, color, details }) => (
      <div className="border p-6 rounded-2xl hover:border-indigo-500/50 transition-colors cursor-default group bg-white/5 dark:bg-slate-800/60">
        <div className="flex justify-between items-start mb-4">
          <Icon className={`w-8 h-8 ${color} group-hover:scale-110 transition-transform`} />
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${trend.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-4xl font-black">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest mt-1 text-slate-500 dark:text-slate-400">{label}</p>
        {details && <p className="text-[10px] mt-2 text-slate-400 dark:text-slate-500">{details}</p>}
      </div>
    );
  // Edit Interview Modal State
  const [showEditInterviewModal, setShowEditInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  // Video Call Modal State
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  // Import Modal State (for Jobs & Reqs)
  const [showImportModal, setShowImportModal] = useState(false);
      // Export profile data as JSON file
      const handleExport = () => {
        const profileData = {
          name: profileForm.name,
          phone: profileForm.phone,
          avatar: profileForm.avatar,
          email: user?.email || '',
          role: user?.role || '',
        };
        const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-export-${profileForm.name || 'user'}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };
    // Custom scrollbar CSS for consistent styling
  // HR Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { user: contextUser, token: contextToken, logout } = useAuth();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : contextUser;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || contextToken);
  const navigate = useNavigate();
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canAccessHRDashboard = ['hr', 'admin', 'staff', 'recruiter'].includes(normalizedRole);

  // Keep user/token in sync with localStorage (for ProtectedRoute)
  useEffect(() => {
    const syncAuth = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : contextUser);
      setToken(localStorage.getItem('token') || contextToken);
    };
    window.addEventListener('storage', syncAuth);
    syncAuth();
    return () => window.removeEventListener('storage', syncAuth);
  }, [contextUser, contextToken]);
  
  // Theme Detection & State
    // Toggle theme between light and dark
    const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      handleThemeChange(newTheme);
    };
  const [currentView, setCurrentView] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fix: Set mounted to true after component mounts to prevent blank page
  useEffect(() => {
    setMounted(true);
  }, []);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    skills: [],
    minCgpa: 0,
    branch: 'all',
    degree: 'all',
    gender: 'all',
  });
          {/* Advanced Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full max-w-7xl mx-auto">
            <input
              type="text"
              placeholder="Search by name or branch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[180px]"
            />
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="unplaced">Unplaced</option>
              <option value="interviewing">Interviewing</option>
            </select>
            <select
              value={filters.branch}
              onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="EEE">EEE</option>
            </select>
            <select
              value={filters.degree}
              onChange={e => setFilters(f => ({ ...f, degree: e.target.value }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Degrees</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
            </select>
            <select
              value={filters.gender}
              onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={filters.minCgpa}
              onChange={e => setFilters(f => ({ ...f, minCgpa: parseFloat(e.target.value) }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={0}>All CGPA</option>
              <option value={7.0}>CGPA ≥ 7.0</option>
              <option value={7.5}>CGPA ≥ 7.5</option>
              <option value={8.0}>CGPA ≥ 8.0</option>
              <option value={8.5}>CGPA ≥ 8.5</option>
              <option value={9.0}>CGPA ≥ 9.0</option>
            </select>
            {/* Skills Multi-select (simple version) */}
            <input
              type="text"
              placeholder="Filter by skill (comma separated)"
              value={filters.skills.join(', ')}
              onChange={e => setFilters(f => ({ ...f, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[180px]"
            />
            <button
              onClick={() => setFilters({ status: 'all', department: 'all', skills: [], minCgpa: 0, branch: 'all', degree: 'all', gender: 'all' })}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-all"
            >
              Reset Filters
            </button>
          </div>
    const [talentSort, setTalentSort] = useState('score-desc');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('hr_dashboard_theme') || 'system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const isDark = resolvedTheme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [showEmailModal, setShowEmailModal] = useState(false);
  // Interviews state
  const [interviews, setInterviews] = useState([]);
  
  // Schedule Placement Drive States
  const [showScheduleDriveModal, setShowScheduleDriveModal] = useState(false);
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    date: '',
    numberOfRoles: '',
    package: '',
    jobDescription: '',
    requiredSkills: '',
    notes: ''
  });
  const [driveError, setDriveError] = useState('');
  const [driveSubmitting, setDriveSubmitting] = useState(false);
  
  // Backend Data States
  const [students, setStudents] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobRequisitions, setJobRequisitions] = useState([]);
  const [placementStats, setPlacementStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [offers, setOffers] = useState([]);
  const [onboardingTasks, setOnboardingTasks] = useState([]);
  const [smartSearchTerm, setSmartSearchTerm] = useState('');
  const [smartStatusFilter, setSmartStatusFilter] = useState('all');
  const [selectedApplicantIds, setSelectedApplicantIds] = useState([]);
  const [aiHiringInsight, setAiHiringInsight] = useState('');
  const [aiHiringLoading, setAiHiringLoading] = useState(false);
  const [genAIStudioLoading, setGenAIStudioLoading] = useState(false);
  const [genAIStudioOutput, setGenAIStudioOutput] = useState({});
  const [genAIStudioInput, setGenAIStudioInput] = useState({
    roleTitle: 'Software Engineer',
    company: 'Campus Partner',
    tone: 'formal',
    channel: 'email',
    context: 'Interview reminder for shortlisted candidates',
    kbQuestion: 'What is the recommended process for students with one backlog?'
  });
  const [featureActivity, setFeatureActivity] = useState([]);
  const [pipelineStageMap, setPipelineStageMap] = useState({});
  const [draggedApplicationId, setDraggedApplicationId] = useState(null);
  const [savedReports, setSavedReports] = useState(() => {
    const stored = localStorage.getItem('hr_saved_reports_v1');
    return stored ? JSON.parse(stored) : [];
  });
  const [communicationLogs, setCommunicationLogs] = useState(() => {
    const stored = localStorage.getItem('hr_candidate_communication_v1');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedCommunicationCandidate, setSelectedCommunicationCandidate] = useState('');
  const [communicationType, setCommunicationType] = useState('email');
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [templateType, setTemplateType] = useState('job-description');
  const [templateBody, setTemplateBody] = useState('');
  const [duplicateJobTitle, setDuplicateJobTitle] = useState('');
  const [duplicateCompany, setDuplicateCompany] = useState('');
  const [collaborationHeartbeat, setCollaborationHeartbeat] = useState(new Date().toISOString());
  const [selectedJdJobId, setSelectedJdJobId] = useState('');
  const [jdEnhancement, setJdEnhancement] = useState('');
  const [jdEnhancing, setJdEnhancing] = useState(false);
  const [complianceChecklist, setComplianceChecklist] = useState({
    requisitionApproved: false,
    budgetApproved: false,
    policyAcknowledged: false,
    diversityCheckDone: false,
  });
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('hr_webhook_url_v1') || '');
  const [webhookSecret, setWebhookSecret] = useState(() => localStorage.getItem('hr_webhook_secret_v1') || '');
  const [webhookEvents, setWebhookEvents] = useState(() => {
    const defaults = {
      jobPosted: true,
      applicationStatusChanged: true,
      offerAccepted: true,
      interviewScheduled: false,
      requisitionApproved: false,
    };
    const stored = localStorage.getItem('hr_webhook_events_v1');
    if (!stored) return defaults;
    try {
      const parsed = JSON.parse(stored);
      return { ...defaults, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch (_error) {
      return defaults;
    }
  });
  const fetchAllDataRef = useRef(null);
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookLastStatus, setWebhookLastStatus] = useState(() => localStorage.getItem('hr_webhook_last_status_v1') || '');
  const [approvalComments, setApprovalComments] = useState({});
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [schedulerRoleFilter, setSchedulerRoleFilter] = useState('all');
  const [crmNotes, setCrmNotes] = useState({});
  const [reportSchedule, setReportSchedule] = useState(() => {
    const stored = localStorage.getItem('hr_report_schedule_v1');
    return stored ? JSON.parse(stored) : { frequency: 'weekly', nextRunAt: '' };
  });
  const [auditTrail, setAuditTrail] = useState(() => {
    const stored = localStorage.getItem('hr_audit_trail_v1');
    return stored ? JSON.parse(stored) : [];
  });
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    const stored = localStorage.getItem('hr_notification_preferences');
    if (stored) return JSON.parse(stored);
    return {
      email: true,
      inApp: true,
      slaAlerts: true,
      dailyDigest: false,
    };
  });
  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;

  // Approve/Reject handlers for requisitions
  const handleApproveRequisition = async (req) => {
    try {
      await jobRequisitionsAPI.approve(req._id || req.id);
      setJobRequisitions((prev) => prev.map(r => (r._id || r.id) === (req._id || req.id) ? { ...r, status: 'In Review' } : r));
      pushFeatureActivity('Approved requisition', req.title);
    } catch (error) {
      alert('Failed to approve requisition: ' + (error?.response?.data?.message || error.message));
    }
  };

  const handleRejectRequisition = async (req) => {
    try {
      await jobRequisitionsAPI.reject(req._id || req.id);
      setJobRequisitions((prev) => prev.map(r => (r._id || r.id) === (req._id || req.id) ? { ...r, status: 'Closed' } : r));
      pushFeatureActivity('Rejected requisition', req.title);
    } catch (error) {
      alert('Failed to reject requisition: ' + (error?.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    localStorage.setItem('hr_saved_reports_v1', JSON.stringify(savedReports));
  }, [savedReports]);

  useEffect(() => {
    localStorage.setItem('hr_candidate_communication_v1', JSON.stringify(communicationLogs));
  }, [communicationLogs]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCollaborationHeartbeat(new Date().toISOString());
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    localStorage.setItem('hr_notification_preferences', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  useEffect(() => {
    localStorage.setItem('hr_report_schedule_v1', JSON.stringify(reportSchedule));
  }, [reportSchedule]);

  useEffect(() => {
    localStorage.setItem('hr_audit_trail_v1', JSON.stringify(auditTrail.slice(0, 200)));
  }, [auditTrail]);

  useEffect(() => {
    localStorage.setItem('hr_webhook_url_v1', webhookUrl);
  }, [webhookUrl]);

  useEffect(() => {
    localStorage.setItem('hr_webhook_secret_v1', webhookSecret);
  }, [webhookSecret]);

  useEffect(() => {
    localStorage.setItem('hr_webhook_events_v1', JSON.stringify(webhookEvents));
  }, [webhookEvents]);

  useEffect(() => {
    localStorage.setItem('hr_webhook_last_status_v1', webhookLastStatus);
  }, [webhookLastStatus]);

  const pushFeatureActivity = (action, detail) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      detail,
      time: new Date().toISOString(),
    };
    setFeatureActivity((prev) => [entry, ...prev].slice(0, 20));
  };

  const getStudentForApplication = (application) => {
    const studentObj = application?.student || application?.studentId;
    const studentId = typeof studentObj === 'object' ? (studentObj?._id || studentObj?.id) : studentObj;
    if (typeof studentObj === 'object' && studentObj) return studentObj;
    return students.find((student) => student._id === studentId || student.id === studentId) || null;
  };

  const getJobForApplication = (application) => {
    const jobObj = application?.jobId;
    const jobId = typeof jobObj === 'object' ? (jobObj?._id || jobObj?.id) : jobObj;
    if (typeof jobObj === 'object' && jobObj) return jobObj;
    return jobs.find((job) => job._id === jobId || job.id === jobId) || null;
  };

  const calculateProfileCompleteness = (student) => {
    const requiredFields = ['name', 'email', 'phone', 'degree', 'branch', 'cgpa'];
    const score = requiredFields.reduce((accumulator, field) => {
      const value = student?.[field];
      return accumulator + (value !== undefined && value !== null && String(value).trim() !== '' ? 1 : 0);
    }, 0);
    return Math.round((score / requiredFields.length) * 100);
  };

  const buildAiMatchRows = () => {
    return applications.map((application) => {
      const student = getStudentForApplication(application);
      const job = getJobForApplication(application);
      const candidateName = student?.name || application?.studentName || 'Unknown Candidate';
      const candidateSkills = Array.isArray(student?.skills)
        ? student.skills.map((skill) => String(skill).toLowerCase())
        : [];
      const jobSkills = Array.isArray(job?.requiredSkills)
        ? job.requiredSkills.map((skill) => String(skill).toLowerCase())
        : String(job?.description || '')
            .toLowerCase()
            .split(',')
            .map((token) => token.trim())
            .filter(Boolean);
      const matchedSkills = jobSkills.filter((skill) => candidateSkills.some((candidateSkill) => candidateSkill.includes(skill) || skill.includes(candidateSkill)));
      const skillScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 55;
      const profileScore = student ? calculateProfileCompleteness(student) : 40;
      const score = Math.max(35, Math.min(98, Math.round(skillScore * 0.7 + profileScore * 0.3)));
      const explainability = `Skills match ${matchedSkills.length}/${jobSkills.length || 1}, profile ${profileScore}%`;

      return {
        application,
        student,
        job,
        candidateName,
        jobTitle: job?.title || application?.jobTitle || 'Untitled Role',
        status: String(application?.status || 'applied').toLowerCase(),
        score,
        profileScore,
        matchedSkills,
        explainability,
      };
    }).sort((a, b) => b.score - a.score);
  };

  const getStudentUserId = (student) => String(student?.user?._id || student?.user?.id || student?._id || student?.id || '').trim();
  const getStudentDisplayName = (student) => student?.user?.name || student?.name || 'Unknown Student';
  const getStudentEmail = (student) => String(student?.user?.email || student?.email || '').trim();

  const buildOfferCandidates = () => {
    const candidateMap = new Map();
    
    console.log('buildOfferCandidates called with applications count:', applications.length);
    if (applications.length > 0) {
      console.log('First application:', applications[0]);
    }

    const addCandidateFromApplication = (application) => {
      // Filter only applications with status "selected"
      const appStatus = String(application?.status || '').toLowerCase();
      if (appStatus !== 'selected') {
        return;
      }

      // Use application's populated student data directly
      const appStudent = application?.student;
      if (!appStudent) {
        console.log('No student in application:', application);
        return;
      }

      // Extract from nested structure (student.user) or flat (student)
      const userId = String(appStudent?.user?._id || appStudent?.user?.id || appStudent?._id || appStudent?.id || '').trim();
      
      // Try multiple email paths
      let email = '';
      if (appStudent?.user?.email) {
        email = String(appStudent.user.email).trim().toLowerCase();
      } else if (appStudent?.email) {
        email = String(appStudent.email).trim().toLowerCase();
      }
      
      const name = appStudent?.user?.name || appStudent?.name || 'Unknown';
      const rollNumber = String(appStudent?.rollNumber || '').trim();
      
      console.log(`Processing application - Email: "${email}", Name: "${name}", UserId: "${userId}", StudentObj:`, appStudent);
      
      // Skip if no email found
      if (!email) {
        console.log('⚠️ No email found for application:', application);
        return;
      }

      const uniqueKey = email;
      const applicationSummary = {
        jobTitle: application?.job?.title || application?.jobTitle || 'Applied Job',
        companyName: application?.job?.company || application?.company || '',
        status: String(application?.status || 'applied').toLowerCase(),
        appliedAt: application?.createdAt || '',
      };

      // If this candidate already exists, just add the application
      const existingCandidate = candidateMap.get(uniqueKey);
      if (existingCandidate) {
        existingCandidate.applications.push(applicationSummary);
        return;
      }

      // Create new candidate entry
      candidateMap.set(uniqueKey, {
        key: uniqueKey,
        source: 'application',
        student: appStudent,
        userId,
        name,
        email,
        rollNumber,
        branch: appStudent?.branch || '',
        degree: appStudent?.degree || '',
        cgpa: appStudent?.cgpa ?? '',
        phone: appStudent?.phoneNumber || appStudent?.phone || appStudent?.user?.phone || '',
        backlogs: appStudent?.backlogs ?? '',
        placementStatus: appStudent?.placementStatus || '',
        skills: Array.isArray(appStudent?.skills) ? appStudent.skills : [],
        applications: [applicationSummary],
      });
    };

    // Only process applications, ignore trying to find students separately
    applications.forEach((application) => addCandidateFromApplication(application));

    const result = Array.from(candidateMap.values()).sort((a, b) => a.email.localeCompare(b.email));
    console.log('✅ buildOfferCandidates result:', result);
    console.log(`📊 Total candidates found: ${result.length}`);
    return result;
  };

  const offerCandidates = useMemo(() => buildOfferCandidates(), [applications]);

  const fetchNotifications = async () => {
    if (!token || !canAccessHRDashboard) return;
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const response = await notificationsAPI.getAllNotificationsForHR(100, false);
      const notifData = response?.data?.notifications;
      
      if (Array.isArray(notifData)) {
        setNotifications(notifData);
      } else {
        console.warn('Unexpected notification response format:', response?.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error?.response?.status, error?.response?.data || error.message);
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      
      // Don't show error, just empty list so UI doesn't break
      setNotifications([]);
      if (error?.response?.status !== 404) {
        setNotificationsError('');
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if ((!user?._id && !user?.id) || !token || !canAccessHRDashboard) return;
    fetchNotifications();
  }, [user?._id, user?.id, token, canAccessHRDashboard]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const handleNotificationClick = async (notificationId, alreadyRead) => {
    if (!notificationId || alreadyRead) return;
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) => prev.map((notification) => (
        notification._id === notificationId ? { ...notification, read: true } : notification
      )));
    } catch {
      // ignore mark-as-read error to keep UI responsive
    }
  };

  useEffect(() => {
    if (dataLoading) {
      setAnalyticsLoading(true);
      return;
    }

    const hrStats = dashboardStats?.data || dashboardStats || {};

    const applicationStatusCount = applications.reduce((accumulator, application) => {
      const status = String(application?.status || 'applied').toLowerCase();
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {});

    const branchCount = students.reduce((accumulator, student) => {
      const branch = student?.branch || 'Unknown';
      accumulator[branch] = (accumulator[branch] || 0) + 1;
      return accumulator;
    }, {});

    const activeJobs = jobs.filter((job) => String(job?.status || '').toLowerCase() === 'active').length;
    const interviewsScheduled = interviews.filter((interview) => ['scheduled', 'upcoming', 'live'].includes(String(interview?.status || '').toLowerCase())).length;
    const offersExtended = placements.filter((placement) => ['offered', 'accepted'].includes(String(placement?.status || '').toLowerCase())).length;
    const acceptedOffers = placements.filter((placement) => String(placement?.status || '').toLowerCase() === 'accepted').length;
    const acceptanceRate = offersExtended > 0 ? Math.round((acceptedOffers / offersExtended) * 100) : Number(hrStats?.acceptanceRate || 0);

    const monthlyBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString('default', { month: 'short' }),
        count: 0
      };
    });

    applications.forEach((application) => {
      const createdDate = new Date(application?.createdAt || application?.updatedAt || Date.now());
      const key = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      const bucket = monthlyBuckets.find((item) => item.key === key);
      if (bucket) bucket.count += 1;
    });

    setAnalytics({
      activeJobPostings: Number(hrStats?.activeJobPostings ?? activeJobs),
      applicationsReceived: Number(hrStats?.applicationsReceived ?? applications.length),
      interviewsScheduled: Number(hrStats?.interviewsScheduled ?? interviewsScheduled),
      offersExtended: Number(hrStats?.offersExtended ?? offersExtended),
      acceptanceRate: Number(hrStats?.acceptanceRate ?? acceptanceRate),
      talentPoolSize: Number(hrStats?.talentPoolSize ?? students.length),
      pendingApprovals: Number(hrStats?.pendingApprovals ?? Math.max(offersExtended - acceptedOffers, 0)),
      applicationStatus: {
        labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'],
        data: [
          applicationStatusCount.applied || 0,
          applicationStatusCount.shortlisted || 0,
          applicationStatusCount.selected || 0,
          applicationStatusCount.rejected || 0,
          applicationStatusCount.withdrawn || 0
        ]
      },
      branchDistribution: {
        labels: Object.keys(branchCount).slice(0, 6),
        data: Object.values(branchCount).slice(0, 6)
      },
      monthlyHiringTrend: {
        labels: monthlyBuckets.map((bucket) => bucket.label),
        data: monthlyBuckets.map((bucket) => bucket.count)
      }
    });

    setAnalyticsLoading(false);
  }, [dataLoading, dashboardStats, jobs, applications, interviews, placements, students]);

  // Auto-refresh analytics when data is updated
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        // Refetch all data when refresh event is triggered
        if (token && canAccessHRDashboard) {
          const [jobsRes, appsRes, interviewsRes, placementsRes] = await Promise.allSettled([
            jobAPI.getAll().catch(() => ({ data: { jobs: [] } })),
            applicationsAPI.getAll().catch(() => ({ data: { applications: [] } })),
            interviewAPI.getAll ? interviewAPI.getAll().catch(() => ({ data: { interviews: [] } })) : Promise.resolve({ data: { interviews: [] } }),
            placementsAPI.getAll().catch(() => ({ data: { placements: [] } }))
          ]);
          
          if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.jobs || []);
          if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.applications || []);
          if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value.data.interviews || []);
          if (placementsRes.status === 'fulfilled') setPlacements(placementsRes.value.data.placements || []);
        }
      } catch (err) {
        console.error('Error refreshing analytics data:', err);
      }
    };

    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(handleRefresh, 30000);

    // Listen for refresh events from broadcast channel
    let refreshChannel = null;
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      refreshChannel = new window.BroadcastChannel('hr-dashboard-refresh');
      refreshChannel.onmessage = () => handleRefresh();
    }

    // Also listen for custom events
    const handleCustomRefresh = () => handleRefresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('hr:refresh', handleCustomRefresh);
    }

    return () => {
      clearInterval(refreshInterval);
      if (refreshChannel) refreshChannel.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('hr:refresh', handleCustomRefresh);
      }
    };
  }, [token, canAccessHRDashboard]);



  // Fetch placements from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchPlacements() {
      try {
        const res = await placementsAPI.getAll();
        setPlacements(res.data.placements || []);
      } catch (err) {
        setPlacements([]);
      }
    }
    fetchPlacements();
  }, [token, canAccessHRDashboard]);

  // Fetch job requisitions from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchJobRequisitions() {
      try {
        const res = await jobRequisitionsAPI.getAll();
        setJobRequisitions(res.data.jobRequisitions || []);
      } catch (err) {
        setJobRequisitions([]);
      }
    }
    fetchJobRequisitions();
  }, [token, canAccessHRDashboard]);


  // Fetch offers from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchOffers() {
      try {
        if (placementsAPI.getOffers) {
          const res = await placementsAPI.getOffers();
          setOffers(res.data.offers || []);
        } else {
          setOffers([]);
        }
      } catch (err) {
        setOffers([]);
      }
    }
    fetchOffers();
  }, [token, canAccessHRDashboard]);

  // Fetch onboarding tasks from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchOnboardingTasks() {
      try {
        if (onboardingAPI.getAll) {
          const res = await onboardingAPI.getAll();
          setOnboardingTasks(res.data.onboarding || res.data.onboardingTasks || []);
        } else {
          setOnboardingTasks([]);
        }
      } catch (err) {
        setOnboardingTasks([]);
      }
    }
    fetchOnboardingTasks();
  }, [token, canAccessHRDashboard]);

  // Fetch jobs from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchJobs() {
      try {
        const res = await jobAPI.getAll();
        setJobs(res.data.jobs || []);
      } catch (err) {
        setJobs([]);
      }
    }
    fetchJobs();
  }, [token, canAccessHRDashboard]);

  // Fetch applications from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchApplications() {
      try {
        const res = await applicationsAPI.getAll();
        console.log('Fetched applications from backend:', res.data);
        const appList = res.data.applications || [];
        console.log('Applications count:', appList.length);
        if (appList.length > 0) {
          console.log('First application structure:', appList[0]);
        }
        setApplications(appList);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    }
    fetchApplications();
  }, [token, canAccessHRDashboard]);

  // Fetch interviews from backend
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    async function fetchInterviews() {
      try {
        const res = await placementsAPI.getInterviews();
        setInterviews(res.data.interviews || []);
      } catch (err) {
        setInterviews([]);
      }
    }
    fetchInterviews();
  }, [token, canAccessHRDashboard]);

  // Fetch analytics from backend (already present, but ensure fallback is only used if backend fails)

  // Profile Edit Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  // Utility to get avatar URL (already defined above)

  // Patch: Render avatar in profile modal using getAvatarUrl
  const renderProfileAvatar = () => {
    return (
      <img
        src={profileForm.avatar ? getAvatarUrl(profileForm.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
        alt={profileForm.name || 'Avatar'}
        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/20"
      />
    );
  };
  const [profileError, setProfileError] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch user profile from backend on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        // Replace with your actual API call for user profile
        const res = await statsAPI.getProfile();
        if (res.data && res.data.user) {
          setUser(res.data.user);
          setProfileForm({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
            avatar: res.data.user.avatar || ''
          });
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileForm({
        name: '',
        phone: '',
        avatar: ''
      });
      // Show a warning if user is missing
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          alert('Session expired or not logged in. Please login again.');
          navigate('/login');
        }, 500);
      }
      return;
    }
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
  }, [user, navigate]);

  // Job Requisition Modal States
  const [showJobRequisitionModal, setShowJobRequisitionModal] = useState(false);
  const [editingJobRequisitionId, setEditingJobRequisitionId] = useState(null);
  const [jobRequisition, setJobRequisition] = useState({
    title: '',
    department: '',
    description: '',
    numberOfPositions: 1,
    location: '',
    employmentType: 'Full-time',
    requiredSkills: '',
    experience: {},
    education: 'Bachelor',
    reportingManager: '',
    priority: 'Medium'
  });
  const [jobRequisitionError, setJobRequisitionError] = useState('');
  const [jobRequisitionSubmitting, setJobRequisitionSubmitting] = useState(false);
  
  // Requisition Applications MODAL States
  const [showRequisitionAppsModal, setShowRequisitionAppsModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionApplications, setRequisitionApplications] = useState([]);
  const [applicationFilters, setApplicationFilters] = useState({
    status: 'all',
    branch: 'all',
    minCGPA: 0,
    searchTerm: ''
  });

  // Applications MODAL States
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    studentUserId: '',
    candidateEmail: '',
    companyName: '',
    roleTitle: '',
    location: '',
    ctc: '',
    bond: '',
    offerType: 'full-time',
    status: 'offered',
    resultDate: '',
    joiningDate: '',
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    notes: '',
    placementType: 'on-campus',
  });
  const [offerError, setOfferError] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const [showOnboardingModal, setShowOnboardingModal] = useState(false); // For create modal only
  const [showEditOnboardingModal, setShowEditOnboardingModal] = useState(false);
  const [showViewOnboardingModal, setShowViewOnboardingModal] = useState(false);
  const [editingOnboardingId, setEditingOnboardingId] = useState(null);
  const [onboardingForm, setOnboardingForm] = useState({
    employeeName: '',
    email: '',
    position: '',
    department: '',
    joinDate: '',
    buddy: '',
    progress: 0,
    tasksText: ''
  });
  const [onboardingError, setOnboardingError] = useState('');
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  // Resume Analysis & ATS States
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState(null);

  // Student Details Modal for Talent Pool
  const renderStudentDetailsModal = () => selectedStudentForAnalysis && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full border border-blue-900/40 shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold"
          onClick={() => setSelectedStudentForAnalysis(null)}
        >
          &times;
        </button>
        <div className="flex items-center gap-5 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 border-2 border-blue-300 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-black text-white">{(selectedStudentForAnalysis.name || 'S').charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-1">{selectedStudentForAnalysis.name || 'Student'}</h3>
            <p className="text-slate-400 text-base font-semibold mb-1">{selectedStudentForAnalysis.degree || 'N/A'} - {selectedStudentForAnalysis.branch || 'N/A'}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {selectedStudentForAnalysis.age || 'N/A'} yrs • {selectedStudentForAnalysis.gender || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedStudentForAnalysis.skills && selectedStudentForAnalysis.skills.length > 0 && selectedStudentForAnalysis.skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-200 rounded-lg text-xs font-semibold border border-blue-700">
                {skill}
              </span>
            ))}
          </div>
          <span className="inline-block text-xs text-slate-400 font-medium">Status: <span className="font-bold text-blue-400">{selectedStudentForAnalysis.status}</span></span>
        </div>
        <div className="mb-2 text-slate-300 text-sm">
          <div><span className="font-bold">Location:</span> {selectedStudentForAnalysis.location || 'N/A'}</div>
          <div><span className="font-bold">Last Contact:</span> {selectedStudentForAnalysis.lastContact || 'N/A'}</div>
          <div><span className="font-bold">Source:</span> {selectedStudentForAnalysis.source || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Resume parsing handler for a student
  const handleParseResume = async (student) => {
    setSelectedStudentForAnalysis(student);
    setShowResumeModal(true);
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const res = await resumeAnalysisAPI.analyze({ studentId: student._id || student.id, resume: student.resume });
      setAnalysisResult(res.data);
    } catch (err) {
      setAnalysisResult({ error: 'Failed to analyze resume.' });
    }
    setAnalysisLoading(false);
  };
  const [showJobPostModal, setShowJobPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    position: '',
    description: '',
    salary: '',
    location: '',
    department: '',
    jobType: 'Full-time',
    skills: '',
    urgency: 'Medium',
  });
  const [jobPostError, setJobPostError] = useState('');
  const [jobPostSuccess, setJobPostSuccess] = useState('');
  const [jobPostLoading, setJobPostLoading] = useState(false);

  // Robust job posting handler
  const postNewJob = async (e) => {
    if (e) e.preventDefault();
    setJobPostError('');
    setJobPostSuccess('');
    // Validation
    if (!newJob.title.trim() || !newJob.company.trim() || !newJob.position.trim() || !newJob.location.trim()) {
      setJobPostError('Please fill all required fields (Title, Company, Position, Location).');
      return;
    }
    setJobPostLoading(true);
    try {
      // Prepare job data (format skills as array)
      const jobData = {
        ...newJob,
        skills: newJob.skills
          ? newJob.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      // Call backend API
      const res = await import('../../services/api').then(m => m.jobAPI.create(jobData));
      setJobPostSuccess('Job posted successfully!');
      // Optionally update jobs list in UI
      if (typeof setJobs === 'function') setJobs(prev => [res.data, ...(prev || [])]);
      // Reset form
      setNewJob({
        title: '',
        company: '',
        position: '',
        description: '',
        salary: '',
        location: '',
        department: '',
        jobType: 'Full-time',
        skills: '',
        urgency: 'Medium',
      });
      setTimeout(() => {
        setShowJobPostModal(false);
        setJobPostSuccess('');
      }, 1200);
    } catch (err) {
      setJobPostError(err?.response?.data?.message || 'Failed to post job.');
    }
    setJobPostLoading(false);
  };

  // ===== DATA FETCHING FROM BACKEND =====
  useEffect(() => {
    // Always sync from localStorage before redirecting
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const effectiveUser = storedUser ? JSON.parse(storedUser) : user;
    const effectiveToken = storedToken || token;
    const effectiveRole = String(effectiveUser?.role || '').toLowerCase();
    const effectiveCanAccess = ['hr', 'admin', 'staff', 'recruiter'].includes(effectiveRole);
    // Only redirect if both are truly missing
    if ((!effectiveUser || !effectiveToken) && window.location.pathname !== '/login') {
      setTimeout(() => {
        alert('Session expired or not logged in. Please login again.');
        logout();
        navigate('/login');
      }, 500);
      return;
    }
    if (!effectiveCanAccess) {
      navigate('/login');
      return;
    }
    if (user !== effectiveUser && effectiveUser) setUser(effectiveUser);
    if (token !== effectiveToken && effectiveToken) setToken(effectiveToken);
    fetchAllData();
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh the full dashboard every 10 seconds so stats reflect the latest jobs and applications
  useEffect(() => {
    if (!token || !canAccessHRDashboard) return;
    const dashboardRefreshInterval = setInterval(async () => {
      try {
        await fetchAllData();
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          clearInterval(dashboardRefreshInterval);
        }
      }
    }, 10000);

    return () => clearInterval(dashboardRefreshInterval);
  }, [token, canAccessHRDashboard]);

  // Listen to global `hr:refresh` events and refresh dashboard data.
  // Debounce to avoid duplicate immediate refreshes when multiple mutations complete.
  const refreshDebounceRef = useRef(null);
  useEffect(() => {
    if (!canAccessHRDashboard) return;
    const handler = () => {
      try {
        if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
        refreshDebounceRef.current = setTimeout(() => {
          if (typeof fetchAllDataRef.current === 'function') fetchAllDataRef.current();
        }, 300);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('hr:refresh', handler);
    return () => {
      window.removeEventListener('hr:refresh', handler);
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    };
  }, [canAccessHRDashboard]);

  useEffect(() => {
    if (!canAccessHRDashboard || typeof window === 'undefined' || typeof window.BroadcastChannel !== 'function') return;

    const refreshChannel = new window.BroadcastChannel('hr-dashboard-refresh');
    const handleMessage = (event) => {
      if (event.data?.type !== 'hr:refresh') return;
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
      refreshDebounceRef.current = setTimeout(() => {
        if (typeof fetchAllDataRef.current === 'function') fetchAllDataRef.current();
      }, 300);
    };

    refreshChannel.addEventListener('message', handleMessage);
    return () => {
      refreshChannel.removeEventListener('message', handleMessage);
      refreshChannel.close();
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    };
  }, [canAccessHRDashboard]);

  // Handle Schedule Drive Save
  const handleScheduleDrive = async () => {
    try {
      setDriveSubmitting(true);
      setDriveError('');

      if (!driveForm.companyName || !driveForm.date || !driveForm.numberOfRoles || !driveForm.package) {
        setDriveError('Please fill in all required fields');
        setDriveSubmitting(false);
        return;
      }

      // Prepare salary as object (min/max same if only one value)
      let salaryObj = {};
      const pkg = Number(driveForm.package);
      if (!isNaN(pkg)) {
        salaryObj = { min: pkg, max: pkg };
      }

      // Prepare skills as array
      let skillsArr = [];
      if (driveForm.requiredSkills) {
        skillsArr = driveForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Create placement drive record using jobAPI
      const response = await jobAPI.createJob({
        company: driveForm.companyName,
        position: `${driveForm.companyName} Placement Drive`,
        description: driveForm.jobDescription || `Placement drive for ${driveForm.companyName}`,
        salary: salaryObj,
        location: 'On Campus',
        skills: skillsArr,
        jobType: 'Full-time',
        applicationDeadline: driveForm.date,
        status: 'active',
        // eligibility, allowedBranches, minCGPA can be added if needed
      });

      if (response.data.success || response.status === 201) {
        alert('Placement drive scheduled successfully!');
        setShowScheduleDriveModal(false);
        setDriveForm({
          companyName: '',
          date: '',
          numberOfRoles: '',
          package: '',
          jobDescription: '',
          requiredSkills: '',
          notes: ''
        });
        // Refresh jobs data
        if (fetchAllData) {
          fetchAllData();
        }
      } else {
        setDriveError('Failed to schedule placement drive. Please try again.');
      }
    } catch (error) {
      setDriveError(error.response?.data?.message || 'Failed to schedule placement drive. Please try again.');
    } finally {
      setDriveSubmitting(false);
    }
  };

  const formatDateSafe = (value) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString('en-IN');
  };

  const formatMonthSafe = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('default', { month: 'short' });
  };

  const formatWeekdaySafe = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('default', { weekday: 'short' });
  };

  const calcExpiryDays = (resultDate) => {
    if (!resultDate) return 0;
    const date = new Date(resultDate);
    if (Number.isNaN(date.getTime())) return 0;
    const diffMs = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const mapPlacementsToOffers = (items) => {
    return items.map((placement) => {
      const status = placement.status || 'offered';
      const progress = ['accepted', 'rejected'].includes(status) ? 100 : status === 'offered' ? 60 : 30;
      return {
        id: placement._id,
        candidateName: placement.studentUser?.name || 'Candidate',
        position: placement.roleTitle || 'Role',
        salary: placement.ctc || 'N/A',
        equity: placement.offerType || 'full-time',
        bonus: placement.bond || 'N/A',
        status: status.charAt(0).toUpperCase() + status.slice(1),
        expiryDays: calcExpiryDays(placement.resultDate),
        progress,
        approver: placement.recruiterName || 'HR',
        documents: []
      };
    });
  };

  const handleJoinInterview = (interview) => {
    // Prevent redirect to login if not authenticated
    if (!user || !token) {
      alert('You must be logged in as HR to join the interview.');
      return;
    }
    if (interview?.roomId) {
      navigate(`/interview-room/${interview.roomId}`);
    } else {
      alert('No interview room available.');
    }
  };

  const handleOfferSubmit = async () => {


    setOfferError('');
    const selectedEmail = String(offerForm.candidateEmail || '').trim().toLowerCase();
    const selectedCandidate = offerCandidates.find((candidate) => String(candidate.email || '').trim().toLowerCase() === selectedEmail);
    const resolvedStudentUserId = String(selectedCandidate?.userId || '').trim();

    if (!selectedCandidate || !resolvedStudentUserId || !offerForm.companyName || !offerForm.roleTitle) {
      setOfferError('Select an applicant email, company name, and role title.');
      return;
    }

    setOfferSubmitting(true);
    try {
      const { candidateEmail, ...offerPayload } = offerForm;
      const payload = {
        ...offerPayload,
        studentUserId: resolvedStudentUserId,
        resultDate: offerForm.resultDate || undefined,
        joiningDate: offerForm.joiningDate || undefined,
        placementType: offerForm.placementType || 'on-campus',
      };
      await placementsAPI.create(payload);
      setShowOfferModal(false);
      setOfferForm({
        studentUserId: '',
        candidateEmail: '',
        companyName: '',
        roleTitle: '',
        location: '',
        ctc: '',
        bond: '',
        offerType: 'full-time',
        status: 'offered',
        resultDate: '',
        joiningDate: '',
        recruiterName: '',
        recruiterEmail: '',
        recruiterPhone: '',
        notes: '',
        placementType: 'on-campus',
      });
                    <div>
                      <label className="block text-sm font-bold text-blue-700 dark:text-yellow-300 drop-shadow-lg mb-1">Placement Type</label>
                      <select
                        value={offerForm.placementType}
                        onChange={(e) => setOfferForm((prev) => ({ ...prev, placementType: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-slate-800 border border-blue-700/40 text-blue-900 dark:text-yellow-200 font-bold drop-shadow-lg"
                      >
                        <option value="on-campus">On-Campus</option>
                        <option value="off-campus">Off-Campus (Self-Placed)</option>
                      </select>
                    </div>
      fetchAllData();
    } catch (error) {
      setOfferError(error.response?.data?.message || error.message || 'Failed to create offer');
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    setOnboardingError('');
    if (!onboardingForm.employeeName || !onboardingForm.position) {
      setOnboardingError('Employee name and position are required.');
      return;
    }
    setOnboardingSubmitting(true);
    try {
      const tasks = onboardingForm.tasksText
        .split('\n')
        .map((task) => task.trim())
        .filter(Boolean)
        .map((name) => ({ name, status: 'pending' }));

      const payload = {
        employeeName: onboardingForm.employeeName,
        email: onboardingForm.email,
        position: onboardingForm.position,
        department: onboardingForm.department,
        joinDate: onboardingForm.joinDate || undefined,
        buddy: onboardingForm.buddy,
        tasks,
        progress: Number(onboardingForm.progress) || 0
      };

      if (editingOnboardingId) {
        await onboardingAPI.update(editingOnboardingId, payload);
      } else {
        await onboardingAPI.create(payload);
      }

      setShowOnboardingModal(false);
      setShowEditOnboardingModal(false);
      setEditingOnboardingId(null);
      setOnboardingForm({
        employeeName: '',
        email: '',
        position: '',
        department: '',
        joinDate: '',
        buddy: '',
        progress: 0,
        tasksText: ''
      });
      fetchAllData();
    } catch (error) {
      setOnboardingError(error.response?.data?.message || error.message || `Failed to ${editingOnboardingId ? 'update' : 'create'} onboarding`);
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const openCreateOnboardingModal = () => {
    setEditingOnboardingId(null);
    setOnboardingError('');
    setOnboardingForm({
      employeeName: '',
      email: '',
      position: '',
      department: '',
      joinDate: '',
      buddy: '',
      progress: 0,
      tasksText: ''
    });
    setShowEditOnboardingModal(false);
    setShowOnboardingModal(true);
  };

  const openEditOnboardingModal = (onboardingItem) => {
    setEditingOnboardingId(onboardingItem._id || onboardingItem.id);
    setOnboardingError('');
    setOnboardingForm({
      employeeName: onboardingItem.employeeName || '',
      email: onboardingItem.email || '',
      position: onboardingItem.position || '',
      department: onboardingItem.department || '',
      joinDate: onboardingItem.joinDate ? new Date(onboardingItem.joinDate).toISOString().split('T')[0] : '',
      buddy: onboardingItem.buddy || '',
      progress: Number(onboardingItem.progress) || 0,
      tasksText: Array.isArray(onboardingItem.tasks)
        ? onboardingItem.tasks.map((task) => task.name).filter(Boolean).join('\n')
        : ''
    });
    setShowOnboardingModal(false);
    setShowEditOnboardingModal(true);
  };

  // Profile Edit Handler
  const handleProfileSubmit = async () => {
    setProfileError('');
    if (!profileForm.name) {
      setProfileError('Name is required');
      return;
    }
    setProfileSubmitting(true);
    try {
      const response = await statsAPI.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar: profileForm.avatar
      });
      if (response.data.success) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            name: profileForm.name,
            phone: profileForm.phone,
            avatar: profileForm.avatar
          }));
        }
        setShowProfileModal(false);
        alert('Profile updated successfully!');
        fetchAllData();
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Job Requisition Handler
  // Open edit modal for job requisition
  const openEditJobRequisitionModal = (req) => {
    setEditingJobRequisitionId(req._id);
    setJobRequisition({
      title: req.title || '',
      department: req.department || '',
      description: req.description || '',
      numberOfPositions: req.numberOfPositions || 1,
      location: req.location || '',
      employmentType: req.employmentType || 'Full-time',
      requiredSkills: Array.isArray(req.requiredSkills) ? req.requiredSkills.join(', ') : '',
      experience: req.experience || {},
      education: req.education || 'Bachelor',
      reportingManager: req.reportingManager || '',
      priority: req.priority || 'Medium'
    });
    setJobRequisitionError('');
    setShowJobRequisitionModal(true);
  };

  // Close job requisition modal and reset
  const closeJobRequisitionModal = () => {
    setShowJobRequisitionModal(false);
    setEditingJobRequisitionId(null);
    setJobRequisition({
      title: '',
      department: '',
      description: '',
      numberOfPositions: 1,
      location: '',
      employmentType: 'Full-time',
      requiredSkills: '',
      experience: {},
      education: 'Bachelor',
      reportingManager: '',
      priority: 'Medium'
    });
    setJobRequisitionError('');
  };

  // View applications for a specific requisition
  const viewRequisitionApplications = (req) => {
    setSelectedRequisition(req);
    // Filter applications for this requisition by matching job ID (more reliable)
    const requisitionApps = applications.filter(app => 
      app.job?._id === req._id
    );
    setRequisitionApplications(requisitionApps);
    setApplicationFilters({ status: 'all', branch: 'all', minCGPA: 0, searchTerm: '' });
    setShowRequisitionAppsModal(true);
  };

  useEffect(() => {
    if (!showRequisitionAppsModal || !selectedRequisition) return;
    const requisitionApps = applications.filter((app) => app.job?._id === selectedRequisition._id);
    setRequisitionApplications(requisitionApps);
  }, [applications, selectedRequisition, showRequisitionAppsModal]);

  // View detailed application
  const viewApplicationDetail = (app) => {
    setSelectedApplicationDetail(app);
    setShowApplicationDetailModal(true);
  };

  // Download individual application as PDF
  const downloadApplicationPDF = (app) => {
    const doc = new jsPDF();
    
    // Header with company branding
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Job Application', 105, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('GenAI Placement System', 105, 38, { align: 'center' });
    
    let yPos = 65;
    doc.setTextColor(0, 0, 0);
    
    // Applicant Information Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Applicant Information', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    // Candidate Name
    doc.setFont(undefined, 'bold');
    doc.text('Name:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(app.student?.name || app.studentName || 'N/A', 60, yPos);
    yPos += 8;
    
    // Email
    doc.setFont(undefined, 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(app.student?.email || app.studentEmail || 'N/A', 60, yPos);
    yPos += 8;
    
    // Phone
    if (app.student?.phone) {
      doc.setFont(undefined, 'bold');
      doc.text('Phone:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.student.phone, 60, yPos);
      yPos += 8;
    }
    
    // Application Date
    doc.setFont(undefined, 'bold');
    doc.text('Applied On:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(app.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 60, yPos);
    yPos += 8;
    
    // Status
    doc.setFont(undefined, 'bold');
    doc.text('Status:', 20, yPos);
    doc.setFont(undefined, 'normal');
    const statusText = (app.status || 'pending').toUpperCase();
    const statusColor = app.status === 'accepted' ? [16, 185, 129] : 
                        app.status === 'rejected' ? [239, 68, 68] : 
                        app.status === 'interview' ? [59, 130, 246] : [245, 158, 11];
    doc.setTextColor(...statusColor);
    doc.text(statusText, 60, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Academic Information Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Academic Information', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    if (app.student?.branch) {
      doc.setFont(undefined, 'bold');
      doc.text('Branch:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.student.branch, 60, yPos);
      yPos += 8;
    }
    
    if (app.student?.cgpa) {
      doc.setFont(undefined, 'bold');
      doc.text('CGPA:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.student.cgpa.toString(), 60, yPos);
      yPos += 8;
    }
    
    if (app.student?.backlogs !== undefined) {
      doc.setFont(undefined, 'bold');
      doc.text('Backlogs:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.student.backlogs.toString(), 60, yPos);
      yPos += 8;
    }
    
    if (app.student?.attendance) {
      doc.setFont(undefined, 'bold');
      doc.text('Attendance:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.student.attendance + '%', 60, yPos);
      yPos += 8;
    }
    
    yPos += 7;
    
    // Skills Section
    if (app.student?.skills?.length > 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, 'F');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Skills', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      const skillsText = app.student.skills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillsLines, 20, yPos);
      yPos += (skillsLines.length * 7) + 10;
    }
    
    // Position Information
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Position Details', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    doc.setFont(undefined, 'bold');
    doc.text('Position:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(app.job?.title || app.job?.position || 'N/A', 60, yPos);
    yPos += 8;
    
    if (app.job?.company) {
      doc.setFont(undefined, 'bold');
      doc.text('Company:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(app.job.company, 60, yPos);
      yPos += 8;
    }
    
    yPos += 7;
    
    // Cover Letter Section
    if (app.coverLetter) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, 'F');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Cover Letter', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      const coverLetterLines = doc.splitTextToSize(app.coverLetter, 170);
      doc.text(coverLetterLines, 20, yPos);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const studentName = (app.student?.name || app.studentName || 'applicant').replace(/\s+/g, '_');
    const jobTitle = (app.job?.title || app.job?.position || 'position').replace(/\s+/g, '_');
    doc.save(`application_${studentName}_${jobTitle}_${Date.now()}.pdf`);
  };

  // Download all applications as PDF
  const downloadAllApplicationsPDF = () => {
    const doc = new jsPDF();
    const filteredApps = getFilteredApplications();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text('Applications Report', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(selectedRequisition?.title || 'Job Position', 105, 32, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Total Applications: ${filteredApps.length}`, 105, 40, { align: 'center' });
    
    let yPos = 60;
    doc.setTextColor(0, 0, 0);
    
    filteredApps.forEach((app, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Application card
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos - 5, 180, 45, 'S');
      
      // Name and status
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${app.student?.name || app.studentName || 'N/A'}`, 20, yPos);
      
      // Status badge
      const status = app.status || 'pending';
      const statusColor = status === 'accepted' ? [16, 185, 129] : 
                          status === 'rejected' ? [239, 68, 68] : 
                          status === 'interview' ? [59, 130, 246] : [245, 158, 11];
      doc.setFillColor(...statusColor);
      doc.roundedRect(160, yPos - 5, 30, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(status.toUpperCase(), 175, yPos, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      
      // Details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Email: ${app.student?.email || app.studentEmail || 'N/A'}`, 20, yPos);
      yPos += 6;
      
      if (app.student?.branch) {
        doc.text(`Branch: ${app.student.branch}`, 20, yPos);
        yPos += 6;
      }
      
      if (app.student?.cgpa) {
        doc.text(`CGPA: ${app.student.cgpa}`, 20, yPos);
        yPos += 6;
      }
      
      doc.text(`Applied: ${new Date(app.createdAt).toLocaleDateString()}`, 20, yPos);
      yPos += 6;
      
      if (app.student?.skills?.length > 0) {
        doc.text(`Skills: ${app.student.skills.slice(0, 5).join(', ')}`, 20, yPos);
        yPos += 6;
      }
      
      yPos += 10;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
    }
    
    const fileName = `applications_${selectedRequisition?.title?.replace(/\s+/g, '_') || 'report'}_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  // Filter applications based on criteria
  const getFilteredApplications = () => {
    return requisitionApplications.filter(app => {
      // Status filter
      if (applicationFilters.status !== 'all' && app.status !== applicationFilters.status) {
        return false;
      }
      
      // Branch filter
      if (applicationFilters.branch !== 'all' && app.student?.branch !== applicationFilters.branch) {
        return false;
      }
      
      // CGPA filter
      if (applicationFilters.minCGPA > 0 && (!app.student?.cgpa || app.student.cgpa < applicationFilters.minCGPA)) {
        return false;
      }
      
      // Search term filter
      if (applicationFilters.searchTerm) {
        const searchLower = applicationFilters.searchTerm.toLowerCase();
        const name = (app.student?.name || app.studentName || '').toLowerCase();
        const email = (app.student?.email || app.studentEmail || '').toLowerCase();
        if (!name.includes(searchLower) && !email.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Download job requisition as PDF
  const downloadRequisitionPDF = (req) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Job Requisition', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('GenAI Placement System', 105, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    let yPos = 50;
    
    // Job Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(req.title || 'N/A', 20, yPos);
    yPos += 10;
    
    // Department and Status
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Department: ${req.department || 'N/A'}`, 20, yPos);
    doc.text(`Status: ${req.status || 'Open'}`, 120, yPos);
    yPos += 10;
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Job Details Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Job Details', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
      doc.text(`Number of Positions: ${req.numberOfPositions || 1}`, 20, yPos);
      yPos += 6;
      doc.text(`Location: ${req.location || 'N/A'}`, 20, yPos);
      yPos += 6;
      doc.text(`Employment Type: ${req.employmentType || 'Full-time'}`, 20, yPos);
      yPos += 6;
      //][poiuy] Fix: Render experience as string, not object
      let experienceStr = 'N/A';
      if (typeof req.experience === 'object' && req.experience !== null && 'min' in req.experience && 'max' in req.experience) {
        experienceStr = `${req.experience.min} - ${req.experience.max} years`;
      } else if (typeof req.experience === 'string') {
        experienceStr = req.experience;
      }
      doc.text(`Experience Required: ${experienceStr}`, 20, yPos);
      yPos += 6;
      doc.text(`Education: ${req.education || 'Bachelor'}`, 20, yPos);
      yPos += 6;
      doc.text(`Priority: ${req.priority || 'Medium'}`, 20, yPos);
      yPos += 10;
    
    // Required Skills
    if (req.requiredSkills && req.requiredSkills.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Required Skills:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const skills = Array.isArray(req.requiredSkills) ? req.requiredSkills.join(', ') : req.requiredSkills;
      const skillLines = doc.splitTextToSize(skills, 170);
      doc.text(skillLines, 20, yPos);
      yPos += (skillLines.length * 6) + 4;
    }
    
    // Job Description
    if (req.description) {
      doc.setFont(undefined, 'bold');
      doc.text('Job Description:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(req.description, 170);
      doc.text(descLines, 20, yPos);
      yPos += (descLines.length * 6);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('GenAI Placement System - Confidential', 105, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`Job_Requisition_${req.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const handleJobRequisitionSubmit = async () => {
    setJobRequisitionError('');
    if (!jobRequisition.title || !jobRequisition.department || !jobRequisition.location) {
      setJobRequisitionError('Title, department, and location are required');
      return;
    }
    setJobRequisitionSubmitting(true);
    try {
      const payload = {
        ...jobRequisition,
        requiredSkills: jobRequisition.requiredSkills.split(',').map(s => s.trim())
      };
      
      if (editingJobRequisitionId) {
        // Update existing requisition
        await jobRequisitionsAPI.update(editingJobRequisitionId, payload);
      } else {
        // Create new requisition
        await jobRequisitionsAPI.create(payload);
      }
      
      closeJobRequisitionModal();
      fetchAllData();
    } catch (error) {
      setJobRequisitionError(error.response?.data?.message || error.message || `Failed to ${editingJobRequisitionId ? 'update' : 'create'} job requisition`);
    } finally {
      setJobRequisitionSubmitting(false);
    }
  };

  const requisitionWorkflow = ['Draft', 'Review', 'Approved', 'Published'];

  const getNextRequisitionStatus = (currentStatus) => {
    const normalized = String(currentStatus || 'Draft').toLowerCase();
    const index = requisitionWorkflow.findIndex((status) => status.toLowerCase() === normalized);
    if (index < 0) return 'Review';
    if (index >= requisitionWorkflow.length - 1) return requisitionWorkflow[index];
    return requisitionWorkflow[index + 1];
  };

  const advanceRequisitionWorkflow = async (req) => {
    const current = req.status || 'Draft';
    const nextStatus = getNextRequisitionStatus(current);
    if (nextStatus === current) return;

    try {
      await jobRequisitionsAPI.update(req._id, { ...req, status: nextStatus });
      setJobRequisitions((prev) => prev.map((item) => (item._id === req._id ? { ...item, status: nextStatus } : item)));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to advance requisition workflow status');
    }
  };

  // Update Application Status Handler
  const handleApplicationStatusUpdate = async (applicationId, newStatus) => {
    // Map frontend status to backend enum
    const statusMap = {
      accepted: 'selected',
      interview: 'shortlisted',
      rejected: 'rejected',
      applied: 'applied',
      withdrawn: 'withdrawn'
    };
    const mappedStatus = statusMap[newStatus] || newStatus;
    try {
      await applicationsAPI.updateStatus(applicationId, { status: mappedStatus });
      fetchAllData();
      alert('Application status updated successfully!');
    } catch (error) {
      alert('Error updating application status: ' + error.message);
    }
  };

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const results = await Promise.allSettled([
        studentAPI.getCsv(),
        placementsAPI.getAll(),
        onboardingAPI.getAll(),
        jobAPI.getAll(),
        applicationsAPI.getAll(),
        jobRequisitionsAPI.getAll(),
        placementStatsAPI.getAll(),
        statsAPI.getHRStats()
      ]);

      // 1. Process Students CSV (index 0)
      let studentsFetched = false;
      const csvResult = results[0];
      if (csvResult.status === 'fulfilled') {
        try {
          const csvStudents = csvResult.value.data.students || [];
          if (csvStudents.length > 0) {
            // Map CSV data to match the component's expected format
            const formattedStudents = csvStudents.map(csvStudent => ({
              _id: csvStudent.studentId || csvStudent._id,
              id: csvStudent.studentId || csvStudent._id,
              name: csvStudent.name || `Student ${csvStudent.studentId}`,
              email: csvStudent.email,
              rollNumber: csvStudent.rollNumber || csvStudent.studentId || csvStudent._id,
              age: csvStudent.age,
              gender: csvStudent.gender,
              degree: csvStudent.degree,
              branch: csvStudent.branch,
              cgpa: csvStudent.cgpa,
              internships: csvStudent.internships,
              projects: csvStudent.projects,
              codingSkills: csvStudent.skills?.find(s => s.includes('Coding'))?.split(':')[1]?.trim() || 0,
              communicationSkills: csvStudent.skills?.find(s => s.includes('Communication'))?.split(':')[1]?.trim() || 0,
              softSkillsRating: csvStudent.skills?.find(s => s.includes('Soft Skills'))?.split(':')[1]?.trim() || 0,
              aptitudeTestScore: csvStudent.skills?.find(s => s.includes('Aptitude'))?.split(':')[1]?.trim() || 0,
              certifications: csvStudent.skills?.find(s => s.includes('Certifications'))?.split(':')[1]?.trim() || 0,
              backlogs: csvStudent.backlogs || 0,
              placementStatus: csvStudent.placementStatus,
              skills: csvStudent.skills || [],
              phone: csvStudent.email?.replace('@college.edu', '').replace('student', '+91 98765 ')
            }));
            setStudents(formattedStudents);
            studentsFetched = true;
          }
        } catch (e) {
          console.warn('Error processing CSV students:', e);
        }
      }

      if (!studentsFetched) {
        try {
          const studentsRes = await studentAPI.getAll();
          setStudents(studentsRes.data.students || []);
        } catch (innerError) {
          setStudents([]);
        }
      }

      // 2. Process Placements (index 1)
      const placementsResult = results[1];
      if (placementsResult.status === 'fulfilled') {
        const placementItems = placementsResult.value.data.placements || [];
        setPlacements(placementItems);
        setOffers(mapPlacementsToOffers(placementItems));
      } else {
        if (placementsResult.reason.response && (placementsResult.reason.response.status === 401 || placementsResult.reason.response.status === 403)) {
          logout();
          navigate('/login');
          return;
        }
      }

      // 3. Process Onboarding (index 2)
      const onboardingResult = results[2];
      if (onboardingResult.status === 'fulfilled') {
        setOnboardingTasks(onboardingResult.value.data.onboarding || []);
      } else {
        if (onboardingResult.reason.response && (onboardingResult.reason.response.status === 401 || onboardingResult.reason.response.status === 403)) {
          logout();
          navigate('/login');
          return;
        }
      }

      // 4. Process Jobs (index 3)
      const jobsResult = results[3];
      if (jobsResult.status === 'fulfilled') {
        setJobs(jobsResult.value.data.jobs || []);
      } else {
        if (jobsResult.reason.response && (jobsResult.reason.response.status === 401 || jobsResult.reason.response.status === 403)) {
          logout();
          navigate('/login');
          return;
        }
      }

      // 5. Process Applications (index 4)
      const applicationsResult = results[4];
      if (applicationsResult.status === 'fulfilled') {
        setApplications(applicationsResult.value.data.applications || []);
      } else {
        if (applicationsResult.reason.response && (applicationsResult.reason.response.status === 401 || applicationsResult.reason.response.status === 403)) {
          logout();
          navigate('/login');
          return;
        }
      }

      // 6. Process Job Requisitions (index 5)
      const reqsResult = results[5];
      if (reqsResult.status === 'fulfilled') {
        setJobRequisitions(reqsResult.value.data.jobRequisitions || []);
      } else {
        if (reqsResult.reason.response && (reqsResult.reason.response.status === 401 || reqsResult.reason.response.status === 403)) {
          logout();
          navigate('/login');
          return;
        }
      }

      // 7. Process Placement Stats (index 6)
      const placementStatsResult = results[6];
      if (placementStatsResult.status === 'fulfilled') {
        const statsRes = placementStatsResult.value;
        if (statsRes.data && statsRes.data.placements) {
          setPlacementStats(statsRes.data);
        }
      }

      // 8. Process HR Stats (index 7)
      const hrStatsResult = results[7];
      if (hrStatsResult.status === 'fulfilled') {
        setDashboardStats(hrStatsResult.value.data || null);
      }

    } catch (error) {
      // ignore
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDataRef.current = fetchAllData;
  }, [fetchAllData]);

  const toggleApplicantSelection = (applicationId) => {
    setSelectedApplicantIds((prev) => (
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    ));
  };

  const runBulkPipelineAction = async (targetStatus) => {
    if (selectedApplicantIds.length === 0) {
      alert('Select at least one applicant first.');
      return;
    }

    const statusMap = {
      accepted: 'selected',
      interview: 'shortlisted',
      rejected: 'rejected',
      applied: 'applied',
      withdrawn: 'withdrawn',
      shortlisted: 'shortlisted',
      selected: 'selected',
    };
    const mappedStatus = statusMap[targetStatus] || targetStatus;

    try {
      await Promise.all(
        selectedApplicantIds.map((applicationId) => applicationsAPI.updateStatus(applicationId, { status: mappedStatus }))
      );
      pushFeatureActivity('Pipeline Automation', `${selectedApplicantIds.length} applicants moved to ${mappedStatus}`);
      setSelectedApplicantIds([]);
      await fetchAllData();
      alert(`Updated ${selectedApplicantIds.length} applicants.`);
    } catch (error) {
      alert(`Bulk update failed: ${error?.message || 'Unknown error'}`);
    }
  };

  const exportSmartHiringReport = () => {
    const matchRows = buildAiMatchRows().slice(0, 20).map((row) => ({
      candidate: row.candidateName,
      role: row.jobTitle,
      status: row.status,
      matchScore: row.score,
      profileCompleteness: row.profileScore,
      matchedSkills: row.matchedSkills,
    }));

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalStudents: students.length,
        selectedApplicants: selectedApplicantIds.length,
      },
      notificationPreferences,
      topMatches: matchRows,
      recentActivity: featureActivity.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-hiring-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    pushFeatureActivity('Report Export', 'Smart hiring JSON report downloaded');
  };

  const generateGenAIHiringInsight = async () => {
    try {
      setAiHiringLoading(true);
      const topMatches = buildAiMatchRows().slice(0, 8);
      const staleApplicants = applications.filter((application) => {
        const status = String(application?.status || '').toLowerCase();
        const createdAt = new Date(application?.createdAt || application?.updatedAt || Date.now());
        const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return ageInDays >= 3 && ['applied', 'shortlisted'].includes(status);
      }).length;

      const prompt = [
        'You are an HR copilot for campus placements.',
        'Provide concise hiring recommendations in 5 bullet points and include one risk warning.',
        `Total Jobs: ${jobs.length}`,
        `Total Applications: ${applications.length}`,
        `Total Students: ${students.length}`,
        `Pending SLA Breaches (>=3 days): ${staleApplicants}`,
        'Top matches:',
        ...topMatches.map((row, index) => `${index + 1}. ${row.candidateName} for ${row.jobTitle} - score ${row.score}% - status ${row.status}`),
      ].join('\n');

      const response = await aiAPI.chat({ message: prompt, history: [], role: 'hr' });
      const reply = response?.data?.reply || 'No AI insights generated.';
      setAiHiringInsight(reply);
      pushFeatureActivity('GenAI Insight', 'Generated hiring recommendations');
    } catch (error) {
      setAiHiringInsight('Failed to generate AI insights right now. Please try again.');
    } finally {
      setAiHiringLoading(false);
    }
  };

  const runGenAIStudioAction = async (actionType) => {
    try {
      setGenAIStudioLoading(true);

      const topStudent = students[0] || {};
      const topJob = jobs[0] || {};
      const topApplication = applications[0] || {};
      const firstStudentSkills = Array.isArray(topStudent?.skills)
        ? topStudent.skills
        : String(topStudent?.skills || '').split(',').map((item) => item.trim()).filter(Boolean);
      const firstJobSkills = Array.isArray(topJob?.skills)
        ? topJob.skills
        : String(topJob?.requiredSkills || topJob?.description || '')
            .split(/[;,\n]/)
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8);

      let response;

      if (actionType === 'resume-match') {
        response = await aiAPI.resumeMatch({
          candidate: {
            name: topStudent?.name || 'Candidate',
            cgpa: topStudent?.cgpa || 7.2,
            attendance: topStudent?.attendance || 90,
            skills: firstStudentSkills
          },
          job: {
            title: topJob?.title || genAIStudioInput.roleTitle,
            skills: firstJobSkills
          }
        });
      } else if (actionType === 'interview-questions') {
        response = await aiAPI.interviewQuestions({
          roleTitle: genAIStudioInput.roleTitle,
          company: genAIStudioInput.company,
          skillFocus: firstJobSkills.slice(0, 3)
        });
      } else if (actionType === 'readiness-plan') {
        response = await aiAPI.readinessPlan({
          student: {
            cgpa: topStudent?.cgpa || 7,
            aptitudeScore: Number(topStudent?.aptitudeTestScore || 62),
            communicationScore: Number(topStudent?.communicationSkills || 60),
            codingScore: Number(topStudent?.codingSkills || 65)
          }
        });
      } else if (actionType === 'outreach-draft') {
        response = await aiAPI.outreachDraft({
          tone: genAIStudioInput.tone,
          channel: genAIStudioInput.channel,
          context: genAIStudioInput.context
        });
      } else if (actionType === 'risk-prediction') {
        response = await aiAPI.riskPrediction({
          student: {
            cgpa: topStudent?.cgpa || 7,
            attendance: topStudent?.attendance || 88,
            backlogs: topStudent?.backlogs || 0,
            mockInterviewScore: 64
          }
        });
      } else if (actionType === 'jd-parse') {
        response = await aiAPI.jdParse({
          jobDescription: String(topJob?.description || topJob?.jobDescription || 'Need strong JavaScript, React, SQL and communication skills. Minimum CGPA 7.0. 3 interview rounds.')
        });
      } else if (actionType === 'application-review') {
        response = await aiAPI.applicationReview({
          form: {
            fullName: topApplication?.studentName || topStudent?.name || '',
            email: topStudent?.email || '',
            skills: firstStudentSkills.join(', '),
            projects: topStudent?.projects || '',
            statement: topApplication?.coverLetter || ''
          }
        });
      } else if (actionType === 'analytics-narrative') {
        response = await aiAPI.analyticsNarrative({
          metrics: {
            placementRate: Number(dashboardStats?.placementRate || dashboardStats?.data?.placementRate || 0),
            interviews: interviews.length,
            openJobs: jobs.filter((job) => String(job?.status || '').toLowerCase() === 'open' || String(job?.status || '').toLowerCase() === 'active').length,
            pendingApprovals: jobRequisitions.filter((req) => String(req?.status || '').toLowerCase() !== 'approved').length
          }
        });
      } else if (actionType === 'knowledge-base') {
        response = await aiAPI.knowledgeBase({ question: genAIStudioInput.kbQuestion });
      }

      const resultPayload = response?.data?.result || response?.data?.reply || response?.data?.answer || response?.data;

      if (!resultPayload) {
        throw new Error('No GenAI result returned');
      }

      setGenAIStudioOutput((prev) => ({ ...prev, [actionType]: resultPayload }));
      pushFeatureActivity('GenAI Studio', `Executed ${actionType}`);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to execute GenAI action';
      setGenAIStudioOutput((prev) => ({ ...prev, [actionType]: { error: message } }));
    } finally {
      setGenAIStudioLoading(false);
    }
  };

  const permissionsByRole = {
    hr: { canDelete: true, canApprove: true, canSchedule: true, canRollback: true, canGenerateOffer: true },
    admin: { canDelete: true, canApprove: true, canSchedule: true, canRollback: true, canGenerateOffer: true },
    recruiter: { canDelete: false, canApprove: false, canSchedule: true, canRollback: false, canGenerateOffer: false },
    staff: { canDelete: false, canApprove: false, canSchedule: true, canRollback: false, canGenerateOffer: false },
  };
  const currentPermissions = permissionsByRole[normalizedRole] || permissionsByRole.staff;

  const appendAudit = (action, beforeState = null, afterState = null) => {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      actor: normalizedRole || 'unknown',
      beforeState,
      afterState,
      at: new Date().toISOString(),
    };
    setAuditTrail((prev) => [entry, ...prev].slice(0, 200));
  };

  const computeSlaRows = () => {
    return applications
      .map((application) => {
        const createdAt = new Date(application?.createdAt || application?.updatedAt || Date.now());
        const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const status = String(application?.status || '').toLowerCase();
        const student = getStudentForApplication(application);
        const job = getJobForApplication(application);
        return {
          id: application?._id,
          candidate: student?.name || application?.studentName || 'Unknown Candidate',
          role: job?.title || application?.jobTitle || 'Untitled Role',
          ageInDays,
          status,
        };
      })
      .filter((row) => row.ageInDays >= 3 && ['applied', 'shortlisted'].includes(row.status))
      .sort((a, b) => b.ageInDays - a.ageInDays)
      .slice(0, 8);
  };

  useEffect(() => {
    if (!notificationPreferences?.slaAlerts) return;
    const critical = computeSlaRows().filter((row) => row.ageInDays >= 7);
    if (critical.length > 0) {
      pushFeatureActivity('SLA Auto Escalation', `${critical.length} critical pending applications flagged`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, notificationPreferences?.slaAlerts]);

  const runApprovalAction = async (req, actionType) => {
    if (!currentPermissions.canApprove) {
      alert('Your role does not have approval permissions.');
      return;
    }
    const comment = approvalComments[req._id]?.trim();
    if (!comment) {
      alert('Approval comment is required.');
      return;
    }

    const currentStatus = String(req.status || 'draft').toLowerCase();
    const nextStatusMap = { draft: 'review', review: 'approved', approved: 'published', published: 'published' };
    const nextStatus = actionType === 'reject' ? 'draft' : (nextStatusMap[currentStatus] || 'review');

    try {
      await jobRequisitionsAPI.update(req._id, { ...req, status: nextStatus });
      setJobRequisitions((prev) => prev.map((item) => (item._id === req._id ? { ...item, status: nextStatus } : item)));
      setApprovalHistory((prev) => [{ id: `ah-${Date.now()}`, reqId: req._id, title: req.title, from: currentStatus, to: nextStatus, comment, at: new Date().toISOString() }, ...prev].slice(0, 100));
      appendAudit(`Requisition ${actionType}`, { reqId: req._id, status: currentStatus }, { reqId: req._id, status: nextStatus, comment });
      pushFeatureActivity('Approval Matrix', `${req.title || 'Requisition'} ${actionType} -> ${nextStatus}`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update approval status');
    }
  };

  const buildInterviewSchedulerInsights = () => {
    const busy = interviews.map((item) => `${item.date}-${item.startTime}-${item.endTime}`);
    const suggestions = [];
    const conflicts = [];
    const today = new Date();

    for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      const yyyyMmDd = date.toISOString().split('T')[0];
      ['10:00', '11:00', '14:00', '15:00'].forEach((slot) => {
        const key = `${yyyyMmDd}-${slot}-${slot}`;
        if (!busy.some((entry) => entry.startsWith(`${yyyyMmDd}-${slot}`))) {
          suggestions.push({ date: yyyyMmDd, startTime: slot, interviewer: 'Auto Assigned' });
        } else {
          conflicts.push({ date: yyyyMmDd, startTime: slot, reason: 'Existing interview conflict' });
        }
      });
    }

    setSuggestedInterviewSlots(suggestions.slice(0, 8));
    setInterviewConflicts(conflicts.slice(0, 8));
  };

  const generateOfferLetterPdf = async (candidateName, roleTitle) => {
    if (!currentPermissions.canGenerateOffer) {
      alert('Only HR/Admin can generate offer letters.');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Offer Letter', 20, 20);
    doc.setFontSize(12);
    doc.text(`Candidate: ${candidateName}`, 20, 40);
    doc.text(`Role: ${roleTitle}`, 20, 50);
    doc.text('This offer is subject to final approval and e-sign verification.', 20, 70);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 85);
    doc.save(`offer-${candidateName.replace(/\s+/g, '_')}-${Date.now()}.pdf`);
    try {
      await offerAPI.create({ candidateName, roleTitle, generatedAt: new Date().toISOString() });
      alert('Offer letter saved to backend!');
    } catch (err) {
      alert('Failed to save offer letter to backend.');
    }
    appendAudit('Offer Letter Generated', null, { candidateName, roleTitle });
    pushFeatureActivity('Offer Generator', `Offer letter generated for ${candidateName}`);
  };

  const scheduleSmartReport = () => {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + (reportSchedule.frequency === 'monthly' ? 30 : 7));
    setReportSchedule((prev) => ({ ...prev, nextRunAt: nextRun.toISOString() }));
    pushFeatureActivity('Saved Reports', `Next ${reportSchedule.frequency} report scheduled`);
  };

  const findDuplicateStudents = () => {
    const map = new Map();
    const duplicates = [];
    students.forEach((student) => {
      const key = String(student.email || student.name || '').trim().toLowerCase();
      if (!key) return;
      if (map.has(key)) {
        duplicates.push([map.get(key), student]);
      } else {
        map.set(key, student);
      }
    });
    return duplicates.slice(0, 6);
  };

  const mergeDuplicateStudents = (primary, secondary) => {
    if (!primary || !secondary) return;
    setStudents((prev) => prev.filter((item) => (item._id || item.id) !== (secondary._id || secondary.id)));
    appendAudit('Merged Duplicate Student', { secondaryId: secondary._id || secondary.id }, { primaryId: primary._id || primary.id });
    pushFeatureActivity('Duplicate Merge', `${secondary.name || secondary.email} merged into ${primary.name || primary.email}`);
  };

  const rollbackLastAudit = async () => {
    if (!currentPermissions.canRollback) {
      alert('Your role does not have rollback permissions.');
      return;
    }
    const entry = auditTrail[0];
    if (!entry || !entry.beforeState) {
      alert('No rollback-capable audit record found.');
      return;
    }
    try {
      if (entry.beforeState?.reqId && entry.beforeState?.status) {
        const req = jobRequisitions.find((item) => item._id === entry.beforeState.reqId);
        if (req) {
          await jobRequisitionsAPI.update(req._id, { ...req, status: entry.beforeState.status });
          setJobRequisitions((prev) => prev.map((item) => (item._id === req._id ? { ...item, status: entry.beforeState.status } : item)));
        }
      }
      setAuditTrail((prev) => prev.slice(1));
      pushFeatureActivity('Audit Rollback', `Rolled back action: ${entry.action}`);
    } catch (error) {
      alert('Rollback failed.');
    }
  };

  const pipelineStages = ['applied', 'shortlisted', 'interview', 'offer', 'hired'];

  const getEffectiveApplicationStage = (application) => {
    const applicationId = application?._id || application?.id;
    const override = applicationId ? pipelineStageMap[applicationId] : null;
    if (override) return override;
    const status = String(application?.status || 'applied').toLowerCase();
    if (status === 'selected') return 'offer';
    if (status === 'accepted') return 'hired';
    if (pipelineStages.includes(status)) return status;
    return 'applied';
  };

  const moveApplicationStage = async (applicationId, targetStage) => {
    if (!applicationId || !targetStage) return;
    setPipelineStageMap((prev) => ({ ...prev, [applicationId]: targetStage }));
    pushFeatureActivity('Pipeline Move', `Application ${applicationId} moved to ${targetStage}`);
    try {
      const statusMap = {
        offer: 'selected',
        hired: 'accepted',
      };
      const mapped = statusMap[targetStage] || targetStage;
      await applicationsAPI.updateStatus(applicationId, { status: mapped });
    } catch (_error) {
      // Keep optimistic UI update even if backend mapping differs.
    }
  };

  const escalateSlaItem = async (row) => {
    if (!row) return;
    try {
      await notificationsAPI.sendBulk({
        title: 'SLA Escalation',
        message: `${row.candidate} for ${row.role} has been pending ${row.ageInDays} days.`,
        type: 'sla-alert',
      });
      pushFeatureActivity('SLA Escalation', `${row.candidate} escalated`);
    } catch (_error) {
      pushFeatureActivity('SLA Escalation', `${row.candidate} escalation attempted`);
    }
  };

  const saveReportSnapshot = () => {
    const snapshot = {
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalJobs: jobs.length,
      totalApplications: applications.length,
      totalStudents: students.length,
      offersAccepted: offers.filter((offer) => String(offer?.status || '').toLowerCase() === 'accepted').length,
      averageProfileScore: students.length
        ? Math.round(students.reduce((sum, student) => sum + calculateProfileCompleteness(student), 0) / students.length)
        : 0,
    };
    setSavedReports((prev) => [snapshot, ...prev].slice(0, 20));
    pushFeatureActivity('Saved Report', `Snapshot created at ${new Date(snapshot.createdAt).toLocaleTimeString()}`);
  };

  const downloadInterviewCalendar = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GenAI Placement//HR Calendar//EN'];
    interviews.forEach((interview) => {
      const date = String(interview?.date || '').replace(/-/g, '');
      const startTime = String(interview?.startTime || '09:00').replace(':', '') + '00';
      const endTime = String(interview?.endTime || '10:00').replace(':', '') + '00';
      const summary = `Interview - ${interview?.candidateName || 'Candidate'} (${interview?.position || 'Role'})`;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${interview?.id || Math.random().toString(36).slice(2)}@genai-placement`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      lines.push(`DTSTART:${date}T${startTime}`);
      lines.push(`DTEND:${date}T${endTime}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:Interviewer ${interview?.interviewer || 'TBD'}`);
      lines.push(`LOCATION:${interview?.location || 'Virtual'}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr-interviews-${Date.now()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushFeatureActivity('Calendar Sync', 'Interview calendar exported (.ics)');
  };

  const templatePresets = {
    'job-description': 'Role Summary:\nResponsibilities:\nRequired Skills:\nCompensation:\nApplication Deadline:',
    requisition: 'Business Need:\nTeam/Department:\nHiring Priority:\nApproval Notes:\nExpected Joining Date:',
    email: 'Subject: Update on your application\n\nHello {{candidateName}},\n\nThank you for your interest in {{role}}.\n\nBest regards,\nHR Team',
  };

  useEffect(() => {
    setTemplateBody(templatePresets[templateType] || '');
  }, [templateType]);

  const applyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(templateBody);
      pushFeatureActivity('Template Engine', `${templateType} template copied`);
      alert('Template copied to clipboard.');
    } catch (_error) {
      pushFeatureActivity('Template Engine', `${templateType} template prepared`);
    }
  };

  const sendCommunicationLog = () => {
    if (!selectedCommunicationCandidate || !communicationMessage.trim()) {
      alert('Select a candidate and enter a message.');
      return;
    }
    const entry = {
      id: `comm-${Date.now()}`,
      candidateId: selectedCommunicationCandidate,
      type: communicationType,
      message: communicationMessage.trim(),
      at: new Date().toISOString(),
    };
    setCommunicationLogs((prev) => [entry, ...prev].slice(0, 100));
    setCommunicationMessage('');
    pushFeatureActivity('Communication Sent', `${communicationType.toUpperCase()} logged for ${selectedCommunicationCandidate}`);
  };

  const detectPotentialDuplicates = () => {
    const title = duplicateJobTitle.trim().toLowerCase();
    const company = duplicateCompany.trim().toLowerCase();
    if (!title && !company) return [];
    return jobs.filter((job) => {
      const jobTitle = String(job?.title || job?.position || '').toLowerCase();
      const jobCompany = String(job?.company || '').toLowerCase();
      const titleMatch = title && jobTitle.includes(title);
      const companyMatch = company && jobCompany.includes(company);
      return titleMatch || companyMatch;
    }).slice(0, 8);
  };

  const advanceRequisitionApproval = async (req, action) => {
    const current = String(req?.status || 'draft').toLowerCase();
    const nextMap = {
      draft: 'review',
      review: 'approved',
      approved: 'published',
      published: 'published',
    };
    const nextStatus = action === 'reject' ? 'draft' : (nextMap[current] || 'review');
    try {
      await jobRequisitionsAPI.update(req._id, { ...req, status: nextStatus });
      setJobRequisitions((prev) => prev.map((item) => (item._id === req._id ? { ...item, status: nextStatus } : item)));
      pushFeatureActivity('Approval Matrix', `${req.title || 'Requisition'} moved to ${nextStatus}`);
    } catch (_error) {
      alert('Failed to update requisition approval status.');
    }
  };

  const simulateCollaboratorUpdate = () => {
    if (!jobRequisitions.length) return;
    const target = jobRequisitions[0];
    const status = String(target.status || 'draft').toLowerCase();
    const nextStatus = status === 'review' ? 'approved' : 'review';
    setJobRequisitions((prev) => prev.map((item, index) => (index === 0 ? { ...item, status: nextStatus } : item)));
    setCollaborationHeartbeat(new Date().toISOString());
    pushFeatureActivity('Realtime Collaboration', `${target.title || 'Requisition'} changed to ${nextStatus} by collaborator`);
  };

  const generateJdEnhancement = async () => {
    const targetJob = jobs.find((job) => String(job._id || job.id) === String(selectedJdJobId)) || jobs[0];
    if (!targetJob) {
      setJdEnhancement('No job available for enhancement.');
      return;
    }

    try {
      setJdEnhancing(true);
      const prompt = [
        'Improve this job description for conversion and clarity.',
        `Title: ${targetJob.title || targetJob.position || 'Role'}`,
        `Company: ${targetJob.company || 'Company'}`,
        `Current Description: ${targetJob.description || 'Not provided'}`,
        'Return concise improved version with sections: Summary, Responsibilities, Required Skills, Benefits.',
      ].join('\n');
      const response = await aiAPI.chat({ message: prompt, history: [], role: 'hr' });
      setJdEnhancement(response?.data?.reply || 'No JD enhancement generated.');
      pushFeatureActivity('Auto JD Enhancer', `Enhanced JD for ${targetJob.title || targetJob.position || 'role'}`);
    } catch (_error) {
      setJdEnhancement('Failed to generate JD enhancement right now.');
    } finally {
      setJdEnhancing(false);
    }
  };

  const sendWebhookTest = async () => {
    const trimmedWebhookUrl = webhookUrl.trim();
    const selectedEventNames = Object.entries(webhookEvents)
      .filter(([, enabled]) => enabled)
      .map(([eventName]) => eventName);

    if (!trimmedWebhookUrl) {
      pushFeatureActivity('Webhook Center', `Configured events: ${selectedEventNames.join(', ') || 'none'} (no URL set)`);
      alert('Webhook URL is empty. Set a URL to send a live test.');
      return;
    }

    if (selectedEventNames.length === 0) {
      alert('Select at least one webhook event before sending test payload.');
      return;
    }

    try {
      const parsedUrl = new URL(trimmedWebhookUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        alert('Webhook URL must start with http:// or https://');
        return;
      }
    } catch (_error) {
      alert('Please enter a valid webhook URL.');
      return;
    }

    try {
      setWebhookSending(true);
      const response = await fetch(trimmedWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret.trim() ? { 'x-webhook-secret': webhookSecret.trim() } : {}),
        },
        body: JSON.stringify({
          source: 'hr-dashboard',
          timestamp: new Date().toISOString(),
          events: selectedEventNames,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      const successMessage = `Webhook test sent (${response.status}) at ${new Date().toLocaleTimeString()}`;
      setWebhookLastStatus(successMessage);
      pushFeatureActivity('Webhook Center', `Webhook test sent to ${trimmedWebhookUrl}`);
    } catch (_error) {
      const failedMessage = `Webhook failed at ${new Date().toLocaleTimeString()}`;
      setWebhookLastStatus(failedMessage);
      pushFeatureActivity('Webhook Center', `Webhook delivery failed for ${trimmedWebhookUrl}`);
      alert('Webhook test failed. Check URL/CORS/network settings.');
    } finally {
      setWebhookSending(false);
    }
  };


  // THEME: Standardized theme logic for consistency
  useEffect(() => {
    const savedTheme = localStorage.getItem('hr_dashboard_theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen for system changes if the current mode is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (localStorage.getItem('hr_dashboard_theme') === 'system' || !localStorage.getItem('hr_dashboard_theme')) {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const applyTheme = (mode) => {
    const root = window.document.documentElement;
    let actualTheme = mode;
    if (mode === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    setResolvedTheme(actualTheme);
  };

const persistHRSettings = async (nextConfig, nextTheme) => {
  try {
    setSettingsSyncing(true);
    setSettingsStatus('Saving...');
    await statsAPI.updateHRSettings({
      config: nextConfig,
      theme: nextTheme
    });
    setSettingsStatus('Saved');
  } catch (error) {
    setSettingsStatus('Save failed');
  } finally {
    setSettingsSyncing(false);
    setTimeout(() => setSettingsStatus(''), 1800);
  }
};

const handleThemeChange = async (mode) => {
  setTheme(mode);
  localStorage.setItem('hr_dashboard_theme', mode);
  applyTheme(mode);
  await persistHRSettings(config, mode);
};

const handleConfigToggle = async (key) => {
  const nextConfig = { ...config, [key]: !config[key] };
  setConfig(nextConfig);
  await persistHRSettings(nextConfig, theme);
};

const handleSecuritySettingToggle = async (key, label) => {
  const nextConfig = { ...config, [key]: !config[key] };
  setConfig(nextConfig);
  await persistHRSettings(nextConfig, theme);
  alert(`${label} ${nextConfig[key] ? 'enabled' : 'disabled'} successfully.`);
};

useEffect(() => {
  const loadHRSettings = async () => {
    try {
      const response = await statsAPI.getHRSettings();
      const backendConfig = response?.data?.data?.config;
      const backendTheme = response?.data?.data?.theme;

      if (backendConfig && typeof backendConfig === 'object') {
        setConfig((prev) => ({ ...prev, ...backendConfig }));
      }

      if (['light', 'dark', 'system'].includes(backendTheme)) {
        setTheme(backendTheme);
        localStorage.setItem('hr_dashboard_theme', backendTheme);
        applyTheme(backendTheme);
      }
    } catch (error) {
      // keep local defaults if backend settings are unavailable
    }
  };

  if (token && canAccessHRDashboard) {
    loadHRSettings();
  }
}, [token, canAccessHRDashboard]);
// ...existing code...
// Replace the main return with correct view rendering
// ...existing code...
                    {/* Offer Details Section */}
                    <div className="mt-8">
                      <h2 className="text-2xl font-black drop-shadow-lg mb-4 text-blue-700 dark:text-white">Offer Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {offers && offers.length > 0 && offers.map((offer) => (
                          <div key={offer.id} className="rounded-xl p-6 border transition-colors bg-white dark:bg-slate-800/70 border-gray-200 dark:border-white/10">
                            <h3 className="text-xl font-black mb-2 drop-shadow-lg text-blue-900 dark:text-emerald-400">{offer.candidateName}</h3>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Position: <span className="font-bold text-blue-700 dark:text-blue-300">{offer.position}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Salary: <span className="font-bold text-emerald-700 dark:text-emerald-300">{offer.salary}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Equity: <span className="font-bold text-purple-700 dark:text-purple-300">{offer.equity}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Bonus: <span className="font-bold text-amber-700 dark:text-amber-300">{offer.bonus}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Status: <span className={`font-bold ${offer.status === 'Accepted' ? 'text-emerald-700 dark:text-emerald-400' : offer.status === 'Rejected' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>{offer.status}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Expiry Days: <span className="font-bold text-pink-700 dark:text-pink-300">{offer.expiryDays}</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Progress: <span className="font-bold text-blue-700 dark:text-blue-300">{offer.progress}%</span></p>
                            <p className="text-base mb-1 text-blue-900 dark:text-white">Approver: <span className="font-bold text-cyan-700 dark:text-cyan-300">{offer.approver}</span></p>
                            <div className="mt-2">
                              <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Documents:</p>
                              <ul className="list-disc list-inside text-slate-700 dark:text-slate-200">
                                {offer.documents.map((doc, idx) => (
                                  <li key={idx}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  {/* Modal Content - fixed structure */}
                  {showApplicationDetailModal && selectedApplicationDetail && (
                    <>
                      {/* Skills */}
                      {selectedApplicationDetail.student?.skills?.length > 0 && (
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-emerald-400" />
                            Skills & Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedApplicationDetail.student.skills.map((skill, idx) => (
                              <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-xl text-sm font-medium border border-blue-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Position Applied For */}
                      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-cyan-400" />
                          Position Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Position</p>
                            <p className="text-sm text-white font-medium">
                              {selectedApplicationDetail.job?.title || selectedApplicationDetail.job?.position || 'N/A'}
                            </p>
                          </div>
                          {selectedApplicationDetail.job?.company && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Company</p>
                              <p className="text-sm text-white font-medium">{selectedApplicationDetail.job.company}</p>
                            </div>
                          )}
                          {selectedApplicationDetail.job?.location && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                              <p className="text-sm text-white font-medium">{selectedApplicationDetail.job.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Cover Letter */}
                      {selectedApplicationDetail.coverLetter && (
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-400" />
                            Cover Letter
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {selectedApplicationDetail.coverLetter}
                          </p>
                        </div>
                      )}
                      {/* Additional Info */}
                      {selectedApplicationDetail.student?.certifications?.length > 0 && (
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-400" />
                            Certifications
                          </h4>
                          <ul className="space-y-2">
                            {selectedApplicationDetail.student.certifications.map((cert, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                {cert}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}



  // Environment toggle for development mode
  const isDevelopment = import.meta.env.VITE_MODE === 'development';

  // 6. Enhanced Config
  const [config, setConfig] = useState({
    autoResumeScreening: true,
    aiInterviewAssistant: true,
    emailNotifications: true,
    pushNotifications: true,
    weeklyHiringReports: true,
    securityAlerts: true,
    twoFactorAuth: false,
    apiKeyManagement: false,
    autoArchiveOldJobs: true,
    aiScoreThreshold: 80
  });
  const [settingsSyncing, setSettingsSyncing] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState('');
  const interviewImportInputRef = useRef(null);

  const toCsvSafe = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const downloadTextFile = (filename, content, mimeType = 'text/plain;charset=utf-8;') => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadStudentsCsv = () => {
    if (!students.length) {
      alert('No student data available to export.');
      return;
    }

    const header = ['Name', 'Email', 'Branch', 'CGPA', 'Placement Status', 'Skills'];
    const rows = students.map((student) => [
      student.name || '',
      student.email || '',
      student.branch || '',
      student.cgpa || '',
      student.placementStatus || '',
      Array.isArray(student.skills) ? student.skills.join(', ') : (student.skills || '')
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvSafe(cell)).join(','))
      .join('\n');

    downloadTextFile(`students-export-${new Date().toISOString().split('T')[0]}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const handleExportPlacementResultsCsv = () => {
    if (!placements.length) {
      alert('No placement results available to export.');
      return;
    }

    const header = ['Candidate', 'Company', 'Role', 'Status', 'CTC', 'Joining Date'];
    const rows = placements.map((placement) => [
      placement.studentUser?.name || placement.studentName || '',
      placement.companyName || '',
      placement.roleTitle || '',
      placement.status || '',
      placement.ctc || '',
      placement.joiningDate ? new Date(placement.joiningDate).toLocaleDateString('en-IN') : ''
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvSafe(cell)).join(','))
      .join('\n');

    downloadTextFile(`placement-results-${new Date().toISOString().split('T')[0]}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const handleImportInterviewSchedulesClick = () => {
    interviewImportInputRef.current?.click();
  };

  const handleImportInterviewSchedulesFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const importedCount = Math.max(lines.length - 1, 0);
      alert(`Imported ${importedCount} interview schedule row(s) from ${file.name}.`);
    } catch (error) {
      alert('Failed to read interview schedule file. Please try again.');
    } finally {
      event.target.value = '';
    }
  };

  // ===== ENHANCED HELPERS =====
 const getStatusColor = (status) => {
  const statusKey = String(status || '').toLowerCase();
  const colors = {
    open: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    review: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    approved: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    published: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    accepted: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    done: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',

    scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'in-progress': 'text-blue-400 bg-blue-400/10 border-blue-400/20',

    completed: 'text-slate-400 bg-slate-400/10 border-slate-400/20',

    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    paused: 'text-red-400 bg-red-400/10 border-red-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',

    draft: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };

  return colors[statusKey] || 'text-slate-400 bg-slate-400/10';
};

  // Use only real API data in production; allow mock data only in development
  const filteredTalent = (students.length > 0
    ? students
    : (isDevelopment ? [
        {
          id: 'TAL001',
          name: 'Aarav Mehta',
          branch: 'CSE',
          degree: 'B.Tech',
          age: 21,
          gender: 'Male',
          location: 'Hyderabad',
          atsScore: 92,
          skills: ['React', 'Node.js', 'MongoDB', 'Python'],
          placementStatus: 'placed',
        },
        {
          id: 'TAL002',
          name: 'Isha Reddy',
          branch: 'IT',
          degree: 'B.Tech',
          age: 22,
          gender: 'Female',
          location: 'Bangalore',
          atsScore: 67,
          skills: ['Java', 'Spring', 'SQL', 'AWS'],
          placementStatus: 'interview',
        },
        {
          id: 'TAL003',
          name: 'Rohan Singh',
          branch: 'ECE',
          degree: 'B.Tech',
          age: 21,
          gender: 'Male',
          location: 'Delhi',
          atsScore: 78,
          skills: ['VLSI', 'MATLAB', 'C++', 'Verilog'],
          placementStatus: 'placed',
        },
        {
          id: 'TAL004',
          name: 'Sneha Patel',
          branch: 'EEE',
          degree: 'B.Tech',
          age: 22,
          gender: 'Female',
          location: 'Mumbai',
          atsScore: 54,
          skills: ['Power Systems', 'Embedded C', 'AutoCAD', 'PLC'],
          placementStatus: 'interview',
        },
        {
          id: 'TAL005',
          name: 'Aditya Kumar',
          branch: 'MECH',
          degree: 'B.Tech',
          age: 23,
          gender: 'Male',
          location: 'Chennai',
          atsScore: 83,
          skills: ['SolidWorks', 'ANSYS', 'Thermodynamics', 'CNC'],
          placementStatus: 'placed',
        },
      ] : [])
  )
    .map((student, idx) => ({
      id: student._id || student.id || idx,
      name: student.name || 'Student',
      role: student.branch || 'Student',
      location: student.location || 'N/A',
      experience: student.experience ?? 'N/A',
      score: student.atsScore ?? Math.floor(Math.random() * 30 + 70),
      skills: student.skills ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',')) : ['N/A'],
      status: (student.placementStatus || '').toLowerCase().includes('placed') ? 'Placed' : 'Interviewing',
      source: 'Campus Database',
      lastContact: new Date().toLocaleDateString(),
      _id: student._id || student.id,
      branch: student.branch || 'N/A',
      degree: student.degree || 'N/A',
      age: student.age ?? 'N/A',
      gender: student.gender || 'N/A',
      email: student.email || 'N/A',
      phone: student.phone || 'N/A',
      cgpa: student.cgpa ?? 'N/A',
      resume: student.resume || '',
      placementStatus: student.placementStatus || 'N/A',
      address: student.address || 'N/A',
      dob: student.dob || 'N/A',
      tenthMarks: student.tenthMarks ?? 'N/A',
      twelfthMarks: student.twelfthMarks ?? 'N/A',
      fatherName: student.fatherName || 'N/A',
      motherName: student.motherName || 'N/A',
      category: student.category || 'N/A',
      nationality: student.nationality || 'N/A',
      aadhar: student.aadhar || 'N/A',
      pan: student.pan || 'N/A',
      bloodGroup: student.bloodGroup || 'N/A',
      hobbies: student.hobbies || 'N/A',
      extraCurricular: student.extraCurricular || 'N/A',
      projects: student.projects || [],
      certifications: student.certifications || [],
      languages: student.languages || 'N/A',
      linkedin: student.linkedin || '',
      github: student.github || '',
      website: student.website || '',
    }))
    .sort((a, b) => {
      if (talentSort === 'score-desc') return b.score - a.score;
      if (talentSort === 'score-asc') return a.score - b.score;
      if (talentSort === 'name-asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (talentSort === 'name-desc') return String(b.name || '').localeCompare(String(a.name || ''));
      return 0;
    });

  // Quick Actions
  const quickActions = [
    { icon: UserPlus, label: 'Schedule Interview', action: () => setCurrentView('interviews') },
    { icon: Brain, label: 'GenAI Hiring Hub', action: () => setCurrentView('smart-hiring') },
    { icon: FileText, label: 'Create Offer', action: () => setCurrentView('offers') },
    { icon: Mail, label: 'Email Center', action: () => setShowEmailModal(true) },
    { icon: BarChart3, label: 'View Reports', action: () => setCurrentView('analytics') }
  ];

  // ===== ENHANCED VIEW RENDERERS =====

  // 1. Enhanced Overview
  const renderOverview = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[ 
            { id: 'jobs', label: 'Jobs & Reqs', value: '14', change: '+2', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'talent', label: 'Talent Pool', value: '247', change: '+15', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'interviews', label: 'Interviews', value: '8', change: '+3', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { id: 'offers', label: 'Offers', value: '4', change: '+1', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((stat) => (
            <div key={stat.id} className={`group ${isDark ? 'bg-slate-800/50 border-white/5 hover:border-white/15' : 'bg-white border-gray-900 hover:border-gray-900'} p-6 rounded-xl border backdrop-blur-sm transition-all hover:shadow-xl`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm font-medium`}>{stat.label}</p>
                  <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>{stat.value}</h3>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  {React.createElement(stat.icon, { className: "h-6 w-6" })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Recent Activity */}
          <div className={`lg:col-span-2 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <div className="mt-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md flex flex-col items-center justify-center min-h-[220px]">
                <h2 className="text-xl font-semibold mb-2 text-center">Video Call</h2>
                <p className="text-gray-500 dark:text-slate-400 text-center mb-4">
                  Start a video interview with a student.<br />
                  Click below to join the Interview Room.
                </p>
                <button
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg mt-4"
                  onClick={() => setShowVideoCallModal(true)}
                >
                  Join Interview Room
                </button>
                    {showVideoCallModal && (
                      <Modal title="Interview Room" onClose={() => setShowVideoCallModal(false)} size="lg">
                        <div className="space-y-6">
                          <VideoConference
                            roomId={user?.id ? `interview-room-hr-${user.id}` : 'interview-room-hr-demo'}
                            user={user}
                            onLeave={() => setShowVideoCallModal(false)}
                            compact
                          />
                        </div>
                      </Modal>
                    )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`group flex flex-col items-center p-4 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15' : 'bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-gray-400'} rounded-xl border transition-all h-full`}
                >
                  <div className={`w-12 h-12 ${isDark ? 'bg-blue-500/10 group-hover:bg-blue-500/20 border-blue-500/20' : 'bg-blue-100 group-hover:bg-blue-200 border-blue-300'} rounded-xl flex items-center justify-center mb-3 border transition-all`}>
                    {React.createElement(action.icon, { className: `h-6 w-6 ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}` })}
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-center leading-tight`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Notifications</h3>
              <button
                onClick={() => setShowNotifications(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                View All
              </button>
            </div>

            {notificationsLoading ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No notifications available.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id, notification.read)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isDark
                        ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                      {notification.userId?.role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          notification.userId.role === 'admin' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                          notification.userId.role === 'staff' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                          notification.userId.role === 'student' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                          'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.userId.role}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{notification.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  // 2. Enhanced Jobs & Reqs View (Tabbed Modern Layout)
  const [jobsReqsTab, setJobsReqsTab] = useState('jobs');
  const renderJobsAndReqs = () => (
    <div className="flex justify-center w-full">
      <div className={`w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-2xl p-6 transition-colors`}>
      {/* Analytics/Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={Briefcase} label="Active Jobs" value={jobs?.filter(j => (j.status || 'active').toLowerCase() === 'active').length ?? 0} color="text-blue-500" />
        <StatCard icon={CheckCircle} label="Total Applications" value={jobs?.reduce((sum, j) => sum + (j.applications || 0), 0) ?? 0} color="text-emerald-500" />
        <StatCard icon={Star} label="Total Views" value={jobs?.reduce((sum, j) => sum + (j.views || 0), 0) ?? 0} color="text-purple-500" />
        <StatCard icon={Users} label="Companies" value={new Set(jobs?.map(j => j.company)).size ?? 0} color="text-orange-500" />
      </div>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-3xl font-black drop-shadow-lg ${isDark ? 'text-white' : 'text-blue-700'}`}>Jobs & Requisitions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJobPostModal(true)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isDark ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <Plus className="h-5 w-5" /> New Job
          </button>
          <button
            onClick={() => setShowJobRequisitionModal(true)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isDark ? 'bg-gradient-to-r from-sky-700 to-blue-800 hover:from-sky-600 hover:to-blue-700 text-white' : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white'}`}
          >
            <Plus className="h-5 w-5" /> New Requisition
          </button>
        </div>
      </div>
      {/* Tabs - Improved Format */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-8 py-3 rounded-xl font-bold text-lg shadow transition-all border-2 ${jobsReqsTab === 'jobs' ? (isDark ? 'border-blue-400 bg-blue-900 text-blue-200' : 'border-blue-600 bg-blue-50 text-blue-700') : (isDark ? 'border-slate-700 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500')}`}
          onClick={() => setJobsReqsTab('jobs')}
        >
          <span className="mr-2">💼</span> Jobs
        </button>
        <button
          className={`px-8 py-3 rounded-xl font-bold text-lg shadow transition-all border-2 ${jobsReqsTab === 'reqs' ? (isDark ? 'border-blue-400 bg-blue-900 text-blue-200' : 'border-blue-600 bg-blue-50 text-blue-700') : (isDark ? 'border-slate-700 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500')}`}
          onClick={() => setJobsReqsTab('reqs')}
        >
          <span className="mr-2">📝</span> Requisitions
        </button>
      </div>
      {/* Tab Content */}
      {jobsReqsTab === 'jobs' ? (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Job Listings (Grouped by Status)</h3>
          {Array.isArray(jobs) && jobs.length > 0 ? (
            ['active','draft','closed','expired'].map(status => {
              const group = Array.from(new Map(jobs.map(j => [(j._id || j.id), j])).values()).filter(j => (j.status || 'active').toLowerCase() === status);
              if (!group.length) return null;
              return (
                <div key={status} className="mb-8">
                  <h4 className={`text-lg font-bold mb-2 mt-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{status.charAt(0).toUpperCase() + status.slice(1)} Jobs</h4>
                  <HRJobs jobs={group} setJobs={setJobs} students={students} />
                </div>
              );
            })
          ) : (
            <div className={`flex flex-col items-center justify-center min-h-[150px] font-bold text-lg ${isDark ? 'text-blue-300' : 'text-blue-500'}`}>
              No jobs found.<br/>Create a new job to get started.
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Job Requisitions (Grouped by Status)</h3>
          {jobRequisitions.length > 0 ? (
            ['open','published','closed','draft'].map(status => {
              const group = Array.from(new Map(jobRequisitions.map(r => [(r._id || r.id), r])).values()).filter(r => (r.status || 'open').toLowerCase() === status);
              if (!group.length) return null;
              return (
                <div key={status} className="mb-8">
                  <h4 className={`text-lg font-bold mb-2 mt-4 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>{status.charAt(0).toUpperCase() + status.slice(1)} Requisitions</h4>
                  <div className="grid gap-6">
                    {group.map((req) => (
                      <div key={req._id || req.id} className={`group ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl p-8 hover:border-sky-300 transition-all shadow-sm hover:shadow-lg`}>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className={`text-2xl font-black bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent transition-all mb-1`}>{req.title}</h3>
                                <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}> 
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" /> {req.department}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" /> {req.numberOfPositions} positions
                                  </span>
                                </div>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(req.status)}`}>{req.status}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                              <div key={`${req._id}-location`}>
                                <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location</p>
                                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{req.location}</p>
                              </div>
                              <div key={`${req._id}-type`}>
                                <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</p>
                                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{req.employmentType}</p>
                              </div>
                              <div key={`${req._id}-experience`}>
                                <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Experience</p>
                                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{req.experience?.min || 0} - {req.experience?.max || 5} years</p>
                              </div>
                              <div key={`${req._id}-priority`} className="text-right">
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                  req.priority === 'Critical' ? 'text-red-400' :
                                  req.priority === 'High' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  {req.priority}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-0 lg:border-l lg:border-slate-200 dark:lg:border-slate-700 lg:pl-8 lg:w-80">
                            <button
                              onClick={() => openEditJobRequisitionModal(req)}
                              className={`flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2`}
                            >
                              <Edit className="h-5 w-5" /> Edit
                            </button>
                            {/* Approval Workflow Buttons */}
                            {(String(req.status).toLowerCase() === 'open' || String(req.status).toLowerCase() === 'in review') && (
                              <>
                                <button
                                  onClick={() => handleApproveRequisition(req)}
                                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                                  title="Approve Requisition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRequisition(req)}
                                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                                  title="Reject Requisition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => viewRequisitionApplications(req)}
                              className={`flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2`}
                              title="View Applications"
                            >
                              <Eye className="h-5 w-5" /> Applications
                            </button>
                            <button
                              onClick={() => downloadRequisitionPDF(req)}
                              className={`flex items-center justify-center p-3 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white transition-all shadow-md`}
                              title="Download PDF"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`text-center py-12 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-2xl`}>
              <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-70" />
              <h3 className="text-xl font-bold mb-2">No job requisitions</h3>
              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create your first job requisition to get started</p>
              <button
                onClick={() => setShowJobRequisitionModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all"
              >
                Create Requisition
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );


  // 3. Enhanced Talent Pool
  // Bulk selection state
  const [selectedTalentIds, setSelectedTalentIds] = useState([]);
  const allTalentIds = filteredTalent.map(t => t.id || t._id);
  const isAllSelected = allTalentIds.length > 0 && allTalentIds.every(id => selectedTalentIds.includes(id));
  const handleSelectTalent = (id) => setSelectedTalentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSelectAllTalent = () => setSelectedTalentIds(isAllSelected ? [] : allTalentIds);
  const handleBulkEmail = () => {/* TODO: open email modal with selectedTalentIds */ setShowEmailModal(true); };
  const handleBulkStatus = (status) => {/* TODO: update status for selectedTalentIds */ alert(`Set status '${status}' for ${selectedTalentIds.length} students`); };
  const handleBulkExport = () => {/* TODO: export selectedTalentIds */ alert(`Exporting ${selectedTalentIds.length} students`); };

  const renderTalent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Talent Pool</h2>
          <select
            className="ml-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-gray-700 dark:text-white focus:outline-none"
            value={talentSort}
            onChange={e => setTalentSort(e.target.value)}
            title="Sort by"
          >
            <option value="score-desc">Sort: Best Match</option>
            <option value="score-asc">Sort: Lowest Score</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
          </select>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
          onClick={() => setShowEmailModal(true)}
        >
          <Mail className="h-5 w-5" /> Email Center
        </button>
      </div>
      {/* Bulk Actions Bar */}
      {selectedTalentIds.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center justify-between bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl px-6 py-3 mb-4 shadow">
          <span className="font-bold text-blue-700 dark:text-blue-200">{selectedTalentIds.length} selected</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold" onClick={handleBulkEmail}><Mail className="h-4 w-4 inline" /> Email</button>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold" onClick={() => handleBulkStatus('Placed')}>Mark Placed</button>
            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold" onClick={() => handleBulkStatus('Interviewing')}>Mark Interviewing</button>
            <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold" onClick={handleBulkExport}><Download className="h-4 w-4 inline" /> Export</button>
          </div>
        </div>
      )}
      {/* Search bar on top */}
      <div className="w-full max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search candidates by name, skills, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
      </div>
      {/* Responsive grid for Talent Pool */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-7xl mx-auto min-h-[400px]">
        {/* Select All Checkbox */}
        {filteredTalent.length > 0 && (
          <div className="col-span-full flex items-center gap-2 mb-2">
            <input type="checkbox" checked={isAllSelected} onChange={handleSelectAllTalent} className="h-5 w-5 rounded border-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-white">Select All</span>
          </div>
        )}
        {filteredTalent.length > 0 ? (
          filteredTalent.map(talent => {
            const id = talent.id || talent._id;
            return (
              <div
                key={id}
                className="group bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-gray-200 dark:border-blue-900/30 rounded-3xl flex flex-col justify-between shadow-xl dark:shadow-2xl transition-all duration-200 min-h-[360px] h-full max-w-full hover:scale-[1.025] hover:shadow-2xl"
                style={{ minHeight: 360, height: '100%' }}
              >
                {/* Bulk select checkbox */}
                <div className="flex items-center gap-2 px-8 pt-7">
                  <input type="checkbox" checked={selectedTalentIds.includes(id)} onChange={() => handleSelectTalent(id)} className="h-5 w-5 rounded border-gray-400" />
                  {/* Profile avatar and info */}
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 border-2 border-blue-300 dark:border-blue-500/50 flex items-center justify-center flex-shrink-0 shadow-lg relative">
                    <span className="text-3xl font-black text-white drop-shadow-lg">
                      {(() => {
                        if (!talent.name) return 'S';
                        const parts = talent.name.trim().split(' ');
                        let initials = '';
                        if (parts.length === 1) {
                          initials = parts[0].slice(0, 2).toUpperCase();
                        } else {
                          initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                        }
                        // Remove any non-letter characters (like '>')
                        return initials.replace(/[^A-Z]/gi, '');
                      })()}
                    </span>
                    {/* Profile Badges */}
                    {talent.status === 'Placed' && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Placed</span>
                    )}
                    {talent.score >= 90 && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Top Performer</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">{talent.name || 'Student'}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-base font-semibold mb-1 truncate">{talent.degree || 'N/A'} - {talent.branch || 'N/A'}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><User className="h-4 w-4" /> {talent.age || 'N/A'} yrs • {talent.gender || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {talent.email || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {talent.phone || 'N/A'}</span>
                      {talent.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {talent.address}</span>}
                      {talent.dob && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> DOB: {talent.dob}</span>}
                    </div>
                    {/* Additional Details Row */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">
                      {talent.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location: {talent.location}</span>}
                      {talent.lastContact && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Last Contact: {talent.lastContact}</span>}
                      {talent.source && <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Source: {talent.source}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">
                      <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Resume: {talent.resume ? <a href={talent.resume} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-300">View</a> : 'N/A'}</span>
                      <span className="flex items-center gap-1"><Award className="h-4 w-4" /> CGPA: {talent.cgpa || 'N/A'}</span>
                      {talent.tenthMarks && <span className="flex items-center gap-1"><Star className="h-4 w-4" /> 10th: {talent.tenthMarks}</span>}
                      {talent.twelfthMarks && <span className="flex items-center gap-1"><Star className="h-4 w-4" /> 12th: {talent.twelfthMarks}</span>}
                      {talent.experience && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Exp: {talent.experience} yrs</span>}
                    </div>
                    {/* Profile Completeness Meter */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Profile:</span>
                      <span className="inline-block w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <span
                          className="block h-2 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${Math.round((['name','email','phone','degree','branch','cgpa'].reduce((acc, field) => talent[field] ? acc + 1 : acc, 0) / 6) * 100)}%` }}
                        />
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{Math.round((['name','email','phone','degree','branch','cgpa'].reduce((acc, field) => talent[field] ? acc + 1 : acc, 0) / 6) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 mx-8"></div>
                {/* Skills and status */}
                <div className="flex-1 flex flex-col justify-between px-8 pb-4">
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {talent.skills && talent.skills.length > 0 && talent.skills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block text-xs font-medium text-gray-500 dark:text-slate-400">Status:</span>
                      <span className={`font-bold text-xs px-2 py-1 rounded-lg ${talent.status === 'Placed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : talent.status === 'Interviewing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-slate-800/50 dark:text-slate-300'}`}>{talent.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block text-xs font-medium text-gray-500 dark:text-slate-400">Score:</span>
                      <span className="font-bold text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{talent.score}</span>
                    </div>
                  </div>
                  {/* Schedule Interview, View Details, Parse Resume Buttons */}
                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <button
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-md transition-all"
                      onClick={() => {
                        // Find application for this talent
                        const application = applications.find(app => {
                          const studentId = app.student?._id || app.student?.id || app.studentId;
                          return studentId === (talent.id || talent._id);
                        });
                        if (!application) {
                          alert('Cannot schedule interview: This candidate has not applied to any job.');
                          return;
                        }
                        const applicationEmail = application.student?.user?.email || application.student?.email || '';
                        const applicationName = application.student?.user?.name || application.student?.name || '';
                        const applicationPosition = application.job?.position || application.job?.title || '';
                        setNewInterview({
                          applicationId: application?._id || application?.id || '',
                          candidateEmail: applicationEmail,
                          candidateName: applicationName,
                          position: applicationPosition,
                          round: 'technical',
                          date: '',
                          startTime: '',
                          endTime: '',
                          interviewer: user?.name || '',
                          location: '',
                          type: 'Virtual',
                        });
                        setCandidateEmail(applicationEmail);
                        setSelectedCandidate(application);
                        setShowScheduleInterviewModal(true);
                      }}
                    >
                      Schedule Interview
                    </button>
                    <button
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                      onClick={() => setSelectedStudentForAnalysis(talent)}
                    >
                      View Details
                    </button>
                    <button
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md transition-all"
                      onClick={() => handleParseResume(talent)}
                    >
                      Parse Resume
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : null}
        {filteredTalent.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-gray-200 dark:border-white/10">
            <Users className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">No candidates found</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto font-semibold">
              Try adjusting your search terms or filters. You can also import new candidates or wait for fresh applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black transition-all shadow-lg hover:shadow-xl">
                Import Candidates
              </button>
              <button className="px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-slate-300 rounded-xl border-2 border-gray-300 dark:border-white/10 font-bold transition-all">
                Clear Filters
              </button>
            </div>
          </div>
        )}
        {renderStudentDetailsModal()}
      </div>
    </div>
  );

  // 4. Enhanced Interviews
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [emailSearchResults, setEmailSearchResults] = useState([]);
  const [newInterview, setNewInterview] = useState({
    candidateEmail: '',
    candidateName: '',
    position: '',
    applicationId: '',
    round: 'technical',
    date: '',
    startTime: '',
    endTime: '',
    interviewer: user?.name || '',
    location: '',
    type: 'Virtual',
  });
  const [suggestedInterviewSlots, setSuggestedInterviewSlots] = useState([]);
  const [interviewConflicts, setInterviewConflicts] = useState([]);

  // Search candidate by email
  const handleSearchCandidateByEmail = async (email) => {
    setCandidateEmail(email);
    setNewInterview(prev => ({
      ...prev,
      candidateEmail: email,
      candidateName: '',
      position: ''
    }));
    if (!email.trim()) {
      setEmailSearchResults([]);
      return;
    }
    try {
      // Search in detailedApplications or directly in users
      const results = applications?.filter(app => 
        app.student?.user?.email?.toLowerCase().includes(email.toLowerCase()) ||
        app.student?.email?.toLowerCase().includes(email.toLowerCase())
      ) || [];
      setEmailSearchResults(results);
      const normalizedEmail = String(email).trim().toLowerCase();
      const exactMatch = results.find((app) => {
        const appEmail = String(app.student?.user?.email || app.student?.email || app.candidateEmail || app.email || app.studentEmail || '').trim().toLowerCase();
        return appEmail === normalizedEmail;
      });
      if (exactMatch) {
        handleSelectCandidate(exactMatch);
        return;
      }
      if (results.length === 1) {
        handleSelectCandidate(results[0]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setEmailSearchResults([]);
    }
  };

  // Select candidate from search results
  const handleSelectCandidate = (app) => {
    const studentEmail = app.student?.user?.email || app.student?.email || '';
    const studentName = app.student?.user?.name || app.student?.name || 'Student';
    const position = app.job?.position || app.job?.title || 'Position';
    
    setSelectedCandidate(app);
    setNewInterview(prev => ({
      ...prev,
      candidateEmail: studentEmail,
      candidateName: studentName,
      position: position,
      applicationId: app._id
    }));
    setCandidateEmail(studentEmail);
    setEmailSearchResults([]);
  };
    // Smart slot suggestion logic (simple demo: next 5 days, 10/11/14/15)
    const handleSuggestSlots = () => {
      const busy = interviews.map(iv => `${iv.date}-${iv.startTime}`);
      const suggestions = [];
      const conflicts = [];
      const today = new Date();
      for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() + dayOffset);
        const yyyyMmDd = date.toISOString().split('T')[0];
        ['10:00', '11:00', '14:00', '15:00'].forEach((slot) => {
          if (!busy.some((entry) => entry.startsWith(`${yyyyMmDd}-${slot}`))) {
            suggestions.push({ date: yyyyMmDd, startTime: slot, endTime: (parseInt(slot) + 1) + ':00', interviewer: 'Auto Assigned' });
          } else {
            conflicts.push({ date: yyyyMmDd, startTime: slot, reason: 'Existing interview conflict' });
          }
        });
      }
      setSuggestedInterviewSlots(suggestions.slice(0, 8));
      setInterviewConflicts(conflicts.slice(0, 8));
    };
  const [joiningInterview, setJoiningInterview] = useState(null);

  const renderInterviews = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-blue-700 dark:text-white drop-shadow-lg">Interviews</h2>
          <p className="text-lg font-semibold text-blue-900 dark:text-slate-400 drop-shadow-sm mt-1">Manage and join interviews</p>
        </div>
        <button
          onClick={() => setShowScheduleInterviewModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
        >
          <Plus className="h-5 w-5" /> Schedule Interview
        </button>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleInterviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} w-full max-w-xl rounded-2xl p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Schedule Interview</h3>
              <button
                onClick={() => {
                  setShowScheduleInterviewModal(false);
                  setSelectedCandidate(null);
                  setCandidateEmail('');
                  setEmailSearchResults([]);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Candidate Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={e => handleSearchCandidateByEmail(e.target.value)}
                    placeholder="Enter candidate email"
                    className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    required
                  />
                  {/* Email search dropdown */}
                  {emailSearchResults.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto ${isDark ? 'bg-slate-800 border border-yellow-300/40' : 'bg-white border border-gray-200'}`}>
                      {emailSearchResults.map(app => (
                        <button
                          key={app._id}
                          onClick={() => handleSelectCandidate(app)}
                          className={`w-full text-left px-3 py-2 hover:bg-blue-600/50 border-b last:border-b-0 text-sm font-semibold ${isDark ? 'border-slate-700 text-yellow-200' : 'border-gray-100 text-gray-900'}`}
                          type="button"
                        >
                          <div className={`${isDark ? '' : 'text-gray-900'}`}>{app.student?.user?.name || app.student?.name}</div>
                          <div className={`${isDark ? 'text-yellow-300/70 text-xs' : 'text-gray-500 text-xs'}`}>{app.student?.user?.email || app.student?.email} - {app.job?.position || 'Role'}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCandidate && (
                  <div className={`mt-2 p-2 rounded-lg text-sm font-semibold ${isDark ? 'bg-blue-900/30 border border-blue-500/50 text-yellow-200' : 'bg-gray-100 border border-gray-200 text-gray-900'}`}>
                    ✓ Selected: {newInterview.candidateName} ({newInterview.candidateEmail})
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Round *</label>
                <select
                  value={newInterview.round}
                  onChange={e => setNewInterview(prev => ({ ...prev, round: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200' : 'bg-white border border-gray-300 text-gray-900'}`}
                >
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Date *</label>
                <input
                  type="date"
                  value={newInterview.date}
                  onChange={e => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200' : 'bg-white border border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Start Time *</label>
                <input
                  type="time"
                  value={newInterview.startTime}
                  onChange={e => setNewInterview(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200' : 'bg-white border border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>End Time *</label>
                <input
                  type="time"
                  value={newInterview.endTime}
                  onChange={e => setNewInterview(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200' : 'bg-white border border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Location</label>
                <input
                  value={newInterview.location}
                  onChange={e => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-yellow-300 drop-shadow-lg' : 'text-gray-700'}`}>Type</label>
                <select
                  value={newInterview.type}
                  onChange={e => setNewInterview(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full p-3 rounded-xl font-bold drop-shadow-lg ${isDark ? 'bg-slate-800 border border-yellow-300/40 text-yellow-200' : 'bg-white border border-gray-300 text-gray-900'}`}
                >
                  <option value="Virtual">Virtual</option>
                  <option value="In-person">In-person</option>
                </select>
              </div>
            </div>
            {/* Smart Slot Suggestions */}
            <div className="mt-4">
              <button
                onClick={handleSuggestSlots}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all mb-2"
              >
                Suggest Interview Slots
              </button>
              {suggestedInterviewSlots.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1 text-yellow-200">Suggested Slots (click to fill):</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedInterviewSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewInterview(prev => ({ ...prev, date: slot.date, startTime: slot.startTime, endTime: slot.endTime }))}
                        className="px-3 py-1 bg-blue-900/30 text-blue-200 rounded-lg text-xs font-semibold border border-blue-700 hover:bg-blue-700 hover:text-white"
                      >
                        {slot.date} {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowScheduleInterviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const normalizedEmail = String(candidateEmail || newInterview.candidateEmail || '').trim().toLowerCase();
                    const exactEmailMatch = applications?.find(app => {
                      const applicationEmail = String(app.student?.user?.email || app.student?.email || app.candidateEmail || app.email || app.studentEmail || '').trim().toLowerCase();
                      return applicationEmail && applicationEmail === normalizedEmail;
                    });
                    const resolvedApplication = exactEmailMatch || selectedCandidate || (newInterview.applicationId
                      ? applications?.find(app => String(app._id) === String(newInterview.applicationId))
                      : null);

                    if (!resolvedApplication || !newInterview.round || !newInterview.date || !newInterview.startTime) {
                      alert('Please fill all required fields (Candidate Email, Round, Date, Start Time) and select a matching application.');
                      return;
                    }
                    const scheduledDate = new Date(`${newInterview.date}T${newInterview.startTime}`);
                    const payload = {
                      applicationId: resolvedApplication._id,
                      round: newInterview.round,
                      scheduledDate,
                      date: newInterview.date,
                      startTime: newInterview.startTime,
                      endTime: newInterview.endTime,
                      location: newInterview.location,
                      type: newInterview.type,
                      interviewer: newInterview.interviewer || user?.name,
                    };
                    const { data } = await interviewAPI.schedule(payload);
                    setInterviews(prev => [...prev, data.interview || data]);
                    setShowScheduleInterviewModal(false);
                    setNewInterview({ candidateEmail: '', candidateName: '', applicationId: '', round: 'technical', date: '', startTime: '', endTime: '', interviewer: user?.name || '', location: '', type: 'Virtual' });
                    setSelectedCandidate(null);
                    setCandidateEmail('');
                    setEmailSearchResults([]);
                    setSuggestedInterviewSlots([]);
                    alert('Interview scheduled successfully!');
                  } catch (err) {
                    alert('Failed to schedule interview: ' + (err?.response?.data?.message || err.message));
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing/Scheduled Interviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 text-xs uppercase font-black text-white dark:text-yellow-300 tracking-wider drop-shadow-lg">
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Candidate</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Position</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Date</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Time</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Type</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Status</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => {
              const candidateName = interview.student?.user?.name || interview.student?.name || interview.candidateName || 'N/A';
              const position = interview.job?.title || interview.job?.position || interview.position || 'N/A';
              const date = interview.date || interview.scheduledDate?.split('T')[0] || 'N/A';
              const startTime = interview.startTime || 'N/A';
              const endTime = interview.endTime || 'N/A';
              const type = interview.type || 'N/A';
              const status = interview.status || 'Scheduled';
              
              return (
              <tr key={interview._id || interview.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                <td className="px-6 py-5 font-bold text-gray-900 dark:text-white">{candidateName}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-gray-200">{position}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-gray-200">{date}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-gray-200">{startTime} - {endTime}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-gray-200">{type}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Completed' ? 'bg-emerald-600/80 text-white' : 'bg-blue-600/80 text-white'}`}>{status}</span>
                </td>
                <td className="px-6 py-5">
                  {status === 'Scheduled' && type === 'Virtual' && (
                    <button
                      onClick={() => setJoiningInterview(interview)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg transition-all"
                    >
                      <Video className="w-4 h-4 inline mr-1" /> Join
                    </button>
                  )}
                  {status === 'Completed' && <span className="text-gray-500 dark:text-slate-400">Completed</span>}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Camera Join Modal */}
      {joiningInterview && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-6xl h-[95vh] max-h-[95vh] flex flex-col overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950 shadow-2xl">
            <div className="flex w-full items-start justify-between border-b border-slate-800 px-4 py-4 sm:px-6 shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-blue-300">
                  <Video className="w-6 h-6" /> Interview Room
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {joiningInterview.candidateName} • {joiningInterview.position}
                </p>
              </div>
              <button onClick={() => setJoiningInterview(null)} className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5 sm:py-5 pb-12">
              <div className="w-full">
                <VideoConference
                  roomId={joiningInterview.roomId || `interview-room-${joiningInterview.id}`}
                  user={user}
                  onLeave={() => setJoiningInterview(null)}
                  compact
                />
              </div>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                {joiningInterview.date} • {joiningInterview.startTime} - {joiningInterview.endTime}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const offersSource = offers.length ? offers : mockOffers;
  const onboardingSource = onboardingTasks.length ? onboardingTasks : mockOnboardingTasks;

  // 5. Enhanced Offers
  const renderOffers = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-blue-700 dark:text-white drop-shadow-lg">Offer Management</h2>
          <p className="text-lg font-semibold text-blue-900 dark:text-slate-400 drop-shadow-sm mt-1">Track offer progress and approvals</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus className="h-4 w-4" /> New Offer
          </button>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-blue-700 dark:text-white">Create New Offer</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-900 dark:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {offerError && (
              <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                {offerError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-blue-300 mb-2">Select Student - Registered Email *</label>
                <select
                  value={offerForm.candidateEmail}
                  onChange={(e) => {
                    setOfferForm((prev) => ({
                      ...prev,
                      candidateEmail: e.target.value,
                      studentUserId: '',
                    }));
                  }}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold mb-2"
                >
                  <option value="">-- Select an Applicant Email --</option>
                  {offerCandidates.length > 0 ? (
                    offerCandidates.map((candidate) => (
                      <option
                        key={candidate.key}
                        value={candidate.email}
                      >
                        {candidate.email} {candidate.name ? `• ${candidate.name}` : ''} {candidate.applications?.length ? `• ${candidate.applications.length} application${candidate.applications.length > 1 ? 's' : ''}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No applicant emails found</option>
                  )}
                </select>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  ✓ Only students who have applied for a job are listed. The offer will be sent to their registered email address.
                </p>
                {(() => {
                   const matchedCandidate = offerCandidates.find((candidate) => String(candidate.email || '').toLowerCase() === String(offerForm.candidateEmail || '').toLowerCase());
                   if (matchedCandidate) {
                      return (
                         <div className="mt-3 space-y-3">
                            <div className="rounded-2xl border-2 border-green-400 bg-green-50 p-4 shadow-md">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">✓</div>
                                <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Student's Registered Email</span>
                              </div>
                              <div className="mt-2 text-lg font-black text-green-900 break-all">{matchedCandidate.email}</div>
                              <p className="mt-1 text-xs text-green-700 font-semibold">Offer will be sent to this email address</p>
                            </div>
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-gray-900 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-black text-blue-900">{matchedCandidate.name}</div>
                                <div className="text-xs text-blue-800/80">{matchedCandidate.rollNumber ? `Roll: ${matchedCandidate.rollNumber}` : 'No roll number'}</div>
                              </div>
                              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                                {matchedCandidate.applications?.length || 0} Applied
                              </span>
                            </div>
                            {matchedCandidate.applications?.length > 0 && (
                              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700 border border-blue-100">
                                Latest applications: {matchedCandidate.applications.slice(0, 3).map((application) => `${application.jobTitle}${application.companyName ? ` at ${application.companyName}` : ''}`).join(', ')}
                              </div>
                            )}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                              <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">Branch: {matchedCandidate.branch || 'N/A'}</div>
                              <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">CGPA: {matchedCandidate.cgpa || 'N/A'}</div>
                              <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">Phone: {matchedCandidate.phone || 'N/A'}</div>
                              <div className="rounded-lg bg-white px-2 py-2 border border-blue-100">Status: {matchedCandidate.placementStatus || 'N/A'}</div>
                            </div>
                            {matchedCandidate.skills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {matchedCandidate.skills.slice(0, 6).map((skill) => (
                                  <span key={skill} className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-900">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                         </div>
                         </div>
                      );
                   }
                   return null;
                })()}
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Company *</label>
                <input
                  value={offerForm.companyName}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Role Title *</label>
                <input
                  value={offerForm.roleTitle}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, roleTitle: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">CTC</label>
                <input
                  value={offerForm.ctc}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, ctc: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Offer Type</label>
                <select
                  value={offerForm.offerType}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, offerType: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="ppo">PPO</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Status</label>
                <select
                  value={offerForm.status}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="offered">Offered</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="interviewing">Interviewing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Result Date</label>
                <input
                  type="date"
                  value={offerForm.resultDate}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, resultDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-400 dark:text-blue-300 drop-shadow-md mb-1">Joining Date</label>
                <input
                  type="date"
                  value={offerForm.joiningDate}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, joiningDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleOfferSubmit}
                disabled={offerSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-60"
              >
                {offerSubmitting ? 'Saving...' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 text-xs uppercase font-black text-white dark:text-yellow-300 tracking-wider drop-shadow-lg">
              <th className="px-8 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Candidate</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Role</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Compensation</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Status</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Approver</th>
              <th className="px-6 py-5 text-left text-white dark:text-yellow-300 drop-shadow-lg">Expires</th>
              <th className="px-6 py-5 text-right text-white dark:text-yellow-300 drop-shadow-lg">Progress</th>
              <th className="px-6 py-5 text-right text-white dark:text-yellow-300 drop-shadow-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offersSource.map((offer) => (
              <tr key={offer.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                <td className="px-8 py-5 font-bold text-gray-900 dark:text-white drop-shadow-lg">{offer.candidateName}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-white drop-shadow-lg">{offer.position}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-white drop-shadow-lg">{offer.salary} <span className="block text-xs text-gray-600 dark:text-slate-400">{offer.bonus}</span></td>
                <td className="px-6 py-5 font-semibold text-gray-900 dark:text-white drop-shadow-lg">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 inline-block ${
                    offer.status === 'Accepted' ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-500/50' :
                    offer.status === 'Rejected' ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-500/50' :
                    offer.status === 'interview' ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500/50' :
                    'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-500/50'
                  }`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-700 dark:text-white drop-shadow-lg">{offer.approver}</td>
                <td className="px-6 py-5 text-gray-700 dark:text-white drop-shadow-lg">{offer.expiryDays > 0 ? `${offer.expiryDays} days` : 'Expired'}</td>
                <td className="px-6 py-5 text-right text-gray-700 dark:text-white drop-shadow-lg">
                  <div className="w-24 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${offer.progress}%` }} />
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Main dashboard content */}
    </div>
  );

  // 7. Enhanced Analytics (HR Dashboard Style)
  const renderAnalytics = (analyticsData = analytics) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
      {/* Main HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Active Job Postings" value={analyticsData?.activeJobPostings ?? '--'} color="text-blue-500" />
        <StatCard icon={FileText} label="Applications Received" value={analyticsData?.applicationsReceived ?? '--'} color="text-cyan-500" />
        <StatCard icon={Calendar} label="Interviews Scheduled" value={analyticsData?.interviewsScheduled ?? '--'} color="text-purple-500" />
        <StatCard icon={Award} label="Offers Extended" value={analyticsData?.offersExtended ?? '--'} color="text-amber-500" />
      </div>

      {/* Secondary HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Talent Pool" value={analyticsData?.talentPoolSize ?? '--'} color="text-emerald-500" />
        <StatCard icon={CheckCircle} label="Offer Acceptance" value={`${analyticsData?.acceptanceRate ?? '--'}%`} color="text-pink-500" />
        <StatCard icon={Clock} label="Pending Approvals" value={analyticsData?.pendingApprovals ?? '--'} color="text-lime-500" />
      </div>

      {/* HR Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-gray-200'}`}>
          <span className={`text-lg font-bold mb-3 block ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Application Status</span>
          {analyticsData?.applicationStatus?.data?.some((value) => value > 0) ? (
            <Doughnut
              data={{
                labels: analyticsData.applicationStatus.labels,
                datasets: [{
                  data: analyticsData.applicationStatus.data,
                  backgroundColor: ['#6366f1', '#22c55e', '#06b6d4', '#ef4444', '#f59e0b']
                }]
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: true }}
            />
          ) : <span className="text-blue-400">No application data</span>}
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-gray-200'}`}>
          <span className={`text-lg font-bold mb-3 block ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Branch Talent Distribution</span>
          {analyticsData?.branchDistribution?.labels?.length ? (
            <Bar
              data={{
                labels: analyticsData.branchDistribution.labels,
                datasets: [{
                  label: 'Candidates',
                  data: analyticsData.branchDistribution.data,
                  backgroundColor: '#8b5cf6'
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          ) : <span className="text-purple-400">No student branch data</span>}
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-gray-200'}`}>
          <span className={`text-lg font-bold mb-3 block ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Monthly Hiring Trend</span>
          {analyticsData?.monthlyHiringTrend?.labels?.length ? (
            <Line
              data={{
                labels: analyticsData.monthlyHiringTrend.labels,
                datasets: [{
                  label: 'Applications',
                  data: analyticsData.monthlyHiringTrend.data,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  fill: true,
                  tension: 0.35
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          ) : <span className="text-emerald-400">No trend data</span>}
        </div>
      </div>
    </div>
  );

  // 8. Enhanced Settings
  const renderSettings = () => {
    const isDarkTheme = resolvedTheme === 'dark';
    const sectionTitleClass = isDarkTheme ? 'text-white' : 'text-gray-900';
    const mutedTextClass = isDarkTheme ? 'text-slate-200' : 'text-gray-700';
    const cardClass = isDarkTheme
      ? 'bg-slate-900/75 border border-slate-700/70 rounded-2xl p-8'
      : 'bg-white border border-gray-300 rounded-2xl p-8 shadow-md';
    const rowClass = isDarkTheme
      ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
      : 'bg-white hover:bg-gray-50 border border-gray-300';
    const cardTitleClass = isDarkTheme ? 'text-white' : 'text-gray-900';
    const cardTextClass = isDarkTheme ? 'text-slate-200' : 'text-gray-700';
    const softPanelClass = isDarkTheme ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white border-gray-300';
    const softButtonClass = isDarkTheme
      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
      : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300';

    return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${sectionTitleClass}`}>HR Settings</h2>
          {(settingsSyncing || settingsStatus) && (
            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
              {settingsStatus || 'Saving...'}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-xl border ${isDarkTheme ? 'bg-slate-800/80 border-slate-600' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex items-center gap-1">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleThemeChange(id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  theme === id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkTheme
                      ? 'text-slate-200 hover:bg-slate-700'
                      : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <p className={`mt-1 px-1 text-[11px] ${mutedTextClass}`}>
            Active appearance: {resolvedTheme}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI & Automation */}
        <div className={`${cardClass} flex flex-col justify-between`}>
          <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 pb-6 ${isDarkTheme ? 'text-white border-b border-white/10' : 'text-gray-900 border-b border-gray-200'}`}>
            <Sparkles className="h-7 w-7 text-purple-400" /> AI & Automation
          </h3>
          <div className="space-y-6">
            {[
              { 
                key: 'autoResumeScreening', 
                label: 'Auto Resume Screening', 
                desc: 'AI automatically scores and ranks incoming resumes',
                icon: Brain
              },
              { 
                key: 'aiInterviewAssistant', 
                label: 'Real-time Interview Assistant', 
                desc: 'Live question suggestions and note-taking during interviews',
                icon: MessageSquare 
              },
              { 
                key: 'autoArchiveOldJobs', 
                label: 'Auto-archive Old Jobs', 
                desc: 'Automatically archive jobs inactive for 90+ days',
                icon: Archive 
              }
            ].map(({ key, label, desc, icon: Icon }) => (
              <div key={key} className={`flex items-center justify-between p-5 rounded-xl transition-all ${rowClass}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className={`font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>{desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleConfigToggle(key)}
                  className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${
                    config[key] 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25' 
                      : isDarkTheme
                        ? 'bg-slate-700 border border-slate-600/70'
                        : 'bg-gray-300 border border-gray-400'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${
                    config[key] ? 'left-8 translate-x-1' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Notifications & Security */}
        <div className={`${cardClass} flex flex-col justify-between`}>
          <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 pb-6 ${isDarkTheme ? 'text-white border-b border-white/10' : 'text-gray-900 border-b border-gray-200'}`}>
            <Shield className="h-7 w-7 text-emerald-400" /> Notifications & Security
          </h3>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email notifications for new applications', icon: Mail },
              { key: 'pushNotifications', label: 'Push notifications for interview reminders', icon: Bell },
              { key: 'weeklyHiringReports', label: 'Weekly hiring reports', icon: BarChart2 },
              { key: 'securityAlerts', label: 'Security alerts and audit logs', icon: Shield }
            ].map(({ key, label, icon: Icon }, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${rowClass}`}>
                <div className={`p-2.5 rounded-lg transition-all ${isDarkTheme ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-emerald-100 group-hover:bg-emerald-200'}`}>
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <span className={`font-medium flex-1 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{label}</span>
                <button
                  onClick={() => handleConfigToggle(key)}
                  className={`relative w-11 h-6 rounded-full shadow-inner transition-all ${
                    config[key]
                      ? 'bg-emerald-500/80'
                      : isDarkTheme
                        ? 'bg-slate-700 group-hover:bg-slate-600'
                        : 'bg-gray-300 group-hover:bg-gray-400'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200 ${config[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSV Data Management */}
      <div className={cardClass}>
        <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 pb-6 ${isDarkTheme ? 'text-white border-b border-white/10' : 'text-gray-900 border-b border-gray-200'}`}>
          <File className="h-7 w-7 text-blue-400" /> CSV Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border hover:border-blue-500/30 transition-all ${softPanelClass}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h4 className={`font-bold ${cardTitleClass}`}>Import Student Data</h4>
                <p className={`text-sm ${cardTextClass}`}>Upload CSV file with student records</p>
              </div>
            </div>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                className="hidden"
              />
            </label>
            <button
              onClick={handleDownloadStudentsCsv}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-center hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              Download CSV Export
            </button>
            <p className={`text-xs mt-3 ${cardTextClass}`}>
              Exports: {students.length} candidates from database
            </p>
          </div>

          <div className={`p-6 rounded-xl border hover:border-purple-500/30 transition-all ${softPanelClass}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <BarChart2 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h4 className={`font-bold ${cardTitleClass}`}>Export Analytics Report</h4>
                <p className={`text-sm ${cardTextClass}`}>Hiring metrics and statistics</p>
              </div>
            </div>
            <button
              onClick={() => {
                const reportData = `HR Analytics Report
Generated: ${new Date().toLocaleString()}

OVERVIEW METRICS
================
Jobs & Requisitions:  (+2 this week)
Talent Pool: 247 candidates (+15 this week)
Scheduled Interviews:  (+3 this week)
Offers Extended:  (+1 this week)
Onboarding:  candidates

PLACEMENT STATISTICS
====================
Total Students: ${students.length}
Placed: ${students.filter(s => s.placementStatus?.toLowerCase().includes('placed')).length}
Not Placed: ${students.filter(s => s.placementStatus?.toLowerCase().includes('not placed')).length}
Average CGPA: ${(students.reduce((sum, s) => sum + (parseFloat(s.cgpa) || 0), 0) / students.length).toFixed(2)}

Generated by HR Dashboard - Placement Management System`;

                const blob = new Blob([reportData], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hr-analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-center hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/25"
            >
              Download Report
            </button>
            <p className={`text-xs mt-3 ${cardTextClass}`}>
              Format: TXT with complete hiring analytics
            </p>
          </div>

          <div className={`p-6 rounded-xl border hover:border-amber-500/30 transition-all ${softPanelClass}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Database className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className={`font-bold ${cardTitleClass}`}>Bulk Operations</h4>
                <p className={`text-sm ${cardTextClass}`}>Import/Export bulk data</p>
              </div>
            </div>
            <div className="space-y-2">
              <input
                ref={interviewImportInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportInterviewSchedulesFileChange}
              />
              <button
                onClick={handleImportInterviewSchedulesClick}
                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all border ${softButtonClass}`}
              >
                Import Interview Schedules
              </button>
              <button
                onClick={handleExportPlacementResultsCsv}
                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all border ${softButtonClass}`}
              >
                Export Placement Results
              </button>
            </div>
            <p className={`text-xs mt-3 ${cardTextClass}`}>
              Batch process CSV files for efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Account & Integrations */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${cardClass}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Change Password', action: () => setShowProfileModal(true) },
                {
                  label: 'Two-Factor Authentication',
                  action: () => handleSecuritySettingToggle('twoFactorAuth', 'Two-Factor Authentication'),
                  status: config.twoFactorAuth ? 'Enabled' : 'Disabled',
                  statusOn: config.twoFactorAuth
                },
                {
                  label: 'Manage API Keys',
                  action: () => handleSecuritySettingToggle('apiKeyManagement', 'API key management'),
                  status: config.apiKeyManagement ? 'Enabled' : 'Disabled',
                  statusOn: config.apiKeyManagement
                },
                { label: 'Download Data Export', action: handleDownloadStudentsCsv }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all group ${softPanelClass}`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <File className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`font-medium ${cardTitleClass}`}>{item.label}</span>
                    {item.status && (
                      <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.statusOn ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40' : 'text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Integrations</h3>
            <div className="space-y-4">
              {[
                { name: 'Greenhouse', icon: DatabaseIcon, status: 'Connected' },
                { name: 'Lever', icon: DatabaseIcon, status: 'Connect' },
                { name: 'Workable', icon: DatabaseIcon, status: 'Connect' }
              ].map(({ name, icon: Icon, status }, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${softPanelClass}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl border-2 border-blue-500/30">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className={`font-medium ${cardTitleClass}`}>{name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    status === 'Connected'
                      ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40'
                      : 'text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // ...existing code...

  // Analytics loading/fallback/error UI
  const renderAnalyticsSection = () => {
    if (analyticsLoading) {
      return <div className="flex justify-center items-center h-96 text-xl text-blue-500 font-bold">Loading analytics...</div>;
    }
    if (!analytics) {
      return <div className="flex flex-col justify-center items-center h-96 text-xl text-red-500 font-bold">Analytics data unavailable.<br/>Please check backend connection.</div>;
    }
    return renderAnalytics(analytics);
  };
  // Floating chat/help button for Interviews section only
  const renderChatHelpButton = () => (
    <div className="absolute bottom-8 right-8 z-30">
      <button className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 shadow-xl focus:outline-none">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.6C3.67 15.4 3 13.76 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );

  // 9. View Applications
  const renderApplications = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">All Applications</h2>
          <p className="text-gray-600 dark:text-slate-300 mt-1 font-bold text-lg">View and manage all student job applications</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-900 border-b-2 border-gray-300 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Position</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {(app.student?.user?.name || app.student?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{app.student?.user?.name || app.student?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{app.student?.user?.email || app.student?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-slate-300">{app.job?.position || app.job?.title || 'N/A'}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-600 dark:text-slate-400">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 inline-block ${
                        app.status === 'accepted' ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-500/50' :
                        app.status === 'rejected' ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-500/50' :
                        app.status === 'interview' ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500/50' :
                        'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-500/50'
                      }`}>
                        {app.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApplicationStatusUpdate(app._id, 'accepted')}
                          disabled={app.status === 'accepted'}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-black transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleApplicationStatusUpdate(app._id, 'interview')}
                          disabled={app.status === 'interview'}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-black transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Interview
                        </button>
                        <button 
                          onClick={() => handleApplicationStatusUpdate(app._id, 'rejected')}
                          disabled={app.status === 'rejected'}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-black transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500 dark:text-slate-400">
                    <div className="space-y-3">
                      <div className="text-6xl">📋</div>
                      <p className="font-bold text-lg">No applications yet</p>
                      <p className="text-sm opacity-75">Student applications will appear here when they apply for jobs</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 10. Job Requisitions Management
  const renderJobRequisitions = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Custom Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div key="total-requisitions" className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-6 text-slate-900 border border-sky-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="h-12 w-12 text-sky-700" />
            <div className="text-right">
              <p className="text-sm font-bold tracking-wide text-slate-600">Total Requisitions</p>
              <p className="text-4xl font-black">{jobRequisitions.length}</p>
            </div>
          </div>
          <div className="h-2 bg-sky-200 rounded-full mt-4">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div key="open-positions" className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 text-slate-900 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-12 w-12 text-emerald-700" />
            <div className="text-right">
              <p className="text-sm font-bold tracking-wide text-slate-600">Open Positions</p>
              <p className="text-4xl font-black">{jobRequisitions.filter(r => ['open', 'review', 'approved', 'published'].includes(String(r.status || '').toLowerCase())).length}</p>
            </div>
          </div>
          <div className="h-2 bg-emerald-200 rounded-full mt-4">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div key="total-positions" className="bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl p-6 text-slate-900 border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-12 w-12 text-indigo-700" />
            <div className="text-right">
              <p className="text-sm font-bold tracking-wide text-slate-600">Total Positions</p>
              <p className="text-4xl font-black">{jobRequisitions.reduce((sum, r) => sum + (r.numberOfPositions || 0), 0)}</p>
            </div>
          </div>
          <div className="h-2 bg-indigo-200 rounded-full mt-4">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div key="applications-count" className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 text-slate-900 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-12 w-12 text-amber-700" />
            <div className="text-right">
              <p className="text-sm font-bold tracking-wide text-slate-600">Applications</p>
              <p className="text-4xl font-black">{applications.length}</p>
            </div>
          </div>
          <div className="h-2 bg-amber-200 rounded-full mt-4">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">Job Requisitions</h2>
          <p className="text-slate-600 mt-1 font-semibold text-lg">Create and manage job requisitions</p>
        </div>
        <button 
          onClick={() => setShowJobRequisitionModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" /> New Requisition
        </button>
      </div>

      <div className="grid gap-6">
        {jobRequisitions.length > 0 ? (
          jobRequisitions.map((req) => (
            <div key={req._id} className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-sky-300 transition-all shadow-sm hover:shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent transition-all mb-1">
                        {req.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" /> {req.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {req.numberOfPositions} positions
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                    <div key={`${req._id}-location`}>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Location</p>
                      <p className="font-semibold text-slate-800">{req.location}</p>
                    </div>
                    <div key={`${req._id}-type`}>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Type</p>
                      <p className="font-semibold text-slate-800">{req.employmentType}</p>
                    </div>
                    <div key={`${req._id}-experience`}>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Experience</p>
                      <p className="font-semibold text-slate-800">{req.experience?.min || 0} - {req.experience?.max || 5} years</p>
                    </div>
                    <div key={`${req._id}-priority`} className="text-right">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        req.priority === 'Critical' ? 'text-red-400' : 
                        req.priority === 'High' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {req.priority}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap items-center justify-center gap-2 p-3 w-full min-w-0 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl shadow-inner mt-4">
                  <button 
                    onClick={() => openEditJobRequisitionModal(req)}
                    className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Edit className="h-5 w-5" /> Edit
                  </button>
                  <button
                    onClick={() => advanceRequisitionWorkflow(req)}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                    title="Move to next workflow stage"
                  >
                    {String(req.status || '').toLowerCase() === 'published' ? 'Published' : `Move to ${getNextRequisitionStatus(req.status)}`}
                  </button>
                  <button 
                    onClick={() => viewRequisitionApplications(req)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    title="View Applications"
                  >
                    <Eye className="h-5 w-5" /> Applications
                  </button>
                  <button 
                    onClick={() => downloadRequisitionPDF(req)}
                    className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white transition-all shadow-md"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
            <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-70" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No job requisitions</h3>
            <p className="text-slate-500 mb-6">Create your first job requisition to get started</p>
            <button 
              onClick={() => setShowJobRequisitionModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all"
            >
              Create Requisition
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Profile with Inline Editing
  const renderProfile = () => {
  const handleSaveProfile = async () => {
    try {
      setProfileSubmitting(true);
      const response = await statsAPI.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar: profileForm.avatar
      });
      if (response.data.success) {
        setEditMode(false);
        alert('Profile updated successfully!');
      }
    } finally {
      setProfileSubmitting(false);
    }
  };
  return (
    <div className="space-y-8">
      {/* Header + Theme Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            My Profile
          </h2>
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage your personal information and settings
          </p>
        </div>
        {/* Theme Switcher */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-900 rounded-xl px-4 py-2 shadow">
          <span className="font-semibold text-sm text-gray-700 dark:text-slate-300 mr-2">Theme:</span>
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`p-2 rounded-lg transition-all border-2 ${
                theme === t.id
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                  : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white border-transparent hover:border-blue-400'
              }`}
              title={t.label}
            >
              <t.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
      {/* Profile Actions */}
      <div className="flex gap-4 mt-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleExport}
        >
          Export
        </button>
        {editMode ? (
          <>
            <button
              onClick={() => {
                setEditMode(false);
                setProfileForm({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  avatar: user?.avatar || ''
                });
              }}
              className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={profileSubmitting}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {profileSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Profile
          </button>
        )}
      </div>
      {/* Profile Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Personal Information */}
        <div className={`p-8 rounded-3xl ${isDark ? 'bg-slate-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            Personal Information
          </h3>
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <ImageCropUpload
                currentImage={profileForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
                userName={profileForm.name || user?.name || 'User'}
                onImageUpdate={(imageData) => {
                  setProfileForm({ ...profileForm, avatar: imageData });
                  if (user) {
                    user.avatar = imageData;
                  }
                }}
              />
            </div>
            {/* Name */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-slate-800 border border-white/10 text-white' : 'bg-gray-100 border border-gray-300 text-gray-900'}`}
                disabled={!editMode}
              />
            </div>
            {/* Phone */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-slate-800 border border-white/10 text-white' : 'bg-gray-100 border border-gray-300 text-gray-900'}`}
                disabled={!editMode}
              />
            </div>
          </div>
        </div>
        {/* ...other profile sections... */}
      </div>
    </div>
  );
}

  if (!mounted) return null;

  // Onboarding View Renderer
  const renderOnboarding = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white drop-shadow-lg">Onboarding Management</h2>
          <p className="text-gray-900 dark:text-slate-300 mt-1">Track onboarding progress for new hires</p>
        </div>
        <button
          onClick={openCreateOnboardingModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus className="h-4 w-4" /> New Onboarding
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 dark:bg-slate-900 text-xs uppercase font-bold text-gray-900 dark:text-yellow-300 tracking-wider drop-shadow-lg">
              <th className="px-8 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Employee</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Position</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Department</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Join Date</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Buddy</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Progress</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Tasks</th>
              <th className="px-6 py-5 text-left text-gray-900 dark:text-yellow-300 drop-shadow-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {onboardingSource.map((onb) => (
              <tr key={onb._id || onb.id} className="border-b border-white/10 hover:bg-white/5 dark:hover:bg-slate-800 transition-all">
                <td className="px-8 py-5 font-bold text-gray-900 dark:text-white drop-shadow-lg">{onb.employeeName}<div className="text-xs text-slate-400 dark:text-blue-300">{onb.email}</div></td>
                <td className="px-6 py-5 text-gray-900 dark:text-white drop-shadow-lg">{onb.position}</td>
                <td className="px-6 py-5 text-gray-900 dark:text-white drop-shadow-lg">{onb.department}</td>
                <td className="px-6 py-5 text-gray-900 dark:text-white drop-shadow-lg">{formatDateSafe(onb.joinDate)}</td>
                <td className="px-6 py-5 text-gray-900 dark:text-white drop-shadow-lg">{onb.buddy}</td>
                <td className="px-6 py-5">
                  <div className="w-24 h-3 bg-white/10 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Number(onb.progress) || 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-blue-300 ml-2">{Number(onb.progress) || 0}%</span>
                </td>
                <td className="px-6 py-5">
                  <ul className="space-y-1">
                    {(onb.tasks || []).map((task, i) => (
                      <li key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold mr-2 mb-1 ${task.status === 'done' ? 'bg-emerald-600/80 text-white' : task.status === 'in-progress' ? 'bg-amber-500/80 text-white' : 'bg-slate-700/80 text-slate-200 dark:text-blue-200'}`}>
                        {task.name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => openEditOnboardingModal(onb)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showOnboardingModal || showEditOnboardingModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} w-full max-w-3xl rounded-2xl p-6 border shadow-2xl transition-colors`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingOnboardingId ? 'Edit Onboarding' : 'Create New Onboarding'}</h3>
              <button
                onClick={() => {
                  setShowOnboardingModal(false);
                  setShowEditOnboardingModal(false);
                  setEditingOnboardingId(null);
                  setOnboardingError('');
                }}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {onboardingError && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-red-100 border border-red-200 text-red-700'}`}>
                {onboardingError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Employee Name *</label>
                <input
                  type="text"
                  value={onboardingForm.employeeName}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, employeeName: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Email</label>
                <input
                  type="email"
                  value={onboardingForm.email}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, email: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Position *</label>
                <input
                  type="text"
                  value={onboardingForm.position}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, position: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Department</label>
                <input
                  type="text"
                  value={onboardingForm.department}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, department: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Join Date</label>
                <input
                  type="date"
                  value={onboardingForm.joinDate}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, joinDate: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Buddy</label>
                <input
                  type="text"
                  value={onboardingForm.buddy}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, buddy: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={onboardingForm.progress}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, progress: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold drop-shadow-lg mb-1 ${isDark ? 'text-yellow-300' : 'text-gray-800'}`}>Tasks (one task per line)</label>
                <textarea
                  rows={5}
                  value={onboardingForm.tasksText}
                  onChange={(event) => setOnboardingForm({ ...onboardingForm, tasksText: event.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold drop-shadow-lg placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-800 border-yellow-300/40 text-yellow-200 placeholder-yellow-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  placeholder={'NDA signed\nLaptop setup\nTeam introduction'}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowOnboardingModal(false);
                  setShowEditOnboardingModal(false);
                  setEditingOnboardingId(null);
                  setOnboardingError('');
                }}
                className={`px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardingSubmit}
                disabled={onboardingSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold"
              >
                {onboardingSubmitting ? 'Saving...' : editingOnboardingId ? 'Update Onboarding' : 'Create Onboarding'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const renderSmartHiring = () => {
      const matchRows = buildAiMatchRows();
      const filteredRows = matchRows.filter((row) => {
        const normalizedSearch = smartSearchTerm.trim().toLowerCase();
        const matchesSearch = !normalizedSearch
          || row.candidateName.toLowerCase().includes(normalizedSearch)
          || row.jobTitle.toLowerCase().includes(normalizedSearch)
          || row.matchedSkills.join(' ').toLowerCase().includes(normalizedSearch);
        const matchesStatus = smartStatusFilter === 'all' || row.status === smartStatusFilter;
        return matchesSearch && matchesStatus;
      });

      const selectedCount = selectedApplicantIds.length;
      const acceptedOffers = offers.filter((offer) => String(offer?.status || '').toLowerCase() === 'accepted').length;
      const pendingOffers = offers.filter((offer) => String(offer?.status || '').toLowerCase() === 'offered').length;
      const joiningInProgress = onboardingTasks.filter((task) => Number(task?.progress || 0) < 100).length;
      const profileCompletenessAverage = students.length > 0
        ? Math.round(students.reduce((sum, student) => sum + calculateProfileCompleteness(student), 0) / students.length)
        : 0;

      const slaRows = computeSlaRows();

      const visibleIds = filteredRows.map((row) => row.application?._id).filter(Boolean);
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedApplicantIds.includes(id));

      return (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>GenAI Hiring Hub</h2>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mt-1`}>AI match scoring, pipeline automation, SLA alerts, exports, and hiring intelligence.</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Role: <span className="font-semibold uppercase">{normalizedRole || 'staff'}</span> | Approvals: {currentPermissions.canApprove ? 'Enabled' : 'Read-only'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={generateGenAIHiringInsight}
                disabled={aiHiringLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold flex items-center gap-2"
              >
                <Brain className="h-4 w-4" /> {aiHiringLoading ? 'Generating...' : 'Generate GenAI Insight'}
              </button>
              <button
                onClick={exportSmartHiringReport}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Center
              </button>
              <button
                onClick={buildInterviewSchedulerInsights}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                Suggest Interview Slots
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className="text-xs uppercase font-bold tracking-wider text-emerald-500">AI Match Score</p>
              <p className="text-3xl font-black mt-1">{matchRows[0]?.score || 0}%</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Top candidate match for active roles</p>
            </div>
            <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className="text-xs uppercase font-bold tracking-wider text-amber-500">Pipeline Automation</p>
              <p className="text-3xl font-black mt-1">{selectedCount}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Applicants selected for bulk action</p>
            </div>
            <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className="text-xs uppercase font-bold tracking-wider text-cyan-500">Offer & Joining Tracker</p>
              <p className="text-3xl font-black mt-1">{acceptedOffers}/{offers.length || 0}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Accepted offers • {joiningInProgress} onboarding in progress</p>
            </div>
            <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className="text-xs uppercase font-bold tracking-wider text-rose-500">SLA Dashboard</p>
              <p className="text-3xl font-black mt-1">{slaRows.length}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Applications pending for more than 3 days</p>
            </div>
          </div>

          {aiHiringInsight && (
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-purple-900/20 border-purple-700/40 text-purple-100' : 'bg-purple-50 border-purple-200 text-purple-900'}`}>
              <h3 className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4" /> GenAI Recommendations</h3>
              <p className="whitespace-pre-wrap text-sm mt-2 leading-relaxed">{aiHiringInsight}</p>
            </div>
          )}

          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-500" /> GenAI Studio (Backend Connected)</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Run all GenAI features: matching, interview prep, readiness, outreach, risk, JD parsing, review, analytics, and knowledge base.</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${genAIStudioLoading ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {genAIStudioLoading ? 'Running...' : 'Ready'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
              <input
                value={genAIStudioInput.roleTitle}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, roleTitle: event.target.value }))}
                placeholder="Role title"
                className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                value={genAIStudioInput.company}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, company: event.target.value }))}
                placeholder="Company"
                className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={genAIStudioInput.tone}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, tone: event.target.value }))}
                className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="strict">Strict</option>
              </select>
              <select
                value={genAIStudioInput.channel}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, channel: event.target.value }))}
                className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="email">Email</option>
                <option value="in-app">In-App</option>
                <option value="sms">SMS</option>
              </select>
              <input
                value={genAIStudioInput.context}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, context: event.target.value }))}
                placeholder="Outreach context"
                className={`px-3 py-2 rounded-xl border text-sm md:col-span-2 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                value={genAIStudioInput.kbQuestion}
                onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, kbQuestion: event.target.value }))}
                placeholder="Knowledge base question"
                className={`px-3 py-2 rounded-xl border text-sm md:col-span-2 xl:col-span-3 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {[['resume-match', 'Resume Match'], ['interview-questions', 'Interview Qs'], ['readiness-plan', 'Readiness Plan'], ['outreach-draft', 'Outreach Draft'], ['risk-prediction', 'Risk Prediction'], ['jd-parse', 'JD Parser'], ['application-review', 'App Review'], ['analytics-narrative', 'Analytics Story'], ['knowledge-base', 'KB Answer']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => runGenAIStudioAction(key)}
                  disabled={genAIStudioLoading}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {Object.entries(genAIStudioOutput).length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Run any GenAI action to view backend response.</p>
              ) : Object.entries(genAIStudioOutput).map(([key, value]) => (
                <div key={key} className={`p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-xs uppercase font-black mb-2">{key.replace('-', ' ')}</p>
                  <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className={`xl:col-span-2 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'} p-4`}>
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
                <h3 className="font-bold text-lg">Advanced Search + Bulk Actions</h3>
                <div className="flex gap-2">
                  <input
                    value={smartSearchTerm}
                    onChange={(event) => setSmartSearchTerm(event.target.value)}
                    placeholder="Search by candidate, role, or skills"
                    className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <select
                    value={smartStatusFilter}
                    onChange={(event) => setSmartStatusFilter(event.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  onClick={() => runBulkPipelineAction('shortlisted')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Shortlist Selected
                </button>
                <button
                  onClick={() => runBulkPipelineAction('selected')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  Mark Selected
                </button>
                <button
                  onClick={() => runBulkPipelineAction('rejected')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                >
                  Reject Selected
                </button>
                <span className={`text-xs ml-auto ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{filteredRows.length} applicants</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isDark ? 'text-slate-300' : 'text-gray-700'} border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className="text-left py-2"><input type="checkbox" checked={allVisibleSelected} onChange={() => {
                        if (allVisibleSelected) {
                          setSelectedApplicantIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
                        } else {
                          setSelectedApplicantIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
                        }
                      }} /></th>
                      <th className="text-left py-2">Candidate</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Match</th>
                      <th className="text-left py-2">Profile</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 20).map((row) => {
                      const appId = row.application?._id;
                      return (
                        <tr key={appId || `${row.candidateName}-${row.jobTitle}`} className={`border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                          <td className="py-2"><input type="checkbox" checked={appId ? selectedApplicantIds.includes(appId) : false} onChange={() => appId && toggleApplicantSelection(appId)} /></td>
                          <td className="py-2 font-semibold">{row.candidateName}</td>
                          <td className="py-2">{row.jobTitle}</td>
                          <td className="py-2 capitalize">{row.status}</td>
                          <td className="py-2 font-bold text-blue-500">
                            {row.score}%
                            <div className="text-[10px] font-medium text-slate-500 mt-0.5">{row.explainability}</div>
                          </td>
                          <td className="py-2">{row.profileScore}%</td>
                          <td className="py-2">
                            <button
                              onClick={() => generateOfferLetterPdf(row.candidateName, row.jobTitle)}
                              className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
                              disabled={!currentPermissions.canGenerateOffer}
                            >
                              Offer PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold mb-3">Notification Preferences</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(notificationPreferences).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between gap-2">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => {
                          setNotificationPreferences((prev) => ({ ...prev, [key]: event.target.checked }));
                          pushFeatureActivity('Notification Preference', `${key} set to ${event.target.checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold mb-2">Profile Completeness</h3>
                <p className="text-3xl font-black text-indigo-500">{profileCompletenessAverage}%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Average student profile quality score</p>
              </div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold mb-2">Offer & Joining Snapshot</h3>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-900' : 'text-gray-900'}`}>
                  <li>Pending Offers: <strong>{pendingOffers}</strong></li>
                  <li>Accepted Offers: <strong>{acceptedOffers}</strong></li>
                  <li>Onboarding In Progress: <strong>{joiningInProgress}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-3">Recruiter Response SLA Alerts</h3>
              {slaRows.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No SLA risks currently.</p>
              ) : (
                <div className="space-y-2">
                  {slaRows.map((row) => (
                    <div key={row.id} className={`p-3 rounded-xl border ${isDark ? 'border-amber-700/50 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
                      <p className="font-semibold">{row.candidate} • {row.role}</p>
                      <p className="text-xs">Pending {row.ageInDays} days ({row.status})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-3">Activity Timeline</h3>
              {featureActivity.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No activity yet. Run a bulk action or generate GenAI insight.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {featureActivity.map((entry) => (
                    <div key={entry.id} className={`p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-gray-200 bg-gray-50'}`}>
                      <p className="text-sm font-semibold">{entry.action}</p>
                      <p className="text-xs mt-1">{entry.detail}</p>
                      <p className="text-[10px] mt-1 opacity-70">{new Date(entry.time).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-3">Candidate Kanban Board</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {pipelineStages.map((stage) => {
                  const stageRows = filteredRows.filter((row) => getEffectiveApplicationStage(row.application) === stage);
                  return (
                    <div
                      key={stage}
                      className={`rounded-xl border p-2 min-h-[180px] ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedApplicationId) moveApplicationStage(draggedApplicationId, stage);
                        setDraggedApplicationId(null);
                      }}
                    >
                      <p className="text-xs uppercase font-bold tracking-wide mb-2">{stage}</p>
                      <div className="space-y-2">
                        {stageRows.slice(0, 5).map((row) => {
                          const appId = row.application?._id;
                          return (
                            <div
                              key={`${stage}-${appId || row.candidateName}`}
                              draggable={Boolean(appId)}
                              onDragStart={() => setDraggedApplicationId(appId)}
                              className={`p-2 rounded-lg border text-xs cursor-move ${isDark ? 'border-slate-600 bg-slate-900/70' : 'border-gray-200 bg-white'}`}
                            >
                              <p className="font-semibold">{row.candidateName}</p>
                              <p className="opacity-80">{row.jobTitle}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-3">Interview Intelligence + Offer Approval</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold mb-1">Suggested Slots</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {suggestedInterviewSlots.length === 0 ? (
                      <p className="text-xs opacity-70">Click "Suggest Interview Slots" to generate.</p>
                    ) : suggestedInterviewSlots.map((slot, idx) => (
                      <div key={`${slot.date}-${slot.startTime}-${idx}`} className={`text-xs p-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-gray-200 bg-gray-50'}`}>
                        {slot.date} at {slot.startTime}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Conflict Alerts</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {interviewConflicts.length === 0 ? (
                      <p className="text-xs opacity-70">No conflicts currently.</p>
                    ) : interviewConflicts.map((conflict, idx) => (
                      <div key={`${conflict.date}-${conflict.startTime}-${idx}`} className={`text-xs p-2 rounded-lg border ${isDark ? 'border-rose-700/50 bg-rose-900/20' : 'border-rose-200 bg-rose-50'}`}>
                        {conflict.date} {conflict.startTime} - {conflict.reason}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {jobRequisitions.slice(0, 5).map((req) => (
                  <div key={req._id} className={`p-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}>
                    <p className="text-sm font-semibold">{req.title}</p>
                    <p className="text-xs opacity-80">Status: {req.status || 'draft'}</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => advanceRequisitionApproval(req, 'approve')} className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">Approve +1</button>
                      <button onClick={() => advanceRequisitionApproval(req, 'reject')} className="px-2 py-1 rounded bg-rose-600 text-white text-xs">Reset</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Hiring Forecast</h3>
              <p className="text-xs opacity-80">Predicted fill time based on current open roles.</p>
              <p className="text-3xl font-black mt-2 text-blue-500">
                {Math.max(7, Math.round((jobs.filter((job) => String(job.status || '').toLowerCase() === 'active').length || 1) * 4.5))} days
              </p>
              <p className="text-xs mt-1 opacity-70">Projection updates with active jobs and pipeline movement.</p>
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Recruiter Performance</h3>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {Object.entries(
                  interviews.reduce((acc, item) => {
                    const name = item.interviewer || 'Unassigned';
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 6).map(([name, count]) => (
                  <div key={name} className={`text-xs p-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}>
                    {name}: <span className="font-bold">{count}</span> interviews
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Job Health Score</h3>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {jobs.slice(0, 6).map((job) => {
                  const views = Number(job.views || 0);
                  const apps = Number(job.applications || 0);
                  const score = views > 0 ? Math.min(100, Math.round((apps / views) * 1000)) : 0;
                  return (
                    <>
                      <div key={job._id || job.id} className={`text-xs p-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}>
                        {(job.title || job.position || 'Role').slice(0, 24)}: <span className="font-bold text-emerald-500">{score}</span>/100
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Candidate Portal Messaging</h3>
              <select
                value={selectedCommunicationCandidate}
                onChange={(event) => setSelectedCommunicationCandidate(event.target.value)}
                className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">Select candidate</option>
                {students.slice(0, 50).map((student) => (
                  <option key={student._id || student.id} value={student._id || student.id}>{student.name || student.email || 'Candidate'}</option>
                ))}
              </select>
              <div className="flex gap-2 mb-2">
                <select value={communicationType} onChange={(event) => setCommunicationType(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value="email">Email</option>
                  <option value="in-app">In-App</option>
                  <option value="sms">SMS</option>
                </select>
                <button onClick={sendCommunicationLog} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">Send</button>
              </div>
              <textarea value={communicationMessage} onChange={(event) => setCommunicationMessage(event.target.value)} rows={4} placeholder="Write message" className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                {communicationLogs.slice(0, 5).map((entry) => (
                  <p key={entry.id} className="text-xs opacity-80">[{entry.type}] {entry.message}</p>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Auto JD Enhancer + Compliance</h3>
              <select value={selectedJdJobId} onChange={(event) => setSelectedJdJobId(event.target.value)} className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                <option value="">Select job</option>
                {jobs.slice(0, 40).map((job) => (
                  <option key={job._id || job.id} value={job._id || job.id}>{job.title || job.position || 'Role'} - {job.company || 'Company'}</option>
                ))}
              </select>
              <button onClick={generateJdEnhancement} disabled={jdEnhancing} className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold w-full">
                {jdEnhancing ? 'Enhancing...' : 'Enhance JD'}
              </button>
              <div className={`mt-2 p-2 rounded-lg border text-xs whitespace-pre-wrap max-h-24 overflow-y-auto ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-gray-200 bg-gray-50'}`}>
                {jdEnhancement || 'Enhanced description will appear here.'}
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(complianceChecklist).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between text-xs">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input type="checkbox" checked={Boolean(value)} onChange={(event) => setComplianceChecklist((prev) => ({ ...prev, [key]: event.target.checked }))} />
                  </label>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold mb-2">Integration/Webhook Center</h3>
              <input
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://example.com/webhook"
                className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="password"
                value={webhookSecret}
                onChange={(event) => setWebhookSecret(event.target.value)}
                placeholder="Webhook secret (optional)"
                className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {Object.entries(webhookEvents).map(([eventName, enabled]) => (
                <label key={eventName} className="flex items-center justify-between text-xs mb-1">
                  <span>{eventName.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(enabled)}
                    onChange={(event) => setWebhookEvents((prev) => ({ ...prev, [eventName]: event.target.checked }))}
                  />
                </label>
              ))}
              {webhookLastStatus && (
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{webhookLastStatus}</p>
              )}
              <button
                onClick={sendWebhookTest}
                disabled={webhookSending}
                className="mt-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold w-full"
              >
                {webhookSending ? 'Sending...' : 'Send Test Webhook'}
              </button>
              <button onClick={scheduleSmartReport} className="mt-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold w-full">Schedule Report ({reportSchedule.frequency})</button>
              <button onClick={rollbackLastAudit} disabled={!currentPermissions.canRollback} className="mt-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold w-full">Rollback Last Audit</button>
            </div>
          </div>
        </div>
      );
    };

    switch(currentView) {
      case 'overview': return renderOverview();
      case 'profile': return renderProfile();
      case 'jobs': return renderJobsAndReqs();
      case 'talent': return renderTalent();
      case 'interviews': return renderInterviews();
      case 'offers': return renderOffers();
      case 'onboarding': return renderOnboarding();
      case 'applications': return renderApplications();
      case 'requisitions': return renderJobRequisitions();
      case 'smart-hiring': return renderSmartHiring();
      case 'analytics':
        // Fix: Prevent blank page if analytics fails or is empty
        if (analyticsLoading) {
          return (
            <div className="flex items-center justify-center min-h-[300px]">
              <span className="text-lg text-blue-500 font-bold">Loading analytics...</span>
            </div>
          );
        } else if (!analytics || Object.keys(analytics).length === 0) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-red-500 font-bold text-lg">
              Analytics data unavailable.<br/>Please check backend connection.
            </div>
          );
        } else {
          return renderAnalytics(analytics);
        }
      case 'settings': return renderSettings();
      case 'exam-desk': return <ExamDesk />;
      default: return renderOverview();
    }
  };

  if (!mounted) return null;

  const sidebarWidth = isSidebarOpen ? 280 : 80;
  const sidebarMinWidth = isSidebarOpen ? 220 : 60;
  // Changed sidebar/nav color from blue to teal
  const navItemClass = (isActive) => `flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-6' : 'justify-center px-2'} py-3 rounded-xl font-semibold transition-all text-left ${isActive ? 'bg-teal-700 text-white' : 'hover:bg-teal-900/30 text-white/80'}`;
  const handleManualLogout = () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?');
    if (!shouldLogout) return;
    if (logout) logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <div className={`hr-dashboard min-h-screen font-sans transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white' 
          : 'bg-gradient-to-br from-teal-50 via-white to-green-50 text-gray-900'
      }`}>
        {/* Enhanced Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 shadow-2xl transition-all duration-500 flex flex-col ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900/80 text-white'
              : 'bg-gradient-to-b from-slate-600 to-blue-700 text-white'
          }`}
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarMinWidth}px`, maxWidth: '100vw', overflow: 'hidden' }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/vrd-logo.svg" alt="VRD Logo" className="h-9 w-9 rounded-lg bg-white p-1 object-contain" />
              {isSidebarOpen && (
                <span className="text-xl font-extrabold tracking-wide">HR Dashboard</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-white/10 text-white/80'}`}
              title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              <span className="sr-only">Toggle Sidebar</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 12L6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Sidebar Navigation Menu */}
          <nav className="flex-1 min-h-0 overflow-y-auto scroll-smooth flex flex-col gap-2 mt-4 px-2 pb-4">
            {/* ...existing nav buttons... */}
            <button
              className={navItemClass(currentView === 'overview')}
              onClick={() => setCurrentView('overview')}
              title={t('overview')}
            >
              <LayoutDashboard className="h-5 w-5" /> {isSidebarOpen && t('overview')}
            </button>
            <button
              className={navItemClass(currentView === 'jobs')}
              onClick={() => setCurrentView('jobs')}
              title={t('jobsAndReqs')}
            >
              <Briefcase className="h-5 w-5" /> {isSidebarOpen && t('jobsAndReqs')}
            </button>
            <button
              className={navItemClass(currentView === 'talent')}
              onClick={() => setCurrentView('talent')}
              title={t('talentPool')}
            >
              <Users className="h-5 w-5" /> {isSidebarOpen && t('talentPool')}
            </button>
            <button
              className={navItemClass(currentView === 'interviews')}
              onClick={() => setCurrentView('interviews')}
              title={t('interviews')}
            >
              <Users2 className="h-5 w-5" /> {isSidebarOpen && t('interviews')}
            </button>
            <button
              className={navItemClass(currentView === 'offers')}
              onClick={() => setCurrentView('offers')}
              title={t('offers')}
            >
              <CheckCircle className="h-5 w-5" /> {isSidebarOpen && t('offers')}
            </button>
            <button
              className={navItemClass(currentView === 'onboarding')}
              onClick={() => setCurrentView('onboarding')}
              title={t('onboarding')}
            >
              <Award className="h-5 w-5" /> {isSidebarOpen && t('onboarding')}
            </button>
            <button
              className={navItemClass(currentView === 'applications')}
              onClick={() => setCurrentView('applications')}
              title={t('applications')}
            >
              <FileText className="h-5 w-5" /> {isSidebarOpen && t('applications')}
            </button>
            <button
              className={navItemClass(currentView === 'smart-hiring')}
              onClick={() => setCurrentView('smart-hiring')}
              title={t('genaiHiringHub')}
            >
              <Brain className="h-5 w-5" /> {isSidebarOpen && t('genaiHiringHub')}
            </button>
            <button
              className={navItemClass(currentView === 'analytics')}
              onClick={() => setCurrentView('analytics')}
              data-testid="analytics-sidebar-btn"
              title={t('analytics')}
            >
              <BarChart2 className="h-5 w-5" /> {isSidebarOpen && t('analytics')}
            </button>
            <button
              className={navItemClass(currentView === 'settings')}
              onClick={() => setCurrentView('settings')}
              title={t('settings')}
            >
              <Settings className="h-5 w-5" /> {isSidebarOpen && t('settings')}
            </button>
            <button
              className={navItemClass(currentView === 'profile')}
              onClick={() => setCurrentView('profile')}
              title={t('profile')}
            >
              <User className="h-5 w-5" /> {isSidebarOpen && t('profile')}
            </button>
            <button
              className={navItemClass(currentView === 'exam-desk')}
              onClick={() => setCurrentView('exam-desk')}
              title={t('examDesk')}
            >
              <Award className="h-5 w-5" /> {isSidebarOpen && t('examDesk')}
            </button>
          </nav>
          <div className="px-2 pb-6 pt-2 border-t border-white/10">
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-6 justify-start' : 'justify-center px-2'} py-3 rounded-xl font-semibold transition-all text-left hover:bg-red-600/80 text-white/90`}
              onClick={handleManualLogout}
              title={t('signOut')}
            >
              <LogOut className="h-5 w-5" /> {isSidebarOpen && t('signOut')}
            </button>
          </div>
        </aside>
        <div className="transition-all duration-500" style={{ marginLeft: `${sidebarWidth}px` }}>
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 py-4 shadow-sm">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <Layers className="h-6 w-6" />
            </button>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard')} (HR)</h1>
              <div className={`text-base font-semibold capitalize mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {currentView === 'jobs' ? t('jobsAndReqs') :
                 currentView === 'talent' ? t('talentPool') :
                 currentView === 'smart-hiring' ? t('genaiHiringHub') :
                 currentView === 'exam-desk' ? t('examDesk') :
                 t(currentView)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <LanguageSelector currentColors={{ input: isDark ? "#1e293b" : "#f1f5f9", border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", text: isDark ? "#ffffff" : "#0f172a" }} />
              
              {/* Notifications Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all relative ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-lg" />
                  )}
                </button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <div className={`absolute right-0 mt-2 w-80 ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl rounded-2xl border shadow-2xl py-2 z-50`}>
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications ({notifications.length})</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading && (
                          <div className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Loading notifications...</div>
                        )}
                        {!notificationsLoading && notificationsError && (
                          <div className="p-4 text-sm text-red-500">{notificationsError}</div>
                        )}
                        {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                          <div className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No notifications yet.</div>
                        )}
                        {!notificationsLoading && !notificationsError && notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => handleNotificationClick(notif._id, notif.read)}
                            className={`p-4 border-b last:border-b-0 transition-all cursor-pointer ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                          >
                            <div className="flex gap-3">
                              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'email' || notif.type === 'application' ? 'bg-emerald-500' : 
                                notif.type === 'interview' ? 'bg-blue-500' :
                                notif.type === 'placement' ? 'bg-purple-500' :
                                'bg-amber-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</p>
                                  {notif.userId?.role && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      notif.userId.role === 'admin' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                                      notif.userId.role === 'staff' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                      notif.userId.role === 'student' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                      'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {notif.userId.role}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{notif.message}</p>
                                {notif.userId?.name && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>From: {notif.userId.name}</p>
                                )}
                              </div>
                              <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Theme Switcher */}
              <div className={`flex items-center ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-xl p-1`}>
                <select
                  value={theme === 'dark' ? 'dark' : 'light'}
                  onChange={e => handleThemeChange(e.target.value)}
                  className={`bg-transparent outline-none border-0 text-base font-semibold px-3 py-2 rounded-xl ${isDark ? 'text-white' : 'text-gray-700'}`}
                  style={{ minWidth: 90 }}
                  aria-label="Theme Mode"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              {/* Schedule Drive Button */}
              <button
                onClick={() => setShowScheduleDriveModal(true)}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule Drive</span>
              </button>
              {/* User Profile */}
              <button
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    avatar: user?.avatar || ''
                  });
                  setShowProfileModal(true);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ${isDark ? 'border-l border-slate-600 hover:bg-slate-700' : 'border-l border-gray-200 hover:bg-gray-100'} ml-2 pl-6`}
              >
                <div className="text-right">
                  <div className={`text-sm font-bold ${isDark ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'}`}>{user?.name || 'HR Manager'}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>HR Manager</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover" 
                        onError={(e) => {
                          const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`;
                          if (e.target.src !== fallback) e.target.src = fallback;
                        }}
                      />
                    ) : (
                      user?.name?.charAt(0) || 'H'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-2.5 w-2.5 text-white fill-current" />
                  </div>
                </div>
              </button>
            </div>
          </header>
          {/* Dynamic Content */}
          <main className={`p-8 pb-24 lg:pb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentView === 'analytics' ? renderAnalyticsSection() : renderContent()}
          </main>
        </div>
      </div>

      {/* RESUME ANALYSIS MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} rounded-3xl border max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl animate-in fade-in scale-95 duration-200`}>
            {/* Header */}
            <div className={`sticky top-0 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-900/80 border-white/10' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} p-8 border-b flex justify-between items-center backdrop-blur-xl`}>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Resume Analysis</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{selectedStudentForAnalysis?.name}</p>
              </div>
              <button 
                onClick={() => setShowResumeModal(false)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className={`p-8 space-y-6 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
              {analysisLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <RefreshCw className={`h-8 w-8 animate-spin mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Analyzing resume...</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Using AI to evaluate qualifications</p>
                </div>
              ) : analysisResult ? (
                <>
                  {/* ATS Score */}
                  <div className={`${isDark ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-white/10' : 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200'} rounded-2xl p-6 border`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Target className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> ATS Score
                      </h4>
                      <div className={`text-4xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{analysisResult.atsScore}</div>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${analysisResult.atsScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Placement Probability</span>
                      <span className="text-emerald-400 font-bold">{analysisResult.placementProbability}%</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <ZapIcon className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Key Strengths
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.strengths?.map((strength, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-300'}`}>
                          <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <AlertCircle className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Areas for Improvement
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.improvements?.map((improvement, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-300'}`}>
                          <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Skills */}
                  <div>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Star className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> Recommended Skills to Add
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.recommendedSkills?.map((skill, i) => (
                        <span key={i} className={`px-4 py-2 rounded-xl text-sm font-medium border ${isDark ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-700'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-white/5' : 'bg-gray-100 border-gray-300'}`}>
                    <h4 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Assessment</h4>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{analysisResult.assessment}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button onClick={() => setShowResumeModal(false)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl">
                      Schedule Interview
                    </button>
                    <button onClick={() => setShowResumeModal(false)} className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                      Close
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* JOB POST MODAL */}
      {showJobPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} rounded-3xl border max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl`}>
            {/* Header */}
            <div className={`sticky top-0 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-900/80 border-white/10' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} p-8 border-b flex justify-between items-center backdrop-blur-xl`}>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Post New Job</h3>
              <button 
                onClick={() => setShowJobPostModal(false)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className={`p-8 space-y-5 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Title *</label>
                <input 
                  type="text" 
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g., Senior React Developer"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Company *</label>
                <input 
                  type="text" 
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  placeholder="e.g., Tech Corp"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Position *</label>
                <input 
                  type="text" 
                  value={newJob.position}
                  onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                  placeholder="e.g., Developer"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Salary</label>
                  <input 
                    type="text" 
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g., $100k-$150k"
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Location *</label>
                  <input 
                    type="text" 
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="e.g., Remote"
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</label>
                <textarea 
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Job description..."
                  rows="3"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all resize-none ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Required Skills (comma-separated)</label>
                <input 
                  type="text" 
                  value={newJob.skills}
                  onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                  placeholder="e.g., React, TypeScript, Node.js"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Type</label>
                  <select 
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Urgency</label>
                  <select 
                    value={newJob.urgency}
                    onChange={(e) => setNewJob({...newJob, urgency: e.target.value})}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              {/* Actions & Feedback */}
              {jobPostError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{jobPostError}</div>
              )}
              {jobPostSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm">{jobPostSuccess}</div>
              )}
              <div className={`flex gap-4 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                <button 
                  onClick={postNewJob}
                  disabled={jobPostLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {jobPostLoading ? 'Posting...' : 'Post Job'}
                </button>
                <button 
                  onClick={() => setShowJobPostModal(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PLACEMENT DRIVE MODAL */}
      {showScheduleDriveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} rounded-3xl border max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-cyan-500/20`}>
            {/* Header */}
            <div className={`sticky top-0 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-900/80 border-white/10' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} p-8 border-b-2 border-cyan-500/30 flex justify-between items-center backdrop-blur-xl`}>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Schedule Placement Drive</h3>
              <button 
                onClick={() => setShowScheduleDriveModal(false)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className={`p-8 space-y-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              {driveError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm">
                  {driveError}
                </div>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}> 
                  Company Name *
                </label>
                <input 
                  type="text" 
                  value={driveForm.companyName}
                  onChange={(e) => setDriveForm({...driveForm, companyName: e.target.value})}
                  placeholder="e.g., Google, Microsoft, Amazon" 
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Date *
                  </label>
                  <input 
                    type="date" 
                    value={driveForm.date}
                    onChange={(e) => setDriveForm({...driveForm, date: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Number of Roles *
                  </label>
                  <input 
                    type="number"
                    value={driveForm.numberOfRoles}
                    onChange={(e) => setDriveForm({...driveForm, numberOfRoles: e.target.value})}
                    placeholder="e.g., 5" 
                    className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Package (LPA) *
                </label>
                <input 
                  type="number" 
                  value={driveForm.package}
                  onChange={(e) => setDriveForm({...driveForm, package: e.target.value})}
                  placeholder="e.g., 50" 
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Job Description
                </label>
                <textarea 
                  value={driveForm.jobDescription}
                  onChange={(e) => setDriveForm({...driveForm, jobDescription: e.target.value})}
                  placeholder="Describe the roles and responsibilities..." 
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none h-24 resize-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Required Skills
                </label>
                <input 
                  type="text" 
                  value={driveForm.requiredSkills}
                  onChange={(e) => setDriveForm({...driveForm, requiredSkills: e.target.value})}
                  placeholder="e.g., Java, Python, React" 
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Additional Notes
                </label>
                <textarea 
                  value={driveForm.notes}
                  onChange={(e) => setDriveForm({...driveForm, notes: e.target.value})}
                  placeholder="Any additional information..." 
                  className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 ring-blue-500 outline-none h-20 resize-none`}
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                  onClick={async () => {
                    try {
                      await placementsAPI.create({
                        companyName: driveForm.companyName,
                        notes: driveForm.notes,
                        // Add other required fields as needed
                      });
                      alert('Notes saved to backend!');
                    } catch (err) {
                      alert('Failed to save notes.');
                    }
                  }}
                >
                  Save Notes to Backend
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className={`sticky bottom-0 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-gray-100 border-gray-200'} p-8 border-t flex gap-4 backdrop-blur-xl`}>
              <button
                onClick={handleScheduleDrive}
                disabled={driveSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {driveSubmitting ? 'Scheduling...' : 'Schedule Drive'}
              </button>
              <button 
                onClick={() => setShowScheduleDriveModal(false)}
                className={`flex-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} py-3 px-6 rounded-xl font-bold transition-all`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={(updated) => {
            setStudents((prev) => prev.map(s => (s._id === updated.studentId || s.id === updated.studentId) ? { ...s, ...updated } : s));
          }}
          isDark={isDark}
        />
      )}

      {/* JOB REQUISITION MODAL */}
      {showJobRequisitionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-400/40">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-cyan-900">
                  {editingJobRequisitionId ? 'Edit Job Requisition' : 'Create Job Requisition'}
                </h2>
                <p className="text-cyan-700 mt-1">Fill out the requisition details below</p>
              </div>
              <button 
                onClick={closeJobRequisitionModal}
                className="p-2 hover:bg-cyan-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-cyan-700" />
              </button>
            </div>

            {/* Error Message */}
            {jobRequisitionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Error</p>
                  <p className="text-red-800">{jobRequisitionError}</p>
                </div>
              </div>
            )}

            {/* Requisition Form */}
            <form onSubmit={e => { e.preventDefault(); handleJobRequisitionSubmit(); }} className="space-y-8">
              {/* Section 1: Job Details */}
              <div className="pb-6 border-b border-cyan-200">
                <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center gap-2">
                  <Briefcase size={20} />
                  Job Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Job Title *
                    </label>
                    <input 
                      type="text"
                      value={jobRequisition.title}
                      onChange={e => setJobRequisition({ ...jobRequisition, title: e.target.value })}
                      placeholder="e.g. Senior Developer"
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Department *
                    </label>
                    <input 
                      type="text"
                      value={jobRequisition.department}
                      onChange={e => setJobRequisition({ ...jobRequisition, department: e.target.value })}
                      placeholder="e.g. Engineering"
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Location *
                    </label>
                    <input 
                      type="text"
                      value={jobRequisition.location}
                      onChange={e => setJobRequisition({ ...jobRequisition, location: e.target.value })}
                      placeholder="e.g. Remote"
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Employment Type
                    </label>
                    <select 
                      value={jobRequisition.employmentType}
                      onChange={e => setJobRequisition({ ...jobRequisition, employmentType: e.target.value })}
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Compensation & Requirements */}
              <div className="pb-6 border-b border-cyan-200">
                <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Compensation & Requirements
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Number of Positions
                    </label>
                    <input 
                      type="number"
                      value={jobRequisition.numberOfPositions}
                      onChange={e => setJobRequisition({ ...jobRequisition, numberOfPositions: parseInt(e.target.value) })}
                      placeholder="1"
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Priority
                    </label>
                    <select 
                      value={jobRequisition.priority}
                      onChange={e => setJobRequisition({ ...jobRequisition, priority: e.target.value })}
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Education Level
                    </label>
                    <select 
                      value={jobRequisition.education}
                      onChange={e => setJobRequisition({ ...jobRequisition, education: e.target.value })}
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option>High School</option>
                      <option>Diploma</option>
                      <option>Bachelor</option>
                      <option>Master</option>
                      <option>PhD</option>
                      <option>Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cyan-700 mb-2">
                      Required Skills (comma-separated)
                    </label>
                    <input 
                      type="text"
                      value={jobRequisition.requiredSkills}
                      onChange={e => setJobRequisition({ ...jobRequisition, requiredSkills: e.target.value })}
                      placeholder="e.g. React, Node.js, MongoDB"
                      className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="pb-6 border-b border-cyan-200">
                <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Description
                </h3>
                <textarea 
                  value={jobRequisition.description}
                  onChange={e => setJobRequisition({ ...jobRequisition, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                  className="w-full p-3 border border-cyan-200 rounded-2xl bg-white text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Section 4: Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={jobRequisitionSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-black transition-all shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105"
                >
                  {jobRequisitionSubmitting ? (editingJobRequisitionId ? 'Updating...' : 'Creating...') : (editingJobRequisitionId ? 'Update Requisition' : 'Create Requisition')}
                </button>
                <button
                  type="button"
                  onClick={closeJobRequisitionModal}
                  className="flex-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white py-4 px-6 rounded-xl font-black transition-all shadow-xl transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUISITION APPLICATIONS MODAL */}
      {showRequisitionAppsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border-2 border-purple-500/30 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900/80 p-8 border-b-2 border-purple-500/30 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent mb-1">
                    Applications for {selectedRequisition?.title}
                  </h3>
                  <p className="text-base font-bold text-slate-300">
                    {selectedRequisition?.department} • {getFilteredApplications().length} of {requisitionApplications.length} applications
                  </p>
                </div>
                <button 
                  onClick={() => setShowRequisitionAppsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={applicationFilters.searchTerm}
                      onChange={(e) => setApplicationFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={applicationFilters.status}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="interview">Interview</option>
                </select>

                {/* Branch Filter */}
                <select
                  value={applicationFilters.branch}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, branch: e.target.value }))}
                  className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="all">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="EEE">EEE</option>
                </select>

                {/* CGPA Filter */}
                <select
                  value={applicationFilters.minCGPA}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, minCGPA: parseFloat(e.target.value) }))}
                  className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="0">All CGPA</option>
                  <option value="7.0">CGPA ≥ 7.0</option>
                  <option value="7.5">CGPA ≥ 7.5</option>
                  <option value="8.0">CGPA ≥ 8.0</option>
                  <option value="8.5">CGPA ≥ 8.5</option>
                  <option value="9.0">CGPA ≥ 9.0</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadAllApplicationsPDF}
                  disabled={getFilteredApplications().length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Download All ({getFilteredApplications().length})
                </button>
                <button
                  onClick={() => setApplicationFilters({ status: 'all', branch: 'all', minCGPA: 0, searchTerm: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {getFilteredApplications().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredApplications().map((app) => (
                    <div key={app._id} className="bg-slate-800/50 border border-white/5 rounded-xl p-6 hover:border-purple-500/40 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {app.student?.name?.charAt(0) || app.studentName?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-bold text-white truncate">
                                {app.student?.name || app.studentName || 'Unknown Student'}
                              </h4>
                              <p className="text-sm text-slate-400 truncate">
                                {app.student?.email || app.studentEmail || 'No email provided'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Applied On</p>
                              <p className="text-sm font-medium text-white">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${
                                app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                app.status === 'interview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {app.status || 'pending'}
                              </span>
                            </div>
                            {app.student?.cgpa && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CGPA</p>
                                <p className="text-sm font-medium text-white">{app.student.cgpa}</p>
                              </div>
                            )}
                            {app.student?.branch && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                                <p className="text-sm font-medium text-white">{app.student.branch}</p>
                              </div>
                            )}
                          </div>

                          {app.student?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {app.student.skills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md border border-blue-500/20">
                                  {skill}
                                </span>
                              ))}
                              {app.student.skills.length > 4 && (
                                <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
                                  +{app.student.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => viewApplicationDetail(app)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4" /> View Details
                          </button>
                          <button 
                            onClick={() => downloadApplicationPDF(app)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" /> PDF
                          </button>
                          <button 
                            onClick={() => handleApplicationStatusUpdate(app._id, 'accepted')}
                            disabled={app.status === 'accepted'}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" /> Accept
                          </button>
                          <button 
                            onClick={() => handleApplicationStatusUpdate(app._id, 'rejected')}
                            disabled={app.status === 'rejected'}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowEmailModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" /> Contact Student
                          </button>
                        </div>
                            {/* EnhancedEmailModal for contacting student - now handled globally */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Filter className="h-20 w-20 text-slate-600 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {requisitionApplications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
                  </h3>
                  <p className="text-slate-400">
                    {requisitionApplications.length === 0 
                      ? 'This job requisition hasn\'t received any applications yet.'
                      : 'Try adjusting your filters to see more results.'}
                  </p>
                  {requisitionApplications.length > 0 && (
                    <button
                      onClick={() => setApplicationFilters({ status: 'all', branch: 'all', minCGPA: 0, searchTerm: '' })}
                      className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-6 bg-slate-900/50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                  Showing <span className="font-bold text-white">{getFilteredApplications().length}</span> of <span className="font-bold text-white">{requisitionApplications.length}</span> applications
                </p>
                <button 
                  onClick={() => setShowRequisitionAppsModal(false)}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Application View Modal */}
      {showApplicationDetailModal && selectedApplicationDetail && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border-2 border-blue-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-blue-500/20 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center text-2xl font-bold">
                      {selectedApplicationDetail.student?.name?.charAt(0) || selectedApplicationDetail.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black mb-1">
                        {selectedApplicationDetail.student?.name || selectedApplicationDetail.studentName || 'Unknown Student'}
                      </h3>
                      <p className="text-blue-100 text-base">
                        {selectedApplicationDetail.student?.email || selectedApplicationDetail.studentEmail || 'No email'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                    selectedApplicationDetail.status === 'accepted' ? 'bg-emerald-500 text-white' :
                    selectedApplicationDetail.status === 'rejected' ? 'bg-red-500 text-white' :
                    selectedApplicationDetail.status === 'interview' ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {(selectedApplicationDetail.status || 'pending').toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => setShowApplicationDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {/* Application Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    {selectedApplicationDetail.student?.phone && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm text-white font-medium">{selectedApplicationDetail.student.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Applied On</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(selectedApplicationDetail.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-400" />
                    Academic Details
                  </h4>
                  <div className="space-y-3">
                    {selectedApplicationDetail.student?.branch && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                        <p className="text-sm text-white font-medium">{selectedApplicationDetail.student.branch}</p>
                      </div>
                    )}
                    {selectedApplicationDetail.student?.cgpa && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CGPA</p>
                        <p className="text-sm text-white font-medium">{selectedApplicationDetail.student.cgpa} / 10.0</p>
                      </div>
                    )}
                    {selectedApplicationDetail.student?.backlogs !== undefined && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Backlogs</p>
                        <p className="text-sm text-white font-medium">{selectedApplicationDetail.student.backlogs}</p>
                      </div>
                    )}
                    {selectedApplicationDetail.student?.attendance && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Attendance</p>
                        <p className="text-sm text-white font-medium">{selectedApplicationDetail.student.attendance}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedApplicationDetail.student?.skills?.length > 0 && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Skills & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicationDetail.student.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-xl text-sm font-medium border border-blue-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Position Applied For */}
              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                  Position Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Position</p>
                    <p className="text-sm text-white font-medium">
                      {selectedApplicationDetail.job?.title || selectedApplicationDetail.job?.position || 'N/A'}
                    </p>
                  </div>
                  {selectedApplicationDetail.job?.company && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Company</p>
                      <p className="text-sm text-white font-medium">{selectedApplicationDetail.job.company}</p>
                    </div>
                  )}
                  {selectedApplicationDetail.job?.location && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm text-white font-medium">{selectedApplicationDetail.job.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplicationDetail.coverLetter && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-400" />
                    Cover Letter
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedApplicationDetail.coverLetter}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {selectedApplicationDetail.student?.certifications?.length > 0 && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Certifications
                  </h4>
                  <ul className="space-y-2">
                    {selectedApplicationDetail.student.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/10 p-6 bg-slate-900/50">
              <div className="flex gap-3 justify-between">
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApplicationStatusUpdate(selectedApplicationDetail._id, 'accepted')}
                    disabled={selectedApplicationDetail.status === 'accepted'}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" /> Accept Application
                  </button>
                  <button 
                    onClick={() => handleApplicationStatusUpdate(selectedApplicationDetail._id, 'interview')}
                    disabled={selectedApplicationDetail.status === 'interview'}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" /> Schedule Interview
                  </button>
                  <button 
                    onClick={() => handleApplicationStatusUpdate(selectedApplicationDetail._id, 'rejected')}
                    disabled={selectedApplicationDetail.status === 'rejected'}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <X className="h-5 w-5" /> Reject
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadApplicationPDF(selectedApplicationDetail)}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setShowApplicationDetailModal(false)}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Email Modal - always mounted for robust modal handling */}

      {/* Enhanced Email Modal - always mounted for robust modal handling */}
      <EnhancedEmailModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        theme={theme}
      />
    </>
  );
}

export default HRDashboard;
