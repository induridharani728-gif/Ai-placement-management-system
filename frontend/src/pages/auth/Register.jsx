import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, X, CheckCircle, ArrowRight, Sun, Moon, Eye, EyeOff, ChevronDown, Briefcase, Users, Award, Target } from "lucide-react";
import { authAPI, oauthAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage, LanguageSelector } from "../../contexts/LanguageContext";

import { BACKEND_BASE_URL } from "../../config/apiBase";
import { API_BASE_URL } from "../../config/apiBase";

const roleImages = {
  student: "https://img.freepik.com/premium-photo/graduation-boy-girl-class-room_1036975-32053.jpg",
  staff: "https://img.freepik.com/premium-photo/portrait-professional-workers-office-attire-isolated-white-background-3d-cartoon-animation_36897-54576.jpg?w=1060",
  hr: "https://img.freepik.com/premium-photo/business-presentation-3d-realistic-two-employees-crochets-doll-figure-is-doing-presentation_565941-3754.jpg?w=996",
  admin: "https://img.freepik.com/premium-psd/businessman-with-documents-pointing-glasses-3d-isolated-transparent-background-png-psd_1130573-121202.jpg"
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
  }
};

function getAvatarUrl(avatar) {
  if (!avatar) return '';
  if (avatar.startsWith('/uploads/')) {
    return `${API_BASE_URL}${avatar}`;
  }
  return avatar;
}

