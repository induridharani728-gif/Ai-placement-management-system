// Utility to normalize avatar URL
function getAvatarUrl(avatar) {
  if (!avatar) return '';
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (avatar.startsWith('/uploads/')) {
    return baseUrl + avatar;
  }
  return avatar;
}
import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import ProfileSection from "../../components/common/ProfileSection";
import NotificationModal from "../../components/NotificationModal";
import EmailModal from "../../components/EmailModal";
import { studentAPI, statsAPI, jobAPI, placementsAPI, examsAPI, applicationsAPI, jobRequisitionsAPI, adminAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageSelector } from '../../contexts/LanguageContext';
import {
  Shield,
  Users,
  Database,
  Activity,
  Settings,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Zap,
  Lock,
  MoreVertical,
  Search,
  Trash2,
  Edit3,
  UserPlus,
  Server,
  Globe,
  HardDrive,
  Cpu,
  RefreshCcw,
  LayoutDashboard,
  Bell,
  Terminal,
  Layers,
  LogOut,
  ChevronRight,
  Check,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Wifi,
  MapPin,
  Shield as SecurityIcon,
  AlertTriangle,
  Calendar,
  BarChart2,
  Edit,
  X,
  FileCheck,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader,
  Sun,
  Moon,
  Monitor,
  User,
  Save,
  Mail,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [currentView, setCurrentView] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [alertFilter, setAlertFilter] = useState("all");

  // Theme system: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("dark");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Backend Data States
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobRequisitions, setJobRequisitions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Admin specific states
  const [systemStatus, setSystemStatus] = useState(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [controlCenter, setControlCenter] = useState(null);
  const [controlLoading, setControlLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'student', password: '' });
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'System backup completed successfully', time: '2 minutes ago', read: false },
    { id: 2, type: 'warning', message: 'High memory usage detected (89%)', time: '15 minutes ago', read: false },
    { id: 3, type: 'info', message: 'New user registration: john.doe@example.com', time: '1 hour ago', read: true }
  ]);

  // Profile Edit Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system',
    targetRoles: 'all'
  });
  const [templateForm, setTemplateForm] = useState({ key: '', name: '', channel: 'email', subject: '', body: '' });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
  }, [user]);

  // ===== THEME MANAGEMENT =====
  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme') || 'system';
    setTheme(savedTheme);
  }, []);

  // Detect system theme preference
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

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // ===== DATA FETCHING FROM BACKEND =====
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
      const basePromises = [
        studentAPI.getAll(),
        placementsAPI.getAll(),
        jobAPI.getAll(),
        applicationsAPI.getAll(),
        jobRequisitionsAPI.getAll(),
        statsAPI.getAdminStats()
      ];

      const isAdmin = user && user.role === 'admin';
      if (isAdmin) {
        basePromises.push(
          adminAPI.getAllUsers(),
          adminAPI.getSystemStatus(),
          adminAPI.getAnalytics(),
          adminAPI.getAlerts(),
          adminAPI.getAuditLogs(),
          adminAPI.getControlCenter()
        );
      }

      const results = await Promise.allSettled(basePromises);

      // Process base responses
      if (results[0].status === 'fulfilled') {
        setStudents(results[0].value.data.students || []);
      } else {
        console.error('Error fetching students:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        setPlacements(results[1].value.data.placements || []);
      } else {
        console.error('Error fetching placements:', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        setJobs(results[2].value.data.jobs || []);
      } else {
        console.error('Error fetching jobs:', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        setApplications(results[3].value.data.applications || []);
      } else {
        console.error('Error fetching applications:', results[3].reason);
      }

      if (results[4].status === 'fulfilled') {
        setJobRequisitions(results[4].value.data.jobRequisitions || []);
      } else {
        console.error('Error fetching job requisitions:', results[4].reason);
      }

      if (results[5].status === 'fulfilled') {
        setDashboardStats(results[5].value.data || null);
      } else {
        console.error('Error fetching admin stats:', results[5].reason);
      }

      // Process admin specific responses if applicable
      if (isAdmin) {
        if (results[6].status === 'fulfilled') {
          setUsers(results[6].value.data.users || []);
        } else {
          console.error('Error fetching users:', results[6].reason);
        }

        if (results[7].status === 'fulfilled') {
          setSystemStatus(results[7].value.data.system || null);
        } else {
          console.error('Error fetching system status:', results[7].reason);
        }

        if (results[8].status === 'fulfilled') {
          setAdminAnalytics(results[8].value.data.analytics || null);
        } else {
          console.error('Error fetching analytics:', results[8].reason);
        }

        if (results[9].status === 'fulfilled') {
          setSystemAlerts(results[9].value.data.alerts || []);
        } else {
          console.error('Error fetching alerts:', results[9].reason);
        }

        if (results[10].status === 'fulfilled') {
          setAuditLogs(results[10].value.data.logs || []);
        } else {
          console.error('Error fetching audit logs:', results[10].reason);
        }

        try {
          setControlLoading(true);
          if (results[11].status === 'fulfilled') {
            setControlCenter(results[11].value.data.data || null);
          } else {
            console.error('Error fetching control center:', results[11].reason);
          }
        } finally {
          setControlLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Configuration States
  const [config, setConfig] = useState({
    registrationOpen: true,
    mfaRequired: false,
    maintenanceMode: false,
    debugMode: true,
    automaticBackups: true,
    ipWhitelistEnabled: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  // Alert States
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "Unusual Login Activity",
      message: "5 failed auth attempts from IP 192.168.1.101",
      timestamp: "2 mins ago",
      resolved: false,
    },
    {
      id: 2,
      type: "warning",
      title: "High Memory Usage",
      message: "Memory consumption at 89% across cluster nodes",
      timestamp: "15 mins ago",
      resolved: false,
    },
    {
      id: 3,
      type: "info",
      title: "Database Backup Complete",
      message: "Monthly backup completed successfully (2.4GB)",
      timestamp: "1 hour ago",
      resolved: true,
    },
    {
      id: 4,
      type: "critical",
      title: "SSL Certificate Expiry",
      message: "Certificate expires in 14 days - renewal required",
      timestamp: "3 hours ago",
      resolved: false,
    },
  ]);

  const [alertComposer, setAlertComposer] = useState({
    target: 'campus',
    type: 'warning',
    title: '',
    message: ''
  });

  const [systemStats, setSystemStats] = useState({
    cpu: 24,
    cpuTrend: "down",
    memory: "1.8GB / 4GB",
    memoryTrend: "up",
    network: "1.2 Gbps",
    networkTrend: "stable",
    uptime: "14d 2h 45m",
    diskSpace: "245GB / 500GB",
    activeConnections: 342,
    requestsPerSecond: 1247,
    errorRate: "0.12%",
    dbLatency: "12ms",
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      user: "admin_primary",
      action: "Modified user permissions",
      target: "5 users updated",
      timestamp: "2 mins ago",
      severity: "info",
    },
    {
      id: 2,
      user: "system_audit",
      action: "Database checkpoint",
      target: "Main cluster",
      timestamp: "5 mins ago",
      severity: "success",
    },
    {
      id: 3,
      user: "john.doe@company.com",
      action: "Failed login attempt",
      target: "Browser session",
      timestamp: "12 mins ago",
      severity: "warning",
    },
    {
      id: 4,
      user: "admin_secondary",
      action: "Configuration change",
      target: "MFA settings",
      timestamp: "28 mins ago",
      severity: "info",
    },
    {
      id: 5,
      user: "system_maintenance",
      action: "System update deployed",
      target: "v2.14.3",
      timestamp: "1 hour ago",
      severity: "success",
    },
  ]);

  const [serverMetrics, setServerMetrics] = useState([
    {
      name: "Server-01",
      status: "online",
      cpu: 18,
      memory: 45,
      network: 520,
      uptime: "28d",
    },
    {
      name: "Server-02",
      status: "online",
      cpu: 31,
      memory: 68,
      network: 780,
      uptime: "14d",
    },
    {
      name: "Server-03",
      status: "online",
      cpu: 22,
      memory: 52,
      network: 610,
      uptime: "7d",
    },
    {
      name: "Server-04",
      status: "warning",
      cpu: 78,
      memory: 92,
      network: 950,
      uptime: "3d",
    },
  ]);

  const menuItems = [
    { id: "overview", translationKey: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "control", translationKey: "controlCenter", label: "Control Center", icon: Shield },
    { id: "profile", translationKey: "myProfile", label: "My Profile", icon: User },
    { id: "users", translationKey: "userDirectory", label: "User Directory", icon: Users },
    { id: "analytics", translationKey: "deepAnalytics", label: "Deep Analytics", icon: BarChart3 },
    { id: "system", translationKey: "systemConfig", label: "System Config", icon: Settings },
    { id: "logs", translationKey: "auditLogs", label: "Audit Logs", icon: Terminal },
    { id: "alerts", translationKey: "alertCenter", label: "Alert Center", icon: AlertCircle },
    { id: "servers", translationKey: "serverStatus", label: "Server Status", icon: Server },
    { id: "email", translationKey: "emailCenter", label: "Email Center", icon: Mail },
  ];

  const mockUserBreakdown = [
    {
      role: "Students",
      count: 892,
      color: "from-blue-500 to-indigo-500",
      percentage: 71,
    },
    {
      role: "HR",
      count: 156,
      color: "from-orange-500 to-red-500",
      percentage: 12,
    },
    {
      role: "Staff",
      count: 124,
      color: "from-emerald-500 to-teal-500",
      percentage: 10,
    },
    {
      role: "Admin",
      count: 75,
      color: "from-purple-500 to-pink-500",
      percentage: 6,
    },
  ];

  // ---------- LOGOUT (no API connections changed) ----------
  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // purely client-side session clear
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
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
        alert('Profile updated successfully! Refreshing...');
        // Reload page to refresh user context
        window.location.reload();
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setProfileSubmitting(false);
    }
  };
  
  // User Management Handlers
  const handleCreateUser = async () => {
    try {
      if (!userForm.name || !userForm.email || !userForm.role) {
        alert('Please fill all required fields');
        return;
      }
      if (!editingUser && !userForm.password) {
        alert('Password is required for new users');
        return;
      }
      
      if (editingUser) {
        await adminAPI.updateUser(editingUser._id, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role
        });
        alert('User updated successfully!');
      } else {
        await adminAPI.createUser(userForm);
        alert('User created successfully!');
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', role: 'student', password: '' });
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowUserModal(true);
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        alert('User deleted successfully!');
        fetchAllData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getRecipientIdsByTarget = (target) => {
    const allowedRoles = target === 'campus'
      ? ['student', 'staff', 'hr']
      : [target];

    const objectIdPattern = /^[a-f\d]{24}$/i;

    return users
      .filter((userItem) => allowedRoles.includes(String(userItem.role || '').toLowerCase()))
      .map((userItem) => String(userItem._id || userItem.id || '').trim())
      .filter((id) => objectIdPattern.test(id));
  };

  const handleBroadcastAlert = async (alertItem, target = 'campus') => {
    try {
      const allUserIds = getRecipientIdsByTarget(target);

      if (allUserIds.length === 0) {
        alert('No users available to receive notifications.');
        return;
      }

      let sentMessage = `Alert sent to ${allUserIds.length} users.`;
      try {
        const bulkResponse = await notificationsAPI.sendBulk({
          userIds: allUserIds,
          title: `[Admin Alert] ${alertItem.title}`,
          message: alertItem.message,
          type: 'alert'
        });

        const sentCount = Number(bulkResponse?.data?.sentCount || allUserIds.length);
        sentMessage = sentCount === allUserIds.length
          ? `Alert sent to ${sentCount} users.`
          : `Alert sent to ${sentCount} users. Some recipients were skipped.`;
      } catch (bulkError) {
        let successCount = 0;
        let failedCount = 0;

        await Promise.all(
          allUserIds.map(async (recipientId) => {
            try {
              await notificationsAPI.sendDirect({
                recipientId,
                title: `[Admin Alert] ${alertItem.title}`,
                message: alertItem.message,
                type: 'alert'
              });
              successCount += 1;
            } catch (_directError) {
              failedCount += 1;
            }
          })
        );

        if (successCount === 0) {
          throw bulkError;
        }

        sentMessage = `Alert sent to ${successCount} users. Failed for ${failedCount} users.`;
      }

      setNotifications((prev) => ([
        {
          id: Date.now(),
          type: 'info',
          message: `Alert sent to ${allUserIds.length} users: ${alertItem.title}`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]));

      alert(sentMessage);
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to broadcast alert.');
      return false;
    }
  };

  const handleSendCustomAlert = async () => {
    if (!alertComposer.title.trim() || !alertComposer.message.trim()) {
      alert('Please enter alert title and message.');
      return;
    }

    const customAlert = {
      title: alertComposer.title.trim(),
      message: alertComposer.message.trim(),
      type: alertComposer.type,
      timestamp: 'Just now',
      resolved: false
    };

    const sent = await handleBroadcastAlert(customAlert, alertComposer.target);

    if (!sent) {
      return;
    }

    setAlerts((prev) => ([
      {
        id: Date.now(),
        ...customAlert
      },
      ...prev
    ]));

    setAlertComposer((prev) => ({
      ...prev,
      title: '',
      message: ''
    }));
  };

  // ---------- SUB COMPONENTS ----------
  const TrendBadge = ({ trend, value }) => {
    const isPositive = trend === "up";
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <span
        className={`text-xs font-bold flex items-center gap-1 ${
          isPositive ? "text-emerald-400" : "text-orange-400"
        }`}
      >
        <Icon size={12} /> {value}%
      </span>
    );
  };

  const Sidebar = () => {
    const sidebarBg = resolvedTheme === 'dark' 
      ? 'bg-[#05060b] bg-gradient-to-b from-[#05060b] via-[#050816] to-[#020308]' 
      : 'bg-gradient-to-b from-slate-50 via-white to-slate-100';
    const sidebarBorder = resolvedTheme === 'dark' ? 'border-white/5' : 'border-slate-200';
    
    // Hide sidebar on mobile unless open
    return (
      <div
        className={`fixed left-0 top-0 h-full ${sidebarBg} border-r ${sidebarBorder} transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobile && !isSidebarOpen ? 'hidden' : ''}`}
      >
      <div className="p-6 mb-8 flex items-center gap-3">
        <img src="/vrd-logo.svg" alt="VRD Logo" className="w-10 h-10 rounded-xl bg-white p-1 object-contain shadow-lg shadow-indigo-500/20" />
        {isSidebarOpen && (
          <span className={`font-black tracking-tighter text-xl ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Admin </span>
        )}
      </div>

      <nav className="px-3 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const activeClass = isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : '';
          const inactiveClass = !isActive ? (resolvedTheme === 'dark' ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900') : '';
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'email') {
                  setShowEmailModal(true);
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeClass} ${inactiveClass}`}
            >
              <Icon size={22} />
              {isSidebarOpen && (
                <span className="font-bold text-sm">{t(item.translationKey)}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 w-full px-3 space-y-3">
        {/* THEME SELECTOR */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowThemeMenu(!showThemeMenu);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              resolvedTheme === 'dark'
                ? 'text-slate-300 hover:bg-white/5'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {theme === 'light' ? <Sun size={20} /> : 
             theme === 'dark' ? <Moon size={20} /> : 
             <Monitor size={20} />}
            {isSidebarOpen && (
              <span className="font-bold text-sm">
                {theme === 'light' ? 'Light Theme' : 
                 theme === 'dark' ? 'Dark Theme' : 
                 'System Theme'}
              </span>
            )}
          </button>

          {/* Theme Dropdown Menu */}
          {showThemeMenu && isSidebarOpen && (
            <div 
              className={`absolute bottom-full mb-2 left-3 right-3 rounded-xl overflow-hidden shadow-2xl z-50 ${
                resolvedTheme === 'dark'
                  ? 'bg-slate-900 border border-white/10'
                  : 'bg-white border border-slate-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setTheme('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  theme === 'light'
                    ? resolvedTheme === 'dark'
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-900'
                    : resolvedTheme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sun size={18} />
                <span className="font-bold">Light</span>
                {theme === 'light' && <Check size={16} className="ml-auto" />}
              </button>
              
              <button
                onClick={() => {
                  setTheme('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  theme === 'dark'
                    ? resolvedTheme === 'dark'
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-900'
                    : resolvedTheme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon size={18} />
                <span className="font-bold">Dark</span>
                {theme === 'dark' && <Check size={16} className="ml-auto" />}
              </button>
              
              <button
                onClick={() => {
                  setTheme('system');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  theme === 'system'
                    ? resolvedTheme === 'dark'
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-900'
                    : resolvedTheme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Monitor size={18} />
                <span className="font-bold">System</span>
                {theme === 'system' && <Check size={16} className="ml-auto" />}
              </button>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={22} />
          {isSidebarOpen && (
            <span className="font-bold text-sm">Terminate Session</span>
          )}
        </button>
      </div>
    </div>
    );
  };

  const AlertCard = ({ alert }) => {
    const bgColor =
      {
        critical: "border-red-500/30 bg-red-500/5",
        warning: "border-orange-500/30 bg-orange-500/5",
        info: "border-blue-500/30 bg-blue-500/5",
      }[alert.type] || "";
    const iconBg =
      {
        critical: "bg-red-500/20 text-red-400",
        warning: "bg-orange-500/20 text-orange-400",
        info: "bg-blue-500/20 text-blue-400",
      }[alert.type] || "";

    return (
      <div
        className={`border rounded-2xl p-4 ${bgColor} flex items-start gap-4 mb-3`}
      >
        <div
          className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 mt-1`}
        >
          {alert.type === "critical" && <AlertTriangle size={18} />}
          {alert.type === "warning" && <AlertCircle size={18} />}
          {alert.type === "info" && <Bell size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm mb-1">{alert.title}</p>
          <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
          <p className="text-[10px] text-slate-300/80">{alert.timestamp}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <button
            onClick={() => handleBroadcastAlert(alert, 'campus')}
            className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            Send to Campus
          </button>
          <button className="text-slate-500 hover:text-white transition-all">
            <Check size={18} />
          </button>
        </div>
      </div>
    );
  };

  const ActivityRow = ({ activity }) => {
    const severityColor =
      {
        info: "text-blue-400",
        success: "text-emerald-400",
        warning: "text-orange-400",
        critical: "text-red-400",
      }[activity.severity] || "text-slate-400";

    return (
      <div className="flex items-center justify-between py-3 px-4 hover:bg-white/5 rounded-lg transition-all">
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{activity.action}</p>
          <p className="text-xs text-slate-500">{activity.user}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{activity.target}</p>
          <p className={`text-[10px] ${severityColor} font-bold`}>
            {activity.timestamp}
          </p>
        </div>
      </div>
    );
  };

  const ServerMetricRow = ({ server }) => {
    const isDark = resolvedTheme === "dark";
    const statusColor =
      server.status === "online" ? "text-emerald-400" : "text-orange-400";
    const cpuHealth = server.cpu > 70 ? "text-orange-400" : "text-emerald-400";
    const memoryHealth =
      server.memory > 80 ? "text-orange-400" : "text-emerald-400";

    return (
      <div className={`rounded-xl p-4 mb-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-300 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                server.status === "online" ? "bg-emerald-500" : "bg-orange-500"
              }`}
            />
            <span className="font-bold">{server.name}</span>
          </div>
          <span className={`text-xs font-bold ${statusColor}`}>
            {server.status.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-slate-100 border border-slate-200'}`}>
            <p className={`mb-1 ${isDark ? 'text-slate-500' : 'text-slate-700 font-semibold'}`}>CPU</p>
            <p className={`font-bold ${cpuHealth}`}>{server.cpu}%</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-slate-100 border border-slate-200'}`}>
            <p className={`mb-1 ${isDark ? 'text-slate-500' : 'text-slate-700 font-semibold'}`}>Memory</p>
            <p className={`font-bold ${memoryHealth}`}>{server.memory}%</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-slate-100 border border-slate-200'}`}>
            <p className={`mb-1 ${isDark ? 'text-slate-500' : 'text-slate-700 font-semibold'}`}>Network</p>
            <p className="font-bold text-blue-400">{server.network}Mbps</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-slate-100 border border-slate-200'}`}>
            <p className={`mb-1 ${isDark ? 'text-slate-500' : 'text-slate-700 font-semibold'}`}>Uptime</p>
            <p className="font-bold text-indigo-400">{server.uptime}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Profile with Inline Editing
  const renderProfile = () => {
    const isDark = resolvedTheme === 'dark';
    
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
      } catch (error) {
        console.error('Failed to update profile:', error);
        setProfileError('Failed to update profile. Please try again.');
      } finally {
        setProfileSubmitting(false);
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              My Profile
            </h2>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Manage your personal information and administration settings
            </p>
          </div>
          <div className="flex gap-3">
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
                  className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {profileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2"
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
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <User className="w-6 h-6 text-green-500" />
              Personal Information
            </h3>
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={profileForm.avatar ? getAvatarUrl(profileForm.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
                    alt={profileForm.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-500/20"
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
                              setProfileForm({ ...profileForm, avatar: event.target.result });
                              if (user) {
                                user.avatar = event.target.result;
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full hover:bg-green-700 transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-xl bg-white/5 text-white">
                    {profileForm.name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Email Address
                </label>
                <p className="px-4 py-3 rounded-xl bg-white/5 text-slate-400">
                  {user?.email || 'Not set'}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-xl bg-white/5 text-white">
                    {profileForm.phone || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Shield className="w-6 h-6 text-emerald-500" />
              Account Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Role
                </label>
                <p className="px-4 py-3 rounded-xl bg-white/5 text-white">
                  {user?.role?.toUpperCase() || 'ADMIN'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  User ID
                </label>
                <p className="px-4 py-3 rounded-xl font-mono text-sm bg-white/5 text-slate-400">
                  {user?.id || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Member Since
                </label>
                <p className="px-4 py-3 rounded-xl bg-white/5 text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Permissions
                </label>
                <p className="px-4 py-3 rounded-xl bg-white/5 text-green-400">
                  Full System Access
                </p>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Activity className="w-6 h-6 text-teal-500" />
              System Statistics
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Users</span>
                <span className="text-2xl font-bold text-green-500">{users.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Active Students</span>
                <span className="text-2xl font-bold text-emerald-500">{students.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Placements</span>
                <span className="text-2xl font-bold text-teal-500">{placements.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Active Jobs</span>
                <span className="text-2xl font-bold text-cyan-500">{jobs.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {profileError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {profileError}
          </div>
        )}
      </div>
    );
  };

  // ---------- VIEW RENDERERS ----------
  const renderConfig = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
          <Settings className="text-indigo-400" /> GLOBAL CONTROLS
        </h3>
        <div className="space-y-6">
          {Object.entries(config).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
            >
              <div>
                <p className="font-bold capitalize text-sm">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xs text-slate-500">
                  Enable/Disable feature platform-wide
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, [key]: !val })}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  val ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    val ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
            <p className="font-black tracking-widest text-[10px] text-slate-500 mb-1">
              SECURITY PROFILE
            </p>
            <p className="font-bold text-emerald-400 flex items-center gap-1">
              <Lock size={14} /> Tier-1 Hardened
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
            <p className="font-black tracking-widest text-[10px] text-slate-500 mb-1">
              CHANGE WINDOW
            </p>
            <p className="font-bold text-blue-400">02:00–04:00 UTC</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-purple-900/40 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div>
            <h3 className="text-2xl font-black mb-2">SYSTEM HEALTH</h3>
            <p className="text-slate-400 text-sm">
              All protocols are currently operating within normal parameters. 3
              alerts require attention.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-widest text-slate-500">
                  CPU LOAD
                </span>
                <Cpu size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-black">{systemStats.cpu}%</p>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <TrendBadge trend={systemStats.cpuTrend} value="12" />
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-widest text-slate-500">
                  MEMORY
                </span>
                <HardDrive size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-black">{systemStats.memory}</p>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <TrendBadge trend={systemStats.memoryTrend} value="8" />
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-widest text-slate-500">
                  NETWORK
                </span>
                <Wifi size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-black">{systemStats.network}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Current throughput
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-widest text-slate-500">
                  UPTIME
                </span>
                <Clock size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-black">{systemStats.uptime}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Since last reboot
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1">
                DISK SPACE
              </p>
              <p className="font-bold text-orange-400">
                {systemStats.diskSpace}
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1">
                ERROR RATE
              </p>
              <p className="font-bold text-emerald-400">
                {systemStats.errorRate}
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1">
                DB LATENCY
              </p>
              <p className="font-bold text-blue-400">
                {systemStats.dbLatency}
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1">
                CONNECTIONS
              </p>
              <p className="font-bold text-indigo-400">
                {systemStats.activeConnections}
              </p>
            </div>
          </div>
        </div>
        <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 -rotate-12" />
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
        <div>
          <h3 className="text-2xl font-black mb-1">ALERT CENTER</h3>
          <p className="text-slate-300 text-sm">
            {alerts.filter((a) => !a.resolved).length} active alerts requiring
            action
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="admin-alert-field bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white"
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h4 className="font-black text-lg mb-4 flex items-center gap-2">
          <Bell size={18} className="text-indigo-400" /> Send Alert Notification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <select
            value={alertComposer.target}
            onChange={(e) => setAlertComposer((prev) => ({ ...prev, target: e.target.value }))}
            className="admin-alert-field bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white"
          >
            <option value="campus">Students + Staff + HR</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
            <option value="hr">HR</option>
          </select>
          <select
            value={alertComposer.type}
            onChange={(e) => setAlertComposer((prev) => ({ ...prev, type: e.target.value }))}
            className="admin-alert-field bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white"
          >
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <input
            value={alertComposer.title}
            onChange={(e) => setAlertComposer((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Alert title"
            className="admin-alert-field md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-300/80 outline-none"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            value={alertComposer.message}
            onChange={(e) => setAlertComposer((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Type alert message to send as notification..."
            rows={3}
            className="admin-alert-field flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white placeholder:text-slate-300/80 outline-none resize-none"
          />
          <button
            onClick={handleSendCustomAlert}
            className="px-5 py-3 h-fit bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
          >
            Send Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {alerts
              .filter(
                (a) => alertFilter === "all" || a.type === alertFilter
              )
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 via-slate-900/30 to-orange-900/30 border border-white/10 rounded-2xl p-6">
          <h4 className="font-black text-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-400" /> CRITICAL
            SUMMARY
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Critical Alerts</span>
              <span className="font-black text-red-400">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Response Time</span>
              <span className="font-black text-orange-400">8.3 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">24h Resolution Rate</span>
              <span className="font-black text-emerald-400">94%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "94%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServers = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-2xl p-6 border ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white border-slate-300 shadow-sm'}`}>
        <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
          <Server className="text-indigo-400" /> SERVER INFRASTRUCTURE
        </h3>
        <p className={`text-sm ${isDarkTheme ? 'text-slate-500' : 'text-slate-700'}`}>
          Real-time monitoring of all active nodes across the cluster
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-black text-lg mb-3">Active Nodes</h4>
          {serverMetrics.map((server) => (
            <ServerMetricRow key={server.name} server={server} />
          ))}
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl p-6 border ${isDarkTheme ? 'bg-gradient-to-br from-blue-900/30 via-slate-900/30 to-indigo-900/30 border-white/10' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 border-slate-300'}`}>
            <h4 className="font-black text-lg mb-4">CLUSTER STATISTICS</h4>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Overall CPU Load</span>
                  <span className="font-black">38.3%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkTheme ? 'bg-white/10' : 'bg-slate-300/70'}`}>
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: "38.3%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Average Memory</span>
                  <span className="font-black">64.2%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkTheme ? 'bg-white/10' : 'bg-slate-300/70'}`}>
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: "64.2%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Network Utilization</span>
                  <span className="font-black">46.8%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkTheme ? 'bg-white/10' : 'bg-slate-300/70'}`}>
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: "46.8%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border ${isDarkTheme ? 'bg-gradient-to-br from-emerald-900/30 via-slate-900/30 to-teal-900/30 border-white/10' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-100 border-slate-300'}`}>
            <h4 className="font-black text-lg mb-4">HEALTH STATUS</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Healthy Nodes</span>
                <span className="font-black text-emerald-400">3 / 4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Avg Response Time</span>
                <span className="font-black text-blue-400">89ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Total Throughput</span>
                <span className="font-black text-indigo-400">2.86 Gbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>Error Count (24h)</span>
                <span className="font-black text-emerald-400">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleToggleFeature = async (key, current) => {
    try {
      const next = !current;
      await adminAPI.updateFeatureToggles({ [key]: next });
      setControlCenter((prev) => ({
        ...prev,
        featureToggles: { ...(prev?.featureToggles || {}), [key]: next }
      }));
    } catch (error) {
      alert('Failed to update feature toggle');
    }
  };

  const handleSendBroadcastFromControl = async () => {
    try {
      if (!broadcastForm.title || !broadcastForm.message) {
        alert('Please provide title and message');
        return;
      }
      const targetRoles = broadcastForm.targetRoles === 'all' ? [] : [broadcastForm.targetRoles];
      await adminAPI.sendBroadcastNotification({
        title: broadcastForm.title,
        message: broadcastForm.message,
        type: broadcastForm.type,
        targetRoles
      });
      alert('Broadcast sent successfully');
      setBroadcastForm({ title: '', message: '', type: 'system', targetRoles: 'all' });
      const controlRes = await adminAPI.getControlCenter();
      setControlCenter(controlRes.data.data || null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to send broadcast');
    }
  };

  const handleSaveTemplateFromControl = async () => {
    try {
      if (!templateForm.key || !templateForm.name || !templateForm.body) {
        alert('Template key, name and body are required');
        return;
      }
      await adminAPI.upsertTemplate(templateForm);
      setTemplateForm({ key: '', name: '', channel: 'email', subject: '', body: '' });
      const controlRes = await adminAPI.getControlCenter();
      setControlCenter(controlRes.data.data || null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save template');
    }
  };

  const handleResolveApprovalFromControl = async (id, status) => {
    try {
      await adminAPI.resolveApproval(id, { status });
      setControlCenter((prev) => ({
        ...prev,
        approvals: (prev?.approvals || []).map((item) =>
          String(item._id) === String(id)
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item
        )
      }));
    } catch (error) {
      alert('Failed to update approval status');
    }
  };

  const handleTriggerBackupFromControl = async () => {
    try {
      await adminAPI.triggerBackup();
      const controlRes = await adminAPI.getControlCenter();
      setControlCenter(controlRes.data.data || null);
      alert('Backup completed successfully');
    } catch (error) {
      alert('Failed to trigger backup');
    }
  };

  const renderControlCenter = () => {
    const data = controlCenter || {};
    const featureToggles = data.featureToggles || {};
    const approvals = data.approvals || [];
    const templates = data.templates || [];
    const backups = data.backups || [];
    const rolePermissions = data.rolePermissions || [];
    const riskAlerts = data.riskAlerts || [];
    const aiInsights = data.aiInsights || [];
    const analytics = data.analytics || {};
    const health = data.systemHealth || {};
    const governance = data.dataGovernance || {};
    const controlFieldClass = resolvedTheme === 'dark'
      ? 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/70'
      : 'w-full bg-slate-900 border border-slate-500 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/70';
    const whiteInputStyle = { color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#ffffff' };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-2xl font-black mb-1">ADMIN CONTROL CENTER</h3>
          <p className="text-slate-500 text-sm">
            Role permissions, approvals, analytics, health, audit readiness, notifications, templates, risk, AI insights, settings, and backups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase">Placement Funnel</p>
            <p className="text-2xl font-black">{analytics.placementRate || 0}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase">System Health</p>
            <p className="text-2xl font-black">CPU {health.cpuLoad || 0}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase">Pending Approvals</p>
            <p className="text-2xl font-black">{approvals.filter((a) => a.status === 'pending').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Feature Toggles</h4>
            <div className="space-y-3">
              {Object.entries(featureToggles).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold">{key}</span>
                  <button
                    onClick={() => handleToggleFeature(key, !!value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-200'}`}
                  >
                    {value ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Backup & Recovery</h4>
            <button onClick={handleTriggerBackupFromControl} className="px-4 py-2 mb-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm">
              Trigger Backup
            </button>
            <div className="space-y-2 max-h-48 overflow-auto">
              {backups.slice(0, 5).map((backup) => (
                <div key={String(backup._id || backup.startedAt)} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  {new Date(backup.startedAt).toLocaleString()} - {backup.status} - {backup.sizeMb}MB
                </div>
              ))}
              {!backups.length && <p className="text-xs text-slate-400">No backups yet.</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Approval Workflow</h4>
            <div className="space-y-2 max-h-60 overflow-auto">
              {approvals.slice(0, 8).map((item) => (
                <div key={item._id} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.type}</p>
                    <span className="text-xs uppercase text-slate-300">{item.status}</span>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleResolveApprovalFromControl(item._id, 'approved')} className="text-xs px-2 py-1 rounded bg-emerald-600">Approve</button>
                      <button onClick={() => handleResolveApprovalFromControl(item._id, 'rejected')} className="text-xs px-2 py-1 rounded bg-red-600">Reject</button>
                    </div>
                  )}
                </div>
              ))}
              {!approvals.length && <p className="text-xs text-slate-400">No approval items.</p>}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Role & Permission Management</h4>
            <div className="space-y-2 max-h-60 overflow-auto">
              {rolePermissions.map((item) => (
                <div key={item.role} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <p className="text-sm font-bold uppercase">{item.role}</p>
                  <p className="text-xs text-slate-400 mt-1">{(item.permissions || []).join(', ') || 'No permissions set'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Notification Control Center</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <input value={broadcastForm.title} onChange={(e) => setBroadcastForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className={controlFieldClass} style={whiteInputStyle} />
              <select value={broadcastForm.targetRoles} onChange={(e) => setBroadcastForm((p) => ({ ...p, targetRoles: e.target.value }))} className={controlFieldClass} style={whiteInputStyle}>
                <option value="all">All</option>
                <option value="student">Students</option>
                <option value="staff">Staff</option>
                <option value="hr">HR</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm((p) => ({ ...p, message: e.target.value }))} placeholder="Message" rows={3} className={`${controlFieldClass} mb-2`} style={whiteInputStyle} />
            <button onClick={handleSendBroadcastFromControl} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm">Send Broadcast</button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-4">Template Management</h4>
            <input value={templateForm.key} onChange={(e) => setTemplateForm((p) => ({ ...p, key: e.target.value }))} placeholder="Template key" className={`${controlFieldClass} mb-2`} style={whiteInputStyle} />
            <input value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Template name" className={`${controlFieldClass} mb-2`} style={whiteInputStyle} />
            <textarea value={templateForm.body} onChange={(e) => setTemplateForm((p) => ({ ...p, body: e.target.value }))} placeholder="Template body with placeholders like {{studentName}}" rows={3} className={`${controlFieldClass} mb-2`} style={whiteInputStyle} />
            <button onClick={handleSaveTemplateFromControl} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm">Save Template</button>
            <div className="mt-3 space-y-2 max-h-28 overflow-auto">
              {templates.map((template) => (
                <div key={template.key} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  {template.key} - {template.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-2">Data Governance</h4>
            <p className="text-sm">Duplicate users: <span className="font-black">{(governance.duplicateUserEmails || []).length}</span></p>
            <p className="text-sm">Recoverable items: <span className="font-black">{governance.recoverableItems || 0}</span></p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-2">Fraud / Risk Alerts</h4>
            <div className="space-y-2">
              {riskAlerts.length ? riskAlerts.map((risk, idx) => (
                <p key={`${risk.title}-${idx}`} className="text-sm">{risk.title}: <span className="text-slate-300">{risk.message}</span></p>
              )) : <p className="text-sm text-slate-400">No active risk alerts</p>}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="font-black mb-2">AI Admin Insights</h4>
            <div className="space-y-2">
              {aiInsights.map((line, idx) => <p key={`${line}-${idx}`} className="text-sm text-slate-200">{line}</p>)}
            </div>
          </div>
        </div>

        {controlLoading && <p className="text-sm text-slate-400">Loading control center data...</p>}
      </div>
    );
  };

  // ---------- LOGOUT MODAL ----------
  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]">
      <div className={`${isDarkTheme ? 'bg-[#05060b] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-6 w-full max-w-sm`}>
        <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
        <p className={`text-sm mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
          Are you sure you want to terminate this admin session?
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Yes, Logout"}
          </button>
          <button
            onClick={() => setShowLogoutModal(false)}
            disabled={isLoggingOut}
            className={`flex-1 py-2 rounded-xl font-bold disabled:opacity-60 ${isDarkTheme ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // ---------- ROOT JSX ----------
  const isDarkTheme = resolvedTheme === "dark";
  const rootClass =
    isDarkTheme
      ? "bg-gradient-to-br from-[#05060b] via-[#050816] to-black text-white"
      : "bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900";

  const modalContainerClass = isDarkTheme
    ? "bg-slate-900 rounded-3xl border border-white/10"
    : "bg-white rounded-3xl border border-slate-200";

  const modalHeaderClass = isDarkTheme
    ? "bg-gradient-to-b from-slate-900 to-slate-900/80 border-b border-white/10"
    : "bg-gradient-to-b from-slate-50 to-white border-b border-slate-200";

  const modalInputClass = isDarkTheme
    ? "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/60 disabled:text-white disabled:placeholder-white/60 focus:outline-none transition-all caret-white"
    : "w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none transition-all";

  const modalSecondaryButtonClass = isDarkTheme
    ? "flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-bold transition-all"
    : "flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 py-3 px-6 rounded-xl font-bold transition-all";

  return (
    <div
      className={`admin-dashboard admin-theme-${resolvedTheme} min-h-screen ${rootClass} font-sans selection:bg-indigo-500/30`}
      onClick={() => setShowThemeMenu(false)}
    >
      {/* Hamburger menu for mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-[100] p-2 bg-indigo-600 text-white rounded-xl shadow-lg lg:hidden"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Layers size={24} />
        </button>
      )}
      <Sidebar />

      {showLogoutModal && <LogoutModal />}

      <main
        className={`transition-all duration-300 ${
          isMobile ? '' : isSidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        <div className={`max-w-[1700px] mx-auto ${isMobile ? 'p-2' : 'p-6 lg:p-12'}`}>
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-12 gap-8'}`}>
            {/* Main Content - 8 columns */}
            <div className={`${isMobile ? '' : 'lg:col-span-8'} space-y-12`}>
              {/* Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(!isSidebarOpen)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Layers size={20} className="text-indigo-400" />
                    </button>
                    <span className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">
                      Security Cluster: 04
                    </span>
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter">
                    {t(menuItems.find(item => item.id === currentView)?.translationKey || currentView).toUpperCase()}
                  </h1>
                  <p className="text-slate-500 text-xs font-semibold tracking-widest">
                    CENTRAL ORCHESTRATION NODE · ADMIN PRIVILEGES ACTIVE
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Language Selector */}
                  <LanguageSelector currentColors={{ input: resolvedTheme === 'dark' ? "rgba(255,255,255,0.05)" : "#f1f5f9", border: resolvedTheme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", text: resolvedTheme === 'dark' ? "#ffffff" : "#0f172a" }} />
                  
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          isDarkTheme
                            ? 'border-[#05060b] bg-slate-800 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-900'
                        }`}
                      >
                        AD
                      </div>
                    ))}
                  </div>
                  <div className={`h-10 w-[1px] ${isDarkTheme ? 'bg-white/10' : 'bg-slate-300'}`} />
                  <button 
                    onClick={() => {
                      setProfileForm({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        avatar: user?.avatar || ''
                      });
                      setShowProfileModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"
                    title="Edit Profile"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setShowNotificationModal(true)}
                    className={`relative p-3 rounded-xl transition-all ${
                      resolvedTheme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Bell size={20} className={resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2" style={{ borderColor: resolvedTheme === 'dark' ? '#05060b' : '#ffffff' }} />
                    )}
                  </button>
                </div>
              </div>

          {/* Core Content Logic */}
          {currentView === "overview" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Telemetry Grid */}
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}> 
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4 hover:bg-white/8 transition-all">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">1,247</p>
                    <p className="text-[10px] font-black text-slate-500 tracking-widest">
                      USERS
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Active identities
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4 hover:bg-white/8 transition-all">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">89%</p>
                    <p className="text-[10px] font-black text-slate-500 tracking-widest">
                      GROWTH
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      30-day growth rate
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4 hover:bg-white/8 transition-all">
                  <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">148ms</p>
                    <p className="text-[10px] font-black text-slate-500 tracking-widest">
                      LATENCY
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Median response time
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4 hover:bg-white/8 transition-all">
                  <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
                    <Server size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">99.9%</p>
                    <p className="text-[10px] font-black text-slate-500 tracking-widest">
                      UPTIME
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      30-day availability
                    </p>
                  </div>
                </div>
              </div>

              {/* Extended Stats */}
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}> 
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-slate-500 tracking-widest mb-2">
                    REQUESTS/SEC
                  </p>
                  <p className="text-3xl font-black mb-2">
                    {systemStats.requestsPerSecond}
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: "62%" }}
                    />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-slate-500 tracking-widest mb-2">
                    ACTIVE CONNECTIONS
                  </p>
                  <p className="text-3xl font-black mb-2">
                    {systemStats.activeConnections}
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: "55%" }}
                    />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-slate-500 tracking-widest mb-2">
                    ERROR RATE
                  </p>
                  <p className="text-3xl font-black text-emerald-400 mb-2">
                    {systemStats.errorRate}
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: "5%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Role distribution */}
              <div className={`bg-white/5 border border-white/10 rounded-[2.5rem] ${isMobile ? 'p-4' : 'p-10'} overflow-hidden relative`}>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      DISTRIBUTION MAP
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-1">
                      <PieChart size={14} /> ROLE SEGMENTATION
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {mockUserBreakdown.map((user, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="font-black text-sm">
                            {user.role}
                          </span>
                          <span className="text-slate-500 font-bold text-xs">
                            {user.percentage}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${user.color}`}
                            style={{ width: `${user.percentage}%` }}
                          />
                        </div>
                        <p className="text-2xl font-black tracking-tighter">
                          {user.count}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Active {user.role.toLowerCase()} profiles
                          authenticated.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <Globe className="absolute -right-20 -top-20 w-80 h-80 text-white/[0.02]" />
              </div>

              {/* Recent Activity */}
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}> 
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <Clock className="text-indigo-400" /> RECENT ACTIVITY
                  </h3>
                  <div className="divide-y divide-white/5">
                    {recentActivity.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-purple-900/40 border border-white/10 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-black mb-6">ACTIVITY SUMMARY</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Login Events</span>
                      <span className="font-black text-blue-400">287</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Config Changes</span>
                      <span className="font-black text-orange-400">43</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Failed Attempts</span>
                      <span className="font-black text-red-400">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">API Calls</span>
                      <span className="font-black text-emerald-400">
                        5,243
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VideoCall and LiveStream removed for admin */}
            </div>
          )}

          {currentView === "control" && renderControlCenter()}

          {currentView === "profile" && renderProfile()}
          {currentView === "system" && renderConfig()}
          {currentView === "alerts" && renderAlerts()}
          {currentView === "servers" && renderServers()}

          {currentView === "users" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
                    <Users className="text-indigo-400" /> USER DIRECTORY
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Manage all system users and permissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', role: 'student', password: '' });
                    setShowUserModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                  <UserPlus size={20} /> Add User
                </button>
              </div>

              {/* Users Grid */}
              {dataLoading ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin mx-auto mb-4" size={48} />
                  <p className="text-slate-400">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <Users size={64} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400 mb-4">No users found</p>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: '', email: '', role: 'student', password: '' });
                      setShowUserModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Add First User
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((userData) => (
                    <div
                      key={userData._id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                            {userData.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{userData.name}</h4>
                            <p className="text-xs text-slate-400">{userData.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          userData.role === 'admin' ? 'bg-green-500/20 text-green-400' :
                          userData.role === 'hr' ? 'bg-orange-500/20 text-orange-400' :
                          userData.role === 'staff' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {userData.role?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(userData)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userData._id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold text-red-400 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <p className="text-sm text-blue-400 mb-1">Students</p>
                  <p className="text-2xl font-black text-white">
                    {users.filter(u => u.role === 'student').length}
                  </p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                  <p className="text-sm text-orange-400 mb-1">HR</p>
                  <p className="text-2xl font-black text-white">
                    {users.filter(u => u.role === 'hr').length}
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <p className="text-sm text-purple-400 mb-1">Staff</p>
                  <p className="text-2xl font-black text-white">
                    {users.filter(u => u.role === 'staff').length}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <p className="text-sm text-green-400 mb-1">Admin</p>
                  <p className="text-2xl font-black text-white">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentView === "analytics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
                  <BarChart2 className="text-indigo-400" /> DEEP ANALYTICS
                </h3>
                <p className="text-slate-500 text-sm">
                  Advanced metrics and performance analysis dashboard
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="font-black mb-4">TOP RESOURCES</h4>
                  <div className="space-y-3">
                    {[
                      {
                        path: "/api/users",
                        calls: "2,847 calls",
                        width: "85%",
                        color: "bg-blue-500",
                      },
                      {
                        path: "/api/analytics",
                        calls: "1,543 calls",
                        width: "62%",
                        color: "bg-indigo-500",
                      },
                      {
                        path: "/api/reports",
                        calls: "892 calls",
                        width: "42%",
                        color: "bg-emerald-500",
                      },
                    ].map((row) => (
                      <div key={row.path}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{row.path}</span>
                          <span className="font-black">{row.calls}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.color}`}
                            style={{ width: row.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="font-black mb-4">
                    RESPONSE TIME PERCENTILES
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">P50 (Median)</span>
                      <span className="font-black text-blue-400">45ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">P95</span>
                      <span className="font-black text-orange-400">156ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">P99</span>
                      <span className="font-black text-red-400">287ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">P999</span>
                      <span className="font-black text-red-500">1.2s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "logs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
                      <Terminal className="text-indigo-400" /> AUDIT LOGS
                    </h3>
                    <p className="text-slate-500 text-sm">
                      System events and user actions - Last 24 hours
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black">
                    <span className="px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      TOTAL: 7
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      SUCCESS: 3
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                      FAILURES: 1
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 max-h-[28rem] overflow-y-auto">
                <div className="font-mono text-xs text-slate-300 space-y-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <div className="text-emerald-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:21:45]</span>
                      ✓ User login successful: admin_primary
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                    <div className="text-blue-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:18:32]</span>
                      • Configuration updated: MFA_REQUIRED → false
                    </div>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <div className="text-red-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:15:12]</span>
                      ✗ Auth failed: john.doe@company.com (3 attempts)
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <div className="text-emerald-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:10:55]</span>
                      ✓ Database backup completed: 2.4GB
                    </div>
                  </div>
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
                    <div className="text-orange-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:08:22]</span>
                      ⚠ Memory threshold exceeded: 89%
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                    <div className="text-blue-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:05:10]</span>
                      • API key rotated: sk_prod_****
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <div className="text-emerald-400 leading-relaxed">
                      <span className="font-black mr-2">[2026-01-26 14:02:00]</span>
                      ✓ SSL certificate renewed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Section - Right Column (4 columns) */}
        <div className="lg:col-span-4">
          <ProfileSection 
            user={user} 
            onLogout={() => setShowLogoutModal(true)}
            isDark={resolvedTheme === 'dark'}
          />
        </div>
      </div>
    </div>
      </main>

      {/* USER CREATE/EDIT MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${modalContainerClass} max-w-2xl w-full shadow-2xl`}>
            {/* Header */}
            <div className={`${modalHeaderClass} p-8 flex justify-between items-center`}>
              <h3 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button 
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className={`p-2 rounded-lg transition-all ${isDarkTheme ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-5">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Name *</label>
                <input 
                  type="text" 
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="Full name"
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-indigo-500' : 'focus:border-indigo-500'}`}
                  style={{ color: isDarkTheme ? '#ffffff' : undefined }}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Email *</label>
                <input 
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="email@example.com"
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-indigo-500' : 'focus:border-indigo-500'}`}
                  style={{ color: isDarkTheme ? '#ffffff' : undefined }}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-indigo-500' : 'focus:border-indigo-500'}`}
                  style={{ color: isDarkTheme ? '#ffffff' : undefined }}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Password *</label>
                  <input 
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder="Enter password"
                    className={`${modalInputClass} ${isDarkTheme ? 'focus:border-indigo-500' : 'focus:border-indigo-500'}`}
                    style={{ color: isDarkTheme ? '#ffffff' : undefined }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className={`flex gap-4 pt-6 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  onClick={handleCreateUser}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className={modalSecondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${modalContainerClass} max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl`}>
            {/* Header */}
            <div className={`sticky top-0 ${modalHeaderClass} p-8 flex justify-between items-center backdrop-blur-xl`}>
              <h3 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className={`p-2 rounded-lg transition-all ${isDarkTheme ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-5">
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                  {profileError}
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Full Name *</label>
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  placeholder="Your full name"
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-blue-500' : 'focus:border-blue-500'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Phone</label>
                <input 
                  type="tel" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  placeholder="Your phone number"
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-blue-500' : 'focus:border-blue-500'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Avatar URL</label>
                <input 
                  type="text" 
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                  placeholder="Avatar image URL"
                  className={`${modalInputClass} ${isDarkTheme ? 'focus:border-blue-500' : 'focus:border-blue-500'}`}
                />
              </div>

              {/* Actions */}
              <div className={`flex gap-4 pt-6 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  onClick={handleProfileSubmit}
                  disabled={profileSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  {profileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className={modalSecondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      <NotificationModal 
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        theme={resolvedTheme}
      />

      {/* EMAIL MODAL */}
      <EmailModal 
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        theme={resolvedTheme}
      />
    </div>
  );
};

export default AdminDashboard;
