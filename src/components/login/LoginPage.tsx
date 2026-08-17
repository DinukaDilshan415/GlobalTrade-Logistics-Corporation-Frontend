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
  Globe2,
  Package,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';
type AccountType = 'customer' | 'customs_agent';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { setToken } = useAuth();

  const INITIAL_FORM_DATA = {
    username: '',
    email: '',
    accountType: 'customer' as AccountType,
    password: '',
    rememberMe: false,
    agreeToTerms: false,
  };

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    accountType: 'customer' as AccountType,
    password: '',
    rememberMe: false,
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const register = async () => {

    const user = {
      "username": formData.username,
      "email": formData.email,
      "accountType": formData.accountType,
      "password": formData.password
    }

    try {
      const response = await fetch(`${GLOBAL_BASE_URL}/user/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...DEFAULT_HEADERS,
        },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        const json = await response.json();

        if (json.status) {
          toast.success(json.message);
          setFormData(INITIAL_FORM_DATA);
          setMode('login');
        } else {
          console.log(json.message);
          toast.error(json.message);
        }
      } else {
        console.log("Registration failed. Please try again");
        toast.error("Registration failed. Please try again");
      }
    } catch (error) {
      toast.error("Something Wrong : " + error);
      console.error("Signup Error:", error);
    }
  }

  const signin = async () => {

    const user = {
      "username": "",
      "email": formData.email,
      "accountType": "",
      "password": formData.password
    }

    try {
      const response = await fetch(`${GLOBAL_BASE_URL}/auth/user/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...DEFAULT_HEADERS,
        },
        body: JSON.stringify(user)
      });
      const json = await response.json();

      console.log(json);

      if (response.ok) {

        setToken(json.accessToken);
        toast.success(json.message);
        setFormData(INITIAL_FORM_DATA);

      } else if (response.status == 400) {
        toast.error(json.message);
      } else if (response.status == 401) {
        toast.error(json.error);
      } else {
        console.log(response);
        toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
      }
    } catch (error) {
      toast.error("Something Wrong : " + error);
      console.error("Error:", error);
    }

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      signin();
    } else {
      register();
    }
  };

  return (
    <div className="min-h-screen w-7xl flex flex-col lg:flex-row bg-slate-50 font-sans antialiased text-slate-900">

      {/* 1. Left Side: Brand Showcase & Graphic (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-950 via-slate-900 to-globlePrimary/30 relative p-12 flex-col justify-between overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-globlePrimary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-globleSecondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              className="h-10 w-auto object-contain"
              src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
              alt="Global Express Logo"
            />
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-globleSecondary/20 border border-globleSecondary/30 text-globleSecondary text-xs font-bold uppercase tracking-wider">
            Fast • Secure • Global
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
            Manage your shipments & customs with ease.
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Access live GPS consignment tracking, automated bill of entry declarations, rate calculators, and express courier booking in one unified dashboard.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-globlePrimary flex items-center justify-center text-white mb-2">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="text-white text-sm font-bold">Fast Tracking</h4>
              <p className="text-slate-400 text-xs mt-0.5">Real-time status updates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-globleSecondary flex items-center justify-center text-slate-950 mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-white text-sm font-bold">Customs Ready</h4>
              <p className="text-slate-400 text-xs mt-0.5">Automated document clearance</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Side: Login & Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12">

        {/* Mobile Logo & Back Link */}
        <div className="w-full max-w-md flex items-center justify-between lg:hidden mb-8">
          <a href="/">
            <img
              className="h-9 w-auto"
              src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
              alt="Global Express Logo"
            />
          </a>
          <a href="/" className="text-xs font-semibold text-globlePrimary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </a>
        </div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">

          {/* Header Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your dashboard and cargo.'
                : 'Create an account to book and manage shipments.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* Register Only: Username */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Full Name / Username
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field (Common) */}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 transition-all"
                />
              </div>
            </div>

            {/* Register Only: Account Type Selection */}
            {mode === 'register' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Select Account Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Customer Option */}
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${formData.accountType === 'customer'
                      ? 'border-globlePrimary bg-globlePrimary/5 ring-1 ring-globlePrimary'
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
                    <div className="flex items-center justify-between mb-1">
                      <UserCheck className={`w-4 h-4 ${formData.accountType === 'customer' ? 'text-globlePrimary' : 'text-slate-500'}`} />
                      {formData.accountType === 'customer' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-globlePrimary" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900">Customer</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Personal & business shipments</span>
                  </label>

                  {/* Customs Agent Option */}
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${formData.accountType === 'customs_agent'
                      ? 'border-globlePrimary bg-globlePrimary/5 ring-1 ring-globlePrimary'
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
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck className={`w-4 h-4 ${formData.accountType === 'customs_agent' ? 'text-globlePrimary' : 'text-slate-500'}`} />
                      {formData.accountType === 'customs_agent' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-globlePrimary" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900">Customs Agent</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Clearance & declarations</span>
                  </label>
                </div>
              </div>
            )}

            {/* Password Field (Common) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Password
                </label>
                {mode === 'login' && (
                  <a href="#forgot" className="text-xs font-semibold text-globlePrimary hover:underline">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 transition-all"
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

            {/* Remember Me / Terms Checkbox */}
            <div className="pt-1">
              {mode === 'login' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 text-globlePrimary focus:ring-globlePrimary accent-globlePrimary"
                  />
                  <span className="text-xs font-medium text-slate-600">Keep me logged in</span>
                </label>
              ) : (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 text-globlePrimary focus:ring-globlePrimary accent-globlePrimary mt-0.5"
                  />
                  <span className="text-xs text-slate-600 leading-tight">
                    I agree to the <a href="#terms" className="text-globlePrimary font-semibold underline">Terms</a> and <a href="#privacy" className="text-globlePrimary font-semibold underline">Privacy Policy</a>.
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-lg shadow-globlePrimary/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Form Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-globlePrimary font-bold hover:underline ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-globlePrimary font-bold hover:underline ml-1"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;