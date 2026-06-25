// Utility to normalize avatar URL
function getAvatarUrl(avatar) {
  if (!avatar) return '';
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (avatar.startsWith('/uploads/')) {
    return baseUrl + avatar;
  }
  return avatar;
}
import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { resumeAnalysisAPI } from '../../services/api';
// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (currentTheme) => {
    const html = document.documentElement;
    if (currentTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else if (currentTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      // System default
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
//cd "C:\Users\VAMSI VALLURI\Downloads\demo-genai-placement-system\frontend"
import { jsPDF } from "jspdf";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage, LanguageSelector } from '../../contexts/LanguageContext';
import api from "../../utils/api";
import { authAPI, studentAPI, jobAPI, placementsAPI, examsAPI, applicationsAPI, statsAPI, aiAPI } from '../../services/api';
import { downloadCertificate, previewCertificate } from '../../utils/certificateGenerator';
import VideoConference from "../../components/VideoConference";
import ImageCropUpload from "../../components/common/ImageCropUpload";
import EnhancedEmailModal from "../../components/EnhancedEmailModal";
import CompanyCalendar from "./CompanyCalendar";
import ExamPapers from "./ExamPapers";
import PlacementDetails from "./PlacementDetails";

import {
  Menu,
  Bell,
  Settings,
  LogOut,
  FileText,
  Clock,
  Star,
  Users,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Calendar,
  BookOpen,
  Code,
  Award,
  X,
  Sparkles,
  Camera,
  ChevronRight,
  Target,
  Send,
  User,
  LayoutDashboard,
  ArrowLeft,
  Video,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Flame,
  Zap,
  LineChart,
  PieChart,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Linkedin,
  Github,
  ExternalLink,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit3,
  Share2,
  Heart,
  MessageSquare,
  Globe,
  Percent,
  Activity,
  Briefcase as BriefcaseIcon,
  GraduationCap,
  BarChart,
  PieChartIcon,
  TrendingUpIcon,
  Save,
  XCircle,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");



// ============ MAIN COMPONENT ============
const StudentDashboardPro = () => {

  // ==== HOOKS: All hooks must be called at the top level, before any return or conditional logic ====
  const { user, logout } = useAuth();
  const authUserId = user?.id || user?._id;
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifLoading, setNotifLoading] = useState(true);
  const [notificationsData, setNotificationsData] = useState([]);

  // ==== END HOOKS ====

  // Helper moved up for hook order
  const getStudentPhone = (record) => (
    record?.phone ?? record?.phoneNumber ?? record?.user?.phone ?? user?.phone ?? ''
  );


  const extractRoomIdFromNotification = (notification) => {
    const source = `${notification?.title || ''} ${notification?.message || ''}`;
    const tokenMatch = source.match(/\[RoomID:([a-zA-Z0-9_-]+)\]/i);
    if (tokenMatch?.[1]) return tokenMatch[1];
    const fallbackMatch = source.match(/room\s+([a-zA-Z0-9_-]+)/i);
    return fallbackMatch?.[1] || '';
  };

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const response = await api.get('/notifications');
        setNotificationsData(response.data.notifications || []);
      } catch (error) {
        setNotificationsData([]);
      } finally {
        setNotifLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = useState("overview");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiChat, setAiChat] = useState([]);
  const [genAIStudioLoading, setGenAIStudioLoading] = useState(false);
  const [genAIStudioOutput, setGenAIStudioOutput] = useState({});
  const [genAIStudioInput, setGenAIStudioInput] = useState({
    tone: 'friendly',
    channel: 'in-app',
    context: 'Send a reminder for upcoming interview preparation.',
    question: 'How can I improve placement chances in the next 14 days?'
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', credentialId: '', url: '', source: 'student', certificateFile: null });
  const [userCertifications, setUserCertifications] = useState([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateRecipientName, setCertificateRecipientName] = useState('');
  const [interviewsList, setInterviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeVisible, setResumeVisible] = useState(true);
  const [selectedResumeTemplate, setSelectedResumeTemplate] = useState(null);
  const [resumeDraft, setResumeDraft] = useState({
    fullName: '',
    title: '',
    summary: '',
    photo: '',
    skills: [],
    experience: [{ role: '', company: '', period: '', details: '' }],
    projects: [{ name: '', details: '', link: '' }],
    education: [{ degree: '', school: '', year: '' }],
    certifications: [{ name: '', issuer: '', year: '', credentialId: '' }],
    awards: [{ title: '', issuer: '', year: '', details: '' }],
    links: { email: '', phone: '', github: '', linkedin: '', website: '' }
  });
  const [resumeDraftLoaded, setResumeDraftLoaded] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [placementsLoading, setPlacementsLoading] = useState(true);
  const [placementFilter, setPlacementFilter] = useState("all");
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementForm, setPlacementForm] = useState({
    studentUserId: "",
    companyName: "",
    roleTitle: "",
    location: "",
    ctc: "",
    bond: "",
    offerType: "full-time",
    status: "applied",
    joiningDate: "",
    resultDate: "",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    notes: "",
    eligibility: {
      minCgpa: "",
      maxBacklogs: "",
      branches: "",
      batch: ""
    }
  });
  const [exams, setExams] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [studentDetails, setStudentDetails] = useState({
    id: '',
    name: '',
    branch: 'Computer Science',
    semester: '7th Sem',
    email: '',
    phone: '',
    cgpa: 8.75,
    section: 'CSE-A',
    dateOfJoining: '2022-08-15',
    avatar: '',
    skills: ['Java', 'Python', 'React', 'SQL', 'AWS']
  });
  const [examsLoading, setExamsLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState({});
  
  // Browse Jobs and Applications States
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dashboardInsights, setDashboardInsights] = useState(null);
  const [editableSkills, setEditableSkills] = useState([]);
  const [newSkillDraft, setNewSkillDraft] = useState({
    name: '',
    level: 'Beginner',
    proficiency: 70,
    certifications: ''
  });
  const [savingSkills, setSavingSkills] = useState(false);

  // Resolved theme state for EmailModal
  const [resolvedTheme, setResolvedTheme] = useState("dark");

  // Detect system theme preference and set resolvedTheme
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      
      // Set initial value
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Fetch authenticated user data on component mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchStudentData = async () => {
      try {
        const response = await studentAPI.getProfile();
        const fetchedStudent = response?.data?.student || {};
        const normalizedStudent = {
          ...fetchedStudent,
          id: fetchedStudent?.rollNumber || fetchedStudent?.studentId || fetchedStudent?.id || fetchedStudent?._id || fetchedStudent?.user?._id || authUserId || '',
          name: fetchedStudent?.name || fetchedStudent?.user?.name || user?.name || '',
          email: fetchedStudent?.email || fetchedStudent?.user?.email || user?.email || '',
          phone: getStudentPhone(fetchedStudent)
        };
        setStudentData(normalizedStudent);
        setEditFormData(normalizedStudent);
        
        // Set profile image from student avatar or user avatar, fallback to generated
        const avatarRaw = response.data.student?.avatar;
        setProfileImage(avatarRaw ? getAvatarUrl(avatarRaw) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        const defaultData = {
            id: user?.rollNumber || user?.studentId || authUserId || '',
          name: user.name,
          email: user.email,
          branch: user.branch || "Computer Science",
          semester: user.semester || "7th Sem",
          phone: user.phone || "",
          cgpa: user.cgpa || 8.75,
          section: user.section || "CSE-A",
          dateOfJoining: user.dateOfJoining || "2022-08-15",
          avatar: user.avatar || '',
          skills: user.skills || ["Java", "Python", "React", "SQL", "AWS"]
        };
        setStudentData(defaultData);
        setEditFormData(defaultData);
        setProfileImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`);
        setLoading(false);
      }
    };

    fetchStudentData();
    fetchAvailableJobs();
    fetchMyApplications();
  }, [user, navigate]);

  // Fetch available jobs from API
  const fetchAvailableJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await jobAPI.getAll();
      setAvailableJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setAvailableJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch student's applications from API
  const fetchMyApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplications();
      if (response.data.applications) {
        setMyApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setMyApplications([]);
    }
  };

  // Apply for a job
  const handleApplyForJob = async (jobId) => {
    if (!authUserId) {
      alert('Please login to apply for jobs');
      return;
    }
    
    setApplyingJobId(jobId);
    try {
      const response = await applicationsAPI.create({
        studentId: authUserId,
        jobId: jobId,
        status: 'applied'
      });
      
      if (response.data.success || response.status === 201) {
        alert('Application submitted successfully!');
        setShowApplyModal(false);
        setSelectedJobForApplication(null);
        
        // Trigger HR dashboard refresh via broadcast
        try {
          if (typeof window !== 'undefined' && window?.CustomEvent) {
            window.dispatchEvent(new CustomEvent('hr:refresh'));
          }
          if (typeof window !== 'undefined' && window.BroadcastChannel) {
            const hrRefreshChannel = new window.BroadcastChannel('hr-dashboard-refresh');
            hrRefreshChannel.postMessage({ type: 'hr:refresh' });
            hrRefreshChannel.close();
          }
        } catch (e) {
          // Silently fail if broadcast fails
        }
        
        await fetchMyApplications();
        await fetchAvailableJobs();
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Update studentDetails when studentData changes
  useEffect(() => {
    if (studentData) {
      setStudentDetails({
        id: studentData.rollNumber || studentData.studentId || studentData.id || user?.studentId || user?.id || '',
        name: studentData.name || user?.name || '',
        branch: studentData.branch || 'Computer Science',
        semester: studentData.semester || '7th Sem',
        email: studentData.email || user?.email || '',
        phone: getStudentPhone(studentData),
        cgpa: studentData.cgpa || 8.75,
        section: studentData.section || 'CSE-A',
        dateOfJoining: studentData.dateOfJoining || '2022-08-15',
        avatar: studentData.avatar || user?.avatar || '',
        skills: studentData.skills || ['Java', 'Python', 'React', 'SQL', 'AWS']
      });
    } else if (user) {
      setStudentDetails(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email
      }));
    }
  }, [studentData, user]);

  // Handle image error - fallback to dicebear avatar
  const handleImageError = (e) => {
    const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name || user?.name || 'user'}`;
    if (e.target.src !== fallbackAvatar) {
      e.target.src = fallbackAvatar;
    }
  };

  // Update profile image when studentDetails avatar changes
  useEffect(() => {
    if (studentDetails.avatar) {
      setProfileImage(getAvatarUrl(studentDetails.avatar));
    } else if (user?.avatar) {
      setProfileImage(getAvatarUrl(user.avatar));
    } else {
      setProfileImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name || user?.name}`);
    }
  }, [studentDetails.avatar, user?.avatar, studentDetails.name, user?.name]);

  // Initialize edit form data when navigating to settings
  useEffect(() => {
    if ((currentView === 'settings' || currentView === 'profile-update') && studentDetails && !editFormData) {
      setEditFormData({
        id: studentDetails.id,
        name: studentDetails.name,
        email: studentDetails.email,
        phone: studentDetails.phone,
        branch: studentDetails.branch,
        semester: studentDetails.semester,
        section: studentDetails.section,
        cgpa: studentDetails.cgpa,
        avatar: studentDetails.avatar || '',
        skills: studentDetails.skills || []
      });
    }
  }, [currentView, studentDetails, editFormData]);

  useEffect(() => {
    if (!user) return;

    const fetchPlacements = async () => {
      setPlacementsLoading(true);
      try {
        const response = await placementsAPI.getAll();
        const data = response?.data?.placements || [];
        setPlacements(data);
      } catch (error) {
        console.error("Error fetching placements:", error);
        setPlacements([]);
      } finally {
        setPlacementsLoading(false);
      }
    };

    setPlacementForm((prev) => ({
      ...prev,
      studentUserId: user.id || user._id || ""
    }));

    fetchPlacements();
  }, [user]);

  useEffect(() => {
    const isMobileViewport = window.innerWidth < 1024;
    if (!isMobileViewport) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = sidebarOpen ? 'hidden' : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!user) return;
    const role = String(user?.role || '').toLowerCase();

    const fetchExams = async () => {
      setExamsLoading(true);
      try {
        const submissionsPromise = role === 'student'
          ? examsAPI.getMySubmissions()
          : examsAPI.getAllSubmissions();

        const [examsRes, submissionsRes] = await Promise.all([
          examsAPI.getAll(),
          submissionsPromise
        ]);

        setExams(examsRes.data.exams || []);
        setExamSubmissions(submissionsRes.data.submissions || []);
      } catch (error) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Error fetching exams:', error);
        }
        setExams([]);
        setExamSubmissions([]);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardInsights = async () => {
      try {
        const response = await statsAPI.getStudentInsights();
        if (response?.data?.success) {
          setDashboardInsights(response.data);
        }
      } catch (error) {
        setDashboardInsights(null);
      }
    };

    fetchDashboardInsights();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const refreshCandidateData = async () => {
      try {
        const [jobsRes, applicationsRes, insightsRes] = await Promise.all([
          jobAPI.getAll(),
          applicationsAPI.getMyApplications(),
          statsAPI.getStudentInsights()
        ]);

        setAvailableJobs(jobsRes.data.jobs || []);
        setMyApplications(applicationsRes.data.applications || []);

        if (insightsRes?.data?.success) {
          setDashboardInsights(insightsRes.data);
        }
      } catch (error) {
        console.error('Error refreshing candidate analytics:', error);
      }
    };

    const refreshInterval = setInterval(refreshCandidateData, 30000);
    window.addEventListener('focus', refreshCandidateData);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshCandidateData);
    };
  }, [user]);

  useEffect(() => {
    const normalizedSkills = (studentDetails.skills || [])
      .filter(Boolean)
      .map((skillName) => ({
        id: `${String(skillName).toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`,
        name: String(skillName).trim(),
        level: 'Intermediate',
        proficiency: 70,
        certifications: []
      }));

    setEditableSkills(normalizedSkills);
  }, [studentDetails.skills]);

  const handleSkillFieldUpdate = (skillId, field, value) => {
    setEditableSkills((prevSkills) =>
      prevSkills.map((skill) => (skill.id === skillId ? { ...skill, [field]: value } : skill))
    );
  };

  const handleSkillDelete = (skillId) => {
    setEditableSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== skillId));
  };

  const handleAddNewSkill = () => {
    const skillName = newSkillDraft.name.trim();
    if (!skillName) {
      alert('Please enter a skill name');
      return;
    }

    const skillAlreadyExists = editableSkills.some(
      (skill) => String(skill.name).toLowerCase() === skillName.toLowerCase()
    );

    if (skillAlreadyExists) {
      alert('This skill already exists');
      return;
    }

    const certificationList = String(newSkillDraft.certifications || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const skillToAdd = {
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: skillName,
      level: newSkillDraft.level,
      proficiency: Number(newSkillDraft.proficiency) || 0,
      certifications: certificationList
    };

    setEditableSkills((prevSkills) => [...prevSkills, skillToAdd]);
    setNewSkillDraft({ name: '', level: 'Beginner', proficiency: 70, certifications: '' });
  };

  const handleSaveSkillsSection = async () => {
    if (!authUserId) return;

    const cleanedSkillNames = editableSkills
      .map((skill) => String(skill.name || '').trim())
      .filter(Boolean);

    if (!cleanedSkillNames.length) {
      alert('Add at least one skill before saving.');
      return;
    }

    setSavingSkills(true);
    try {
      await studentAPI.updateProfile({ skills: cleanedSkillNames });

      setStudentDetails((prev) => ({ ...prev, skills: cleanedSkillNames }));
      setStudentData((prev) => ({ ...(prev || {}), skills: cleanedSkillNames }));
      setSuccessMessage('Skills updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating skills:', error);
      alert(error?.response?.data?.message || 'Failed to update skills. Please try again.');
    } finally {
      setSavingSkills(false);
    }
  };

  // ============ THEME COLORS (Dynamic based on theme) ============
  const themeColors = {
    dark: {
      bg: {
        primary: "from-slate-950 via-slate-900 to-slate-800",
        secondary: "from-slate-900 to-slate-800",
        tertiary: "bg-slate-900/50",
        hover: "hover:bg-white/10",
        card: "bg-white/[0.03]",
        input: "bg-white/5"
      },
      text: {
        primary: "text-white",
        secondary: "text-slate-400",
        muted: "text-slate-500"
      },
      border: "border-white/10",
      accent: "text-indigo-400"
    },
    light: {
      bg: {
        primary: "from-gray-50 via-blue-50 to-indigo-50",
        secondary: "from-white to-gray-100",
        tertiary: "bg-gray-100/50",
        hover: "hover:bg-gray-200/50",
        card: "bg-white border border-gray-200",
        input: "bg-gray-50 border border-gray-300"
      },
      text: {
        primary: "text-gray-900",
        secondary: "text-gray-600",
        muted: "text-gray-500"
      },
      border: "border-gray-300",
      accent: "text-indigo-600"
    }
  };

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const colors = isDark ? themeColors.dark : themeColors.light;


  // Instead of early returns, render loading/error UI conditionally below

  // Handle Profile Edit
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...(editFormData.skills || [])];
    newSkills[index] = value;
    setEditFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setEditFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), ""]
    }));
  };

  const removeSkill = (index) => {
    setEditFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      await studentAPI.updateProfile({
        ...editFormData,
        rollNumber: editFormData?.id,
        phoneNumber: editFormData?.phone
      });

      const latestProfileResponse = await studentAPI.getProfile();
      const latestStudent = latestProfileResponse?.data?.student || {};
      const normalizedLatestStudent = {
        ...latestStudent,
        id: latestStudent?.rollNumber || latestStudent?.studentId || latestStudent?.id || latestStudent?._id || latestStudent?.user?._id || authUserId || '',
        name: latestStudent?.name || latestStudent?.user?.name || editFormData?.name || '',
        email: latestStudent?.email || latestStudent?.user?.email || editFormData?.email || '',
        phone: getStudentPhone(latestStudent)
      };
      
      // Update student details with the new data
      setStudentDetails(prev => ({
        ...prev,
        id: normalizedLatestStudent.id,
        name: normalizedLatestStudent.name,
        email: normalizedLatestStudent.email,
        phone: normalizedLatestStudent.phone,
        branch: normalizedLatestStudent.branch || editFormData.branch,
        semester: normalizedLatestStudent.semester || editFormData.semester,
        section: normalizedLatestStudent.section || editFormData.section,
        cgpa: normalizedLatestStudent.cgpa ?? editFormData.cgpa,
        skills: normalizedLatestStudent.skills || editFormData.skills,
        avatar: normalizedLatestStudent.avatar || editFormData.avatar
      }));

      // Update profile image if avatar was uploaded
      if (editFormData.avatar) {
        setProfileImage(editFormData.avatar);
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          avatar: editFormData.avatar
        }));
      }
      
      setStudentData(normalizedLatestStudent);
      setEditFormData(normalizedLatestStudent);
      setEditMode(false);
      setEditFormData((prev) => ({ ...(prev || {}), phone: editFormData?.phone || '' }));
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        setCurrentView('profile-update');
      }, 2000);
      setSaveLoading(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData(studentData);
    setEditMode(false);
  };

  // Resume Analysis State
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeDraftAnalysis, setResumeDraftAnalysis] = useState(null);
  const [analyzingResumeDraft, setAnalyzingResumeDraft] = useState(false);
  const [autoCorrectingResumeDraft, setAutoCorrectingResumeDraft] = useState(false);

  // Resume upload handler
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    setAnalyzingResume(true);
    setResumeAnalysis(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Upload resume to profile
      const uploadResponse = await api.put('/students/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const uploadedStudent = uploadResponse?.data?.student || null;
      setStudentData(uploadedStudent ? {
        ...uploadedStudent,
        id: uploadedStudent?.rollNumber || uploadedStudent?.studentId || uploadedStudent?.id || uploadedStudent?._id || uploadedStudent?.user?._id || authUserId || '',
        name: uploadedStudent?.name || uploadedStudent?.user?.name || studentDetails?.name || '',
        email: uploadedStudent?.email || uploadedStudent?.user?.email || studentDetails?.email || '',
        phone: getStudentPhone(uploadedStudent)
      } : null);
      setResumeFile(file);
      setSuccessMessage('Resume uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Try to extract text from the file (if possible)
      let resumeText = '';
      if (file.type === 'application/pdf') {
        // Optionally, use a PDF parser here for client-side extraction
        // For now, skip and let backend handle
      }

      // Call backend for analysis
      const studentId = uploadResponse?.data?.student?._id || uploadResponse?.data?.student?.id || authUserId;
      const analysisRes = await resumeAnalysisAPI.analyze({ studentId });
      if (analysisRes?.data?.analysisResult) {
        setResumeAnalysis(analysisRes.data.analysisResult);
      } else if (analysisRes?.data) {
        setResumeAnalysis(analysisRes.data);
      }
    } catch (error) {
      console.error('Error uploading or analyzing resume:', error);
      alert('Failed to upload or analyze resume. Please try again.');
    } finally {
      setUploadingResume(false);
      setAnalyzingResume(false);
    }
  };

  // Download resume handler
  const handleDownloadResume = () => {
    if (studentData?.resume) {
      const link = document.createElement('a');
      link.href = `${BACKEND_BASE_URL}/${String(studentData.resume).replace(/^\/+/, '')}`;
      link.download = `Resume_${studentData.name}.pdf`;
      link.click();
    }
  };

  // Toggle resume visibility
  const toggleResumeVisibility = () => {
    setResumeVisible(!resumeVisible);
    setSuccessMessage(`Resume is now ${!resumeVisible ? 'visible' : 'hidden'} to recruiters`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const buildResumeDraftSuggestions = (draft = resumeDraft) => {
    const suggestions = [];
    const fullName = String(draft.fullName || '').trim();
    const title = String(draft.title || '').trim();
    const summary = String(draft.summary || '').trim();
    const skills = Array.isArray(draft.skills) ? draft.skills.filter(Boolean) : [];

    if (!fullName) suggestions.push('Add your full name so recruiters can identify the resume quickly.');
    if (!title) suggestions.push('Set a clear target title, for example Frontend Developer or Data Analyst.');
    if (summary && summary.length < 80) suggestions.push('Expand the summary with 2 to 3 impact-focused sentences.');
    if (skills.length < 3) suggestions.push('List at least 3 role-relevant skills to improve ATS matching.');
    if (!draft.links?.email && !studentDetails.email) suggestions.push('Add an email address in the contact section.');
    if (!draft.links?.linkedin && !draft.links?.github && !draft.links?.website) {
      suggestions.push('Add LinkedIn, GitHub, or a portfolio link to strengthen the profile.');
    }
    if ((draft.experience || []).some((item) => /responsible for|worked on|good knowledge|handled/i.test(String(item?.details || '').toLowerCase()))) {
      suggestions.push('Replace generic experience text with measurable achievements and action verbs.');
    }
    if (/(teh|recieve|seperate|managemnt|develpment|expreience|langauge)/i.test(summary)) {
      suggestions.push('Possible spelling mistakes detected in the summary. Use Auto Correct to clean it up.');
    }

    return suggestions.slice(0, 5);
  };

  const resumeDraftSuggestions = buildResumeDraftSuggestions();

  const createDefaultResumeDraft = () => ({
    fullName: studentDetails.name || '',
    title: studentDetails.branch ? `${studentDetails.branch} Student` : 'Student',
    summary: '',
    photo: studentDetails.avatar || '',
    skills: studentDetails.skills || [],
    experience: [{ role: '', company: '', period: '', details: '' }],
    projects: [{ name: '', details: '', link: '' }],
    education: [{ degree: '', school: '', year: '' }],
    certifications: [{ name: '', issuer: '', year: '', credentialId: '' }],
    awards: [{ title: '', issuer: '', year: '', details: '' }],
    links: {
      email: studentDetails.email || '',
      phone: studentDetails.phone || '',
      github: '',
      linkedin: '',
      website: ''
    }
  });

  const normalizeResumeDraft = (draft) => {
    const defaults = createDefaultResumeDraft();
    return {
      ...defaults,
      ...draft,
      links: { ...defaults.links, ...(draft?.links || {}) },
      photo: draft?.photo || defaults.photo,
      experience: draft?.experience?.length ? draft.experience : defaults.experience,
      projects: draft?.projects?.length ? draft.projects : defaults.projects,
      education: draft?.education?.length ? draft.education : defaults.education,
      certifications: draft?.certifications?.length ? draft.certifications : defaults.certifications,
      awards: draft?.awards?.length ? draft.awards : defaults.awards
    };
  };

  const handleSelectResumeTemplate = (template) => {
    setSelectedResumeTemplate(template);
    const storedDraft = studentData?.resumeDraft ? normalizeResumeDraft(studentData.resumeDraft) : createDefaultResumeDraft();
    setResumeDraft({
      ...storedDraft,
      photo: storedDraft.photo || studentDetails.avatar || studentData?.avatar || ''
    });
  };

  const handleResumeDraftChange = (field, value) => {
    setResumeDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeLinksChange = (field, value) => {
    setResumeDraft((prev) => ({
      ...prev,
      links: { ...prev.links, [field]: value }
    }));
  };

  const handleResumePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file for the resume photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeDraft((prev) => ({
        ...prev,
        photo: String(reader.result || '')
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeResumePhoto = () => {
    setResumeDraft((prev) => ({
      ...prev,
      photo: ''
    }));
  };

  const handleResumeDraftListChange = (section, index, field, value) => {
    setResumeDraft((prev) => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const addResumeDraftListItem = (section) => {
    const defaults = {
      experience: { role: '', company: '', period: '', details: '' },
      projects: { name: '', details: '', link: '' },
      education: { degree: '', school: '', year: '' },
      certifications: { name: '', issuer: '', year: '', credentialId: '' },
      awards: { title: '', issuer: '', year: '', details: '' }
    };
    setResumeDraft((prev) => ({
      ...prev,
      [section]: [...prev[section], defaults[section]]
    }));
  };

  const removeResumeDraftListItem = (section, index) => {
    setResumeDraft((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleResumeSkillsChange = (value) => {
    const skills = value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    setResumeDraft((prev) => ({ ...prev, skills }));
  };

  const splitBulletPoints = (text = '') =>
    String(text)
      .split(/\n|•/)
      .map((item) => item.trim())
      .filter(Boolean);

  const buildResumeDraftText = () => {
    const lines = [
      resumeDraft.fullName,
      resumeDraft.title,
      '',
      'Contact',
      `Email: ${resumeDraft.links.email || 'N/A'}`,
      `Phone: ${resumeDraft.links.phone || 'N/A'}`,
      `Website: ${resumeDraft.links.website || 'N/A'}`,
      `GitHub: ${resumeDraft.links.github || 'N/A'}`,
      `LinkedIn: ${resumeDraft.links.linkedin || 'N/A'}`,
      '',
      'Summary',
      resumeDraft.summary || 'N/A',
      '',
      'Skills',
      resumeDraft.skills.length ? resumeDraft.skills.join(', ') : 'N/A',
      '',
      'Experience'
    ];

    if (resumeDraft.experience.length) {
      resumeDraft.experience.forEach((exp, idx) => {
        lines.push(`${idx + 1}. ${exp.role || 'Role'} - ${exp.company || 'Company'} (${exp.period || 'Period'})`);
        if (exp.details) lines.push(`   ${exp.details}`);
      });
    } else {
      lines.push('N/A');
    }

    lines.push('', 'Projects');
    if (resumeDraft.projects.length) {
      resumeDraft.projects.forEach((proj, idx) => {
        lines.push(`${idx + 1}. ${proj.name || 'Project'}${proj.link ? ` (${proj.link})` : ''}`);
        if (proj.details) lines.push(`   ${proj.details}`);
      });
    } else {
      lines.push('N/A');
    }

    lines.push('', 'Education');
    if (resumeDraft.education.length) {
      resumeDraft.education.forEach((edu, idx) => {
        lines.push(`${idx + 1}. ${edu.degree || 'Degree'} - ${edu.school || 'School'} (${edu.year || 'Year'})`);
      });
    } else {
      lines.push('N/A');
    }

    lines.push('', 'Certifications');
    if (resumeDraft.certifications.length) {
      resumeDraft.certifications.forEach((cert, idx) => {
        lines.push(`${idx + 1}. ${cert.name || 'Certification'} - ${cert.issuer || 'Issuer'} (${cert.year || 'Year'}) ${cert.credentialId ? `ID: ${cert.credentialId}` : ''}`.trim());
      });
    } else {
      lines.push('N/A');
    }

    lines.push('', 'Awards');
    if (resumeDraft.awards.length) {
      resumeDraft.awards.forEach((award, idx) => {
        lines.push(`${idx + 1}. ${award.title || 'Award'} - ${award.issuer || 'Issuer'} (${award.year || 'Year'})`);
        if (award.details) lines.push(`   ${award.details}`);
      });
    } else {
      lines.push('N/A');
    }

    return lines.join('\n');
  };

  const handleExportResumeDraft = () => {
    const safeName = resumeDraft.fullName ? resumeDraft.fullName.replace(/\s+/g, '-') : 'resume-draft';
    downloadTextFile(`${safeName}.txt`, buildResumeDraftText());
  };

  const handleSaveResumeDraft = async () => {
    try {
      const response = await studentAPI.updateProfile({
        resumeDraft,
        resumeTemplateId: selectedResumeTemplate?.id || null
      });

      if (response?.data?.student) {
        const updatedStudent = response.data.student;
        setStudentData({
          ...updatedStudent,
          id: updatedStudent?.rollNumber || updatedStudent?.studentId || updatedStudent?.id || updatedStudent?._id || updatedStudent?.user?._id || authUserId || '',
          name: updatedStudent?.name || updatedStudent?.user?.name || '',
          email: updatedStudent?.email || updatedStudent?.user?.email || '',
          phone: getStudentPhone(updatedStudent),
          // Ensure resume and draft content are reflected locally so candidate/HR views update correctly
          resume: updatedStudent?.resume || updatedStudent?.resumeUrl || studentData?.resume || '',
          resumeDraft: normalizeResumeDraft(updatedStudent?.resumeDraft || studentData?.resumeDraft || {}),
          resumeTemplateId: updatedStudent?.resumeTemplateId || selectedResumeTemplate?.id || null,
          avatar: updatedStudent?.avatar || updatedStudent?.user?.avatar || studentData?.avatar || ''
        });
        // If we changed the selected template, keep local selection in sync
        if (updatedStudent?.resumeTemplateId) setSelectedResumeTemplate(resumeTemplates.find(t => t.id === updatedStudent.resumeTemplateId) || null);
      }
      setAnalyzingResumeDraft(true);
      let draftAnalysis = null;
      try {
        const analysisResponse = await resumeAnalysisAPI.analyze({ resumeText: buildResumeDraftText() });
        draftAnalysis = analysisResponse?.data?.analysisResult || analysisResponse?.data?.result || analysisResponse?.data || null;
        if (draftAnalysis) {
          setResumeDraftAnalysis(draftAnalysis);
          setResumeAnalysis(draftAnalysis);
        }
      } catch (analysisError) {
        console.error('Error analyzing saved resume draft:', analysisError);
      } finally {
        setAnalyzingResumeDraft(false);
      }

      setSuccessMessage(
        draftAnalysis?.atsScore
          ? `Resume draft saved successfully! ATS score updated to ${draftAnalysis.atsScore}%`
          : 'Resume draft saved successfully!'
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving resume draft:', error);
      alert('Failed to save resume draft. Please try again.');
    }
  };

  const handleAutoCorrectResumeDraft = async () => {
    setAutoCorrectingResumeDraft(true);
    try {
      const prompt = [
        'You are a resume proofreader and formatter.',
        'Correct spelling, capitalization, grammar, and wording while preserving meaning.',
        'Normalize the resume into a professional format and keep the same structure.',
        'Return ONLY valid JSON (no markdown, no code fences) with this schema:',
        '{"fullName":"","title":"","summary":"","skills":[""],"experience":[{"role":"","company":"","period":"","details":""}],"projects":[{"name":"","details":"","link":""}],"education":[{"degree":"","school":"","year":""}],"certifications":[{"name":"","issuer":"","year":"","credentialId":""}],"awards":[{"title":"","issuer":"","year":"","details":""}],"links":{"email":"","phone":"","github":"","linkedin":"","website":""}}',
        'Start with { and end with }. No additional text.',
        'Draft JSON:',
        JSON.stringify(resumeDraft, null, 2)
      ].join('\n');

      const response = await aiAPI.chat({ message: prompt, history: [] });
      let replyText = String(response?.data?.reply || response?.data?.result || '').trim();

      // Smart JSON extraction with string-aware brace matching
      let jsonText = null;
      
      // 1) Look for fenced code block
      const fencedMatch = replyText.match(/```(?:json\s*)?\n?([\s\S]*?)\n?```/i);
      if (fencedMatch && fencedMatch[1]) {
        jsonText = fencedMatch[1].trim();
      }
      
      // 2) Smart brace matching that respects strings
      if (!jsonText) {
        const braceStart = replyText.indexOf('{');
        if (braceStart !== -1) {
          let depth = 0;
          let inString = false;
          let escapeNext = false;
          let braceEnd = -1;
          
          for (let i = braceStart; i < replyText.length; i++) {
            const char = replyText[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === '\\' && inString) {
              escapeNext = true;
              continue;
            }
            if (char === '"') {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '{') depth++;
              else if (char === '}') {
                depth--;
                if (depth === 0) {
                  braceEnd = i;
                  break;
                }
              }
            }
          }
          if (braceEnd > braceStart) {
            jsonText = replyText.slice(braceStart, braceEnd + 1);
          }
        }
      }
      
      // 3) Fallback: find braces and try repair
      if (!jsonText && replyText.includes('{')) {
        const start = replyText.indexOf('{');
        let end = replyText.lastIndexOf('}');
        if (end <= start) {
          end = replyText.length - 1;
          let depth = 0;
          for (const c of replyText.substring(start)) {
            if (c === '{') depth++;
            else if (c === '}') depth--;
          }
          jsonText = replyText.substring(start) + '}' .repeat(Math.max(0, depth));
        } else {
          jsonText = replyText.substring(start, end + 1);
        }
      }

      // Parse with automatic repair attempts
      let correctedDraft = null;
      if (jsonText) {
        try {
          correctedDraft = JSON.parse(jsonText);
        } catch (e) {
          // Try repair with missing braces
          let depth = 0;
          for (const c of jsonText) {
            if (c === '{') depth++;
            else if (c === '}') depth--;
          }
          if (depth > 0) {
            try {
              correctedDraft = JSON.parse(jsonText + '}' .repeat(depth));
            } catch {
              // Repair failed, will throw below
            }
          }
        }
      }

      if (!correctedDraft) {
        console.error('Failed to extract JSON from auto-correct response');
        throw new Error('No structured correction returned');
      }

      const normalizedDraft = normalizeResumeDraft({
        ...resumeDraft,
        ...correctedDraft,
        skills: Array.isArray(correctedDraft.skills) ? correctedDraft.skills.filter(Boolean) : resumeDraft.skills,
        links: { ...resumeDraft.links, ...(correctedDraft.links || {}) }
      });

      // Update UI immediately with corrected draft
      setResumeDraft(normalizedDraft);

      // Persist corrected draft to backend so candidate/HR see changes
      try {
        const saveResp = await studentAPI.updateProfile({
          resumeDraft: normalizedDraft,
          resumeTemplateId: selectedResumeTemplate?.id || null
        });
        if (saveResp?.data?.student) {
          const updatedStudent = saveResp.data.student;
          setStudentData({
            ...updatedStudent,
            id: updatedStudent?.rollNumber || updatedStudent?.studentId || updatedStudent?.id || updatedStudent?._id || updatedStudent?.user?._id || authUserId || '',
            name: updatedStudent?.name || updatedStudent?.user?.name || '',
            email: updatedStudent?.email || updatedStudent?.user?.email || '',
            phone: getStudentPhone(updatedStudent),
            resume: updatedStudent?.resume || updatedStudent?.resumeUrl || studentData?.resume || '',
            resumeDraft: normalizeResumeDraft(updatedStudent?.resumeDraft || normalizedDraft),
            resumeTemplateId: updatedStudent?.resumeTemplateId || selectedResumeTemplate?.id || null,
            avatar: updatedStudent?.avatar || updatedStudent?.user?.avatar || studentData?.avatar || ''
          });
          if (updatedStudent?.resumeTemplateId) {
            setSelectedResumeTemplate(resumeTemplates.find(t => t.id === updatedStudent.resumeTemplateId) || null);
          }
        }
      } catch (saveError) {
        console.warn('Failed to persist corrected resume draft to backend:', saveError);
        // Still show success to user since UI was updated
      }

      setSuccessMessage('Resume auto-corrected and formatted successfully! ✓');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error auto-correcting resume draft:', error);
      setSuccessMessage('');
      alert(`Auto-correct encountered an issue: ${error.message || 'Please try again.'}`);
    } finally {
      setAutoCorrectingResumeDraft(false);
    }
  };

  const handleExportResumePdf = () => {
    if (selectedResumeTemplate?.id === 2) {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const leftWidth = 180;
      const rightStart = leftWidth + 28;
      const rightMaxWidth = pageWidth - rightStart - 32;
      const photoSource = resumeDraft.photo || '';
      const photoType = photoSource.match(/^data:(image\/\w+);base64,/i)?.[1] || null;
      const leftSidebarColor = [110, 156, 160];
      const headerColor = [247, 173, 99];
      const photoPanelColor = [143, 184, 187];

      doc.setFillColor(...leftSidebarColor);
      doc.rect(0, 0, leftWidth, pageHeight, 'F');

      doc.setFillColor(...photoPanelColor);
      doc.rect(0, 0, leftWidth, 185, 'F');

      if (photoSource && photoType) {
        try {
          doc.addImage(photoSource, photoType.toUpperCase().includes('PNG') ? 'PNG' : 'JPEG', 0, 0, leftWidth, 185);
        } catch (error) {
          // Fallback to initials if the image format is unsupported.
        }
      }

      if (!(photoSource && photoType)) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        const initials = String(resumeDraft.fullName || studentDetails.name || 'AA')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() || '')
          .join('') || 'AA';
        doc.text(initials, leftWidth / 2, 100, { align: 'center' });
      }

      const writeLeftSection = (title, lines = []) => {
        let cursorY = writeLeftSection.cursorY;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(String(title).toUpperCase(), 18, cursorY);
        cursorY += 16;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        lines.forEach((line) => {
          const wrapped = doc.splitTextToSize(String(line), leftWidth - 30);
          wrapped.forEach((wLine) => {
            doc.text(wLine, 18, cursorY);
            cursorY += 13;
          });
          cursorY += 5;
        });
        writeLeftSection.cursorY = cursorY + 10;
      };
      writeLeftSection.cursorY = 220;

      const rightBlock = (title, lines = []) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24 / 2.4);
        doc.setTextColor(18, 18, 18);
        doc.text(String(title).toUpperCase(), rightStart, rightBlock.cursorY);
        rightBlock.cursorY += 18;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        lines.forEach((line) => {
          const wrapped = doc.splitTextToSize(String(line), rightMaxWidth);
          wrapped.forEach((wLine) => {
            doc.text(wLine, rightStart, rightBlock.cursorY);
            rightBlock.cursorY += 14;
          });
        });
        rightBlock.cursorY += 18;
      };
      rightBlock.cursorY = 115;

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(resumeDraft.fullName || studentDetails.name || 'Ananya Verma', leftWidth / 2, 217, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(resumeDraft.title || 'Software Developer', leftWidth / 2, 236, { align: 'center' });

      writeLeftSection('Contact', [
        resumeDraft.links.email || studentDetails.email || 'ananya.verma@email.com',
        resumeDraft.links.phone || studentDetails.phone || '+91-0000000000',
        resumeDraft.links.linkedin || 'linkedin.com/in/ananyaverma',
        resumeDraft.links.github || 'github.com/ananyaverma'
      ]);

      writeLeftSection('Skills', [
        ...(resumeDraft.skills.length ? resumeDraft.skills : [
          'Programming Languages: Python, Java, C#',
          'Tools & Frameworks: TensorFlow, Unity, Git, SQL',
          'Soft Skills: Analytical Thinking, Problem Solving, Collaboration'
        ])
      ]);

      writeLeftSection('Certifications',
        (resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean).length
          ? (resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean)
          : ['HCL GUVI Machine Learning Certificate', 'Udemy Advanced Python Programming', 'Coursera Full Stack Web Development']
      );

      writeLeftSection('Achievements',
        (resumeDraft.awards || []).map((award) => award.title).filter(Boolean).length
          ? (resumeDraft.awards || []).map((award) => award.title).filter(Boolean)
          : ['Winner, National Hackathon 2023', 'Best Project Award, DEF University 2024']
      );

      doc.setFillColor(...headerColor);
      doc.rect(rightStart, 20, pageWidth - rightStart - 20, 86, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(34);
      doc.text(resumeDraft.fullName || studentDetails.name || 'Ananya Verma', rightStart + 14, 56);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.text(resumeDraft.title || 'Software Developer', rightStart + 14, 84);

      rightBlock.cursorY = 138;
      rightBlock('Career Objective', [
        resumeDraft.summary || 'Enthusiastic fresher seeking a software development role to apply project experience in AI, web development, and data analysis, and contribute to innovative solutions.'
      ]);

      const educationGrid = [];
      const educationItem = (resumeDraft.education || [])[0] || { degree: 'B.Tech in Computer Science', school: 'DEF University', year: '2025' };
      educationGrid.push(`${educationItem.school || 'DEF University'}`);
      educationGrid.push(`${educationItem.degree || 'B.Tech in Computer Science'}`);
      rightBlock('Education', [
        `${educationItem.school || 'DEF University'}        ${educationItem.degree || 'B.Tech in Computer Science'}`,
        `${educationItem.year || '2025'}        GPA: ${studentDetails.cgpa ? `${studentDetails.cgpa}/10` : '8.7/10'}`,
        'Relevant Coursework: Machine Learning, Database Management, Web Technologies'
      ]);

      rightBlock('Project Experience',
        (resumeDraft.projects.length ? resumeDraft.projects : [
          { name: 'AI Chatbot for Customer Support', details: 'Developed using Python & NLP\nReduced response time by 40% and improved customer satisfaction' },
          { name: 'E-Commerce Recommendation Engine', details: 'Built using collaborative filtering in Python\nIncreased recommendation accuracy by 25%' },
          { name: 'Mobile Game App', details: 'Designed & deployed using Unity and C#\nAchieved 500+ downloads on Google Play Store' }
        ]).flatMap((proj) => [
          proj.name || 'Project Name',
          ...splitBulletPoints(proj.details || '').map((line) => `• ${line}`)
        ])
      );

      rightBlock('Internship', [
        '3 months        Software Development Intern at GHI Tech',
        'Developed backend APIs for client applications Assisted in testing and debugging modules'
      ]);

      const safeName = resumeDraft.fullName ? resumeDraft.fullName.replace(/\s+/g, '-') : 'resume-draft';
      doc.save(`${safeName}.pdf`);
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const rightX = pageWidth - margin;
    let y = margin;

    const ensureSpace = (heightNeeded = 14) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeWrapped = (text, x, fontSize = 11, isBold = false, width = maxWidth, lineGap = 3) => {
      if (!text) return;
      doc.setFont('times', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text), width);
      lines.forEach((line) => {
        ensureSpace(fontSize + lineGap + 2);
        doc.text(line, x, y);
        y += fontSize + lineGap;
      });
    };

    const writeSectionHeader = (title) => {
      y += 6;
      ensureSpace(22);
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text(String(title).toUpperCase(), margin, y);
      y += 4;
      doc.setDrawColor(120);
      doc.setLineWidth(0.8);
      doc.line(margin, y, rightX, y);
      y += 14;
    };

    const writeLeftRightLine = (leftText, rightText, leftBold = false, rightBold = false, fontSize = 11) => {
      ensureSpace(fontSize + 4);
      doc.setFont('times', leftBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.text(String(leftText || ''), margin, y);
      if (rightText) {
        doc.setFont('times', rightBold ? 'bold' : 'normal');
        doc.text(String(rightText), rightX, y, { align: 'right' });
      }
      y += fontSize + 3;
    };

    const writeBullets = (items) => {
      items.forEach((item) => {
        const bulletText = String(item || '').trim();
        if (!bulletText) return;
        const wrapped = doc.splitTextToSize(`• ${bulletText}`, maxWidth - 18);
        wrapped.forEach((line, index) => {
          ensureSpace(14);
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.text(line, margin + (index === 0 ? 12 : 20), y);
          y += 14;
        });
      });
    };

    const name = (resumeDraft.fullName || 'FIRST LAST').toUpperCase();
    const contactParts = [
      resumeDraft.links.website || 'City, State',
      resumeDraft.links.email,
      resumeDraft.links.phone,
      resumeDraft.links.linkedin
    ].filter(Boolean);
    const contactLine = contactParts.join(' • ');

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text(name, pageWidth / 2, y, { align: 'center' });
    y += 18;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    if (contactLine) {
      doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
      y += 12;
    }

    writeSectionHeader('Education');
    (resumeDraft.education || []).forEach((edu) => {
      writeLeftRightLine(edu.school || 'University Name', edu.year || '', true, false);
      writeLeftRightLine(edu.degree || 'Degree and Major', '', false, false);
      y += 4;
    });

    writeSectionHeader('Professional Experience');
    (resumeDraft.experience || []).forEach((exp) => {
      writeLeftRightLine(exp.company || 'Company Name', exp.period || '', true, false);
      writeLeftRightLine(exp.role || 'Role Title', '', false, false);
      writeBullets(splitBulletPoints(exp.details));
      y += 4;
    });

    writeSectionHeader('Activities and Leadership');
    (resumeDraft.awards || []).forEach((item) => {
      writeLeftRightLine(item.title || 'Activity / Leadership', item.year || '', true, false);
      if (item.issuer) writeLeftRightLine(item.issuer, '', false, false);
      writeBullets(splitBulletPoints(item.details));
      y += 4;
    });

    writeSectionHeader('University Projects');
    (resumeDraft.projects || []).forEach((proj) => {
      writeLeftRightLine(proj.name || 'Project Name', '', true, false);
      if (proj.link) writeLeftRightLine(proj.link, '', false, false, 10);
      writeBullets(splitBulletPoints(proj.details));
      y += 4;
    });

    writeSectionHeader('Other');
    writeBullets([
      `Technical: ${resumeDraft.skills?.length ? resumeDraft.skills.join(', ') : 'Add technical skills'}`,
      `Certifications: ${(resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean).join(', ') || 'Add certifications'}`,
      `Summary: ${resumeDraft.summary || 'Add a short profile summary'}`
    ]);

    const safeName = resumeDraft.fullName ? resumeDraft.fullName.replace(/\s+/g, '-') : 'resume-draft';
    doc.save(`${safeName}.pdf`);
  };

  const canManagePlacements = ["admin", "hr", "staff", "recruiter"].includes(user?.role);

  const handlePlacementChange = (field, value) => {
    setPlacementForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlacementEligibilityChange = (field, value) => {
    setPlacementForm((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: value
      }
    }));
  };

  const handleCreatePlacement = async () => {
    if (!placementForm.companyName || !placementForm.roleTitle || !placementForm.studentUserId) {
      alert("Company, role, and student are required.");
      return;
    }

    try {
      const payload = {
        ...placementForm,
        eligibility: {
          minCgpa: placementForm.eligibility.minCgpa ? Number(placementForm.eligibility.minCgpa) : undefined,
          maxBacklogs: placementForm.eligibility.maxBacklogs ? Number(placementForm.eligibility.maxBacklogs) : undefined,
          branches: placementForm.eligibility.branches
            ? placementForm.eligibility.branches.split(",").map((b) => b.trim())
            : undefined,
          batch: placementForm.eligibility.batch || undefined
        }
      };

      const response = await placementsAPI.create(payload);
      const created = response?.data?.placement;
      if (created) {
        setPlacements((prev) => [created, ...prev]);
        setShowPlacementModal(false);
        setSuccessMessage("Placement result added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error creating placement:", error);
      alert("Failed to create placement result. Please try again.");
    }
  };

  const filteredPlacements = placements.filter((placement) => {
    if (placementFilter === "all") return true;
    return placement.status === placementFilter;
  });

  const getSubmissionForExam = (examId) => {
    return examSubmissions.find((sub) => sub.exam?._id === examId || sub.exam === examId);
  };

  const handleOpenExam = (exam) => {
    setActiveExam(exam);
    setExamAnswers({});
  };

  const updateExamAnswer = (questionIndex, nextValue) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        ...(prev[questionIndex] || {}),
        ...nextValue
      }
    }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;

    const answers = (activeExam.questions || []).map((question, index) => ({
      questionIndex: index,
      answer: examAnswers[index]?.answer || examAnswers[index] || '',
      selectedOption: examAnswers[index]?.selectedOption,
      language: examAnswers[index]?.language
    }));

    try {
      const response = await examsAPI.submit(activeExam._id, { answers });
      const submission = response.data.submission;
      setExamSubmissions((prev) => [submission, ...prev]);
      setActiveExam(null);
      setExamAnswers({});
      setSuccessMessage('Exam submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Exam submit failed:', error);
      alert(error.response?.data?.message || 'Failed to submit exam.');
    }
  };

  const backendInsightsData = dashboardInsights?.data || {};
  const backendMetrics = backendInsightsData.metrics || {};

  const stats = {
    applications: Number.isFinite(Number(backendMetrics.applications)) ? Number(backendMetrics.applications) : (myApplications.length || 5),
    interviews: Number.isFinite(Number(backendMetrics.interviews)) ? Number(backendMetrics.interviews) : (interviewsList.length || 3),
    profileComplete: 85,
    cgpa: studentDetails.cgpa,
    attendance: 92,
    offers: Number.isFinite(Number(backendMetrics.offers))
      ? Number(backendMetrics.offers)
      : (placements.filter((placement) => ["offered", "accepted"].includes(String(placement.status || '').toLowerCase())).length || 2),
    resumeViews: 156,
    interviewsCompleted: Number.isFinite(Number(backendMetrics.examParticipation))
      ? Number(backendMetrics.examParticipation)
      : (examSubmissions.length || 2),
    offersRejected: 1,
    averageScore: Number.isFinite(Number(backendMetrics.averageScore))
      ? Number(backendMetrics.averageScore)
      : examSubmissions.length
        ? Number(
            (
              examSubmissions.reduce((sum, submission) => {
                const score = Number(submission?.score);
                return sum + (Number.isFinite(score) ? score : 0);
              }, 0) / examSubmissions.length
            ).toFixed(1)
          )
        : 7.8,
    studyStreak: 15,
    certificatesEarned: userCertifications.length + 5,
    documentsDownloaded: 23,
    attendancePercentage: 92
  };

  const careerRoadmap = [
    { step: "Aptitude Test", status: "Completed", date: "Sep 5", score: 92 },
    { step: "Technical Round", status: "In Progress", date: "Sep 18", score: null },
    { step: "HR Interview", status: "Upcoming", date: "Sep 25", score: null },
    { step: "Final Offer", status: "Upcoming", date: "Oct 2", score: null }
  ];

  // Removed duplicate notifications array to fix white page issue
  // Rename above if you want to use both, or remove if not needed.

  // Remove duplicates by id
  const rawLiveInterviews = [
    { id: 1, company: 'Google', role: 'SDE-1', date: '18 Sep', status: 'Live', time: '10:00 AM', hrName: 'Priya Sharma', roomId: 'interview-room-student-1' },
    { id: 2, company: 'Microsoft', role: 'Software Engineer', date: '25 Sep', status: 'Upcoming', time: '2:30 PM', hrName: 'Rahul Verma', roomId: 'interview-room-student-2' }
  ];
  const liveInterviews = rawLiveInterviews.filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx);

  const applications = [
    { id: 1, company: 'Google', role: 'SDE', status: 'Interview', date: '20 Sep', salary: '32 LPA', location: 'Bangalore', appliedDate: 'Sep 10' },
    { id: 2, company: 'Amazon', role: 'SDE-1', status: 'Shortlisted', date: '22 Sep', salary: '28 LPA', location: 'Hyderabad', appliedDate: 'Sep 12' },
    { id: 3, company: 'Infosys', role: 'System Engineer', status: 'Offer', date: '24 Sep', salary: '18 LPA', location: 'Pune', appliedDate: 'Sep 5' },
    { id: 4, company: 'TechCorp', role: 'Junior Developer', status: 'Applied', date: '26 Sep', salary: '20 LPA', location: 'Mumbai', appliedDate: 'Sep 15' },
    { id: 5, company: 'Microsoft', role: 'SDE', status: 'Interview', date: '28 Sep', salary: '44 LPA', location: 'Bangalore', appliedDate: 'Sep 8' }
  ];

  const skills = [
    { name: 'Java', level: 'Advanced', proficiency: 90, certifications: ['Oracle Java Associate'] },
    { name: 'Python', level: 'Intermediate', proficiency: 75, certifications: ['Google Python'] },
    { name: 'SQL', level: 'Advanced', proficiency: 88, certifications: ['MySQL Certified'] },
    { name: 'React', level: 'Beginner', proficiency: 65, certifications: [] },
    { name: 'AWS', level: 'Intermediate', proficiency: 72, certifications: ['AWS Associate'] }
  ];

  const certifications = [
    { name: 'Oracle Java Associate', issuer: 'Oracle', date: '2024-08-15', credentialId: 'OCA-2024-001', url: 'https://oracle.com/verify', status: 'Active' },
    { name: 'AWS Solutions Architect Associate', issuer: 'Amazon', date: '2024-06-20', credentialId: 'AWS-AA-2024-001', url: 'https://aws.amazon.com/verify', status: 'Active' },
    { name: 'Google Cloud Associate Cloud Engineer', issuer: 'Google', date: '2024-05-10', credentialId: 'GCP-ACE-2024-001', url: 'https://cloud.google.com/verify', status: 'Active' },
    { name: 'Kubernetes Administrator', issuer: 'Linux Foundation', date: '2024-04-05', credentialId: 'CKA-2024-001', url: 'https://linuxfoundation.org/verify', status: 'Active' },
    { name: 'MongoDB Associate', issuer: 'MongoDB', date: '2024-03-12', credentialId: 'MONGO-2024-001', url: 'https://mongodb.com/verify', status: 'Pending' }
  ];

  const attendanceRecords = [
    { date: '2024-01-15', present: true, subject: 'Data Structures' },
    { date: '2024-01-16', present: true, subject: 'Artificial Intelligence' },
    { date: '2024-01-17', present: false, subject: 'Database Management' },
    { date: '2024-01-18', present: true, subject: 'Web Development' },
    { date: '2024-01-19', present: true, subject: 'Cloud Computing' }
  ];

  const attendanceBySubject = [
    { subject: 'Data Structures', attendance: 95, totalClasses: 20 },
    { subject: 'Artificial Intelligence', attendance: 88, totalClasses: 25 },
    { subject: 'Database Management', attendance: 92, totalClasses: 22 },
    { subject: 'Web Development', attendance: 96, totalClasses: 18 },
    { subject: 'Cloud Computing', attendance: 85, totalClasses: 20 }
  ];

  const gpaHistory = [
    { semester: 'Sem 1', gpa: 8.5, cgpa: 8.6 },
    { semester: 'Sem 2', gpa: 8.5, cgpa: 8.6 },
    { semester: 'Sem 3', gpa: 8.5, cgpa: 8.6 },
    { semester: 'Sem 4', gpa: 8.5, cgpa: 8.6 },

    { semester: 'Sem 5', gpa: 8.5, cgpa: 8.6 },
    { semester: 'Sem 6', gpa: 8.9, cgpa: 8.7 },
    { semester: 'Sem 7', gpa: 8.6, cgpa: 8.75 },
    { semester: 'Sem 8', gpa: 8.8, cgpa: 8.77 },
    

  ];


  
  const classes = [
    { id: 1, name: 'Data Structures', time: '09:00 AM - 10:30 AM', status: 'Active', instructor: 'Dr. Sharma', room: 'A101', attendance: 95 },
    { id: 2, name: 'Artificial Intelligence', time: '11:00 AM - 12:30 PM', status: 'Upcoming', instructor: 'Prof. Verma', room: 'B204', attendance: 88 },
    { id: 3, name: 'Database Management', time: '2:00 PM - 3:30 PM', status: 'Upcoming', instructor: 'Dr. Gupta', room: 'C305', attendance: 92 }
  ];

  const companies = [
    { id: 1, name: 'Google', logo: '🔍', rating: 4.8, reviews: 245, avgPackage: '32 LPA', openings: 15, recruiter: 'Priya Sharma', contact: 'priya.sharma@google.com' },
    { id: 2, name: 'Microsoft', logo: '🪟', rating: 4.9, reviews: 189, avgPackage: '44 LPA', openings: 12, recruiter: 'Rahul Verma', contact: 'rahul.verma@microsoft.com' },
    { id: 3, name: 'Amazon', logo: '📦', rating: 4.6, reviews: 312, avgPackage: '28 LPA', openings: 20, recruiter: 'Anjali Patel', contact: 'anjali.patel@amazon.com' },
    { id: 4, name: 'Infosys', logo: '🌐', rating: 4.5, reviews: 567, avgPackage: '18 LPA', openings: 50, recruiter: 'Deepak Singh', contact: 'deepak.singh@infosys.com' },
    { id: 5, name: 'TechCorp', logo: '💻', rating: 4.7, reviews: 123, avgPackage: '20 LPA', openings: 8, recruiter: 'Sarah Khan', contact: 'sarah.khan@techcorp.com' }
  ];

  const resumeTemplates = [
    {
      id: 1,
      name: 'Classic Academic Template',
      category: 'Fixed Format',
      downloads: 1,
      used: 1,
      rating: '5.0'
    },
    {
      id: 2,
      name: 'Sidebar Professional Template',
      category: 'Fixed Format',
      downloads: 1,
      used: 1,
      rating: '5.0'
    }
  ];

  const academicMetrics = {
    attendance: 92,
    cgpa: studentDetails.cgpa,
    passPercentage: 94,
    backlogs: 0,
    feeStatus: 'Paid',
    hostelFee: 'Pending',
    lastSemesterGPA: 8.9,
    currentSemesterGPA: 8.6
  };

  const resumeVersions = [
    { version: 'v3.2', date: '2024-09-20', downloads: 45, views: 156, status: 'Active' },
    { version: 'v3.1', date: '2024-09-15', downloads: 23, views: 89, status: 'Archived' },
    { version: 'v3.0', date: '2024-09-10', downloads: 12, views: 34, status: 'Archived' }
  ];

  const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

  const localProfileChecklist = [
    { label: 'Full name added', done: Boolean(studentDetails.name?.trim()) },
    { label: 'Primary email added', done: Boolean(studentDetails.email?.trim()) },
    { label: 'Phone number added', done: Boolean(studentDetails.phone?.trim()) },
    { label: 'Branch and semester filled', done: Boolean(studentDetails.branch && studentDetails.semester) },
    { label: 'At least 3 skills listed', done: (studentDetails.skills || []).filter(Boolean).length >= 3 },
    { label: 'Resume uploaded', done: Boolean(studentData?.resume) },
    { label: 'Resume summary written', done: Boolean(resumeDraft.summary?.trim()) },
    { label: 'LinkedIn or GitHub added', done: Boolean(resumeDraft.links?.linkedin?.trim() || resumeDraft.links?.github?.trim()) }
  ];

  const profileChecklist = Array.isArray(backendInsightsData.profileCompletion?.checklist) && backendInsightsData.profileCompletion.checklist.length
    ? backendInsightsData.profileCompletion.checklist
    : localProfileChecklist;

  const completedChecklistCount = profileChecklist.filter((item) => item.done).length;
  const localProfileCompletionPercent = profileChecklist.length
    ? Math.round((completedChecklistCount / profileChecklist.length) * 100)
    : 0;
  const profileCompletionPercent = Number.isFinite(Number(backendInsightsData.profileCompletion?.percent))
    ? Number(backendInsightsData.profileCompletion.percent)
    : localProfileCompletionPercent;

  const localApplicationTimeline = myApplications
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 6)
    .map((application) => {
      const status = normalizeStatus(application.status) || 'applied';
      const stageLabelMap = {
        applied: 'Applied',
        shortlisted: 'Shortlisted',
        interview: 'Interview',
        interviewing: 'Interview',
        offered: 'Offer',
        accepted: 'Offer Accepted',
        rejected: 'Not Selected'
      };

      return {
        id: application._id,
        company: application.job?.company || 'Company',
        role: application.job?.position || application.job?.title || 'Role',
        stage: stageLabelMap[status] || 'Applied',
        date: application.updatedAt || application.createdAt || new Date().toISOString()
      };
    });

  const applicationTimeline = Array.isArray(backendInsightsData.timeline) && backendInsightsData.timeline.length
    ? backendInsightsData.timeline.slice(0, 6)
    : localApplicationTimeline;

  const localRecommendedJobs = availableJobs
    .map((job) => {
      const requiredSkills = Array.isArray(job.requiredSkills)
        ? job.requiredSkills
        : String(job.requiredSkills || job.skills || '')
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);

      const studentSkillSet = new Set((studentDetails.skills || []).map((skill) => String(skill).toLowerCase()));
      const matchedSkills = requiredSkills.filter((skill) => studentSkillSet.has(String(skill).toLowerCase()));

      const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 70 : 50;
      const cgpaEligible = !job?.eligibility?.minCgpa || Number(studentDetails.cgpa) >= Number(job.eligibility.minCgpa);
      const cgpaScore = cgpaEligible ? 30 : 10;
      const matchScore = Math.max(0, Math.min(100, Math.round(skillScore + cgpaScore)));

      return {
        id: job._id,
        company: job.company || 'Company',
        role: job.position || job.title || 'Role',
        score: matchScore,
        matchedSkillsCount: matchedSkills.length,
        totalSkillsCount: requiredSkills.length
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const recommendedJobs = Array.isArray(backendInsightsData.recommendations) && backendInsightsData.recommendations.length
    ? backendInsightsData.recommendations.slice(0, 3)
    : localRecommendedJobs;

  const shortlistedCount = myApplications.filter((application) =>
    ['shortlisted', 'interview', 'interviewing', 'offered', 'accepted'].includes(normalizeStatus(application.status))
  ).length;
  const shortlistRate = Number.isFinite(Number(backendMetrics.shortlistRate))
    ? Number(backendMetrics.shortlistRate)
    : (myApplications.length ? Math.round((shortlistedCount / myApplications.length) * 100) : 0);

  const smartInsights = [
    {
      title: 'Profile Completion',
      value: `${profileCompletionPercent}%`,
      note: profileCompletionPercent >= 80 ? 'Recruiter-ready profile' : 'Complete profile for better visibility',
      color: 'text-indigo-400'
    },
    {
      title: 'Shortlist Rate',
      value: `${shortlistRate}%`,
      note: `${shortlistedCount}/${myApplications.length || 0} applications progressed`,
      color: 'text-emerald-400'
    },
    {
      title: 'Exam Participation',
      value: `${examSubmissions.length}`,
      note: exams.length ? `${examSubmissions.length}/${exams.length} completed` : 'No active exams yet',
      color: 'text-cyan-400'
    }
  ];

  const localActivityFeed = [
    ...notificationsData.slice(0, 6).map((notification) => ({
      id: `notif-${notification._id}`,
      title: notification.title || 'Notification',
      subtitle: notification.message || '',
      date: notification.createdAt || new Date().toISOString(),
      type: 'notification'
    })),
    ...myApplications.slice(0, 6).map((application) => ({
      id: `app-${application._id}`,
      title: `Application ${normalizeStatus(application.status) || 'applied'}`,
      subtitle: `${application.job?.company || 'Company'} • ${application.job?.position || application.job?.title || 'Role'}`,
      date: application.updatedAt || application.createdAt || new Date().toISOString(),
      type: 'application'
    })),
    ...examSubmissions.slice(0, 6).map((submission) => ({
      id: `exam-${submission._id}`,
      title: `Exam submitted: ${submission.exam?.title || 'Interview Exam'}`,
      subtitle: Number.isFinite(Number(submission.score)) ? `Score: ${submission.score}` : 'Awaiting score',
      date: submission.updatedAt || submission.createdAt || new Date().toISOString(),
      type: 'exam'
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const activityFeed = Array.isArray(backendInsightsData.activityFeed) && backendInsightsData.activityFeed.length
    ? backendInsightsData.activityFeed.slice(0, 6)
    : localActivityFeed;

  const candidateAnalytics = (() => {
    const statusBuckets = {
      applied: 0,
      shortlisted: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0
    };

    myApplications.forEach((application) => {
      const status = normalizeStatus(application.status);
      if (status === 'shortlisted') statusBuckets.shortlisted += 1;
      else if (status === 'interview' || status === 'interviewing') statusBuckets.interviewing += 1;
      else if (status === 'offered' || status === 'accepted') statusBuckets.offered += 1;
      else if (status === 'rejected') statusBuckets.rejected += 1;
      else statusBuckets.applied += 1;
    });

    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString('default', { month: 'short' }),
        count: 0
      };
    });

    myApplications.forEach((application) => {
      const appDate = new Date(application?.createdAt || application?.updatedAt || Date.now());
      const key = `${appDate.getFullYear()}-${appDate.getMonth()}`;
      const bucket = monthlyTrend.find((item) => item.key === key);
      if (bucket) bucket.count += 1;
    });

    const examParticipationRate = exams.length
      ? Math.round((examSubmissions.length / exams.length) * 100)
      : 0;

    const recommendationStrength = recommendedJobs.length
      ? Math.round(
          recommendedJobs.reduce((sum, job) => sum + Number(job.score || 0), 0) / recommendedJobs.length
        )
      : 0;

    return {
      activeApplications: stats.applications,
      interviewsScheduled: stats.interviews,
      offersReceived: stats.offers,
      averageAssessmentScore: Number(stats.averageScore || 0),
      profileCompletion: profileCompletionPercent,
      shortlistRate,
      examParticipationRate,
      recommendationStrength,
      pendingProfileTasks: profileChecklist.filter((item) => !item.done).length,
      topRecommendations: recommendedJobs.slice(0, 4),
      applicationStatus: {
        labels: ['Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
        data: [
          statusBuckets.applied,
          statusBuckets.shortlisted,
          statusBuckets.interviewing,
          statusBuckets.offered,
          statusBuckets.rejected
        ]
      },
      monthlyTrend
    };
  })();

  const handleDownloadWeeklyReport = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 48;
    const lineHeight = 18;
    const left = 40;

    const addLine = (text, fontSize = 11, isBold = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.text(String(text), left, y);
      y += lineHeight;
    };

    addLine('Weekly Progress Report', 18, true);
    addLine(`${studentDetails.name} • ${studentDetails.branch} • ${studentDetails.semester}`, 11);
    addLine(`Generated on: ${new Date().toLocaleString()}`, 10);
    y += 8;

    addLine('Key Metrics', 13, true);
    addLine(`Profile completion: ${profileCompletionPercent}%`);
    addLine(`Applications: ${myApplications.length}`);
    addLine(`Shortlist rate: ${shortlistRate}%`);
    addLine(`Exams submitted: ${examSubmissions.length}`);
    y += 8;

    addLine('Top Recommendations', 13, true);
    if (recommendedJobs.length) {
      recommendedJobs.forEach((job, index) => {
        addLine(`${index + 1}. ${job.company} - ${job.role} (${job.score}% match)`);
      });
    } else {
      addLine('No recommendation data available yet.');
    }

    const safeName = (studentDetails.name || 'student').replace(/\s+/g, '-');
    doc.save(`${safeName}-weekly-report.pdf`);
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

  const handleDownloadCertification = (cert) => {
    // Open modal to edit recipient name
    setSelectedCertificate(cert);
    setCertificateRecipientName(studentData?.name || user?.name || '');
    setShowCertificateModal(true);
  };

  const generateAndDownloadCertificate = () => {
    if (!selectedCertificate || !certificateRecipientName.trim()) {
      alert('Please enter a recipient name');
      return;
    }

    const certData = buildCertificateData();

    downloadCertificate(certData);
    setShowCertificateModal(false);
  };

  const handlePreviewCertificate = () => {
    if (!selectedCertificate || !certificateRecipientName.trim()) {
      alert('Please enter a recipient name');
      return;
    }

    const certData = buildCertificateData();

    previewCertificate(certData);
  };

  const buildCertificateData = () => {
    const recipientName = certificateRecipientName.trim();
    const certificateName = selectedCertificate?.name || 'Certification Program';

    return {
      recipientName,
      certificateName,
      issuer: selectedCertificate?.issuer || 'Certification Authority',
      date: selectedCertificate?.date || new Date().toISOString(),
      credentialId: selectedCertificate?.credentialId || '',
      description: `This certificate is proudly awarded to ${recipientName} for successfully completing ${certificateName} and demonstrating outstanding competence in the field.`,
      authorityName: selectedCertificate?.issuer || 'SIGNATURE',
      authorityTitle: 'SIGNATURE',
      mentorName: 'SIGNATURE',
      mentorTitle: 'SIGNATURE'
    };
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm('Are you sure you want to sign out?');
    if (!shouldLogout) return;

    logout();
    navigate("/login");
  };

  const handleAIChat = async () => {
    const userText = aiMessage.trim();
    if (!userText) return;

    const pendingId = Date.now();
    const userMessage = { id: Date.now() - 1, role: 'user', message: userText };
    const pendingMessage = { id: pendingId, role: 'ai', message: 'Thinking...' };

    setAiChat((prev) => [...prev, userMessage, pendingMessage]);
    setAiMessage("");

    const history = [...aiChat, userMessage]
      .slice(-10)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', message: m.message }));

    // Gemini requires the first history entry to be a user message.
    while (history.length && history[0].role !== 'user') {
      history.shift();
    }

    try {
      const response = await api.post('/ai/chat', {
        message: userText,
        history
      });
      const reply = response?.data?.reply || 'Sorry, I could not generate a response.';
      setAiChat((prev) => prev.map((m) => (m.id === pendingId ? { ...m, message: reply } : m)));
    } catch (error) {
      setAiChat((prev) => prev.map((m) => (m.id === pendingId ? { ...m, message: 'Sorry, I am having trouble. Please try again.' } : m)));
    }
  };

  const runStudentGenAIAction = async (actionType) => {
    try {
      setGenAIStudioLoading(true);

      const firstJob = availableJobs[0] || {};
      const firstApplication = myApplications[0] || {};
      const studentSkills = Array.isArray(studentDetails?.skills)
        ? studentDetails.skills
        : String(studentDetails?.skills || '').split(',').map((item) => item.trim()).filter(Boolean);
      const jobSkills = Array.isArray(firstJob?.requiredSkills)
        ? firstJob.requiredSkills
        : String(firstJob?.requiredSkills || firstJob?.skills || firstJob?.description || '')
            .split(/[;,\n]/)
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8);

      let response;

      if (actionType === 'resume-match') {
        response = await aiAPI.resumeMatch({
          candidate: {
            name: studentDetails?.name || 'Student',
            cgpa: Number(studentDetails?.cgpa || 7),
            attendance: 90,
            skills: studentSkills
          },
          job: {
            title: firstJob?.title || firstJob?.position || 'Software Engineer',
            skills: jobSkills
          }
        });
      } else if (actionType === 'interview-questions') {
        response = await aiAPI.interviewQuestions({
          roleTitle: firstJob?.title || firstJob?.position || 'Software Engineer',
          company: firstJob?.company || 'Campus Partner',
          skillFocus: jobSkills.slice(0, 3)
        });
      } else if (actionType === 'readiness-plan') {
        response = await aiAPI.readinessPlan({
          student: {
            cgpa: Number(studentDetails?.cgpa || 7),
            aptitudeScore: 65,
            communicationScore: 68,
            codingScore: 70
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
            cgpa: Number(studentDetails?.cgpa || 7),
            attendance: 90,
            backlogs: 0,
            mockInterviewScore: 66
          }
        });
      } else if (actionType === 'jd-parse') {
        response = await aiAPI.jdParse({
          jobDescription: String(firstJob?.description || 'Need JavaScript, React, SQL and communication. Minimum CGPA 7.0 with 3 interview rounds.')
        });
      } else if (actionType === 'application-review') {
        response = await aiAPI.applicationReview({
          form: {
            fullName: studentDetails?.name || '',
            email: studentDetails?.email || '',
            skills: studentSkills.join(', '),
            projects: studentDetails?.projects || '',
            statement: firstApplication?.coverLetter || 'I am passionate about building scalable products.'
          }
        });
      } else if (actionType === 'analytics-narrative') {
        response = await aiAPI.analyticsNarrative({
          metrics: {
            placementRate: myApplications.length ? Math.round((myApplications.filter((app) => ['offered', 'accepted', 'selected'].includes(String(app?.status || '').toLowerCase())).length / myApplications.length) * 100) : 0,
            interviews: myApplications.filter((app) => ['interview', 'interviewing'].includes(String(app?.status || '').toLowerCase())).length,
            openJobs: availableJobs.length,
            pendingApprovals: myApplications.filter((app) => ['applied', 'shortlisted'].includes(String(app?.status || '').toLowerCase())).length
          }
        });
      } else if (actionType === 'knowledge-base') {
        response = await aiAPI.knowledgeBase({ question: genAIStudioInput.question });
      }

      const resultPayload = response?.data?.result || response?.data?.reply || response?.data?.answer || response?.data;

      if (!resultPayload) {
        throw new Error('No GenAI result returned');
      }

      setGenAIStudioOutput((prev) => ({ ...prev, [actionType]: resultPayload }));
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to execute action';
      setGenAIStudioOutput((prev) => ({ ...prev, [actionType]: { error: message } }));
    } finally {
      setGenAIStudioLoading(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: FileText, label: 'Applications', count: 12, id: 'applications' },
    { icon: Calendar, label: 'Company Calendar', id: 'company-calendar' },
    { icon: TrendingUp, label: 'Placement Details', id: 'placement-details' },
    { icon: Clock, label: 'Interviews', count: 3, id: 'interviews' },
    { icon: Star, label: 'Skills', count: 5, id: 'skills' },
    { icon: Award, label: 'Certifications', count: 5, id: 'certifications' },
    { icon: Percent, label: 'Attendance', count: 92, id: 'attendance' },
    { icon: TrendingUpIcon, label: 'Performance', id: 'performance' },
    { icon: BookOpen, label: 'Classes', count: 3, id: 'classes' },
    { icon: Briefcase, label: 'Companies', count: 5, id: 'companies' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Sparkles, label: 'GenAI Studio', id: 'genai-studio' },
    { icon: BriefcaseIcon, label: 'Placements', id: 'placements' },
    { icon: FileText, label: 'Interview Exam', id: 'interview-exam' },
    { icon: Download, label: 'Resume Builder', id: 'resume' },
    { icon: Mail, label: 'Email Center', id: 'email' },
    { icon: Edit3, label: 'Profile Update', id: 'profile-update' },
    { icon: Settings, label: 'Theme', id: 'theme' }
  ];

  const handleLayoutTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleLayoutTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const isHorizontalSwipe = Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3;

    if (!isHorizontalSwipe) return;

    const startedFromEdge = touchStartX.current <= 32;
    if (!sidebarOpen && startedFromEdge && deltaX > 0) {
      setSidebarOpen(true);
      return;
    }

    if (sidebarOpen && deltaX < 0) {
      setSidebarOpen(false);
    }
  };

  // Profile Edit Modal
  const renderProfileEditModal = () => (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      <div className={`${colors.bg.card} rounded-2xl border ${isDark ? 'border-indigo-500/20' : 'border-indigo-200'} max-w-2xl w-full max-h-96 overflow-y-auto`}>
        <div className={`sticky top-0 ${colors.bg.tertiary} px-8 py-6 ${colors.border} border-b flex items-center justify-between`}>
          <h2 className={`text-2xl font-black ${colors.text.primary}`}>Edit Your Profile</h2>
          <button onClick={handleCancelEdit} className={`p-2 ${colors.bg.hover} rounded-lg`}>
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Full Name</label>
            <input 
              type="text" 
              value={editFormData?.name || ""}
              onChange={(e) => handleEditChange('name', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Email Address</label>
            <input 
              type="email" 
              value={editFormData?.email || ""}
              onChange={(e) => handleEditChange('email', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Phone Number</label>
            <input 
              type="tel" 
              value={editFormData?.phone || ""}
              onChange={(e) => handleEditChange('phone', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Branch</label>
            <select 
              value={editFormData?.branch || ""}
              onChange={(e) => handleEditChange('branch', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Skills</label>
            <div className="space-y-2 mb-3">
              {(editFormData?.skills || []).map((skill, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    value={skill}
                    onChange={(e) => handleSkillChange(idx, e.target.value)}
                    className={`flex-1 ${colors.bg.input} ${colors.border} rounded-xl px-4 py-2 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                    placeholder={`Skill ${idx + 1}`}
                  />
                  <button 
                    onClick={() => removeSkill(idx)}
                    className={`p-2 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-red-100 text-red-600 hover:bg-red-200'} rounded-lg`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={addSkill}
              className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button 
              onClick={handleCancelEdit}
              className={`flex-1 px-6 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl font-bold flex items-center justify-center gap-2`}
            >
              <XCircle size={18} /> Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={saveLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
            >
              <Save size={18} /> {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER THEME SETTINGS ============
  const renderTheme = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentView('overview')} 
          className={`flex items-center gap-2 font-bold ${colors.accent} hover:opacity-80`}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 className={`text-3xl font-black ${colors.text.primary}`}>Theme Settings</h2>
      </div>
      
      <div className={`${colors.bg.card} rounded-3xl p-8 space-y-6 ${colors.border}`}>
        <h3 className={`text-xl font-black flex items-center gap-3 ${colors.text.primary}`}>
          <Settings className="text-amber-400" size={24} />
          Appearance
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-4 block`}>
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: <Sun size={24} /> },
                { value: 'dark', label: 'Dark', icon: <Moon size={24} /> },
                { value: 'system', label: 'System', icon: <Monitor size={24} /> }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 h-32 font-bold uppercase text-sm ${
                    theme === t.value
                      ? 'border-indigo-500 bg-indigo-500/20 shadow-xl shadow-indigo-500/25 scale-105'
                      : `${isDark ? 'border-white/20 hover:border-white/40 hover:bg-white/10' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'}`
                  }`}
                >
                  {t.icon}
                  <span className={colors.text.primary}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={`pt-6 border-t ${colors.border}`}>
            <p className={`text-xs ${colors.text.muted}`}>
              Current: <span className={`font-bold capitalize ${colors.text.primary}`}>{theme}</span>
            </p>
            <p className={`text-xs ${colors.text.muted} mt-2`}>
              Your preferences are automatically saved and synced across all devices.
            </p>
          </div>

          <div className={`grid grid-cols-3 gap-4 pt-4 ${isDark ? 'bg-slate-800/30' : 'bg-gray-100'} p-4 rounded-xl`}>
            <div>
              <p className={`text-[10px] font-bold ${colors.text.muted} uppercase`}>Dark Mode</p>
              <p className={`text-sm font-bold ${colors.text.primary} mt-1`}>Low light comfortable</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold ${colors.text.muted} uppercase`}>Light Mode</p>
              <p className={`text-sm font-bold ${colors.text.primary} mt-1`}>Bright & energetic</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold ${colors.text.muted} uppercase`}>System Default</p>
              <p className={`text-sm font-bold ${colors.text.primary} mt-1`}>Matches OS setting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER PROFILE ============
  // ============ RENDER SETTINGS (PROFILE UPDATE) ============
  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2 className={`text-3xl font-black ${colors.text.primary}`}>Profile Settings</h2>
        </div>
      </div>

      {successMessage && (
        <div className={`${isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'} border px-6 py-4 rounded-xl font-bold`}>
          ✓ {successMessage}
        </div>
      )}

      <div className={`${colors.bg.card} rounded-2xl p-8 ${colors.border}`}>
        <h3 className={`text-xl font-black mb-6 ${colors.text.primary} flex items-center gap-2`}>
          <Edit3 className="text-indigo-400" size={24} />
          Update Your Information
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Full Name</label>
            <input 
              type="text" 
              value={editFormData?.name || studentDetails.name}
              onChange={(e) => handleEditChange('name', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Email Address</label>
            <input 
              type="email" 
              value={editFormData?.email || studentDetails.email}
              onChange={(e) => handleEditChange('email', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Phone Number</label>
            <input 
              type="tel" 
              value={editFormData?.phone ?? studentDetails.phone ?? ''}
              onChange={(e) => handleEditChange('phone', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Branch</label>
            <select 
              value={editFormData?.branch || studentDetails.branch}
              onChange={(e) => handleEditChange('branch', e.target.value)}
              className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.border }}>
          <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-4 block`}>Profile Picture</label>
          <div className="flex justify-center">
            <ImageCropUpload
              currentImage={getAvatarUrl(profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name}`}
              userName={studentDetails.name}
              onImageUpdate={(newAvatarUrl) => {
                setProfileImage(newAvatarUrl);
                handleEditChange('avatar', newAvatarUrl);
                if (studentDetails) {
                  studentDetails.avatar = newAvatarUrl;
                }
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Skills</label>
          <div className="space-y-2 mb-3">
            {(editFormData?.skills || studentDetails.skills || []).map((skill, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="text" 
                  value={skill}
                  onChange={(e) => handleSkillChange(idx, e.target.value)}
                  className={`flex-1 ${colors.bg.input} ${colors.border} rounded-xl px-4 py-2 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                  placeholder={`Skill ${idx + 1}`}
                />
                <button 
                  onClick={() => removeSkill(idx)}
                  className={`p-2 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-red-100 text-red-600 hover:bg-red-200'} rounded-lg`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={addSkill}
            className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
          >
            <Plus size={16} /> Add Skill
          </button>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t ${colors.border}">
          <button 
            onClick={handleSaveProfile}
            disabled={saveLoading}
            className="px-8 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
          >
            <Save size={18} /> {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            onClick={() => {
              setEditFormData(null);
              setCurrentView('profile');
            }}
            className={`px-8 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl font-bold flex items-center justify-center gap-2`}
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Merge Profile and Settings into Profile Update
  const renderProfileUpdate = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl font-black ${colors.text.primary}`}>Profile Update</h2>
      </div>
      {/* Profile Details and Edit Form */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div>
          <div className={`${colors.bg.card} rounded-2xl p-6 ${colors.border} mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${colors.text.primary}`}>Personal Information</h3>
              <button
                type="button"
                onClick={() => document.getElementById('student-profile-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
              >
                Edit Details
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={getAvatarUrl(profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name}`}
                className="w-20 h-20 rounded-full border-4 border-indigo-400 object-cover"
                alt="Profile"
                onError={handleImageError}
              />
              <div>
                <p className={`text-xl font-black ${colors.text.primary}`}>{studentDetails.name}</p>
                <p className={`text-sm ${colors.text.secondary}`}>{studentDetails.email}</p>
                <p className={`text-xs ${colors.text.muted}`}>{studentDetails.phone}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${colors.text.primary}`}>Section: <span className="font-bold">{studentDetails.section}</span></p>
              <p className={`text-sm ${colors.text.primary}`}>Branch: <span className="font-bold">{studentDetails.branch}</span></p>
              <p className={`text-sm ${colors.text.primary}`}>Semester: <span className="font-bold">{studentDetails.semester}</span></p>
              <p className={`text-sm ${colors.text.primary}`}>CGPA: <span className="font-bold">{studentDetails.cgpa}</span></p>
              <p className={`text-sm ${colors.text.primary}`}>Student ID: <span className="font-bold">{studentDetails.id}</span></p>
            </div>
          </div>
        </div>
        {/* Edit Form (from Settings) */}
        <div>
          {successMessage && (
            <div className={`${isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'} border px-6 py-4 rounded-xl font-bold mb-4`}>
              ✓ {successMessage}
            </div>
          )}
          <div id="student-profile-edit-form" className={`${colors.bg.card} rounded-2xl p-8 ${colors.border}`}>
            <h3 className={`text-xl font-black mb-6 ${colors.text.primary} flex items-center gap-2`}>
              <Edit3 className="text-indigo-400" size={24} />
              Update Your Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Full Name</label>
                <input
                  type="text"
                  value={editFormData?.name || studentDetails.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Email Address</label>
                <input
                  type="email"
                  value={editFormData?.email || studentDetails.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Phone Number</label>
                <input
                  type="tel"
                  value={editFormData?.phone ?? studentDetails.phone ?? ''}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Branch</label>
                <select
                  value={editFormData?.branch || studentDetails.branch}
                  onChange={(e) => handleEditChange('branch', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="EE">EE</option>
                  <option value="Civil">Civil</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Section</label>
                <input
                  type="text"
                  value={editFormData?.section ?? studentDetails.section ?? ''}
                  onChange={(e) => handleEditChange('section', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Semester</label>
                <input
                  type="text"
                  value={editFormData?.semester ?? studentDetails.semester ?? ''}
                  onChange={(e) => handleEditChange('semester', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>

              {/* Student ID */}
              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Student ID</label>
                <input
                  type="text"
                  value={editFormData?.id ?? studentDetails.id ?? ''}
                  onChange={(e) => handleEditChange('id', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>

              <div>
                <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>CGPA</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={editFormData?.cgpa ?? studentDetails.cgpa ?? ''}
                  onChange={(e) => handleEditChange('cgpa', e.target.value)}
                  className={`w-full ${colors.bg.input} ${colors.border} rounded-xl px-4 py-3 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.border }}>
              <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-4 block`}>Profile Picture</label>
              <div className="flex justify-center">
                <ImageCropUpload
                  currentImage={getAvatarUrl(profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name}`}
                  userName={studentDetails.name}
                  onImageUpdate={(newAvatarUrl) => {
                    setProfileImage(newAvatarUrl);
                    handleEditChange('avatar', newAvatarUrl);
                    if (studentDetails) {
                      studentDetails.avatar = newAvatarUrl;
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className={`text-sm font-bold ${colors.text.muted} uppercase mb-2 block`}>Skills</label>
              <div className="space-y-2 mb-3">
                {(editFormData?.skills || studentDetails.skills || []).map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(idx, e.target.value)}
                      className={`flex-1 ${colors.bg.input} ${colors.border} rounded-xl px-4 py-2 ${colors.text.primary} focus:outline-none focus:border-indigo-500`}
                      placeholder={`Skill ${idx + 1}`}
                    />
                    <button
                      onClick={() => removeSkill(idx)}
                      className={`p-2 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-red-100 text-red-600 hover:bg-red-200'} rounded-lg`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSkill}
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                <Plus size={16} /> Add Skill
              </button>
            </div>
            <div className="flex gap-3 pt-6 mt-6 border-t ${colors.border}">
              <button
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="px-8 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
              >
                <Save size={18} /> {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditFormData(null);
                  setCurrentView('overview');
                }}
                className={`px-8 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl font-bold flex items-center justify-center gap-2`}
              >
                <XCircle size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER OVERVIEW ============
  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="grid lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 ${isDark ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-300'} rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden`}>
          <div className={`absolute -right-10 -top-10 ${isDark ? 'text-indigo-500/10' : 'text-indigo-200/30'} rotate-12`}><User size={200} /></div>
          <div className="relative group">
            <div className={`w-32 h-32 rounded-3xl overflow-hidden border-4 ${isDark ? 'border-indigo-500/50' : 'border-indigo-300'} shadow-2xl ${isDark ? 'shadow-indigo-500/20' : 'shadow-indigo-300/20'}`}>
              <img 
                src={getAvatarUrl(profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name}`} 
                className="w-full h-full object-cover" 
                alt="Profile" 
                onError={handleImageError}
              />
            </div>
            <button className={`absolute -bottom-2 -right-2 p-2 bg-indigo-500 rounded-xl hover:scale-110 transition-transform`}>
              <Camera size={18} className="text-white" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className={`text-4xl font-black mb-1 ${colors.text.primary}`}>{studentDetails.name}</h2>
            <p className="text-indigo-400 font-bold mb-4">ID: {studentDetails.id}</p>
            <div className="grid grid-cols-2 gap-4">
                {[{ label: 'Branch', value: studentDetails.branch },
                    { label: 'Semester', value: studentDetails.semester },
                    { label: 'CGPA', value: studentDetails.cgpa, color: 'text-emerald-400' },
                    { label: 'Status', value: 'Active', color: 'text-blue-400' }
                ].map((item, idx) => (
                    <div key={idx} className={`${colors.bg.tertiary} p-3 rounded-xl ${colors.border} border`}>
                        <span className={`text-[10px] ${colors.text.muted} font-bold block uppercase`}>{item.label}</span>
                        <span className={`font-bold ${item.color || colors.text.primary}`}>{item.value}</span>
                    </div>
                ))}
                </div>
                {/* Portfolio Button in Profile Card */}
                <div className="mt-4 flex justify-center">
                  {resumeDraft.links.website ? (
                    <a
                      href={resumeDraft.links.website.startsWith('http') ? resumeDraft.links.website : `https://${resumeDraft.links.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 transition-colors"
                    >
                      <ExternalLink size={14} /> View Portfolio
                    </a>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-bold text-xs uppercase opacity-60 cursor-not-allowed"
                      disabled
                      title="Add your website/portfolio link to enable"
                    >
                      <ExternalLink size={14} /> View Portfolio
                    </button>
                  )}
                </div>
          </div>
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} p-6 rounded-2xl ${isDark ? 'border-indigo-500/30' : 'border-indigo-200'} border text-center min-w-[140px]`}>
            <p className={`text-3xl font-black text-emerald-400`}>{profileCompletionPercent}%</p>
            <p className={`text-[10px] ${colors.text.muted} font-bold uppercase tracking-widest`}>Profile Ready</p>
            <button onClick={() => setCurrentView('profile-update')} className="mt-3 text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-all">Complete Profile</button>
          </div>
        </div>

        <div className={`${colors.bg.card} rounded-[2rem] p-8 flex flex-col ${colors.border}`}>
          <h3 className={`text-lg font-black mb-6 flex items-center gap-2 ${colors.text.primary}`}>
            <Target size={20} className="text-orange-500" /> CAREER ROADMAP
          </h3>
          <div className="space-y-4 flex-1">
            {careerRoadmap.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : isDark ? 'bg-slate-700' : 'bg-gray-400'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-bold leading-none ${colors.text.primary}`}>{item.step}</p>
                  <p className={`text-[10px] ${colors.text.muted} font-bold uppercase mt-1`}>{item.date}</p>
                </div>
                {item.score && <span className="text-xs font-black text-emerald-400">{item.score}%</span>}
                {item.status === 'Completed' && <CheckCircle size={14} className="text-emerald-500" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Applications', val: stats.applications, icon: FileText, color: 'blue', pct: 70, id: 'applications' },
          { label: 'Interviews', val: stats.interviews, icon: Users, color: 'purple', pct: 30, id: 'interviews' },
          { label: 'Offers', val: stats.offers, icon: Award, color: 'emerald', pct: 100, id: 'overview' },
          { label: 'Browse Jobs', val: availableJobs.length, icon: Briefcase, color: 'cyan', pct: 100, id: 'browse-jobs' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setCurrentView(stat.id)}
            className={`${colors.bg.card} ${colors.border} p-6 rounded-3xl hover:-translate-y-1 transition-all cursor-pointer group ${colors.bg.hover}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${isDark ? `bg-${stat.color}-500/20 text-${stat.color}-500` : `bg-${stat.color}-100 text-${stat.color}-600`} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-3xl font-black ${colors.text.primary}`}>{stat.val}</span>
            </div>
            <p className={`${colors.text.secondary} font-bold text-sm uppercase mb-4`}>{stat.label}</p>
            <div className={`h-1.5 w-full ${isDark ? 'bg-white/5' : 'bg-gray-300'} rounded-full`}>
              <div className={`h-full ${isDark ? `bg-${stat.color}-500` : `bg-${stat.color}-400`} rounded-full`} style={{ width: `${stat.pct}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {smartInsights.map((insight, index) => (
          <div key={index} className={`${colors.bg.card} ${colors.border} rounded-2xl p-6`}>
            <p className={`text-[10px] ${colors.text.muted} uppercase font-bold mb-2`}>{insight.title}</p>
            <p className={`text-3xl font-black ${insight.color}`}>{insight.value}</p>
            <p className={`text-xs ${colors.text.secondary} mt-2`}>{insight.note}</p>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className={`text-lg font-black ${colors.text.primary}`}>Profile Completeness</h3>
            <button
              onClick={handleDownloadWeeklyReport}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-500 transition-colors"
            >
              Weekly Report
            </button>
          </div>
          <div className={`h-2 w-full ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden mb-5`}>
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${profileCompletionPercent}%` }} />
          </div>
          <div className="space-y-2">
            {profileChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className={colors.text.primary}>{item.label}</span>
                {item.done ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-amber-500" />}
              </div>
            ))}
          </div>
        </div>

        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <h3 className={`text-lg font-black mb-6 ${colors.text.primary}`}>Top Job Recommendations</h3>
          <div className="space-y-4">
            {recommendedJobs.length ? recommendedJobs.map((job) => (
              <div key={job.id} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${colors.text.primary}`}>{job.company}</p>
                    <p className={`text-xs ${colors.text.secondary}`}>{job.role}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{job.score}%</span>
                </div>
                <p className={`text-[10px] ${colors.text.muted} mt-2`}>
                  Skill match: {job.matchedSkillsCount}/{job.totalSkillsCount || 0}
                </p>
              </div>
            )) : (
              <p className={`text-sm ${colors.text.secondary}`}>No jobs to recommend yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <h3 className={`text-lg font-black mb-6 ${colors.text.primary}`}>Application Timeline</h3>
          <div className="space-y-4">
            {applicationTimeline.length ? applicationTimeline.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 mt-1 rounded-full bg-indigo-500" />
                <div>
                  <p className={`text-sm font-bold ${colors.text.primary}`}>{item.company} • {item.role}</p>
                  <p className={`text-xs ${colors.text.secondary}`}>{item.stage}</p>
                  <p className={`text-[10px] ${colors.text.muted}`}>{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className={`text-sm ${colors.text.secondary}`}>No applications yet. Apply to see timeline updates.</p>
            )}
          </div>
        </div>

        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <h3 className={`text-lg font-black mb-6 ${colors.text.primary}`}>Recent Activity Feed</h3>
          <div className="space-y-4">
            {activityFeed.length ? activityFeed.map((item) => (
              <div key={item.id} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <p className={`text-sm font-bold ${colors.text.primary}`}>{item.title}</p>
                <p className={`text-xs ${colors.text.secondary}`}>{item.subtitle}</p>
                <p className={`text-[10px] ${colors.text.muted} mt-1`}>{new Date(item.date).toLocaleString()}</p>
              </div>
            )) : (
              <p className={`text-sm ${colors.text.secondary}`}>No activity yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
          <div className={`${colors.bg.card} rounded-[2rem] p-8 ${colors.border} relative`}>
            <h3 className={`text-lg font-black mb-6 ${colors.text.primary}`}>📬 Recent Notifications</h3>
            <div className="absolute top-6 right-8">
              <Bell className="text-indigo-400" size={28} />
            </div>
            <div className="space-y-4">
              {notifLoading ? (
                <div className="text-sm text-gray-500">Loading notifications...</div>
              ) : notificationsData.length === 0 ? (
                <div className="text-sm text-gray-500">No notifications yet.</div>
              ) : notificationsData.slice(0, 4).map(notif => (
                <div key={notif._id} className={`flex gap-4 p-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl hover:bg-white/[0.08] transition-all cursor-pointer`}>
                  <span className="text-2xl">{notif.type === 'job' ? '💼' : notif.type === 'interview' ? '📍' : notif.type === 'application' ? '🎯' : notif.type === 'system' ? '🔔' : '⭐'}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${colors.text.primary}`}>{notif.title}</p>
                    <p className={`text-xs ${colors.text.secondary}`}>{notif.message}</p>
                    <p className={`text-[10px] ${colors.text.muted} mt-1`}>{new Date(notif.createdAt).toLocaleString()}</p>
                    {notif.type === 'interview' && extractRoomIdFromNotification(notif) && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          const roomId = extractRoomIdFromNotification(notif);
                          if (roomId) {
                            navigate(`/interview-room/${roomId}`);
                          }
                        }}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        Accept & Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        <div className={`${colors.bg.card} rounded-[2rem] p-8 ${colors.border}`}>
          <h3 className={`text-lg font-black mb-6 ${colors.text.primary}`}>📚 Today's Classes</h3>
          <div className="space-y-4">
            {classes.map(cls => (
              <div key={cls.id} className={`p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-300'} rounded-xl ${isDark ? 'hover:border-indigo-500/30' : 'hover:border-indigo-400'} border transition-all`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold ${colors.text.primary}`}>{cls.name}</h4>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${cls.status === 'Active' ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    {cls.status}
                  </span>
                </div>
                <p className={`text-[10px] ${colors.text.secondary} mb-2`}>{cls.time} • {cls.instructor}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={colors.text.muted}>Room {cls.room}</span>
                  <span className="text-emerald-400">Attendance: {cls.attendance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {/* In-app video conference for live classes */}
        <div className="rounded-[2rem] p-8 border">
          <h3 className="text-lg font-black mb-6">🎥 Live Class (In-App Video)</h3>
          {/* Example: Use a static roomId for demo, or generate per class */}
          <VideoConference roomId={"live-class-room"} user={user} />
        </div>
      </section>
    </div>
  );


// ============ SALARY FORMATTER (GLOBAL) ============
const formatJobSalary = (salary) => {
  if (!salary) return 'Not specified';
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'number') return `₹${salary.toLocaleString('en-IN')}`;
  if (typeof salary === 'object') {
    const min = salary.min ? `₹${salary.min.toLocaleString('en-IN')}` : null;
    const max = salary.max ? `₹${salary.max.toLocaleString('en-IN')}` : null;
    if (min && max) return `${min} - ${max}`;
    return min || max || 'Not specified';
  }
  return 'Not specified';
};

// ============ RENDER APPLICATIONS ============
const renderApplications = () => {

    const formatStatusLabel = (status) => {
      if (!status) return 'Applied';
      const normalized = String(status).toLowerCase();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const applicationCards = myApplications.map((app) => {
      const job = app.job || {};
      return {
        id: app._id || app.id,
        company: job.company || 'Company',
        role: job.position || job.title || 'Role',
        location: job.location || 'Location',
        status: formatStatusLabel(app.status || 'applied'),
        salary: formatJobSalary(job.salary),
        appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'N/A',
        interviewDate: app.interviewDate || 'TBD',
        description: job.description || 'No description provided',
        skills: job.requiredSkills || job.skills || '',
        full: app
      };
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80 transition-colors mb-4`}>
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>All Applications</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentView('browse-jobs')}
              className="px-4 py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-500 transition-all text-white"
            >
              Apply Job
            </button>
            <button className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-300'} rounded-xl hover:${colors.bg.hover}`}><Search size={20} /></button>
            <button className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-300'} rounded-xl hover:${colors.bg.hover}`}><Filter size={20} /></button>
          </div>
        </div>

        {applicationCards.length === 0 ? (
          <div className={`${colors.bg.card} ${colors.border} p-10 rounded-2xl text-center flex flex-col items-center justify-center`}>
            <FileText size={48} className="text-gray-400 mb-4" />
            <p className={`${colors.text.secondary} font-bold mb-2`}>No applications yet.</p>
            <p className={`${colors.text.muted} mb-4`}>Apply to a job to get started and track your progress here.</p>
            <button
              onClick={() => setCurrentView('browse-jobs')}
              className="mt-4 px-5 py-2 bg-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-500 transition-all text-white"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {applicationCards.map((app) => (
              <div key={app.id} className={`${colors.bg.card} ${colors.border} p-6 rounded-2xl ${isDark ? 'hover:border-indigo-500/30' : 'hover:border-indigo-400'} transition-all group`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'}`}>{app.company}</h3>
                    <p className={`${colors.text.secondary} text-sm`}>{app.role} • {app.location}</p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={20} /></button>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs mb-4">
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Status</p>
                    <p className={`font-black ${colors.text.primary} mt-1`}>{app.status}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Package</p>
                    <p className="font-black text-emerald-400 mt-1">{app.salary}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Interview</p>
                    <p className={`font-black ${colors.text.primary} mt-1`}>{app.interviewDate}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Applied</p>
                    <p className={`font-black ${colors.text.primary} mt-1`}>{app.appliedDate}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="flex-1 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 transition-all text-white"
                  >
                    View Details
                  </button>
                  {app.status === 'Shortlisted' && (
                    <button className={`flex-1 py-2 ${isDark ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'} rounded-lg font-bold text-xs uppercase transition-all`}>
                      Schedule Interview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedApplication && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`${colors.bg.card} ${colors.border} border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden`}>
              <div className="p-6 flex items-center justify-between border-b border-white/10">
                <div>
                  <h3 className={`text-2xl font-black ${colors.text.primary}`}>{selectedApplication.company}</h3>
                  <p className={`${colors.text.secondary}`}>{selectedApplication.role} • {selectedApplication.location}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Status</p>
                    <p className={`font-black ${colors.text.primary}`}>{selectedApplication.status}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Package</p>
                    <p className="font-black text-emerald-400">{selectedApplication.salary}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Applied</p>
                    <p className={`font-black ${colors.text.primary}`}>{selectedApplication.appliedDate}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Interview</p>
                    <p className={`font-black ${colors.text.primary}`}>{selectedApplication.interviewDate}</p>
                  </div>
                </div>
                <div>
                  <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Job Description</p>
                  <p className={`${colors.text.primary} text-sm mt-2`}>{selectedApplication.description}</p>
                </div>
                {selectedApplication.skills && (
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase text-[10px]`}>Skills</p>
                    <p className={`${colors.text.primary} text-sm mt-2`}>{selectedApplication.skills}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============ RENDER INTERVIEWS ============
const renderInterviews = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80 transition-colors`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl font-black ${isDark ? 'text-red-500' : 'text-red-600'}`}>Scheduled Interviews</h2>
      </div>

      {/* Interview Calendar View */}
      <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border}`}>
        <h3 className={`text-xl font-bold ${colors.text.primary} mb-4`}>Interview Calendar</h3>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className={`text-center text-xs font-bold ${colors.text.muted} py-2`}>{day}</div>
          ))}
          {[...Array(31)].map((_, i) => {
            const day = i + 1;
            const hasInterview = liveInterviews.some(int => parseInt(int.date.split(' ')[0]) === day);
            return (
              <div 
                key={i}
                className={`text-center py-2 rounded-lg text-sm font-bold cursor-pointer transition-all
                  ${hasInterview 
                    ? 'bg-indigo-600 text-white' 
                    : `${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`
                  }`}
              >
                {day < 10 ? `0${day}` : day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interviews List */}
      <div className="grid gap-6">
        {liveInterviews.map((int) => (
          <div key={int.id} className={`border rounded-2xl p-8 ${int.status === 'Live' ? isDark ? 'bg-red-600/10 border-red-500/30' : 'bg-red-50 border-red-300' : `${colors.bg.card} ${colors.border}`}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center text-2xl`}>{int.company === 'Google' ? '🔍' : '🪟'}</div>
                  <div>
                    <h3 className={`text-2xl font-bold ${colors.text.primary}`}>{int.company}</h3>
                    <p className="text-indigo-400 font-bold">{int.role}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className={colors.text.muted} />
                    <span className={colors.text.primary}>{int.date} • {int.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={16} className={colors.text.muted} />
                    <span className={colors.text.primary}>{int.hrName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video size={16} className={colors.text.muted} />
                    <span className={int.status === 'Live' ? 'text-red-400 font-bold' : colors.text.secondary}>
                      {int.status === 'Live' ? '🔴 LIVE NOW' : 'Scheduled'}
                    </span>
                  </div>
                  {int.status === 'Live' && (
                    <div className={`mt-3 px-3 py-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'} text-red-400 text-xs font-bold`}>
                      ⏱️ Interview in progress - {Math.floor(Math.random() * 30) + 5} min left
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <>
                  <div className={`${isDark ? 'bg-black/30' : 'bg-gray-300'} rounded-xl h-48 flex items-center justify-center ${isDark ? 'border-white/10' : 'border-gray-400'} border`}>
                    <Video className={`w-12 h-12 ${isDark ? 'text-slate-600' : 'text-gray-600'}`} />
                  </div>
                  {int.status === 'Live' ? (
                    <button
                      onClick={() => {
                        const targetRoomId = int.roomId || `interview-room-${int.id}`;
                        navigate(`/interview-room/${targetRoomId}`);
                      }}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase hover:bg-red-500 transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Video size={20} /> Join Interview Room
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const startTime = new Date(int.date.split(' ')[0]);
                        const roomPath = `/interview-room/${int.roomId || `interview-room-${int.id}`}`;
                        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Student Placement//Interview//EN
BEGIN:VEVENT
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(startTime.getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${int.company} - ${int.role} Interview
DESCRIPTION:Interview with ${int.hrName}
LOCATION:${window.location.origin}${roomPath}
END:VEVENT
END:VCALENDAR`;
                        const blob = new Blob([icsContent], { type: 'text/calendar' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${int.company}-interview.ics`;
                        a.click();
                        setSuccessMessage('Interview added to calendar!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={20} /> Add to Calendar
                    </button>
                  )}
                  <p className={`text-center text-xs ${colors.text.muted}`}>
                    {int.status === 'Live'
                      ? 'You will join the in-app interview camera room.'
                      : 'Interview room will open in-app at the scheduled time.'}
                  </p>
                </>
              </div>
            </div>
          </div>
        ))}
      </div>

      {liveInterviews.length === 0 && (
        <div className={`${colors.bg.card} rounded-2xl p-12 border ${colors.border} text-center`}>
          <Calendar className={`w-16 h-16 ${colors.text.muted} mx-auto mb-4`} />
          <p className={`${colors.text.primary} font-bold text-lg mb-2`}>No interviews scheduled</p>
          <p className={`${colors.text.secondary} text-sm`}>Keep checking back for upcoming interview opportunities</p>
        </div>
      )}
    </div>
  );

  // ============ RENDER SKILLS ============
  const renderSkills = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2 className={`text-3xl font-black ${colors.text.primary}`}>Technical Skills</h2>
        </div>
        <button
          onClick={handleSaveSkillsSection}
          disabled={savingSkills}
          className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 text-white disabled:opacity-60"
        >
          <Save size={16} className="inline mr-2" /> {savingSkills ? 'Saving...' : 'Save Skills'}
        </button>
      </div>

      <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} space-y-4`}>
        <h3 className={`text-lg font-bold ${colors.text.primary}`}>Add New Skill</h3>
        <p className={`text-xs ${colors.text.muted}`}>
          Required details: <span className={`font-bold ${colors.text.primary}`}>Skill Name, Level, Proficiency (%)</span>
        </p>
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className={`block text-[11px] font-bold mb-1 ${colors.text.muted}`}>Skill Name * (Required)</label>
            <input
              value={newSkillDraft.name}
              onChange={(e) => setNewSkillDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter skill name"
              className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-bold mb-1 ${colors.text.muted}`}>Level * (Required)</label>
            <select
              value={newSkillDraft.level}
              onChange={(e) => setNewSkillDraft((prev) => ({ ...prev, level: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className={`block text-[11px] font-bold mb-1 ${colors.text.muted}`}>Proficiency % * (Required)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newSkillDraft.proficiency}
              onChange={(e) => setNewSkillDraft((prev) => ({ ...prev, proficiency: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
              placeholder="0 - 100"
              className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
            />
          </div>
          <button
            onClick={handleAddNewSkill}
            className="h-10 px-4 py-2 bg-emerald-600 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500 text-white"
          >
            <Plus size={16} className="inline mr-1" /> Add Skill
          </button>
        </div>
        <div>
          <label className={`block text-[11px] font-bold mb-1 ${colors.text.muted}`}>Certifications (Optional)</label>
          <input
            value={newSkillDraft.certifications}
            onChange={(e) => setNewSkillDraft((prev) => ({ ...prev, certifications: e.target.value }))}
            placeholder="Enter certifications, separated by commas"
            className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {editableSkills.map((skill) => (
          <div key={skill.id} className={`${colors.bg.card} rounded-2xl p-6 ${isDark ? 'hover:border-indigo-500/30' : 'hover:border-indigo-400'} transition-all border ${colors.border}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                value={skill.name}
                onChange={(e) => handleSkillFieldUpdate(skill.id, 'name', e.target.value)}
                className={`sm:col-span-2 px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
                placeholder="Skill name"
              />
              <select
                value={skill.level}
                onChange={(e) => handleSkillFieldUpdate(skill.id, 'level', e.target.value)}
                className={`px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className={colors.text.muted}>Proficiency</span>
                <span className={`font-bold ${colors.text.primary}`}>{skill.proficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Number(skill.proficiency) || 0}
                onChange={(e) => handleSkillFieldUpdate(skill.id, 'proficiency', Number(e.target.value))}
                className="w-full"
              />
              <div className={`mt-2 h-2 ${isDark ? 'bg-white/5' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Number(skill.proficiency) || 0}%` }} />
              </div>
            </div>

            <div className="mb-4">
              <p className={`text-xs ${colors.text.muted} font-bold mb-2`}>Certifications:</p>
              {Array.isArray(skill.certifications) && skill.certifications.length > 0 ? (
                <div className="space-y-1 mb-2">
                  {skill.certifications.map((cert, index) => (
                    <p key={index} className="text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle size={12} /> {cert}
                    </p>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${colors.text.muted} mb-2`}>No certifications added.</p>
              )}
              <input
                value={Array.isArray(skill.certifications) ? skill.certifications.join(', ') : ''}
                onChange={(e) =>
                  handleSkillFieldUpdate(
                    skill.id,
                    'certifications',
                    e.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                  )
                }
                placeholder="Update certifications (comma separated)"
                className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary} outline-none`}
              />
            </div>

            <button
              onClick={() => handleSkillDelete(skill.id)}
              className="w-full py-2 bg-red-600/90 hover:bg-red-600 rounded-lg font-bold text-xs uppercase text-white"
            >
              <Trash2 size={14} className="inline mr-2" /> Remove Skill
            </button>
          </div>
        ))}
      </div>

      {!editableSkills.length && (
        <div className={`${colors.bg.card} rounded-2xl p-8 border ${colors.border} text-center`}>
          <p className={`${colors.text.secondary} font-bold`}>No skills added yet. Use the section above to add your first skill.</p>
        </div>
      )}
    </div>
  );

  // ============ RENDER CERTIFICATIONS ============
  const renderCertifications = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2 className={`text-3xl font-black ${colors.text.primary}`}>Certifications</h2>
        </div>
        <button onClick={() => setShowAddCertification(!showAddCertification)} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 text-white">
          <Plus size={16} className="inline mr-2" /> Add Certification
        </button>
      </div>

      {showAddCertification && (
        <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} space-y-4`}>
          <h3 className={`text-lg font-bold ${colors.text.primary}`}>Add New Certification</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Certification Name"
              value={certForm.name}
              onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
            />
            <input
              placeholder="Issuing Organization"
              value={certForm.issuer}
              onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              value={certForm.date}
              onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
            />
            <input
              placeholder="Credential ID"
              value={certForm.credentialId}
              onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
            />
          </div>
          <input
            placeholder="Verification URL (optional)"
            value={certForm.url}
            onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
          />
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest ${colors.text.muted} mb-2`}>
              Uploaded By
            </label>
            <select
              value={certForm.source}
              onChange={(e) => setCertForm({ ...certForm, source: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} text-sm`}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <label className={`block px-4 py-4 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary} cursor-pointer text-center font-bold text-xs uppercase hover:opacity-80 transition-opacity`}>
            {certForm.certificateFile ? `✓ ${certForm.certificateFile.name}` : (uploadingCertificate ? 'Uploading...' : '📄 Upload Certificate File (PDF/JPG/PNG)')}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertForm({ ...certForm, certificateFile: e.target.files?.[0] || null })}
              className="hidden"
              disabled={uploadingCertificate}
            />
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (certForm.name && certForm.issuer && certForm.date) {
                  const newCert = {
                    name: certForm.name,
                    issuer: certForm.issuer,
                    date: certForm.date,
                    credentialId: certForm.credentialId,
                    url: certForm.url || '#',
                    source: certForm.source,
                    status: 'Active',
                    certificateFile: certForm.certificateFile?.name || null
                  };
                  setUserCertifications([...userCertifications, newCert]);
                  setCertForm({ name: '', issuer: '', date: '', credentialId: '', url: '', source: 'student', certificateFile: null });
                  setShowAddCertification(false);
                  setSuccessMessage('Certification added successfully!');
                  setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                  alert('Please fill in all required fields');
                }
              }}
              disabled={uploadingCertificate}
              className="flex-1 px-4 py-2 bg-emerald-600 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500 text-white disabled:opacity-50"
            >
              Save Certification
            </button>
            <button
              onClick={() => {
                setCertForm({ name: '', issuer: '', date: '', credentialId: '', url: '', source: 'student', certificateFile: null });
                setShowAddCertification(false);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs uppercase ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {[...certifications, ...userCertifications].map((cert, idx) => (
          <div key={idx} className={`${isDark ? 'bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300'} border rounded-2xl p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-lg font-bold ${colors.text.primary}`}>{cert.name}</h3>
                <p className="text-indigo-400 text-sm">{cert.issuer}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-1 rounded-full ${cert.status === 'Active' ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    {cert.status || 'Active'}
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                    {String(cert.source || 'student').toUpperCase()} UPLOAD
                  </span>
                </div>
              </div>
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div>
                <p className={`${colors.text.muted} font-bold text-xs uppercase`}>Issue Date</p>
                <p className={colors.text.primary}>{cert.date ? new Date(cert.date).toLocaleDateString() : (cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A')}</p>
              </div>
              <div>
                <p className={`${colors.text.muted} font-bold text-xs uppercase`}>Credential ID</p>
                <p className={`${colors.text.primary} font-mono text-xs`}>{cert.credentialId || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 flex items-center justify-center gap-2 text-white">
                <ExternalLink size={14} /> Verify
              </a>
              <button
                onClick={() => handleDownloadCertification(cert)}
                className={`flex-1 py-2 ${isDark ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'} rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all`}
                title="Generate and download certificate as PDF"
              >
                <Download size={14} /> PDF Certificate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ RENDER ATTENDANCE ============
  const renderAttendance = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl font-black ${colors.text.primary}`}>Attendance Tracking</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDark ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-300'} border rounded-2xl p-6`}>
          <p className={`text-[10px] ${colors.text.muted} font-bold uppercase mb-2`}>Overall Attendance</p>
          <p className="text-5xl font-black text-emerald-400 mb-2">92%</p>
          <div className={`w-full h-2 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden`}>
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-indigo-500/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-indigo-300'} border rounded-2xl p-6`}>
          <p className={`text-[10px] ${colors.text.muted} font-bold uppercase mb-2`}>Classes Attended</p>
          <p className="text-5xl font-black text-blue-400 mb-2">92/100</p>
          <p className={`text-xs ${colors.text.muted}`}>Last 30 days</p>
        </div>

        <div className={`${isDark ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/20' : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'} border rounded-2xl p-6`}>
          <p className={`text-[10px] ${colors.text.muted} font-bold uppercase mb-2`}>Best Subject</p>
          <p className="text-2xl font-black text-purple-400 mb-2">Web Development</p>
          <p className={`text-xs ${colors.text.muted}`}>96% attendance</p>
        </div>
      </div>

      <h3 className={`text-2xl font-black ${colors.text.primary}`}>Attendance by Subject</h3>
      <div className="grid gap-4">
        {attendanceBySubject.map((sub, idx) => (
          <div key={idx} className={`${colors.bg.card} ${colors.border} p-6 rounded-2xl`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className={`font-bold text-lg ${colors.text.primary}`}>{sub.subject}</h4>
              <span className="text-2xl font-black text-emerald-400">{sub.attendance}%</span>
            </div>
            <div className={`w-full h-2 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${sub.attendance}%` }} />
            </div>
            <p className={`text-xs ${colors.text.muted} mt-2`}>{sub.totalClasses} total classes</p>
          </div>
        ))}
      </div>

      <h3 className={`text-2xl font-black ${colors.text.primary}`}>Recent Records</h3>
      <div className="grid gap-2">
        {attendanceRecords.map((record, idx) => (
          <div key={idx} className={`flex items-center justify-between ${colors.bg.card} ${colors.border} p-4 rounded-xl`}>
            <div className="flex items-center gap-3">
              {record.present ? (
                <CheckCircle className="text-emerald-400" size={20} />
              ) : (
                <AlertCircle className="text-red-400" size={20} />
              )}
              <div>
                <p className={`font-bold ${colors.text.primary}`}>{record.subject}</p>
                <p className={`text-xs ${colors.text.muted}`}>{new Date(record.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.present ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
              {record.present ? 'Present' : 'Absent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ RENDER PERFORMANCE ============
  const renderPerformance = () => (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`inline-flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl lg:text-4xl font-black ${colors.text.primary}`}>Academic Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            label: 'Current GPA',
            value: academicMetrics.currentSemesterGPA,
            valueClass: 'text-indigo-400',
            trackClass: isDark ? 'bg-indigo-500/15' : 'bg-indigo-100',
            fillClass: 'from-indigo-500 to-violet-500',
            bg: isDark ? 'from-indigo-900/45 to-violet-900/35 border-indigo-500/25' : 'from-indigo-50 to-violet-50 border-indigo-200'
          },
          {
            label: 'Cumulative CGPA',
            value: academicMetrics.cgpa,
            valueClass: 'text-emerald-400',
            trackClass: isDark ? 'bg-emerald-500/15' : 'bg-emerald-100',
            fillClass: 'from-emerald-500 to-teal-500',
            bg: isDark ? 'from-emerald-900/40 to-teal-900/30 border-emerald-500/25' : 'from-emerald-50 to-teal-50 border-emerald-200'
          },
          {
            label: 'Pass Percentage',
            value: `${academicMetrics.passPercentage}%`,
            valueClass: 'text-orange-400',
            trackClass: isDark ? 'bg-orange-500/15' : 'bg-orange-100',
            fillClass: 'from-orange-500 to-rose-500',
            bg: isDark ? 'from-orange-900/40 to-rose-900/30 border-orange-500/25' : 'from-orange-50 to-rose-50 border-orange-200'
          },
          {
            label: 'Backlogs',
            value: academicMetrics.backlogs,
            valueClass: 'text-blue-400',
            trackClass: isDark ? 'bg-blue-500/15' : 'bg-blue-100',
            fillClass: 'from-blue-500 to-cyan-500',
            bg: isDark ? 'from-blue-900/40 to-cyan-900/30 border-blue-500/25' : 'from-blue-50 to-cyan-50 border-blue-200'
          }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.bg} border rounded-2xl p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl`}>
            <p className={`text-[11px] ${colors.text.muted} font-bold uppercase tracking-wider mb-2`}>{stat.label}</p>
            <p className={`text-4xl font-black ${stat.valueClass} mb-3`}>{stat.value}</p>
            <div className={`w-full h-2 ${stat.trackClass} rounded-full overflow-hidden`}>
              <div className={`h-full bg-gradient-to-r ${stat.fillClass} rounded-full`} style={{ width: `${typeof stat.value === 'string' ? parseInt(stat.value, 10) : (Number(stat.value) / 10) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h3 className={`text-2xl font-black ${colors.text.primary}`}>GPA Trend</h3>
      <div className="grid gap-4">
        {gpaHistory.map((record, idx) => (
          <div key={idx} className={`${colors.bg.card} ${colors.border} border p-5 sm:p-6 rounded-2xl transition-all hover:shadow-lg`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h4 className={`font-bold text-xl ${colors.text.primary}`}>{record.semester}</h4>
              <div className="flex gap-6 sm:gap-8">
                <div>
                  <p className={`text-[10px] ${colors.text.muted} font-bold uppercase tracking-wider`}>Semester GPA</p>
                  <p className="text-2xl font-black text-indigo-400">{record.gpa}</p>
                </div>
                <div>
                  <p className={`text-[10px] ${colors.text.muted} font-bold uppercase tracking-wider`}>CGPA</p>
                  <p className="text-2xl font-black text-emerald-400">{record.cgpa}</p>
                </div>
              </div>
            </div>
            <div className={`h-2.5 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(record.gpa / 10) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ RENDER BROWSE JOBS ============
  const renderBrowseJobs = () => {
    const appliedJobIds = myApplications.map(app => app.job?._id || app.jobId);
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
              <ArrowLeft size={20} /> Back
            </button>
            <h2 className={`text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent`}>Available Jobs</h2>
          </div>
          <div className="flex gap-2">
            <button className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-300'} rounded-xl`}><Search size={20} /></button>
            <button className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-300'} rounded-xl`}><Filter size={20} /></button>
          </div>
        </div>

        {jobsLoading ? (
          <div className={`${colors.bg.card} rounded-2xl p-12 ${colors.border} border text-center`}>
            <p className={`${colors.text.secondary} font-bold`}>Loading available jobs...</p>
          </div>
        ) : availableJobs.length === 0 ? (
          <div className={`${colors.bg.card} rounded-2xl p-12 ${colors.border} border text-center flex flex-col items-center justify-center`}>
            <Briefcase size={48} className="text-gray-400 mb-4" />
            <p className={`${colors.text.secondary} font-bold mb-2`}>No jobs available right now.</p>
            <p className={`${colors.text.muted}`}>Check back later or contact your placement cell for updates.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {availableJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job._id);
              return (
                <div key={job._id} className={`${colors.bg.card} rounded-2xl p-6 ${colors.border} border hover:shadow-lg transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{job.position || job.title}</h3>
                      <p className={`${colors.text.secondary} text-lg font-bold`}>{job.company || 'Company'}</p>
                      <div className="flex gap-4 mt-2 text-sm font-semibold text-gray-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={16} /> {job.location || 'Location TBD'}</span>
                        <span className="flex items-center gap-1"><DollarSign size={16} /> {formatJobSalary(job.salary) || 'Salary TBD'}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> Posted: {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-black border-2 inline-block ${
                      isApplied 
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500/50' 
                        : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500/50'
                    }`}>
                      {isApplied ? '✓ Applied' : 'Open'}
                    </span>
                  </div>
                  
                  <div className={`border-t-2 ${isDark ? 'border-white/10' : 'border-gray-200'} py-4 my-4`}>
                    <p className={`${colors.text.secondary} text-sm font-semibold mb-2`}>Job Description:</p>
                    <p className={`${colors.text.primary} text-sm line-clamp-2`}>{job.description || 'No description provided'}</p>
                  </div>
                  
                  {(job.requiredSkills || job.skills) && (
                    <div className="mb-4">
                      <p className={`${colors.text.secondary} text-sm font-semibold mb-2`}>Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          Array.isArray(job.requiredSkills)
                            ? job.requiredSkills
                            : typeof job.requiredSkills === 'string'
                              ? job.requiredSkills.split(',')
                              : Array.isArray(job.skills)
                                ? job.skills
                                : typeof job.skills === 'string'
                                  ? job.skills.split(',')
                                  : []
                        ).map((skill, idx) => (
                          <span key={idx} className={`px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-semibold border-2 border-blue-300 dark:border-blue-500/50`}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => handleApplyForJob(job._id)}
                      disabled={isApplied || applyingJobId === job._id}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold uppercase text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isApplied 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      }`}
                    >
                      {applyingJobId === job._id ? 'Applying...' : isApplied ? 'Already Applied' : 'Apply Now'}
                    </button>
                    <button className={`p-3 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all border ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============ RENDER COMPANIES ============
  const renderCompanies = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl font-black ${colors.text.primary}`}>Recruiting Companies</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, idx) => (
          <div key={idx} className={`${colors.bg.card} rounded-2xl p-6 ${isDark ? 'hover:border-indigo-500/30' : 'hover:border-indigo-400'} transition-all group cursor-pointer ${colors.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-4xl mb-2">{company.logo}</div>
                <h3 className={`text-xl font-bold ${isDark ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'}`}>{company.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className={`text-sm font-bold ${colors.text.primary}`}>{company.rating}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className={colors.text.muted}>Avg Package</span>
                <span className={`font-bold text-emerald-400`}>{company.avgPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className={colors.text.muted}>Openings</span>
                <span className={`font-bold ${colors.text.primary}`}>{company.openings}</span>
              </div>
              <div className="flex justify-between">
                <span className={colors.text.muted}>Reviews</span>
                <span className={`font-bold text-blue-400`}>{company.reviews}</span>
              </div>
            </div>
            <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-300'} pt-4`}>
              <p className={`text-[10px] ${colors.text.muted} font-bold mb-2`}>HR Recruiter</p>
              <div>
                <p className={`text-sm font-bold ${colors.text.primary}`}>{company.recruiter}</p>
                <a href={`mailto:${company.contact}`} className={`text-xs ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>{company.contact}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlacements = () => {
    const statusBadge = (status) => {
      const statusMap = {
        applied: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700",
        shortlisted: isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700",
        interviewing: isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700",
        offered: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700",
        accepted: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700",
        rejected: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700",
        withdrawn: isDark ? "bg-slate-500/20 text-slate-400" : "bg-slate-200 text-slate-700"
      };
      return statusMap[status] || (isDark ? "bg-slate-500/20 text-slate-400" : "bg-slate-200 text-slate-700");
    };

    const totalPlacements = placements.length;
    const offers = placements.filter((p) => p.status === "offered").length;
    const accepted = placements.filter((p) => p.status === "accepted").length;
    const interviewing = placements.filter((p) => p.status === "interviewing").length;
    const rejected = placements.filter((p) => p.status === "rejected").length;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
              <ArrowLeft size={20} /> Back
            </button>
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>Placement Results</h2>
          </div>
          {canManagePlacements && (
            <button
              onClick={() => setShowPlacementModal(true)}
              className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 flex items-center gap-2 text-white"
            >
              <Plus size={16} /> Add Result
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: totalPlacements, color: "text-blue-400" },
            { label: "Offers", value: offers, color: "text-emerald-400" },
            { label: "Accepted", value: accepted, color: "text-green-400" },
            { label: "Interviewing", value: interviewing, color: "text-amber-400" },
            { label: "Rejected", value: rejected, color: "text-red-400" }
          ].map((stat, idx) => (
            <div key={idx} className={`${colors.bg.card} rounded-2xl p-4 ${colors.border} border`}> 
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className={`${colors.text.secondary} text-xs font-bold uppercase`}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`${colors.bg.card} rounded-2xl p-6 ${colors.border} border`}> 
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-black ${colors.text.primary}`}>Eligibility Snapshot</h3>
            <span className={`${colors.text.muted} text-xs font-bold uppercase`}>Auto from profile</span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
              <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>CGPA</p>
              <p className={`text-xl font-black ${colors.text.primary}`}>{studentDetails.cgpa}</p>
            </div>
            <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
              <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Branch</p>
              <p className={`text-xl font-black ${colors.text.primary}`}>{studentDetails.branch}</p>
            </div>
            <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
              <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Backlogs</p>
              <p className={`text-xl font-black ${colors.text.primary}`}>0</p>
            </div>
            <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
              <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Batch</p>
              <p className={`text-xl font-black ${colors.text.primary}`}>2026</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "applied", "shortlisted", "interviewing", "offered", "accepted", "rejected", "withdrawn"].map((status) => (
            <button
              key={status}
              onClick={() => setPlacementFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                placementFilter === status
                  ? "bg-indigo-600 text-white"
                  : isDark
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {placementsLoading ? (
          <div className={`${colors.bg.card} rounded-2xl p-8 ${colors.border} border text-center`}>
            <p className={`${colors.text.secondary} font-bold`}>Loading placement results...</p>
          </div>
        ) : filteredPlacements.length === 0 ? (
          <div className={`${colors.bg.card} rounded-2xl p-8 ${colors.border} border text-center`}>
            <p className={`${colors.text.secondary} font-bold`}>No placement results found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPlacements.map((placement) => (
              <div key={placement._id} className={`${colors.bg.card} rounded-2xl p-6 ${colors.border} border`}> 
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-black ${colors.text.primary}`}>{placement.companyName}</h3>
                    <p className={`${colors.text.secondary} text-sm`}>{placement.roleTitle} {placement.location ? `- ${placement.location}` : ""}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge(placement.status)}`}>
                    {placement.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>CTC</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.ctc || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Offer Type</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.offerType || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Joining Date</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.joiningDate ? new Date(placement.joiningDate).toLocaleDateString() : "TBD"}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Result Date</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.resultDate ? new Date(placement.resultDate).toLocaleDateString() : "TBD"}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Recruiter</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.recruiterName || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Email</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.recruiterEmail || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Phone</p>
                    <p className={`font-bold ${colors.text.primary}`}>{placement.recruiterPhone || "N/A"}</p>
                  </div>
                </div>

                {placement.notes && (
                  <div className="mt-4">
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Notes</p>
                    <p className={`${colors.text.secondary} text-sm`}>{placement.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showPlacementModal && (
          <div className={`fixed inset-0 ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
            <div className={`${colors.bg.card} rounded-2xl border ${colors.border} w-full max-w-3xl max-h-[80vh] overflow-y-auto`}>
              <div className={`${colors.bg.tertiary} px-6 py-4 ${colors.border} border-b flex items-center justify-between`}>
                <h3 className={`text-xl font-black ${colors.text.primary}`}>Add Placement Result</h3>
                <button onClick={() => setShowPlacementModal(false)} className={`p-2 ${colors.bg.hover} rounded-lg`}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Student User ID</label>
                  <input
                    value={placementForm.studentUserId}
                    onChange={(e) => handlePlacementChange("studentUserId", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Company</label>
                  <input
                    value={placementForm.companyName}
                    onChange={(e) => handlePlacementChange("companyName", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Role</label>
                  <input
                    value={placementForm.roleTitle}
                    onChange={(e) => handlePlacementChange("roleTitle", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Location</label>
                  <input
                    value={placementForm.location}
                    onChange={(e) => handlePlacementChange("location", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>CTC</label>
                  <input
                    value={placementForm.ctc}
                    onChange={(e) => handlePlacementChange("ctc", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Bond</label>
                  <input
                    value={placementForm.bond}
                    onChange={(e) => handlePlacementChange("bond", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Offer Type</label>
                  <select
                    value={placementForm.offerType}
                    onChange={(e) => handlePlacementChange("offerType", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="internship">Internship</option>
                    <option value="ppo">PPO</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Status</label>
                  <select
                    value={placementForm.status}
                    onChange={(e) => handlePlacementChange("status", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Result Date</label>
                  <input
                    type="date"
                    value={placementForm.resultDate}
                    onChange={(e) => handlePlacementChange("resultDate", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Joining Date</label>
                  <input
                    type="date"
                    value={placementForm.joiningDate}
                    onChange={(e) => handlePlacementChange("joiningDate", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Recruiter Name</label>
                  <input
                    value={placementForm.recruiterName}
                    onChange={(e) => handlePlacementChange("recruiterName", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Recruiter Email</label>
                  <input
                    value={placementForm.recruiterEmail}
                    onChange={(e) => handlePlacementChange("recruiterEmail", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Recruiter Phone</label>
                  <input
                    value={placementForm.recruiterPhone}
                    onChange={(e) => handlePlacementChange("recruiterPhone", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Eligibility Min CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={placementForm.eligibility.minCgpa}
                    onChange={(e) => handlePlacementEligibilityChange("minCgpa", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Eligibility Branches</label>
                  <input
                    value={placementForm.eligibility.branches}
                    onChange={(e) => handlePlacementEligibilityChange("branches", e.target.value)}
                    placeholder="CSE,ECE"
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Notes</label>
                  <textarea
                    rows="3"
                    value={placementForm.notes}
                    onChange={(e) => handlePlacementChange("notes", e.target.value)}
                    className={`w-full mt-2 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button onClick={() => setShowPlacementModal(false)} className={`px-4 py-2 rounded-lg ${colors.bg.hover} ${colors.text.primary}`}>Cancel</button>
                <button onClick={handleCreatePlacement} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-500">Save Result</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInterviewExam = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2 className={`text-3xl font-black ${colors.text.primary}`}>Interview Exam</h2>
        </div>
      </div>

      {examsLoading ? (
        <div className={`${colors.bg.card} rounded-2xl p-8 ${colors.border} border text-center`}>
          <p className={`${colors.text.secondary} font-bold`}>Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className={`${colors.bg.card} rounded-2xl p-8 ${colors.border} border text-center`}>
          <p className={`${colors.text.secondary} font-bold`}>No exams available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {exams.map((exam) => {
            const submission = getSubmissionForExam(exam._id);
            return (
              <div key={exam._id} className={`${colors.bg.card} rounded-2xl p-6 ${colors.border} border`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-black ${colors.text.primary}`}>{exam.title}</h3>
                    <p className={`${colors.text.secondary} text-sm`}>{exam.description || 'HR interview assessment'}</p>
                  </div>
                  {submission ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      submission.result === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : submission.result === 'fail'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {submission.result || 'pending'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400">
                      Not started
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Duration</p>
                    <p className={`font-bold ${colors.text.primary}`}>{exam.durationMinutes} mins</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Questions</p>
                    <p className={`font-bold ${colors.text.primary}`}>{exam.questions?.length || 0}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold`}>Status</p>
                    <p className={`font-bold ${colors.text.primary}`}>{exam.status}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {submission ? (
                    <button className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${isDark ? 'bg-white/5' : 'bg-gray-100'} ${colors.text.primary}`}>
                      Submitted
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenExam(exam)}
                      className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 text-white"
                    >
                      Start Exam
                    </button>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm">
                    {Number.isFinite(Number(submission?.score)) && (
                      <p className={`${colors.text.secondary}`}>Score: <span className="font-bold text-emerald-400">{submission.score}</span></p>
                    )}
                    {submission?.reviewedAt && (
                      <p className={`${colors.text.secondary}`}>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}</p>
                    )}
                    {submission?.feedback && (
                      <p className={`${colors.text.secondary}`}>Feedback: {submission.feedback}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeExam && (
        <div className={`fixed inset-0 ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${colors.bg.card} rounded-2xl border ${colors.border} w-full max-w-3xl max-h-[80vh] overflow-y-auto`}>
            <div className={`${colors.bg.tertiary} px-6 py-4 ${colors.border} border-b flex items-center justify-between`}>
              <div>
                <h3 className={`text-xl font-black ${colors.text.primary}`}>{activeExam.title}</h3>
                <p className={`${colors.text.secondary} text-sm`}>{activeExam.description || 'Answer the questions below'}</p>
              </div>
              <button onClick={() => setActiveExam(null)} className={`p-2 ${colors.bg.hover} rounded-lg`}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(activeExam.questions || []).map((question, index) => (
                <div key={index} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} p-4 rounded-xl`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={`font-bold ${colors.text.primary}`}>Q{index + 1}. {question.question}</p>
                      <p className={`${colors.text.secondary} mt-1 text-xs uppercase tracking-[0.2em]`}>
                        {question.type || (Array.isArray(question.options) && question.options.length ? 'mcq' : 'short-answer')}
                      </p>
                    </div>
                    {Array.isArray(question.allowedProgrammingLanguages) && question.allowedProgrammingLanguages.length > 0 && (
                      <select
                        value={examAnswers[index]?.language || question.allowedProgrammingLanguages[0]}
                        onChange={(e) => updateExamAnswer(index, { language: e.target.value })}
                        className={`rounded-lg border px-3 py-2 text-sm ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      >
                        {question.allowedProgrammingLanguages.map((language) => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {Array.isArray(question.options) && question.options.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${colors.border} ${isDark ? 'bg-black/10' : 'bg-white'}`}>
                          <input
                            type="radio"
                            name={`question-${index}`}
                            checked={String(examAnswers[index]?.selectedOption ?? examAnswers[index]) === String(optionIndex)}
                            onChange={() => updateExamAnswer(index, { selectedOption: optionIndex, answer: option })}
                            className="h-4 w-4"
                          />
                          <span className={`${colors.text.primary} text-sm`}>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows="4"
                      value={typeof examAnswers[index] === 'object' ? (examAnswers[index]?.answer || '') : (examAnswers[index] || '')}
                      onChange={(e) => updateExamAnswer(index, { answer: e.target.value })}
                      className={`w-full mt-3 px-4 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      placeholder={question.type === 'coding' ? 'Write your code or solution here...' : 'Type your answer...'}
                    />
                  )}

                  {question.type === 'coding' && (
                    <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-3 text-xs text-indigo-200">
                      {Array.isArray(question.allowedProgrammingLanguages) && question.allowedProgrammingLanguages.length > 0
                        ? `Supported languages: ${question.allowedProgrammingLanguages.join(', ')}`
                        : 'Coding question'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setActiveExam(null)} className={`px-4 py-2 rounded-lg ${colors.bg.hover} ${colors.text.primary}`}>Cancel</button>
              <button onClick={handleSubmitExam} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-500">Submit Exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

// ============ RENDER RESUME ============
  function renderResume() {
    const activeResumeAnalysis = resumeDraftAnalysis || resumeAnalysis;

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* --- RESUME SECTION --- */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
                <ArrowLeft size={20} /> Back
              </button>
              <h2 className={`text-3xl font-black ${colors.text.primary}`}>Resume Builder</h2>
            </div>
            <label className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 flex items-center gap-2 text-white cursor-pointer">
              <Upload size={16} /> {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          </div>

          {/* Current Resume */}
          {studentData?.resume || resumeFile ? (
            <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} hover:border-indigo-500/50 transition-all`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FileText className="w-10 h-10 text-indigo-400" />
                  <div>
                    <h3 className={`text-xl font-black ${colors.text.primary}`}>
                      {resumeFile?.name || 'My Resume'}
                    </h3>
                    <p className={`${colors.text.secondary} text-xs font-medium`}>
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {resumeVisible ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1">
                      <Eye size={12} /> VISIBLE
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-black tracking-widest">
                      HIDDEN
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className={`${colors.text.muted} font-bold uppercase text-[10px] tracking-tight`}>File Type</p>
                  <p className={`text-lg font-black ${colors.text.primary}`}>
                    {resumeFile ? resumeFile.name.split('.').pop().toUpperCase() : 'PDF'}
                  </p>
                </div>
                <div>
                  <p className={`${colors.text.muted} font-bold uppercase text-[10px] tracking-tight`}>Size</p>
                  <p className={`text-lg font-black ${colors.text.primary}`}>
                    {resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB` : '245 KB'}
                  </p>
                </div>
                <div>
                  <p className={`${colors.text.muted} font-bold uppercase text-[10px] tracking-tight`}>Status</p>
                  <p className="text-lg font-black text-indigo-400">
                    {resumeVisible ? 'Active' : 'Hidden'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadResume}
                  className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-500 flex items-center justify-center gap-2 text-white transition-colors"
                >
                  <Download size={16} /> Download
                </button>
                <button 
                  onClick={toggleResumeVisibility}
                  className={`flex-1 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors ${colors.text.primary}`}
                >
                  <Eye size={16} /> {resumeVisible ? 'Hide from Recruiters' : 'Show to Recruiters'}
                </button>
                <label className={`flex-1 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${colors.text.primary}`}>
                  <Edit3 size={16} /> Replace
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className={`${colors.bg.card} rounded-2xl p-12 border ${colors.border} border-dashed text-center`}>
              <Upload className={`w-16 h-16 ${colors.text.muted} mx-auto mb-4`} />
              <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>No Resume Uploaded</h3>
              <p className={`${colors.text.secondary} text-sm mb-6`}>Upload your resume to apply for jobs</p>
              <label className="inline-block px-6 py-3 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 text-white cursor-pointer">
                Upload Resume
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          )}

        {/* Resume ATS Analysis Section */}
        {analyzingResume && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border border-white/10 text-center animate-pulse">
            <p className="text-lg font-bold text-blue-300">Analyzing your resume for ATS score...</p>
          </div>
        )}
        {activeResumeAnalysis && (
          <section className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-400" /> ATS Score
                </h4>
                <div className="text-4xl font-black text-blue-400">{activeResumeAnalysis.atsScore}%</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${activeResumeAnalysis.atsScore}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Placement Probability</span>
                <span className="text-emerald-400 font-bold">{activeResumeAnalysis.placementProbability}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-400" /> Key Strengths
              </h4>
              <div className="space-y-2">
                {activeResumeAnalysis.strengths?.map((strength, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" /> Areas for Improvement
              </h4>
              <div className="space-y-2">
                {activeResumeAnalysis.improvements?.map((improvement, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-400" /> Recommended Skills to Add
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeResumeAnalysis.recommendedSkills?.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 border border-white/5">
              <h4 className="text-lg font-bold text-white mb-3">Assessment</h4>
              <p className="text-slate-300 leading-relaxed">{activeResumeAnalysis.assessment}</p>
            </div>
          </section>
        )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-t pt-10 border-white/5">
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>Resume Templates</h2>
            <span className={`${colors.text.secondary} text-xs font-bold uppercase`}>Pick a layout and start editing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeTemplates.map((template) => (
              <div
                key={template.id}
                className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} hover:border-indigo-500/40 transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-black ${colors.text.primary}`}>{template.name}</h3>
                    <p className={`${colors.text.muted} text-[10px] uppercase font-bold mt-1`}>{template.category}</p>
                  </div>
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs mb-5">
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Downloads</p>
                    <p className={`font-black ${colors.text.primary}`}>{template.downloads}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Used</p>
                    <p className={`font-black ${colors.text.primary}`}>{template.used}</p>
                  </div>
                  <div>
                    <p className={`${colors.text.muted} font-bold uppercase`}>Rating</p>
                    <p className="font-black text-amber-400">{template.rating}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelectResumeTemplate(template)}
                    className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-500 text-white"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => handleSelectResumeTemplate(template)}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedResumeTemplate && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-t pt-10 border-white/5">
              <div>
                <h2 className={`text-3xl font-black ${colors.text.primary}`}>Resume Editor</h2>
                <p className={`${colors.text.secondary} text-xs font-bold uppercase mt-1`}>Template: {selectedResumeTemplate.name}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAutoCorrectResumeDraft}
                  disabled={autoCorrectingResumeDraft}
                  className="px-4 py-2 bg-violet-600 rounded-lg font-bold text-xs uppercase hover:bg-violet-500 text-white disabled:opacity-60"
                >
                  {autoCorrectingResumeDraft ? 'Auto Correcting...' : 'Auto Correct & Format'}
                </button>
                <button
                  onClick={handleSaveResumeDraft}
                  disabled={analyzingResumeDraft}
                  className="px-4 py-2 bg-blue-600 rounded-lg font-bold text-xs uppercase hover:bg-blue-500 text-white disabled:opacity-60"
                >
                  {analyzingResumeDraft ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleExportResumeDraft}
                  className="px-4 py-2 bg-emerald-600 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500 text-white"
                >
                  Export Draft
                </button>
                <button
                  onClick={handleExportResumePdf}
                  className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-500 text-white"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => setSelectedResumeTemplate(null)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} space-y-6`}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Writing Suggestions</p>
                    {resumeDraftSuggestions.length ? (
                      <ul className="space-y-2 text-sm text-slate-200">
                        {resumeDraftSuggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Sparkles size={14} className="mt-1 text-indigo-300 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-300">Your resume draft looks structurally strong. Add more impact metrics if needed.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Live ATS Score</p>
                    {analyzingResumeDraft ? (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-300">Analyzing your saved draft...</p>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                        </div>
                      </div>
                    ) : activeResumeAnalysis?.atsScore ? (
                      <div className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-4xl font-black text-blue-400">{activeResumeAnalysis.atsScore}%</p>
                            <p className="text-xs text-slate-300 uppercase font-bold tracking-widest">
                              Placement Probability {activeResumeAnalysis.placementProbability ? `• ${activeResumeAnalysis.placementProbability}%` : ''}
                            </p>
                          </div>
                          <Target className="h-8 w-8 text-blue-300" />
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700" style={{ width: `${activeResumeAnalysis.atsScore}%` }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300">Save the draft to generate a live ATS score from the current resume text.</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Full Name</label>
                    <input
                      value={resumeDraft.fullName}
                      onChange={(e) => handleResumeDraftChange('fullName', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                    />
                  </div>
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Title</label>
                    <input
                      value={resumeDraft.title}
                      onChange={(e) => handleResumeDraftChange('title', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Summary</label>
                  <textarea
                    rows="4"
                    value={resumeDraft.summary}
                    onChange={(e) => handleResumeDraftChange('summary', e.target.value)}
                    spellCheck
                    lang="en"
                    className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                    placeholder="Write a short professional summary..."
                  />
                </div>

                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Resume Photo</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 border border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center">
                      {resumeDraft.photo ? (
                        <img src={resumeDraft.photo} alt="Resume photo preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-[10px] font-bold ${colors.text.muted}`}>No Photo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase cursor-pointer hover:bg-indigo-500">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleResumePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {resumeDraft.photo && (
                        <button
                          type="button"
                          onClick={removeResumePhoto}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text.primary}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Skills (comma separated)</label>
                  <input
                    value={resumeDraft.skills.join(', ')}
                    onChange={(e) => handleResumeSkillsChange(e.target.value)}
                    className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Experience</label>
                    <button
                      onClick={() => addResumeDraftListItem('experience')}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase text-white"
                    >
                      Add
                    </button>
                  </div>
                  {resumeDraft.experience.map((exp, idx) => (
                    <div key={idx} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4 space-y-3`}>
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => handleResumeDraftListChange('experience', idx, 'role', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                        <input
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => handleResumeDraftListChange('experience', idx, 'company', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                      </div>
                      <input
                        placeholder="Period (e.g. Jun 2024 - Jan 2026)"
                        value={exp.period}
                        onChange={(e) => handleResumeDraftListChange('experience', idx, 'period', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <textarea
                        rows="3"
                        placeholder="Key achievements"
                        value={exp.details}
                        onChange={(e) => handleResumeDraftListChange('experience', idx, 'details', e.target.value)}
                        spellCheck
                        lang="en"
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      {resumeDraft.experience.length > 1 && (
                        <button
                          onClick={() => removeResumeDraftListItem('experience', idx)}
                          className="text-xs font-bold text-red-400 uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Projects</label>
                    <button
                      onClick={() => addResumeDraftListItem('projects')}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase text-white"
                    >
                      Add
                    </button>
                  </div>
                  {resumeDraft.projects.map((proj, idx) => (
                    <div key={idx} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4 space-y-3`}>
                      <input
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => handleResumeDraftListChange('projects', idx, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <input
                        placeholder="Project Link (optional)"
                        value={proj.link}
                        onChange={(e) => handleResumeDraftListChange('projects', idx, 'link', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <textarea
                        rows="3"
                        placeholder="Project impact or highlights"
                        value={proj.details}
                        onChange={(e) => handleResumeDraftListChange('projects', idx, 'details', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      {resumeDraft.projects.length > 1 && (
                        <button
                          onClick={() => removeResumeDraftListItem('projects', idx)}
                          className="text-xs font-bold text-red-400 uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Education</label>
                    <button
                      onClick={() => addResumeDraftListItem('education')}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase text-white"
                    >
                      Add
                    </button>
                  </div>
                  {resumeDraft.education.map((edu, idx) => (
                    <div key={idx} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4 space-y-3`}>
                      <input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => handleResumeDraftListChange('education', idx, 'degree', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          placeholder="School"
                          value={edu.school}
                          onChange={(e) => handleResumeDraftListChange('education', idx, 'school', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                        <input
                          placeholder="Year"
                          value={edu.year}
                          onChange={(e) => handleResumeDraftListChange('education', idx, 'year', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                      </div>
                      {resumeDraft.education.length > 1 && (
                        <button
                          onClick={() => removeResumeDraftListItem('education', idx)}
                          className="text-xs font-bold text-red-400 uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Certifications</label>
                    <button
                      onClick={() => addResumeDraftListItem('certifications')}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase text-white"
                    >
                      Add
                    </button>
                  </div>
                  {resumeDraft.certifications.map((cert, idx) => (
                    <div key={idx} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4 space-y-3`}>
                      <input
                        placeholder="Certification Name"
                        value={cert.name}
                        onChange={(e) => handleResumeDraftListChange('certifications', idx, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          placeholder="Issuer"
                          value={cert.issuer}
                          onChange={(e) => handleResumeDraftListChange('certifications', idx, 'issuer', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                        <input
                          placeholder="Year"
                          value={cert.year}
                          onChange={(e) => handleResumeDraftListChange('certifications', idx, 'year', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                      </div>
                      <input
                        placeholder="Credential ID (optional)"
                        value={cert.credentialId}
                        onChange={(e) => handleResumeDraftListChange('certifications', idx, 'credentialId', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      {resumeDraft.certifications.length > 1 && (
                        <button
                          onClick={() => removeResumeDraftListItem('certifications', idx)}
                          className="text-xs font-bold text-red-400 uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Awards</label>
                    <button
                      onClick={() => addResumeDraftListItem('awards')}
                      className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase text-white"
                    >
                      Add
                    </button>
                  </div>
                  {resumeDraft.awards.map((award, idx) => (
                    <div key={idx} className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4 space-y-3`}>
                      <input
                        placeholder="Award Title"
                        value={award.title}
                        onChange={(e) => handleResumeDraftListChange('awards', idx, 'title', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          placeholder="Issuer"
                          value={award.issuer}
                          onChange={(e) => handleResumeDraftListChange('awards', idx, 'issuer', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                        <input
                          placeholder="Year"
                          value={award.year}
                          onChange={(e) => handleResumeDraftListChange('awards', idx, 'year', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                        />
                      </div>
                      <textarea
                        rows="2"
                        placeholder="Description (optional)"
                        value={award.details}
                        onChange={(e) => handleResumeDraftListChange('awards', idx, 'details', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      />
                      {resumeDraft.awards.length > 1 && (
                        <button
                          onClick={() => removeResumeDraftListItem('awards', idx)}
                          className="text-xs font-bold text-red-400 uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Email</label>
                    <input
                      value={resumeDraft.links.email}
                      onChange={(e) => handleResumeLinksChange('email', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                    />
                  </div>
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Phone</label>
                    <input
                      value={resumeDraft.links.phone}
                      onChange={(e) => handleResumeLinksChange('phone', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                    />
                  </div>
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>GitHub</label>
                    <input
                      value={resumeDraft.links.github}
                      onChange={(e) => handleResumeLinksChange('github', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      placeholder="github.com/username"
                    />
                  </div>
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>LinkedIn</label>
                    <input
                      value={resumeDraft.links.linkedin}
                      onChange={(e) => handleResumeLinksChange('linkedin', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className={`${colors.text.muted} text-xs font-bold uppercase`}>Website</label>
                    <input
                      value={resumeDraft.links.website}
                      onChange={(e) => handleResumeLinksChange('website', e.target.value)}
                      className={`w-full mt-2 px-4 py-3 rounded-xl ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
                      placeholder="portfolio.example.com"
                    />
                  </div>
                </div>
              </div>

              <div className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border}`}>
                <h3 className={`text-xl font-black ${colors.text.primary} mb-4`}>Preview</h3>
                {selectedResumeTemplate?.id === 2 ? (
                <div className="rounded-xl overflow-hidden border border-gray-300 bg-white text-black shadow-xl">
                  <div className="grid grid-cols-[280px_1fr] min-h-[980px]">
                    <aside className="bg-[#6e9ca0] text-white flex flex-col">
                      <div className="bg-[#8fb8bb] h-[280px] flex items-end justify-center p-5 overflow-hidden">
                        {resumeDraft.photo ? (
                          <img
                            src={resumeDraft.photo}
                            alt={resumeDraft.fullName || 'Resume photo'}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/10">
                            <span className="text-5xl font-black tracking-wider">
                              {String(resumeDraft.fullName || studentDetails.name || 'AA')
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0]?.toUpperCase() || '')
                                .join('') || 'AA'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-6 space-y-5 text-[13px] leading-relaxed">
                        <div className="space-y-4">
                          <p className="flex items-start gap-3 break-all">
                            <span className="text-[#ffbe6f] font-black">✉</span>
                            <span>{resumeDraft.links.email || studentDetails.email || 'ananya.verma@email.com'}</span>
                          </p>
                          <p className="flex items-start gap-3">
                            <span className="text-[#ffbe6f] font-black">◉</span>
                            <span>{resumeDraft.links.phone || studentDetails.phone || '+91-0000000000'}</span>
                          </p>
                          <p className="flex items-start gap-3 break-all">
                            <span className="text-[#ffbe6f] font-black">in</span>
                            <span>{resumeDraft.links.linkedin || 'linkedin.com/in/username'}</span>
                          </p>
                          <p className="flex items-start gap-3 break-all">
                            <span className="text-[#ffbe6f] font-black">⌂</span>
                            <span>{resumeDraft.links.github || 'github.com/username'}</span>
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[21px] font-black uppercase tracking-wide mb-3">Skills</h4>
                          <ul className="list-disc pl-5 space-y-2 text-[12.5px]">
                            {(resumeDraft.skills.length ? resumeDraft.skills : ['Programming Languages: Python, Java, C#', 'Tools & Frameworks: TensorFlow, Unity, Git, SQL', 'Soft Skills: Analytical Thinking, Problem Solving, Collaboration']).map((skill, idx) => (
                              <li key={idx}>{skill}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[21px] font-black uppercase tracking-wide mb-3">Certifications</h4>
                          <ul className="list-disc pl-5 space-y-2 text-[12.5px]">
                            {((resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean).length
                              ? (resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean)
                              : ['HCL GUVI Machine Learning Certificate', 'Udemy Advanced Python Programming', 'Coursera Full Stack Web Development']
                            ).map((certName, idx) => (
                              <li key={idx}>{certName}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[21px] font-black uppercase tracking-wide mb-3">Achievements</h4>
                          <ul className="list-disc pl-5 space-y-2 text-[12.5px]">
                            {(resumeDraft.awards.length
                              ? resumeDraft.awards.map((award) => award.title).filter(Boolean)
                              : ['Winner, National Hackathon 2023', 'Best Project Award, DEF University 2024']
                            ).map((awardName, idx) => (
                              <li key={idx}>{awardName}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </aside>

                    <main className="px-8 py-8">
                      <div className="bg-[#f7ad63] px-6 py-8 mb-10">
                        <p className="text-[46px] font-black leading-none">{resumeDraft.fullName || studentDetails.name || 'Ananya Verma'}</p>
                        <p className="text-[24px] mt-2 font-medium">{resumeDraft.title || 'Software Developer'}</p>
                      </div>

                      <section className="mb-8">
                        <h4 className="text-[21px] font-black uppercase mb-3">Career Objective</h4>
                        <p className="text-[15px] leading-7 max-w-[610px]">
                          {resumeDraft.summary || 'Enthusiastic fresher seeking a software development role to apply project experience in AI, web development, and data analysis, and contribute to innovative solutions.'}
                        </p>
                      </section>

                      <section className="mb-8">
                        <h4 className="text-[21px] font-black uppercase mb-4">Education</h4>
                        <div className="grid grid-cols-[180px_1fr] gap-y-4 gap-x-8 text-[15px]">
                          {(resumeDraft.education.length ? resumeDraft.education : [{ degree: 'B.Tech in Computer Science', school: 'DEF University', year: '2025' }]).map((edu, idx) => (
                            <React.Fragment key={idx}>
                              <div>
                                <p className="font-bold">{edu.school || 'DEF University'}</p>
                                <p className="font-bold">{edu.year || '2025'}</p>
                              </div>
                              <div>
                                <p>{edu.degree || 'B.Tech in Computer Science'}</p>
                                {idx === 0 && (
                                  <div className="grid grid-cols-[180px_1fr] gap-y-4 gap-x-8 mt-4 text-[15px]">
                                    <p className="font-bold">GPA:</p>
                                    <p>{studentDetails.cgpa ? `${studentDetails.cgpa}/10` : '8.7/10'}</p>
                                    <p className="font-bold">Relevant Coursework:</p>
                                    <p>Machine Learning, Database Management, Web Technologies</p>
                                  </div>
                                )}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </section>

                      <section className="mb-8">
                        <h4 className="text-[21px] font-black uppercase mb-4">Project Experience</h4>
                        <div className="grid grid-cols-[210px_1fr] gap-y-5 gap-x-8 text-[15px]">
                          {(resumeDraft.projects.length ? resumeDraft.projects : [
                            { name: 'AI Chatbot for Customer Support', details: 'Developed using Python & NLP\nReduced response time by 40% and improved customer satisfaction' },
                            { name: 'E-Commerce Recommendation Engine', details: 'Built using collaborative filtering in Python\nIncreased recommendation accuracy by 25%' },
                            { name: 'Mobile Game App', details: 'Designed & deployed using Unity and C#\nAchieved 500+ downloads on Google Play Store' }
                          ]).map((proj, idx) => (
                            <React.Fragment key={idx}>
                              <div className="font-semibold">{proj.name || 'Project Name'}</div>
                              <ul className="list-disc pl-5 space-y-1">
                                {splitBulletPoints(proj.details || '').length ? splitBulletPoints(proj.details).map((line, pointIdx) => <li key={pointIdx}>{line}</li>) : <li>Project details here</li>}
                              </ul>
                            </React.Fragment>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h4 className="text-[21px] font-black uppercase mb-4">Internship</h4>
                        <div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-8 text-[15px]">
                          <p className="font-semibold">3 months</p>
                          <div>
                            <p className="font-semibold">Software Development Intern at GHI Tech</p>
                            <p className="mt-2 text-[14px] leading-7">Developed backend APIs for client applications Assisted in testing and debugging modules</p>
                          </div>
                        </div>
                      </section>
                    </main>
                  </div>
                </div>
                ) : (
                <div className="rounded-xl bg-white text-black p-6 text-[13px] leading-relaxed border border-gray-300 font-serif space-y-4">
                  <div className="text-center">
                    <p className="text-[30px] font-bold tracking-wide uppercase">{resumeDraft.fullName || 'FIRST LAST'}</p>
                    <p className="text-[13px] mt-1">
                      {[
                        resumeDraft.links.website || 'City, State',
                        resumeDraft.links.email,
                        resumeDraft.links.phone,
                        resumeDraft.links.linkedin
                      ].filter(Boolean).join(' • ') || 'city@example.com • (000) 000-0000 • linkedin.com/in/username'}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase border-b border-gray-500 pb-1">Education</p>
                    {resumeDraft.education.map((edu, idx) => (
                      <div key={idx} className="mt-2">
                        <div className="flex justify-between gap-3">
                          <p className="font-bold">{edu.school || 'University Name'}</p>
                          <p>{edu.year || ''}</p>
                        </div>
                        <p>{edu.degree || 'Degree and Major'}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-bold uppercase border-b border-gray-500 pb-1">Professional Experience</p>
                    {resumeDraft.experience.map((exp, idx) => (
                      <div key={idx} className="mt-2">
                        <div className="flex justify-between gap-3">
                          <p className="font-bold">{exp.company || 'Company Name'}</p>
                          <p>{exp.period || ''}</p>
                        </div>
                        <p>{exp.role || 'Role Title'}</p>
                        {splitBulletPoints(exp.details).map((point, pointIdx) => (
                          <p key={pointIdx} className="pl-4">• {point}</p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-bold uppercase border-b border-gray-500 pb-1">Activities and Leadership</p>
                    {resumeDraft.awards.map((item, idx) => (
                      <div key={idx} className="mt-2">
                        <div className="flex justify-between gap-3">
                          <p className="font-bold">{item.title || 'Activity / Leadership'}</p>
                          <p>{item.year || ''}</p>
                        </div>
                        {item.issuer && <p>{item.issuer}</p>}
                        {splitBulletPoints(item.details).map((point, pointIdx) => (
                          <p key={pointIdx} className="pl-4">• {point}</p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-bold uppercase border-b border-gray-500 pb-1">University Projects</p>
                    {resumeDraft.projects.map((proj, idx) => (
                      <div key={idx} className="mt-2">
                        <div className="flex justify-between gap-3">
                          <p className="font-bold">{proj.name || 'Project Name'}</p>
                          <p>{proj.link || ''}</p>
                        </div>
                        {splitBulletPoints(proj.details).map((point, pointIdx) => (
                          <p key={pointIdx} className="pl-4">• {point}</p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-bold uppercase border-b border-gray-500 pb-1">Other</p>
                    <p className="pl-4">• <span className="font-bold">Technical:</span> {resumeDraft.skills.length ? resumeDraft.skills.join(', ') : 'Add technical skills'}</p>
                    <p className="pl-4">• <span className="font-bold">Certifications:</span> {(resumeDraft.certifications || []).map((cert) => cert.name).filter(Boolean).join(', ') || 'Add certifications'}</p>
                    <p className="pl-4">• <span className="font-bold">Summary:</span> {resumeDraft.summary || 'Add a short summary'}</p>
                  </div>
                </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* --- CERTIFICATIONS SECTION --- */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-t pt-10 border-white/5">
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>Certifications</h2>
            <button onClick={() => setCurrentView('certifications')} className="px-4 py-2 bg-emerald-600 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500 flex items-center gap-2 text-white transition-colors">
              <Plus size={16} /> Add Certificate
            </button>
          </div>

          <div className="grid gap-4">
            {/* Certificate cards will be mapped here */}
            {studentData?.certifications?.length > 0 ? (
              studentData.certifications.map((cert, idx) => (
                <div key={idx} className={`${colors.bg.card} rounded-2xl p-6 border ${colors.border} hover:border-emerald-500/50 transition-all`}>
                  <div className="flex items-center gap-4 mb-6">
                    <Award className="w-10 h-10 text-emerald-400" />
                    <div>
                      <h3 className={`text-xl font-black ${colors.text.primary}`}>{cert.name}</h3>
                      <p className={`${colors.text.secondary} text-xs font-medium`}>Issued by {cert.issuer}</p>
                      <p className={`${colors.text.muted} text-[10px] font-bold uppercase tracking-widest mt-1`}>
                        {String(cert.source || 'student').toUpperCase()} UPLOAD
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className={`${colors.text.muted} font-bold uppercase text-[10px] tracking-tight`}>Issue Date</p>
                      <p className={`text-lg font-black ${colors.text.primary}`}>{cert.date ? new Date(cert.date).toLocaleDateString() : (cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A')}</p>
                    </div>
                    <div>
                      <p className={`${colors.text.muted} font-bold uppercase text-[10px] tracking-tight`}>Credential ID</p>
                      <p className={`text-lg font-black text-emerald-400`}>{cert.credentialId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => cert.url && window.open(cert.url, '_blank')} className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500 flex items-center justify-center gap-2 text-white transition-colors">
                      <ExternalLink size={16} /> View Credential
                    </button>
                    <button onClick={() => setUserCertifications(userCertifications.filter((_, i) => i !== idx))} className={`w-14 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl font-bold flex items-center justify-center text-red-400 transition-colors`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`${colors.bg.card} rounded-2xl p-8 border ${colors.border} border-dashed text-center`}>
                <Award className={`w-12 h-12 ${colors.text.muted} mx-auto mb-3`} />
                <p className={`${colors.text.secondary} text-sm`}>No certifications added yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

// Helper function for AI suggestions
const getSuggestions = (view) => {
  const suggestions = {
    overview: ["How's my CGPA?", "Show interviews", "My attendance"],
    applications: ["Best packages?", "Interview tips", "Application status"],
    interviews: ["Upcoming interviews?", "Interview prep", "Success rate"],
    skills: ["Skill recommendations?", "Certifications", "Learning path"],
    profile: ["Update profile?", "Resume tips", "Complete profile"],
    default: ["Help me!", "Career guidance", "What's new?"]
  };
  return suggestions[view] || suggestions.default;
};

  // ============ RENDER ANALYTICS ============
  const renderAnalytics = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80`}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className={`text-3xl font-black ${colors.text.primary}`}>Candidate Analytics Dashboard</h2>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Active Applications', value: candidateAnalytics.activeApplications, color: 'indigo', bg: isDark ? 'from-blue-600/20 to-indigo-600/20 border-indigo-500/20' : 'from-blue-100 to-indigo-100 border-indigo-300' },
          { label: 'Interviews Scheduled', value: candidateAnalytics.interviewsScheduled, color: 'emerald', bg: isDark ? 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20' : 'from-emerald-100 to-teal-100 border-emerald-300' },
          { label: 'Offers Received', value: candidateAnalytics.offersReceived, color: 'orange', bg: isDark ? 'from-orange-600/20 to-red-600/20 border-orange-500/20' : 'from-orange-100 to-red-100 border-orange-300' },
          { label: 'Avg Assessment', value: candidateAnalytics.averageAssessmentScore, color: 'purple', bg: isDark ? 'from-purple-600/20 to-pink-600/20 border-purple-500/20' : 'from-purple-100 to-pink-100 border-purple-300' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.bg} border rounded-2xl p-6 text-center`}>
            <p className={`text-4xl font-black ${stat.color === 'indigo' ? 'text-indigo-400' : stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'orange' ? 'text-orange-400' : 'text-purple-400'} mb-2`}>{stat.value}</p>
            <p className={`text-[10px] ${colors.text.muted} font-bold uppercase`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-6`}>
          <TrendingUp className="w-8 h-8 text-pink-500 mb-3" />
          <p className={`text-3xl font-black ${colors.text.primary}`}>{candidateAnalytics.shortlistRate}%</p>
          <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Shortlist Rate</p>
        </div>
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-6`}>
          <Target className="w-8 h-8 text-indigo-500 mb-3" />
          <p className={`text-3xl font-black ${colors.text.primary}`}>{candidateAnalytics.profileCompletion}%</p>
          <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Profile Completion</p>
        </div>
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-6`}>
          <BookOpen className="w-8 h-8 text-cyan-500 mb-3" />
          <p className={`text-3xl font-black ${colors.text.primary}`}>{candidateAnalytics.examParticipationRate}%</p>
          <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Exam Participation</p>
        </div>
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-6`}>
          <Zap className="w-8 h-8 text-amber-500 mb-3" />
          <p className={`text-3xl font-black ${colors.text.primary}`}>{candidateAnalytics.recommendationStrength}%</p>
          <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Recommendation Strength</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <h3 className={`text-xl font-bold mb-6 ${colors.text.primary} flex items-center gap-2`}>
            <PieChart className="w-6 h-6 text-indigo-500" />
            Application Status Distribution
          </h3>
          <div className="space-y-4">
            {candidateAnalytics.applicationStatus.labels.map((label, index) => {
              const value = candidateAnalytics.applicationStatus.data[index] || 0;
              const total = candidateAnalytics.applicationStatus.data.reduce((sum, item) => sum + item, 0) || 1;
              const width = Math.round((value / total) * 100);
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-bold ${colors.text.primary}`}>{label}</span>
                    <span className={colors.text.secondary}>{value}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <h3 className={`text-xl font-bold mb-6 ${colors.text.primary} flex items-center gap-2`}>
            <BriefcaseIcon className="w-6 h-6 text-emerald-500" />
            Top Job Match Details
          </h3>
          <div className="space-y-4">
            {candidateAnalytics.topRecommendations.length ? candidateAnalytics.topRecommendations.map((job) => (
              <div key={job.id} className={`p-4 rounded-2xl border ${colors.border} ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${colors.text.primary}`}>{job.company}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{job.score}%</span>
                </div>
                <p className={`text-sm ${colors.text.secondary}`}>{job.role}</p>
                <p className={`text-[10px] ${colors.text.muted} mt-2`}>
                  Skill match: {job.matchedSkillsCount}/{job.totalSkillsCount || 0}
                </p>
              </div>
            )) : (
              <p className={`text-sm ${colors.text.secondary}`}>No recommendation details available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
        <h3 className={`text-xl font-bold mb-6 ${colors.text.primary} flex items-center gap-2`}>
          <LineChart className="w-6 h-6 text-blue-500" />
          Monthly Application Trend (Last 6 Months)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {candidateAnalytics.monthlyTrend.map((month) => {
            const maxValue = Math.max(...candidateAnalytics.monthlyTrend.map((item) => item.count), 1);
            const barHeight = Math.round((month.count / maxValue) * 100);
            return (
              <div key={month.key} className={`p-3 rounded-xl border ${colors.border} ${isDark ? 'bg-white/5' : 'bg-gray-100'} text-center`}>
                <p className={`text-[10px] font-bold uppercase mb-2 ${colors.text.secondary}`}>{month.label}</p>
                <div className={`h-20 rounded-lg flex items-end overflow-hidden mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-lg" style={{ height: `${barHeight}%` }} />
                </div>
                <p className={`text-sm font-bold ${colors.text.primary}`}>{month.count}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
        <h3 className={`text-xl font-bold mb-6 ${colors.text.primary}`}>Profile Action Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Pending Tasks</p>
            <p className={`text-3xl font-black ${colors.text.primary}`}>{candidateAnalytics.pendingProfileTasks}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-xs font-bold uppercase ${colors.text.secondary}`}>Completed Tasks</p>
            <p className={`text-3xl font-black ${colors.text.primary}`}>{profileChecklist.length - candidateAnalytics.pendingProfileTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    const renderGenAIStudio = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`${colors.bg.card} ${colors.border} rounded-2xl p-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h2 className={`text-3xl font-black ${colors.text.primary} flex items-center gap-2`}>
                <Sparkles className="w-7 h-7 text-indigo-500" /> GenAI Studio
              </h2>
              <p className={`text-sm ${colors.text.secondary} mt-1`}>Backend-connected AI tools for resume match, interview prep, readiness, risk and application improvement.</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${genAIStudioLoading ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {genAIStudioLoading ? 'Running...' : 'Ready'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <select
              value={genAIStudioInput.tone}
              onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, tone: event.target.value }))}
              className={`px-3 py-2 rounded-xl border text-sm ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
            >
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="strict">Strict</option>
            </select>
            <select
              value={genAIStudioInput.channel}
              onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, channel: event.target.value }))}
              className={`px-3 py-2 rounded-xl border text-sm ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
            >
              <option value="in-app">In-App</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <input
              value={genAIStudioInput.context}
              onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, context: event.target.value }))}
              className={`px-3 py-2 rounded-xl border text-sm md:col-span-2 ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
              placeholder="Outreach context"
            />
            <input
              value={genAIStudioInput.question}
              onChange={(event) => setGenAIStudioInput((prev) => ({ ...prev, question: event.target.value }))}
              className={`px-3 py-2 rounded-xl border text-sm md:col-span-2 xl:col-span-4 ${colors.bg.input} ${colors.border} ${colors.text.primary}`}
              placeholder="Ask placement knowledge base"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {[['resume-match', 'Resume Match'], ['interview-questions', 'Interview Qs'], ['readiness-plan', 'Readiness Plan'], ['outreach-draft', 'Outreach Draft'], ['risk-prediction', 'Risk Prediction'], ['jd-parse', 'JD Parser'], ['application-review', 'Application Review'], ['analytics-narrative', 'Analytics Story'], ['knowledge-base', 'KB Answer']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => runStudentGenAIAction(key)}
                disabled={genAIStudioLoading}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {Object.entries(genAIStudioOutput).length === 0 ? (
              <p className={`text-sm ${colors.text.secondary}`}>Run any action to see backend AI response.</p>
            ) : (
              Object.entries(genAIStudioOutput).map(([key, value]) => (
                <div key={key} className={`rounded-xl p-3 border ${colors.border} ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-black uppercase mb-2 ${colors.text.secondary}`}>{key.replace('-', ' ')}</p>
                  <pre className={`text-xs whitespace-pre-wrap break-words ${colors.text.primary}`}>{JSON.stringify(value, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );

    switch (currentView) {
      case "overview": return renderOverview();
      case "applications": return renderApplications();
      case "browse-jobs": return renderBrowseJobs();
      case "company-calendar": return <CompanyCalendar />;
      case "exam-papers": return <ExamPapers />;
      case "placement-details": return <PlacementDetails />;
      case "interviews": return renderInterviews();
      case "skills": return renderSkills();
      case "certifications": return renderCertifications();
      case "attendance": return renderAttendance();
      case "performance": return renderPerformance();
      case "companies": return renderCompanies();
      case "placements": return renderPlacements();
      case "interview-exam": return renderInterviewExam();
      case "profile-update": return renderProfileUpdate();
      case "resume": return renderResume();
      case "analytics": return renderAnalytics();
      case "genai-studio": return renderGenAIStudio();
      case "theme": return renderTheme();
      case "live-class":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentView('classes')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80 mb-4`}>
              <ArrowLeft size={20} /> Back to Classes
            </button>
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>Live Class</h2>
            <div className="rounded-[2rem] p-8 border">
              <VideoConference roomId={"live-class-room"} user={user} />
            </div>
          </div>
        );
      case "classes":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentView('overview')} className={`flex items-center gap-2 ${colors.accent} font-bold hover:opacity-80 mb-4`}>
              <ArrowLeft size={20} /> Back
            </button>
            <h2 className={`text-3xl font-black ${colors.text.primary}`}>My Classes</h2>
            <div className="grid gap-4">
              {classes.map(cls => (
                <div key={cls.id} className={`${colors.bg.card} ${colors.border} p-6 rounded-2xl ${isDark ? 'hover:border-indigo-500/30' : 'hover:border-indigo-400'} transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${colors.text.primary}`}>{cls.name}</h3>
                      <p className={colors.text.secondary}>{cls.time}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold uppercase text-xs ${cls.status === 'Active' ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                      {cls.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className={colors.text.secondary}>Instructor: <span className={`${colors.text.primary} font-bold`}>{cls.instructor}</span></p>
                      <p className={colors.text.secondary}>Room: <span className={`${colors.text.primary} font-bold`}>{cls.room}</span></p>
                    </div>
                    <button
                      className="px-6 py-2 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-500 text-white"
                      onClick={() => setCurrentView('live-class')}
                    >
                      Join Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default: return renderOverview();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg.primary} ${colors.text.primary} flex overflow-hidden`}>
      
  {/* MAIN LAYOUT WRAPPER */}
<div
  className="flex h-screen w-full overflow-hidden"
  onTouchStart={handleLayoutTouchStart}
  onTouchEnd={handleLayoutTouchEnd}
>

  {sidebarOpen && (
    <div
      className="fixed inset-0 z-40 bg-black/50 lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* ================= SIDEBAR ================= */}
  <aside
    className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 h-screen ${isDark ? 'bg-slate-900' : 'bg-white'} border-r border-white/5 flex flex-col overflow-hidden transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ minHeight: '100vh' }}>
    <div className="flex flex-col h-full overflow-hidden p-6">

      {/* HEADER */}
      <div className="shrink-0 mb-8 flex items-center justify-between">
        <div
          onClick={() => {
            setCurrentView('overview');
            setSidebarOpen(false);
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src="/vrd-logo.svg" alt="VRD Logo" className="h-9 w-9 rounded-lg bg-white p-1 object-contain" />
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter uppercase">
            Candidate
          </h2>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} className={colors.text.primary} />
        </button>
      </div>

      {/* SCROLLABLE MENU ONLY */}
      <nav className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (item.id === 'email') setShowEmailModal(true);
              else setCurrentView(item.id);
              setSidebarOpen(false);
            }}
            className={`flex items-center justify-between p-4 rounded-xl transition-all group cursor-pointer font-bold ${
              currentView === item.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : isDark
                ? 'text-white/50 hover:bg-white/5'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-4">
              <item.icon size={20} />
              <span className="text-xs tracking-widest uppercase">
                {item.label}
              </span>
            </div>

            {item.count && (
              <span className="text-[10px] px-2 py-1 rounded-lg bg-black/20">
                {item.count}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="shrink-0 mt-6 pt-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-4 rounded-2xl font-black transition-all border border-red-500/20"
        >
          <LogOut size={20} />
          <span className="uppercase text-xs tracking-widest">
            Sign Out
          </span>
        </button>
      </div>

    </div>
  </aside>


  {/* ================= MAIN CONTENT ================= */}
  <div className="flex-1 flex flex-col h-screen w-full overflow-hidden">

    {/* HEADER */}
    <header
      className={`${isDark 
        ? 'bg-gradient-to-r from-slate-950/50 to-slate-900/50 backdrop-blur-xl border-b border-white/5' 
        : 'bg-gradient-to-r from-white/50 to-gray-50/50 backdrop-blur-xl border-b border-gray-300'
      } px-8 py-4 flex items-center justify-between z-40`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 lg:hidden"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        <h1 className={`text-[10px] font-black tracking-[0.2em] ${
          isDark ? 'text-indigo-400' : 'text-indigo-600'
        } uppercase`}>
          Student Portal / {currentView.toUpperCase()}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className={`flex items-center space-x-3 ${
          isDark 
            ? 'border-l border-white/10 pl-6' 
            : 'border-l border-gray-300 pl-6'
        }`}>
          <img
            src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentDetails.name}`}
            className={`w-9 h-9 rounded-full ${
              isDark ? 'border-indigo-500/50' : 'border-indigo-300'
            } border`}
            alt="profile"
            onError={handleImageError}
          />
          <span className={`text-sm font-bold hidden sm:block ${colors.text.primary}`}>
            {studentDetails.name}
          </span>
        </div>
      </div>
    </header>

    {/* ONLY MAIN CONTENT SCROLLS */}
    <main className={`flex-1 overflow-y-auto p-8 bg-gradient-to-b ${colors.bg.primary}`}>
      {renderContent()}
    </main>

  </div>

</div>

{/* AI Panel */}
<div className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 ${isDark ? 'bg-slate-950 border-l border-white/10' : 'bg-white border-l border-gray-200'} transform transition-transform duration-500 shadow-2xl flex flex-col ${aiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 overflow-hidden">
          
          {/* Header with Pulse Indicator */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tighter">Gemini Intelligence</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">System Live</span>
                </div>
              </div>
            </div>
            <button onClick={() => setAiPanelOpen(false)} className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-full transition-colors`}>
              <X size={20} />
            </button>
          </div>

          {/* Dynamic Suggestions Section */}
          <div className="mb-4">
            <p className={`text-[10px] font-bold ${colors.text.muted} uppercase mb-2 px-1`}>Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {getSuggestions(currentView).map((text, i) => (
                <button 
                  key={i}
                  onClick={() => setAiMessage(text)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    isDark ? 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar">
            {aiChat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                    : isDark ? 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="pt-4 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                className={`w-full ${colors.bg.input} border ${colors.border} rounded-2xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all`}
                placeholder="Ask Gemini anything..." 
              />
              <button 
                onClick={handleAIChat}
                className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 active:scale-90 transition-all shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificate Generation Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} rounded-3xl max-w-lg w-full shadow-2xl border`}>
            <div className={`${isDark ? 'border-slate-700' : 'border-gray-200'} border-b p-6 flex items-center justify-between`}>
              <div>
                <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
                  Generate Certificate
                </h2>
                <p className={`text-sm ${colors.text.secondary} mt-1`}>
                  Edit recipient name and download as PDF
                </p>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className={`p-2 hover:${isDark ? 'bg-white/10' : 'bg-gray-100'} rounded-2xl transition-colors`}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Certificate Preview Info */}
              <div className={`${isDark ? 'bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300'} border rounded-2xl p-4`}>
                <div className="flex items-start gap-3">
                  <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold ${colors.text.primary} truncate`}>
                      {selectedCertificate?.name}
                    </h3>
                    <p className="text-indigo-400 text-sm">{selectedCertificate?.issuer}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={colors.text.secondary}>
                        📅 {selectedCertificate?.date ? new Date(selectedCertificate.date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className={colors.text.secondary}>
                        🔖 {selectedCertificate?.credentialId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Name Input */}
              <div>
                <label className={`block text-sm font-bold ${colors.text.primary} mb-2`}>
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={certificateRecipientName}
                  onChange={(e) => setCertificateRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                  className={`w-full ${colors.bg.input} border ${colors.border} rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                />
                <p className={`text-xs ${colors.text.muted} mt-1`}>
                  This name will appear on the certificate
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePreviewCertificate}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 transition-all ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <Eye size={16} /> Preview PDF
                </button>
                <button
                  onClick={generateAndDownloadCertificate}
                  disabled={!certificateRecipientName.trim()}
                  className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold text-sm uppercase hover:bg-indigo-500 flex items-center justify-center gap-2 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>

              <p className={`text-xs ${colors.text.muted} text-center`}>
                💡 Professional certificate in A4 landscape format
              </p>
            </div>
          </div>
        </div>
      )}
      
      <EnhancedEmailModal 
        show={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        user={user} 
        theme={resolvedTheme} 
      />
    </div>
  );
}

// ============ EXPORT WITH PROVIDER ============
export default function StudentDashboard() {
  return (
    <ThemeProvider>
      <StudentDashboardPro />
    </ThemeProvider>
  );
}