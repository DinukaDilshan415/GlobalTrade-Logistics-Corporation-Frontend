import React, { useState } from 'react';
import {
    LayoutDashboard, Truck, Package, Building2,
    ClipboardCheck, Map, Bell, ScrollText, Users,
    Activity, BarChart2, AlertTriangle, User, LogOut,
    Search, Menu, X, Clock, AlertCircle,
    CheckCircle2, Plus, Settings
} from 'lucide-react';
import VendorsManagement from './DashBoardComponents/VendorsManagement';
import AdminShipments from './DashBoardComponents/AdminShipments';
import InventoryManagement from './DashBoardComponents/InventoryManagement';
import CustomsCompliance from './DashBoardComponents/CustomsCompliance';
import UsersAndRoles from './DashBoardComponents/UsersAndRoles';
import AlertsCenter from './DashBoardComponents/AlertsCenter';

// Define available routes matching the sidebar
type Route =
    | 'dashboard' | 'shipments' | 'inventory' | 'vendors' | 'customs' | 'routes' | 'alerts'
    | 'audit-logs' | 'users' | 'monitoring' | 'performance' | 'exceptions' | 'profile';

export const MainApplication: React.FC = () => {
    const [activeRoute, setActiveRoute] = useState<Route>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Navigation Handler ---
    const navigateTo = (route: Route) => {
        setActiveRoute(route);
        setSidebarOpen(false); // Close mobile sidebar on navigation
    };

    // --- Reusable Components ---
    const PageHeader = ({ title, description, actionLabel, onAction }: { title: string, description: string, actionLabel?: string, onAction?: () => void }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            {actionLabel && (
                <button onClick={onAction} className="flex items-center gap-2 px-4 py-2.5 bg-globlePrimary hover:bg-[#0082ce] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-globlePrimary/20">
                    <Plus className="w-4 h-4" /> {actionLabel}
                </button>
            )}
        </div>
    );

    // --- View Modules ---

    const DashboardView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <PageHeader
                title="Dashboard Overview"
                description="Real-time status of your global supply chain network and active operations."
            />
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Total Shipments', val: '1,248', icon: Truck, color: 'text-globlePrimary', bg: 'bg-globlePrimary/10', border: 'hover:border-globlePrimary/30' },
                    { label: 'Delayed', val: '42', icon: Clock, color: 'text-red-500', bg: 'bg-red-50', border: 'hover:border-red-500/30' },
                    { label: 'Active Alerts', val: '18', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-500/30' },
                    { label: 'Customs Pending', val: '156', icon: ClipboardCheck, color: 'text-lime-700', bg: 'bg-[#b2d235]/20', border: 'hover:border-[#b2d235]/50' },
                ].map((card, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group transition-colors ${card.border}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 ${card.bg} ${card.color} rounded-xl group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900">{card.val}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Shipment Statistics Chart representation */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-8">Shipment Statistics</h2>
                <div className="max-w-3xl space-y-8">
                    {[
                        { label: 'Delivered', count: '894', pct: '71%', color: 'bg-[#b2d235]' },
                        { label: 'In Transit', count: '312', pct: '25%', color: 'bg-globlePrimary', animate: true },
                        { label: 'Delayed', count: '42', pct: '4%', color: 'bg-red-500' },
                    ].map((stat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                                <span className="text-sm font-bold text-slate-900">{stat.count} <span className="text-xs text-slate-500 ml-1">({stat.pct})</span></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                <div className={`${stat.color} h-3.5 rounded-full relative overflow-hidden`} style={{ width: stat.pct }}>
                                    {stat.animate && <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const ShipmentsView = () => (
        <div className="animate-in fade-in duration-300">
            <AdminShipments />
        </div>
    );

    const InventoryView = () => (
        <div className="animate-in fade-in duration-300">
            <InventoryManagement />
        </div>
    );

    const CustomsComplianceView = () => (
        <div className="animate-in fade-in duration-300">
            <CustomsCompliance />
        </div>
    );

    const UsersAndRolesView = () => (
        <div className="animate-in fade-in duration-300">
            <UsersAndRoles />
        </div>
    );

    const ExceptionsView = () => (
        <div className="animate-in fade-in duration-300">
            <PageHeader title="System Exceptions" description="EJB application error logs, timer service failures, and recovery actions." />
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                            <th className="p-4 pl-6">Timestamp</th>
                            <th className="p-4">Exception Origin</th>
                            <th className="p-4">Severity</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {[
                            { time: '10:42 AM', type: 'Database Transaction Timeout', severity: 'Critical', status: 'Unresolved' },
                            { time: '09:15 AM', type: 'Carrier API Connection Refused', severity: 'High', status: 'Unresolved' },
                            { time: '08:30 AM', type: 'Customs Interceptor Validation', severity: 'Medium', status: 'Resolved' },
                        ].map((exc, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-4 pl-6 text-slate-500 font-medium">{exc.time}</td>
                                <td className="p-4 font-bold text-slate-900">{exc.type}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${exc.severity === 'Critical' ? 'bg-red-500 text-white shadow-sm' : exc.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{exc.severity}</span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    {exc.status === 'Resolved' ? (
                                        <span className="flex items-center justify-end gap-1 text-xs font-bold text-lime-600"><CheckCircle2 className="w-4 h-4" /> Resolved</span>
                                    ) : (
                                        <button className="text-xs font-bold text-globlePrimary hover:text-white hover:bg-globlePrimary px-3 py-1.5 rounded-lg border border-globlePrimary transition-colors">Recover</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const VendorView = () => (
        <div className="animate-in fade-in duration-300">
            <VendorsManagement />
        </div>
    );

    const AlertView = () => (
        <div className="animate-in fade-in duration-300">
            <AlertsCenter />
        </div>
    );

    const GenericView = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <div className="flex flex-col items-center justify-center h-96 animate-in zoom-in-95 duration-300 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Icon className="w-10 h-10 text-slate-300" /></div>
            <h2 className="text-2xl font-bold text-slate-900">{title} Module</h2>
            <p className="text-slate-500 mt-2">This feature is fully integrated and ready for data population.</p>
        </div>
    );

    // --- Router Switch ---
    const renderContent = () => {
        switch (activeRoute) {
            case 'dashboard': return <DashboardView />;
            case 'shipments': return <ShipmentsView />;
            case 'inventory': return <InventoryView />;
            case 'exceptions': return <ExceptionsView />;
            case 'vendors': return <VendorView />;
            case 'customs': return <CustomsComplianceView />;
            case 'routes': return <GenericView title="Route Optimization" icon={Map} />;
            case 'alerts': return <AlertView />;
            case 'audit-logs': return <GenericView title="Audit & Security Logs" icon={ScrollText} />;
            case 'users': return <UsersAndRolesView />;
            case 'monitoring': return <GenericView title="EJB System Monitoring" icon={Activity} />;
            case 'performance': return <GenericView title="Server Performance" icon={BarChart2} />;
            case 'profile': return <GenericView title="Admin Profile" icon={User} />;
            default: return <DashboardView />;
        }
    };

    // --- Layout Components ---

    const SidebarItem = ({ icon: Icon, label, route }: { icon: any, label: string, route: Route }) => {
        const isActive = activeRoute === route;
        return (
            <button onClick={() => navigateTo(route)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-globlePrimary/10 text-globlePrimary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-globlePrimary' : 'text-slate-400'}`} />
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* 1. Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-950 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/60 shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('dashboard')}>
                        <div className="flex items-center gap-3">
                            <img
                                className="h-12 w-auto object-contain"
                                src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
                                alt="GlobalTrade Logo"
                            />
                        </div>
                    </div>
                    <button className="ml-auto lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 hide-scrollbar">

                    <div className="space-y-1">
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" route="dashboard" />
                        <SidebarItem icon={Truck} label="Shipments" route="shipments" />
                        <SidebarItem icon={Package} label="Inventory" route="inventory" />
                        <SidebarItem icon={Building2} label="Vendors" route="vendors" />
                        <SidebarItem icon={ClipboardCheck} label="Customs & Compliance" route="customs" />
                        <SidebarItem icon={Map} label="Routes" route="routes" />
                        <SidebarItem icon={Bell} label="Alerts" route="alerts" />
                    </div>

                    <div className="h-px bg-slate-800/60 my-2" />

                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Administration</p>
                        <SidebarItem icon={ScrollText} label="Audit Logs" route="audit-logs" />
                        <SidebarItem icon={Users} label="Users & Roles" route="users" />
                    </div>

                    <div className="h-px bg-slate-800/60 my-2" />

                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System</p>
                        <SidebarItem icon={Activity} label="System Monitoring" route="monitoring" />
                        <SidebarItem icon={BarChart2} label="Performance" route="performance" />
                        <SidebarItem icon={AlertTriangle} label="Exceptions" route="exceptions" />
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-slate-800/60 shrink-0 space-y-1 bg-slate-900/50">
                    <SidebarItem icon={User} label="Profile" route="profile" />
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-red-400 hover:text-white hover:bg-red-500/10">
                        <LogOut className="w-5 h-5 text-red-400" /> Logout
                    </button>
                </div>
            </aside>

            {/* 2. Main Content Wrapper */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-globlePrimary/20 focus-within:border-globlePrimary transition-all">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input type="text" placeholder="Search Tracking IDs, Vendors..." className="bg-transparent border-none outline-none text-sm w-64 text-slate-700 placeholder-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-globlePrimary transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-globlePrimary transition-colors hidden sm:block">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('profile')}>
                            <div className="w-9 h-9 rounded-full bg-globlePrimary/10 border border-globlePrimary/20 flex items-center justify-center text-globlePrimary font-bold">
                                DD
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-slate-700 group-hover:text-globlePrimary transition-colors">ADMIN USER</p>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">System Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
                    <div className="mx-auto">
                        {renderContent()}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default MainApplication;