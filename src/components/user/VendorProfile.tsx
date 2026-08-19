import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Globe2
} from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../api/client';
import { toast } from 'react-toastify';

// Define the shape of the vendor data expected from the backend
interface VendorData {
  vendorId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  registrationNumber: string;
  status: 'active' | 'review' | 'suspended';
  complianceInfo: string;
  joinedDate: string;
}

export const VendorProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);

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

  // Simulate checking the backend for a vendor account on page load
  useEffect(() => {
    const checkVendorAccount = async () => {

      try {
        const headers: Record<string, string> = {
          ...DEFAULT_HEADERS,
        };

        if (token) {
          headers['Authorization'] = 'Bearer ' + token;
        } else {
          console.warn('No auth token available; request will be sent without Authorization header');
        }

        const response = await fetch(`${GLOBAL_BASE_URL}/vendor/getProfile`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const json = await response.json();
          console.log(json);

          if (json.hasAccount) {
            setHasAccount(true);
            setVendorData({
              vendorId: json.vendorId,
              companyName: json.companyName,
              contactPerson: json.contactPerson,
              email: json.email,
              phone: json.phone,
              address: json.address,
              country: json.country,
              registrationNumber: json.regNumber,
              status: json.status,
              complianceInfo: json.complianceInformation,
              joinedDate: json.createdAt
            });
          } else {
            setHasAccount(false);
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
        setHasAccount(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVendorAccount();
  }, []);

  // Handler for navigating to the open account page
  const handleOpenAccount = () => {
    window.location.replace("/open-vender-account");
  };

  // 1. Loading State View
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="w-10 h-10 text-globlePrimary animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider animate-pulse">
          Retrieving Vendor Profile...
        </p>
      </div>
    );
  }

  // 2. No Account State View
  if (!hasAccount) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans">
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-lg w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              No Vendor Account Found
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
              Your user profile is not currently linked to an active GlobalTrade vendor account. To supply goods, bid on logistics contracts, or manage shipments, you must register as a vendor.
            </p>
            <button
              onClick={handleOpenAccount}
              className="w-full py-4 px-6 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] transition-all shadow-md shadow-globlePrimary/20 flex items-center justify-center gap-2 transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Open a Vendor Account
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // 3. Active Vendor Profile View
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Vendor Profile
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage your organizational details, compliance data, and network status.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Top Banner Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="h-24 bg-linear-to-r from-slate-900 to-slate-800 relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-globlePrimary/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="px-6 sm:px-10 pb-8 relative">
              {/* Avatar & Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 mb-6">
                <div className="flex items-end gap-5">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-300">
                      {vendorData?.companyName.charAt(0)}
                    </div>
                  </div>
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {vendorData?.companyName}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                      ID: {vendorData?.vendorId}
                    </p>
                  </div>
                </div>

                {/* Dynamic Status Badge */}
                <div className="mb-2 sm:mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm 
                  ${vendorData?.status === 'active'
                      ? 'bg-globleSecondary/10 text-lime-700 border-globleSecondary/30'
                      : vendorData?.status === 'suspended'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    {vendorData?.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {vendorData?.status}
                  </span>
                </div>
              </div>

              {/* Quick Stats/Meta row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registration No.</p>
                  <p className="text-sm font-bold text-slate-900">{vendorData?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operating Region</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Globe2 className="w-4 h-4 text-globlePrimary" />
                    {vendorData?.country}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-sm font-bold text-slate-900">{vendorData?.joinedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Network Access</p>
                  <p className="text-sm font-bold text-lime-600 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Fully Verified
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-globlePrimary" />
                Contact Information
              </h3>

              <dl className="space-y-5">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Primary Contact
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900">{vendorData?.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900">{vendorData?.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900">{vendorData?.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Business Address
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {vendorData?.address}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Compliance & Documents Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-globleSecondary" />
                Compliance Details
              </h3>

              <div className="grow">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Declared Compliance Data
                </dt>
                <dd className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 h-32 overflow-y-auto">
                  {vendorData?.complianceInfo}
                </dd>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    View Audit Logs
                  </span>
                  <span className="text-globlePrimary">View</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Update Tax Documents
                  </span>
                  <span className="text-globlePrimary">Upload</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VendorProfile;