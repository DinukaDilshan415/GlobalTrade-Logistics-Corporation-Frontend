import React, { useState, useEffect } from 'react';
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Globe2,
    FileText,
    ShieldCheck,
    Hash,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { GLOBAL_BASE_URL, DEFAULT_HEADERS } from '../../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const VendorAccountRequest: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { token } = useAuth();

    // Countries list fetched from backend
    const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);

    // Form State matching the requested fields
    const [formData, setFormData] = useState({
        vendorId: '',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        country: '', // will store country id
        registrationNumber: '',
        status: '',
        complianceInfo: '',
    });

    // Generate vendorId and fetch countries on mount
    useEffect(() => {
        // Generate random 4-digit number
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        const genId = `VND-${rand4}`;
        setFormData(prev => ({ ...prev, vendorId: genId }));

        // Fetch countries from backend
        const fetchCountries = async () => {
            try {
                const res = await fetch(`${GLOBAL_BASE_URL}/get/countries`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: DEFAULT_HEADERS,
                });
                if (res.ok) {
                    const json = await res.json();

                    const list = Array.isArray(json)
                        ? json.map((c: any) => ({ id: String(c.id), name: String(c.name) }))
                        : [];
                    setCountries(list.filter((c: any) => c.id && c.name));
                } else {
                    console.warn('Failed to fetch countries', res.status, res.statusText);
                }
            } catch (e) {
                console.warn('Error fetching countries', e);
            }
        };

        fetchCountries();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const sendOpenRequest = async () => {

        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/vendor/saveAccountOpenRequest`, {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify(formData)
            });

            const json = await response.json();
            if (response.ok) {

                toast.success(json.message);
                setIsSuccess(true);

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
        setIsSubmitting(true);

        setTimeout(() => {
            sendOpenRequest();
            setIsSubmitting(false);
        }, 5);
    };

    // Success State UI
    if (isSuccess) {
        return (
            <>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
                    <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-globleSecondary/15 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-globleSecondary rounded-full animate-ping opacity-20" />
                            <CheckCircle2 className="w-10 h-10 text-lime-600 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Request Submitted</h2>
                        <p className="text-sm text-slate-500 mb-8">
                            Thank you. The vendor account opening request for <span className="font-bold text-slate-800">{formData.companyName}</span> has been sent to the compliance team for review.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setFormData({ ...formData, companyName: '', contactPerson: '', email: '', phone: '', address: '', registrationNumber: '', complianceInfo: '' });
                                window.location.replace("/profile");
                            }}
                            className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] transition-all shadow-md shadow-globlePrimary/20"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center font-sans">
                <div className="max-w-4xl w-full">

                    {/* Page Header */}
                    <div className="mb-8 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-globlePrimary/10 text-globlePrimary text-xs font-bold uppercase tracking-wider mb-4">
                            <Building2 className="w-4 h-4" />
                            Vendor Onboarding
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Vendor Account Open Request
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                            Please fill out the organizational and compliance details below to initiate the vendor registration process. All fields are required for compliance auditing.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-200 overflow-hidden">
                        <div className="h-1.5 w-full bg-linear-to-r from-globlePrimary to-globleSecondary" />

                        <form onSubmit={handleSubmit} className="p-6 sm:p-10">

                            {/* --- SECTION 1: Company Details --- */}
                            <div className="mb-8">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-globlePrimary" />
                                    Company Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* Vendor ID */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Requested Vendor ID</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Hash className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="vendorId"
                                                required
                                                value={formData.vendorId}
                                                readOnly
                                                placeholder="e.g. VND-8092"
                                                className="w-full bg-slate-100 cursor-not-allowed border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-slate-100 focus:border-slate-200 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Company Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Company Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="companyName"
                                                required
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                placeholder="Full Legal Entity Name"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Registration Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registration Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="registrationNumber"
                                                required
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                                placeholder="Business Reg. / Tax ID"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Country</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Globe2 className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <select
                                                name="country"
                                                required
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select Country</option>
                                                {countries.length > 0 ? (
                                                    countries.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))
                                                ) : (
                                                    // fallback/static options if countries not fetched
                                                    <>
                                                        <option value="Sri Lanka">Sri Lanka</option>
                                                        <option value="United States">United States</option>
                                                        <option value="United Kingdom">United Kingdom</option>
                                                        <option value="China">China</option>
                                                        <option value="Germany">Germany</option>
                                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Address (Full Width) */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Business Address</label>
                                        <div className="relative">
                                            <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <textarea
                                                name="address"
                                                required
                                                rows={2}
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Full operating address"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION 2: Contact Information --- */}
                            <div className="mb-8">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                                    <User className="w-4 h-4 text-globlePrimary" />
                                    Primary Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                    {/* Contact Person */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Contact Person</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="contactPerson"
                                                required
                                                value={formData.contactPerson}
                                                onChange={handleChange}
                                                placeholder="Full Name"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="contact@company.com"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION 3: Compliance & Status --- */}
                            <div className="mb-8">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-globleSecondary" />
                                    Status & Compliance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* Status */}
                                    {/* <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Requested Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all appearance-none font-semibold"
                    >
                      <option value="Pending Assessment">Pending Assessment</option>
                      <option value="Active Partner">Active Partner</option>
                      <option value="Contractor">Contractor</option>
                    </select>
                  </div>
                </div> */}

                                    {/* Compliance Information (Full Width for mobile, half for desktop) */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                                            <span>Compliance Information</span>
                                            <span className="text-slate-400 font-normal">ISO Certs, Trade agreements, etc.</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none">
                                                <ShieldCheck className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <textarea
                                                name="complianceInfo"
                                                required
                                                rows={3}
                                                value={formData.complianceInfo}
                                                onChange={handleChange}
                                                placeholder="List compliance frameworks, certifications, and relevant trade compliance data..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Form Actions --- */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium max-w-sm text-center sm:text-left">
                                    By submitting this request, you confirm that the provided information complies with GlobalTrade vendor policies.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-lg shadow-globlePrimary/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing Request...
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Request</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VendorAccountRequest;