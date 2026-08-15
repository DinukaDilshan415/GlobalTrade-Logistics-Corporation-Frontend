import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Briefcase,
  X
} from 'lucide-react';

type AuthMode = 'login' | 'register';
type AccountType = 'customer' | 'customs_agent' | 'business';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen = true, 
  onClose,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    accountType: 'customer' as AccountType,
    password: '',
    rememberMe: false,
    agreeToTerms: false,
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      console.log('Login Payload:', {
        email: formData.email,
        password: formData.password,
      });
      alert(`Logging in with: ${formData.email}`);
    } else {
      console.log('Registration Payload:', formData);
      alert(`Account created for ${formData.username} as ${formData.accountType}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Container Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0096ed]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-12 w-24 h-24 bg-[#b2d235]/15 rounded-full blur-xl" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0096ed] to-[#b2d235] flex items-center justify-center shadow-md shadow-[#0096ed]/20">
              <span className="text-white font-black text-xl tracking-tight">GL</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight leading-none text-white">
                GLOBAL<span className="text-[#0096ed]">EXPRESS</span>
              </h3>
              <p className="text-[10px] font-semibold text-[#b2d235] tracking-widest uppercase mt-0.5">Secure Logistics Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' 
              ? 'Enter your credentials to access your global logistics dashboard.' 
              : 'Sign up to start tracking, managing consignments, and booking freight.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-6 border border-slate-700/60 max-w-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#0096ed] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#0096ed] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {/* Register Only: Full Name / Username */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Username / Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g. Dinuka Dilshan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0096ed] focus:ring-2 focus:ring-[#0096ed]/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email (Common) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0096ed] focus:ring-2 focus:ring-[#0096ed]/20 transition-all"
              />
            </div>
          </div>

          {/* Register Only: Account Type Selector Cards */}
          {mode === 'register' && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Select Account Role
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Customer */}
                <label 
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.accountType === 'customer'
                      ? 'border-[#0096ed] bg-[#0096ed]/5 ring-1 ring-[#0096ed]'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="customer"
                    checked={formData.accountType === 'customer'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between mb-1.5">
                    <UserCheck className={`w-4 h-4 ${formData.accountType === 'customer' ? 'text-[#0096ed]' : 'text-slate-500'}`} />
                    {formData.accountType === 'customer' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0096ed]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Customer</span>
                  <span className="text-[10px] text-slate-500">Personal shipments & tracking</span>
                </label>

                {/* Option 2: Customs Agent */}
                <label 
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.accountType === 'customs_agent'
                      ? 'border-[#0096ed] bg-[#0096ed]/5 ring-1 ring-[#0096ed]'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="customs_agent"
                    checked={formData.accountType === 'customs_agent'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between mb-1.5">
                    <ShieldCheck className={`w-4 h-4 ${formData.accountType === 'customs_agent' ? 'text-[#0096ed]' : 'text-slate-500'}`} />
                    {formData.accountType === 'customs_agent' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0096ed]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900">Customs Agent</span>
                  <span className="text-[10px] text-slate-500">Clearance & port manifests</span>
                </label>
              </div>
            </div>
          )}

          {/* Password (Common) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Password
              </label>
              {mode === 'login' && (
                <a href="#forgot" className="text-xs font-semibold text-[#0096ed] hover:underline">
                  Forgot Password?
                </a>
              )}
            </div>
            
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0096ed] focus:ring-2 focus:ring-[#0096ed]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms & Remember Me */}
          <div className="pt-1">
            {mode === 'login' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#0096ed] focus:ring-[#0096ed] accent-[#0096ed]"
                />
                <span className="text-xs font-medium text-slate-600">Remember this device for 30 days</span>
              </label>
            ) : (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#0096ed] focus:ring-[#0096ed] accent-[#0096ed] mt-0.5"
                />
                <span className="text-xs text-slate-600 leading-tight">
                  I agree to the <a href="#terms" className="text-[#0096ed] font-semibold underline">Terms of Service</a> and <a href="#privacy" className="text-[#0096ed] font-semibold underline">Privacy Policy</a>.
                </span>
              </label>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-[#0096ed] hover:bg-[#0082ce] shadow-lg shadow-[#0096ed]/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 mt-4"
          >
            <span>{mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info switch */}
        <div className="bg-slate-50 border-t border-slate-100 py-4 px-8 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button 
                onClick={() => setMode('register')} 
                className="text-[#0096ed] font-bold hover:underline ml-1"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="text-[#0096ed] font-bold hover:underline ml-1"
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};