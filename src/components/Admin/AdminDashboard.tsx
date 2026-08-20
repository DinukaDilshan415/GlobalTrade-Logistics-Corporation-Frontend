import React, { useState } from 'react';
import {
    Globe2, LayoutDashboard, Truck, Package, Building2,
    ClipboardCheck, Map, Bell, ScrollText, Users,
    Activity, BarChart2, AlertTriangle, User, LogOut,
    Search, Menu, X, ChevronRight, Clock, AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Menu item interface
    interface MenuItem {
        id: string;
        label: string;
        icon?: React.ComponentType<any>;
        href?: string;
    }
    // Menu definitions (typed)
    const mainMenu: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
        { id: 'shipments', label: 'Shipments', icon: Truck, href: '#shipments' },
        { id: 'inventory', label: 'Inventory', icon: Package, href: '#inventory' },
        { id: 'vendors', label: 'Vendors', icon: Building2, href: '#vendors' },
        { id: 'customs-compliance', label: 'Customs & Compliance', icon: ClipboardCheck, href: '#customs-compliance' },
        { id: 'routes', label: 'Routes', icon: Map, href: '#routes' },
        { id: 'alerts', label: 'Alerts', icon: Bell, href: '#alerts' },
    ];
    const adminMenu: MenuItem[] = [
        { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, href: '#audit-logs' },
        { id: 'users-roles', label: 'Users & Roles', icon: Users, href: '#users-roles' },
    ];
    const systemMenu: MenuItem[] = [
        { id: 'system-monitoring', label: 'System Monitoring', icon: Activity, href: '#system-monitoring' },
        { id: 'performance', label: 'Performance', icon: BarChart2, href: '#performance' },
        { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle, href: '#exceptions' },
    ];
    // Reusable Sidebar Link Component
    const SidebarLink = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
        <a
            href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={(e) => { e.preventDefault(); window.location.assign(`#${label.toLowerCase().replace(/\s+/g, '-')}`); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${active
                    ? 'bg-[#0096ed]/10 text-[#0096ed]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-[#0096ed]' : 'text-slate-400'}`} />
            {label}
        </a>
    );

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 1. Sidebar (Dark Theme for Enterprise Look) */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-950 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>

                {/* Sidebar Header / Logo */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <img
                            className="h-12 w-auto object-contain"
                            src="https://raw.githubusercontent.com/DinukaDilshan415/images/0efb4dd34233860481a0959ed7dafaaef243c526/Global-Logo.svg"
                            alt="GlobalTrade Logo"
                        />
                    </div>
                    <button className="ml-auto lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 hide-scrollbar">

                    {/* Main Operations */}
                    <div className="space-y-1">
                        {mainMenu.map((m) => (
                            <SidebarLink key={m.id} icon={m.icon} label={m.label} active={window.location.hash === m.href || (window.location.hash === '' && m.id === 'dashboard')} />
                        ))}
                    </div>

                    <div className="h-px bg-slate-800/60 my-2" />

                    {/* Administration */}
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Administration</p>
                        {adminMenu.map((m) => (
                            <SidebarLink key={m.id} icon={m.icon} label={m.label} active={window.location.hash === m.href} />
                        ))}
                    </div>

                    <div className="h-px bg-slate-800/60 my-2" />

                    {/* System */}
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System</p>
                        {systemMenu.map((m) => (
                            <SidebarLink key={m.id} icon={m.icon} label={m.label} active={window.location.hash === m.href} />
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800/60 shrink-0 space-y-1 bg-slate-900/50">
                    <SidebarLink icon={User} label="Profile" />
                    <a href="#logout" className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-red-400 hover:text-white hover:bg-red-500/10">
                        <LogOut className="w-5 h-5 text-red-400" />
                        Logout
                    </a>
                </div>
            </aside>

            {/* 2. Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Top Navbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-[#0096ed]/20 focus-within:border-[#0096ed] transition-all">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search Tracking ID, Vendors..."
                                className="bg-transparent border-none outline-none text-sm w-64 text-slate-700 placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-[#0096ed] transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-[#0096ed]/10 border border-[#0096ed]/20 flex items-center justify-center text-[#0096ed] font-bold">
                                AD
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-slate-700 group-hover:text-[#0096ed] transition-colors">Admin User</p>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">System Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Greeting Section */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Good evening, Admin
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Here is the latest overview of your global logistics network.</p>
                        </div>

                        {/* Summary Cards Grid (matching wireframe values) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#0096ed]/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[#0096ed]/10 text-[#0096ed] rounded-xl group-hover:scale-110 transition-transform">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">1,248</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Shipments</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-red-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">42</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Delayed Shipments</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">18</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Alerts</p>
                                </div>
                            </div>

                            {/* Additional custom summary card for Supply Chain balance */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#b2d235]/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[#b2d235]/20 text-lime-700 rounded-xl group-hover:scale-110 transition-transform">
                                        <ClipboardCheck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900">156</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Customs Pending</p>
                                </div>
                            </div>

                        </div>

                        {/* Shipment Overview Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-bold text-slate-900">Shipment Overview</h2>
                                <button className="text-sm font-semibold text-[#0096ed] hover:underline flex items-center gap-1">
                                    View Full Report <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Statistics Bars (Visualizing the wireframe's chart) */}
                            <div className="max-w-3xl space-y-8">

                                {/* Delivered Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">Delivered</span>
                                        <span className="text-sm font-bold text-slate-900">894 <span className="text-xs text-slate-500 font-medium ml-1">(71%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div className="bg-[#b2d235] h-3.5 rounded-full" style={{ width: '71%' }}></div>
                                    </div>
                                </div>

                                {/* In Transit Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">In Transit</span>
                                        <span className="text-sm font-bold text-slate-900">312 <span className="text-xs text-slate-500 font-medium ml-1">(25%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div className="bg-[#0096ed] h-3.5 rounded-full relative overflow-hidden" style={{ width: '25%' }}>
                                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delayed Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">Delayed / Exceptions</span>
                                        <span className="text-sm font-bold text-slate-900">42 <span className="text-xs text-slate-500 font-medium ml-1">(4%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div className="bg-red-500 h-3.5 rounded-full" style={{ width: '4%' }}></div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;