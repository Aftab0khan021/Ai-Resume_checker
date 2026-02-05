import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle2, User, Lock, FileText } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError("Invalid username or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
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
                            Craft Your Perfect Resume with AI
                        </h1>
                        <p className="text-xl text-blue-100 max-w-md">
                            Join thousands of job seekers who secured interviews at top companies using our AI-powered analysis and resume builder.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-lg">ATS-Friendly Templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-lg">Real-time AI Scoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-lg">Instant PDF Export</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="block w-full pl-10 rounded-lg border border-slate-300 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-10 rounded-lg border border-slate-300 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 sm:text-sm transition-all bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Sign up for free
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
