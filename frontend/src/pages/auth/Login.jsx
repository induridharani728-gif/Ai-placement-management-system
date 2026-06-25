import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI, oauthAPI } from "../../services/api";
import { useLanguage, LanguageSelector } from "../../contexts/LanguageContext";
import { BACKEND_BASE_URL } from "../../config/apiBase";
import {
  Sun,
  Moon,
  Phone,
  Info,
  Briefcase,
  ChevronDown,
  X,
  CheckCircle,
  Mail,
  MapPin,
  Users,
  Award,
  Target,
  Clock,
} from "lucide-react";

const backgrounds = {
  student: "bg-gradient-to-br from-cyan-700 to-sky-900",
  staff: "bg-gradient-to-br from-emerald-700 to-lime-900",
  hr: "bg-gradient-to-br from-rose-700 to-orange-900",
  admin: "bg-gradient-to-br from-amber-700 to-red-900",
  recruiter: "bg-gradient-to-br from-indigo-700 to-violet-900",
};

const loginBoxColors = {
  student: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-800/20",
  staff: "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-emerald-800/20",
  hr: "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-rose-800/20",
  admin: "bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-purple-800/20",
  recruiter: "bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-800/20",
};

const roleImages = {
  student: "https://img.freepik.com/premium-photo/graduation-boy-girl-class-room_1036975-32053.jpg",
  staff: "https://img.freepik.com/premium-photo/portrait-professional-workers-office-attire-isolated-white-background-3d-cartoon-animation_36897-54576.jpg?w=1060",
  hr: "https://img.freepik.com/premium-photo/business-presentation-3d-realistic-two-employees-crochets-doll-figure-is-doing-presentation_565941-3754.jpg?w=996",
  admin: "https://img.freepik.com/premium-psd/businessman-with-documents-pointing-glasses-3d-isolated-transparent-background-png-psd_1130573-121202.jpg",
  recruiter: "https://img.freepik.com/premium-photo/3d-realistic-rendering-human-resources-management-concept-hr-recruiter-selecting-best-candidates_1020697-12345.jpg"
};

const roleConfig = {
  student: {
    name: "Candidate",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.45)] border-cyan-500/50",
    textColorDark: "text-cyan-400",
    textColorLight: "text-cyan-600",
    focusBorder: "focus:border-cyan-500",
    buttonBg: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/20",
    loginQuote: {
      heading: "WELCOME BACK!",
      text: "Your dream career is just a login away. Connect with top employers and unlock endless possibilities.",
    },
    registerQuote: {
      heading: "JOIN US TODAY!",
      text: "Take the first step toward your professional future. Build your profile and get noticed by global brands.",
    }
  },
  staff: {
    name: "Staff",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.45)] border-emerald-500/50",
    textColorDark: "text-emerald-400",
    textColorLight: "text-emerald-600",
    focusBorder: "focus:border-emerald-500",
    buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/20",
    loginQuote: {
      heading: "WELCOME BACK, MENTOR!",
      text: "Guiding students to success requires vision and dedication. Thank you for shaping the leaders of tomorrow.",
    },
    registerQuote: {
      heading: "BECOME A SHAPER!",
      text: "Register to manage departmental drives, evaluate student progress, and drive career placements forward.",
    }
  },
  hr: {
    name: "HR",
    gradient: "from-rose-500 to-orange-600",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.45)] border-rose-500/50",
    textColorDark: "text-rose-400",
    textColorLight: "text-rose-600",
    focusBorder: "focus:border-rose-500",
    buttonBg: "bg-gradient-to-r from-rose-500 to-orange-600 hover:shadow-rose-500/20",
    loginQuote: {
      heading: "WELCOME BACK, PARTNER!",
      text: "Exceptional teams are built here. Log in to find the perfect candidates for your organization's future.",
    },
    registerQuote: {
      heading: "BUILD YOUR DREAM TEAM!",
      text: "Partner with us to gain exclusive access to a pool of highly skilled candidates ready to make an impact.",
    }
  },
  admin: {
    name: "Admin",
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.55)] border-orange-500/50",
    textColorDark: "text-orange-400",
    textColorLight: "text-orange-600",
    focusBorder: "focus:border-orange-500",
    buttonBg: "bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/20",
    loginQuote: {
      heading: "SYSTEM CONTROL",
      text: "Oversee operations, manage integrations, and keep the placement machine running smoothly and securely.",
    },
    registerQuote: {
      heading: "ADMIN REGISTRATION",
      text: "Create an administrator account to configure system properties, manage databases, and handle settings.",
    }
  },
  recruiter: {
    name: "Recruiter",
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-[0_0_40px_rgba(99,102,241,0.45)] border-indigo-500/50",
    textColorDark: "text-indigo-400",
    textColorLight: "text-indigo-600",
    focusBorder: "focus:border-indigo-500",
    buttonBg: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-indigo-500/20",
    loginQuote: {
      heading: "WELCOME BACK, PARTNER!",
      text: "Exceptional teams are built here. Log in to find the perfect candidates for your organization's future.",
    },
    registerQuote: {
      heading: "BUILD YOUR DREAM TEAM!",
      text: "Partner with us to gain exclusive access to a pool of highly skilled candidates ready to make an impact.",
    }
  }
};

