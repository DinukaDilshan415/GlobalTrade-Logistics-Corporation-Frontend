import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Search, ShieldAlert,
  FileText, Upload, CheckCircle2, Clock,
  AlertTriangle, User, DollarSign, Calendar,
  ArrowRight, X, Loader2, Eye, FileCheck,
  RefreshCw, AlertCircle, ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { useAuth } from '../../context/AuthContext';

const API_CONFIG = {
  USE_REAL_API: true,
  ENDPOINTS: {
    GET_CASES: '/customs/cases',
    GET_CASE_DETAILS: '/customs/cases/',
    SUBMIT_DOCUMENTS: '/customs/cases/submit-documents',
    GET_CASE_DOCUMENTS: '/customs/cases/documents/'
  }
};

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | '-';
type CaseStatus = 'UNDER_REVIEW' | 'DOCUMENTS_REQUIRED' | 'SUBMITTED' | 'CLEARED' | 'REJECTED' | 'APPROVED' | 'CUSTOMS_REVIEW';

interface CustomsCase {
  id: number;
  caseNumber: string;
  shipmentId: string;
  customsValue: number;
  dutyAmount: number;
  riskLevel: RiskLevel;
  submittedDate: string;
  deadline: string;
  clearedDate: string | null;
  assignedOfficer: string;
  remarks: string;
  status: CaseStatus;
}

// Required Document Categories
const REQUIRED_DOC_TYPES = [
  { key: 'commercialInvoice', label: 'Commercial Invoice' },
  { key: 'certOfOrigin', label: 'Certificate of Origin' },
  { key: 'permit', label: 'Import/Export Permit' },
  { key: 'insuranceCert', label: 'Insurance Certificate' },
  { key: 'customsDeclaration', label: 'Customs Declaration' },
  { key: 'otherDocs', label: 'Other Supporting Documents' }
];

export const CustomsCompliance: React.FC = () => {
  const [cases, setCases] = useState<CustomsCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Detail View State
  const [selectedCase, setSelectedCase] = useState<CustomsCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmittingDocs, setIsSubmittingDocs] = useState<boolean>(false);
  const [isFetchingDocs, setIsFetchingDocs] = useState<boolean>(false);

  // Document States
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [existingDocuments, setExistingDocuments] = useState<{ [key: string]: string } | null>(null);

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

  // --- 1. Fetch Customs Cases ---
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

      const response = await fetch(`${GLOBAL_BASE_URL}/custom/getAllCases`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const json = await response.json();
        console.log(json);

        if (json.status) {
          setCases(json.data);
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

  useEffect(() => {
    fetchCases();
  }, []);

  // --- 2. Open Details Modal & Fetch Existing Docs if applicable ---
  const openCaseDetails = async (c: CustomsCase) => {
    setSelectedCase(c);
    setIsModalOpen(true);

    // Reset states
    setUploadedFiles({
      commercialInvoice: null, certOfOrigin: null, permit: null,
      insuranceCert: null, customsDeclaration: null, otherDocs: null
    });
    setExistingDocuments(null);

    if (c.status !== 'DOCUMENTS_REQUIRED') {
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

          setExistingDocuments(json)

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

  // --- 3. Handle File Uploads (for REQUIRED_DOCUMENTS state) ---
  const handleFileChange = (docKey: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [docKey]: file }));
  };

  const allDocsUploaded = REQUIRED_DOC_TYPES.every(doc => uploadedFiles[doc.key] !== null);

  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    if (!allDocsUploaded) {
      alert("Please upload all 6 required compliance documents before submitting.");
      return;
    }

    setIsSubmittingDocs(true);
    const formData = new FormData();
    formData.append('caseId', selectedCase.id.toString());
    formData.append('caseNumber', selectedCase.caseNumber);

    REQUIRED_DOC_TYPES.forEach(doc => {
      const file = uploadedFiles[doc.key];
      if (file) {
        formData.append(doc.key, file as Blob);
      }
    });

    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
    };

    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    } else {
      console.warn('No auth token available; request will be sent without Authorization header');
    }

    try {
      console.log([...formData.entries()]);
      const response = await fetch(`${GLOBAL_BASE_URL}/custom/submitDocuments`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData
      });

      const json = await response.json();
      console.log(json);
      if (response.ok) {

        if (json.status) {
          setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status: 'SUBMITTED' } : c));
          setSelectedCase(prev => prev ? { ...prev, status: 'SUBMITTED' } : null);

          toast.success(`All 6 documents verified. Case ${selectedCase.caseNumber} status updated to SUBMITTED.`);
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
      // tryRefresh();
      toast.error("Something Wrong : " + error);
      console.error("Error:", error);
    } finally {
      setIsSubmittingDocs(false);
    }
  }

  // --- Helpers for Styling ---
  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'DOCUMENTS_REQUIRED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUBMITTED': return 'bg-globlePrimary/10 text-globlePrimary border-globlePrimary/20';
      case 'CLEARED': return 'bg-globleSecondary/20 text-lime-700 border-globleSecondary/40';
      case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CUSTOMS_REVIEW': return 'bg-emerald-500 text-white border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      case "APPROVED": return 'bg-lime-500 text-white border-lime-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-500 text-white shadow-sm shadow-red-500/30';
      case 'MEDIUM': return 'bg-amber-400 text-slate-900';
      case 'LOW': return 'bg-lime-500 text-white shadow-sm shadow-lime-500/30';
    }
  };

  // Filtering
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shipmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter == 'ALL' || c.status == statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-globlePrimary" /> Customs & Compliance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              International trade regulations, port clearance audits, duty calculations, and document submission.
            </p>
          </div>
          <button onClick={fetchCases} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors w-max">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Audits
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Audits</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{cases.length}</h3>
            </div>
            <div className="p-3 bg-globlePrimary/10 text-globlePrimary rounded-xl"><FileText className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Requires Docs</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{cases.filter(c => c.status === 'DOCUMENTS_REQUIRED').length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-lime-700 uppercase tracking-wider">Cleared Cases</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{cases.filter(c => c.status === 'CLEARED').length}</h3>
            </div>
            <div className="p-3 bg-globleSecondary/20 text-lime-700 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk Holds</p>
              <h3 className="text-2xl font-black text-red-600 mt-1">{cases.filter(c => c.riskLevel === 'HIGH').length}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Case #, Shipment ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-56 py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-globlePrimary outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="DOCUMENTS_REQUIRED">Required Documents</option>
                <option value="UNDER_REVIEW">Pending Review</option>
                <option value="CUSTOMS_REVIEW">Customs Review</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="REJECTED">Rejected</option>
                <option value="APPROVED">Approved</option>
                <option value="CLEARED">Cleared</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-87.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                <p className="text-sm font-semibold uppercase tracking-wider">Syncing Compliance Registry...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">No customs cases found matching query.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-250">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="p-4 pl-6">Case & Shipment</th>
                    <th className="p-4">Valuation & Duty</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4">Deadlines</th>
                    <th className="p-4">Assigned Officer</th>
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
                        <div className="font-bold text-slate-800">${c.customsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs text-slate-500">Duty: ${c.dutyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getRiskBadge(c.riskLevel)}`}>{c.riskLevel}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Target: <span className="font-bold">{c.deadline}</span>
                        </div>
                        {c.clearedDate && <div className="text-[11px] text-lime-700 font-bold mt-0.5">Cleared: {c.clearedDate}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-globlePrimary" /> {c.assignedOfficer}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button onClick={() => openCaseDetails(c)} className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-globlePrimary hover:bg-globlePrimary/5 text-globlePrimary rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto">
                          <Eye className="w-3.5 h-3.5" /> View Case
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

      {/* --- Full Case Details Modal --- */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-globlePrimary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-extrabold text-xl text-white">{selectedCase.caseNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(selectedCase.status)}`}>
                    {selectedCase.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Associated Consignment: <span className="text-white font-mono font-bold">{selectedCase.shipmentId}</span></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">

              {/* COMPREHENSIVE CASE DETAILS GRID */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <AlertCircle className="w-4 h-4 text-globlePrimary" /> Full Case Details
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customs Value</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5"><DollarSign className="inline w-4 h-4 text-slate-400" />{selectedCase.customsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Assessed Duty</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5"><DollarSign className="inline w-4 h-4 text-slate-400" />{selectedCase.dutyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Risk Level</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getRiskBadge(selectedCase.riskLevel)}`}>{selectedCase.riskLevel}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Officer</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-globlePrimary" /> {selectedCase.assignedOfficer}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted Date</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedCase.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Inspection Deadline</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedCase.deadline}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cleared Date</p>
                    <p className={`text-sm font-bold mt-0.5 ${selectedCase.clearedDate ? 'text-lime-600' : 'text-slate-400 italic'}`}>
                      {selectedCase.clearedDate || 'Not yet cleared'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">Officer Remarks & Instructions</h4>
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed font-medium">
                    {selectedCase.remarks || 'No remarks provided.'}
                  </div>
                </div>
              </div>

              {/* DOCUMENT SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-globlePrimary" /> Customs Documents
                  </h4>
                </div>

                {/* SCENARIO A: Status is REQUIRED_DOCUMENTS -> Show Upload Form */}
                {selectedCase.status === 'DOCUMENTS_REQUIRED' ? (
                  <form onSubmit={handleSubmitDocuments} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {REQUIRED_DOC_TYPES.map((doc, idx) => {
                        const file = uploadedFiles[doc.key];
                        return (
                          <div key={doc.key} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${file ? 'border-globleSecondary bg-globleSecondary/10' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">{idx + 1}</span>
                                <span className="text-xs font-bold text-slate-800">{doc.label}</span>
                              </div>
                              {file ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-lime-700"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Required</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:border-globlePrimary rounded-xl text-xs font-semibold text-slate-600 transition-colors shadow-sm">
                                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="truncate max-w-45">{file ? file.name : 'Choose PDF...'}</span>
                                </div>
                                <input type="file" className="hidden" accept=".pdf" onChange={e => handleFileChange(doc.key, e.target.files?.[0] || null)} />
                              </label>
                              {file && (
                                <button type="button" onClick={() => handleFileChange(doc.key, null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-slate-500">Submitting updates status to <span className="font-bold text-slate-800">"SUBMITTED"</span>.</p>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={!allDocsUploaded || isSubmittingDocs} className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmittingDocs ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Submit Documentation <ArrowRight className="w-4 h-4" /></>}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (

                  /* SCENARIO B: Status is NOT REQUIRED_DOCUMENTS -> Show Fetched Existing Documents */
                  <div>
                    {isFetchingDocs ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                        <p className="text-sm font-semibold uppercase tracking-wider">Retrieving Vault Documents...</p>
                      </div>
                    ) : existingDocuments ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {REQUIRED_DOC_TYPES.map((doc) => {
                          const docUrl = existingDocuments[doc.key];
                          return (
                            <div key={doc.key} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between group hover:border-globlePrimary/40 transition-colors shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-globlePrimary transition-colors" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{doc.label}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Uploaded</p>
                                </div>
                              </div>
                              {docUrl ? (
                                <a
                                  onClick={() => openSecurePdf(`${GLOBAL_BASE_URL}${docUrl}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-globlePrimary/5 hover:bg-globlePrimary/10 text-globlePrimary rounded-lg text-[11px] font-bold transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> View
                                </a>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 italic">Not Available</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-sm">Failed to load documents.</div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 transition-colors">Close Viewer</button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomsCompliance;