import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Search, FileText, DollarSign, ArrowRight,
    X, Loader2, Eye, ExternalLink, Calculator,
    ShieldAlert, FileCheck, Package,
    Percent, Hash, Clock
} from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// --- Type Definitions ---
type RiskLevel = 'UNASSIGNED' | 'LOW' | 'MEDIUM' | 'HIGH';
type CaseStatus = 'UNDER_REVIEW' | 'REQUIRED_DOCUMENTS' | 'SUBMITTED' | 'CLEARED' | 'REJECTED' | 'APPROVED';

interface CustomsCase {
    id: number;
    caseNumber: string;
    shipmentId: string;
    weight: string;
    itemDescription: string;
    customsValue: number;
    dutyAmount: number;
    riskLevel: RiskLevel;
    deadline: string;
    remarks: string;
    status: CaseStatus;
}

const REQUIRED_DOC_TYPES = [
    { key: 'commercialInvoice', label: 'Commercial Invoice' },
    { key: 'certOfOrigin', label: 'Certificate of Origin' },
    { key: 'permit', label: 'Import/Export Permit' },
    { key: 'insuranceCert', label: 'Insurance Certificate' },
    { key: 'customsDeclaration', label: 'Customs Declaration' },
    { key: 'otherDocs', label: 'Other Supporting Docs' }
];

// Mock Tariff Database based on HS Codes
const TARIFF_RATES = [
    { code: '8507.60', category: 'Metals, Machinery, & Advanced Technology (Heavy Industrial / Finished Goods)', rate: 15 },
    { code: '6204.19', category: 'Wood, Textile, Leather, & Consumer Goods (Semi-Manufactured / Light Industrial)', rate: 10 },
    { code: '8413.50', category: 'Mineral, Chemical, & Plastic Products (Basic Materials)', rate: 8 },
    { code: '8471.30', category: 'Agricultural & Living Products (Primary Goods)', rate: 5 },
    { code: '0000.00', category: 'Other / Unclassified', rate: 20 },
];

