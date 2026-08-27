import React, { useState, useEffect } from 'react';
import {
    Bell, Search, AlertTriangle,
    ShieldAlert, Info, CheckCircle2, Clock,
    Check, CheckSquare, Loader2, Package,
    Truck, FileText, Activity
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

// --- API Configuration ---

const API_CONFIG = {
    USE_REAL_API: false,
    ENDPOINTS: {
        GET_ALERTS: '/admin/alerts',
        ACKNOWLEDGE_ALERT: '/admin/alerts/acknowledge/'
    }
};

// --- Type Definitions ---
type AlertType = 'SHIPMENT_DELAY' | 'INVENTORY_SHORTAGE' | 'CUSTOMS_DEADLINE' | 'SYSTEM_ERROR';
type AlertSeverity = 'CRITICAL' | 'WARNING' | 'NOTICE' | 'HIGH';
type AlertStatus = 'UNREAD' | 'ACKNOWLEDGED';

interface SystemAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    relatedEntity: string;
    datetime: string;
    status: AlertStatus;
}

export const AlertsCenter: React.FC = () => {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('UNREAD'); // Default to unacknowledged

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

    // --- 1. Fetch Alerts ---
    const fetchAlerts = async () => {
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

            const response = await fetch(`${GLOBAL_BASE_URL}/alert/getAll`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setAlerts(json.data);
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

    useEffect(() => { fetchAlerts(); }, []);

    // --- 2. Acknowledge Alert ---
    const handleAcknowledge = async (id: string) => {
        setIsProcessing(id);
        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }
        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/alert/updateStatus`, {
                method: "PUT",
                credentials: "include",
                headers,
                body: JSON.stringify({ id, status: 'ACKNOWLEDGED' })
            });

            const json = await response.json();
            if (response.ok) {

                if(json.status) {
                    toast.success(`Alert ${id} is Acknowledged successfully`);
                    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
                } else {
                    toast.error(json.message);
                }

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
        } finally {
            setIsProcessing(null);
        }
    };


    // const handleAcknowledge = async (id: string) => {
    //     setIsProcessing(id);
    //     try {
    //         if (API_CONFIG.USE_REAL_API) {
    //             await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.ACKNOWLEDGE_ALERT}${id}`, {
    //                 method: 'PATCH',
    //                 headers: DEFAULT_HEADERS,
    //                 body: JSON.stringify({ status: 'ACKNOWLEDGED' })
    //             });
    //         } else {
    //             await new Promise(resolve => setTimeout(resolve, 500));
    //         }

    //         // Optimistic Update
    //         setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    //     } catch (err) {
    //         console.error('Error acknowledging alert:', err);
    //     } finally {
    //         setIsProcessing(null);
    //     }
    // };

    const handleAcknowledgeAll = async () => {
        const unreadIds = alerts.filter(a => a.status === 'UNREAD').map(a => a.id);
        if (unreadIds.length === 0) return;

        if (!window.confirm("Acknowledge all unread alerts?")) return;

        setIsLoading(true);
        try {
            if (API_CONFIG.USE_REAL_API) {
                await Promise.all(unreadIds.map(id =>
                    fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.ACKNOWLEDGE_ALERT}${id}`, {
                        method: 'PATCH', headers: DEFAULT_HEADERS, body: JSON.stringify({ status: 'ACKNOWLEDGED' })
                    })
                ));
            } else {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            setAlerts(prev => prev.map(a => ({ ...a, status: 'ACKNOWLEDGED' })));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- UI Helpers ---
    const getSeverityStyles = (severity: AlertSeverity) => {
        switch (severity) {
            case 'CRITICAL': return { border: 'border-l-red-500', bg: 'bg-red-50/50', iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700', Icon: ShieldAlert };
            case 'HIGH': return { border: 'border-l-orange-500', bg: 'bg-orange-50/30', iconColor: 'text-orange-500', badge: 'bg-orange-100 text-orange-700', Icon: AlertTriangle };
            case 'WARNING': return { border: 'border-l-amber-500', bg: 'bg-amber-50/30', iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', Icon: AlertTriangle };
            case 'NOTICE': return { border: 'border-l-yellow-400', bg: 'bg-yellow-50/30', iconColor: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700', Icon: Info };
        }
    };

    const getTypeIcon = (type: AlertType) => {
        switch (type) {
            case 'SHIPMENT_DELAY': return <Truck className="w-4 h-4" />;
            case 'INVENTORY_SHORTAGE': return <Package className="w-4 h-4" />;
            case 'CUSTOMS_DEADLINE': return <FileText className="w-4 h-4" />;
            case 'SYSTEM_ERROR': return <Activity className="w-4 h-4" />;
        }
    };

    const formatTypeLabel = (type: AlertType) => {
        return type.replace('_', ' ');
    };

    // --- Filtering ---
    const filteredAlerts = alerts.filter(a => {
        const matchesSearch = a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.relatedEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const unreadCount = alerts.filter(a => a.status === 'UNREAD').length;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Bell className="w-8 h-8 text-globlePrimary" /> Alert Center
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Monitor critical logistics delays, inventory shortages, and system errors.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleAcknowledgeAll}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors w-max"
                        >
                            <CheckSquare className="w-4 h-4 text-globlePrimary" /> Acknowledge All ({unreadCount})
                        </button>
                    )}
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by entity ID or message..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                            <button onClick={() => setStatusFilter('UNREAD')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === 'UNREAD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Unread</button>
                            <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Alerts</button>
                        </div>

                        <select
                            value={severityFilter}
                            onChange={e => setSeverityFilter(e.target.value)}
                            className="w-full sm:w-40 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-globlePrimary outline-none cursor-pointer"
                        >
                            <option value="ALL">All Severities</option>
                            <option value="CRITICAL">🔴 Critical</option>
                            <option value="HIGH">🟠 High</option>
                            <option value="WARNING">🟠 Warning</option>
                            <option value="NOTICE">🟡 Notice</option>
                        </select>
                    </div>
                </div>

                {/* Alert Feed List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                            <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Syncing Alerts...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                            <CheckCircle2 className="w-12 h-12 text-globleSecondary mb-3 opacity-50" />
                            <p className="text-base font-bold text-slate-600">You're all caught up!</p>
                            <p className="text-sm text-slate-400 mt-1">No alerts match your current filter criteria.</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => {
                            const styles = getSeverityStyles(alert.severity);
                            const SeverityIcon = styles.Icon;
                            const isAcknowledged = alert.status === 'ACKNOWLEDGED';

                            return (
                                <div
                                    key={alert.id}
                                    className={`relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 ${!isAcknowledged ? `border-l-4 ${styles.border} ${styles.bg}` : 'opacity-70 grayscale-20'
                                        }`}
                                >
                                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">

                                        {/* Icon & Severity Badge */}
                                        <div className="flex flex-col items-center gap-2 shrink-0 w-24">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 ${styles.iconColor}`}>
                                                <SeverityIcon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${styles.badge}`}>
                                                {alert.severity}
                                            </span>
                                        </div>

                                        {/* Alert Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{alert.id}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {alert.datetime}</span>
                                                <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
                                                    {getTypeIcon(alert.type)} {formatTypeLabel(alert.type)}
                                                </span>
                                            </div>

                                            <p className={`text-base sm:text-lg font-bold leading-snug ${isAcknowledged ? 'text-slate-600' : 'text-slate-900'}`}>
                                                {alert.message}
                                            </p>

                                            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                Related Entity:
                                                <span className="text-globlePrimary bg-globlePrimary/10 px-2 py-0.5 rounded border border-globlePrimary/20 cursor-pointer hover:bg-globlePrimary/20 transition-colors">
                                                    {alert.relatedEntity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                            {!isAcknowledged ? (
                                                <button
                                                    onClick={() => handleAcknowledge(alert.id)}
                                                    disabled={isProcessing === alert.id}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-globleSecondary hover:bg-globleSecondary/10 text-slate-700 hover:text-lime-700 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    {isProcessing === alert.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    Acknowledge
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    <CheckCircle2 className="w-4 h-4" /> Acknowledged
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default AlertsCenter;