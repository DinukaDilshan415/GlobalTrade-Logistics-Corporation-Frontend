import React, { useState, useEffect } from 'react';
import { 
  ScrollText, Search, Filter, Download, 
  Clock, CheckCircle2, XCircle, AlertTriangle, 
  User, Shield, Activity, CalendarDays, Loader2,
  Database
} from 'lucide-react';

// --- API Configuration ---
const GLOBAL_BASE_URL = 'http://localhost:8080/api/v1';
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

const API_CONFIG = {
  USE_REAL_API: false,
  ENDPOINTS: {
    GET_LOGS: '/admin/logs/audit'
  }
};

// --- Type Definitions ---
type LogStatus = 'SUCCESS' | 'WARNING' | 'FAILURE';
type ModuleType = 'AUTH' | 'SHIPMENTS' | 'CUSTOMS' | 'INVENTORY' | 'USERS' | 'SYSTEM';

interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  module: ModuleType;
  status: LogStatus;
  ipAddress: string;
  details: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- 1. Fetch Logs ---
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      if (API_CONFIG.USE_REAL_API) {
        const res = await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.GET_LOGS}`, { headers: DEFAULT_HEADERS });
        if (res.ok) setLogs(await res.json());
      } else {
        // SIMULATION
        await new Promise(resolve => setTimeout(resolve, 800));
        setLogs([
          {
            id: 'LOG-993821', timestamp: '2026-08-30 14:28:45', actorName: 'Dinuka Dilshan', actorRole: 'System Admin',
            action: 'UPDATE_USER_ROLE', module: 'USERS', status: 'SUCCESS', ipAddress: '192.168.1.45',
            details: 'Updated role for user USR-003 to Customs Agent.'
          },
          {
            id: 'LOG-993820', timestamp: '2026-08-30 14:15:12', actorName: 'System Process', actorRole: 'EJB Timer',
            action: 'SYNC_INVENTORY', module: 'INVENTORY', status: 'FAILURE', ipAddress: '10.0.0.12',
            details: 'Database timeout while updating stock levels for Colombo Central Hub.'
          },
          {
            id: 'LOG-993819', timestamp: '2026-08-30 13:45:00', actorName: 'Officer K. Fernando', actorRole: 'Customs Agent',
            action: 'CLEAR_SHIPMENT', module: 'CUSTOMS', status: 'SUCCESS', ipAddress: '203.114.22.8',
            details: 'Cleared customs case CUS-2026-0888. Duty assessed: $13,350.00.'
          },
          {
            id: 'LOG-993818', timestamp: '2026-08-30 11:30:22', actorName: 'Sarah Jenkins', actorRole: 'Logistics Coordinator',
            action: 'CREATE_SHIPMENT', module: 'SHIPMENTS', status: 'SUCCESS', ipAddress: '198.51.100.24',
            details: 'Created internal shipment SHP-10025 from Frankfurt Distribution.'
          },
          {
            id: 'LOG-993817', timestamp: '2026-08-30 09:12:05', actorName: 'Unknown', actorRole: 'Anonymous',
            action: 'UNAUTHORIZED_ACCESS', module: 'AUTH', status: 'WARNING', ipAddress: '45.22.19.102',
            details: 'Failed login attempt. Invalid credentials provided 3 times.'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // --- UI Helpers ---
  const getStatusStyles = (status: LogStatus) => {
    switch (status) {
      case 'SUCCESS': return 'text-lime-700 bg-[#b2d235]/20 border-[#b2d235]/40';
      case 'WARNING': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'FAILURE': return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'WARNING': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'FAILURE': return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getModuleBadge = (module: ModuleType) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ";
    switch (module) {
      case 'AUTH': return base + 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SHIPMENTS': return base + 'bg-[#0096ed]/10 text-[#0096ed] border-[#0096ed]/20';
      case 'CUSTOMS': return base + 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'INVENTORY': return base + 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'USERS': return base + 'bg-orange-50 text-orange-700 border-orange-200';
      case 'SYSTEM': return base + 'bg-slate-100 text-slate-700 border-slate-300';
      default: return base + 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesModule && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ScrollText className="w-8 h-8 text-[#0096ed]" /> System Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">Immutable ledger of all user actions, security events, and system transactions.</p>
          </div>
          <button 
            onClick={() => alert("Exporting filtered logs to CSV...")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors w-max"
          >
            <Download className="w-4 h-4" /> Export Logs
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events (24h)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">1,284</h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Failed Operations</p>
              <h3 className="text-2xl font-black text-red-600 mt-1">{logs.filter(l => l.status === 'FAILURE').length}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><XCircle className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Security Warnings</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{logs.filter(l => l.status === 'WARNING').length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Shield className="w-5 h-5" /></div>
          </div>
        </div>

        {/* Main Log Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Filtering Toolbar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by ID, User, or Action..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#0096ed] outline-none shadow-sm" 
                />
              </div>

              <select 
                value={moduleFilter} 
                onChange={e => setModuleFilter(e.target.value)} 
                className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-[#0096ed] outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">All Modules</option>
                <option value="AUTH">Authentication</option>
                <option value="SHIPMENTS">Shipments</option>
                <option value="CUSTOMS">Customs</option>
                <option value="INVENTORY">Inventory</option>
                <option value="USERS">Users & Roles</option>
                <option value="SYSTEM">System/EJB</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-[#0096ed] outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="FAILURE">Failure</option>
              </select>

            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2.5 rounded-xl shadow-sm">
              <CalendarDays className="w-4 h-4 text-[#0096ed]" /> Today, 30 Aug 2026
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#0096ed] mb-3" />
                <p className="text-sm font-semibold uppercase tracking-wider">Retrieving Secure Logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Database className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">No logs match the current filters.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="p-4 pl-6 w-48">Timestamp & ID</th>
                    <th className="p-4 w-48">User / Actor</th>
                    <th className="p-4 w-40">Event Type</th>
                    <th className="p-4">Details & Target</th>
                    <th className="p-4 pr-6 w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Timestamp & ID */}
                      <td className="p-4 pl-6 align-top">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {log.timestamp.split(' ')[1]}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{log.timestamp.split(' ')[0]}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 group-hover:text-[#0096ed] transition-colors">{log.id}</div>
                      </td>

                      {/* Actor Information */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {log.actorName === 'System Process' ? <Database className="w-3 h-3 text-[#0096ed]" /> : <User className="w-3 h-3 text-slate-400" />}
                          {log.actorName}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{log.actorRole}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 border border-slate-200 bg-white px-1.5 py-0.5 rounded max-w-max">
                          IP: {log.ipAddress}
                        </div>
                      </td>

                      {/* Module & Action */}
                      <td className="p-4 align-top">
                        <span className={getModuleBadge(log.module)}>{log.module}</span>
                        <div className="text-xs font-bold text-slate-700 mt-2">{log.action}</div>
                      </td>

                      {/* Details */}
                      <td className="p-4 align-top">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed max-w-md">
                          {log.details}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4 pr-6 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(log.status)}`}>
                          {getStatusIcon(log.status)} {log.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Showing {filteredLogs.length} recorded events</span>
            <span>GlobalTrade Logistics Core</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuditLogs;