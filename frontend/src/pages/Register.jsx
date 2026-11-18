import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle2, User, Mail, Lock, FileText, Eye, EyeOff } from "lucide-react";

// ── Password strength ─────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Weak", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Strong", color: "bg-blue-500" };
  return { score, label: "Very Strong", color: "bg-green-500" };
}

function PasswordStrengthBar({ password }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= strength.score ? strength.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength.score <= 1 ? "text-red-600"
        : strength.score === 2 ? "text-orange-500"
        : strength.score === 3 ? "text-yellow-600"
        : "text-green-600"
      }`}>
        {strength.label}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim())) {
      setError("Username may only contain letters, numbers, _, . or - (3-32 chars).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim() || undefined, password);
      navigate("/login");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || JSON.stringify(d)).join(" | "));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 C 50 100 80 100 100 0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            ResumeAI
          </div>
          <div className="mt-20">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Start Your Journey to a Better Career
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Create a professional resume in minutes and get instant AI feedback on how to improve it.
            </p>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          {["Free to get started", "No credit card required", "Secure & Private"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-lg">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
            <p className="mt-2 text-sm text-slate-600">Join thousands of professionals advancing their careers.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full pl-10 rounded-lg border border-slate-300 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white"
                  placeholder="Choose a username (3-32 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={32}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-10 rounded-lg border border-slate-300 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 rounded-lg border border-slate-300 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 rounded-lg border py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400"
                      : "border-slate-300"
                  }`}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
