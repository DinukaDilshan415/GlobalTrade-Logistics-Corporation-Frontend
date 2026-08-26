import React, { useState, useEffect } from 'react';
import {
    Users, Search, Shield, UserPlus,
    Edit3, Trash2, CheckCircle2, XCircle,
    Lock, Loader2, X, ShieldAlert, AtSign, Globe2, Link
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_CONFIG = {
    USE_REAL_API: true,
    ENDPOINTS: {
        GET_USERS: '/admin/users',
        ADD_USER: '/admin/users',
        UPDATE_USER: '/admin/users/',
        DELETE_USER: '/admin/users/',
        UPDATE_STATUS: '/admin/users/status/',
        GET_REFERENCE_DATA: '/admin/users/reference-data',
        GET_AVAILABLE_ACCOUNTS: '/admin/users/available-accounts'
    }
};

// --- Type Definitions ---
interface RoleField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'country_select';
}

interface AppRole {
    id: string;
    name: string;
    fields: RoleField[];
}

interface ReferenceItem {
    id: string;
    name: string;
}

interface LoginAccount {
    id: string;
    username: string;
}

interface User {
    id: string;
    fullName: string;
    username: string;
    role: string;
    status: string;
    roleDetails: Record<string, string>;
}

export const UsersAndRoles: React.FC = () => {
    // Main Data States
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);
    const [countries, setCountries] = useState<ReferenceItem[]>([]);
    const [availableAccounts, setAvailableAccounts] = useState<LoginAccount[]>([]);

    // UI States
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        role: '',
        status: 'ACTIVE',
        roleDetails: {} as Record<string, string>
    });

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

    // --- 1. Fetch Reference Data & Users ---
    const loadAllData = async () => {
        setIsLoading(true);
        try {
            if (API_CONFIG.USE_REAL_API) {
                const res = await fetch(`${GLOBAL_BASE_URL}/get/userReferenceData`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: DEFAULT_HEADERS,
                });

                if (res.ok) {
                    const refData = await res.json();

                    console.log(refData);

                    setRoles(refData.roles);
                    setStatuses(refData.statuses);
                    setCountries(refData.countries);
                }

                await fetchAllUsers();
            } else {

            }
        } catch (e) {
            console.warn('Error fetching reference data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableAccounts = async () => {
        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/user/getAll`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                setAvailableAccounts(json);

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
        }
    };

    const fetchAllUsers = async () => {
        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/admin/getAllUsers`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setUsers(json.data);
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
        }
    };

    // const loadAllData = async () => {
    //     setIsLoading(true);
    //     try {
    //         if (API_CONFIG.USE_REAL_API) {
    //             // Real API Calls
    //             const resRef = await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.GET_REFERENCE_DATA}`, { headers: DEFAULT_HEADERS });
    //             if (resRef.ok) {
    //                 const refData = await resRef.json();
    //                 setRoles(refData.roles);
    //                 setStatuses(refData.statuses);
    //                 setCountries(refData.countries);
    //             }

    //             const resUsers = await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.GET_USERS}`, { headers: DEFAULT_HEADERS });
    //             if (resUsers.ok) setUsers(await resUsers.json());

    //         } else {
    //             // SIMULATION
    //             await new Promise(resolve => setTimeout(resolve, 800));

    //             // Mock Reference Data
    //             const mockRoles: AppRole[] = [
    //                 { id: 'r1', name: 'System Admin', fields: [] },
    //                 {
    //                     id: 'r2', name: 'Logistics Coordinator', fields: [
    //                         { name: 'region', label: 'Operating Region', type: 'text' }
    //                     ]
    //                 },
    //                 {
    //                     id: 'r3', name: 'Customs Agent', fields: [
    //                         { name: 'position', label: 'Position / Title', type: 'text' },
    //                         { name: 'reg_number', label: 'Registration Number', type: 'text' },
    //                         { name: 'country', label: 'Assigned Country', type: 'country_select' }
    //                     ]
    //                 },
    //                 {
    //                     id: 'r4', name: 'Vendor Manager', fields: [
    //                         { name: 'country', label: 'Managed Region', type: 'country_select' }
    //                     ]
    //                 }
    //             ];
    //             setRoles(mockRoles);
    //             setStatuses(['ACTIVE', 'SUSPENDED', 'PENDING']);
    //             setCountries([
    //                 { id: 'c1', name: 'Sri Lanka' }, { id: 'c2', name: 'China' },
    //                 { id: 'c3', name: 'Germany' }, { id: 'c4', name: 'United States' }
    //             ]);

    //             // Mock Users
    //             setUsers([
    //                 { id: 'USR-001', fullName: 'Dinuka Dilshan', username: 'admin.dinuka', role: 'System Admin', status: 'ACTIVE', roleDetails: {} },
    //                 { id: 'USR-002', fullName: 'Sarah Jenkins', username: 's.jenkins', role: 'Logistics Coordinator', status: 'ACTIVE', roleDetails: { region: 'APAC' } },
    //                 { id: 'USR-003', fullName: 'Marcus Chen', username: 'm.chen', role: 'Customs Agent', status: 'ACTIVE', roleDetails: { position: 'Senior Inspector', reg_number: 'CA-99382', country: 'c2' } },
    //                 { id: 'USR-004', fullName: 'Elena Rodriguez', username: 'elena.r', role: 'Vendor Manager', status: 'SUSPENDED', roleDetails: { country: 'c4' } }
    //             ]);
    //         }
    //     } catch (err) {
    //         console.error('Error fetching data:', err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    useEffect(() => { loadAllData(); }, []);

    // --- 3. Add / Edit User ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = editingUser ?
            { id: editingUser.id, ...formData } :
            { ...formData, id: `USR-${Math.floor(100 + Math.random() * 900)}`, status: 'ACTIVE' }; // Default status on creation

        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        try {
            console.log(payload);
            if (editingUser) {

            } else {
                const response = await fetch(`${GLOBAL_BASE_URL}/admin/saveNewUser`, {
                    method: "POST",
                    credentials: "include",
                    headers,
                    body: JSON.stringify(payload)
                });

                const json = await response.json();
                console.log(json);
                if (response.ok) {
                    if (json.status) {
                        await fetchAllUsers();
                        closeModal();
                        toast.success(`User ${editingUser ? 'updated' : 'created'} successfully.`);
                    } else {
                        toast.error(json.message);
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
            }
        } catch (error) {
            toast.error("Something Wrong : " + error);
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }


    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     const payload = editingUser ?
    //         { id: editingUser.id, ...formData } :
    //         { ...formData, id: `USR-${Math.floor(100 + Math.random() * 900)}`, status: 'ACTIVE' }; // Default status on creation

    //     try {
    //         if (API_CONFIG.USE_REAL_API) {
    //             if (editingUser) {
    //                 await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER}${editingUser.id}`, {
    //                     method: 'PUT', headers: DEFAULT_HEADERS, body: JSON.stringify(payload)
    //                 });
    //             } else {
    //                 await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.ADD_USER}`, {
    //                     method: 'POST', headers: DEFAULT_HEADERS, body: JSON.stringify(payload)
    //                 });
    //             }
    //         } else {
    //             await new Promise(resolve => setTimeout(resolve, 800));
    //             console.log("Payload sent to backend:", payload);
    //             if (editingUser) {
    //                 setUsers(prev => prev.map(u => u.id === editingUser.id ? (payload as User) : u));
    //             } else {
    //                 setUsers(prev => [payload as User, ...prev]);
    //             }
    //         }
    //         closeModal();
    //         alert(`User ${editingUser ? 'updated' : 'created'} successfully.`);
    //     } catch (err) {
    //         console.error('Error saving user:', err);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // --- 4. Toggle Status & Delete ---
    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;

        try {
            if (API_CONFIG.USE_REAL_API) {
                await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_STATUS}${id}`, {
                    method: 'PATCH', headers: DEFAULT_HEADERS, body: JSON.stringify({ status: newStatus })
                });
            }
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`PERMANENT ACTION: Are you sure you want to delete user ${id}?`)) return;

        try {
            if (API_CONFIG.USE_REAL_API) {
                await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_USER}${id}`, {
                    method: 'DELETE', headers: DEFAULT_HEADERS
                });
            }
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    // --- Form Dynamic Fields Handlers ---
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = e.target.value;
        setFormData(prev => ({
            ...prev,
            role: selectedRoleName,
            roleDetails: {} // Clear dynamic fields when role changes
        }));
    };

    const handleDynamicFieldChange = (fieldName: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            roleDetails: { ...prev.roleDetails, [fieldName]: value }
        }));
    };

    // --- Modal Helpers ---
    const openModal = async (user?: User) => {
        if (!user) {
            // Fetch available accounts only when creating a new user
            await fetchAvailableAccounts();
            setEditingUser(null);
            setFormData({
                fullName: '', username: '',
                role: roles[0]?.name || '', status: 'ACTIVE',
                roleDetails: {}
            });
        } else {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName, username: user.username,
                role: user.role, status: user.status,
                roleDetails: { ...user.roleDetails }
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    // --- UI Helpers ---
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (roleName: string) => {
        if (roleName === 'admin') return 'bg-globlePrimary/10 text-globlePrimary border-globlePrimary/30';
        if (roleName === 'customs agent') return 'bg-globleSecondary/20 text-lime-800 border-globleSecondary/40';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getStatusColor = (status: string) => {
        if (status === 'ACTIVE') return 'text-lime-600 bg-lime-50';
        if (status === 'SUSPENDED') return 'text-red-600 bg-red-50';
        return 'text-amber-600 bg-amber-50';
    };

    const activeRoleConfig = roles.find(r => r.name === formData.role);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Users className="w-8 h-8 text-globlePrimary" /> Users & Roles
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Assign roles to existing system accounts and manage organizational access.</p>
                    </div>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-globlePrimary hover:bg-[#0082ce] text-white rounded-xl text-sm font-bold shadow-md shadow-globlePrimary/25 transition-all transform active:scale-95">
                        <UserPlus className="w-4 h-4" /> Provision New User
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length}</h3>
                        </div>
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Users className="w-5 h-5" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-globlePrimary uppercase tracking-wider">System Admins</p>
                            <h3 className="text-2xl font-black text-globlePrimary mt-1">{users.filter(u => u.role === 'admin').length}</h3>
                        </div>
                        <div className="p-3 bg-globlePrimary/10 text-globlePrimary rounded-xl"><Shield className="w-5 h-5" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-lime-700 uppercase tracking-wider">Active Accounts</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{users.filter(u => u.status === 'ACTIVE').length}</h3>
                        </div>
                        <div className="p-3 bg-globleSecondary/20 text-lime-700 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Suspended</p>
                            <h3 className="text-2xl font-black text-red-600 mt-1">{users.filter(u => u.status === 'SUSPENDED').length}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl"><XCircle className="w-5 h-5" /></div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search name or username..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none shadow-sm" />
                            </div>
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full sm:w-56 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-globlePrimary outline-none shadow-sm cursor-pointer">
                                <option value="ALL">All Roles</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-100">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                                <p className="text-sm font-semibold uppercase tracking-wider">Syncing Users Directory...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <p className="text-sm font-bold text-slate-500">No users found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-212.5">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                                        <th className="p-4 pl-6">User Details</th>
                                        <th className="p-4">Assigned Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                                        {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-globlePrimary transition-colors">{user.fullName}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                                            <AtSign className="w-3 h-3" /> {user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                        {user.role}
                                                    </span>
                                                    {Object.keys(user.roleDetails).length > 0 && (
                                                        <span className="text-[10px] text-slate-400 font-medium max-w-50 truncate">
                                                            ({Object.values(user.roleDetails).join(' • ')})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right space-x-1">
                                                <button onClick={() => handleToggleStatus(user.id, user.status)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}>
                                                    {user.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-globlePrimary hover:bg-globlePrimary/10 rounded-lg transition-colors" title="Edit User">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                    <Trash2 className="w-4 h-4" />
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

            {/* --- Add / Edit User Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-globlePrimary/20 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                                    {editingUser ? <Edit3 className="w-5 h-5 text-globleSecondary" /> : <UserPlus className="w-5 h-5 text-globlePrimary" />}
                                    {editingUser ? 'Edit User Profile' : 'Assign Role to Account'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <form id="user-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

                                {/* Standard Base Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Auth Account Selection / Display */}
                                    {!editingUser ? (
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                                <Link className="w-3.5 h-3.5 text-globlePrimary" /> Link Authentication Account
                                            </label>
                                            <select required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none cursor-pointer">
                                                <option value="" disabled>Select available unassigned login...</option>
                                                {availableAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.username}>{acc.username}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Linked Account</label>
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <input type="text" disabled value={formData.username} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none opacity-70 cursor-not-allowed" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
                                        <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase">System Role</label>
                                        <select required value={formData.role} onChange={handleRoleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-globlePrimary outline-none cursor-pointer">
                                            <option value="" disabled>Select a role...</option>
                                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    </div>

                                    {editingUser && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Account Status</label>
                                            <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-globlePrimary outline-none cursor-pointer">
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Role Specific Dynamic Fields */}
                                {activeRoleConfig && activeRoleConfig.fields.length > 0 && (
                                    <div className="border border-globleSecondary/40 bg-globleSecondary/5 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <h4 className="text-xs font-extrabold text-lime-800 uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-globleSecondary" /> {activeRoleConfig.name} Required Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {activeRoleConfig.fields.map(field => (
                                                <div key={field.name} className={`space-y-1.5 ${field.type === 'country_select' ? 'sm:col-span-2' : ''}`}>
                                                    <label className="text-[10px] font-bold text-slate-700 uppercase">{field.label}</label>

                                                    {field.type === 'text' || field.type === 'number' ? (
                                                        <input
                                                            type={field.type}
                                                            required
                                                            value={formData.roleDetails[field.name] || ''}
                                                            onChange={e => handleDynamicFieldChange(field.name, e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-globlePrimary outline-none"
                                                        />
                                                    ) : field.type === 'country_select' ? (
                                                        <div className="relative">
                                                            <Globe2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                            <select
                                                                required
                                                                value={formData.roleDetails[field.name] || ''}
                                                                onChange={e => handleDynamicFieldChange(field.name, e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-globlePrimary outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="">Select Country...</option>
                                                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                    ) : null}

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* System Admin Warning */}
                                {formData.role === 'admin' && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-800 font-medium">Assigning the <span className="font-bold">System Admin</span> role grants full access to user management, system configurations, and security protocols.</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-sm border border-slate-200">Cancel</button>
                            <button type="submit" form="user-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 transition-all flex items-center gap-2 disabled:opacity-70">
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</> : <><CheckCircle2 className="w-4 h-4" /> Save User Profile</>}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default UsersAndRoles;