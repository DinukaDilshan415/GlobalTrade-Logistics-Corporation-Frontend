import React, { useState, useEffect } from 'react';
import {
    Activity, Server, Database, Cpu,
    Clock, RefreshCw, CheckCircle2,
    HardDrive,
    Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { toast } from 'react-toastify';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { useAuth } from '../../context/AuthContext';

interface SystemMetric {
    timestamp: string;
    timeLabel: string;
    appStatus: string;
    uptime: string;
    jvmUsagePct: number;
    usedMemoryMB: number;
    maxMemoryMB: number;
    cpuLoad: number;
    availableCpus: number;
    dbStatus: string;
}

export const SystemMonitoring: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemMetric[]>([]);
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

    // --- 1. Simulate Fetch & Parse Raw TXT Data ---
    const fetchMetrics = async () => {
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

            const response = await fetch(`${GLOBAL_BASE_URL}/monitoring/getSystemMetrics`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const rawData = await response.json();
                console.log(rawData);

                const parsedData = parseSystemMetrics(rawData);

                setMetrics(parsedData);

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

    const parseSystemMetrics = (raw: string[]): SystemMetric[] => {
        const cleaned = raw.filter(item => item && item.trim() !== "");

        const groups: string[][] = [];
        for (let i = 0; i < cleaned.length; i += 9) {
            groups.push(cleaned.slice(i, i + 9));
        }

        return groups.map((item) => {
            const timestamp = item[0].replace(/^\[|\]$/g, "");
            const tsDate = new Date(timestamp);

            return {
                timestamp,
                timeLabel: `${tsDate.getHours()}:${String(tsDate.getMinutes()).padStart(2, "0")}:${String(tsDate.getSeconds()).padStart(2, "0")}`,
                appStatus: item[1].split(":")[1]?.trim() ?? "",
                uptime: item[2].split(":")[1]?.trim() ?? "",
                jvmUsagePct: Number(item[3].split(":")[1]?.replace("%", "").trim() ?? 0),
                usedMemoryMB: Number(item[4].split(":")[1]?.replace("MB", "").trim() ?? 0),
                maxMemoryMB: Number(item[5].split(":")[1]?.replace("MB", "").trim() ?? 0),
                cpuLoad: Number(item[6].split(":")[1]?.replace("%", "").trim() ?? 0),
                availableCpus: Number(item[7].split(":")[1]?.trim() ?? 0),
                dbStatus: item[8].split(":")[1]?.trim() ?? "",
            };
        });
    };

//     const fetchMetric = async () => {
//         setIsLoading(true);
//         try {
//             if (API_CONFIG.USE_REAL_API) {
//                 const res = await fetch(API_CONFIG.ENDPOINT);
//                 if (res.ok) setMetrics(await res.json());
//             } else {
//                 // SIMULATION: Parsing the exact provided text log format
//                 await new Promise(resolve => setTimeout(resolve, 800));

//                 const rawTxtData = `[2026-08-30T15:04:10.333705900]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 1 seconds
// JVM Memory Usage   : 74.58%
// Used Memory        : 381 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:15.001762200]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 5 seconds
// JVM Memory Usage   : 76.16%
// Used Memory        : 389 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:20.002168200]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 10 seconds
// JVM Memory Usage   : 76.78%
// Used Memory        : 393 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:25.113946100]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 16 seconds
// JVM Memory Usage   : 55.45%
// Used Memory        : 283 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:30.002234200]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 20 seconds
// JVM Memory Usage   : 55.66%
// Used Memory        : 284 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:35.001500900]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 25 seconds
// JVM Memory Usage   : 55.77%
// Used Memory        : 285 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:40.001659400]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 30 seconds
// JVM Memory Usage   : 55.88%
// Used Memory        : 286 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:45.002056400]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 35 seconds
// JVM Memory Usage   : 55.99%
// Used Memory        : 286 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:50.001456]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 40 seconds
// JVM Memory Usage   : 56.09%
// Used Memory        : 287 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE

// [2026-08-30T15:04:55.002269]
// Application Status : ONLINE
// Application Uptime : 0 days, 0 hours, 0 minutes, 45 seconds
// JVM Memory Usage   : 56.23%
// Used Memory        : 287 MB
// Max Memory         : 512 MB
// CPU Load Average   : -100.00%
// Available CPUs     : 4
// Database Status    : ONLINE`;

//                 const blocks = rawTxtData.trim().split('\n\n');
//                 const parsedData: SystemMetric[] = blocks.map(block => {
//                     const lines = block.split('\n');
//                     const tsRaw = lines[0].replace('[', '').replace(']', '');
//                     const tsDate = new Date(tsRaw);

//                     return {
//                         timestamp: tsRaw,
//                         timeLabel: `${tsDate.getHours()}:${String(tsDate.getMinutes()).padStart(2, '0')}:${String(tsDate.getSeconds()).padStart(2, '0')}`,
//                         appStatus: lines[1].split(':')[1].trim(),
//                         uptime: lines[2].split(':')[1].trim(),
//                         jvmUsagePct: parseFloat(lines[3].split(':')[1].replace('%', '').trim()),
//                         usedMemoryMB: parseInt(lines[4].split(':')[1].replace('MB', '').trim()),
//                         maxMemoryMB: parseInt(lines[5].split(':')[1].replace('MB', '').trim()),
//                         cpuLoad: parseFloat(lines[6].split(':')[1].replace('%', '').trim()),
//                         availableCpus: parseInt(lines[7].split(':')[1].trim()),
//                         dbStatus: lines[8].split(':')[1].trim(),
//                     };
//                 });

//                 setMetrics(parsedData);
//             }
//         } catch (err) {
//             console.error("Error fetching system metrics", err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

    useEffect(() => {
        fetchMetrics();
        // Optional: Setup a polling interval here for live updates
        // const interval = setInterval(fetchMetrics, 5000);
        // return () => clearInterval(interval);
    }, []);

    const latest = metrics[metrics.length - 1];

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Activity className="w-8 h-8 text-globlePrimary" /> System Monitoring
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">EJB Container telemetry, JVM memory allocation, and real-time database connection status.</p>
                    </div>
                    <button
                        onClick={fetchMetrics}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors w-max disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-globlePrimary' : ''}`} />
                        Live Refresh
                    </button>
                </div>

                {/* --- KPI Status Cards --- */}
                {!isLoading && latest && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* App Status */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-globlePrimary/10 flex items-center justify-center text-globlePrimary">
                                    <Server className="w-5 h-5" />
                                </div>
                                <span className="relative flex h-3 w-3">
                                    {latest.appStatus === 'ONLINE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${latest.appStatus === 'ONLINE' ? 'bg-lime-500' : 'bg-red-500'}`}></span>
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">EJB Application</p>
                                <h3 className="text-xl font-black text-slate-900">{latest.appStatus}</h3>
                            </div>
                        </div>

                        {/* DB Status */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-globleSecondary/20 flex items-center justify-center text-lime-700">
                                    <Database className="w-5 h-5" />
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-lime-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">MySQL Database</p>
                                <h3 className="text-xl font-black text-slate-900">{latest.dbStatus}</h3>
                            </div>
                        </div>

                        {/* Uptime */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Application Uptime</p>
                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                    {latest.uptime.replace('0 days, 0 hours, ', '')}
                                </h3>
                            </div>
                        </div>

                        {/* Current Memory KPI */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <HardDrive className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-black text-slate-900">{latest.jvmUsagePct}%</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">JVM Memory Usage</p>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${latest.jvmUsagePct > 85 ? 'bg-red-500' : 'bg-globlePrimary'}`}
                                        style={{ width: `${latest.jvmUsagePct}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 mt-2 text-right">
                                    {latest.usedMemoryMB} MB / {latest.maxMemoryMB} MB
                                </p>
                            </div>
                        </div>

                    </div>
                )}

                {/* --- Charts Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 1. JVM Memory Area Chart */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-globlePrimary" /> JVM Heap Memory Allocation
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Real-time memory consumption (MB). Notice the GC cleanup at 15:04:25.</p>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0096ed" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0096ed" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 512]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="usedMemoryMB"
                                            name="Used Memory (MB)"
                                            stroke="#0096ed"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMemory)"
                                            animationDuration={1000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 2. CPU Load Line Chart */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-globleSecondary" /> Processor Load Average
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">CPU Load % across {latest?.availableCpus || 4} available cores.</p>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        {/* YAxis adjusted to handle the -100% data anomaly cleanly */}
                                        <YAxis domain={[-110, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                                        />
                                        <Line
                                            type="stepAfter"
                                            dataKey="cpuLoad"
                                            name="CPU Load (%)"
                                            stroke="#b2d235"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#b2d235', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- Raw Logs Table --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Raw Telemetry Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                                    <th className="p-4 pl-6">Timestamp</th>
                                    <th className="p-4">App Status</th>
                                    <th className="p-4">DB Status</th>
                                    <th className="p-4">Memory (Used/Max)</th>
                                    <th className="p-4 pr-6">CPU Load</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-mono">
                                {metrics.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors text-xs text-slate-600">
                                        <td className="p-4 pl-6 font-bold text-slate-800">{m.timestamp}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${m.appStatus === 'ONLINE' ? 'bg-lime-50 text-lime-700' : 'bg-red-50 text-red-700'}`}>
                                                {m.appStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-lime-600 font-bold">{m.dbStatus}</td>
                                        <td className="p-4">
                                            {m.usedMemoryMB} MB / {m.maxMemoryMB} MB
                                            <span className="text-slate-400 ml-2">({m.jvmUsagePct}%)</span>
                                        </td>
                                        <td className="p-4 pr-6 text-slate-500">{m.cpuLoad}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SystemMonitoring;