export const CustomsAgentWorkspace: React.FC = () => {
    const [cases, setCases] = useState<CustomsCase[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [now, setNow] = useState<number>(Date.now());

    // Assessment Modal State
    const [selectedCase, setSelectedCase] = useState<CustomsCase | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Document Vault State
    const [documents, setDocuments] = useState<{ [key: string]: string } | null>(null);
    const [isFetchingDocs, setIsFetchingDocs] = useState<boolean>(false);

    // --- Detailed Valuation State ---
    const [valuation, setValuation] = useState({
        goodsValue: 0,
        shippingCost: 0,
        insuranceCost: 0,
        selectedHsCodeRate: 0,
        riskLevel: 'UNASSIGNED' as RiskLevel,
        remarks: '',
        status: 'APPROVED' as CaseStatus
    });

    // Calculate totals dynamically
    const calculatedCustomsValue = valuation.goodsValue + valuation.shippingCost + valuation.insuranceCost;
    const calculatedDuty = calculatedCustomsValue * (valuation.selectedHsCodeRate / 100);

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
        const timer = window.setInterval(() => setNow(Date.now()), 60000);
        return () => window.clearInterval(timer);
    }, []);

    // --- 1. Fetch Cases ---
    const fetchCases = async () => {
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

            const response = await fetch(`${GLOBAL_BASE_URL}/custom/getReviewCases`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setCases(json.data);
                } else {
                    toast.warn(json.message);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCases(); }, []);

    // --- 2. Open Review Modal ---
    const openReviewModal = async (c: CustomsCase) => {
        setSelectedCase(c);
        setIsModalOpen(true);

        // Parse numeric weight for default freight calculation (e.g., "$10 per kg")
        const numericWeight = parseFloat(c.weight.replace(/[^0-9.]/g, '')) || 0;
        const defaultFreight = numericWeight * 10; // Mock $10/kg base rate

        setValuation({
            goodsValue: c.customsValue > 0 ? c.customsValue * 0.8 : 0, // Mock backwards calculation if already assessed
            shippingCost: c.customsValue > 0 ? c.customsValue * 0.15 : defaultFreight,
            insuranceCost: c.customsValue > 0 ? c.customsValue * 0.05 : 0,
            selectedHsCodeRate: c.dutyAmount > 0 && c.customsValue > 0 ? (c.dutyAmount / c.customsValue) * 100 : 0,
            riskLevel: c.riskLevel !== 'UNASSIGNED' ? c.riskLevel : 'UNASSIGNED',
            remarks: c.remarks || '',
            status: c.status === 'UNDER_REVIEW' ? 'APPROVED' : c.status
        });

        if (c.status == 'SUBMITTED') {
            await updateCaseStatus(c.id.toString(), 'UNDER_REVIEW');
            await fetchCases();
        }

        setDocuments(null);

        // Fetch Docs
        setIsFetchingDocs(true);
        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/custom/getDocuments/${c.id}`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                setDocuments(json)
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
            setIsFetchingDocs(false);
        }

    };

    const updateCaseStatus = async (caseId: string, newStatus: string) => {
        const data = {
            caseId,
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
            const response = await fetch(`${GLOBAL_BASE_URL}/custom/updateCaseStatus`, {
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
    };

    const openSecurePdf = async (pdfUrl: string) => {
        try {

            const response = await fetch(pdfUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch document');

            const rawBlob = await response.blob();

            const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });

            const localTabUrl = URL.createObjectURL(pdfBlob);

            console.log('Opening PDF in new tab:', localTabUrl);

            window.open(localTabUrl, '_blank');

            setTimeout(() => URL.revokeObjectURL(localTabUrl), 10000);

        } catch (error) {
            console.error('Error opening PDF:', error);
        }
    };

    // --- 3. Submit Assessment ---
    const handleSubmitAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCase) return;
        setIsSubmitting(true);

        const payload = {
            caseId: selectedCase.id,
            customsValue: calculatedCustomsValue,
            dutyAmount: calculatedDuty,
            riskLevel: valuation.riskLevel,
            remarks: valuation.remarks,
            status: valuation.status
        };

        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        console.log(payload);

        try {
            console.log(payload);
            const response = await fetch(`${GLOBAL_BASE_URL}/custom/updateCaseDecision`, {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify(payload)
            });

            const json = await response.json();
            console.log(json);
            if (response.ok) {

                if (json.status) {
                    setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, ...payload } : c));
                    toast.success(`Case ${selectedCase.caseNumber} Decision Updated Successfully!`);
                    setIsModalOpen(false);
                } else {
                    toast.warn(json.message);
                }

            } else if (response.status == 400) {
                console.log(response);
                toast.error(json.message);
            } else if (response.status == 401) {
                console.log(response);
                toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
            } else {
                console.log(response);
                toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
            }
        } catch (error) {
            toast.error("Something Wrong : " + error);
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- UI Helpers ---
    const getStatusBadge = (status: CaseStatus) => {
        switch (status) {
            case 'REQUIRED_DOCUMENTS': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'SUBMITTED': return 'bg-globlePrimary/10 text-globlePrimary border-globlePrimary/20';
            case 'APPROVED': return 'bg-globleSecondary/20 text-lime-700 border-globleSecondary/40';
            case 'CLEARED': return 'bg-lime-50 text-lime-700 border-lime-200';
            case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRiskBadge = (risk: RiskLevel) => {
        switch (risk) {
            case 'HIGH': return 'bg-red-500 text-white shadow-sm shadow-red-500/30';
            case 'MEDIUM': return 'bg-amber-400 text-slate-900';
            case 'LOW': return 'bg-globleSecondary text-slate-900 shadow-sm';
            case 'UNASSIGNED': return 'bg-slate-200 text-slate-500';
        }
    };

    const getDeadlineMeta = (deadline: string | null | undefined, status: CaseStatus, currentTime: number = Date.now()) => {
        const isActiveReviewStatus = status === 'SUBMITTED' || status === 'UNDER_REVIEW';

        if (!isActiveReviewStatus) {
            return {
                text: deadline || 'Not set',
                countdownLabel: 'Not active',
                isUrgent: false,
                isPastDue: false,
                classes: 'bg-slate-100 text-slate-600 border-slate-200'
            };
        }

        if (!deadline) {
            return {
                text: 'Not set',
                countdownLabel: 'No deadline',
                isUrgent: false,
                isPastDue: false,
                classes: 'bg-slate-100 text-slate-600 border-slate-200'
            };
        }

        const parsedDate = new Date(deadline);
        if (Number.isNaN(parsedDate.getTime())) {
            return {
                text: deadline,
                countdownLabel: 'Review date',
                isUrgent: false,
                isPastDue: false,
                classes: 'bg-slate-100 text-slate-600 border-slate-200'
            };
        }

        const diffMs = parsedDate.getTime() - currentTime;
        const totalHours = diffMs / (1000 * 60 * 60);
        const isPastDue = diffMs <= 0;
        const isUrgent = !isPastDue && totalHours <= 24;

        const hours = Math.max(0, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((Math.abs(diffMs) / (1000 * 60)) % 60));

        const formattedDate = parsedDate.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        if (isPastDue) {
            return {
                text: formattedDate,
                countdownLabel: `Overdue by ${hours}h ${minutes}m`,
                isUrgent: true,
                isPastDue: true,
                classes: 'bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-200/40'
            };
        }

        if (isUrgent) {
            return {
                text: formattedDate,
                countdownLabel: `Due in ${hours}h ${minutes}m`,
                isUrgent: true,
                isPastDue: false,
                classes: 'bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-200/40'
            };
        }

        return {
            text: formattedDate,
            countdownLabel: 'On schedule',
            isUrgent: false,
            isPastDue: false,
            classes: 'bg-slate-100 text-slate-600 border-slate-200'
        };
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || c.shipmentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Header />
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
                <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-globleSecondary" /> Customs Agent Workspace
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Review manifests, verify compliance documents, and calculate exact duties via CIF valuation.</p>
                        </div>
                    </div>

                    {/* Main Table Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search Case #, Shipment ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none shadow-sm" />
                                </div>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-56 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-globlePrimary outline-none shadow-sm cursor-pointer">
                                    <option value="ALL">All Statuses</option>
                                    <option value="SUBMITTED">Ready for Review (Submitted)</option>
                                    <option value="REQUIRED_DOCUMENTS">Awaiting Vendor Docs</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="CLEARED">Cleared</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-87.5">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                                    <p className="text-sm font-semibold uppercase tracking-wider">Syncing Regional Port Data...</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-225">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                                            <th className="p-4 pl-6">Case & Shipment</th>
                                            <th className="p-4">Cargo Description</th>
                                            <th className="p-4">Assessed Value</th>
                                            <th className="p-4">Risk Profile</th>
                                            <th className="p-4">Deadline</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 pr-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {filteredCases.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-slate-900 group-hover:text-globlePrimary transition-colors">{c.caseNumber}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{c.shipmentId}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-800">{c.itemDescription}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{c.weight}</div>
                                                </td>
                                                <td className="p-4">
                                                    {c.customsValue > 0 ? (
                                                        <>
                                                            <div className="font-bold text-slate-800">${c.customsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-xs text-slate-500">Duty: ${c.dutyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-slate-400 italic">Pending Valuation</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getRiskBadge(c.riskLevel)}`}>{c.riskLevel}</span>
                                                </td>
                                                <td className="p-4">
                                                    {(() => {
                                                        const deadlineMeta = getDeadlineMeta(c.deadline, c.status, now);
                                                        return (
                                                            <div className={`inline-flex flex-col gap-1 rounded-xl border px-2.5 py-1.5 text-left ${deadlineMeta.classes}`}>
                                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                                                                    <Clock className={`w-3.5 h-3.5 ${deadlineMeta.isUrgent ? 'text-red-600' : 'text-slate-400'}`} />
                                                                    <span>{deadlineMeta.text}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                                    {deadlineMeta.countdownLabel}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(c.status)}`}>{c.status.replace('_', ' ')}</span>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button onClick={() => openReviewModal(c)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto ${c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' ? 'bg-globlePrimary text-white hover:bg-[#0082ce] shadow-globlePrimary/20' : 'bg-white border border-slate-200 hover:border-globlePrimary hover:bg-globlePrimary/5 text-slate-700'}`}>
                                                        {c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        {c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' ? 'Assess Case' : 'View Case'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Detailed Assessment Modal --- */}
                {isModalOpen && selectedCase && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">

                            <div className="p-6 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-globleSecondary/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-globleSecondary">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-xl text-white flex items-center gap-3">
                                            {selectedCase.caseNumber}
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getStatusBadge(selectedCase.status)}`}>
                                                {selectedCase.status.replace('_', ' ')}
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Cargo Ref: <span className="text-white font-mono font-bold">{selectedCase.shipmentId}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Split View */}
                            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                                {/* Left Column: Documents & Freight Details */}
                                <div className="w-full lg:w-1/2 border-r border-slate-200 overflow-y-auto p-6 bg-slate-50/50">
                                    <div className="space-y-6">

                                        <div>
                                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <Package className="w-4 h-4 text-globlePrimary" /> Cargo Overview
                                            </h4>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Declared Description</p><p className="text-sm font-bold text-slate-900">{selectedCase.itemDescription}</p></div>
                                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Gross Weight</p><p className="text-sm font-bold text-slate-900">{selectedCase.weight}</p></div>
                                                <div className="col-span-2">
                                                    {(() => {
                                                        const deadlineMeta = getDeadlineMeta(selectedCase.deadline, selectedCase.status, now);
                                                        return (
                                                            <div className={`rounded-2xl border px-3 py-2.5 ${deadlineMeta.classes}`}>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider">Inspection Deadline</p>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <Clock className={`w-3.5 h-3.5 ${deadlineMeta.isUrgent ? 'text-red-600' : 'text-slate-400'}`} />
                                                                    <div>
                                                                        <p className="text-sm font-bold">{deadlineMeta.text}</p>
                                                                        <p className="text-[10px] font-black uppercase tracking-wider mt-0.5">{deadlineMeta.countdownLabel}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <FileCheck className="w-4 h-4 text-globleSecondary" /> Document Vault
                                            </h4>
                                            {isFetchingDocs ? (
                                                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-200"><Loader2 className="w-6 h-6 animate-spin text-globlePrimary mb-2" /></div>
                                            ) : documents ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {REQUIRED_DOC_TYPES.map(doc => {
                                                        const docUrl = documents[doc.key];
                                                        return (
                                                            <div key={doc.key} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between group hover:border-globlePrimary/40 transition-colors shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-slate-400" /></div>
                                                                    <p className="text-xs font-bold text-slate-800">{doc.label}</p>
                                                                </div>
                                                                {docUrl ? <a onClick={() => openSecurePdf(`${GLOBAL_BASE_URL}${docUrl}`)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-globlePrimary/10 text-globlePrimary rounded-lg text-[10px] font-bold uppercase hover:bg-globlePrimary/20"><ExternalLink className="w-3 h-3 inline mr-1" /> View</a> : <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Missing</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-6 bg-slate-100 border border-slate-200 rounded-2xl text-center"><p className="text-sm font-bold text-slate-500">Documents not provided yet.</p></div>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                {/* Right Column: Detailed CIF & HS Valuation Calculator */}
                                <div className="w-full lg:w-1/2 overflow-y-auto bg-slate-100/50">
                                    <form id="assessment-form" onSubmit={handleSubmitAssessment} className="p-6 space-y-6">

                                        {/* The Receipt-Style Calculator Breakdown */}
                                        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden">
                                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                                                <h4 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                                                    <Calculator className="w-4 h-4 text-globleSecondary" /> Customs Valuation
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">CIF Method</span>
                                            </div>

                                            <div className="p-6 space-y-5">
                                                {/* CIF Inputs */}
                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm font-bold text-slate-700 w-1/2">Goods Value (Cost)</label>
                                                    <div className="relative w-1/2">
                                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                        <input type="number" step="0.01" value={valuation.goodsValue || ''} onChange={e => setValuation({ ...valuation, goodsValue: parseFloat(e.target.value) || 0 })} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:border-globlePrimary outline-none text-right" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm font-bold text-slate-700 w-1/2">Shipping (Freight)</label>
                                                    <div className="relative w-1/2">
                                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                        <input type="number" step="0.01" value={valuation.shippingCost || ''} onChange={e => setValuation({ ...valuation, shippingCost: parseFloat(e.target.value) || 0 })} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:border-globlePrimary outline-none text-right" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <label className="text-sm font-bold text-slate-700 w-1/2">Insurance</label>
                                                    <div className="relative w-1/2">
                                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                        <input type="number" step="0.01" value={valuation.insuranceCost || ''} onChange={e => setValuation({ ...valuation, insuranceCost: parseFloat(e.target.value) || 0 })} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:border-globlePrimary outline-none text-right" />
                                                    </div>
                                                </div>

                                                {/* CIF Subtotal */}
                                                <div className="pt-4 border-t border-slate-200 border-dashed flex items-center justify-between">
                                                    <label className="text-sm font-black text-slate-900">Customs Value (CIF)</label>
                                                    <span className="text-lg font-black text-slate-900 font-mono">${calculatedCustomsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>

                                                {/* HS Code Selection -> Generates Duty Rate */}
                                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                                                    <div className="w-1/2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Harmonized System Code</label>
                                                        <div className="relative">
                                                            <Hash className="absolute left-3 top-2.5 w-4 h-4 text-globlePrimary" />
                                                            <select
                                                                value={valuation.selectedHsCodeRate}
                                                                onChange={e => setValuation({ ...valuation, selectedHsCodeRate: parseFloat(e.target.value) })}
                                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-globlePrimary outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="0">Select HS Category...</option>
                                                                {TARIFF_RATES.map(t => (
                                                                    <option key={t.code} value={t.rate}>{t.code} - {t.category}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="w-1/2 flex items-center justify-end gap-2 mt-4">
                                                        <label className="text-sm font-bold text-slate-700">Duty Rate</label>
                                                        <div className="relative w-24">
                                                            <input type="number" readOnly value={valuation.selectedHsCodeRate} className="w-full pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-bold outline-none text-right text-globlePrimary" />
                                                            <Percent className="absolute right-3 top-3 w-3 h-3 text-globlePrimary" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Final Calculation */}
                                                <div className="pt-4 border-t-2 border-slate-800 flex items-center justify-between bg-globleSecondary/10 -mx-6 px-6 pb-2 mt-4">
                                                    <label className="text-base font-black text-lime-800 uppercase tracking-wider">Estimated Duty</label>
                                                    <span className="text-2xl font-black text-lime-700 font-mono">${calculatedDuty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Operational Settings */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Risk Level Assignment</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(['LOW', 'MEDIUM', 'HIGH'] as RiskLevel[]).map(risk => (
                                                    <div key={risk} onClick={() => setValuation({ ...valuation, riskLevel: risk })} className={`cursor-pointer rounded-lg py-2.5 text-center text-xs font-black uppercase tracking-wider border-2 transition-all ${valuation.riskLevel === risk ? risk === 'LOW' ? 'border-globleSecondary bg-globleSecondary/10 text-lime-700' : risk === 'MEDIUM' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}>
                                                        {risk}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Officer Remarks</label>
                                            <textarea required rows={2} value={valuation.remarks} onChange={e => setValuation({ ...valuation, remarks: e.target.value })} placeholder="Detail the reasoning for valuations or holds..." className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none resize-none" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-extrabold text-slate-900 uppercase">Final Decision / Status Update</label>
                                            <select required value={valuation.status} onChange={e => setValuation({ ...valuation, status: e.target.value as CaseStatus })} className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:border-globlePrimary outline-none shadow-sm cursor-pointer">
                                                <option value="APPROVED">✅ Approved & Cleared</option>
                                                <option value="DOCUMENTS_REQUIRED">⚠️ Reject - Require New Documents</option>
                                                <option value="REJECTED">❌ Cargo Rejected / Confiscated</option>
                                            </select>
                                        </div>

                                    </form>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm border border-slate-200">
                                    Cancel
                                </button>
                                <button type="submit" form="assessment-form" disabled={isSubmitting || valuation.riskLevel === 'UNASSIGNED'} className="px-8 py-2.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing to Ledger...</> : <>Submit Final Assessment <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
            <Footer />
        </>
    );
};

export default CustomsAgentWorkspace;