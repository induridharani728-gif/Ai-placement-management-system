/* ===============================
   OFFER APIs
================================ */
export const offerAPI = {
  create: (data) => api.post("/offers", data),
  getAll: () => api.get("/offers"),
  getById: (id) => api.get(`/offers/${id}`),
  update: (id, data) => api.put(`/offers/${id}`, data),
  send: (id, data) => api.post(`/offers/${id}/send`, data),
  track: (id) => api.get(`/offers/${id}/track`),
};
/* ===============================
   INTERVIEW APIs
================================ */
export const interviewAPI = {
  schedule: (data) => api.post("/interviews", data),
  getAll: () => api.get("/interviews"),
  getById: (id) => api.get(`/interviews/${id}`),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  updateRoom: (id, data) => api.patch(`/interviews/${id}/room`, data),
};
import axios from "axios";
import { API_BASE_URL } from "../config/apiBase";

const hrRefreshChannel = typeof window !== 'undefined' && typeof window.BroadcastChannel === 'function'
  ? new window.BroadcastChannel('hr-dashboard-refresh')
  : null;

/* ===============================
   Axios instance
================================ */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/* ===============================
   Attach token automatically
================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Dispatch a global refresh event for HR dashboard when mutation responses complete
api.interceptors.response.use(
  (response) => {
    try {
      const method = (response.config && response.config.method || '').toLowerCase();
      if (['post', 'put', 'patch', 'delete'].includes(method)) {
        if (typeof window !== 'undefined' && window?.CustomEvent) {
          window.dispatchEvent(new CustomEvent('hr:refresh'));
        }
        if (hrRefreshChannel) {
          hrRefreshChannel.postMessage({ type: 'hr:refresh' });
        }
      }
    } catch (e) {
      // swallow errors to avoid breaking responses
    }
    return response;
  },
  (error) => {
    try {
      const cfg = error?.config;
      const method = (cfg && cfg.method || '').toLowerCase();
      if (['post', 'put', 'patch', 'delete'].includes(method)) {
        if (typeof window !== 'undefined' && window?.CustomEvent) {
          window.dispatchEvent(new CustomEvent('hr:refresh'));
        }
        if (hrRefreshChannel) {
          hrRefreshChannel.postMessage({ type: 'hr:refresh' });
        }
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(error);
  }
);

/* ===============================
   AUTH APIs (THIS IS THE KEY)
================================ */
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  initiateRegister: (data) => api.post("/auth/register/initiate", data),
  verifyRegisterOtp: (data) => api.post("/auth/register/verify-otp", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  checkAvailability: (params) => api.get("/auth/check-availability", { params }),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => api.post("/auth/logout"),
};

/* ===============================
   OAUTH APIs (Google, LinkedIn, GitHub)
================================ */
export const oauthAPI = {
  googleLogin: (data) => api.post("/oauth/google", data),
  linkedinLogin: (data) => api.post("/oauth/linkedin", data),
  githubLogin: (data) => api.post("/oauth/github", data),
  confirmRegister: (data) => {
    const provider = (data?.provider || "").toLowerCase();
    if (provider === "google") return api.post("/oauth/google", data);
    if (provider === "linkedin") return api.post("/oauth/linkedin", data);
    if (provider === "github") return api.post("/oauth/github", data);
    return Promise.reject(new Error("Unsupported OAuth provider"));
  },
  verifyOtp: (data) => api.post("/oauth/verify-otp", data),
};

