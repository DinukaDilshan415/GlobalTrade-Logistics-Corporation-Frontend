import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Zap, Clock, Database, 
  Activity, TrendingUp, AlertTriangle, RefreshCw,
  Server, ShieldCheck, Timer
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// --- API Configuration ---
const GLOBAL_BASE_URL = 'http://localhost:8080/api/v1';
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

const API_CONFIG = {
  USE_REAL_API: false,
  ENDPOINTS: {
    GET_PERFORMANCE_METRICS: '/admin/performance/metrics',
    GET_BOTTLENECKS: '/admin/performance/bottlenecks'
  }
};

// --- Type Definitions ---
interface TimeSeriesMetric {
  time: string;
  avgLatencyMs: number;
  maxLatencyMs: number;
  throughput: number; // Transactions per second (TPS)
}

interface ServiceOverhead {
  service: string;
  interceptorMs: number;
  dbTransactionMs: number;
  businessLogicMs: number;
}

interface Bottleneck {
  id: string;
  methodName: string;
  module: string;
  avgExecutionTimeMs: number;
  invocationCount: number;
  lastOccurred: string;
  status: 'WARNING' | 'CRITICAL' | 'OPTIMIZED';
}

export const SystemPerformance: React.FC = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesMetric[]>([]);
  const [overheadData, setOverheadData] = useState<ServiceOverhead[]>([]);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Simulate Fetching Performance Telemetry ---
  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      if (API_CONFIG.USE_REAL_API) {
        const [metricsRes, bottlenecksRes] = await Promise.all([
          fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.GET_PERFORMANCE_METRICS}`, { headers: DEFAULT_HEADERS }),
          fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.GET_BOTTLENECKS}`, { headers: DEFAULT_HEADERS })
        ]);
        if (metricsRes.ok) {
          const mData = await metricsRes.json();
          setTimeSeriesData(mData.timeSeries);
          setOverheadData(mData.overhead);
        }
        if (bottlenecksRes.ok) setBottlenecks(await bottlenecksRes.json());
      } else {
        // SIMULATION
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 1. Time Series (Latency & Throughput over last 30 mins)
        const now = new Date();
        const mockTimeSeries: TimeSeriesMetric[] = [];
        for (let i = 10; i >= 0; i--) {
          const t = new Date(now.getTime() - i * 3 * 60000);
          mockTimeSeries.push({
            time: `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`,
            avgLatencyMs: 120 + Math.random() * 40,
            maxLatencyMs: 300 + Math.random() * 150,
            throughput: 45 + Math.random() * 20
          });
        }
        setTimeSeriesData(mockTimeSeries);

        // 2. Service Overhead (EJB Interceptor vs DB vs Business Logic)
        setOverheadData([
          { service: 'ShipmentEJB', interceptorMs: 15, businessLogicMs: 45, dbTransactionMs: 85 },
          { service: 'InventoryEJB', interceptorMs: 12, businessLogicMs: 30, dbTransactionMs: 120 },
          { service: 'CustomsEJB', interceptorMs: 25, businessLogicMs: 90, dbTransactionMs: 65 },
          { service: 'VendorEJB', interceptorMs: 10, businessLogicMs: 20, dbTransactionMs: 40 },
        ]);

        // 3. System Bottlenecks
        setBottlenecks([
          { id: 'BTN-01', methodName: 'updateBulkInventory()', module: 'InventoryEJB', avgExecutionTimeMs: 1250, invocationCount: 342, lastOccurred: '2 mins ago', status: 'CRITICAL' },
          { id: 'BTN-02', methodName: 'validateCustomsDocs()', module: 'CustomsInterceptor', avgExecutionTimeMs: 450, invocationCount: 1289, lastOccurred: '5 mins ago', status: 'WARNING' },
          { id: 'BTN-03', methodName: 'calculateRouteOptimization()', module: 'LogisticsTimer', avgExecutionTimeMs: 320, invocationCount: 45, lastOccurred: '15 mins ago', status: 'WARNING' },
          { id: 'BTN-04', methodName: 'fetchVendorMetrics()', module: 'VendorEJB', avgExecutionTimeMs: 85, invocationCount: 4500, lastOccurred: 'Just now', status: 'OPTIMIZED' }
        ]);
      }
    } catch (err) {
      console.error("Error fetching performance metrics", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Calculate top-level KPIs
  const currentAvgLatency = timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1].avgLatencyMs.toFixed(0) : 0;
  const currentThroughput = timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1].throughput.toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-[#b2d235]" /> Application Performance
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitor EJB transaction latency, interceptor overhead, and throughput.</p>
          </div>
          <button 
            onClick={fetchPerformanceData} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors w-max"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0096ed]' : ''}`} /> Sync Metrics
          </button>
        </div>

        {/* --- KPI Status Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#0096ed]/10 flex items-center justify-center text-[#0096ed]"><Clock className="w-5 h-5" /></div>
              <span className="text-2xl font-black text-slate-900 font-mono">{currentAvgLatency} <span className="text-sm text-slate-500 font-bold">ms</span></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Transaction Latency</p>
              <p className="text-[10px] font-semibold text-lime-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 12% faster than yesterday</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#b2d235]/20 flex items-center justify-center text-lime-700"><Zap className="w-5 h-5" /></div>
              <span className="text-2xl font-black text-slate-900 font-mono">{currentThroughput} <span className="text-sm text-slate-500 font-bold">tps</span></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Throughput</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Peak volume processing</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Timer className="w-5 h-5" /></div>
              <span className="text-2xl font-black text-slate-900 font-mono">14 <span className="text-sm text-slate-500 font-bold">jobs</span></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Timer Services</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">Background SCM tasks running</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5" /></div>
              <span className="text-2xl font-black text-red-600 font-mono">{bottlenecks.filter(b => b.status === 'CRITICAL').length}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Bottlenecks</p>
              <p className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1">Requires immediate optimization</p>
            </div>
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Transaction Latency Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0096ed]" /> Global Latency Trends
                </h3>
                <p className="text-xs text-slate-500 mt-1">Average vs Maximum response times (ms) over the last 30 minutes.</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0096ed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0096ed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                  <Area type="monotone" dataKey="maxLatencyMs" name="Max Latency (ms)" stroke="#cbd5e1" strokeWidth={2} fill="none" />
                  <Area type="monotone" dataKey="avgLatencyMs" name="Avg Latency (ms)" stroke="#0096ed" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. EJB Interceptor & Execution Overhead Stacked Bar */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#b2d235]" /> EJB Execution Overhead
                </h3>
                <p className="text-xs text-slate-500 mt-1">Execution time breakdown: Interceptors vs Business Logic vs Database.</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overheadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                  <Bar dataKey="interceptorMs" name="Security/Audit Interceptor" stackId="a" fill="#0096ed" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="businessLogicMs" name="Core Business Logic" stackId="a" fill="#b2d235" />
                  <Bar dataKey="dbTransactionMs" name="DB Transaction Commit" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Bottlenecks Data Table --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Slowest Executing Methods (Bottlenecks)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="p-4 pl-6">Method Signature</th>
                  <th className="p-4">EJB Module</th>
                  <th className="p-4">Avg Execution Time</th>
                  <th className="p-4">Invocation Count</th>
                  <th className="p-4 pr-6">Optimization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-mono">
                {bottlenecks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors text-xs">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{b.methodName}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-sans">Last triggered: {b.lastOccurred}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-bold">{b.module}</td>
                    <td className="p-4">
                      <span className={`font-bold ${b.avgExecutionTimeMs > 500 ? 'text-red-600' : 'text-slate-700'}`}>
                        {b.avgExecutionTimeMs} ms
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{b.invocationCount.toLocaleString()}x</td>
                    <td className="p-4 pr-6">
                      <span className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] ${
                        b.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' : 
                        b.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        'bg-lime-50 text-lime-700 border border-lime-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
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

export default SystemPerformance;