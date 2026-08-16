import React, { useState } from 'react';
import {
    ShieldAlert,
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Server
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Admin Authentication Attempt:', { username });
            alert(`Authenticating internal user: ${username}`);
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans antialiased relative overflow-hidden p-4 sm:p-6">

            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-globlePrimary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-globleSecondary/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden relative z-10">

                {/* Card Header (Secure Theme) */}
                <div className="bg-slate-900 px-8 pt-10 pb-8 relative overflow-hidden border-b border-slate-800">
                    {/* Subtle grid pattern background */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="p-3 rounded-2xl flex items-center justify-center shadow-lg mb-5">
                            <img
                                className="h-12 w-auto object-contain"
                                src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
                                alt="GlobalTrade Logo"
                            />
                        </div>

                        <p className="text-sm text-globleSecondary font-semibold tracking-widest uppercase mt-1.5 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            Restricted Access
                        </p>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleLogin} className="p-8 space-y-5 bg-white">

                    {/* Username / Employee ID */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                            Username / ID
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400 pointer-events-none">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                            Secure Password
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400 pointer-events-none">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-bold text-white text-sm bg-slate-900 hover:bg-globlePrimary shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : (
                            <>
                                <span>Secure Login</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Warning */}
                <div className="bg-slate-50 border-t border-slate-100 p-5 text-center">
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                        Unauthorized access to this system is strictly prohibited and subject to prosecution. All activities are monitored and logged.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;