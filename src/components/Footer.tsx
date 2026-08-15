import React from 'react';
import { Send, ShieldCheck, Headphones, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm w-full">
      {/* Features Bar */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-globlePrimary/10 text-globlePrimary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Secure Tracking</h4>
              <p className="text-xs text-slate-400">End-to-end encrypted shipment updates</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-globleSecondary/10 text-globleSecondary flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">24/7 Global Support</h4>
              <p className="text-xs text-slate-400">Dedicated freight & courier assistance</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-globlePrimary/10 text-globlePrimary flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">On-Time Guarantee</h4>
              <p className="text-xs text-slate-400">Reliable cross-border transit speeds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-white text-base mb-4">Express Shipping</h3>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Domestic Express</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">International Air Delivery</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Ocean Freight Forwarding</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Customs Clearance</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white text-base mb-4">Enterprise</h3>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-globlePrimary transition-colors">E-Commerce Logistics</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Warehouse Solutions</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Developer Shipping API</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Corporate Rates</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white text-base mb-4">Company</h3>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-globlePrimary transition-colors">About Our Network</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Sustainability & Green Fleet</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Press & Media</a></li>
            <li><a href="#" className="hover:text-globlePrimary transition-colors">Careers</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white text-base mb-4">Stay Connected</h3>
          <p className="text-xs text-slate-400 mb-3">Subscribe for rates updates and logistic insights.</p>
          <div className="flex items-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-slate-800 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-l-lg outline-none focus:ring-1 focus:ring-globlePrimary w-full"
            />
            <button className="bg-globlePrimary hover:bg-[#0082ce] text-white px-3.5 py-2.5 rounded-r-lg transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 GlobalExpress Logistics Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};