/* ===============================
   STUDENT APIs
================================ */
export const studentAPI = {
  getAll: () => api.get("/students"),
  getCsv: () => api.get("/students/csv"),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, data) => api.put(`/students/${id}`, data),
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data) => api.put("/students/profile", data),
  upload: (formData) =>
    api.post("/students/upload-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ===============================
   JOB APIs
================================ */
export const jobAPI = {
  getAll: () => api.get("/jobs"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  createJob: (data) => api.post("/jobs", data), // alias for dashboard compatibility
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  clone: (id) => api.post(`/jobs/${id}/clone`),
};

/* ===============================
   APPLICATIONS APIs
================================ */
export const applicationsAPI = {
  getAll: () => api.get("/applications"),
  getById: (id) => api.get(`/applications/${id}`),
  getMyApplications: () => api.get("/applications/my-applications"),
  updateMyApplication: (id, data) => api.put(`/applications/my-applications/${id}`, data),
  withdrawMyApplication: (id) => api.patch(`/applications/my-applications/${id}/withdraw`),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  create: (data) => api.post("/applications", data),
  updateStatus: (id, data) => api.put(`/applications/${id}`, data),
  bulkUpdateStatus: (data) => api.post("/applications/bulk-update-status", data),
};

/* ===============================
   JOB REQUISITIONS APIs
================================ */
export const jobRequisitionsAPI = {
  getAll: () => api.get("/job-requisitions"),
  getById: (id) => api.get(`/job-requisitions/${id}`),
  create: (data) => api.post("/job-requisitions", data),
  update: (id, data) => api.put(`/job-requisitions/${id}`, data),
  delete: (id) => api.delete(`/job-requisitions/${id}`),
  approve: (id) => api.post(`/job-requisitions/${id}/approve`),
  reject: (id) => api.post(`/job-requisitions/${id}/reject`),
};

/* ===============================
   STATS APIs (Dashboard Data)
================================ */
export const statsAPI = {
  // Role-specific stats
  getStudentStats: () => api.get("/stats/student/stats"),
  getStudentInsights: () => api.get("/stats/student/insights"),
  getAdminStats: () => api.get("/stats/admin/stats"),
  getHRStats: () => api.get("/stats/hr/stats"),
  getHRSettings: () => api.get("/stats/hr/settings"),
  updateHRSettings: (data) => api.put("/stats/hr/settings", data),
  getStaffStats: () => api.get("/stats/staff/stats"),
  
  // Specific data endpoints
  getSkills: () => api.get("/stats/skills"),
  getCertifications: () => api.get("/stats/certifications"),
  getApplications: () => api.get("/stats/applications"),
  getInterviews: () => api.get("/stats/interviews"),
  getProfile: () => api.get("/stats/profile"),
  updateProfile: (data) => api.put("/stats/profile", data),
  getClasses: () => api.get("/stats/classes"),
  getCompanies: () => api.get("/stats/companies"),
  getAnalytics: () => api.get("/stats/analytics"),
};

/* ===============================
   ADMIN APIs
================================ */
export const adminAPI = {
  // User management
  getAllUsers: () => api.get("/admin/users"),
  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // System monitoring
  getSystemStatus: () => api.get("/admin/system-status"),
  getAnalytics: () => api.get("/admin/analytics"),
  getAuditLogs: () => api.get("/admin/audit-logs"),
  getAlerts: () => api.get("/admin/alerts"),
  
  // Configuration
  updateConfig: (data) => api.put("/admin/config", data),

  // Control Center
  getControlCenter: () => api.get('/admin/control-center'),
  updateRolePermissions: (rolePermissions) => api.put('/admin/role-permissions', { rolePermissions }),
  createApproval: (data) => api.post('/admin/approvals', data),
  resolveApproval: (id, data) => api.patch(`/admin/approvals/${id}`, data),
  updateFeatureToggles: (data) => api.put('/admin/feature-toggles', data),
  upsertTemplate: (data) => api.post('/admin/templates', data),
  deleteTemplate: (key) => api.delete(`/admin/templates/${encodeURIComponent(key)}`),
  triggerBackup: () => api.post('/admin/backup/trigger'),
  sendBroadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
};

/* ===============================
   PLACEMENTS APIs
================================ */
export const placementsAPI = {
  getAll: (params) => api.get("/placements", { params }),
  create: (data) => api.post("/placements", data),
  update: (id, data) => api.put(`/placements/${id}`, data),
  remove: (id) => api.delete(`/placements/${id}`)
};

/* ===============================
   ONBOARDING APIs
================================ */
export const onboardingAPI = {
  getAll: () => api.get('/onboarding'),
  create: (data) => api.post('/onboarding', data),
  update: (id, data) => api.put(`/onboarding/${id}`, data),
  remove: (id) => api.delete(`/onboarding/${id}`)
};

/* ===============================
   EXAMS APIs
================================ */
export const examsAPI = {
  getAll: () => api.get("/exams"),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post("/exams", data),
  submit: (id, data) => api.post(`/exams/${id}/submit`, data),
  getMySubmissions: () => api.get("/exams/submissions/my"),
  getAllSubmissions: () => api.get("/exams/submissions/all"),
  reviewSubmission: (id, data) => api.patch(`/exams/submissions/${id}/review`, data)
};

/* ===============================
   RESUME ANALYSIS APIs (ATS Scoring)
================================ */
export const resumeAnalysisAPI = {
  analyze: (data) => api.post("/resume-analysis/analyze", data),
  batchAnalyze: (data) => api.post("/resume-analysis/batch-analyze", data),
  getAnalysis: (studentId) => api.get(`/resume-analysis/${studentId}`),
};

/* ===============================
   AI APIs
================================ */
export const aiAPI = {
  chat: (data) => api.post("/ai/chat", data),
  resumeMatch: (data) => api.post("/ai/resume-match", data),
  interviewQuestions: (data) => api.post("/ai/interview-questions", data),
  readinessPlan: (data) => api.post("/ai/readiness-plan", data),
  outreachDraft: (data) => api.post("/ai/outreach-draft", data),
  riskPrediction: (data) => api.post("/ai/risk-prediction", data),
  jdParse: (data) => api.post("/ai/jd-parse", data),
  applicationReview: (data) => api.post("/ai/application-review", data),
  analyticsNarrative: (data) => api.post("/ai/analytics-narrative", data),
  knowledgeBase: (data) => api.post("/ai/knowledge-base", data),
};

/* ===============================
   DETAILED APPLICATIONS APIs
================================ */
export const detailedApplicationsAPI = {
  save: (data) => api.post("/detailed-applications", data),
  getMyForm: () => api.get("/detailed-applications/my-form"),
  getAll: () => api.get("/detailed-applications/all"),
  getByStudent: (studentId) => api.get(`/detailed-applications/${studentId}`),
  getByEmail: (email) => api.get(`/detailed-applications/by-email/${encodeURIComponent(email)}`),
};

/* ===============================
   EMAIL APIs
================================ */
export const emailAPI = {
  send: (data) => api.post("/emails/send", data),
  sendToStudent: (data) => api.post("/emails/send-to-student", data),
  sendBulk: (data) => api.post("/emails/send-bulk", data),
  getInbox: () => api.get("/emails/inbox"),
  getSent: () => api.get("/emails/sent"),
  markAsRead: (emailId) => api.put(`/emails/${emailId}/read`, {}),
  getAllStudents: () => api.get("/emails/students/all"),
};

/* ===============================
   PLACEMENT STATISTICS APIs (Kaggle Data)
================================ */
export const placementStatsAPI = {
  getAll: (params) => api.get("/placement-stats/all", { params }),
  getCompanyStats: (company) => api.get(`/placement-stats/company/${company}`),
  getTopCompanies: (limit = 10) => api.get("/placement-stats/top-companies", { params: { limit } }),
  getBranchStats: () => api.get("/placement-stats/branch-stats"),
  loadKaggleData: () => api.post("/placement-stats/load-kaggle"),
};

/* ===============================
   NOTIFICATIONS APIs
================================ */
export const notificationsAPI = {
  getNotifications: (unreadOnly = false, limit = 50) => api.get("/notifications", { params: { unreadOnly, limit } }),
  getAllNotificationsForHR: (limit = 100, unreadOnly = false, type = null, source = null) => 
    api.get("/notifications/all-notifications", { params: { limit, unreadOnly, type, source } }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  sendBulk: (data) => api.post("/notifications", data),
  sendDirect: (data) => api.post('/notifications/direct', data),
};

/* ===============================
   EXPORT DEFAULT axios instance
================================ */
export default api;