export default function Login() {
  const { t } = useLanguage();
  const backendBaseUrl = BACKEND_BASE_URL;
  const [role, setRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    return ["student", "staff", "hr", "admin"].includes(roleParam) ? roleParam : "student";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [activeModal, setActiveModal] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [moreSection, setMoreSection] = useState("overview");
  const [pendingOAuth, setPendingOAuth] = useState(null);
  const [otpModal, setOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const highContrastInputStyle = darkMode
    ? {
        WebkitTextFillColor: "#ffffff",
        WebkitBoxShadow: "0 0 0 1000px #0b0f19 inset",
        caretColor: "#ffffff",
        color: "#ffffff",
      }
    : {
        WebkitTextFillColor: "#0f172a",
        WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
        caretColor: "#0f172a",
        color: "#0f172a",
      };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    const oauthError = params.get("oauth_error");
    const oauthErrorDetail = params.get("oauth_error_detail");

    if (oauthError) {
      const oauthErrorMessages = {
        missing_code: "Google did not return an authorization code.",
        token_exchange_failed: "Google token exchange failed. Check OAuth client secret and redirect URI.",
        missing_access_token: "Google token response did not include an access token.",
        profile_fetch_failed: "Unable to fetch Google profile details.",
        invalid_profile: "Google profile is missing required fields (email or id).",
        google_callback_failed: "Google callback failed on server."
      };

      const friendlyMessage = oauthErrorMessages[oauthError] || `Google sign-in failed (${oauthError}).`;
      const detailMessage = oauthErrorDetail ? ` Details: ${oauthErrorDetail}` : "";
      setErrorMsg(`${friendlyMessage}${detailMessage}`);
      const cleanedUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanedUrl);
      return;
    }

    if (token && userParam) {
      try {
        const userData = JSON.parse(userParam);
        login(userData, token);
        const cleanedUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanedUrl);
        navigate(`/${userData.role}`, { replace: true });
      } catch {
        setErrorMsg("Unable to complete OAuth login. Please try again.");
      }
    }
  }, [login, navigate]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password, role });
      if (response.data.success) {
        login(response.data.user, response.data.token, { rememberMe });
        setErrorMsg("");
        navigate(`/${response.data.user.role}`, { replace: true });
      } else {
        setErrorMsg(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    const frontendOrigin = encodeURIComponent(window.location.origin);
    let url = '';
    if (provider === "Google") {
      url = `${backendBaseUrl}/api/auth/google?flow=login&frontend=${frontendOrigin}`;
    } else if (provider === "LinkedIn") {
      url = `${backendBaseUrl}/api/auth/linkedin?flow=login&frontend=${frontendOrigin}`;
    } else if (provider === "GitHub") {
      url = `${backendBaseUrl}/api/auth/github?flow=login&frontend=${frontendOrigin}`;
    }
    window.location.href = url;
  };

  const openForgotModal = () => {
    setForgotModal(true);
    setForgotStep("request");
    setForgotEmail(email);
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotMessage("");
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const response = await authAPI.forgotPassword({ email: forgotEmail });
      if (response.data.success) {
        setForgotStep("reset");
        const otpInfo = response.data.devOtp ? ` OTP: ${response.data.devOtp}` : "";
        setForgotMessage(`${response.data.message || "OTP sent to your email."}${otpInfo}`);
      } else {
        setForgotMessage(response.data.message || "Unable to send OTP.");
      }
    } catch (error) {
      setForgotMessage(error.response?.data?.message || "Unable to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setForgotMessage("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const response = await authAPI.resetPassword({
        email: forgotEmail,
        otp: resetOtp,
        newPassword,
      });
      if (response.data.success) {
        setForgotModal(false);
        setPassword("");
        setErrorMsg("Password reset successful. Please login with the new password.");
      } else {
        setForgotMessage(response.data.message || "Unable to reset password.");
      }
    } catch (error) {
      setForgotMessage(error.response?.data?.message || "Unable to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle OAuth login confirmation (after redirect/callback)
  const confirmOAuthLogin = async (userData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Call backend to trigger OTP (simulate OAuth callback)
      let response;
      if (userData.provider === 'Google') {
        response = await oauthAPI.googleLogin(userData);
      } else if (userData.provider === 'LinkedIn') {
        response = await oauthAPI.linkedinLogin(userData);
      } else if (userData.provider === 'GitHub') {
        response = await oauthAPI.githubLogin(userData);
      }
      if (response.data.otpRequired) {
        setOtpEmail(userData.email);
        setOtpModal(true);
        setPendingOAuth(null);
      } else if (response.data.success && response.data.token) {
        login(response.data.user, response.data.token);
        setPendingOAuth(null);
        navigate(`/${response.data.user.role}`, { replace: true });
      } else {
        setErrorMsg(response.data.message || "OAuth login failed. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || "OAuth login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    try {
      const response = await oauthAPI.verifyOtp({ email: otpEmail, otp: otpInput });
      if (response.data.success && response.data.token) {
        login(response.data.user, response.data.token);
        setOtpModal(false);
        setOtpInput("");
        setOtpEmail("");
        navigate(`/${response.data.user.role}`, { replace: true });
      } else {
        setOtpError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || error.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const InfoModal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all max-h-[80vh] overflow-y-auto ${
          darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div
          className={`p-6 flex justify-between items-center border-b sticky top-0 ${
            darkMode ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-white"
          }`}
        >
          <h3 className="text-xl font-bold uppercase tracking-wider">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* 3D ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-b from-[#07111f] via-[#0d1b2a] to-[#02060d]"
              : "bg-gradient-to-b from-white via-gray-100 to-gray-200"
          }`}
        />

        <div
          className="absolute inset-0 mix-blend-soft-light opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 3px)",
            animation: "scanline 6s linear infinite",
          }}
        />

        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[120%] perspective-[1200px]">
          <div
            className="absolute inset-0 origin-top bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0,rgba(0,0,0,0.9)_70%)]"
            style={{
              transform:
                "rotateX(70deg) translateY(10%) translateZ(0) skewX(-5deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148,163,184,0.35) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148,163,184,0.35) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              transform:
                "rotateX(72deg) translateY(-10%) translateZ(0) skewX(-8deg)",
              animation: "gridMove 14s linear infinite",
            }}
          />
          <div
            className={`absolute inset-0 mix-blend-screen opacity-30 ${backgrounds[role]}`}
            style={{
              transform:
                "rotateX(72deg) translateY(-10%) translateZ(0) skewX(-8deg)",
            }}
          />
        </div>

        <div
          className={`absolute w-[700px] h-[700px] rounded-full opacity-25 blur-[140px] mix-blend-screen ${backgrounds[role]}`}
          style={{
            left: mousePos.x - 350,
            top: mousePos.y - 350,
            transition: "left 0.12s ease-out, top 0.12s ease-out",
          }}
        />

        <div
          className="absolute w-40 h-40 border-2 border-cyan-400/60 rounded-3xl shadow-[0_0_40px_rgba(45,212,191,0.6)]"
          style={{
            top: "18%",
            left: "12%",
            transformOrigin: "center",
            animation: "floatCube 9s ease-in-out infinite",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent" />
        </div>

        <div
          className="absolute w-32 h-32 border-2 border-fuchsia-400/60 rounded-3xl shadow-[0_0_40px_rgba(244,114,182,0.6)]"
          style={{
            top: "26%",
            right: "14%",
            animation: "floatCube 11s ease-in-out infinite reverse",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-fuchsia-500/20 via-transparent to-transparent" />
        </div>

        <div
          className="absolute w-52 h-52 border border-blue-400/40 rounded-[2.5rem] shadow-[0_0_40px_rgba(59,130,246,0.5)]"
          style={{
            bottom: "12%",
            left: "22%",
            animation: "tiltCard 13s ease-in-out infinite",
            transformOrigin: "center",
          }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-blue-500/15 via-transparent to-sky-400/10" />
        </div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 22%, rgba(34,197,94,0.16) 0, transparent 45%), radial-gradient(circle at 82% 12%, rgba(14,165,233,0.14) 0, transparent 50%), radial-gradient(circle at 52% 82%, rgba(251,191,36,0.12) 0, transparent 50%)",
            opacity: 0.45,
            animation: "parallaxDrift 18s ease-in-out infinite alternate",
          }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 0 80px; }
          }
          @keyframes scanline {
            0% { transform: translateY(-10px); }
            100% { transform: translateY(10px); }
          }
          @keyframes floatCube {
            0% { transform: translate3d(0, 0, 0) rotateX(18deg) rotateY(-22deg); }
            50% { transform: translate3d(10px, -25px, 40px) rotateX(28deg) rotateY(-12deg); }
            100% { transform: translate3d(-10px, 5px, 0) rotateX(18deg) rotateY(-22deg); }
          }
          @keyframes tiltCard {
            0% { transform: rotateX(18deg) rotateY(18deg) translate3d(0,0,0); }
            50% { transform: rotateX(24deg) rotateY(-12deg) translate3d(10px,-18px,30px); }
            100% { transform: rotateX(18deg) rotateY(18deg) translate3d(0,0,0); }
          }
          @keyframes parallaxDrift {
            0% { transform: translate3d(-20px, 10px, 0) scale(1); }
            50% { transform: translate3d(10px, -10px, 0) scale(1.05); }
            100% { transform: translate3d(20px, 0, 0) scale(1); }
          }
        `,
        }}
      />

      {/* MODALS */}
      {activeModal === "about" && (
        <InfoModal
          title="About Generative AI Placement System"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                Our Mission
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Generative AI Placement System is dedicated to bridging the gap between talented students and leading employers. We empower institutions with cutting-edge placement management solutions powered by AI that drive success and career growth.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Award size={20} className="text-emerald-600" />
                Key Features
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  Real-time job posting and application tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  Advanced student profile management and analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  Recruiter dashboard with comprehensive hiring tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  Placement statistics and performance insights
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users size={20} className="text-rose-600" />
                Our Impact
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Successfully placed over 5,000+ students across 500+ leading organizations with a 94% placement rate in 2025.
              </p>
            </div>
          </div>
        </InfoModal>
      )}

      {activeModal === "placements" && (
        <InfoModal
          title="Placement Records"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-700 dark:text-yellow-300 drop-shadow-lg">
                  Total Placements
                </h5>
                <p className="text-3xl font-black text-blue-700 dark:text-yellow-300 drop-shadow-lg mt-2">5,000+</p>
              </div>
              <div className="bg-emerald-50 dark:bg-slate-700 p-4 rounded-lg">
                <h5 className="font-semibold text-emerald-700 dark:text-yellow-300 drop-shadow-lg">
                  Success Rate
                </h5>
                <p className="text-3xl font-black text-emerald-700 dark:text-yellow-300 drop-shadow-lg mt-2">94%</p>
              </div>
              <div className="bg-rose-50 dark:bg-slate-700 p-4 rounded-lg">
                <h5 className="font-semibold text-rose-700 dark:text-yellow-300 drop-shadow-lg">
                  Partner Companies
                </h5>
                <p className="text-3xl font-black text-rose-700 dark:text-yellow-300 drop-shadow-lg mt-2">500+</p>
              </div>
              <div className="bg-purple-50 dark:bg-slate-700 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-700 dark:text-yellow-300 drop-shadow-lg">
                  Avg. Package
                </h5>
                <p className="text-3xl font-black text-purple-700 dark:text-yellow-300 drop-shadow-lg mt-2">8.5 LPA</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-blue-700 dark:text-yellow-300 drop-shadow-lg">
                Top Recruiting Companies
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 Google
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 Microsoft
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 Amazon
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 Flipkart
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 Accenture
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-yellow-300 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded drop-shadow-lg">
                  🔹 TCS
                </span>
              </div>
            </div>
          </div>
        </InfoModal>
      )}

      {activeModal === "contact" && (
        <InfoModal
          title="Contact Support"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Phone className="text-blue-600 mt-1" size={24} />
              <div>
                <h5 className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>Phone Support</h5>
                <p className={darkMode ? "text-slate-200" : "text-slate-700"}>
                  +91-6301231575 <br /> Available: Mon-Fri, 9 AM - 6 PM IST
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="text-emerald-600 mt-1" size={24} />
              <div>
                <h5 className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>Email Support</h5>
                <p className={darkMode ? "text-slate-200" : "text-slate-700"}>
                  vamsivalluri52@gmail.com <br /> Response time: Within 2 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-rose-600 mt-1" size={24} />
              <div>
                <h5 className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>Office Location</h5>
                <p className={darkMode ? "text-slate-200" : "text-slate-700"}>
                  Generative AI Placement System HQ <br /> Vāghodia, Gujarat, India - 390019
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-700/50 border-slate-600" : "bg-blue-50 border-blue-200"}`}>
              <h5 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? "text-white" : "text-blue-700"}`}>
                <Clock size={18} className="text-blue-600" />
                Business Hours
              </h5>
              <p className={`text-sm ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                Monday - Friday: 9:00 AM - 6:00 PM IST <br /> Saturday:
                10:00 AM - 4:00 PM IST <br /> Sunday: Closed
              </p>
            </div>
          </div>
        </InfoModal>
      )}

      {activeModal === "more" && (
        <InfoModal
          title="More Information"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMoreSection("overview")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  moreSection === "overview"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-yellow-200"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setMoreSection("success")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  moreSection === "success"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-yellow-200"
                }`}
              >
                Success Stories
              </button>
              <button
                type="button"
                onClick={() => setMoreSection("recruiters")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  moreSection === "recruiters"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-yellow-200"
                }`}
              >
                Recruiters
              </button>
              <button
                type="button"
                onClick={() => setMoreSection("privacy")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  moreSection === "privacy"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-yellow-200"
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {moreSection === "overview" && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-yellow-200">Platform Highlights</h4>
                <p className="text-sm text-gray-700 dark:text-yellow-100">
                  The platform supports end-to-end placement workflows, including job posting, profile screening,
                  interview scheduling, and offer tracking for students, staff, HR, and admin users.
                </p>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-yellow-100">
                  <li>• AI-assisted profile analysis and skill insights</li>
                  <li>• Real-time application pipeline visibility</li>
                  <li>• Role-based dashboards with actionable metrics</li>
                </ul>
              </div>
            )}

            {moreSection === "success" && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-yellow-200">Recent Success Stories</h4>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-800 dark:text-yellow-100">"Secured a software role in my first interview cycle."</p>
                  <p className="text-sm text-gray-600 dark:text-yellow-100">- Rahul Sharma, CSE 2025</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4">
                  <p className="font-semibold text-gray-800 dark:text-yellow-100">"The mock interview flow helped me crack technical rounds."</p>
                  <p className="text-sm text-gray-600 dark:text-yellow-100">- Priya Patel, ECE 2024</p>
                </div>
                <div className="border-l-4 border-rose-500 pl-4">
                  <p className="font-semibold text-gray-800 dark:text-yellow-100">"I received multiple offers and picked the best fit."</p>
                  <p className="text-sm text-gray-600 dark:text-yellow-100">- Arjun Singh, IT 2025</p>
                </div>
              </div>
            )}

            {moreSection === "recruiters" && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-yellow-200">Recruiter Network</h4>
                <p className="text-sm text-gray-700 dark:text-yellow-100">
                  Hiring partners include product companies, service organizations, and startups across software,
                  analytics, consulting, and core engineering roles.
                </p>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-yellow-100">
                  <li>• 500+ active recruiters with verified openings</li>
                  <li>• Structured hiring pipelines for campus drives</li>
                  <li>• Dedicated HR coordination for interview slots and offers</li>
                </ul>
              </div>
            )}

            {moreSection === "privacy" && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-yellow-200">Privacy & Data Use</h4>
                <p className="text-sm text-gray-700 dark:text-yellow-100">
                  Personal data is used only for placement operations, candidate communication, and reporting.
                  Access is role-restricted and protected through secure authentication controls.
                </p>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-yellow-100">
                  <li>• No unauthorized sharing of candidate information</li>
                  <li>• Encrypted credential handling and protected sessions</li>
                  <li>• Audit-friendly logs for critical recruitment actions</li>
                </ul>
              </div>
            )}
          </div>
        </InfoModal>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav
        className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${
          darkMode
            ? "bg-slate-900/80 border-slate-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/009/634/721/non_2x/vrd-letter-logo-design-with-polygon-shape-vrd-polygon-and-cube-shape-logo-design-vrd-hexagon-logo-template-white-and-black-colors-vrd-monogram-business-and-real-estate-logo-vector.jpg"
              alt="VRD logo"
              className="w-9 h-9 rounded-md border border-white/20 object-cover"
            />
            <span className="font-bold tracking-tight text-xl">
              GenAI Placement
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveModal("about")}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Info size={16} /> {t('ourMission') || 'About'}
            </button>
            <button
              onClick={() => setActiveModal("placements")}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Briefcase size={16} /> {t('totalPlacements') || 'Placements'}
            </button>
            <button
              onClick={() => setActiveModal("contact")}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Phone size={16} /> {t('contactSupport') || 'Contact'}
            </button>
            <div className="group relative cursor-pointer flex items-center gap-1 text-slate-800 dark:text-slate-100">
              <span className="font-bold text-blue-700 dark:text-yellow-300 drop-shadow-lg">More</span> <ChevronDown size={14} />
              <div
                className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl border opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setMoreSection("overview");
                      setActiveModal("more");
                    }}
                    className="w-full text-left px-4 py-2 text-white dark:text-blue-300 font-bold hover:bg-blue-600 dark:hover:bg-blue-400 rounded-lg" style={{textShadow:'0 1px 4px #000'}}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreSection("success");
                      setActiveModal("more");
                    }}
                    className="w-full text-left px-4 py-2 text-white dark:text-blue-300 font-bold hover:bg-blue-600 dark:hover:bg-blue-400 rounded-lg" style={{textShadow:'0 1px 4px #000'}}
                  >
                    Success Stories
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreSection("recruiters");
                      setActiveModal("more");
                    }}
                    className="w-full text-left px-4 py-2 text-white dark:text-blue-300 font-bold hover:bg-blue-600 dark:hover:bg-blue-400 rounded-lg" style={{textShadow:'0 1px 4px #000'}}
                  >
                    Recruiters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreSection("privacy");
                      setActiveModal("more");
                    }}
                    className="w-full text-left px-4 py-2 text-white dark:text-blue-300 font-bold hover:bg-blue-600 dark:hover:bg-blue-400 rounded-lg" style={{textShadow:'0 1px 4px #000'}}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector currentColors={{ input: darkMode ? "#1e293b" : "#f1f5f9", border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", text: darkMode ? "#ffffff" : "#0f172a" }} />
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${
                darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-800 text-yellow-300"
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* LOGIN BOX UI */}
      <div className="flex items-center justify-center p-4 md:p-10 pt-24 relative z-10">
        <div
          className={`flex flex-col md:flex-row w-full max-w-6xl rounded-3xl overflow-hidden min-h-[650px] transition-all duration-500 ${
            darkMode
              ? "bg-[#0b0f19] border border-white/10"
              : "bg-white border border-gray-200"
          } ${roleConfig[role]?.glow || "shadow-2xl"}`}
        >
          <div className="w-full md:w-[55%] p-8 md:p-14 flex flex-col justify-center transition-all duration-700 bg-transparent">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 shadow-xl bg-black">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/634/721/non_2x/vrd-letter-logo-design-with-polygon-shape-vrd-polygon-and-cube-shape-logo-design-vrd-hexagon-logo-template-white-and-black-colors-vrd-monogram-business-and-real-estate-logo-vector.jpg"
                  alt="VRD logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className={`text-4xl font-bold tracking-widest ${darkMode ? "text-white" : "text-gray-900"}`}>
                {t('login')}
              </h1>
              <p
                className={`mt-3 text-sm uppercase font-semibold tracking-wider ${darkMode ? "text-slate-100" : "text-slate-800"}`}
              >
                {roleConfig[role]?.name || role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </p>
              <div className={`mt-3 h-1 w-16 bg-gradient-to-r ${roleConfig[role]?.gradient} mx-auto rounded-full`} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}
              
              <div className="relative">
                <label className={`block text-xs uppercase tracking-wider font-bold mb-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={highContrastInputStyle}
                    className={`w-full py-2 bg-transparent border-0 border-b-2 outline-none transition-all font-medium appearance-none ${
                      darkMode 
                        ? 'text-white border-slate-700' 
                        : 'text-gray-900 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                  >
                    <option value="student" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}>Student (Candidate)</option>
                    <option value="staff" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}>Staff</option>
                    <option value="hr" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}>HR</option>
                    <option value="admin" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}>Admin</option>
                  </select>
                  <div className={`absolute right-2 top-3 pointer-events-none ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className={`block text-xs uppercase tracking-wider font-bold mb-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    style={highContrastInputStyle}
                    className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className={`block text-xs uppercase tracking-wider font-bold mb-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    style={highContrastInputStyle}
                    className={`w-full pr-16 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute right-2 top-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`text-xs font-bold hover:text-slate-200 transition-colors uppercase ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>|</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className={`flex items-center gap-2 cursor-pointer font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`w-4 h-4 rounded border-slate-700 bg-transparent ${
                      role === 'student' ? 'text-cyan-500 focus:ring-cyan-500/30' :
                      role === 'staff' ? 'text-emerald-500 focus:ring-emerald-500/30' :
                      role === 'hr' ? 'text-rose-500 focus:ring-rose-500/30' :
                      'text-orange-500 focus:ring-orange-500/30'
                    }`}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className={`font-semibold hover:underline transition-all ${darkMode ? roleConfig[role]?.textColorDark : roleConfig[role]?.textColorLight}`}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 ${roleConfig[role]?.buttonBg} text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] mt-6 uppercase tracking-wider text-sm hover:brightness-110 active:brightness-95 ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Loading..." : "Enter Portal"}
              </button>

              {/* OAuth Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className={`relative flex justify-center text-sm ${darkMode ? 'bg-[#0b0f19]' : 'bg-white'}`}>
                  <span className={`px-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("Google")}
                  className={`py-3 rounded-xl font-semibold transition-all border-2 flex items-center justify-center gap-2 hover:scale-105 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Login with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline text-gray-900 dark:text-white">Google</span>
                </button>
              </div>
            </form>

            <p className={`mt-6 text-sm text-center font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}> 
              Don't have an account?
              <Link
                to={`/register?role=${role}`}
                className={`ml-1 font-bold hover:underline transition-all ${darkMode ? roleConfig[role]?.textColorDark : roleConfig[role]?.textColorLight}`}
              >
                Register Now
              </Link>
            </p>

            <div
              className={`mt-6 p-4 rounded-2xl border transition-all duration-500 ${
                darkMode
                  ? "border-white/10 bg-white/5"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${darkMode ? roleConfig[role]?.textColorDark : roleConfig[role]?.textColorLight}`}>
                <CheckCircle size={14} /> <span>Placement Pulse</span>
              </p>
              <p className={`text-sm font-medium leading-relaxed italic ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                25 new job roles added today for the upcoming tech-hiring drive.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE (Role-Specific Quotation Panel) */}
          <div
            className={`hidden md:flex md:w-[45%] bg-gradient-to-br ${roleConfig[role]?.gradient || 'from-blue-600 to-indigo-700'} relative items-center justify-center p-12 transition-all duration-700`}
            style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
          >
            {/* Glowing backdrop decorative blobs */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-black/15 rounded-full blur-xl" />

            <div className="relative z-10 text-center text-white max-w-sm mx-auto flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  {role === 'student' ? <Briefcase size={28} /> :
                   role === 'staff' ? <Users size={28} /> :
                   role === 'hr' ? <Award size={28} /> :
                   <Target size={28} />}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold uppercase tracking-widest text-shadow-md">
                  {roleConfig[role]?.loginQuote?.heading}
                </h2>
                <div className="mt-3 h-0.5 w-12 bg-white/50 mx-auto rounded-full" />
                <p className="mt-6 text-sm font-medium leading-relaxed opacity-90">
                  {roleConfig[role]?.loginQuote?.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth Confirmation Modal */}
      {pendingOAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all ${
              darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div
              className={`p-8 flex flex-col gap-6 border-b ${
                darkMode ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                  pendingOAuth.provider === 'Google' ? 'bg-red-500' :
                  pendingOAuth.provider === 'LinkedIn' ? 'bg-blue-600' :
                  'bg-gray-800'
                }`}>
                  {pendingOAuth.provider === 'Google' ? '𝐆' : 
                   pendingOAuth.provider === 'LinkedIn' ? 'in' : 
                   '🐙'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Login with {pendingOAuth.provider}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Confirm your details to continue
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
              }`}>
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Email
                    </p>
                    <p className="text-sm font-medium">{pendingOAuth.email}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Name
                    </p>
                    <p className="text-sm font-medium">{pendingOAuth.name}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Role
                    </p>
                    <p className="text-sm font-medium capitalize">{role}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPendingOAuth(null)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmOAuthLogin(pendingOAuth)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all ${
                    pendingOAuth.provider === 'Google' ? 'bg-red-500 hover:bg-red-600' :
                    pendingOAuth.provider === 'LinkedIn' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-gray-800 hover:bg-gray-900'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Logging in...' : 'Confirm & Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {otpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all ${darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"}`}>
            <div className={`p-8 flex flex-col gap-6 border-b ${darkMode ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-white"}`}>
              <h3 className="text-lg font-bold mb-2">Enter OTP</h3>
              <p className="text-sm mb-2">An OTP has been sent to <span className="font-semibold">{otpEmail}</span>. Please enter it below to complete login.</p>
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  maxLength={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-center text-lg tracking-widest font-mono ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                  placeholder="Enter 6-digit OTP"
                  required
                  autoFocus
                />
                {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setOtpModal(false); setOtpInput(""); setOtpEmail(""); }}
                    disabled={otpLoading}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading || !otpInput}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all ${'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {forgotModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all ${darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"}`}>
            <div className={`p-8 flex flex-col gap-5 border-b ${darkMode ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-white"}`}>
              <h3 className="text-lg font-bold">{forgotStep === "request" ? "Forgot Password" : "Reset Password"}</h3>
              {forgotStep === "request" ? (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    style={highContrastInputStyle}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                    required
                  />
                  {forgotMessage && <p className="text-sm text-amber-500">{forgotMessage}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModal(false)}
                      disabled={forgotLoading}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {forgotLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    maxLength={6}
                    placeholder="Enter OTP"
                    style={highContrastInputStyle}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    style={highContrastInputStyle}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                    required
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={highContrastInputStyle}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                    required
                  />
                  {forgotMessage && <p className="text-sm text-amber-500">{forgotMessage}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModal(false)}
                      disabled={forgotLoading}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {forgotLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <footer
        className={`py-6 text-center text-xs opacity-60 ${
          darkMode ? "text-slate-400" : "text-gray-500"
        }`}
      >
        &copy; 2026 Generative AI Placement System. Designed for Institutional Excellence.
      </footer>
    </div>
  );
}