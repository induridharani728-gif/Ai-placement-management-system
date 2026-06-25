import React, { useState, useEffect, useRef, useMemo } from 'react';
import ExamManager from './ExamManager';
import VideoConference from '../../components/VideoConference';
import jsPDF from 'jspdf';
import StaffApplications from "./Applications";
import EnhancedEmailModal from '../../components/EnhancedEmailModal';
import { studentAPI, statsAPI, jobAPI, placementsAPI, examsAPI, placementStatsAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageSelector } from '../../contexts/LanguageContext';

import { 
  Users, Calendar, GraduationCap, TrendingUp, 
  Award, BarChart3, CheckCircle, ArrowUpRight, 
  Briefcase, Search, Filter, MoreHorizontal,
  Bell, FileText, Settings, LogOut, LayoutDashboard,
  UserCheck, Building2, ClipboardList, Menu, X, ChevronLeft,
  Download, Plus, Eye, Mail, Phone, MapPin, Video, Zap,
  TrendingDown, ArrowUp, ArrowDown, BookOpen, Percent,
  DollarSign, BarChart2, PieChart, Target, AlertCircle,
  Sparkles, Code, Brain, Clock, CheckCircle2, AlertTriangle,
  Flame, Star, Shield, LineChart, Send, MessageSquare,
  GitBranch, Inbox, Share2, Copy, Edit3, Trash2,
  ExternalLink, Lock, Unlock, Flag, Pin, User, Camera,
  Crop, RotateCw, ZoomIn, ZoomOut, Download as DownloadIcon,
  Home, Briefcase as BriefcaseIcon, BarChart3 as AnalyticsIcon,
  Settings as SettingsIcon, HelpCircle, LogIn, Bell as NotificationIcon,
  Moon, Sun, Monitor, CheckCircle as CheckCircleIcon, Save, Edit, Layers
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
    // Notifications
    const [notifications, setNotifications] = useState([]);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState(null);
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const response = await notificationsAPI.getNotifications(false, 20);
        setNotifications(response?.data?.notifications || []);
      } catch (err) {
        setNotificationsError('Failed to fetch notifications');
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    // Fetch notifications for staff
    useEffect(() => {
      if (!user?._id && !user?.id) return;
      fetchNotifications();
    }, [user?._id, user?.id]);

    useEffect(() => {
      if (showNotificationsDropdown) {
        fetchNotifications();
      }
    }, [showNotificationsDropdown]);
  const navigate = useNavigate();
  
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('placement_system_theme') || 'system'); // Default: System (dark)
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [filterBranch, setFilterBranch] = useState('All');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [quickActionResult, setQuickActionResult] = useState('');
  const [actionToast, setActionToast] = useState('');
  const [mentorAssignments, setMentorAssignments] = useState({});
  const [riskActionMessage, setRiskActionMessage] = useState(null);
  const [riskReminderLoadingId, setRiskReminderLoadingId] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cropMode, setCropMode] = useState('scale');
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const canvasRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  
  // Backend Data States
  const [students, setStudents] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [exams, setExams] = useState([]);
  const [placementStats, setPlacementStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Profile Data
  const [staffProfile, setStaffProfile] = useState({
    id: 'STAFF001',
    name: user?.name || 'Staff Member',
    role: user?.role || 'Placement Coordinator',
    department: 'CSE',
    email: user?.email || '',
    phone: user?.phone || '',
    image: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    joinDate: '2020-01-15',
    designation: 'Senior HR Coordinator',
    experience: '5+ years'
  });

  useEffect(() => {
    if (!user) return;
    setStaffProfile((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      role: user.role || prev.role,
      image: user.avatar || prev.image
    }));
  }, [user]);

  const [tempImage, setTempImage] = useState(null);
  const [staffTasks, setStaffTasks] = useState([
    { id: 'TASK-101', title: 'Review shortlisted resumes', owner: 'You', dueDate: '2026-03-08', status: 'in-progress', priority: 'High' },
    { id: 'TASK-102', title: 'Confirm interview panel', owner: 'You', dueDate: '2026-03-07', status: 'pending', priority: 'High' },
    { id: 'TASK-103', title: 'Send drive instructions', owner: 'You', dueDate: '2026-03-09', status: 'pending', priority: 'Medium' },
    { id: 'TASK-104', title: 'Verify KYC backlog', owner: 'You', dueDate: '2026-03-10', status: 'completed', priority: 'Low' }
  ]);
  const [staffTickets, setStaffTickets] = useState([
    { id: 'TIC-001', studentName: 'Rahul Mehta', category: 'Interview', status: 'open', priority: 'high', assignee: 'You', question: 'Need interview reschedule due to exam clash.' },
    { id: 'TIC-002', studentName: 'Priya Sharma', category: 'Offer', status: 'in-progress', priority: 'medium', assignee: 'You', question: 'Clarification needed on offer joining date.' },
    { id: 'TIC-003', studentName: 'Ananya Iyer', category: 'KYC', status: 'resolved', priority: 'low', assignee: 'You', question: 'PAN document uploaded but not verified yet.' }
  ]);
  const [ticketDraft, setTicketDraft] = useState({ studentName: '', category: 'General', question: '' });
  const [resumeReviewQueue, setResumeReviewQueue] = useState([
    { id: 'RES-001', studentName: 'Vamsi Valluri', branch: 'CSE', status: 'pending', score: 72, deadline: '2026-03-08' },
    { id: 'RES-002', studentName: 'Neha Gupta', branch: 'IT', status: 'reviewed', score: 88, deadline: '2026-03-07' },
    { id: 'RES-003', studentName: 'Rohan Patel', branch: 'MECH', status: 'pending', score: 64, deadline: '2026-03-09' }
  ]);
  const [interviewOpsBoard, setInterviewOpsBoard] = useState([
    { id: 'INT-OPS-1', candidateName: 'Disha Bansal', stage: 'scheduled', interviewer: 'Dr. Sharma', slot: '2026-03-08 10:00' },
    { id: 'INT-OPS-2', candidateName: 'Aisha Khan', stage: 'in-progress', interviewer: 'Prof. Verma', slot: '2026-03-07 14:00' },
    { id: 'INT-OPS-3', candidateName: 'Varun Menon', stage: 'feedback-pending', interviewer: 'Dr. Gupta', slot: '2026-03-06 16:30' }
  ]);
  const [driveOps, setDriveOps] = useState({
    selectedDrive: 'Tech Spring Drive 2026',
    checklist: [
      { id: 'DRV-1', label: 'Venue confirmed', done: true },
      { id: 'DRV-2', label: 'Panel availability confirmed', done: false },
      { id: 'DRV-3', label: 'Shortlist published', done: false },
      { id: 'DRV-4', label: 'Student communication sent', done: true },
      { id: 'DRV-5', label: 'Attendance desk prepared', done: false }
    ]
  });
  // Drives catalog (mocked) with lightweight metrics
  const [driveList] = useState([
    { id: 'Tech Spring Drive 2026', label: 'Tech Spring Drive 2026', date: '2026-03-10', venue: 'Main Auditorium', company: 'TechCorp', openings: 8, registered: 124, interviewsScheduled: 32, panel: ['Dr. Sharma', 'Prof. Verma'] },
    { id: 'Campus Connect 2026', label: 'Campus Connect 2026', date: '2026-04-05', venue: 'Conference Hall B', company: 'InnoSoft', openings: 12, registered: 98, interviewsScheduled: 20, panel: ['Dr. Gupta', 'Ms. Rao'] },
    { id: 'Spring Internship Drive 2026', label: 'Spring Internship Drive 2026', date: '2026-05-14', venue: 'Lab 3', company: 'BuildIt', openings: 5, registered: 210, interviewsScheduled: 48, panel: ['Prof. Verma', 'Ms. Singh'] }
  ]);
  const [staffAuditTrail, setStaffAuditTrail] = useState([
    { id: 'AUD-1', actor: user?.name || 'Staff', action: 'Verified KYC document', target: 'KYC-003', time: '10 mins ago' },
    { id: 'AUD-2', actor: user?.name || 'Staff', action: 'Sent bulk notification', target: '42 students', time: '45 mins ago' },
    { id: 'AUD-3', actor: user?.name || 'Staff', action: 'Scheduled interview', target: 'INT-OPS-1', time: '2 hours ago' }
  ]);

  // Dashboard Stats
  const [stats] = useState({
    totalStudents: 1240,
    activeInterviews: 86,
    placementRate: 82.5,
    topTier: 156,
    avgPackage: "12.4 LPA",
    pendingVerifications: 28,
    averageAttendance: 92,
    passPercentage: 87,
    feesCollected: 94.5,
    resumesBuilt: 856,
    videosUploaded: 342,
    skillsCertified: 567,
    newApplications: 145,
    offersExtended: 34
  });

  // College Sections
  const [collegeSections] = useState([
    { id: 'cse-a', name: 'CSE-A', students: 65, attendance: 93, avgCGPA: 8.4, placement: 96, feesStatus: 98, hr: 'Dr. Sharma', email: 'sharma.hr@college.edu', phone: '+91 99999 00001' },
    { id: 'cse-b', name: 'CSE-B', students: 68, attendance: 89, avgCGPA: 8.1, placement: 91, feesStatus: 92, hr: 'Prof. Verma', email: 'verma.hr@college.edu', phone: '+91 99999 00002' },
    { id: 'ece-a', name: 'ECE-A', students: 60, attendance: 91, avgCGPA: 7.9, placement: 85, feesStatus: 96, hr: 'Dr. Gupta', email: 'gupta.hr@college.edu', phone: '+91 99999 00003' },
    { id: 'mech-a', name: 'MECH-A', students: 55, attendance: 87, avgCGPA: 7.5, placement: 78, feesStatus: 89, hr: 'Prof. Singh', email: 'singh.hr@college.edu', phone: '+91 99999 00004' }
  ]);

  // Enhanced Student Data
  const [mockRecentStudents] = useState([
    { id: '1', name: 'Vamsi Valluri', cgpa: 8.7, branch: 'CSE', section: 'CSE-A', status: 'shortlisted', placementStatus: 'Applied - TechCorp', backlogs: 0, resumeVerified: true, skills: ['React', 'Node.js', 'TypeScript', 'AWS'], email: 'vamsi@univ.edu', phone: '+91 98765 43210', attendance: 94, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 2, certifications: ['AWS Solutions Architect', 'Google Cloud Associate'], portfolioLink: 'github.com/vamsi', interviewScheduled: true, interviewDate: '2026-02-15', interviewTime: '14:00', interviewType: 'Technical', lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '2', name: 'Priya Sharma', cgpa: 9.2, branch: 'ECE', section: 'ECE-A', status: 'placed', placementStatus: 'FinTech - ₹15 LPA', backlogs: 0, resumeVerified: true, skills: ['VLSI', 'Python', 'Embedded Systems', 'MATLAB'], email: 'priya@univ.edu', phone: '+91 98765 43211', attendance: 96, fees: 'Paid', resumeVersion: 'v3.1', videoInterviews: 4, certifications: ['Xilinx FPGA Developer', 'Advanced Embedded Systems'], portfolioLink: 'github.com/priya', interviewScheduled: false, lastUpdated: '2026-01-20', assigned: true, flagged: false, notes: 'Top performer' },
    { id: '3', name: 'Rahul Mehta', cgpa: 8.1, branch: 'CSE', section: 'CSE-B', status: 'pending', placementStatus: '3 Applications Pending', backlogs: 1, resumeVerified: false, skills: ['Java', 'SQL', 'Spring Boot', 'Linux'], email: 'rahul@univ.edu', phone: '+91 98765 43212', attendance: 88, fees: 'Partial', resumeVersion: 'v1.8', videoInterviews: 1, certifications: ['Oracle Java Associate'], portfolioLink: 'github.com/rahul', interviewScheduled: true, interviewDate: '2026-02-10', interviewTime: '10:30', interviewType: 'HR Round', lastUpdated: '2026-01-22', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '4', name: 'Ananya Iyer', cgpa: 9.5, branch: 'EEE', section: 'MECH-A', status: 'placed', placementStatus: 'Global Energy - ₹18 LPA', backlogs: 0, resumeVerified: true, skills: ['Power Systems', 'MATLAB', 'CAD', 'Renewable Energy'], email: 'ananya@univ.edu', phone: '+91 98765 43213', attendance: 98, fees: 'Paid', resumeVersion: 'v2.9', videoInterviews: 3, certifications: ['PMP Certified', 'Solar Energy Systems'], portfolioLink: 'github.com/ananya', interviewScheduled: false, lastUpdated: '2026-01-19', assigned: true, flagged: false, notes: '' },
    { id: '5', name: 'Siddharth M.', cgpa: 7.8, branch: 'MECH', section: 'MECH-A', status: 'interviewing', placementStatus: 'Round 2 - AutoWorks', backlogs: 0, resumeVerified: true, skills: ['AutoCAD', 'SolidWorks', 'Thermal Design', 'CFD'], email: 'sid@univ.edu', phone: '+91 98765 43214', attendance: 91, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 2, certifications: ['CATIA Advanced', 'FEA Analysis'], portfolioLink: 'github.com/siddharth', interviewScheduled: true, interviewDate: '2026-02-18', interviewTime: '16:00', interviewType: 'Technical', lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '6', name: 'Arjun Singh', cgpa: 8.3, branch: 'CSE', section: 'CSE-A', status: 'shortlisted', placementStatus: 'Applied - Google', backlogs: 0, resumeVerified: true, skills: ['Python', 'C++', 'Docker', 'Kubernetes'], email: 'arjun.singh@univ.edu', phone: '+91 98765 43215', attendance: 92, fees: 'Paid', resumeVersion: 'v2.1', videoInterviews: 1, certifications: ['GCP Associate', 'Docker Certified'], portfolioLink: 'github.com/arjun', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '7', name: 'Neha Gupta', cgpa: 8.9, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Infosys - ₹10 LPA', backlogs: 0, resumeVerified: true, skills: ['Full Stack', 'JavaScript', 'MongoDB', 'Express'], email: 'neha.gupta@univ.edu', phone: '+91 98765 43216', attendance: 95, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 3, certifications: ['MERN Stack Developer'], portfolioLink: 'github.com/neha', interviewScheduled: false, lastUpdated: '2026-01-18', assigned: true, flagged: false, notes: 'Excellent performer' },
    { id: '8', name: 'Vikram Kumar', cgpa: 7.5, branch: 'CSE', section: 'CSE-B', status: 'pending', placementStatus: '2 Applications Pending', backlogs: 0, resumeVerified: true, skills: ['Java', 'Selenium', 'Testing'], email: 'vikram.kumar@univ.edu', phone: '+91 98765 43217', attendance: 89, fees: 'Paid', resumeVersion: 'v1.9', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/vikram', interviewScheduled: false, lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '9', name: 'Deepika Reddy', cgpa: 8.6, branch: 'ECE', section: 'ECE-A', status: 'shortlisted', placementStatus: 'Applied - Intel', backlogs: 0, resumeVerified: true, skills: ['Embedded C', 'Verilog', 'FPGA'], email: 'deepika.reddy@univ.edu', phone: '+91 98765 43218', attendance: 93, fees: 'Paid', resumeVersion: 'v2.2', videoInterviews: 1, certifications: ['Xilinx FPGA Developer'], portfolioLink: 'github.com/deepika', interviewScheduled: true, interviewDate: '2026-02-12', interviewTime: '11:00', interviewType: 'Technical', lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '10', name: 'Rohan Patel', cgpa: 7.9, branch: 'MECH', section: 'MECH-B', status: 'interviewing', placementStatus: 'Round 1 - Bosch', backlogs: 0, resumeVerified: true, skills: ['CATIA', 'Simulation', 'FEA'], email: 'rohan.patel@univ.edu', phone: '+91 98765 43219', attendance: 91, fees: 'Paid', resumeVersion: 'v2.0', videoInterviews: 1, certifications: ['CAD Certified'], portfolioLink: 'github.com/rohan', interviewScheduled: true, interviewDate: '2026-02-14', interviewTime: '15:30', interviewType: 'Technical', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '11', name: 'Shreya Jain', cgpa: 9.1, branch: 'CSE', section: 'CSE-A', status: 'placed', placementStatus: 'Adobe - ₹20 LPA', backlogs: 0, resumeVerified: true, skills: ['C++', 'Data Structures', 'Algorithms'], email: 'shreya.jain@univ.edu', phone: '+91 98765 43220', attendance: 97, fees: 'Paid', resumeVersion: 'v3.0', videoInterviews: 4, certifications: ['Adobe Certified'], portfolioLink: 'github.com/shreya', interviewScheduled: false, lastUpdated: '2026-01-15', assigned: true, flagged: false, notes: 'Top performer' },
    { id: '12', name: 'Ashish Yadav', cgpa: 8.2, branch: 'IT', section: 'IT-B', status: 'shortlisted', placementStatus: 'Applied - Microsoft', backlogs: 1, resumeVerified: true, skills: ['.NET', 'SQL Server', 'Azure'], email: 'ashish.yadav@univ.edu', phone: '+91 98765 43221', attendance: 90, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: ['Microsoft Azure Developer'], portfolioLink: 'github.com/ashish', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '13', name: 'Pooja Singh', cgpa: 8.5, branch: 'ECE', section: 'ECE-B', status: 'pending', placementStatus: '1 Application Pending', backlogs: 0, resumeVerified: true, skills: ['Digital Electronics', 'Microcontrollers'], email: 'pooja.singh@univ.edu', phone: '+91 98765 43222', attendance: 92, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/pooja', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '14', name: 'Harshit Mishra', cgpa: 7.6, branch: 'CSE', section: 'CSE-B', status: 'pending', placementStatus: 'Not Started', backlogs: 2, resumeVerified: false, skills: ['Python', 'Web Development'], email: 'harshit.mishra@univ.edu', phone: '+91 98765 43223', attendance: 85, fees: 'Partial', resumeVersion: 'v1.5', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/harshit', interviewScheduled: false, lastUpdated: '2026-01-24', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '15', name: 'Kavya Desai', cgpa: 9.0, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'Tesla - ₹22 LPA', backlogs: 0, resumeVerified: true, skills: ['Thermodynamics', 'Fluid Mechanics', 'MATLAB'], email: 'kavya.desai@univ.edu', phone: '+91 98765 43224', attendance: 96, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 3, certifications: ['MATLAB Certified'], portfolioLink: 'github.com/kavya', interviewScheduled: false, lastUpdated: '2026-01-16', assigned: true, flagged: false, notes: 'Excellent performer' },
    { id: '16', name: 'Nikhil Pandey', cgpa: 8.4, branch: 'CSE', section: 'CSE-A', status: 'shortlisted', placementStatus: 'Applied - Amazon', backlogs: 0, resumeVerified: true, skills: ['DSA', 'System Design', 'Java'], email: 'nikhil.pandey@univ.edu', phone: '+91 98765 43225', attendance: 93, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 1, certifications: ['AWS Certified'], portfolioLink: 'github.com/nikhil', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '17', name: 'Anjali Nair', cgpa: 8.8, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'TCS - ₹12 LPA', backlogs: 0, resumeVerified: true, skills: ['UI/UX Design', 'Figma', 'Prototyping'], email: 'anjali.nair@univ.edu', phone: '+91 98765 43226', attendance: 94, fees: 'Paid', resumeVersion: 'v2.9', videoInterviews: 2, certifications: ['UX Certified'], portfolioLink: 'github.com/anjali', interviewScheduled: false, lastUpdated: '2026-01-19', assigned: true, flagged: false, notes: '' },
    { id: '18', name: 'Mohit Verma', cgpa: 7.7, branch: 'ECE', section: 'ECE-A', status: 'interviewing', placementStatus: 'Round 2 - Qualcomm', backlogs: 0, resumeVerified: true, skills: ['Signal Processing', 'Embedded Systems'], email: 'mohit.verma@univ.edu', phone: '+91 98765 43227', attendance: 90, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 2, certifications: [], portfolioLink: 'github.com/mohit', interviewScheduled: false, lastUpdated: '2026-01-23', assigned: false, flagged: false, notes: '' },
    { id: '19', name: 'Disha Bansal', cgpa: 8.7, branch: 'CSE', section: 'CSE-B', status: 'shortlisted', placementStatus: 'Applied - Flipkart', backlogs: 0, resumeVerified: true, skills: ['Frontend Development', 'React', 'Redux'], email: 'disha.bansal@univ.edu', phone: '+91 98765 43228', attendance: 95, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 1, certifications: ['React Certified'], portfolioLink: 'github.com/disha', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '20', name: 'Ravi Chopra', cgpa: 8.0, branch: 'MECH', section: 'MECH-B', status: 'pending', placementStatus: '2 Applications Pending', backlogs: 0, resumeVerified: true, skills: ['CAD', 'Automation', 'Robotics'], email: 'ravi.chopra@univ.edu', phone: '+91 98765 43229', attendance: 89, fees: 'Paid', resumeVersion: 'v2.2', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/ravi', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '21', name: 'Aisha Khan', cgpa: 9.3, branch: 'CSE', section: 'CSE-A', status: 'placed', placementStatus: 'Google - ₹35 LPA', backlogs: 0, resumeVerified: true, skills: ['ML', 'Python', 'TensorFlow', 'Keras'], email: 'aisha.khan@univ.edu', phone: '+91 98765 43230', attendance: 98, fees: 'Paid', resumeVersion: 'v3.2', videoInterviews: 4, certifications: ['ML Specialist', 'Google Cloud ML'], portfolioLink: 'github.com/aisha', interviewScheduled: false, lastUpdated: '2026-01-14', assigned: true, flagged: false, notes: 'Star performer' },
    { id: '22', name: 'Samir Ali', cgpa: 7.8, branch: 'IT', section: 'IT-B', status: 'pending', placementStatus: 'Resume Review', backlogs: 1, resumeVerified: false, skills: ['Web Dev', 'MongoDB', 'Express'], email: 'samir.ali@univ.edu', phone: '+91 98765 43231', attendance: 87, fees: 'Paid', resumeVersion: 'v1.8', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/samir', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '23', name: 'Tanya Sharma', cgpa: 8.6, branch: 'ECE', section: 'ECE-B', status: 'shortlisted', placementStatus: 'Applied - Samsung', backlogs: 0, resumeVerified: true, skills: ['VLSI Design', 'Verilog', 'SystemVerilog'], email: 'tanya.sharma@univ.edu', phone: '+91 98765 43232', attendance: 93, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: ['VLSI Certified'], portfolioLink: 'github.com/tanya', interviewScheduled: true, interviewDate: '2026-02-13', interviewTime: '09:30', interviewType: 'Technical', lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '24', name: 'Varun Menon', cgpa: 8.1, branch: 'CSE', section: 'CSE-B', status: 'interviewing', placementStatus: 'Round 1 - Stripe', backlogs: 0, resumeVerified: true, skills: ['Backend Dev', 'Go', 'gRPC'], email: 'varun.menon@univ.edu', phone: '+91 98765 43233', attendance: 91, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 1, certifications: ['Go Developer'], portfolioLink: 'github.com/varun', interviewScheduled: false, lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '25', name: 'Shreya Nambiar', cgpa: 9.0, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Deloitte - ₹14 LPA', backlogs: 0, resumeVerified: true, skills: ['Data Analytics', 'SQL', 'Tableau'], email: 'shreya.nambiar@univ.edu', phone: '+91 98765 43234', attendance: 96, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 3, certifications: ['Data Science Certified'], portfolioLink: 'github.com/shreya', interviewScheduled: false, lastUpdated: '2026-01-17', assigned: true, flagged: false, notes: '' },
    { id: '26', name: 'Abhishek Das', cgpa: 8.3, branch: 'MECH', section: 'MECH-A', status: 'shortlisted', placementStatus: 'Applied - Mahindra', backlogs: 0, resumeVerified: true, skills: ['Engineering Design', 'CATIA', 'Analysis'], email: 'abhishek.das@univ.edu', phone: '+91 98765 43235', attendance: 92, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/abhishek', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '27', name: 'Priyanka Mishra', cgpa: 8.9, branch: 'CSE', section: 'CSE-A', status: 'placed', placementStatus: 'Microsoft - ₹32 LPA', backlogs: 0, resumeVerified: true, skills: ['Cloud Computing', 'Azure', 'DevOps'], email: 'priyanka.mishra@univ.edu', phone: '+91 98765 43236', attendance: 97, fees: 'Paid', resumeVersion: 'v3.0', videoInterviews: 4, certifications: ['Azure Certified', 'DevOps Engineer'], portfolioLink: 'github.com/priyanka', interviewScheduled: false, lastUpdated: '2026-01-15', assigned: true, flagged: false, notes: 'Excellent performer' },
    { id: '28', name: 'Sanjay Kumar', cgpa: 7.5, branch: 'ECE', section: 'ECE-B', status: 'pending', placementStatus: 'Not Started', backlogs: 1, resumeVerified: false, skills: ['Electronics', 'Programming'], email: 'sanjay.kumar@univ.edu', phone: '+91 98765 43237', attendance: 86, fees: 'Partial', resumeVersion: 'v1.6', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/sanjay', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '29', name: 'Gaurav Singh', cgpa: 8.4, branch: 'IT', section: 'IT-A', status: 'shortlisted', placementStatus: 'Applied - Capgemini', backlogs: 0, resumeVerified: true, skills: ['Java', 'Spring', 'Microservices'], email: 'gaurav.singh@univ.edu', phone: '+91 98765 43238', attendance: 93, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 1, certifications: ['Java Certified'], portfolioLink: 'github.com/gaurav', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '30', name: 'Megha Sharma', cgpa: 8.7, branch: 'CSE', section: 'CSE-B', status: 'interviewing', placementStatus: 'Round 2 - Uber', backlogs: 0, resumeVerified: true, skills: ['Distributed Systems', 'Go', 'Protocol Buffers'], email: 'megha.sharma@univ.edu', phone: '+91 98765 43239', attendance: 94, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 2, certifications: [], portfolioLink: 'github.com/megha', interviewScheduled: true, interviewDate: '2026-02-16', interviewTime: '13:00', interviewType: 'System Design', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '31', name: 'Aryan Saxena', cgpa: 8.2, branch: 'MECH', section: 'MECH-B', status: 'placed', placementStatus: 'Maruti - ₹9 LPA', backlogs: 0, resumeVerified: true, skills: ['Manufacturing', 'Design', 'Quality'], email: 'aryan.saxena@univ.edu', phone: '+91 98765 43240', attendance: 90, fees: 'Paid', resumeVersion: 'v2.1', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/aryan', interviewScheduled: false, lastUpdated: '2026-01-20', assigned: true, flagged: false, notes: '' },
    { id: '32', name: 'Navya Patel', cgpa: 9.2, branch: 'IT', section: 'IT-B', status: 'placed', placementStatus: 'HCL - ₹13 LPA', backlogs: 0, resumeVerified: true, skills: ['Business Analysis', 'Requirements', 'Documentation'], email: 'navya.patel@univ.edu', phone: '+91 98765 43241', attendance: 97, fees: 'Paid', resumeVersion: 'v2.9', videoInterviews: 3, certifications: ['BA Certified'], portfolioLink: 'github.com/navya', interviewScheduled: false, lastUpdated: '2026-01-18', assigned: true, flagged: false, notes: 'Strong performer' },
    { id: '33', name: 'Akhil Reddy', cgpa: 8.0, branch: 'CSE', section: 'CSE-A', status: 'pending', placementStatus: 'Interview Scheduled', backlogs: 0, resumeVerified: true, skills: ['Mobile Dev', 'Flutter', 'Dart'], email: 'akhil.reddy@univ.edu', phone: '+91 98765 43242', attendance: 88, fees: 'Paid', resumeVersion: 'v2.2', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/akhil', interviewScheduled: true, interviewDate: '2026-02-11', interviewTime: '10:00', interviewType: 'Technical', lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '34', name: 'Riya Bansal', cgpa: 8.8, branch: 'ECE', section: 'ECE-A', status: 'shortlisted', placementStatus: 'Applied - NVIDIA', backlogs: 0, resumeVerified: true, skills: ['GPU Programming', 'CUDA', 'Parallel Computing'], email: 'riya.bansal@univ.edu', phone: '+91 98765 43243', attendance: 95, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 2, certifications: ['CUDA Certified'], portfolioLink: 'github.com/riya', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '35', name: 'Vishal Gupta', cgpa: 7.9, branch: 'IT', section: 'IT-A', status: 'pending', placementStatus: '1 Application Pending', backlogs: 1, resumeVerified: true, skills: ['Cloud Computing', 'AWS', 'EC2'], email: 'vishal.gupta@univ.edu', phone: '+91 98765 43244', attendance: 89, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 0, certifications: ['AWS Associate'], portfolioLink: 'github.com/vishal', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '36', name: 'Sonya Malik', cgpa: 9.1, branch: 'CSE', section: 'CSE-B', status: 'placed', placementStatus: 'Facebook - ₹45 LPA', backlogs: 0, resumeVerified: true, skills: ['Full Stack', 'Blockchain', 'Web3'], email: 'sonya.malik@univ.edu', phone: '+91 98765 43245', attendance: 98, fees: 'Paid', resumeVersion: 'v3.1', videoInterviews: 4, certifications: ['Blockchain Developer'], portfolioLink: 'github.com/sonya', interviewScheduled: false, lastUpdated: '2026-01-13', assigned: true, flagged: false, notes: 'Star performer' },
    { id: '37', name: 'Nitin Joshi', cgpa: 8.3, branch: 'MECH', section: 'MECH-A', status: 'interviewing', placementStatus: 'Round 1 - Bajaj', backlogs: 0, resumeVerified: true, skills: ['Product Design', 'Innovation', 'Testing'], email: 'nitin.joshi@univ.edu', phone: '+91 98765 43246', attendance: 91, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/nitin', interviewScheduled: true, interviewDate: '2026-02-12', interviewTime: '14:30', interviewType: 'Technical', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '38', name: 'Isha Chauhan', cgpa: 8.6, branch: 'IT', section: 'IT-B', status: 'shortlisted', placementStatus: 'Applied - Accenture', backlogs: 0, resumeVerified: true, skills: ['SAP', 'Enterprise Systems', 'ERP'], email: 'isha.chauhan@univ.edu', phone: '+91 98765 43247', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: ['SAP Certified'], portfolioLink: 'github.com/isha', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '39', name: 'Manish Tiwari', cgpa: 8.1, branch: 'CSE', section: 'CSE-A', status: 'placed', placementStatus: 'LinkedIn - ₹38 LPA', backlogs: 0, resumeVerified: true, skills: ['Big Data', 'Spark', 'Hadoop'], email: 'manish.tiwari@univ.edu', phone: '+91 98765 43248', attendance: 93, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: ['Big Data Certified'], portfolioLink: 'github.com/manish', interviewScheduled: false, lastUpdated: '2026-01-19', assigned: true, flagged: false, notes: '' },
    { id: '40', name: 'Divya Menon', cgpa: 8.9, branch: 'ECE', section: 'ECE-A', status: 'pending', placementStatus: 'Interview Scheduled', backlogs: 0, resumeVerified: true, skills: ['IoT', 'Sensors', 'Arduino'], email: 'divya.menon@univ.edu', phone: '+91 98765 43249', attendance: 94, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 0, certifications: ['IoT Certified'], portfolioLink: 'github.com/divya', interviewScheduled: true, interviewDate: '2026-02-17', interviewTime: '11:30', interviewType: 'Technical', lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '41', name: 'Karanvir Singh', cgpa: 7.6, branch: 'MECH', section: 'MECH-B', status: 'pending', placementStatus: 'Not Started', backlogs: 2, resumeVerified: false, skills: ['Robotics', 'Automation'], email: 'karanvir.singh@univ.edu', phone: '+91 98765 43250', attendance: 84, fees: 'Partial', resumeVersion: 'v1.5', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/karanvir', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '42', name: 'Simran Kaur', cgpa: 8.7, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Expedia - ₹28 LPA', backlogs: 0, resumeVerified: true, skills: ['Travel Tech', 'Booking Systems', 'APIs'], email: 'simran.kaur@univ.edu', phone: '+91 98765 43251', attendance: 95, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/simran', interviewScheduled: false, lastUpdated: '2026-01-17', assigned: true, flagged: false, notes: '' },
    { id: '43', name: 'Pranav Kumar', cgpa: 8.4, branch: 'CSE', section: 'CSE-B', status: 'shortlisted', placementStatus: 'Applied - PayPal', backlogs: 0, resumeVerified: true, skills: ['Financial Tech', 'Security', 'Crypto'], email: 'pranav.kumar@univ.edu', phone: '+91 98765 43252', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: ['Crypto Developer'], portfolioLink: 'github.com/pranav', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '44', name: 'Anjum Fatima', cgpa: 8.8, branch: 'ECE', section: 'ECE-B', status: 'interviewing', placementStatus: 'Round 2 - Nokia', backlogs: 0, resumeVerified: true, skills: ['5G', 'Telecom', 'Networking'], email: 'anjum.fatima@univ.edu', phone: '+91 98765 43253', attendance: 94, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 2, certifications: ['Telecom Certified'], portfolioLink: 'github.com/anjum', interviewScheduled: true, interviewDate: '2026-02-19', interviewTime: '15:00', interviewType: 'Technical', lastUpdated: '2026-01-23', assigned: false, flagged: false, notes: '' },
    { id: '45', name: 'Rudra Patel', cgpa: 8.0, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'Hyundai - ₹11 LPA', backlogs: 0, resumeVerified: true, skills: ['Automotive', 'Safety Systems'], email: 'rudra.patel@univ.edu', phone: '+91 98765 43254', attendance: 90, fees: 'Paid', resumeVersion: 'v2.2', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/rudra', interviewScheduled: false, lastUpdated: '2026-01-21', assigned: true, flagged: false, notes: '' },
    { id: '46', name: 'Zara Khan', cgpa: 9.0, branch: 'IT', section: 'IT-B', status: 'placed', placementStatus: 'Spotify - ₹34 LPA', backlogs: 0, resumeVerified: true, skills: ['Music Tech', 'Streaming', 'Analytics'], email: 'zara.khan@univ.edu', phone: '+91 98765 43255', attendance: 97, fees: 'Paid', resumeVersion: 'v2.9', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/zara', interviewScheduled: false, lastUpdated: '2026-01-16', assigned: true, flagged: false, notes: 'Excellent performer' },
    { id: '47', name: 'Dev Verma', cgpa: 8.5, branch: 'CSE', section: 'CSE-A', status: 'pending', placementStatus: '2 Applications Pending', backlogs: 0, resumeVerified: true, skills: ['Game Dev', 'Unity', 'C#'], email: 'dev.verma@univ.edu', phone: '+91 98765 43256', attendance: 91, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 0, certifications: ['Unity Certified'], portfolioLink: 'github.com/dev', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '48', name: 'Bhavna Deshmukh', cgpa: 8.3, branch: 'ECE', section: 'ECE-A', status: 'shortlisted', placementStatus: 'Applied - Broadcom', backlogs: 0, resumeVerified: true, skills: ['Chip Design', 'Verilog', 'SystemC'], email: 'bhavna.deshmukh@univ.edu', phone: '+91 98765 43257', attendance: 93, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/bhavna', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '49', name: 'Yash Sharma', cgpa: 8.2, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Netflix - ₹36 LPA', backlogs: 0, resumeVerified: true, skills: ['Video Streaming', 'Encoding', 'CDN'], email: 'yash.sharma@univ.edu', phone: '+91 98765 43258', attendance: 92, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/yash', interviewScheduled: false, lastUpdated: '2026-01-18', assigned: true, flagged: false, notes: '' },
    { id: '50', name: 'Kamla Sharma', cgpa: 8.6, branch: 'MECH', section: 'MECH-B', status: 'interviewing', placementStatus: 'Round 1 - TVS', backlogs: 0, resumeVerified: true, skills: ['Two-wheeler Design', 'CFD'], email: 'kamla.sharma@univ.edu', phone: '+91 98765 43259', attendance: 91, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/kamla', interviewScheduled: true, interviewDate: '2026-02-14', interviewTime: '10:00', interviewType: 'Technical', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '51', name: 'Sahil Chopra', cgpa: 8.1, branch: 'CSE', section: 'CSE-B', status: 'shortlisted', placementStatus: 'Applied - Booking.com', backlogs: 0, resumeVerified: true, skills: ['Travel Tech', 'Recommendations', 'ML'], email: 'sahil.chopra@univ.edu', phone: '+91 98765 43260', attendance: 90, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/sahil', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '52', name: 'Meera Patel', cgpa: 8.9, branch: 'IT', section: 'IT-B', status: 'pending', placementStatus: 'Interview Scheduled', backlogs: 0, resumeVerified: true, skills: ['Healthcare IT', 'HIPAA', 'Healthcare Systems'], email: 'meera.patel@univ.edu', phone: '+91 98765 43261', attendance: 94, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/meera', interviewScheduled: true, interviewDate: '2026-02-20', interviewTime: '09:00', interviewType: 'HR Round', lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '53', name: 'Rohit Bhatt', cgpa: 7.8, branch: 'ECE', section: 'ECE-B', status: 'pending', placementStatus: 'Not Started', backlogs: 1, resumeVerified: false, skills: ['Power Electronics', 'Converters'], email: 'rohit.bhatt@univ.edu', phone: '+91 98765 43262', attendance: 87, fees: 'Partial', resumeVersion: 'v1.7', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/rohit', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '54', name: 'Tanvi Singh', cgpa: 8.7, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'Hero - ₹10 LPA', backlogs: 0, resumeVerified: true, skills: ['Mechanical Design', 'Simulation'], email: 'tanvi.singh@univ.edu', phone: '+91 98765 43263', attendance: 93, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 2, certifications: [], portfolioLink: 'github.com/tanvi', interviewScheduled: false, lastUpdated: '2026-01-20', assigned: true, flagged: false, notes: '' },
    { id: '55', name: 'Harsh Malhotra', cgpa: 8.4, branch: 'CSE', section: 'CSE-A', status: 'interviewing', placementStatus: 'Round 1 - Snap', backlogs: 0, resumeVerified: true, skills: ['Social Media', 'Real-time Systems'], email: 'harsh.malhotra@univ.edu', phone: '+91 98765 43264', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/harsh', interviewScheduled: true, interviewDate: '2026-02-13', interviewTime: '14:00', interviewType: 'System Design', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '56', name: 'Preeti Yadav', cgpa: 8.8, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Airbnb - ₹31 LPA', backlogs: 0, resumeVerified: true, skills: ['Travel Platform', 'Payments', 'Logistics'], email: 'preeti.yadav@univ.edu', phone: '+91 98765 43265', attendance: 96, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/preeti', interviewScheduled: false, lastUpdated: '2026-01-17', assigned: true, flagged: false, notes: 'Strong performer' },
    { id: '57', name: 'Sushant Rao', cgpa: 8.0, branch: 'MECH', section: 'MECH-B', status: 'shortlisted', placementStatus: 'Applied - JCB', backlogs: 0, resumeVerified: true, skills: ['Heavy Machinery', 'Hydraulics'], email: 'sushant.rao@univ.edu', phone: '+91 98765 43266', attendance: 89, fees: 'Paid', resumeVersion: 'v2.2', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/sushant', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '58', name: 'Gauri Kulkarni', cgpa: 9.1, branch: 'CSE', section: 'CSE-B', status: 'placed', placementStatus: 'Twitter - ₹40 LPA', backlogs: 0, resumeVerified: true, skills: ['Real-time Systems', 'Distributed Tweets'], email: 'gauri.kulkarni@univ.edu', phone: '+91 98765 43267', attendance: 98, fees: 'Paid', resumeVersion: 'v3.0', videoInterviews: 4, certifications: [], portfolioLink: 'github.com/gauri', interviewScheduled: false, lastUpdated: '2026-01-14', assigned: true, flagged: false, notes: 'Star performer' },
    { id: '59', name: 'Rohin Iyer', cgpa: 8.3, branch: 'ECE', section: 'ECE-A', status: 'pending', placementStatus: '1 Application Pending', backlogs: 0, resumeVerified: true, skills: ['RF Design', 'Antenna Design'], email: 'rohin.iyer@univ.edu', phone: '+91 98765 43268', attendance: 90, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/rohin', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '60', name: 'Ritika Malhotra', cgpa: 8.6, branch: 'IT', section: 'IT-B', status: 'shortlisted', placementStatus: 'Applied - Slack', backlogs: 0, resumeVerified: true, skills: ['Communication Platforms', 'APIs'], email: 'ritika.malhotra@univ.edu', phone: '+91 98765 43269', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/ritika', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '61', name: 'Arpit Joshi', cgpa: 8.2, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'Daimler - ₹16 LPA', backlogs: 0, resumeVerified: true, skills: ['Automotive Safety', 'Testing'], email: 'arpit.joshi@univ.edu', phone: '+91 98765 43270', attendance: 91, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 2, certifications: [], portfolioLink: 'github.com/arpit', interviewScheduled: false, lastUpdated: '2026-01-19', assigned: true, flagged: false, notes: '' },
    { id: '62', name: 'Nisha Apte', cgpa: 8.9, branch: 'CSE', section: 'CSE-A', status: 'interviewing', placementStatus: 'Round 2 - Salesforce', backlogs: 0, resumeVerified: true, skills: ['CRM', 'Cloud Computing', 'APIs'], email: 'nisha.apte@univ.edu', phone: '+91 98765 43271', attendance: 95, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 2, certifications: [], portfolioLink: 'github.com/nisha', interviewScheduled: true, interviewDate: '2026-02-15', interviewTime: '12:30', interviewType: 'HR Round', lastUpdated: '2026-01-23', assigned: false, flagged: false, notes: '' },
    { id: '63', name: 'Vishal Singh', cgpa: 8.1, branch: 'ECE', section: 'ECE-B', status: 'shortlisted', placementStatus: 'Applied - TI', backlogs: 0, resumeVerified: true, skills: ['Analog Design', 'ICs'], email: 'vishal.singh@univ.edu', phone: '+91 98765 43272', attendance: 91, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/vishal', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '64', name: 'Esha Mallik', cgpa: 8.7, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Pinterest - ₹30 LPA', backlogs: 0, resumeVerified: true, skills: ['Visual Search', 'Image Processing'], email: 'esha.mallik@univ.edu', phone: '+91 98765 43273', attendance: 94, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/esha', interviewScheduled: false, lastUpdated: '2026-01-17', assigned: true, flagged: false, notes: '' },
    { id: '65', name: 'Kunal Chopra', cgpa: 8.4, branch: 'MECH', section: 'MECH-B', status: 'pending', placementStatus: 'Interview Scheduled', backlogs: 0, resumeVerified: true, skills: ['Supply Chain', 'Manufacturing'], email: 'kunal.chopra@univ.edu', phone: '+91 98765 43274', attendance: 90, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/kunal', interviewScheduled: true, interviewDate: '2026-02-21', interviewTime: '10:30', interviewType: 'Technical', lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '66', name: 'Divyanshu Singh', cgpa: 8.5, branch: 'CSE', section: 'CSE-B', status: 'placed', placementStatus: 'Discord - ₹42 LPA', backlogs: 0, resumeVerified: true, skills: ['Real-time Communication', 'WebSockets'], email: 'divyanshu.singh@univ.edu', phone: '+91 98765 43275', attendance: 93, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/divyanshu', interviewScheduled: false, lastUpdated: '2026-01-18', assigned: true, flagged: false, notes: '' },
    { id: '67', name: 'Pooja Desai', cgpa: 8.3, branch: 'IT', section: 'IT-B', status: 'interviewing', placementStatus: 'Round 1 - Dropbox', backlogs: 0, resumeVerified: true, skills: ['Cloud Storage', 'Sync Engines'], email: 'pooja.desai@univ.edu', phone: '+91 98765 43276', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/pooja', interviewScheduled: true, interviewDate: '2026-02-12', interviewTime: '13:00', interviewType: 'Technical', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '68', name: 'Siddesh Rao', cgpa: 7.9, branch: 'ECE', section: 'ECE-A', status: 'shortlisted', placementStatus: 'Applied - Xilinx', backlogs: 0, resumeVerified: true, skills: ['FPGA Design', 'HDL'], email: 'siddesh.rao@univ.edu', phone: '+91 98765 43277', attendance: 89, fees: 'Paid', resumeVersion: 'v2.3', videoInterviews: 1, certifications: ['Xilinx Certified'], portfolioLink: 'github.com/siddesh', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '69', name: 'Swati Kumar', cgpa: 9.0, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'Rolls Royce - ₹25 LPA', backlogs: 0, resumeVerified: true, skills: ['Jet Engines', 'Turbomachinery'], email: 'swati.kumar@univ.edu', phone: '+91 98765 43278', attendance: 96, fees: 'Paid', resumeVersion: 'v2.8', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/swati', interviewScheduled: false, lastUpdated: '2026-01-16', assigned: true, flagged: false, notes: 'Excellent performer' },
    { id: '70', name: 'Aditya Nair', cgpa: 8.2, branch: 'CSE', section: 'CSE-A', status: 'pending', placementStatus: '1 Application Pending', backlogs: 0, resumeVerified: true, skills: ['VR/AR', 'Unity', 'Unreal'], email: 'aditya.nair@univ.edu', phone: '+91 98765 43279', attendance: 91, fees: 'Paid', resumeVersion: 'v2.4', videoInterviews: 0, certifications: ['VR Developer'], portfolioLink: 'github.com/aditya', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: false, notes: '' },
    { id: '71', name: 'Swapnil Patil', cgpa: 8.6, branch: 'IT', section: 'IT-A', status: 'placed', placementStatus: 'Uber - ₹29 LPA', backlogs: 0, resumeVerified: true, skills: ['Ride-sharing', 'Maps', 'Logistics'], email: 'swapnil.patil@univ.edu', phone: '+91 98765 43280', attendance: 93, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/swapnil', interviewScheduled: false, lastUpdated: '2026-01-18', assigned: true, flagged: false, notes: '' },
    { id: '72', name: 'Vaishali Singh', cgpa: 8.8, branch: 'MECH', section: 'MECH-B', status: 'shortlisted', placementStatus: 'Applied - Komatsu', backlogs: 0, resumeVerified: true, skills: ['Construction Equipment', 'Hydraulics'], email: 'vaishali.singh@univ.edu', phone: '+91 98765 43281', attendance: 94, fees: 'Paid', resumeVersion: 'v2.7', videoInterviews: 1, certifications: [], portfolioLink: 'github.com/vaishali', interviewScheduled: false, lastUpdated: '2026-01-25', assigned: false, flagged: false, notes: '' },
    { id: '73', name: 'Himanshu Verma', cgpa: 8.0, branch: 'ECE', section: 'ECE-B', status: 'pending', placementStatus: 'Resume Review', backlogs: 1, resumeVerified: false, skills: ['Microelectronics', 'Semiconductors'], email: 'himanshu.verma@univ.edu', phone: '+91 98765 43282', attendance: 88, fees: 'Paid', resumeVersion: 'v1.8', videoInterviews: 0, certifications: [], portfolioLink: 'github.com/himanshu', interviewScheduled: false, lastUpdated: '2026-01-26', assigned: false, flagged: true, notes: 'Pending resume verification' },
    { id: '74', name: 'Neha Singh', cgpa: 8.5, branch: 'CSE', section: 'CSE-B', status: 'placed', placementStatus: 'Airbnb - ₹33 LPA', backlogs: 0, resumeVerified: true, skills: ['Backend Systems', 'Payments'], email: 'neha.singh@univ.edu', phone: '+91 98765 43283', attendance: 94, fees: 'Paid', resumeVersion: 'v2.6', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/neha', interviewScheduled: false, lastUpdated: '2026-01-16', assigned: true, flagged: false, notes: '' },
    { id: '75', name: 'Aryan Vasant', cgpa: 8.1, branch: 'IT', section: 'IT-A', status: 'interviewing', placementStatus: 'Round 2 - Goldman Sachs', backlogs: 0, resumeVerified: true, skills: ['Fintech', 'Trading Systems', 'Low Latency'], email: 'aryan.vasant@univ.edu', phone: '+91 98765 43284', attendance: 92, fees: 'Paid', resumeVersion: 'v2.5', videoInterviews: 2, certifications: ['Finance Technologist'], portfolioLink: 'github.com/aryan', interviewScheduled: true, interviewDate: '2026-02-11', interviewTime: '16:00', interviewType: 'System Design', lastUpdated: '2026-01-24', assigned: false, flagged: false, notes: '' },
    { id: '76', name: 'Rachna Mehta', cgpa: 8.9, branch: 'MECH', section: 'MECH-A', status: 'placed', placementStatus: 'General Motors - ₹19 LPA', backlogs: 0, resumeVerified: true, skills: ['EV Design', 'Battery Systems'], email: 'rachna.mehta@univ.edu', phone: '+91 98765 43285', attendance: 97, fees: 'Paid', resumeVersion: 'v2.9', videoInterviews: 3, certifications: [], portfolioLink: 'github.com/rachna', interviewScheduled: false, lastUpdated: '2026-01-15', assigned: true, flagged: false, notes: 'Excellent performer' }
  ]);

  const verificationStorageKey = 'staff_kyc_queue_v1';

  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: 'KYC-001',
      name: 'Rahul Mehta',
      email: 'rahul.mehta@college.edu',
      document: 'Aadhar',
      status: 'Pending',
      date: '2026-02-01',
      priority: 'High',
      remarks: 'Name mismatch between profile and document.',
      reviewedBy: '',
      lastUpdated: ''
    },
    {
      id: 'KYC-002',
      name: 'Siddharth M.',
      email: 'siddharth.m@college.edu',
      document: 'PAN',
      status: 'Pending',
      date: '2026-02-02',
      priority: 'Medium',
      remarks: 'Image quality is low and requires manual confirmation.',
      reviewedBy: '',
      lastUpdated: ''
    },
    {
      id: 'KYC-003',
      name: 'Vamsi Valluri',
      email: 'vamsi.valluri@college.edu',
      document: 'Resume',
      status: 'Pending',
      date: '2026-02-03',
      priority: 'Low',
      remarks: 'Resume metadata missing signature block.',
      reviewedBy: '',
      lastUpdated: ''
    }
  ]);

  const [verificationSearch, setVerificationSearch] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState('All');
  const [verificationDocFilter, setVerificationDocFilter] = useState('All');
  const [activeVerification, setActiveVerification] = useState(null);
  const [verificationActionNote, setVerificationActionNote] = useState('');
  const [verificationToast, setVerificationToast] = useState('');

  useEffect(() => {
    try {
      const storedQueue = localStorage.getItem(verificationStorageKey);
      if (!storedQueue) return;
      const parsedQueue = JSON.parse(storedQueue);
      if (Array.isArray(parsedQueue) && parsedQueue.length > 0) {
        setVerificationQueue(parsedQueue);
      }
    } catch (error) {
      console.warn('Unable to restore verification queue from local storage.');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(verificationStorageKey, JSON.stringify(verificationQueue));
    } catch (error) {
      console.warn('Unable to persist verification queue.');
    }
  }, [verificationQueue]);

  const verificationDocumentOptions = useMemo(
    () => ['All', ...new Set(verificationQueue.map((item) => item.document))],
    [verificationQueue]
  );

  const verificationSummary = useMemo(() => {
    const summary = { all: verificationQueue.length, pending: 0, verified: 0, rejected: 0 };

    verificationQueue.forEach((item) => {
      if (item.status === 'Verified') summary.verified += 1;
      else if (item.status === 'Rejected') summary.rejected += 1;
      else summary.pending += 1;
    });

    return summary;
  }, [verificationQueue]);

  const filteredVerificationQueue = useMemo(() => {
    const query = verificationSearch.trim().toLowerCase();

    return verificationQueue.filter((item) => {
      const statusMatch = verificationStatusFilter === 'All' || item.status === verificationStatusFilter;
      const docMatch = verificationDocFilter === 'All' || item.document === verificationDocFilter;
      const queryMatch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        String(item.email || '').toLowerCase().includes(query);

      return statusMatch && docMatch && queryMatch;
    });
  }, [verificationQueue, verificationSearch, verificationStatusFilter, verificationDocFilter]);

  const prioritizedVerificationQueue = useMemo(() => {
    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    const statusRank = { Pending: 0, Rejected: 1, Verified: 2 };

    return [...filteredVerificationQueue].sort((first, second) => {
      const statusDiff = (statusRank[first.status] ?? 9) - (statusRank[second.status] ?? 9);
      if (statusDiff !== 0) return statusDiff;

      const priorityDiff = (priorityRank[first.priority] ?? 9) - (priorityRank[second.priority] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;

      return String(first.date).localeCompare(String(second.date));
    });
  }, [filteredVerificationQueue]);

  const handleVerifyKyc = (id, status, note = '') => {
    const shouldProceed = status === 'Rejected'
      ? window.confirm('Are you sure you want to reject this document?')
      : true;

    if (!shouldProceed) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const reviewerName = user?.name || 'Staff Reviewer';

    setVerificationQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              remarks: note.trim() || item.remarks || '',
              reviewedBy: reviewerName,
              lastUpdated: timestamp
            }
          : item
      )
    );

    setVerificationToast(`${id} marked as ${status}.`);
    setTimeout(() => setVerificationToast(''), 2200);
  };

  const openVerificationDetails = (item) => {
    setActiveVerification(item);
    setVerificationActionNote(item.remarks || '');
  };

  const handleBulkVerification = (status) => {
    const pendingIds = prioritizedVerificationQueue
      .filter((item) => item.status === 'Pending')
      .map((item) => item.id);

    if (!pendingIds.length) {
      setVerificationToast('No pending records available for bulk action.');
      setTimeout(() => setVerificationToast(''), 2200);
      return;
    }

    const shouldProceed = window.confirm(`Apply \"${status}\" to ${pendingIds.length} pending records?`);
    if (!shouldProceed) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const reviewerName = user?.name || 'Staff Reviewer';

    setVerificationQueue((prev) =>
      prev.map((item) =>
        pendingIds.includes(item.id)
          ? { ...item, status, reviewedBy: reviewerName, lastUpdated: timestamp }
          : item
      )
    );

    setVerificationToast(`${pendingIds.length} records marked as ${status}.`);
    setTimeout(() => setVerificationToast(''), 2200);
  };

  const handleResetVerificationQueue = () => {
    const shouldReset = window.confirm('Reset all KYC statuses back to Pending?');
    if (!shouldReset) return;

    setVerificationQueue((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'Pending',
        reviewedBy: '',
        lastUpdated: ''
      }))
    );

    setVerificationToast('Verification queue has been reset.');
    setTimeout(() => setVerificationToast(''), 2200);
  };

  // Companies
  const [mockCompanies] = useState([
    { name: 'Google', date: 'Feb 12', role: 'SDE-1', package: '32 LPA', status: 'Upcoming', interviews: 12, openings: 15, eligibility: 'CGPA 8+' },
    { name: 'Microsoft', date: 'Feb 15', role: 'SWE', package: '44 LPA', status: 'Confirmed', interviews: 8, openings: 10, eligibility: 'CGPA 8.5+' },
    { name: 'Amazon', date: 'Feb 20', role: 'SDE', package: '28 LPA', status: 'Processing', interviews: 15, openings: 20, eligibility: 'CGPA 7.5+' },
    { name: 'TechCorp', date: 'Feb 25', role: 'Backend Dev', package: '18 LPA', status: 'Registered', interviews: 5, openings: 8, eligibility: 'CGPA 7+' }
  ]);

  // Menu Items
  const menuItems = [
    { id: 'dashboard', translationKey: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', translationKey: 'myProfile', label: 'My Profile', icon: User },
    { id: 'all-students', translationKey: 'studentDatabase', label: 'Student Database', icon: Users },
    { id: 'student-risk', translationKey: 'studentRiskQueue', label: 'Student Risk Queue', icon: AlertTriangle },
    { id: 'video-interviews', translationKey: 'videoInterviews', label: 'Video Interviews', icon: Video },
    { id: 'interview-ops', translationKey: 'interviewOps', label: 'Interview Ops Board', icon: Calendar },
    { id: 'drive-ops', translationKey: 'driveOps', label: 'Drive Operations', icon: Building2 },
    { id: 'applications', translationKey: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'verification', translationKey: 'kycVerification', label: 'KYC Verification', icon: UserCheck },
    { id: 'exam-desk', translationKey: 'examDesk', label: 'Exam Desk', icon: BookOpen }, // Exam Desk for HR/Staff
    { id: 'resume-desk', translationKey: 'resumeReviewDesk', label: 'Resume Review Desk', icon: FileText },
    { id: 'task-manager', translationKey: 'taskManager', label: 'Task Manager', icon: ClipboardList },
    { id: 'ticketing', translationKey: 'studentTicketing', label: 'Student Ticketing', icon: Inbox },
    { id: 'staff-audit', translationKey: 'staffAuditTrail', label: 'Staff Audit Trail', icon: Shield },
    { id: 'staff-performance', translationKey: 'staffPerformance', label: 'Staff Performance', icon: TrendingUp },
    { id: 'quick-actions', translationKey: 'quickActions', label: 'Quick Actions', icon: Zap },
    { id: 'analytics', translationKey: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
    { id: 'reports', translationKey: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'email', translationKey: 'emailCenter', label: 'Email Center', icon: Mail },
    { id: 'classes', translationKey: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'theme', translationKey: 'theme', label: 'Theme', icon: SettingsIcon },
  ];  // Theme Colors - Dynamic
  const colors = {
    light: {
      bg: '#f8fafc',
      bgSecondary: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#475569',
      border: 'rgba(15, 23, 42, 0.08)',
      card: '#ffffff',
      hover: 'rgba(99, 102, 241, 0.06)',
      sidebar: '#ffffff',
      input: '#f8fafc',
      accent: '#6366f1'
    },
    dark: {
      bg: '#080c14',
      bgSecondary: '#0f172a',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.08)',
      card: 'rgba(15, 23, 42, 0.65)',
      hover: 'rgba(99, 102, 241, 0.12)',
      sidebar: 'rgba(8, 12, 20, 0.7)',
      input: 'rgba(15, 23, 42, 0.8)',
      accent: '#818cf8'
    }
  };
  useEffect(() => {
    localStorage.setItem('placement_system_theme', theme);
  }, [theme]);

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    // Update document element with theme attribute
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.toggle('dark', isDark);
    if (isDark) {
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.body.style.backgroundColor = '#f9fafb';
    }
  }, [resolvedTheme, isDark]);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      applySystemTheme();
      mediaQuery.addEventListener('change', applySystemTheme);
      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    }

    setResolvedTheme(theme);
    return undefined;
  }, [theme]);
  const currentColors = colors[resolvedTheme];

  // Inline StatCard component for analytics cards
  const StatCard = ({ icon: Icon, label, value, trend, color, details }) => (
    <div 
      style={{ 
        backgroundColor: currentColors.card,
        borderColor: currentColors.border,
        color: currentColors.text
      }}
      className="border p-6 rounded-[2rem] hover:border-indigo-500/50 transition-colors cursor-default group bg-white/5"
    >
      <div className="flex justify-between items-start mb-4">
        <Icon className={`w-8 h-8 ${color} group-hover:scale-110 transition-transform`} />
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${trend.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-4xl font-black">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: currentColors.textSecondary }}>{label}</p>
      {details && <p className="text-[10px] mt-2" style={{ color: currentColors.textSecondary }}>{details}</p>}
    </div>
  );

  const staffSourceStudents = (Array.isArray(students) && students.length ? students : mockRecentStudents);
  const riskQueue = useMemo(() => {
    return staffSourceStudents.map((student) => {
      const cgpa = Number(student?.cgpa || 0);
      const attendance = Number(student?.attendance || 0);
      const backlogs = Number(student?.backlogs || 0);
      const profilePenalty = student?.resumeVerified ? 0 : 20;
      const score = Math.min(100, Math.max(0, (8 - cgpa) * 10 + (90 - attendance) + backlogs * 12 + profilePenalty));
      const priority = score >= 40 ? 'High' : score >= 20 ? 'Medium' : 'Low';
      return {
        id: student?.id || student?._id,
        name: student?.name || 'Student',
        email: student?.email || '',
        branch: student?.branch || 'N/A',
        cgpa,
        attendance,
        backlogs,
        resumeVerified: !!student?.resumeVerified,
        riskScore: Number(score.toFixed(1)),
        priority
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [staffSourceStudents]);

  const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

  const handleAssignMentor = (riskItem) => {
    const currentMentor = mentorAssignments[riskItem.id] || (staffProfile?.name || 'Placement Mentor');
    const mentorName = window.prompt(`Assign mentor for ${riskItem.name}`, currentMentor);

    if (!mentorName || !mentorName.trim()) {
      return;
    }

    const cleanMentorName = mentorName.trim();
    setMentorAssignments((prev) => ({ ...prev, [riskItem.id]: cleanMentorName }));
    setRiskActionMessage({
      type: 'success',
      text: `Mentor '${cleanMentorName}' assigned to ${riskItem.name}.`
    });
  };

  const handleSendRiskReminder = async (riskItem) => {
    setRiskReminderLoadingId(riskItem.id);

    try {
      const payload = {
        title: 'Placement Action Required',
        message: `Hi ${riskItem.name}, this is a reminder to complete pending placement tasks and respond to your mentor updates.`,
        type: 'alert'
      };

      if (isMongoObjectId(riskItem.id)) {
        await notificationsAPI.sendDirect({ ...payload, recipientId: riskItem.id });
      } else if (riskItem.email) {
        await notificationsAPI.sendDirect({ ...payload, recipientEmail: riskItem.email });
      } else {
        throw new Error('Student recipient information is missing');
      }

      setRiskActionMessage({
        type: 'success',
        text: `Reminder sent to ${riskItem.name}.`
      });
    } catch (error) {
      setRiskActionMessage({
        type: 'error',
        text: `Failed to send reminder for ${riskItem.name}: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setRiskReminderLoadingId('');
    }
  };

  const slaSummary = useMemo(() => {
    const pendingKyc = verificationQueue.filter((item) => item.status === 'Pending').length;
    const feedbackPending = interviewOpsBoard.filter((item) => item.stage === 'feedback-pending').length;
    const openTickets = staffTickets.filter((item) => item.status !== 'resolved').length;
    const overdueTasks = staffTasks.filter((task) => task.status !== 'completed' && new Date(task.dueDate) < new Date()).length;
    return {
      pendingKyc,
      feedbackPending,
      openTickets,
      overdueTasks,
      totalBreaches: pendingKyc + feedbackPending + overdueTasks
    };
  }, [verificationQueue, interviewOpsBoard, staffTickets, staffTasks]);

  const staffPerformanceSummary = useMemo(() => {
    const completedTasks = staffTasks.filter((task) => task.status === 'completed').length;
    const reviewedResumes = resumeReviewQueue.filter((item) => item.status === 'reviewed').length;
    const resolvedTickets = staffTickets.filter((ticket) => ticket.status === 'resolved').length;
    return {
      completedTasks,
      totalTasks: staffTasks.length,
      reviewedResumes,
      totalResumes: resumeReviewQueue.length,
      resolvedTickets,
      totalTickets: staffTickets.length,
      productivity: staffTasks.length ? Math.round((completedTasks / staffTasks.length) * 100) : 0
    };
  }, [staffTasks, resumeReviewQueue, staffTickets]);

  const updateTaskStatus = (id, status) => {
    setStaffTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  const updateInterviewStage = (id, stage) => {
    setInterviewOpsBoard((prev) => prev.map((item) => (item.id === id ? { ...item, stage } : item)));
  };

  const toggleDriveChecklist = (id) => {
    setDriveOps((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    }));
  };

  const createTicket = () => {
    if (!ticketDraft.studentName || !ticketDraft.question) {
      alert('Please enter student name and question');
      return;
    }
    const newTicket = {
      id: `TIC-${String(Date.now()).slice(-5)}`,
      studentName: ticketDraft.studentName,
      category: ticketDraft.category,
      status: 'open',
      priority: 'medium',
      assignee: 'You',
      question: ticketDraft.question
    };
    setStaffTickets((prev) => [newTicket, ...prev]);
    setTicketDraft({ studentName: '', category: 'General', question: '' });
  };

  const runQuickAction = (actionName) => {
    const timestamp = new Date().toLocaleString();
    const msg = `${actionName} executed at ${timestamp}`;
    setQuickActionResult(msg);
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3000);
  };

  // ========== DATA FETCHING FROM BACKEND ==========
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const handleRefresh = () => {
      fetchAllData();
    };

    const intervalId = setInterval(handleRefresh, 30000);
    window.addEventListener('focus', handleRefresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [user, navigate]);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const results = await Promise.allSettled([
        studentAPI.getCsv(),
        placementsAPI.getAll(),
        jobAPI.getAll(),
        examsAPI.getAll(),
        placementStatsAPI.getAll(),
        statsAPI.getStaffStats()
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
              id: csvStudent.studentId || csvStudent._id,
              name: csvStudent.name || `Student ${csvStudent.studentId}`,
              email: csvStudent.email,
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
              section: csvStudent.branch,
              status: csvStudent.placementStatus === 'Placed' ? 'placed' : csvStudent.placementStatus === 'In Process' ? 'interviewing' : 'pending',
              resumeVerified: true,
              attendance: 90, // Default value
              fees: 'Paid', // Default value
              phone: csvStudent.email?.replace('@college.edu', '').replace('student', '+91 98765 ')
            }));
            setStudents(formattedStudents);
            studentsFetched = true;
          }
        } catch (e) {
          console.warn('Error processing CSV students:', e);
        }
      }

      // Fallback if CSV failed or returned empty
      if (!studentsFetched) {
        try {
          const studentsRes = await studentAPI.getAll();
          const apiStudents = studentsRes.data.students || studentsRes.data || [];
          if (apiStudents.length > 0) {
            setStudents(apiStudents);
          } else {
            setStudents(mockRecentStudents);
          }
        } catch (innerError) {
          console.warn('Failed to fetch students from regular API, using mock data:', innerError);
          setStudents(mockRecentStudents);
        }
      }

      // 2. Process Placements (index 1)
      const placementsResult = results[1];
      if (placementsResult.status === 'fulfilled') {
        setPlacements(placementsResult.value.data.placements || []);
      } else {
        console.error('Error fetching placements:', placementsResult.reason);
        setPlacements([]);
      }

      // 3. Process Jobs (index 2)
      const jobsResult = SwapJobsResultHelper(results[2]);
      setJobs(jobsResult);

      // 4. Process Exams (index 3)
      const examsResult = results[3];
      if (examsResult.status === 'fulfilled') {
        setExams(examsResult.value.data.exams || []);
      } else {
        console.error('Error fetching exams:', examsResult.reason);
        setExams([]);
      }

      // 5. Process Placement Stats (index 4)
      const placementStatsResult = results[4];
      if (placementStatsResult.status === 'fulfilled') {
        const statsRes = placementStatsResult.value;
        if (statsRes.data && statsRes.data.placements) {
          setPlacementStats(statsRes.data);
        }
      } else {
        console.warn('Error fetching placement statistics:', placementStatsResult.reason);
      }

      // 6. Process Staff Stats (index 5)
      const staffStatsResult = results[5];
      if (staffStatsResult.status === 'fulfilled') {
        setDashboardStats(staffStatsResult.value.data || stats);
      } else {
        console.error('Error fetching stats:', staffStatsResult.reason);
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Helper helper to handle Job Result parsing
  const SwapJobsResultHelper = (jobRes) => {
    if (jobRes.status === 'fulfilled') {
      return jobRes.value.data.jobs || mockCompanies;
    }
    console.error('Error fetching jobs:', jobRes.reason);
    return mockCompanies;
  };

  // ========== FIXED LOGOUT HANDLER ==========
  const handleLogout = async () => {
    setIsLoading(true);
    setLogoutSuccess(false);
    
    try {
      // Step 1: Try to notify backend (optional - doesn't block)
      try {
        // Use fetch instead of axios to avoid circular imports
        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 2000 // 2 second timeout
          }).catch(() => {
            // Silently fail - we'll clear locally anyway
            console.warn('Backend logout call failed, proceeding with local logout');
          });
        }
      } catch (backendError) {
        console.warn('Backend logout attempted but failed:', backendError.message);
      }
      
      // Step 2: Clear ALL local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('placement_system_theme');
      
      // Step 3: Clear session storage
      sessionStorage.clear();
      
      // Step 4: Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Step 5: Show success message
      setLogoutSuccess(true);
      
      console.log('✅ Local logout completed successfully');
      
      // Step 6: Redirect after brief delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Fatal logout error:', error);
      // Even if error, force redirect
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }, 1500);
    }
  };

  const confirmLogout = () => {
    handleLogout();
  };

  // Event Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target.result);
        setShowImageCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropImage = () => {
    setStaffProfile({ ...staffProfile, image: tempImage });
    setShowImageCropModal(false);
    setTempImage(null);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendNotification = async () => {
    if (notificationMessage.trim() && selectedStudents.length > 0) {
      try {
        const res = await notificationsAPI.sendBulk({
          userIds: selectedStudents,
          title: 'Staff Notification',
          message: notificationMessage,
          type: 'system'
        });
        alert(res.data.message || `Notification sent to ${selectedStudents.length} students`);
        setNotificationMessage('');
        setShowNotificationModal(false);
        setSelectedStudents([]);
      } catch (err) {
        alert('Failed to send notification: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (filename, headers, rows) => {
    const escapeValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeValue).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (filename, title, content) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 30);
    
    // Content
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content, maxWidth);
    doc.text(lines, margin, 45);
    
    // Save
    doc.save(filename);
  };

  const normalizeCertifications = (certifications) => {
    if (Array.isArray(certifications)) return certifications.filter(Boolean);
    if (typeof certifications === 'string') {
      return certifications
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const getCertificationsCount = (certifications) => {
    if (Array.isArray(certifications)) return certifications.length;
    if (typeof certifications === 'number') return certifications;
    return normalizeCertifications(certifications).length;
  };

  const buildStudentReportContent = (student) => {
    const certificationsList = normalizeCertifications(student?.certifications);
    const skillsList = Array.isArray(student?.skills) ? student.skills : [];

    return [
      `Name: ${student?.name || 'N/A'}`,
      `ID: ${student?.id || 'N/A'}`,
      `Email: ${student?.email || 'N/A'}`,
      `Phone: ${student?.phone || 'N/A'}`,
      `Branch: ${student?.branch || 'N/A'}`,
      `Section: ${student?.section || 'N/A'}`,
      `CGPA: ${student?.cgpa || 'N/A'}`,
      `Backlogs: ${student?.backlogs ?? 'N/A'}`,
      `Attendance: ${student?.attendance ?? 'N/A'}%`,
      `Fees: ${student?.fees || 'N/A'}`,
      `Placement Status: ${student?.placementStatus || 'N/A'}`,
      `Status: ${student?.status || 'N/A'}`,
      `Skills: ${skillsList.join(', ') || 'N/A'}`,
      `Certifications: ${certificationsList.join(', ') || 'N/A'}`,
      `Resume Version: ${student?.resumeVersion || 'N/A'}`,
      `Video Interviews: ${student?.videoInterviews ?? 'N/A'}`,
      `Portfolio: ${student?.portfolioLink || 'N/A'}`
    ].join('\n');
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for students:`, selectedStudents);

    if (action === 'Download Reports') {
      const content = [
        'Placement Report',
        `Date: ${new Date().toLocaleDateString()}`,
        `Selected Students: ${selectedStudents.length}`,
        `Total Students: ${stats.totalStudents}`,
        `Placement Rate: ${stats.placementRate}%`
      ].join('\n');
      downloadTextFile('placement-report.txt', content);
      return;
    }

    alert(`${action} executed for ${selectedStudents.length} students`);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await statsAPI.updateProfile({
        name: staffProfile.name,
        phone: staffProfile.phone,
        avatar: staffProfile.image
      });
      if (response.data.success) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            name: staffProfile.name,
            phone: staffProfile.phone,
            avatar: staffProfile.image
          }));
        }
        alert('Profile updated successfully!');
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Filter students with useMemo to prevent unnecessary recalculations
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.filter(s => {
      if (!s || !s.id) return false;
      
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return filterBranch === 'All' || (s.section || '') === filterBranch;
      
      const nameMatch = (s.name || '').toLowerCase().includes(searchLower);
      const emailMatch = (s.email || '').toLowerCase().includes(searchLower);
      const idMatch = (s.id || '').toLowerCase().includes(searchLower);
      const branchMatch = (s.branch || '').toLowerCase().includes(searchLower);
      const skillsMatch = s.skills && Array.isArray(s.skills) && s.skills.some(skill => (skill || '').toLowerCase().includes(searchLower));
      const sectionFilter = filterBranch === 'All' || (s.section || '') === filterBranch;
      
      return (nameMatch || emailMatch || idMatch || branchMatch || skillsMatch) && sectionFilter;
    });
  }, [students, searchTerm, filterBranch]);

  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 15;

  useEffect(() => {
    setStudentPage(1);
  }, [searchTerm, filterBranch]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (studentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, studentPage, studentsPerPage]);

  const totalStudentPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  }, [filteredStudents.length, studentsPerPage]);

  // UI Components
  const Modal = ({ title, children, onClose, size = 'lg' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        style={{ 
          backgroundColor: currentColors.card,
          borderColor: currentColors.border,
          color: currentColors.text
        }}
        className={`border w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        {children}
      </div>
    </div>
  );



  // Dashboard Home
  const DashboardHome = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} trend="+45" color="text-blue-500" />
        <StatCard icon={CheckCircle} label="Placement Rate" value={`${stats.placementRate}%`} trend="+8%" color="text-emerald-500" />
        <StatCard icon={Calendar} label="Active Interviews" value={stats.activeInterviews} trend="Live" color="text-purple-500" />
        <StatCard icon={Award} label="High Tier (9.0+)" value={stats.topTier} trend="+12" color="text-amber-500" />
      </div>

      {/* Academic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookOpen} label="Avg Attendance" value={`${stats.averageAttendance}%`} color="text-indigo-500" details="Across all sections" />
        <StatCard icon={BarChart3} label="Pass Rate" value={`${stats.passPercentage}%`} color="text-cyan-500" details="Last semester results" />
        <StatCard icon={DollarSign} label="Fees Collected" value={`${stats.feesCollected}%`} color="text-lime-500" details="Payment collection status" />
      </div>

      {/* Placements & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FileText} label="Resumes Built" value={stats.resumesBuilt} color="text-pink-500" details="Templates used & verified" />
        <StatCard icon={Video} label="Videos Uploaded" value={stats.videosUploaded} color="text-red-500" details="HR interview recordings" />
        <StatCard icon={Code} label="Certified Skills" value={stats.skillsCertified} color="text-orange-500" details="AWS, Google, Microsoft" />
      </div>

      {/* New Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={Inbox} label="New Applications" value={stats.newApplications} color="text-violet-500" details="This month" />
        <StatCard icon={Flag} label="Offers Extended" value={stats.offersExtended} color="text-fuchsia-500" details="Pending acceptance" />
      </div>

      {/* Sections Overview */}
      <div 
        style={{ 
          backgroundColor: currentColors.card,
          borderColor: currentColors.border
        }}
        className="border rounded-[2.5rem] p-8"
      >
        <h2 style={{ color: currentColors.text }} className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Building2 className="text-indigo-500" /> College Sections Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collegeSections.map(section => (
            <div 
              key={section.id} 
              style={{ 
                backgroundColor: currentColors.card,
                borderColor: currentColors.border
              }}
              className="border rounded-2xl p-6 hover:border-indigo-500/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 style={{ color: currentColors.text }} className="text-lg font-bold group-hover:text-indigo-400">{section.name}</h4>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs mt-1">HR: {section.hr}</p>
                </div>
                <Users style={{ color: currentColors.textSecondary }} className="w-5 h-5" />
              </div>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span style={{ color: currentColors.textSecondary }}>Students</span>
                  <span style={{ color: currentColors.text }} className="font-bold">{section.students}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentColors.textSecondary }}>Attendance</span>
                  <span className={`font-bold ${section.attendance >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{section.attendance}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentColors.textSecondary }}>Avg CGPA</span>
                  <span className="font-bold text-indigo-400">{section.avgCGPA}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentColors.textSecondary }}>Placement</span>
                  <span className="font-bold text-emerald-400">{section.placement}%</span>
                </div>
              </div>
              <button style={{ borderColor: 'rgb(99, 102, 241, 0.3)', backgroundColor: 'rgb(99, 102, 241, 0.2)' }} className="w-full py-2 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-600/40 transition-all border">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Pipeline */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div 
          style={{ 
            backgroundColor: currentColors.card,
            borderColor: currentColors.border
          }}
          className="lg:col-span-2 border rounded-[2.5rem] p-8"
        >
          <h2 style={{ color: currentColors.text }} className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="text-indigo-500" /> Pipeline Overview
          </h2>
          <div className="space-y-4">
            {mockRecentStudents.slice(0, 4).map((s) => (
              <div 
                key={s.id} 
                style={{ 
                  backgroundColor: currentColors.hover,
                  borderColor: currentColors.border
                }}
                className="group p-5 rounded-2xl border flex justify-between items-center hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-bold" style={{ color: currentColors.text }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 style={{ color: currentColors.text }} className="font-bold group-hover:text-indigo-400 transition-colors">{s.name}</h4>
                    <p style={{ color: currentColors.textSecondary }} className="text-xs">{s.branch} ({s.cgpa}) • {s.placementStatus}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    s.status === 'placed' ? 'bg-emerald-500/10 text-emerald-400' :
                    s.status === 'shortlisted' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <button onClick={() => { setSelectedStudent(s); setCurrentView('student-detail'); }} className="p-3 bg-white/5 rounded-xl hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Staff Operations</h3>
            <div className="space-y-3">
              <button onClick={() => setShowScheduleModal(true)} className="w-full bg-white/10 hover:bg-white text-white hover:text-indigo-900 py-4 rounded-2xl font-bold transition-all flex items-center px-6 gap-3">
                <Calendar className="w-5 h-5" /> Schedule Drive
              </button>
              <button onClick={() => setCurrentView('video-interviews')} className="w-full bg-white/10 hover:bg-white text-white hover:text-indigo-900 py-4 rounded-2xl font-bold transition-all flex items-center px-6 gap-3">
                <Video className="w-5 h-5" /> Video Interviews
              </button>
              <button onClick={() => setCurrentView('verification')} className="w-full bg-white/10 hover:bg-white text-white hover:text-indigo-900 py-4 rounded-2xl font-bold transition-all flex items-center px-6 gap-3">
                <FileText className="w-5 h-5" /> Verify KYCs
              </button>
            </div>
          </div>

          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2.5rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="font-bold mb-6 flex items-center gap-2">
              <Building2 style={{ color: currentColors.textSecondary }} className="w-4 h-4" /> Upcoming Drives
            </h3>
            <div className="space-y-4">
              {mockCompanies.map((c, i) => (
                <div 
                  key={i} 
                  style={{ 
                    borderColor: currentColors.border
                  }}
                  className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                >
                  <div>
                    <p style={{ color: currentColors.text }} className="text-sm font-bold">{c.name}</p>
                    <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase">{c.date} • {c.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{c.package}</p>
                    <p style={{ color: currentColors.textSecondary }} className="text-[9px] mt-1">{c.interviews} interviews</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2.5rem] p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: currentColors.text }} className="font-bold flex items-center gap-2">
                <Bell style={{ color: currentColors.textSecondary }} className="w-4 h-4" /> Notifications
              </h3>
              <button
                onClick={() => setShowNotificationsDropdown(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Open
              </button>
            </div>

            {notificationsLoading ? (
              <p style={{ color: currentColors.textSecondary }} className="text-sm">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p style={{ color: currentColors.textSecondary }} className="text-sm">No notifications available.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif, idx) => (
                  <div
                    key={notif._id || idx}
                    style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                    className="border rounded-xl p-3"
                  >
                    <p style={{ color: currentColors.text }} className="text-sm font-bold">{notif.title || notif.type}</p>
                    <p style={{ color: currentColors.textSecondary }} className="text-xs mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placement Statistics from Kaggle Data */}
      {placementStats && placementStats.placements && placementStats.placements.length > 0 && (
        <div 
          style={{ 
            backgroundColor: currentColors.card,
            borderColor: currentColors.border
          }}
          className="border rounded-[2.5rem] p-8"
        >
          <h2 style={{ color: currentColors.text }} className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Briefcase className="text-emerald-500" /> Placement Statistics (Current Year)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {placementStats.summary && (
              <>
                <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-6">
                  <p style={{ color: currentColors.textSecondary }} className="text-sm mb-2">Total Placements</p>
                  <p style={{ color: currentColors.text }} className="text-3xl font-bold">{placementStats.summary.totalPlacements}</p>
                  <p className="text-xs text-emerald-400 mt-2">Students placed</p>
                </div>
                <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-6">
                  <p style={{ color: currentColors.textSecondary }} className="text-sm mb-2">Avg Package</p>
                  <p style={{ color: currentColors.text }} className="text-3xl font-bold">₹{placementStats.summary.averagePackage} LPA</p>
                  <p className="text-xs text-emerald-400 mt-2">Average salary</p>
                </div>
                <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-6">
                  <p style={{ color: currentColors.textSecondary }} className="text-sm mb-2">Highest Package</p>
                  <p style={{ color: currentColors.text }} className="text-3xl font-bold">₹{placementStats.summary.highestPackage} LPA</p>
                  <p className="text-xs text-emerald-400 mt-2">Top placement</p>
                </div>
              </>
            )}
          </div>
          
          <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-4">Top Recruiting Companies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placementStats.placements.slice(0, 6).map((company, idx) => (
              <div 
                key={idx}
                style={{ 
                  backgroundColor: currentColors.hover,
                  borderColor: currentColors.border
                }}
                className="border rounded-2xl p-5 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 style={{ color: currentColors.text }} className="font-bold text-sm">{company.company}</h4>
                    <p className="text-xs text-emerald-400 mt-1">{company.position}</p>
                  </div>
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: currentColors.textSecondary }}>Salary</span>
                    <span style={{ color: currentColors.text }} className="font-bold">₹{company.salary} LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentColors.textSecondary }}>Located</span>
                    <span style={{ color: currentColors.text }} className="font-bold">{company.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentColors.textSecondary }}>Placed</span>
                    <span className="font-bold text-emerald-400">{company.totalStudentsPlaced} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentColors.textSecondary }}>Package Range</span>
                    <span style={{ color: currentColors.text }} className="font-bold">₹{company.lowestPackage}-{company.highestPackage} LPA</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg text-xs font-bold transition-all">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Student Directory
  const StudentDirectory = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <h2 style={{ color: currentColors.text }} className="text-3xl font-bold">Student Directory</h2>
          {selectedStudents.length > 0 && <p className="text-sm text-indigo-400 mt-2">{selectedStudents.length} students selected</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select 
            onChange={(e) => setFilterBranch(e.target.value)} 
            style={{ 
              backgroundColor: currentColors.input,
              borderColor: currentColors.border,
              color: currentColors.text
            }}
            className="border rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none"
          >
            <option value="All">All Classes</option>
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
            <option value="ECE-A">ECE-A</option>
            <option value="ECE-B">ECE-B</option>
            <option value="MECH-A">MECH-A</option>
            <option value="EEE-A">EEE-A</option>
          </select>
          <div className="relative flex-1 sm:w-80">
            <Search style={{ color: currentColors.textSecondary }} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, skill or ID..." 
              style={{ 
                backgroundColor: currentColors.input,
                borderColor: currentColors.border,
                color: currentColors.text
              }}
              className="w-full border rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 ring-indigo-500 outline-none placeholder-slate-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={{ borderColor: currentColors.border, backgroundColor: currentColors.hover }} className="p-3 border rounded-2xl hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedStudents.length > 0 && (
        <div style={{ backgroundColor: 'rgb(99, 102, 241, 0.2)', borderColor: 'rgb(99, 102, 241, 0.3)' }} className="border rounded-2xl p-4 flex justify-between items-center">
          <p style={{ color: currentColors.text }} className="text-sm font-bold">{selectedStudents.length} student(s) selected</p>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkActionModal(true)} className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all">
              Bulk Action
            </button>
            <button onClick={() => setShowNotificationModal(true)} className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all">
              Notify Selected
            </button>
          </div>
        </div>
      )}

      <div 
        style={{ 
          backgroundColor: currentColors.card,
          borderColor: currentColors.border
        }}
        className="border rounded-[2.5rem] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border-b text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-6">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(filteredStudents.map(s => s.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }} 
                    className="w-4 h-4 rounded" 
                  />
                </th>
                <th className="p-6">Basic Info</th>
                <th className="p-6">Demographics</th>
                <th className="p-6">Academic</th>
                <th className="p-6">Experience</th>
                <th className="p-6">Skills Rating</th>
                <th className="p-6">Placement</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedStudents.map(s => (
                <tr 
                  key={s.id} 
                  style={{ 
                    borderColor: currentColors.border
                  }}
                  className="border-t hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-6">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(s.id)} 
                      onChange={() => handleSelectStudent(s.id)} 
                      className="w-4 h-4 rounded" 
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }} className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-indigo-400">
                        {(s.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: currentColors.text }} className="font-bold group-hover:text-indigo-400">{s.name || 'Unknown'}</p>
                        <p style={{ color: currentColors.textSecondary }} className="text-[10px] font-bold">{s.email || 'N/A'}</p>
                        <p style={{ color: currentColors.textSecondary }} className="text-[10px]">ID: {s.id || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div>
                      <p style={{ color: currentColors.text }} className="font-semibold">{s.age || 'N/A'} yrs</p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[11px]">{s.gender || 'N/A'}</p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[10px] mt-1">{s.degree || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <p style={{ color: currentColors.text }} className="font-semibold">{s.branch || 'N/A'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span style={{ color: currentColors.textSecondary }} className="text-[11px]">CGPA: <span className="text-indigo-400 font-bold">{s.cgpa || '0.0'}</span></span>
                      <span className={`text-[11px] font-bold ${(s.backlogs || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {s.backlogs || 0} Backlogs
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div>
                      <p style={{ color: currentColors.textSecondary }} className="text-[11px]">Internships: <span className="text-blue-400 font-bold">{s.internships || 0}</span></p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[11px]">Projects: <span className="text-emerald-400 font-bold">{s.projects || 0}</span></p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[11px]">Certifications: <span className="text-amber-400 font-bold">{getCertificationsCount(s.certifications)}</span></p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div style={{ backgroundColor: currentColors.hover }} className="p-2 rounded-lg space-y-1">
                      <p style={{ color: currentColors.textSecondary }} className="text-[10px]">Coding: <span className="text-indigo-400 font-bold">{s.codingSkills || 0}/10</span></p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[10px]">Aptitude: <span className="text-emerald-400 font-bold">{s.aptitudeTestScore || 0}/100</span></p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[10px]">Communication: <span className="text-blue-400 font-bold">{s.communicationSkills || 0}/10</span></p>
                      <p style={{ color: currentColors.textSecondary }} className="text-[10px]">Soft Skills: <span className="text-purple-400 font-bold">{s.softSkillsRating || 0}/10</span></p>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      (s.placementStatus || '').toLowerCase() === 'placed' ? 'bg-emerald-500/10 text-emerald-400' : 
                      (s.placementStatus || '').toLowerCase() === 'in process' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {s.placementStatus || 'Not Placed'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setSelectedStudent(s); setCurrentView('student-detail'); }} className="p-2 hover:bg-indigo-600 rounded-lg transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-blue-600 rounded-lg transition-all">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-emerald-600 rounded-lg transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ borderColor: currentColors.border }} className="border-t p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5">
          <p style={{ color: currentColors.textSecondary }} className="text-xs font-semibold">
            Showing <span style={{ color: currentColors.text }} className="font-extrabold">{Math.min(filteredStudents.length, (studentPage - 1) * studentsPerPage + 1)}</span> to{' '}
            <span style={{ color: currentColors.text }} className="font-extrabold">{Math.min(filteredStudents.length, studentPage * studentsPerPage)}</span> of{' '}
            <span style={{ color: currentColors.text }} className="font-extrabold">{filteredStudents.length}</span> students
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStudentPage(p => Math.max(1, p - 1))}
              disabled={studentPage === 1}
              style={{ 
                backgroundColor: studentPage === 1 ? 'transparent' : currentColors.hover, 
                borderColor: currentColors.border,
                color: studentPage === 1 ? currentColors.textSecondary : currentColors.text 
              }}
              className="border px-4 py-2 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500/10"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1.5">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, studentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalStudentPages, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setStudentPage(i)}
                      style={{
                        backgroundColor: studentPage === i ? 'rgb(99, 102, 241)' : currentColors.hover,
                        color: studentPage === i ? '#ffffff' : currentColors.text,
                        borderColor: studentPage === i ? 'rgb(99, 102, 241)' : currentColors.border
                      }}
                      className="border w-9 h-9 rounded-2xl text-xs font-bold transition-all hover:border-indigo-500/50"
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>

            <button
              onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
              disabled={studentPage === totalStudentPages}
              style={{ 
                backgroundColor: studentPage === totalStudentPages ? 'transparent' : currentColors.hover, 
                borderColor: currentColors.border,
                color: studentPage === totalStudentPages ? currentColors.textSecondary : currentColors.text 
              }}
              className="border px-4 py-2 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500/10"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Student Detail View
  const StudentDetailView = () => {
    const s = selectedStudent;
    if (!s) return null;
    const skillsList = Array.isArray(s.skills) ? s.skills : [];
    const certificationsList = normalizeCertifications(s.certifications);
    const certificationsCount = getCertificationsCount(s.certifications);
    
    return (
      <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('all-students')} 
            style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
            className="p-3 border rounded-2xl hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold">{s.name || 'Unknown'}</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-xs mt-1">
              {s.branch || 'N/A'} ({s.section || 'N/A'}) • ID: STU{String(s.id || '').padStart(5, '0')}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="border rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 style={{ color: currentColors.text }} className="text-lg font-bold">Student Data Export</h3>
              <p style={{ color: currentColors.textSecondary }} className="text-xs">Download the selected student record</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const headers = [
                    'ID',
                    'Name',
                    'Email',
                    'Phone',
                    'Branch',
                    'Section',
                    'CGPA',
                    'Backlogs',
                    'Attendance',
                    'Fees',
                    'Status',
                    'Placement Status',
                    'Skills',
                    'Certifications',
                    'Resume Version',
                    'Video Interviews',
                    'Portfolio'
                  ];
                  const row = [
                    s.id || '',
                    s.name || '',
                    s.email || '',
                    s.phone || '',
                    s.branch || '',
                    s.section || '',
                    s.cgpa || '',
                    s.backlogs ?? '',
                    s.attendance ?? '',
                    s.fees || '',
                    s.status || '',
                    s.placementStatus || '',
                    skillsList.join('; '),
                    certificationsList.join('; '),
                    s.resumeVersion || '',
                    s.videoInterviews ?? '',
                    s.portfolioLink || ''
                  ];
                  downloadCSV(`student-${s.id || 'record'}.csv`, headers, [row]);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" /> Excel
              </button>
              <button
                onClick={() => {
                  const content = buildStudentReportContent(s);
                  downloadPDF(`student-${s.id || 'record'}.pdf`, 'STUDENT PROFILE', content);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-6 flex items-center gap-2">
              <BookOpen className="text-indigo-400" /> Academic
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span style={{ color: currentColors.textSecondary }}>CGPA</span>
                <span style={{ color: currentColors.text }} className="font-bold">{s.cgpa}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentColors.textSecondary }}>Attendance</span>
                <span className="font-bold text-emerald-400">{s.attendance}%</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentColors.textSecondary }}>Backlogs</span>
                <span className={`font-bold ${s.backlogs > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {s.backlogs}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentColors.textSecondary }}>Fees Status</span>
                <span className={`font-bold ${s.fees === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {s.fees}
                </span>
              </div>
            </div>
          </div>

          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-6 flex items-center gap-2">
              <Briefcase className="text-purple-400" /> Placement
            </h3>
            <div className="space-y-4">
              <div>
                <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">
                  Status
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-1 ${
                  s.status === 'placed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {s.status}
                </span>
              </div>
              <div>
                <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">
                  Current
                </p>
                <p style={{ color: currentColors.text }} className="text-sm font-bold mt-1">
                  {s.placementStatus}
                </p>
              </div>
              <button 
                onClick={() => setShowVideoModal(true)} 
                className="w-full py-3 bg-indigo-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all mt-4 flex items-center justify-center gap-2 text-white"
              >
                <Video className="w-4 h-4" /> Schedule Interview
              </button>
            </div>
          </div>

          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-6 flex items-center gap-2">
              <Code className="text-emerald-400" /> Profile
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ color: currentColors.textSecondary }} className="text-sm">Resume</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.resumeVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {s.resumeVersion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: currentColors.textSecondary }} className="text-sm">Videos</span>
                <span className="font-bold text-blue-400">{s.videoInterviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: currentColors.textSecondary }} className="text-sm">Certified</span>
                <span className="font-bold text-yellow-400">{certificationsCount}</span>
              </div>
              {s.portfolioLink ? (
                <a
                  href={s.portfolioLink.startsWith('http') ? s.portfolioLink : `https://${s.portfolioLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-indigo-600/20 rounded-xl font-bold text-[11px] text-indigo-300 hover:bg-indigo-600/40 transition-all mt-4 text-center flex items-center justify-center gap-2 border border-indigo-500/30"
                >
                  <ExternalLink className="w-4 h-4" /> View Portfolio
                </a>
              ) : (
                <button
                  className="w-full py-2 bg-gray-700/40 rounded-xl font-bold text-[11px] text-gray-400 mt-4 text-center flex items-center justify-center gap-2 border border-gray-600 cursor-not-allowed"
                  title="No portfolio link available"
                  disabled
                >
                  <ExternalLink className="w-4 h-4" /> View Portfolio
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-4">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-indigo-500/20 rounded-xl text-sm font-bold text-indigo-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div 
            style={{ 
              backgroundColor: currentColors.card,
              borderColor: currentColors.border
            }}
            className="border rounded-[2rem] p-8"
          >
            <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-4">
              Certifications
            </h3>
            <div className="space-y-2">
              {certificationsList.map((cert, i) => (
                <div key={i} style={{ backgroundColor: currentColors.hover }} className="flex items-center gap-3 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span style={{ color: currentColors.text }} className="text-sm">
                    {cert}
                  </span>
                </div>
              ))}
              {certificationsList.length === 0 && (
                <p style={{ color: currentColors.textSecondary }} className="text-sm">
                  No certifications listed.
                </p>
              )}
            </div>
          </div>
        </div>

        <div 
          style={{ 
            backgroundColor: currentColors.card,
            borderColor: currentColors.border
          }}
          className="border rounded-[2rem] p-8"
        >
          <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-6">
            Contact & Update
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-indigo-400" />
              <div>
                <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">
                  Email
                </p>
                <a href={`mailto:${s.email}`} style={{ color: currentColors.text }} className="hover:text-indigo-400 transition-colors">
                  {s.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">
                  Phone
                </p>
                <p style={{ color: currentColors.text }}>{s.phone}</p>
              </div>
            </div>
            {s.interviewScheduled && (
              <div style={{ backgroundColor: 'rgb(99, 102, 241, 0.2)', borderColor: 'rgb(99, 102, 241, 0.3)' }} className="md:col-span-2 border rounded-2xl p-4">
                <p className="text-[10px] text-indigo-300 uppercase font-bold mb-2">
                  Scheduled Interview
                </p>
                <div className="flex items-center justify-between" style={{ color: currentColors.text }}>
                  <span className="font-bold">{s.interviewDate} at {s.interviewTime}</span>
                  <span className="text-[10px] bg-indigo-600 px-3 py-1 rounded-full">
                    {s.interviewType}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Video Interviews
  const VideoInterviewsView = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCurrentView('dashboard')} 
          style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
          className="p-3 border rounded-2xl hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 style={{ color: currentColors.text }} className="text-3xl font-bold">
          Video Interview Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Video} label="Total Videos" value={stats.videosUploaded} color="text-red-500" />
        <StatCard icon={Calendar} label="Upcoming" value={mockRecentStudents.filter(s => s.interviewScheduled).length} color="text-purple-500" />
        <StatCard icon={CheckCircle} label="Completed" value={mockRecentStudents.filter(s => s.videoInterviews > 0).length} color="text-emerald-500" />
      </div>

      <div 
        style={{ 
          backgroundColor: currentColors.card,
          borderColor: currentColors.border
        }}
        className="border rounded-[2.5rem] p-8"
      >
        <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
          <Video className="text-red-500" /> Scheduled Interviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecentStudents.filter(s => s.interviewScheduled).map(s => (
            <div 
              key={s.id} 
              style={{ 
                backgroundColor: currentColors.card,
                borderColor: currentColors.border
              }}
              className="border rounded-2xl p-6 hover:border-red-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }} className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-indigo-400">
                  {s.name.charAt(0)}
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                  {s.interviewType}
                </span>
              </div>
              <h4 style={{ color: currentColors.text }} className="font-bold mb-1">
                {s.name}
              </h4>
              <p style={{ color: currentColors.textSecondary }} className="text-[10px] mb-4">
                {s.branch}
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2" style={{ color: currentColors.textSecondary }}>
                  <Calendar className="w-4 h-4" />
                  <span>{s.interviewDate}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: currentColors.textSecondary }}>
                  <Clock className="w-4 h-4" />
                  <span>{s.interviewTime}</span>
                </div>
              </div>
              {/* Video call button will be added here in WebRTC integration */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ThemeSettings = () => {
    const themeOptions = [
      { value: 'light', label: 'Light Mode', icon: Sun, description: 'Bright and clear interface for daytime', color: '#fbbf24' },
      { value: 'dark', label: 'Dark Mode', icon: Moon, description: 'Dark and comfortable interface for night', color: '#3b82f6' },
      { value: 'system', label: 'System Default', icon: Monitor, description: 'Match your operating system setting', color: '#8b5cf6' }
    ];

    return (
      <div className="animate-in fade-in duration-500 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Theme Settings</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Customize your interface appearance</p>
          </div>
          <Monitor className="w-12 h-12 text-indigo-500" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themeOptions.map((option) => {
            const isActive = theme === option.value;
            const OptionIcon = option.icon;

            return (
              <div
                key={option.value}
                onClick={() => setTheme(option.value)}
                style={{ 
                  backgroundColor: currentColors.card,
                  borderColor: isActive ? '#6366f1' : currentColors.border
                }}
                className={`p-6 rounded-2xl border hover:border-indigo-500 transition-all group cursor-pointer ${
                  isActive ? 'ring-2 ring-indigo-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: option.color + '20' }}>
                    <OptionIcon className="w-5 h-5" style={{ color: option.color }} />
                  </div>
                  {isActive && (
                    <CheckCircle className="w-6 h-6 text-indigo-500" />
                  )}
                </div>
                <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-1">{option.label}</h3>
                <p style={{ color: currentColors.textSecondary }} className="text-sm">{option.description}</p>
              </div>
            );
          })}
        </div>

        {/* Current Theme Info */}
        <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-2">Current Theme</h3>
              <p style={{ color: currentColors.textSecondary }} className="text-sm">
                {theme === 'system' ? `System (${resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'})` : `${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`}
              </p>
            </div>
            <div className="text-right">
              {resolvedTheme === 'dark' ? (
                <Moon className="w-8 h-8 text-blue-400" />
              ) : (
                <Sun className="w-8 h-8 text-yellow-400" />
              )}
            </div>
          </div>
        </div>

        {/* Theme Features */}
        <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
          <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-6">Theme Features</h3>
          <div className="space-y-4">
            {[
              { icon: Eye, title: 'Anti-Eye Strain', desc: 'Dark mode reduces eye strain during extended use' },
              { icon: Sun, title: 'Auto Adjustment', desc: 'System theme automatically adjusts to your device setting' },
              { icon: Settings, title: 'Persistent Storage', desc: 'Your theme preference is saved locally' }
            ].map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={idx} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="flex items-center gap-4 p-5 rounded-2xl border">
                  <FeatureIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p style={{ color: currentColors.text }} className="font-bold">{feature.title}</p>
                    <p style={{ color: currentColors.textSecondary }} className="text-xs">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Profile with Inline Editing
  const renderProfile = () => {
    const handleSaveProfile = async () => {
      try {
        setIsLoading(true);
        const response = await statsAPI.updateProfile({
          name: staffProfile.name,
          phone: staffProfile.phone,
          avatar: staffProfile.image
        });
        
        if (response.data.success) {
          setEditMode(false);
          alert('Profile updated successfully!');
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              My Profile
            </h2>
            <p style={{ color: currentColors.textSecondary }} className="mt-2">
              Manage your personal information and settings
            </p>
          </div>
          <div className="flex gap-3">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setStaffProfile({
                      ...staffProfile,
                      name: user?.name || staffProfile.name,
                      phone: user?.phone || staffProfile.phone,
                      image: user?.avatar || staffProfile.image
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div style={{ 
            backgroundColor: currentColors.card, 
            borderColor: currentColors.border 
          }} className="p-8 rounded-3xl border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-500" />
              Personal Information
            </h3>
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={staffProfile.avatar || staffProfile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
                    alt={staffProfile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/20"
                  />
                  {editMode && (
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setStaffProfile({ ...staffProfile, avatar: event.target.result, image: event.target.result });
                              if (user) {
                                user.avatar = event.target.result;
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={staffProfile.name}
                    onChange={(e) => setStaffProfile({ ...staffProfile, name: e.target.value })}
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                ) : (
                  <p style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    color: currentColors.text
                  }} className="px-4 py-3 rounded-xl">
                    {staffProfile.name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <p style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: currentColors.textSecondary
                }} className="px-4 py-3 rounded-xl">
                  {staffProfile.email || 'Not set'}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={staffProfile.phone}
                    onChange={(e) => setStaffProfile({ ...staffProfile, phone: e.target.value })}
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <p style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    color: currentColors.text
                  }} className="px-4 py-3 rounded-xl">
                    {staffProfile.phone || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div style={{ 
            backgroundColor: currentColors.card, 
            borderColor: currentColors.border 
          }} className="p-8 rounded-3xl border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-500" />
              Account Information
            </h3>
            <div className="space-y-6">
              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Role
                </label>
                <p style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: currentColors.text
                }} className="px-4 py-3 rounded-xl">
                  {staffProfile.role || user?.role?.toUpperCase() || 'STAFF'}
                </p>
              </div>
              
              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Department
                </label>
                <p style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: currentColors.text
                }} className="px-4 py-3 rounded-xl">
                  {staffProfile.department || 'N/A'}
                </p>
              </div>

              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Designation
                </label>
                <p style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: currentColors.text
                }} className="px-4 py-3 rounded-xl">
                  {staffProfile.designation || 'N/A'}
                </p>
              </div>

              <div>
                <label style={{ color: currentColors.textSecondary }} className="block text-sm font-semibold mb-2">
                  Experience
                </label>
                <p style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  color: currentColors.text
                }} className="px-4 py-3 rounded-xl">
                  {staffProfile.experience || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div style={{ 
            backgroundColor: currentColors.card, 
            borderColor: currentColors.border 
          }} className="p-8 rounded-3xl border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-500" />
              Activity Stats
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span style={{ color: currentColors.textSecondary }}>Students Managed</span>
                <span className="text-2xl font-bold text-purple-500">{students.length || stats.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: currentColors.textSecondary }}>Active Interviews</span>
                <span className="text-2xl font-bold text-indigo-500">{stats.activeInterviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: currentColors.textSecondary }}>Verifications Done</span>
                <span className="text-2xl font-bold text-green-500">{stats.pendingVerifications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: currentColors.textSecondary }}>Placement Rate</span>
                <span className="text-2xl font-bold text-orange-500">{stats.placementRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const staffAnalytics = useMemo(() => {
    const staffStats = dashboardStats?.data || dashboardStats || {};
    const normalizedStudents = Array.isArray(students) ? students : [];
    const normalizedJobs = Array.isArray(jobs) ? jobs : [];
    const normalizedPlacements = Array.isArray(placements) ? placements : [];

    const activeJobPostings = normalizedJobs.filter((job) => {
      const status = String(job?.status || '').toLowerCase();
      return ['active', 'open'].includes(status);
    }).length;

    const talentPoolSize = Number(staffStats.totalStudents || normalizedStudents.length || 0);
    const interviewsScheduled = Number(staffStats.interviewsScheduled || staffStats.activeInterviews || stats.activeInterviews || 0);

    const offersExtended = normalizedPlacements.filter((placement) => {
      const placementStatus = String(placement?.status || '').toLowerCase();
      return ['offered', 'accepted', 'selected', 'placed'].includes(placementStatus);
    }).length;

    const acceptedOffers = normalizedPlacements.filter((placement) => {
      const placementStatus = String(placement?.status || '').toLowerCase();
      return ['accepted', 'selected', 'placed'].includes(placementStatus);
    }).length;

    const acceptanceRate = offersExtended > 0 ? Math.round((acceptedOffers / offersExtended) * 100) : Number(staffStats.performance || 0);
    const pendingApprovals = Number(staffStats.resumesPending || normalizedStudents.filter((student) => !student?.resumeVerified).length || 0);

    const statusCount = normalizedStudents.reduce((accumulator, student) => {
      const status = String(student?.status || 'pending').toLowerCase();
      const key = ['placed', 'shortlisted', 'interviewing', 'pending'].includes(status) ? status : 'pending';
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const branchBuckets = normalizedStudents.reduce((accumulator, student) => {
      const branch = student?.branch || 'Unknown';
      if (!accumulator[branch]) {
        accumulator[branch] = { total: 0, placed: 0 };
      }
      accumulator[branch].total += 1;
      const status = String(student?.status || '').toLowerCase();
      if (['placed', 'selected', 'accepted'].includes(status)) {
        accumulator[branch].placed += 1;
      }
      return accumulator;
    }, {});

    const branchPerformance = Object.entries(branchBuckets)
      .map(([branch, values]) => ({
        branch,
        total: values.total,
        placed: values.placed,
        rate: values.total ? Math.round((values.placed / values.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const monthlyBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString('default', { month: 'short' }),
        count: 0
      };
    });

    normalizedPlacements.forEach((placement) => {
      const createdDate = new Date(placement?.createdAt || placement?.updatedAt || Date.now());
      const key = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      const bucket = monthlyBuckets.find((item) => item.key === key);
      if (bucket) bucket.count += 1;
    });

    return {
      activeJobPostings,
      applicationsReceived: normalizedPlacements.length,
      interviewsScheduled,
      offersExtended,
      acceptanceRate,
      talentPoolSize,
      pendingApprovals,
      applicationStatus: {
        labels: ['Placed', 'Shortlisted', 'Interviewing', 'Pending'],
        data: [
          statusCount.placed || 0,
          statusCount.shortlisted || 0,
          statusCount.interviewing || 0,
          statusCount.pending || 0
        ]
      },
      branchPerformance,
      monthlyTrend: monthlyBuckets
    };
  }, [students, jobs, placements, dashboardStats, stats.activeInterviews]);

  // Main Content Renderer
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'profile':
        return renderProfile();
      case 'all-students':
        return <StudentDirectory />;
      case 'student-risk':
        return (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
              <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Student Risk Queue</h2>
              <p style={{ color: currentColors.textSecondary }} className="text-sm">Auto-prioritized students by placement risk score.</p>
              {riskActionMessage && (
                <p className={`mt-3 text-xs font-semibold ${riskActionMessage.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {riskActionMessage.text}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {riskQueue.slice(0, 12).map((riskItem) => (
                <div key={riskItem.id} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-5 rounded-2xl border">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ color: currentColors.text }} className="font-bold">{riskItem.name}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${riskItem.priority === 'High' ? 'bg-red-500/15 text-red-400' : riskItem.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{riskItem.priority}</span>
                  </div>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs mb-3">{riskItem.branch} • CGPA {riskItem.cgpa} • Attendance {riskItem.attendance}%</p>
                  <p className="text-sm font-bold text-indigo-400 mb-3">Risk Score: {riskItem.riskScore}</p>
                  {mentorAssignments[riskItem.id] && (
                    <p className="text-xs text-emerald-400 mb-3">Mentor: {mentorAssignments[riskItem.id]}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleAssignMentor(riskItem)} className="px-3 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
                      {mentorAssignments[riskItem.id] ? 'Reassign Mentor' : 'Assign Mentor'}
                    </button>
                    <button
                      onClick={() => handleSendRiskReminder(riskItem)}
                      disabled={riskReminderLoadingId === riskItem.id}
                      className="px-3 py-2 bg-emerald-600 rounded-lg text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {riskReminderLoadingId === riskItem.id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'exam-desk':
        return (
          <div className="animate-in fade-in duration-500 space-y-8">
            <ExamManager />
          </div>
        );
      case 'student-detail': return <StudentDetailView />;
      case 'video-interviews': return <VideoInterviewsView />;
      case 'interview-ops': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Interview Operations Board</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Track schedules, ongoing rounds, and pending feedback.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['scheduled', 'in-progress', 'feedback-pending'].map((stage) => (
              <div key={stage} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-2xl border">
                <h3 style={{ color: currentColors.text }} className="font-bold uppercase text-xs mb-3">{stage.replace('-', ' ')}</h3>
                <div className="space-y-3">
                  {interviewOpsBoard.filter((item) => item.stage === stage).map((item) => (
                    <div key={item.id} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="p-3 rounded-xl border">
                      <p style={{ color: currentColors.text }} className="font-bold text-sm">{item.candidateName}</p>
                      <p style={{ color: currentColors.textSecondary }} className="text-xs">{item.interviewer} • {item.slot}</p>
                      <div className="flex gap-2 mt-2">
                        {stage !== 'feedback-pending' && <button onClick={() => updateInterviewStage(item.id, 'feedback-pending')} className="text-xs px-2 py-1 bg-amber-600 rounded text-white">Move</button>}
                        {stage === 'feedback-pending' && <button onClick={() => updateInterviewStage(item.id, 'scheduled')} className="text-xs px-2 py-1 bg-indigo-600 rounded text-white">Reschedule</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'drive-ops': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Placement Drive Operations</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Checklist-driven execution for each placement drive.</p>
          </div>
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p style={{ color: currentColors.text }} className="font-bold">Placement Drive Operations</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs">Drive: {driveOps.selectedDrive}</p>
              </div>
              <div>
                <select value={driveOps.selectedDrive} onChange={(e) => setDriveOps((prev) => ({ ...prev, selectedDrive: e.target.value }))} style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="rounded-lg border px-3 py-2 text-sm">
                  {driveList.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {(() => {
                const sel = driveList.find((d) => d.id === driveOps.selectedDrive) || driveList[0];
                return [
                  { title: 'Registered Students', value: sel.registered, tone: 'text-violet-500' },
                  { title: 'Interviews Scheduled', value: sel.interviewsScheduled, tone: 'text-amber-500' },
                  { title: 'Openings', value: sel.openings, tone: 'text-cyan-500' }
                ].map((m) => (
                  <div key={m.title} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-3 rounded-xl border">
                    <p className="text-xs text-slate-400">{m.title}</p>
                    <p className={`text-2xl font-black ${m.tone}`}>{m.value}</p>
                  </div>
                ));
              })()}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={() => runQuickAction('Publish Shortlist')} className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-bold">Publish Shortlist</button>
              <button onClick={() => runQuickAction('Send Student Communication')} className="px-4 py-2 bg-cyan-600 rounded-xl text-white text-sm font-bold">Send Communication</button>
              <button onClick={() => runQuickAction('Export Attendance CSV')} className="px-4 py-2 bg-emerald-600 rounded-xl text-white text-sm font-bold">Export Attendance</button>
              <button onClick={() => runQuickAction('Assign Interview Panel')} className="px-4 py-2 bg-purple-600 rounded-xl text-white text-sm font-bold">Assign Panel</button>
              <label className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold cursor-pointer flex items-center gap-2">
                Upload Panel Availability
                <input type="file" onChange={(e) => runQuickAction('Upload Panel Availability')} className="hidden" />
              </label>
            </div>

            {actionToast && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
                {actionToast}
              </div>
            )}

            <div className="space-y-3">
              {driveOps.checklist.map((item) => (
                <label key={item.id} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="flex items-center justify-between p-3 rounded-xl border cursor-pointer">
                  <span style={{ color: currentColors.text }} className="text-sm font-semibold">{item.label}</span>
                  <input type="checkbox" checked={item.done} onChange={() => toggleDriveChecklist(item.id)} />
                </label>
              ))}
            </div>
          </div>
        </div>
      );
      case 'applications': return <StaffApplications />;
      case 'classes': return (
        <div className="animate-in fade-in duration-500 space-y-8">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              Live Classes & Meetings
            </h2>
            <p style={{ color: currentColors.textSecondary }} className="text-lg mb-4">Connect with students for live meetings, webinars, and classes. Use the webcam below to start a session.</p>
            {/* Class schedule and controls */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <label className="font-bold text-sm mb-2 block">Current Class:</label>
                <select className="rounded-xl px-4 py-2 border border-indigo-300 bg-white text-black font-bold" onChange={async (e) => { await statsAPI.getClasses(); }}>
                  <option>Maths - 10:00 AM</option>
                  <option>Physics - 11:30 AM</option>
                  <option>Chemistry - 1:00 PM</option>
                  <option>English - 2:30 PM</option>
                </select>
              </div>
              <button className="px-6 py-2 bg-red-600 rounded-xl text-white font-bold hover:bg-red-500" onClick={() => {
                // Stop camera
                const video = document.querySelector('video');
                if (video && video.srcObject) {
                  video.srcObject.getTracks().forEach(track => track.stop());
                  video.srcObject = null;
                }
                alert('Call ended!');
              }}>End Call</button>
              <button className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500" onClick={() => alert('Screen sharing started!')}>Screen Share</button>
              <button className="px-6 py-2 bg-green-600 rounded-xl text-white font-bold hover:bg-green-500" onClick={() => {
                // Open file dialog
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.jpg,.png';
                input.onchange = () => {
                  if (input.files.length > 0) {
                    alert('Homework file selected: ' + input.files[0].name);
                  }
                };
                input.click();
              }}>Upload Homework</button>
              <button className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500" onClick={() => { document.documentElement.requestFullscreen(); }}>Full Screen</button>
              <button className="px-6 py-2 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-500" onClick={() => alert('More features coming soon!')}>More</button>
            </div>
            <div className="flex justify-center items-center">
              <div className="w-full max-w-5xl">
                <VideoConference
                  roomId={'live-class-room'}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>
      );
      case 'verification': return (
        <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-10 rounded-[3rem] border animate-in fade-in duration-500 space-y-6">
          <div className="text-center">
            <UserCheck className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">
              KYC Verification Hub
            </h2>
            <p style={{ color: currentColors.textSecondary }} className="max-w-2xl mx-auto">
              {verificationSummary.pending} documents flagged for manual review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-4">
              <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Total</p>
              <p style={{ color: currentColors.text }} className="text-2xl font-black mt-1">{verificationSummary.all}</p>
            </div>
            <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-4">
              <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Pending</p>
              <p className="text-2xl font-black mt-1 text-amber-400">{verificationSummary.pending}</p>
            </div>
            <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-4">
              <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Verified</p>
              <p className="text-2xl font-black mt-1 text-emerald-400">{verificationSummary.verified}</p>
            </div>
            <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-4">
              <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Rejected</p>
              <p className="text-2xl font-black mt-1 text-red-400">{verificationSummary.rejected}</p>
            </div>
          </div>

          <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={verificationSearch}
              onChange={(event) => setVerificationSearch(event.target.value)}
              placeholder="Search by name, KYC ID, or email"
              style={{ backgroundColor: currentColors.bgSecondary, color: currentColors.text, borderColor: currentColors.border }}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <select
              value={verificationStatusFilter}
              onChange={(event) => setVerificationStatusFilter(event.target.value)}
              style={{ backgroundColor: currentColors.bgSecondary, color: currentColors.text, borderColor: currentColors.border }}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={verificationDocFilter}
              onChange={(event) => setVerificationDocFilter(event.target.value)}
              style={{ backgroundColor: currentColors.bgSecondary, color: currentColors.text, borderColor: currentColors.border }}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              {verificationDocumentOptions.map((docType) => (
                <option key={docType} value={docType}>{docType === 'All' ? 'All Document Types' : docType}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkVerification('Verified')}
              className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white hover:bg-emerald-500"
            >
              Verify All Pending
            </button>
            <button
              onClick={() => handleBulkVerification('Rejected')}
              className="px-4 py-2 bg-red-600 rounded-xl text-xs font-bold text-white hover:bg-red-500"
            >
              Reject All Pending
            </button>
            <button
              onClick={handleResetVerificationQueue}
              className="px-4 py-2 bg-slate-600 rounded-xl text-xs font-bold text-white hover:bg-slate-500"
            >
              Reset Queue
            </button>
          </div>

          {verificationToast && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              {verificationToast}
            </div>
          )}

          <div className="space-y-4">
            {prioritizedVerificationQueue.map((item) => (
              <div
                key={item.id}
                style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                className="border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p style={{ color: currentColors.text }} className="font-bold">
                    {item.name}
                  </p>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase">
                    {item.document} • {item.id} • {item.date}
                  </p>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs mt-1">
                    {item.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      item.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                      item.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {item.priority} Priority
                    </span>
                    {item.lastUpdated && (
                      <span style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-semibold">
                        Reviewed {item.lastUpdated}
                      </span>
                    )}
                  </div>
                  <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openVerificationDetails(item)}
                    className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleVerifyKyc(item.id, 'Verified', item.remarks || '')}
                    disabled={item.status === 'Verified'}
                    className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerifyKyc(item.id, 'Rejected', item.remarks || '')}
                    disabled={item.status === 'Rejected'}
                    className="px-4 py-2 bg-red-600 rounded-xl text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {prioritizedVerificationQueue.length === 0 && (
              <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border, color: currentColors.textSecondary }} className="border rounded-2xl p-6 text-center text-sm font-semibold">
                No KYC records match the selected filters.
              </div>
            )}
          </div>

          {activeVerification && (
            <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div style={{ backgroundColor: currentColors.bgSecondary, borderColor: currentColors.border }} className="w-full max-w-2xl rounded-3xl border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 style={{ color: currentColors.text }} className="text-2xl font-black">KYC Review Details</h3>
                    <p style={{ color: currentColors.textSecondary }} className="text-sm mt-1">{activeVerification.id} • {activeVerification.document}</p>
                  </div>
                  <button
                    onClick={() => setActiveVerification(null)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" style={{ color: currentColors.text }} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="rounded-xl border p-3">
                    <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">Candidate</p>
                    <p style={{ color: currentColors.text }} className="font-bold mt-1">{activeVerification.name}</p>
                    <p style={{ color: currentColors.textSecondary }} className="text-xs mt-1">{activeVerification.email}</p>
                  </div>
                  <div style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="rounded-xl border p-3">
                    <p style={{ color: currentColors.textSecondary }} className="text-[10px] uppercase font-bold">Metadata</p>
                    <p style={{ color: currentColors.text }} className="text-sm mt-1">Submitted: {activeVerification.date}</p>
                    <p style={{ color: currentColors.text }} className="text-sm">Priority: {activeVerification.priority}</p>
                    <p style={{ color: currentColors.text }} className="text-sm">Status: {activeVerification.status}</p>
                  </div>
                </div>

                <label style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Reviewer Notes</label>
                <textarea
                  value={verificationActionNote}
                  onChange={(event) => setVerificationActionNote(event.target.value)}
                  rows={4}
                  style={{ backgroundColor: currentColors.card, color: currentColors.text, borderColor: currentColors.border }}
                  className="mt-2 w-full rounded-xl border p-3 text-sm outline-none"
                  placeholder="Add reason or observations for this decision"
                />

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => setActiveVerification(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-600 hover:bg-slate-500 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleVerifyKyc(activeVerification.id, 'Rejected', verificationActionNote);
                      setActiveVerification(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
                  >
                    Reject Document
                  </button>
                  <button
                    onClick={() => {
                      handleVerifyKyc(activeVerification.id, 'Verified', verificationActionNote);
                      setActiveVerification(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Verify Document
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-10 py-4 bg-indigo-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-500 text-white"
            >
              Return Dashboard
            </button>
          </div>
        </div>
      );
      case 'resume-desk': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Resume Review Desk</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Prioritized queue with scorecards and status tracking.</p>
          </div>
          <div className="space-y-3">
            {resumeReviewQueue.map((item) => (
              <div key={item.id} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <p style={{ color: currentColors.text }} className="font-bold">{item.studentName}</p>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs">{item.branch} • Deadline {item.deadline}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400">Score {item.score}</span>
                  <button
                    onClick={async () => {
                      // Optimistic UI update
                      setResumeReviewQueue((prev) => prev.map((row) => row.id === item.id ? { ...row, status: 'reviewed' } : row));

                      // Only call backend for likely real DB object IDs
                      const looksLikeObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
                      if (!looksLikeObjectId) return;

                      try {
                        const res = await fetch(`/api/students/${item.id}/mark-reviewed`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                        });
                        if (!res.ok) {
                          // Revert optimistic update on failure
                          setResumeReviewQueue((prev) => prev.map((row) => row.id === item.id ? { ...row, status: 'pending' } : row));
                          const text = await res.text().catch(() => res.statusText || '');
                          alert('Failed to mark as reviewed: ' + (res.statusText || text));
                        }
                      } catch (err) {
                        setResumeReviewQueue((prev) => prev.map((row) => row.id === item.id ? { ...row, status: 'pending' } : row));
                        alert('Failed to mark as reviewed.');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600 rounded-lg text-xs font-bold text-white"
                  >Mark Reviewed</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'task-manager': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Staff Task Management</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Track due dates, priorities, and closures.</p>
          </div>
          <div className="space-y-3">
            {staffTasks.map((task) => (
              <div key={task.id} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <p style={{ color: currentColors.text }} className="font-bold">{task.title}</p>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs">Due {task.dueDate} • {task.priority} Priority</p>
                </div>
                <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value)} style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="rounded-lg border px-2 py-1 text-xs">
                  <option value="pending">pending</option>
                  <option value="in-progress">in-progress</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      );
      
      case 'ticketing': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Student Query Ticketing</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Create, assign, and resolve placement support tickets.</p>
          </div>
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-5 rounded-xl border">
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              <input value={ticketDraft.studentName} onChange={(e) => setTicketDraft((prev) => ({ ...prev, studentName: e.target.value }))} placeholder="Student name" style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="rounded-lg border px-3 py-2 text-sm" />
              <select value={ticketDraft.category} onChange={(e) => setTicketDraft((prev) => ({ ...prev, category: e.target.value }))} style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="rounded-lg border px-3 py-2 text-sm">
                <option>General</option><option>Interview</option><option>Offer</option><option>KYC</option>
              </select>
              <button onClick={createTicket} className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-bold">Create Ticket</button>
            </div>
            <textarea value={ticketDraft.question} onChange={(e) => setTicketDraft((prev) => ({ ...prev, question: e.target.value }))} placeholder="Question" rows={2} style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-3">
            {staffTickets.map((ticket) => (
              <div key={ticket.id} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <p style={{ color: currentColors.text }} className="font-bold">{ticket.id} • {ticket.studentName}</p>
                  <p style={{ color: currentColors.textSecondary }} className="text-xs">{ticket.category} • {ticket.question}</p>
                </div>
                <select value={ticket.status} onChange={(e) => setStaffTickets((prev) => prev.map((item) => item.id === ticket.id ? { ...item, status: e.target.value } : item))} style={{ backgroundColor: currentColors.input, color: currentColors.text, borderColor: currentColors.border }} className="rounded-lg border px-2 py-1 text-xs">
                  <option value="open">open</option>
                  <option value="in-progress">in-progress</option>
                  <option value="resolved">resolved</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      );
      case 'staff-audit': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Staff Compliance & Audit</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">Track critical staff actions with context and timestamp.</p>
          </div>
          <div className="space-y-3">
            {staffAuditTrail.map((logItem) => (
              <div key={logItem.id} style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border">
                <p style={{ color: currentColors.text }} className="font-bold text-sm">{logItem.action}</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs">{logItem.actor} • {logItem.target} • {logItem.time}</p>
              </div>
            ))}
          </div>
        </div>
      );
      case 'staff-performance': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Staff Performance Insights</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">KPI-based view for throughput and response quality.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border"><p className="text-xs text-slate-400">Completed Tasks</p><p className="text-2xl font-black text-emerald-400">{staffPerformanceSummary.completedTasks}/{staffPerformanceSummary.totalTasks}</p></div>
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border"><p className="text-xs text-slate-400">Reviewed Resumes</p><p className="text-2xl font-black text-indigo-400">{staffPerformanceSummary.reviewedResumes}/{staffPerformanceSummary.totalResumes}</p></div>
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border"><p className="text-xs text-slate-400">Resolved Tickets</p><p className="text-2xl font-black text-blue-400">{staffPerformanceSummary.resolvedTickets}/{staffPerformanceSummary.totalTickets}</p></div>
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-4 rounded-xl border"><p className="text-xs text-slate-400">Productivity</p><p className="text-2xl font-black text-amber-400">{staffPerformanceSummary.productivity}%</p></div>
          </div>
        </div>
      );
      case 'quick-actions': return (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Mobile-Friendly Quick Actions</h2>
            <p style={{ color: currentColors.textSecondary }} className="text-sm">One-tap staff operations for drive-day execution.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Approve Docs', 'Send Reminder', 'Mark Attendance', 'Escalate SLA', 'Assign Mentor', 'Publish Update', 'Create Ticket', 'Start Interview'].map((label) => (
              <button key={label} onClick={() => runQuickAction(label)} className="px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wide">
                {label}
              </button>
            ))}
          </div>
          {quickActionResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
              {quickActionResult}
            </div>
          )}
        </div>
      );
      case 'analytics': return (
        <div className="animate-in fade-in duration-500 space-y-8">
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Staff Analytics Dashboard</h2>
                <p style={{ color: currentColors.textSecondary }} className="text-sm">Backend-driven placement operations metrics with details</p>
              </div>
              <AnalyticsIcon className="w-12 h-12 text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div style={{ backgroundColor: currentColors.hover }} className="p-4 rounded-2xl">
                <Briefcase className="w-8 h-8 text-blue-500 mb-2" />
                <p style={{ color: currentColors.text }} className="text-2xl font-bold">{staffAnalytics.activeJobPostings}</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Active Job Postings</p>
              </div>
              <div style={{ backgroundColor: currentColors.hover }} className="p-4 rounded-2xl">
                <FileText className="w-8 h-8 text-cyan-500 mb-2" />
                <p style={{ color: currentColors.text }} className="text-2xl font-bold">{staffAnalytics.applicationsReceived}</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Applications Received</p>
              </div>
              <div style={{ backgroundColor: currentColors.hover }} className="p-4 rounded-2xl">
                <Calendar className="w-8 h-8 text-purple-500 mb-2" />
                <p style={{ color: currentColors.text }} className="text-2xl font-bold">{staffAnalytics.interviewsScheduled}</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Interviews Scheduled</p>
              </div>
              <div style={{ backgroundColor: currentColors.hover }} className="p-4 rounded-2xl">
                <Award className="w-8 h-8 text-amber-500 mb-2" />
                <p style={{ color: currentColors.text }} className="text-2xl font-bold">{staffAnalytics.offersExtended}</p>
                <p style={{ color: currentColors.textSecondary }} className="text-xs uppercase font-bold">Offers Extended</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-[2rem] border">
              <Users className="w-10 h-10 text-emerald-500 mb-4" />
              <p style={{ color: currentColors.text }} className="text-3xl font-bold">{staffAnalytics.talentPoolSize}</p>
              <p style={{ color: currentColors.textSecondary }} className="text-sm font-bold uppercase mt-1">Talent Pool</p>
              <p style={{ color: currentColors.textSecondary }} className="text-xs mt-2">Students currently tracked</p>
            </div>
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-[2rem] border">
              <TrendingUp className="w-10 h-10 text-pink-500 mb-4" />
              <p style={{ color: currentColors.text }} className="text-3xl font-bold">{staffAnalytics.acceptanceRate}%</p>
              <p style={{ color: currentColors.textSecondary }} className="text-sm font-bold uppercase mt-1">Offer Acceptance</p>
              <p style={{ color: currentColors.textSecondary }} className="text-xs mt-2">Accepted vs extended offers</p>
            </div>
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-[2rem] border">
              <Clock className="w-10 h-10 text-orange-500 mb-4" />
              <p style={{ color: currentColors.text }} className="text-3xl font-bold">{staffAnalytics.pendingApprovals}</p>
              <p style={{ color: currentColors.textSecondary }} className="text-sm font-bold uppercase mt-1">Pending Approvals</p>
              <p style={{ color: currentColors.textSecondary }} className="text-xs mt-2">Resume/verification backlog</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
              <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-indigo-500" />
                Application Status Distribution
              </h3>
              <div className="space-y-4">
                {staffAnalytics.applicationStatus.labels.map((label, index) => {
                  const value = staffAnalytics.applicationStatus.data[index] || 0;
                  const total = staffAnalytics.applicationStatus.data.reduce((sum, item) => sum + item, 0) || 1;
                  const width = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: currentColors.text }} className="font-bold">{label}</span>
                        <span style={{ color: currentColors.textSecondary }}>{value}</span>
                      </div>
                      <div style={{ backgroundColor: currentColors.hover }} className="h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
              <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-500" />
                Branch Performance (Detailed)
              </h3>
              <div className="space-y-4">
                {staffAnalytics.branchPerformance.length ? staffAnalytics.branchPerformance.map((branch) => (
                  <div key={branch.branch} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="p-4 rounded-2xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: currentColors.text }} className="font-bold">{branch.branch}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">{branch.total} students</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2" style={{ color: currentColors.textSecondary }}>
                      <span>Placed: {branch.placed}</span>
                      <span>Rate: {branch.rate}%</span>
                    </div>
                    <div style={{ backgroundColor: currentColors.card }} className="h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${branch.rate}%` }} />
                    </div>
                  </div>
                )) : (
                  <p style={{ color: currentColors.textSecondary }} className="text-sm">No branch data available.</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-blue-500" />
              Monthly Placement Trend (Last 6 Months)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {staffAnalytics.monthlyTrend.map((month) => {
                const maxValue = Math.max(...staffAnalytics.monthlyTrend.map((item) => item.count), 1);
                const barHeight = Math.round((month.count / maxValue) * 100);
                return (
                  <div key={month.key} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="p-3 rounded-xl border text-center">
                    <p style={{ color: currentColors.textSecondary }} className="text-[10px] font-bold uppercase mb-2">{month.label}</p>
                    <div style={{ backgroundColor: currentColors.card }} className="h-20 rounded-lg flex items-end overflow-hidden mb-2">
                      <div className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-lg" style={{ height: `${barHeight}%` }} />
                    </div>
                    <p style={{ color: currentColors.text }} className="text-sm font-bold">{month.count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
      case 'reports': return (
        <div className="animate-in fade-in duration-500 space-y-8">
          {/* Reports Header */}
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ color: currentColors.text }} className="text-3xl font-bold mb-2">Reports & Data Export</h2>
                <p style={{ color: currentColors.textSecondary }} className="text-sm">Generate and download placement reports</p>
              </div>
              <BarChart3 className="w-12 h-12 text-indigo-500" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-2xl border hover:border-indigo-500 transition-all group">
              <Download className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-2">Placement Report</h3>
              <p style={{ color: currentColors.textSecondary }} className="text-sm mb-4">Complete placement statistics and metrics</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = `PLACEMENT REPORT\n\nDate: ${new Date().toLocaleDateString()}\nTotal Students: ${stats.totalStudents}\nPlacement Rate: ${stats.placementRate}%\nAvg Package: ${stats.avgPackage}\nActive Interviews: ${stats.activeInterviews}\n\nBranch-wise Data:\n${collegeSections.map(s => `${s.name}: ${s.students} students, ${s.placement}% placed`).join('\n')}`;
                    downloadTextFile('placement-report.txt', content);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  TXT
                </button>
                <button
                  onClick={() => {
                    const content = `Date: ${new Date().toLocaleDateString()}\nTotal Students: ${stats.totalStudents}\nPlacement Rate: ${stats.placementRate}%\nAvg Package: ${stats.avgPackage}\nActive Interviews: ${stats.activeInterviews}\n\nBranch-wise Data:\n${collegeSections.map(s => `${s.name}: ${s.students} students, ${s.placement}% placed`).join('\n')}`;
                    downloadPDF('placement-report.pdf', 'PLACEMENT REPORT', content);
                  }}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  PDF
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-2xl border hover:border-indigo-500 transition-all group">
              <Users className="w-10 h-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-2">Student Database</h3>
              <p style={{ color: currentColors.textSecondary }} className="text-sm mb-4">Complete student records and profiles</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = `STUDENT DATABASE REPORT\n\nDate: ${new Date().toLocaleDateString()}\nTotal Students: ${stats.totalStudents}\nResumes Built: ${stats.resumesBuilt}\nSkills Certified: ${stats.skillsCertified}\n\nSections:\n${collegeSections.map(s => `${s.name}: ${s.students} students, CGPA: ${s.avgCGPA}, Attendance: ${s.attendance}%`).join('\n')}`;
                    downloadTextFile('student-database-report.txt', content);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  TXT
                </button>
                <button
                  onClick={() => {
                    const headers = [
                      'ID',
                      'Name',
                      'Email',
                      'Phone',
                      'Branch',
                      'Section',
                      'CGPA',
                      'Backlogs',
                      'Attendance',
                      'Fees',
                      'Status',
                      'Placement Status',
                      'Skills',
                      'Certifications',
                      'Resume Version',
                      'Video Interviews',
                      'Portfolio'
                    ];
                    const rows = (Array.isArray(students) ? students : []).map((student) => {
                      const studentSkills = Array.isArray(student?.skills) ? student.skills : [];
                      const studentCerts = normalizeCertifications(student?.certifications);
                      return [
                        student?.id || '',
                        student?.name || '',
                        student?.email || '',
                        student?.phone || '',
                        student?.branch || '',
                        student?.section || '',
                        student?.cgpa || '',
                        student?.backlogs ?? '',
                        student?.attendance ?? '',
                        student?.fees || '',
                        student?.status || '',
                        student?.placementStatus || '',
                        studentSkills.join('; '),
                        studentCerts.join('; '),
                        student?.resumeVersion || '',
                        student?.videoInterviews ?? '',
                        student?.portfolioLink || ''
                      ];
                    });
                    downloadCSV('student-database.csv', headers, rows);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  Excel
                </button>
                <button
                  onClick={() => {
                    const content = `Date: ${new Date().toLocaleDateString()}\nTotal Students: ${stats.totalStudents}\nResumes Built: ${stats.resumesBuilt}\nSkills Certified: ${stats.skillsCertified}\n\nSections:\n${collegeSections.map(s => `${s.name}: ${s.students} students, CGPA: ${s.avgCGPA}, Attendance: ${s.attendance}%`).join('\n')}`;
                    downloadPDF('student-database-report.pdf', 'STUDENT DATABASE REPORT', content);
                  }}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  PDF
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-6 rounded-2xl border hover:border-indigo-500 transition-all group">
              <Video className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 style={{ color: currentColors.text }} className="text-lg font-bold mb-2">Interview Analytics</h3>
              <p style={{ color: currentColors.textSecondary }} className="text-sm mb-4">Video interviews and performance data</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = `INTERVIEW ANALYTICS REPORT\n\nDate: ${new Date().toLocaleDateString()}\nActive Interviews: ${stats.activeInterviews}\nVideos Uploaded: ${stats.videosUploaded}\nPending Verifications: ${stats.pendingVerifications}\n\nBranch Performance:\n${collegeSections.map(s => `${s.name}: ${s.students} students, ${s.placement}% placement rate`).join('\n')}`;
                    downloadTextFile('interview-analytics-report.txt', content);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  TXT
                </button>
                <button
                  onClick={() => {
                    const content = `Date: ${new Date().toLocaleDateString()}\nActive Interviews: ${stats.activeInterviews}\nVideos Uploaded: ${stats.videosUploaded}\nPending Verifications: ${stats.pendingVerifications}\n\nBranch Performance:\n${collegeSections.map(s => `${s.name}: ${s.students} students, ${s.placement}% placement rate`).join('\n')}`;
                    downloadPDF('interview-analytics-report.pdf', 'INTERVIEW ANALYTICS REPORT', content);
                  }}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-all"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Reports */}
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-6">Custom Report Generation</h3>
            <div className="space-y-4">
              {[
                { name: 'Academic Performance Report', icon: BookOpen, desc: 'CGPA, attendance, and exam results', color: 'text-blue-500' },
                { name: 'Financial Report', icon: DollarSign, desc: 'Fees collection and payment status', color: 'text-green-500' },
                { name: 'Skills & Certifications Report', icon: Award, desc: 'Certified skills and training completion', color: 'text-amber-500' },
                { name: 'Branch-wise Analytics', icon: PieChart, desc: 'Department-level performance metrics', color: 'text-purple-500' },
                { name: 'HR Coordinator Report', icon: UserCheck, desc: 'HR activities and coordination data', color: 'text-pink-500' },
                { name: 'Monthly Summary Report', icon: Calendar, desc: 'Comprehensive monthly overview', color: 'text-indigo-500' }
              ].map((report, idx) => (
                <div key={idx} style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }} className="flex items-center justify-between p-5 rounded-2xl border group hover:border-indigo-500 transition-all">
                  <div className="flex items-center gap-4">
                    <report.icon className={`w-8 h-8 ${report.color}`} />
                    <div>
                      <p style={{ color: currentColors.text }} className="font-bold">{report.name}</p>
                      <p style={{ color: currentColors.textSecondary }} className="text-xs">{report.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const content = `${report.name.toUpperCase()}\n\nGenerated: ${new Date().toLocaleString()}\n\nReport details will be populated based on selected criteria and date range.\n\nTotal Students: ${stats.totalStudents}\nPlacement Rate: ${stats.placementRate}%\n\nThis is a sample report. Full implementation requires database queries.`;
                        downloadTextFile(`${report.name.toLowerCase().replace(/\s+/g, '-')}.txt`, content);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      TXT
                    </button>
                    <button
                      onClick={() => {
                        const content = `Generated: ${new Date().toLocaleString()}\n\nReport details will be populated based on selected criteria and date range.\n\nTotal Students: ${stats.totalStudents}\nPlacement Rate: ${stats.placementRate}%\n\nThis is a sample report. Full implementation requires database queries.`;
                        downloadPDF(`${report.name.toLowerCase().replace(/\s+/g, '-')}.pdf`, report.name.toUpperCase(), content);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Formats */}
          <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="p-8 rounded-[2.5rem] border">
            <h3 style={{ color: currentColors.text }} className="text-xl font-bold mb-4">Available Export Formats</h3>
            <div className="flex gap-4">
              <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> TXT
              </span>
              <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> PDF
              </span>
              <span style={{ backgroundColor: currentColors.hover }} className="px-4 py-2 rounded-xl text-sm font-bold opacity-50">CSV (Coming Soon)</span>
              <span style={{ backgroundColor: currentColors.hover }} className="px-4 py-2 rounded-xl text-sm font-bold opacity-50">Excel (Coming Soon)</span>
            </div>
          </div>
        </div>
      );
      case 'email': return <EnhancedEmailModal />;
      case 'theme': return <ThemeSettings />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div 
      className="flex min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-colors duration-300" 
      style={{ backgroundColor: currentColors.bg }}
    >
      
      {/* Modals */}
      {showScheduleModal && (
        <Modal title="Schedule Placement Drive" onClose={() => setShowScheduleModal(false)}>
          <div className="space-y-4">
            <div>
              <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                Company Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Google, Microsoft, Amazon" 
                style={{ 
                  backgroundColor: currentColors.input,
                  borderColor: currentColors.border,
                  color: currentColors.text
                }}
                className="w-full border rounded-xl p-4 text-white focus:ring-1 ring-indigo-500 outline-none placeholder-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                  Date
                </label>
                <input 
                  type="date" 
                  style={{ 
                    backgroundColor: currentColors.input,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                  className="w-full border rounded-xl p-4 outline-none"
                />
              </div>
              <div>
                <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                  Role
                </label>
                <input 
                  type="text" 
                  placeholder="SDE-1" 
                  style={{ 
                    backgroundColor: currentColors.input,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                  className="w-full border rounded-xl p-4 outline-none placeholder-slate-500"
                />
              </div>
            </div>
            <div>
              <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                Package (LPA)
              </label>
              <input 
                type="text" 
                placeholder="15-20" 
                style={{ 
                  backgroundColor: currentColors.input,
                  borderColor: currentColors.border,
                  color: currentColors.text
                }}
                className="w-full border rounded-xl p-4 outline-none placeholder-slate-500"
              />
            </div>
            <div>
              <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                Description
              </label>
              <textarea 
                placeholder="Add any special requirements..." 
                rows={3} 
                style={{ 
                  backgroundColor: currentColors.input,
                  borderColor: currentColors.border,
                  color: currentColors.text
                }}
                className="w-full border rounded-xl p-4 outline-none placeholder-slate-500"
              />
            </div>
            <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold mt-4 hover:bg-indigo-500 transition-all text-white">
              Schedule Drive
            </button>
          </div>
        </Modal>
      )}

      {showVideoModal && (
        <Modal title="Video Interview - HR Round" onClose={() => setShowVideoModal(false)} size="lg">
          <div className="flex flex-col gap-6 p-2 md:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col items-center justify-center bg-black/90 border border-gray-700 rounded-2xl p-4 min-h-[320px] max-h-[480px] aspect-video shadow-lg">
                {/* In-app video conference */}
                <VideoConference
                  roomId={selectedStudent?.id ? `interview-room-${selectedStudent.id}` : 'interview-room-demo'}
                  user={user}
                  onLeave={() => setShowVideoModal(false)}
                />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-gray-900/80 rounded-xl p-4 flex flex-col gap-2 shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-300">Candidate:</span>
                    <span className="text-base font-bold text-white">{selectedStudent?.name || 'Selected Student'}</span>
                    <span className="text-emerald-400 font-bold ml-4">Ready</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex-1 py-2 bg-indigo-600/80 rounded-lg font-bold text-sm border border-indigo-500/30 hover:bg-indigo-700 transition-all text-white shadow">
                      Record Interview
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600/80 rounded-lg font-bold text-sm border border-emerald-500/30 hover:bg-emerald-700 transition-all text-white shadow">
                      Save Notes
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-800/80 rounded-xl p-4 flex flex-col justify-between shadow">
                  <div className="flex-1 overflow-y-auto mb-2">
                    {/* Chat/messages area placeholder */}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" placeholder="Type a message..." className="flex-1 rounded-lg px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-700 transition-all">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showNotificationModal && (
        <Modal title="Send Notification" onClose={() => setShowNotificationModal(false)}>
          <div className="space-y-4">
            <div>
              <p style={{ color: currentColors.text }} className="text-sm font-bold mb-2">
                Recipients: {selectedStudents.length > 0 ? `${selectedStudents.length} students` : 'No students selected'}
              </p>
              {selectedStudents.length === 0 && (
                <p className="text-xs text-amber-400">Please select students from the directory first</p>
              )}
            </div>
            <div>
              <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                Message
              </label>
              <textarea 
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Type your notification message..." 
                rows={4} 
                style={{ 
                  backgroundColor: currentColors.input,
                  borderColor: currentColors.border,
                  color: currentColors.text
                }}
                className="w-full border rounded-xl p-4 outline-none focus:ring-1 ring-indigo-500 placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSendNotification}
                disabled={!notificationMessage.trim() || selectedStudents.length === 0}
                className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 text-white"
              >
                <Send className="w-4 h-4" /> Send to All
              </button>
              <button 
                onClick={() => setShowNotificationModal(false)}
                style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                className="flex-1 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showBulkActionModal && (
        <Modal title="Bulk Actions" onClose={() => setShowBulkActionModal(false)}>
          <div className="space-y-3">
            <button 
              onClick={() => { handleBulkAction('Send Email'); setShowBulkActionModal(false); }} 
              style={{ backgroundColor: currentColors.hover }}
              className="w-full p-4 rounded-xl hover:bg-white/10 transition-all text-left font-bold flex items-center gap-3"
            >
              <Mail className="w-5 h-5 text-indigo-400" /> Send Email to Selected
            </button>
            <button 
              onClick={() => { handleBulkAction('Update Status'); setShowBulkActionModal(false); }} 
              style={{ backgroundColor: currentColors.hover }}
              className="w-full p-4 rounded-xl hover:bg-white/10 transition-all text-left font-bold flex items-center gap-3"
            >
              <Flag className="w-5 h-5 text-amber-400" /> Update Status
            </button>
            <button 
              onClick={() => { handleBulkAction('Assign HR'); setShowBulkActionModal(false); }} 
              style={{ backgroundColor: currentColors.hover }}
              className="w-full p-4 rounded-xl hover:bg-white/10 transition-all text-left font-bold flex items-center gap-3"
            >
              <UserCheck className="w-5 h-5 text-emerald-400" /> Assign to HR
            </button>
            <button 
              onClick={() => { handleBulkAction('Download Reports'); setShowBulkActionModal(false); }} 
              style={{ backgroundColor: currentColors.hover }}
              className="w-full p-4 rounded-xl hover:bg-white/10 transition-all text-left font-bold flex items-center gap-3"
            >
              <DownloadIcon className="w-5 h-5 text-cyan-400" /> Download Reports
            </button>
          </div>
        </Modal>
      )}

      {showProfileModal && (
        <Modal title="Edit Profile & Settings" onClose={() => setShowProfileModal(false)} size="lg">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={staffProfile.image} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl border-4 border-indigo-500"
                  onError={(e) => {
                    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'staff'}`;
                    if (e.target.src !== fallback) e.target.src = fallback;
                  }}
                />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="imageInput"
                />
                <label 
                  htmlFor="imageInput"
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 transition-all"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>
              <p style={{ color: currentColors.textSecondary }} className="text-xs mt-3">
                Click camera icon to change photo
              </p>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={staffProfile.name} 
                  onChange={(e) => setStaffProfile({...staffProfile, name: e.target.value})} 
                  style={{ 
                    backgroundColor: currentColors.input,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div>
                <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                  Designation
                </label>
                <input 
                  type="text" 
                  value={staffProfile.designation} 
                  onChange={(e) => setStaffProfile({...staffProfile, designation: e.target.value})} 
                  style={{ 
                    backgroundColor: currentColors.input,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={staffProfile.email} 
                    onChange={(e) => setStaffProfile({...staffProfile, email: e.target.value})} 
                    style={{ 
                      backgroundColor: currentColors.input,
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
                <div>
                  <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    value={staffProfile.phone} 
                    onChange={(e) => setStaffProfile({...staffProfile, phone: e.target.value})} 
                    style={{ 
                      backgroundColor: currentColors.input,
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                    Department
                  </label>
                  <input 
                    type="text" 
                    value={staffProfile.department} 
                    onChange={(e) => setStaffProfile({...staffProfile, department: e.target.value})} 
                    style={{ 
                      backgroundColor: currentColors.input,
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
                <div>
                  <label style={{ color: currentColors.textSecondary }} className="text-[10px] font-black uppercase mb-2 block">
                    Experience
                  </label>
                  <input 
                    type="text" 
                    value={staffProfile.experience} 
                    onChange={(e) => setStaffProfile({...staffProfile, experience: e.target.value})} 
                    style={{ 
                      backgroundColor: currentColors.input,
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleSaveProfile} 
                className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 text-white"
              >
                <CheckCircle className="w-4 h-4" /> Save Changes
              </button>
              <button 
                onClick={() => setShowProfileModal(false)} 
                style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                className="flex-1 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showImageCropModal && tempImage && (
        <Modal title="Crop Profile Picture" onClose={() => { setShowImageCropModal(false); setTempImage(null); }} size="lg">
          <div className="space-y-6">
            <div style={{ backgroundColor: isDark ? '#000000' : '#f0f0f0' }} className="rounded-2xl overflow-hidden flex items-center justify-center p-4">
              <img src={tempImage} alt="Crop" style={{ maxWidth: '100%', maxHeight: '400px', transform: `scale(${zoom})` }} className="rounded-lg" />
            </div>
            <div className="space-y-4">
              <div>
                <p style={{ color: currentColors.text }} className="text-sm font-bold mb-3">
                  Zoom Level
                </p>
                <div className="flex items-center gap-4">
                  <ZoomOut style={{ color: currentColors.textSecondary }} className="w-4 h-4" />
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <ZoomIn style={{ color: currentColors.textSecondary }} className="w-4 h-4" />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleCropImage} 
                  className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 text-white"
                >
                  <Crop className="w-4 h-4" /> Save & Crop
                </button>
                <button 
                  onClick={() => { setShowImageCropModal(false); setTempImage(null); }} 
                  style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                  className="flex-1 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showLogoutConfirm && (
        <Modal title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)} size="sm">
          <div className="space-y-6">
            {logoutSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 animate-in fade-in duration-500">
                <p style={{ color: currentColors.text }} className="text-sm flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  Logging out successfully...
                </p>
              </div>
            )}
            {!logoutSuccess && (
              <>
                <p style={{ color: currentColors.text }} className="text-center">
                  Are you sure you want to logout? Your session will be ended.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={confirmLogout}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" /> {isLoading ? 'Logging out...' : 'Yes, Logout'}
                  </button>
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={isLoading}
                    style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
                    className="flex-1 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen ${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-500 flex flex-col z-50 shadow-2xl ${isDark ? 'bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-xl border-r border-white/5' : 'bg-gradient-to-b from-white to-gray-50 backdrop-blur-xl border-r border-gray-300'}`}
      >
        <div className={`p-6 flex items-center justify-between border-b transition-colors ${isDark ? 'border-white/5' : 'border-gray-300'}`}>
          <div className={`flex items-center gap-3 transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <img src="/vrd-logo.svg" alt="VRD Logo" className="w-10 h-10 rounded-xl bg-white p-1 object-contain shadow-lg" />

            {isSidebarOpen && (
              <div>
                <h2 className={`text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent cursor-pointer tracking-tighter uppercase`}>
                  Staff
                </h2>
                <p className={`text-[10px] font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-600'} uppercase`}>Portal</p>
              </div>
            )}
          </div>
          
          {isSidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} rounded-lg transition-all`}>
              <ChevronLeft className={isDark ? 'text-white/50' : 'text-gray-600'} size={20} />
            </button>
          )}
        </div>

        {/* Theme Settings */}
        <div className={`px-4 my-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className={`flex items-center gap-2 rounded-xl p-1 border transition-colors ${isDark ? 'bg-white/10 border-white/10' : 'bg-gray-200 border-gray-300'}`}>
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex-1 p-2 rounded-lg transition-all ${
                  theme === t.id
                    ? isDark ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-500 text-white shadow-lg'
                    : isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={t.label}
              >
                <div className="flex items-center justify-center gap-2">
                  <t.icon className="h-4 w-4" />
                  <span className="text-xs font-bold">{t.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.id === 'email') {
                  setShowEmailModal(true);
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 rounded-lg ${
                currentView === item.id
                  ? isDark ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500' : 'bg-indigo-100 text-indigo-700 border-l-2 border-indigo-500'
                  : isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-semibold text-sm">{t(item.translationKey)}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t transition-colors ${isDark ? 'border-white/10' : 'border-gray-300'} space-y-2`}>
          <button 
            onClick={() => setShowProfileModal(true)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Edit3 className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Edit Profile</span>}
          </button>
          <button 
            onClick={() => setCurrentView('theme')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <SettingsIcon className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Settings</span>}
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-300 hover:text-white hover:bg-red-500/20' : 'text-red-600 hover:text-white hover:bg-red-600'}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto transition-colors duration-300" 
        style={{
          marginLeft: isSidebarOpen ? '288px' : '80px',
          background: isDark 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' 
            : 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3e8ff 100%)'
        }}
      >
        <header 
          className="h-20 backdrop-blur-xl shadow-sm flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderBottom: `1px solid ${currentColors.border}`
          }}
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-xl transition-all"
              style={{
                color: currentColors.text,
                backgroundColor: currentColors.hover
              }}
            >
              <Layers className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight capitalize">
                {t(menuItems.find(item => item.id === currentView)?.translationKey || currentView)}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector currentColors={currentColors} />
            
            {/* Notifications Bell */}
            <div className="relative">
              <button 
                className="p-2 rounded-xl transition-all relative"
                style={{
                  color: currentColors.text,
                  backgroundColor: currentColors.hover
                }}
                onClick={() => setShowNotificationsDropdown((prev) => !prev)}
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 animate-pulse shadow-lg" style={{ borderColor: currentColors.bg }} />
                )}
              </button>
              {/* Notifications Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 animate-in fade-in duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-lg text-indigo-600">Notifications</span>
                    <button className="text-xs text-gray-500 hover:text-indigo-500" onClick={() => setShowNotificationsDropdown(false)}>Close</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
                    {notificationsError && <div className="p-4 text-sm text-red-500">{notificationsError}</div>}
                    {!notificationsLoading && notifications.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
                    {notifications.map((notif, idx) => (
                      <div key={notif._id || idx} className="p-4 border-b last:border-0 border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <NotificationIcon className="w-5 h-5 text-indigo-400" />
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">{notif.title || notif.type}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{notif.message}</div>
                        <div className="mt-1 text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile */}
            <button
              onClick={() => {
                setStaffProfile(prev => ({
                  ...prev,
                  name: user?.name || prev.name,
                  phone: user?.phone || prev.phone,
                  image: user?.avatar || prev.image
                }));
                setShowProfileModal(true);
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ml-2 pl-6"
              style={{
                backgroundColor: currentColors.hover,
                borderLeft: `1px solid ${currentColors.border}`
              }}
            >
              <div className="text-right">
                <div className="text-sm font-bold group-hover:text-purple-600 transition-colors" style={{ color: currentColors.text }}>{staffProfile.name}</div>
                <div className="text-xs" style={{ color: currentColors.textSecondary }}>{staffProfile.role}</div>
              </div>
              <div className="relative">
                <img 
                  src={staffProfile.image} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover shadow-lg" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-2.5 w-2.5 text-white fill-current" />
                </div>
              </div>
            </button>
          </div>
        </header>

        <div className="p-8 pb-24 lg:pb-8">{renderContent()}</div>
      </main>

      {/* EMAIL MODAL */}
      <EnhancedEmailModal 
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        theme={resolvedTheme}
      />
    </div>
  );
};

export default StaffDashboard;