export default function Register() {
  const { t } = useLanguage();
  const backendBaseUrl = BACKEND_BASE_URL;
  // Add OTP display state at the top to avoid ReferenceError
  const [otpDisplay, setOtpDisplay] = useState("");
  const [role, setRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    return ["student", "staff", "hr", "admin"].includes(roleParam) ? roleParam : "student";
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [section, setSection] = useState(null);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingOAuth, setPendingOAuth] = useState(null);
  const [emailAvailability, setEmailAvailability] = useState(null);
  const [phoneAvailability, setPhoneAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [registerOtpModal, setRegisterOtpModal] = useState(false);
  const [registerOtp, setRegisterOtp] = useState("");
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [registerOtpMessage, setRegisterOtpMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleColors = {
    student: "bg-blue-600",
    staff: "bg-emerald-600",
    hr: "bg-rose-600",
    admin: "bg-purple-600",
  };

  const roleGradients = {
    student: "from-cyan-700 to-sky-900",
    staff: "from-emerald-700 to-lime-900",
    hr: "from-rose-700 to-orange-900",
    admin: "from-amber-700 to-red-900",
  };

  const passwordChecks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength =
    passwordScore <= 2 ? "Weak" : passwordScore === 3 ? "Medium" : passwordScore === 4 ? "Strong" : "Very Strong";
  const passwordStrengthColor =
    passwordScore <= 2 ? "bg-red-500" : passwordScore === 3 ? "bg-amber-500" : passwordScore === 4 ? "bg-blue-500" : "bg-emerald-500";

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

  useEffect(() => {
    if (role === "student") {
      setDepartment("");
      setEmployeeId("");
    } else {
      setStudentRollNumber("");
    }
  }, [role]);

  const checkAvailability = async (type, value) => {
    if (!value) return;
    setAvailabilityLoading(true);
    try {
      const params = type === "email" ? { email: value } : { phone: value };
      const response = await authAPI.checkAvailability(params);
      if (response.data.success) {
        if (type === "email") {
          setEmailAvailability(response.data.emailAvailable);
        } else {
          setPhoneAvailability(response.data.phoneAvailable);
        }
      }
    } catch (_error) {
      if (type === "email") {
        setEmailAvailability(null);
      } else {
        setPhoneAvailability(null);
      }
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (passwordScore <= 2) {
      setErrorMsg("Please choose a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please agree to Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      if (role !== "student" && !department.trim()) {
        setErrorMsg("Department is required for selected role.");
        return;
      }

      if (emailAvailability === false) {
        setErrorMsg("Email is already registered.");
        return;
      }

      if (phoneAvailability === false) {
        setErrorMsg("Phone number is already registered.");
        return;
      }

      const response = await authAPI.initiateRegister({
        name,
        email,
        password,
        role,
        phone,
        department,
        studentRollNumber,
        employeeId,
        agreeTerms,
      });
      // Debug: log the full backend response to check for OTP
      console.log('Registration API response:', response.data);
      if (response.data.success && response.data.otpRequired) {
        setRegisterOtpModal(true);
        setRegisterOtp("");
        setRegisterOtpMessage(response.data.message || "OTP sent to your email.");
        setErrorMsg("");
        // Store OTP in a separate state for display
        setOtpDisplay(response.data.otp || "");
      } else {
        setErrorMsg(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider) => {
    const frontendOrigin = encodeURIComponent(window.location.origin);
    let url = '';
    if (provider === "Google") {
      url = `${backendBaseUrl}/api/auth/google?flow=register&frontend=${frontendOrigin}`;
    } else if (provider === "LinkedIn") {
      url = `${backendBaseUrl}/api/auth/linkedin?flow=register&frontend=${frontendOrigin}`;
    } else if (provider === "GitHub") {
      url = `${backendBaseUrl}/api/auth/github?flow=register&frontend=${frontendOrigin}`;
    }
    window.location.href = url;
  };

  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    setRegisterOtpLoading(true);
    setRegisterOtpMessage("");
    try {
      const normalizedOtp = String(registerOtp || "").replace(/\D/g, "").slice(0, 6);
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const response = await authAPI.verifyRegisterOtp({ email: normalizedEmail, otp: normalizedOtp });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        setRegisterOtpModal(false);
        navigate(`/${response.data.user.role}`, { replace: true });
      } else {
        setRegisterOtpMessage(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      const backendMsg = error.response?.data?.message;
      const backendOtp = error.response?.data?.devOtp;
      const otpHint = backendOtp ? ` OTP: ${backendOtp}` : "";
      setRegisterOtpMessage(`${backendMsg || "OTP verification failed."}${otpHint}`);
    } finally {
      setRegisterOtpLoading(false);
    }
  };

  const confirmOAuthRegister = async (userData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Replace with your actual API call for OAuth confirmation
      const response = await oauthAPI.confirmRegister(userData);
      if (response.data.success) {
        login(response.data.user, response.data.token);
        setPendingOAuth(null);
        navigate(`/${response.data.user.role}`, { replace: true });
      } else {
        setErrorMsg(response.data.message || "OAuth registration failed. Please try again.");
      }
    } catch (error) {
      console.error(`OAuth Registration Error:`, error);
      setErrorMsg(`Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const InfoModal = ({ title, onClose, children }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div
          className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all ${
            darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"
          }`}
        >
          <div
            className={`p-6 flex justify-between items-center border-b ${
              darkMode ? "border-slate-700" : "border-gray-100"
            }`}
          >
            <h3 className="text-xl font-bold uppercase tracking-wider">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* ================= FULL 3D ANIMATED BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* gradient sky */}
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-b from-[#07111f] via-[#0d1b2a] to-[#02060d]"
              : "bg-gradient-to-b from-white via-gray-100 to-gray-200"
          }`}
        />

        {/* scanline overlay */}
        <div
          className="absolute inset-0 mix-blend-soft-light opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 3px)",
            animation: "scanline 6s linear infinite",
          }}
        />

        {/* perspective neon grid floor */}
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
          {/* tint by role */}
          <div
            className={`absolute inset-0 mix-blend-screen opacity-30 ${roleColors[role]}`}
            style={{
              transform:
                "rotateX(72deg) translateY(-10%) translateZ(0) skewX(-8deg)",
            }}
          />
        </div>

        {/* cursor-follow neon glow */}
        <div
          className={`absolute w-[700px] h-[700px] rounded-full opacity-25 blur-[140px] mix-blend-screen ${roleColors[role]}`}
          style={{
            left: mousePos.x - 350,
            top: mousePos.y - 350,
            transition: "left 0.12s ease-out, top 0.12s ease-out",
          }}
        />

        {/* floating cubes / cards */}
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

        {/* subtle parallax blobs */}
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

      {/* keyframes for bg animation */}
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
            0% {
              transform: translate3d(0, 0, 0) rotateX(18deg) rotateY(-22deg);
            }
            50% {
              transform: translate3d(10px, -25px, 40px) rotateX(28deg) rotateY(-12deg);
            }
            100% {
              transform: translate3d(-10px, 5px, 0) rotateX(18deg) rotateY(-22deg);
            }
          }
          @keyframes tiltCard {
            0% {
              transform: rotateX(18deg) rotateY(18deg) translate3d(0,0,0);
            }
            50% {
              transform: rotateX(24deg) rotateY(-12deg) translate3d(10px,-18px,30px);
            }
            100% {
              transform: rotateX(18deg) rotateY(18deg) translate3d(0,0,0);
            }
          }
          @keyframes parallaxDrift {
            0%   { transform: translate3d(-20px, 10px, 0) scale(1); }
            50%  { transform: translate3d(10px, -10px, 0) scale(1.05); }
            100% { transform: translate3d(20px, 0, 0) scale(1); }
          }
        `,
        }}
      />

      {/* TOP NAV */}
      <nav
        className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${
          darkMode
            ? "bg-slate-900/80 border-slate-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="https://static.vecteezy.com/system/resources/previews/009/634/721/non_2x/vrd-letter-logo-design-with-polygon-shape-vrd-polygon-and-cube-shape-logo-design-vrd-hexagon-logo-template-white-and-black-colors-vrd-monogram-business-and-real-estate-logo-vector.jpg"
              alt="VRD logo"
              className="w-9 h-9 rounded-md border border-white/20 object-contain bg-black"
            />
            <span className="font-bold tracking-tight text-xl">Generative AI Placement System</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setSection("system")}
              className="hover:text-blue-500 transition-colors"
            >
              System
            </button>
            <button
              onClick={() => setSection("about")}
              className="hover:text-blue-500 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => setSection("contact")}
              className="hover:text-blue-500 transition-colors"
            >
              Contact
            </button>
            <Link
              to="/"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
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

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-center p-4 md:p-10 pt-24 relative z-10 min-h-screen">
        <div
          className={`flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden min-h-[650px] transition-all duration-500 ${
            darkMode
              ? "bg-[#0b0f19] border border-white/10"
              : "bg-white border border-gray-200"
          } ${roleConfig[role]?.glow || "shadow-2xl"}`}
        >
          {/* LEFT SIDE - FORM */}
          <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-transparent">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 shadow-xl bg-black">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/634/721/non_2x/vrd-letter-logo-design-with-polygon-shape-vrd-polygon-and-cube-shape-logo-design-vrd-hexagon-logo-template-white-and-black-colors-vrd-monogram-business-and-real-estate-logo-vector.jpg"
                  alt="VRD logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>{t('createAccount')}</h1>
              <div className={`h-1 w-16 rounded-full mt-2 bg-gradient-to-r ${roleConfig[role]?.gradient || "from-blue-600 to-indigo-600"}`} />
              <p className={`mt-3 text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                Enter your details to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {errorMsg && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="font-semibold">Registration Error</p>
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}
              
              {/* ROLE SELECT */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  {t('selectRole')}
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

              {/* NAME INPUT */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  {t('fullName')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={highContrastInputStyle}
                    className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    required
                  />
                  <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <User size={18} />
                  </div>
                </div>
              </div>

              {/* EMAIL INPUT */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailAvailability(null);
                    }}
                    onBlur={() => checkAvailability("email", email)}
                    style={highContrastInputStyle}
                    className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    required
                  />
                  <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Mail size={18} />
                  </div>
                </div>
                {emailAvailability !== null && (
                  <p className={`mt-1 text-xs font-semibold ${emailAvailability ? 'text-emerald-500' : 'text-red-500'}`}>
                    {emailAvailability ? '✓ Email is available' : '✗ Email already exists'}
                  </p>
                )}
              </div>

              {/* PHONE INPUT */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 Enter your phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneAvailability(null);
                    }}
                    onBlur={() => checkAvailability("phone", phone)}
                    style={highContrastInputStyle}
                    className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    required
                  />
                  <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Phone size={18} />
                  </div>
                </div>
                {phoneAvailability !== null && (
                  <p className={`mt-1 text-xs font-semibold ${phoneAvailability ? 'text-emerald-500' : 'text-red-500'}`}>
                    {phoneAvailability ? '✓ Phone is available' : '✗ Phone already exists'}
                  </p>
                )}
              </div>

              {role !== "student" && (
                <div className="relative">
                  <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                    Department
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={highContrastInputStyle}
                      className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                        darkMode 
                          ? 'text-white placeholder:text-slate-400 border-slate-700' 
                          : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                      } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                      required
                    />
                    <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <User size={18} />
                    </div>
                  </div>
                </div>
              )}

              {role === "student" && (
                <div className="relative">
                  <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                    Student Roll Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter roll number"
                      value={studentRollNumber}
                      onChange={(e) => setStudentRollNumber(e.target.value)}
                      style={highContrastInputStyle}
                      className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                        darkMode 
                          ? 'text-white placeholder:text-slate-400 border-slate-700' 
                          : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                      } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    />
                    <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <User size={18} />
                    </div>
                  </div>
                </div>
              )}

              {(role === "staff" || role === "hr" || role === "admin") && (
                <div className="relative">
                  <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                    Employee ID (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter employee ID"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      style={highContrastInputStyle}
                      className={`w-full pr-10 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                        darkMode 
                          ? 'text-white placeholder:text-slate-400 border-slate-700' 
                          : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                      } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    />
                    <div className={`absolute right-2 top-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <User size={18} />
                    </div>
                  </div>
                </div>
              )}

              {/* PASSWORD INPUT */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={highContrastInputStyle}
                    className={`w-full pr-16 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
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
                    <Lock size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
                  </div>
                </div>
                {password.length > 0 && (
                  <>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Recommended for better security: 8+ chars with a mix of letters, numbers, and symbols.
                    </p>
                    <div className="mt-2">
                      <div className="h-2 w-full rounded-full bg-slate-700">
                        <div
                          className={`h-2 rounded-full transition-all ${passwordStrengthColor}`}
                          style={{ width: `${(passwordScore / 5) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-slate-300">
                        Strength: {passwordStrength}
                      </p>
                      <ul className="mt-1 text-[10px] space-y-0.5 text-slate-400">
                        <li>{passwordChecks.minLength ? "✓" : "○"} At least 8 characters</li>
                        <li>{passwordChecks.uppercase ? "✓" : "○"} One uppercase letter</li>
                        <li>{passwordChecks.lowercase ? "✓" : "○"} One lowercase letter</li>
                        <li>{passwordChecks.number ? "✓" : "○"} One number</li>
                        <li>{passwordChecks.special ? "✓" : "○"} One special character (@, #, !, etc.)</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <label className={`text-xs uppercase tracking-wider font-bold mb-1.5 block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  {t('confirmPassword') || 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={highContrastInputStyle}
                    className={`w-full pr-16 py-2 bg-transparent border-0 border-b-2 outline-none transition-all ${
                      darkMode 
                        ? 'text-white placeholder:text-slate-400 border-slate-700' 
                        : 'text-gray-900 placeholder:text-slate-500 border-gray-300'
                    } ${roleConfig[role]?.focusBorder || 'focus:border-blue-500'}`}
                    required
                  />
                  <div className="absolute right-2 top-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={`text-xs font-bold hover:text-slate-200 transition-colors uppercase ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>|</span>
                    <Lock size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
                  </div>
                </div>
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className={`w-4 h-4 rounded border-slate-700 bg-transparent ${
                    role === 'student' ? 'text-cyan-500 focus:ring-cyan-500/30' :
                    role === 'staff' ? 'text-emerald-500 focus:ring-emerald-500/30' :
                    role === 'hr' ? 'text-rose-500 focus:ring-rose-500/30' :
                    'text-orange-500 focus:ring-orange-500/30'
                  }`}
                />
                <label htmlFor="terms" className={`text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}> 
                  I agree to{" "}
                  <button
                     type="button"
                     onClick={() => setSection("terms")}
                     className={`font-semibold hover:underline ${darkMode ? roleConfig[role]?.textColorDark : roleConfig[role]?.textColorLight}`}
                  >
                    Terms & Conditions
                  </button>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || availabilityLoading}
                className={`w-full py-3.5 ${roleConfig[role]?.buttonBg} text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] mt-6 flex items-center justify-center gap-2 uppercase tracking-wider text-sm hover:brightness-110 active:brightness-95 ${
                  loading || availabilityLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Account..." : t('register')} {!loading && <ArrowRight size={18} />}
              </button>

              {/* OAuth Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className={`relative flex justify-center text-sm ${darkMode ? 'bg-[#0b0f19]' : 'bg-white'}`}>
                  <span className={`px-2 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Or sign up with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthRegister("Google")}
                  className={`py-3 rounded-xl font-semibold transition-all border-2 flex items-center justify-center gap-2 hover:scale-105 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Sign up with Google"
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

            {/* LOGIN LINK */}
            <p className={`mt-6 text-sm text-center font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              <span>Already have an account?</span>
              <Link to={`/?role=${role}`} className={`ml-1 font-bold hover:underline transition-all ${darkMode ? roleConfig[role]?.textColorDark : roleConfig[role]?.textColorLight}`}>
                Login here
              </Link>
            </p>
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
                  {roleConfig[role]?.registerQuote?.heading}
                </h2>
                <div className="mt-3 h-0.5 w-12 bg-white/50 mx-auto rounded-full" />
                <p className="mt-6 text-sm font-medium leading-relaxed opacity-90">
                  {roleConfig[role]?.registerQuote?.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {section === "system" && (
        <InfoModal title="System Overview" onClose={() => setSection(null)}>
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Gen-AI Placement Management</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Generative AI Placement System is built on the modern MERN stack (MongoDB, Express, React, Node.js) with integrated generative AI capabilities for intelligent placement management.
            </p>
            <h4 className="font-semibold mt-4">Key Features:</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li>✓ <strong>AI Resume Analysis</strong> - Automated parsing & scoring</li>
              <li>✓ <strong>Smart Job Matching</strong> - AI-powered recommendations</li>
              <li>✓ <strong>Interview Preparation</strong> - AI-driven mock interviews</li>
              <li>✓ <strong>Analytics Dashboard</strong> - Real-time placement metrics</li>
              <li>✓ <strong>Multi-role Support</strong> - Student, Staff, HR, Admin portals</li>
            </ul>
          </div>
        </InfoModal>
      )}

      {section === "about" && (
        <InfoModal title="About Generative AI Placement System" onClose={() => setSection(null)}>
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Our Mission</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Revolutionize campus placements through AI-powered tools and intelligent automation, enabling students to secure better opportunities and helping institutions improve placement outcomes.
            </p>
            <h4 className="font-semibold mt-4">What We Do:</h4>
            <ul className="text-sm space-y-2 opacity-90">
              <li>📊 <strong>5000+</strong> Successful Placements</li>
              <li>🎯 <strong>94%</strong> Overall Success Rate</li>
              <li>🤝 <strong>500+</strong> Corporate Partners</li>
              <li>💼 <strong>8.5 LPA</strong> Average Package</li>
            </ul>
          </div>
        </InfoModal>
      )}

      {section === "contact" && (
        <InfoModal title="Contact Support" onClose={() => setSection(null)}>
          <div className="space-y-4">
            <h4 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Get in Touch</h4>
            <div className={`text-sm space-y-3 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
              <p>
                📧 <strong>Email:</strong> vamsivalluri52@gmail.com
              </p>
              <p>
                📞 <strong>Phone:</strong> +91-6301231575
              </p>
              <p>
                🏢 <strong>Address:</strong> Vāghodia, Gujarat, India
              </p>
              <p>
                🕐 <strong>Support Hours:</strong> Mon-Fri, 9 AM - 6 PM IST
              </p>
            </div>
            <h4 className={`font-semibold mt-4 ${darkMode ? "text-white" : "text-slate-900"}`}>Follow Us:</h4>
            <div className="flex gap-4 text-sm">
              <a href="#" className={darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}>LinkedIn</a>
              <a href="#" className={darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}>GitHub</a>
              <a href="#" className={darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}>Twitter</a>
            </div>
          </div>
        </InfoModal>
      )}

      {section === "terms" && (
        <InfoModal title="Terms & Conditions" onClose={() => setSection(null)}>
          <div className="space-y-4 text-sm opacity-90">
            <h4 className="font-semibold">1. User Responsibilities</h4>
            <p>Users agree to provide accurate information and maintain confidentiality of their credentials.</p>

            <h4 className="font-semibold">2. Data Privacy</h4>
            <p>All personal data is encrypted and processed securely in accordance with GDPR & Indian data protection laws.</p>

            <h4 className="font-semibold">3. Acceptable Use</h4>
            <p>Users must not misuse the platform for unauthorized activities or data scraping.</p>

            <h4 className="font-semibold">4. Liability</h4>
            <p>Generative AI Placement System is not liable for placement outcomes. We provide tools & opportunities; success depends on user effort.</p>
          </div>
        </InfoModal>
      )}

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
                  onClick={() => confirmOAuthRegister(pendingOAuth)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all ${
                    pendingOAuth.provider === 'Google' ? 'bg-red-500 hover:bg-red-600' :
                    pendingOAuth.provider === 'LinkedIn' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-gray-800 hover:bg-gray-900'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Logging in...' : 'Confirm & Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {registerOtpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all ${darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-800"}`}>
            <div className={`p-8 flex flex-col gap-5 border-b ${darkMode ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-white"}`}>
              <h3 className="text-lg font-bold">Verify Registration OTP</h3>
              <p className="text-sm">We sent a 6-digit OTP to <span className="font-semibold">{email}</span>.</p>
              {otpDisplay && (
                <div className="my-2 p-3 rounded-xl bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-blue-700 flex flex-col items-center">
                  <span className="text-xs text-blue-700 dark:text-blue-200 font-semibold mb-1">Your OTP</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-200 tracking-widest">{otpDisplay}</span>
                </div>
              )}
              <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                <input
                  type="text"
                  value={registerOtp}
                  onChange={(e) => setRegisterOtp(String(e.target.value || "").replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  placeholder="Enter OTP"
                  style={highContrastInputStyle}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-center text-lg tracking-widest font-mono ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:border-blue-500' : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'}`}
                  required
                />
                {registerOtpMessage && (
                  <p className="text-sm text-amber-500">{registerOtpMessage}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setRegisterOtpModal(false); setOtpDisplay(""); }}
                    disabled={registerOtpLoading}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registerOtpLoading || !registerOtp}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {registerOtpLoading ? "Verifying..." : "Verify & Create"}
                  </button>
                </div>
              </form>
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
