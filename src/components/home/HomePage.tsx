import React, { useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { 
  CalendarDays, 
  FileText, 
  Building2, 
  ArrowRight, 
  Sparkles,
  PackageCheck
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    alert(`Tracking order number: ${trackingNumber}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-800">
      {/* 1. Header */}
      <Header />

      <main className="grow">
        {/* 2. Hero Section */}
        <div className="relative">
          {/* Background image & gradient overlay */}
          <div 
            className="relative h-120 sm:h-130 md:h-140 w-full bg-cover bg-center overflow-hidden"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop')`,
            }}
          >
            {/* Smooth gradient scrim for high readability */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/40 to-slate-900/30 backdrop-blur-[0.5px]" />

            {/* Hero Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center -mt-10">
              
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-globleSecondary text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-globleSecondary" />
                Next-Gen Delivery Network
              </div>

              {/* Hero Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                Track Your <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-white to-blue-200">Shipment</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-xl font-normal drop-shadow">
                Enter your consignment or tracking ID to view real-time location & estimated delivery time.
              </p>

              {/* Modern Search Pill */}
              <form 
                onSubmit={handleTrackSubmit}
                className="mt-8 w-full max-w-2xl bg-white p-2 sm:p-2.5 rounded-full shadow-2xl ring-4 ring-white/20 flex items-center transition-all focus-within:ring-globlePrimary/40"
              >
                <div className="pl-4 pr-2 flex items-center gap-3 grow">
                  <PackageCheck className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter your tracking number(s)..."
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium outline-none"
                  />
                </div>
                
                {/* Track Button (Primary Color) */}
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 rounded-full font-bold text-white text-sm sm:text-base transition-all transform active:scale-95 shadow-md flex items-center gap-2 shrink-0 bg-globlePrimary hover:bg-[#0082ce] shadow-globlePrimary/30"
                >
                  <span>Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* 3. Floating Bottom Cards (Overlapping the Hero) */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Ship Now */}
              <div 
                onMouseEnter={() => setActiveCard(1)}
                onMouseLeave={() => setActiveCard(null)}
                className="group relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-globlePrimary/10 text-globlePrimary flex items-center justify-center mb-5 group-hover:bg-globlePrimary group-hover:text-white transition-colors duration-300">
                    <CalendarDays className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-globlePrimary transition-colors">
                    Ship Now
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Find the right parcel or freight service with door-to-door convenience and instant booking.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-globlePrimary gap-1 group-hover:gap-2 transition-all">
                  <span>Create Shipment</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card 2: Get a Quote */}
              <div 
                onMouseEnter={() => setActiveCard(2)}
                onMouseLeave={() => setActiveCard(null)}
                className="group relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-globleSecondary/20 text-lime-700 flex items-center justify-center mb-5 group-hover:bg-globleSecondary group-hover:text-slate-900 transition-colors duration-300">
                    <FileText className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-lime-700 transition-colors">
                    Get a Quote
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Estimate shipping costs and compare transit speed options across global routes.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-lime-700 gap-1 group-hover:gap-2 transition-all">
                  <span>Calculate Rate</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card 3: Business Portal (Highlighted with Secondary Accent Corner) */}
              <div 
                onMouseEnter={() => setActiveCard(3)}
                onMouseLeave={() => setActiveCard(null)}
                className="group relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl border-2 border-globlePrimary/20 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Corner Accent Badge */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-globleSecondary rotate-45 flex items-end justify-center pb-1 shadow-sm">
                  <span className="text-[9px] font-black text-slate-900 tracking-wider">PRO</span>
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-globlePrimary to-globleSecondary text-white flex items-center justify-center mb-5 shadow-md shadow-globlePrimary/20">
                    <Building2 className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-globlePrimary transition-colors">
                    Express for Business
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Shipping regularly? Request a corporate business account and profit from exclusive bulk discounts.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-globlePrimary gap-1 group-hover:gap-2 transition-all">
                  <span>Open Business Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. Quick Highlights Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-globlePrimary uppercase">Modern Logistics</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Everything you need to deliver worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-2xl overflow-hidden shadow-md group h-72">
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop" 
                alt="Express Delivery" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-bold text-globleSecondary uppercase tracking-wider">Same Day & Next Day</span>
                <h4 className="text-xl font-bold text-white mt-1">E-Commerce & Express Courier</h4>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-md group h-72">
              <img 
                src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1000&auto=format&fit=crop" 
                alt="Freight Cargo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-bold text-globlePrimary uppercase tracking-wider">Global Solutions</span>
                <h4 className="text-xl font-bold text-white mt-1">Air & Ocean Freight Forwarding</h4>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;