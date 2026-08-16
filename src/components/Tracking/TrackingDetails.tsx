import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Plane, 
  Clock, 
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Bell,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';

export const TrackingDetails: React.FC = () => {
  // Mock Data based on your requirements + realistic additions
  const trackingData = {
    id: 'SHP1024',
    status: 'In Transit',
    origin: 'Shanghai, CN',
    destination: 'Colombo, LK',
    expectedDate: '20 Aug 2026',
    expectedTime: 'By 18:00',
    serviceType: 'Global Express Air',
    weight: '4.5 kg',
    dimensions: '40 x 30 x 20 cm',
    totalPieces: 1,
    reference: 'REF-88392-XX'
  };

  // Timeline Progress Definition
  const steps = [
    { id: 1, label: 'Picked Up', state: 'completed', icon: <Package className="w-5 h-5" /> },
    { id: 2, label: 'Departed', state: 'completed', icon: <Plane className="w-5 h-5" /> },
    { id: 3, label: 'In Transit', state: 'current', icon: <Clock className="w-5 h-5" /> },
    { id: 4, label: 'Arrived', state: 'pending', icon: <MapPin className="w-5 h-5" /> },
    { id: 5, label: 'Delivered', state: 'pending', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  // Detailed History Log
  const historyLog = [
    {
      date: 'Aug 16, 2026',
      time: '14:15 Local Time',
      status: 'In Transit',
      location: 'Transit Hub, Singapore',
      description: 'Shipment has arrived at transit facility and is being processed for connecting flight.',
      isCurrent: true
    },
    {
      date: 'Aug 15, 2026',
      time: '22:30 Local Time',
      status: 'Departed',
      location: 'Shanghai Pudong Int. (PVG)',
      description: 'Shipment departed from origin facility.',
      isCurrent: false
    },
    {
      date: 'Aug 15, 2026',
      time: '16:45 Local Time',
      status: 'Processed',
      location: 'Shanghai Gateway, CN',
      description: 'Shipment processed and customs cleared for export.',
      isCurrent: false
    },
    {
      date: 'Aug 15, 2026',
      time: '09:00 Local Time',
      status: 'Picked Up',
      location: 'Shanghai Warehouse, CN',
      description: 'Shipment picked up by courier.',
      isCurrent: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* 1. Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-globlePrimary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </button>
          <div className="flex items-center gap-2">
            <img 
              className="h-8 w-auto object-contain"
              src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
              alt="GlobalTrade Logo" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* 2. Hero Summary Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-globlePrimary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-globleSecondary text-xs font-bold tracking-widest uppercase mb-1 block">Tracking Number</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {trackingData.id}
              </h1>
            </div>
            
            <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 w-max">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-globlePrimary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-globlePrimary"></span>
              </span>
              <span className="text-white font-bold text-sm tracking-wide uppercase">{trackingData.status}</span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Route */}
            <div className="col-span-1 md:col-span-2 flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block" />
              
              <div className="relative z-10 bg-white pr-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Origin</p>
                <h3 className="text-xl font-bold text-slate-900">{trackingData.origin}</h3>
              </div>

              <div className="relative z-10 bg-white px-4 hidden sm:block">
                <div className="w-10 h-10 rounded-full bg-globlePrimary/10 flex items-center justify-center text-globlePrimary">
                  <Plane className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10 bg-white pl-4 text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Destination</p>
                <h3 className="text-xl font-bold text-slate-900">{trackingData.destination}</h3>
              </div>
            </div>

            {/* Expected Delivery */}
            <div className="col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-globlePrimary">
                <CalendarDays className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Expected Delivery</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{trackingData.expectedDate}</p>
              <p className="text-sm text-slate-500 font-medium">{trackingData.expectedTime}</p>
            </div>

          </div>
        </div>

        {/* 3. Horizontal Progress Stepper */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 overflow-x-auto hide-scrollbar">
          <div className="min-w-150">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line Base */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 z-0 rounded-full" />
              
              {/* Connecting Line Active */}
              <div 
                className="absolute top-5 left-8 h-1 bg-globlePrimary z-0 rounded-full transition-all duration-1000"
                style={{ width: '50%' }} // Hardcoded 50% for "In Transit" (step 3 of 5)
              />

              {steps.map((step, index) => {
                const isCompleted = step.state === 'completed';
                const isCurrent = step.state === 'current';
                const isPending = step.state === 'pending';

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 w-24">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${
                      isCompleted ? 'bg-globlePrimary text-white' : 
                      isCurrent ? 'bg-white border-globlePrimary text-globlePrimary ring-4 ring-globlePrimary/20' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-globlePrimary' : 
                        isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 4. Detailed History Timeline (Left Column) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-globlePrimary" />
              Tracking Timeline
            </h3>

            <div className="space-y-0 relative">
              {/* Vertical Line */}
              <div className="absolute top-4 bottom-4 left-5.25 w-0.5 bg-slate-100 z-0" />

              {historyLog.map((log, index) => (
                <div key={index} className="relative z-10 flex gap-6 pb-8 last:pb-0 group">
                  {/* Timeline Dot */}
                  <div className="shrink-0 mt-1">
                    {log.isCurrent ? (
                      <div className="w-11 h-11 rounded-full bg-globlePrimary/10 flex items-center justify-center ring-4 ring-white relative">
                        <span className="absolute w-full h-full rounded-full border border-globlePrimary animate-ping opacity-50" />
                        <div className="w-3.5 h-3.5 rounded-full bg-globlePrimary" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center ring-4 ring-white border border-slate-200 group-hover:border-globlePrimary transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-globlePrimary transition-colors" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`grow bg-slate-50 p-4 rounded-2xl border transition-colors ${
                    log.isCurrent ? 'border-globlePrimary/30 shadow-sm' : 'border-slate-100'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                      <h4 className={`text-base font-bold ${log.isCurrent ? 'text-globlePrimary' : 'text-slate-900'}`}>
                        {log.status}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 w-max">
                        {log.date} • {log.time}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm font-medium text-slate-700 mb-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      {log.location}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Shipment Details (Right Column) */}
          <div className="space-y-6">
            
            {/* Shipment Meta Data */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Info className="w-4 h-4 text-globlePrimary" />
                Shipment Details
              </h3>
              
              <dl className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Service</dt>
                  <dd className="text-sm font-bold text-slate-900">{trackingData.serviceType}</dd>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Weight</dt>
                  <dd className="text-sm font-bold text-slate-900">{trackingData.weight}</dd>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Dimensions</dt>
                  <dd className="text-sm font-bold text-slate-900">{trackingData.dimensions}</dd>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Total Pieces</dt>
                  <dd className="text-sm font-bold text-slate-900">{trackingData.totalPieces}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Reference</dt>
                  <dd className="text-sm font-bold text-slate-900">{trackingData.reference}</dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-3xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-globleSecondary/20 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-base font-bold mb-4">Need help with this?</h3>
              <div className="space-y-3 relative z-10">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-globleSecondary" />
                    Get SMS Updates
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-globlePrimary" />
                    Print Summary
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};