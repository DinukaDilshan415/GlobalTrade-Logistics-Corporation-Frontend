import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { 
  ChevronDown, 
  User, 
  Search, 
  Menu, 
  X,
  UserCircle,
  BookUser,
  Settings,
  UserPlus,
  ArrowRight
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  
  const accountRef = useRef<HTMLDivElement>(null);

  const { token, setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    setIsAccountOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Shipping', href: '#shipping' },
    { label: 'Tracking', href: '#tracking' },
    { label: 'Support', href: '#support' },
  ];

  return (
    <header className="sticky w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Main Navigation */}
        <div className="flex items-center space-x-10">
          {/* Brand Logo */}
          <a href="/" className="flex items-center transition-transform hover:scale-105 duration-200">
            <img 
              className="h-10 sm:h-12 w-auto object-contain"
              src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
              alt="Global Express Logo" 
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-globlePrimary hover:bg-globlePrimary/5 rounded-full transition-all"
              >
                {item.label}
              </a>
            ))}

            {/* Account Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setIsAccountOpen((prev) => !prev)}
                className={`flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  isAccountOpen 
                    ? 'bg-globlePrimary/10 text-globlePrimary' 
                    : 'text-slate-700 hover:text-globlePrimary hover:bg-globlePrimary/5'
                }`}
              >
                <span>Account</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isAccountOpen ? 'rotate-180 text-globlePrimary' : 'text-slate-400'
                  }`} 
                />
              </button>

              {/* Modern Card Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 divide-y divide-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    <a
                      href="#admin"
                      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-globlePrimary hover:bg-globlePrimary/5 rounded-xl transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Administration</span>
                    </a>
                    <a
                      href="#profile"
                      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-globlePrimary hover:bg-globlePrimary/5 rounded-xl transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      <span>My Profile</span>
                    </a>
                    <a
                      href="#address-book"
                      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-globlePrimary hover:bg-globlePrimary/5 rounded-xl transition-colors"
                    >
                      <BookUser className="h-4 w-4 text-slate-400" />
                      <span>Address Book</span>
                    </a>
                  </div>

                  {/* Highlight CTA in Dropdown */}
                  <div className="pt-2">
                    <a
                      href="#open-account"
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-globlePrimary hover:bg-globlePrimary/10 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-globlePrimary" />
                        <span>Open an Account</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Search & Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3 text-sm font-semibold">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-slate-100 rounded-full px-3 py-1.5 ring-1 ring-slate-200">
                <Search className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-36"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                aria-label="Search" 
                className="p-2.5 text-slate-600 hover:text-globlePrimary hover:bg-slate-100 rounded-full transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Auth action buttons: show Logout when authenticated, otherwise Log In / Sign Up */}
          {token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <User className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-globlePrimary hover:bg-slate-100 rounded-full transition-all"
              >
                <User className="h-4 w-4" />
                <span>Log In</span>
              </a>

              {/* Register / Sign Up (Primary Button with Secondary Accent Glow) */}
              <a
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 hover:shadow-lg transition-all active:scale-95"
              >
                <span>Sign Up</span>
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center space-x-2">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-globlePrimary" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="py-2.5 text-base font-semibold text-slate-800 hover:text-globlePrimary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a 
              href="#account" 
              className="py-2.5 text-base font-semibold text-slate-800 hover:text-globlePrimary transition-colors"
            >
              Account Settings
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {token ? (
              <>
                <button
                  onClick={() => { handleLogout(); }}
                  className="w-full py-3 text-center text-sm font-bold text-slate-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  Logout
                </button>
                <a
                  href="#dashboard"
                  className="w-full py-3 text-center text-sm font-bold text-white bg-globlePrimary hover:bg-[#0082ce] shadow-md rounded-xl transition-all"
                >
                  Dashboard
                </a>
              </>
            ) : (
              <>
                <a 
                  href="#login" 
                  className="w-full py-3 text-center text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Log In
                </a>
                <a 
                  href="#signup" 
                  className="w-full py-3 text-center text-sm font-bold text-white bg-globlePrimary hover:bg-[#0082ce] shadow-md rounded-xl transition-all"
                >
                  Open an Account
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};