import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, Download,
    Trash2, Edit3, Building2, Tag, DollarSign,
    Layers, Loader2, X, CheckCircle2,
    RefreshCw, AlertCircle, Globe2
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const API_CONFIG = {
    USE_REAL_API: true,
    ENDPOINTS: {
        GET_INVENTORY: '/inventory/items',
        ADD_INVENTORY: '/inventory/items',
        UPDATE_INVENTORY: '/inventory/items/',
        DELETE_INVENTORY: '/inventory/items/',
        GET_REFERENCE_DATA: '/get/countries'
    }
};

// Database Schema interface
interface InventoryItem {
    id: number;
    product_name: string;
    hs_code: string;
    quantity: number;
    unit_value: number;
    warehouses_id: number;
}

interface Country {
    id: string;
    name: string;
}

interface Warehouse {
    id: number;
    countryId: string;
    name: string;
}

export const InventoryManagement: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Top Filter States (Country -> Warehouse)
    const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');
    const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { token, setAuth } = useAuth();

    // Form State
    const [formData, setFormData] = useState<{
        product_name: string;
        hs_code: string;
        quantity: string;
        unit_value: string;
        countryId: string;
        warehouses_id: string;
    }>({
        product_name: '',
        hs_code: '',
        quantity: '',
        unit_value: '',
        countryId: '',
        warehouses_id: ''
    });

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

    // 1. Fetch Countries & Warehouses
    const fetchReferenceData = async () => {
        try {
            if (API_CONFIG.USE_REAL_API) {
                const res = await fetch(`${GLOBAL_BASE_URL}/get/countriesWithWarehouses`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: DEFAULT_HEADERS,
                });

                if (res.ok) {
                    const json = await res.json();
                    console.log(json);

                    setCountries(Array.isArray(json.countries) ? json.countries : []);

                    const warehouseList = Array.isArray(json.warehouses)
                        ? (json.warehouses as Record<string, unknown>[])
                        : [];

                    const whList = warehouseList.map((w) => {
                        const country = typeof w.country === 'object' && w.country !== null ? w.country as Record<string, unknown> : {};

                        return {
                            id: typeof w.id === 'string' || typeof w.id === 'number' ? String(w.id) : '',
                            name: typeof w.name === 'string' ? w.name : '',
                            countryId: typeof country.id === 'string' || typeof country.id === 'number' ? String(country.id) : ''
                        };
                    });

                    setWarehouses(
                        whList
                            .filter((w) => w.id && w.name && w.countryId)
                            .map((w) => ({
                                ...w,
                                id: Number(w.id)
                            }))
                    );
                } else {
                    console.warn('Failed to fetch reference data', res.status, res.statusText);
                }
            } else {
                setCountries([
                    { id: '1', name: 'Sri Lanka' },
                    { id: '2', name: 'China' },
                    { id: '3', name: 'Germany' },
                    { id: '4', name: 'United Arab Emirates' }
                ]);
                setWarehouses([
                    { id: 101, countryId: '1', name: 'Colombo Central Hub' },
                    { id: 102, countryId: '1', name: 'Katunayake Air Cargo Facility' },
                    { id: 201, countryId: '2', name: 'Shanghai Gateway Hub' },
                    { id: 202, countryId: '2', name: 'Shenzhen Distribution Point' },
                    { id: 301, countryId: '3', name: 'Frankfurt Distribution' },
                    { id: 401, countryId: '4', name: 'Dubai Transit Logistics Terminal' }
                ]);
            }
        } catch (e) {
            console.warn('Error fetching reference data', e);
        }
    };

    // 2. Fetch Inventory Items
    const fetchInventory = async () => {
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

            const response = await fetch(`${GLOBAL_BASE_URL}/inventory/getAll`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setInventory(json.data);
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

    useEffect(() => {
        fetchReferenceData();
        fetchInventory();
    }, []);

    // 3. Handle Add / Edit Submission (POST / PUT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.warehouses_id) {
            alert("Please select a valid warehouse.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            product_name: formData.product_name,
            hs_code: formData.hs_code,
            quantity: parseInt(formData.quantity) || 0,
            unit_value: parseFloat(formData.unit_value) || 0.0,
            warehouses_id: parseInt(formData.warehouses_id)
        };

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

            if (editingItem) {

                toast.warn("Can't edit this for now");

            } else {
                const response = await fetch(`${GLOBAL_BASE_URL}/inventory/addNewInventory`, {
                    method: "POST",
                    credentials: "include",
                    headers,
                    body: JSON.stringify(payload)
                });
                const json = await response.json();
                console.log(json);
                if (response.ok) {
                    if (json.status) {

                        toast.success(json.message);
                        await fetchInventory();
                        closeModal();

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
    //     if (!formData.warehouses_id) {
    //         alert("Please select a valid warehouse.");
    //         return;
    //     }

    //     setIsSubmitting(true);
    //     const payload = {
    //         product_name: formData.product_name,
    //         hs_code: formData.hs_code,
    //         quantity: parseInt(formData.quantity) || 0,
    //         unit_value: parseFloat(formData.unit_value) || 0.0,
    //         warehouses_id: parseInt(formData.warehouses_id)
    //     };

    //     try {
    //         if (API_CONFIG.USE_REAL_API) {
    //             if (editingItem) {
    //                 await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_INVENTORY}${editingItem.id}`, {
    //                     method: 'PUT',
    //                     headers: DEFAULT_HEADERS,
    //                     body: JSON.stringify(payload)
    //                 });
    //             } else {
    //                 await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.ADD_INVENTORY}`, {
    //                     method: 'POST',
    //                     headers: DEFAULT_HEADERS,
    //                     body: JSON.stringify(payload)
    //                 });
    //             }
    //             await fetchInventory();
    //         } else {
    //             await new Promise(resolve => setTimeout(resolve, 500));
    //             if (editingItem) {
    //                 setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...payload, id: editingItem.id } : item));
    //             } else {
    //                 const newItem: InventoryItem = { ...payload, id: Math.floor(100 + Math.random() * 900) };
    //                 setInventory(prev => [newItem, ...prev]);
    //             }
    //         }
    //         closeModal();
    //     } catch (err) {
    //         console.error('Error saving inventory item:', err);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // 4. Handle Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm(`Are you sure you want to delete inventory item #${id}?`)) return;

        try {
            if (API_CONFIG.USE_REAL_API) {
                await fetch(`${GLOBAL_BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_INVENTORY}${id}`, {
                    method: 'DELETE',
                    headers: DEFAULT_HEADERS
                });
            }
            setInventory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting inventory item:', err);
        }
    };

    // Modal Open Handlers
    const openModal = (item?: InventoryItem) => {
        if (item) {
            const wh = warehouses.find(w => w.id === item.warehouses_id);
            setEditingItem(item);
            setFormData({
                product_name: item.product_name,
                hs_code: item.hs_code,
                quantity: item.quantity.toString(),
                unit_value: item.unit_value.toString(),
                countryId: wh ? wh.countryId : '',
                warehouses_id: item.warehouses_id.toString()
            });
        } else {
            setEditingItem(null);
            setFormData({
                product_name: '',
                hs_code: '',
                quantity: '',
                unit_value: '',
                countryId: '',
                warehouses_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // Helpers
    const getWarehouseDetails = (wId: number) => {
        const wh = warehouses.find(w => w.id === wId);
        const country = countries.find(c => c.id == wh?.countryId);

        return {
            name: wh ? wh.name : `Warehouse #${wId}`,
            countryName: country ? country.name : 'Unknown Country'
        };
    };

    // Filtered dataset
    const filteredInventory = inventory.filter(item => {
        const wh = warehouses.find(w => w.id === item.warehouses_id);
        const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.hs_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toString().includes(searchTerm);
        const matchesCountry = selectedCountryFilter === 'ALL' || wh?.countryId === selectedCountryFilter;
        const matchesWarehouse = selectedWarehouseFilter === 'ALL' || item.warehouses_id.toString() === selectedWarehouseFilter;
        return matchesSearch && matchesCountry && matchesWarehouse;
    });

    const totalValue = filteredInventory.reduce((acc, curr) => acc + (curr.quantity * curr.unit_value), 0);
    const totalStock = filteredInventory.reduce((acc, curr) => acc + curr.quantity, 0);

    // Form warehouse options derived from selected form country
    const formWarehouseOptions = warehouses.filter(w => w.countryId === formData.countryId);
    // Toolbar warehouse options derived from selected filter country
    const filterWarehouseOptions = warehouses.filter(w => selectedCountryFilter === 'ALL' || w.countryId === selectedCountryFilter);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Package className="w-8 h-8 text-globlePrimary" /> Inventory Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Multi-warehouse inventory registry categorized by country and storage node.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-globlePrimary hover:bg-[#0082ce] text-white rounded-xl text-sm font-bold shadow-md shadow-globlePrimary/25 transition-all transform active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Inventory Item
                    </button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtered Items</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{filteredInventory.length}</h3>
                        </div>
                        <div className="p-3 bg-globlePrimary/10 text-globlePrimary rounded-xl">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Count</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalStock.toLocaleString()} Units</h3>
                        </div>
                        <div className="p-3 bg-globleSecondary/20 text-lime-700 rounded-xl">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Valuation</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Cascaded Filter Toolbar */}
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">

                            {/* Search */}
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search item, HS code, ID..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-globlePrimary outline-none shadow-sm"
                                />
                            </div>

                            {/* 1. Filter By Country */}
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={selectedCountryFilter}
                                    onChange={e => {
                                        setSelectedCountryFilter(e.target.value);
                                        setSelectedWarehouseFilter('ALL');
                                    }}
                                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-globlePrimary outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="ALL">All Countries</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Filter By Warehouse */}
                            <div className="relative w-full sm:w-56">
                                <select
                                    value={selectedWarehouseFilter}
                                    onChange={e => setSelectedWarehouseFilter(e.target.value)}
                                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-globlePrimary outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="ALL">All Warehouses</option>
                                    {filterWarehouseOptions.map(w => (
                                        <option key={w.id} value={w.id.toString()}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                            <button onClick={fetchInventory} className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => alert("Exporting inventory catalog...")}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-87.5">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-globlePrimary mb-3" />
                                <p className="text-sm font-semibold uppercase tracking-wider">Syncing Database Table...</p>
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-sm font-bold text-slate-500">No inventory entries found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-237.5">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                                        <th className="p-4 pl-6 w-20"># id</th>
                                        <th className="p-4">product_name</th>
                                        <th className="p-4">hs_code</th>
                                        <th className="p-4">quantity</th>
                                        <th className="p-4">unit_value</th>
                                        <th className="p-4">warehouses_id & Location</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredInventory.map(item => {
                                        const loc = getWarehouseDetails(item.warehouses_id);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-500">
                                                    {item.id}
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-900 group-hover:text-globlePrimary transition-colors">
                                                        {item.product_name}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-xs font-semibold text-slate-600">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                                        {item.hs_code}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-extrabold text-sm ${item.quantity < 20 ? 'text-red-500' : 'text-slate-800'}`}>
                                                        {item.quantity.toLocaleString()}
                                                    </span>
                                                    {item.quantity < 20 && (
                                                        <span className="ml-2 text-[10px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                                                            Low
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono font-bold text-slate-700">
                                                    ${item.unit_value.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                            <Building2 className="w-3.5 h-3.5 text-globlePrimary" />
                                                            <span>{loc.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">({item.warehouses_id})</span>
                                                        </div>
                                                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 pl-5">
                                                            <Globe2 className="w-3 h-3 text-slate-400" />
                                                            <span>{loc.countryName}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-1">
                                                    <button
                                                        onClick={() => openModal(item)}
                                                        className="p-2 text-slate-400 hover:text-globlePrimary hover:bg-globlePrimary/10 rounded-lg transition-colors"
                                                        title="Edit Item"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Table Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Showing {filteredInventory.length} registered products</span>
                        <span>GlobalTrade Logistics Inventory Control</span>
                    </div>

                </div>

            </div>

            {/* Cascaded Add / Edit Inventory Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-globlePrimary/20 rounded-full blur-2xl pointer-events-none" />
                            <div>
                                <h3 className="font-extrabold text-lg text-white">
                                    {editingItem ? 'Edit Inventory Item' : 'New Inventory Record'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editingItem ? `Updating schema entity #${editingItem.id}` : 'Select Country and Warehouse to assign stock'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">product_name</label>
                                <div className="relative">
                                    <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Lithium-Ion Battery Pack"
                                        value={formData.product_name}
                                        onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">hs_code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="8507.60.00"
                                        value={formData.hs_code}
                                        onChange={e => setFormData({ ...formData, hs_code: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="100"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">unit_value ($ USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.unit_value}
                                        onChange={e => setFormData({ ...formData, unit_value: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-globlePrimary outline-none font-mono"
                                    />
                                </div>
                            </div>

                            {/* Cascaded Selection: 1. Country -> 2. Warehouse */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                        <Globe2 className="w-3.5 h-3.5 text-globlePrimary" /> 1. Select Country
                                    </label>
                                    <select
                                        value={formData.countryId}
                                        onChange={e => setFormData({ ...formData, countryId: e.target.value, warehouses_id: '' })}
                                        required
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none font-medium cursor-pointer"
                                    >
                                        <option value="">Select country...</option>
                                        {countries.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-globleSecondary" /> 2. warehouses_id (Warehouse Node)
                                    </label>
                                    <select
                                        value={formData.warehouses_id}
                                        onChange={e => setFormData({ ...formData, warehouses_id: e.target.value })}
                                        required
                                        disabled={!formData.countryId}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-globlePrimary outline-none font-bold cursor-pointer disabled:opacity-50 disabled:bg-slate-100"
                                    >
                                        <option value="">{formData.countryId ? 'Select Warehouse...' : 'Select Country First'}</option>
                                        {formWarehouseOptions.map(w => (
                                            <option key={w.id} value={w.id.toString()}>
                                                {w.name} (ID: {w.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" /> {editingItem ? 'Update Item' : 'Save Item'}
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InventoryManagement;