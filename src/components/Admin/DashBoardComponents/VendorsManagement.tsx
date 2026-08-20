import React, { useState, useEffect } from 'react';
import {
    Building2,
    Search,
    Filter,
    Download,
    Plus,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    AlertTriangle,
    Globe2,
    MoreVertical
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// --- Type Definitions ---
type VendorStatus = 'review' | 'active' | 'warning' | 'suspended';

interface Vendor {
    vendorId: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    registrationNumber: string;
    complianceInfo: string;
    status: VendorStatus;
}

export const VendorsManagement: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoading(true);

            try {
                const headers: Record<string, string> = {
                    ...DEFAULT_HEADERS,
                };

                if (token) {
                    headers['Authorization'] = 'Bearer ' + token;
                } else {
                    console.warn('No auth token available; request will be sent without Authorization header');
                }

                const response = await fetch(`${GLOBAL_BASE_URL}/vendor/getAllVendors`, {
                    method: "GET",
                    credentials: "include",
                    headers,
                });

                if (response.ok) {
                    const json = await response.json();

                    const mockData: Vendor[] = json;

                    setVendors(mockData);

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
            } finally {
                setIsLoading(false);
            }
        };

        fetchVendors();
    }, []);

    const updateVendorStatus = async (vendorId: string, newStatus: VendorStatus) => {

        const data = {
            vendorId,
            newStatus
        }

        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/vendor/updateStatus`, {
                method: "PUT",
                credentials: "include",
                headers,
                body: JSON.stringify(data)
            });

            const json = await response.json();
            if (response.ok) {

                toast.success(json.message);

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

    const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
        setVendors(prevVendors =>
            prevVendors.map(vendor =>
                vendor.vendorId === vendorId ? { ...vendor, status: newStatus } : vendor
            )
        );

        updateVendorStatus(vendorId, newStatus);
    };

    // --- Helper to style the status dropdown ---
    const getStatusStyles = (status: VendorStatus) => {
        switch (status) {
            case 'active': return 'bg-[#b2d235]/10 text-lime-700 border-[#b2d235]/30 focus:ring-[#b2d235]/50';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500/30';
            case 'suspended': return 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500/30';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    // --- Filter Logic ---
    const filteredVendors = vendors.filter(v =>
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vendorId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-300">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-globlePrimary" />
                        Vendor Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage vendor profiles, compliance records, and active network statuses.
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-globlePrimary hover:bg-[#0082ce] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-globlePrimary/20">
                    <Plus className="w-4 h-4" /> Add Vendor
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Toolbar */}
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Company or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-globlePrimary/20 focus:border-globlePrimary transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto min-h-100">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 w-full text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-globlePrimary" />
                            <p className="text-sm font-semibold uppercase tracking-wider">Fetching Vendors...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-250">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-4 pl-6">Vendor Details</th>
                                    <th className="p-4">Contact Information</th>
                                    <th className="p-4">Registration & Region</th>
                                    <th className="p-4 w-64">Compliance Info</th>
                                    <th className="p-4 w-56">Network Status</th>
                                    <th className="p-4 pr-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendorId} className="hover:bg-slate-50 transition-colors group">

                                        {/* Column 1: Vendor Details */}
                                        <td className="p-4 pl-6 align-top">
                                            <div className="font-bold text-slate-900 text-base mb-1">{vendor.companyName}</div>
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                                                {vendor.vendorId}
                                            </div>
                                        </td>

                                        {/* Column 2: Contact Info Grouped */}
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-slate-800 mb-1">{vendor.contactPerson}</div>
                                            <div className="flex flex-col gap-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {vendor.email}</span>
                                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</span>
                                            </div>
                                        </td>

                                        {/* Column 3: Registration Grouped */}
                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                                                <Globe2 className="w-4 h-4 text-globlePrimary" /> {vendor.country}
                                            </div>
                                            <div className="text-xs text-slate-500 line-clamp-1 mb-1" title={vendor.address}>
                                                {vendor.address}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-600">
                                                Reg: {vendor.registrationNumber}
                                            </div>
                                        </td>

                                        {/* Column 4: Compliance */}
                                        <td className="p-4 align-top">
                                            <div className="flex items-start gap-2">
                                                {vendor.status === 'suspended' ? (
                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                ) : (
                                                    <ShieldCheck className="w-4 h-4 text-globleSecondary shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-xs text-slate-600 font-medium line-clamp-3">
                                                    {vendor.complianceInfo}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Column 5: Interactive Status Dropdown */}
                                        <td className="p-4 align-top">
                                            <select
                                                value={vendor.status}
                                                onChange={(e) => handleStatusChange(vendor.vendorId, e.target.value as VendorStatus)}
                                                className={`w-full appearance-none border rounded-lg px-3 py-2 text-xs font-bold shadow-sm cursor-pointer outline-none transition-colors ${getStatusStyles(vendor.status)}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="review">Review</option>
                                                <option value="warning">Warning</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Click to change status</p>
                                        </td>

                                        {/* Column 6: Actions */}
                                        <td className="p-4 pr-6 align-top text-right">
                                            <button className="p-2 text-slate-400 hover:text-globlePrimary hover:bg-slate-100 rounded-lg transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                                {/* Empty State */}
                                {!isLoading && filteredVendors.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                                            No vendors found matching your search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
                    <span>Showing {filteredVendors.length} vendors</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-50">Next</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorsManagement;