import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans antialiased relative overflow-hidden p-4 sm:p-6">
      
      {/* Background Ambient Glows (Red for alert, Blue for brand) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#0096ed]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden relative z-10 text-center p-8 sm:p-12">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-[#0096ed]" />

        {/* Icon / Visual */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-50" />
          <div className="relative w-full h-full bg-red-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          
          {/* Small secondary badge */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-4 h-4 text-[#b2d235]" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
          You do not have the necessary administrative privileges to view this page. Please contact your system administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <a 
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white text-sm bg-[#0096ed] hover:bg-[#0082ce] shadow-md shadow-[#0096ed]/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </a>
        </div>

        {/* Footer Meta */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Error Code: 401_UNAUTHORIZED • GlobalTrade System
          </p>
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedPage;