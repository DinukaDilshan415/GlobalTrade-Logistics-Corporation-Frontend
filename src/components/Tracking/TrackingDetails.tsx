import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Package,
  Plane,
  Clock,
  CalendarDays,
  CheckCircle2,
  Bell,
  Printer,
  ChevronRight,
  Info,
  Truck,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../api/client';

interface TrackingDetailsData {
  id: string;
  status: string;
  originCountry: string;
  originAddress: string;
  destCountry: string;
  destAddress: string;
  expectedDate: string;
  expectedTime: string;
  carrier: string;
  weight: string;
  category: 'DIRECT' | 'INVENTORY';
  totalItems: number;
  customsCleared: boolean;
}

interface TimelineNode {
  id?: string | number;
  status: string;
  location: string;
  description: string;
  datetime: string;
}

export const TrackingDetails: React.FC = () => {
  const [trackingId, setTrackingId] = useState<string>('SHP1024');
  const [shipmentDetails, setShipmentDetails] = useState<TrackingDetailsData | null>(null);
  const [timelineLogs, setTimelineLogs] = useState<TimelineNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { token, setAuth } = useAuth();

  const tryRefresh = async () => {
    try {
      const response = await fetch(`${GLOBAL_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const json = await response.json();
        console.log(json);
        setAuth(json.accessToken, json.roles);
      } else if (response.status == 401) {
        setAuth(null, []);
        window.location.href = "/login";
      } else {
        console.log(response);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchShipmentDetails = async (id: string) => {

    try {
      const headers: Record<string, string> = {
        ...DEFAULT_HEADERS,
      };

      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      } else {
        console.warn('No auth token available; request will be sent without Authorization header');
      }

      const response = await fetch(`${GLOBAL_BASE_URL}/shipment/tracking/${id}`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const json = await response.json();
        console.log(json);
        if (json.status) {
          setShipmentDetails(json.shipmentDetails);
          setTimelineLogs(json.shipmentProgresses)
        } else {
          alert(json.message)
          window.location.href = "/";
        }

      } else if (response.status == 401) {
        console.log(response);
        tryRefresh();
      } else {
        console.log(response);
        toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
      }
    } catch (error) {
      toast.error("Something Wrong : " + error);
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id') || 'SHP1024';
    setTrackingId(id);

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchShipmentDetails(id),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Compute 3-Step Lifecycle: Start (ACCEPTED) -> Dynamic In-Between -> End (DELIVERED)
  const isAccepted = timelineLogs.some(log => log.status === 'ACCEPTED') || shipmentDetails?.status !== 'PENDING';
  const isDelivered = timelineLogs.some(log => log.status === 'DELIVERED') || shipmentDetails?.status === 'DELIVERED';
  const currentIntermediateStatus = !isDelivered && shipmentDetails?.status !== 'ACCEPTED'
    ? shipmentDetails?.status || 'IN_TRANSIT'
    : 'PROCESSING / IN TRANSIT';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="w-10 h-10 text-globlePrimary animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider animate-pulse">
          Loading Tracking Information...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* 1. Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-globlePrimary transition-colors"
          >
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
          <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-globlePrimary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="text-globleSecondary text-xs font-bold tracking-widest uppercase mb-1 block">
                Tracking Number
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {shipmentDetails?.id || trackingId}
              </h1>
            </div>

            <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 w-max">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-globlePrimary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-globlePrimary"></span>
              </span>
              <span className="text-white font-bold text-sm tracking-wide uppercase">
                {shipmentDetails?.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block" />

              <div className="relative z-10 bg-white pr-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Origin</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{shipmentDetails?.originAddress}</h3>
                <p className="text-xs font-medium text-slate-500">{shipmentDetails?.originCountry}</p>
              </div>

              <div className="relative z-10 bg-white px-4 hidden sm:block">
                <div className="w-10 h-10 rounded-full bg-globlePrimary/10 flex items-center justify-center text-globlePrimary">
                  <Plane className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10 bg-white pl-4 text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Destination</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{shipmentDetails?.destAddress}</h3>
                <p className="text-xs font-medium text-slate-500">{shipmentDetails?.destCountry}</p>
              </div>
            </div>

            <div className="col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-globlePrimary">
                <CalendarDays className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Expected Delivery</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{shipmentDetails?.expectedDate}</p>
              <p className="text-sm text-slate-500 font-medium">{shipmentDetails?.expectedTime}</p>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Progress Stepper (Start: ACCEPTED -> Middle: Dynamic -> End: DELIVERED) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 overflow-x-auto hide-scrollbar">
          <div className="min-w-125">
            <div className="flex items-center justify-between relative px-8">
              <div className="absolute top-5 left-12 right-12 h-1 bg-slate-100 z-0 rounded-full" />
              <div
                className="absolute top-5 left-12 h-1 bg-globlePrimary z-0 rounded-full transition-all duration-700"
                style={{
                  width: isDelivered ? '100%' : isAccepted ? '50%' : '0%'
                }}
              />

              {/* Start Node */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isAccepted ? 'bg-globlePrimary text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isAccepted ? 'text-slate-900' : 'text-slate-400'}`}>
                    Accepted
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Origin Confirmed</span>
                </div>
              </div>

              {/* Intermediate Dynamic Node */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isDelivered
                  ? 'bg-globlePrimary text-white'
                  : isAccepted
                    ? 'bg-white border-globlePrimary text-globlePrimary ring-4 ring-globlePrimary/20'
                    : 'bg-slate-100 text-slate-400'
                  }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${!isDelivered && isAccepted ? 'text-globlePrimary' : 'text-slate-900'}`}>
                    {currentIntermediateStatus.replace('_', ' ')}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Transit Checkpoints</span>
                </div>
              </div>

              {/* End Node */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isDelivered ? 'bg-globleSecondary text-slate-900 font-bold' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDelivered ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    Delivered
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Final Destination</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 4. Detailed History Timeline (Fetched from separate DB Table) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-globlePrimary" />
              Tracking Timeline
            </h3>

            {timelineLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No tracking update events logged for this consignment yet.
              </div>
            ) : (
              <div className="space-y-0 relative">
                <div className="absolute top-4 bottom-4 left-5.5 w-0.5 bg-slate-100 z-0" />

                {timelineLogs.map((log, index) => {
                  const isLatest = index === 0;
                  return (
                    <div key={index} className="relative z-10 flex gap-6 pb-8 last:pb-0 group">
                      <div className="shrink-0 mt-1">
                        {isLatest ? (
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

                      <div className={`grow bg-slate-50 p-4 rounded-2xl border transition-colors ${isLatest ? 'border-globlePrimary/30 shadow-sm' : 'border-slate-100'
                        }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                          <h4 className={`text-base font-bold ${isLatest ? 'text-globlePrimary' : 'text-slate-900'}`}>
                            {log.status.replace('_', ' ')}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 w-max">
                            {log.datetime}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Shipment Details (Right Column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Info className="w-4 h-4 text-globlePrimary" />
                Shipment Specifications
              </h3>

              <dl className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Assigned Carrier
                  </dt>
                  <dd className="text-sm font-bold text-slate-900">{shipmentDetails?.carrier}</dd>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Total Weight
                  </dt>
                  <dd className="text-sm font-bold text-slate-900">{shipmentDetails?.weight}</dd>
                </div>

                {/* <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Shipment Type
                  </dt>
                  <dd className="text-sm font-bold text-globlePrimary">
                    {shipmentDetails?.category === 'INVENTORY' ? 'Warehouse Stock' : 'Direct Consignment'}
                  </dd>
                </div> */}

                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Package Quantity</dt>
                  <dd className="text-sm font-bold text-slate-900">{shipmentDetails?.totalItems} Units</dd>
                </div>

                <div className="flex justify-between items-center">
                  <dt className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Customs Status
                  </dt>
                  <dd className="text-xs font-bold px-2 py-0.5 rounded bg-lime-50 text-lime-700 border border-lime-200">
                    {shipmentDetails?.customsCleared ? 'Cleared for Transit' : 'Pending Declaration'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 rounded-3xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-globleSecondary/20 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-base font-bold mb-4 relative z-10">Consignment Actions</h3>
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => alert('Subscribed to real-time SMS notifications.')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-globleSecondary" />
                    Subscribe to Alerts
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-globlePrimary" />
                    Print Manifest Copy
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

export default TrackingDetails;