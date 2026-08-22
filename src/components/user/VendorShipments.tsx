import React, { useState, useEffect } from 'react';
import {
    Truck, Package, Building2, UserCircle, MapPin,
    Calendar, Weight, FileText, Search, Filter,
    ArrowRight, Plus, CheckCircle2,
    Box, Plane, Loader2, Tag, Trash2, PlusCircle
} from 'lucide-react';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Header } from '../Header';
import { Footer } from '../Footer';

const API_CONFIG = {
    USE_REAL_API: true,
};

// --- Type Definitions ---
type ShipmentCategory = 'DIRECT' | 'INVENTORY';

interface Shipment {
    id: string;
    category: ShipmentCategory;
    destination: string;
    carrier: string;
    expectedDate: string;
    status: string;
    weight: string;
}

interface ProductItem {
    name: string;
    quantity: string;
    hsCode: string;
    unitValue: string;
}

interface ReferenceItem {
    id: string;
    name: string;
    countryId?: string; // Used for warehouses to link to a country
}

export const VendorShipments: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
    const [shipments, setShipments] = useState<Shipment[]>([]);

    // Reference Data States
    const [countries, setCountries] = useState<ReferenceItem[]>([]);
    const [warehouseCountries, setWarehouseCountries] = useState<ReferenceItem[]>([]);
    const [warehouses, setWarehouses] = useState<ReferenceItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token, setAuth } = useAuth();

    // Auto-Generated Shipment ID
    const [currentShipmentId, setCurrentShipmentId] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        category: 'INVENTORY' as ShipmentCategory,
        originCountryId: '',
        originAddress: '',
        senderName: '',
        senderPhone: '',
        destCountryId: '',
        destWarehouseId: '',
        destAddress: '',
        recipientName: '',
        recipientPhone: '',
        carrier: '',
        expectedDate: '',
        weight: '',
        weightUnit: 'kg',
        description: ''
    });

    const [products, setProducts] = useState<ProductItem[]>([
        { name: '', quantity: '1', hsCode: '', unitValue: '' }
    ]);

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

    // --- Helper: Generate Shipment ID ---
    const generateShipmentId = () => {
        const random6Digit = Math.floor(100000 + Math.random() * 900000);
        return `SHP-${random6Digit}`;
    };

    // --- 1. Fetch Reference Data (Countries & Warehouses) ---
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

                    const stdCountries = Array.isArray(json.countries)
                        ? json.countries.map((c: any) => ({ id: String(c.id), name: String(c.name) })) : [];

                    const whCountries = Array.isArray(json.warehouseCountries)
                        ? json.warehouseCountries.map((c: any) => ({ id: String(c.id), name: String(c.name) })) : [];

                    const whList = Array.isArray(json.warehouses)
                        ? json.warehouses.map((w: any) => ({ id: String(w.id), name: String(w.name), countryId: String(w.country.id) })) : [];

                    setCountries(stdCountries.filter((c: any) => c.id && c.name));
                    setWarehouseCountries(whCountries.filter((c: any) => c.id && c.name));
                    setWarehouses(whList.filter((w: any) => w.id && w.name && w.countryId));
                } else {
                    console.warn('Failed to fetch reference data', res.status, res.statusText);
                }
            } else {
                // SIMULATION DATA
                setCountries([
                    { id: '1', name: 'Sri Lanka' }, { id: '2', name: 'United States' }, { id: '3', name: 'Germany' }
                ]);
                setWarehouseCountries([
                    { id: '1', name: 'Sri Lanka' }, { id: '3', name: 'Germany' }
                ]);
                setWarehouses([
                    { id: 'w1', countryId: '1', name: 'Colombo Central Hub' },
                    { id: 'w2', countryId: '1', name: 'Katunayake Transit' },
                    { id: 'w3', countryId: '3', name: 'Frankfurt Distribution' }
                ]);
            }
        } catch (e) {
            console.warn('Error fetching reference data', e);
        }
    };

    const fetchShipments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (API_CONFIG.USE_REAL_API) {
                const headers: Record<string, string> = {
                    ...DEFAULT_HEADERS,
                };

                if (token) {
                    headers['Authorization'] = 'Bearer ' + token;
                } else {
                    console.warn('No auth token available; request will be sent without Authorization header');
                }

                const response = await fetch(`${GLOBAL_BASE_URL}/vendor/getShipments`, {
                    method: "GET",
                    credentials: "include",
                    headers,
                });

                if (response.ok) {
                    const json = await response.json();
                    console.log(json);

                    setShipments(json.shipments);

                } else if (response.status == 401) {
                    console.log(response);
                    tryRefresh();
                } else {
                    console.log(response);
                    toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setShipments([
                    { id: 'SHP-109283', category: 'INVENTORY', destination: 'Colombo Central Hub', carrier: 'FedEx Express', expectedDate: '2026-08-25', status: 'In Transit', weight: '450 kg' },
                ]);
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
        fetchShipments();
        setCurrentShipmentId(generateShipmentId());
    }, []);

    const saveShipmentData = async () => {

        setIsSubmitting(true);
        setError(null);

        const payload = {
            shipmentId: currentShipmentId,
            ...formData,
            products: products
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
            const response = await fetch(`${GLOBAL_BASE_URL}/vendor/saveShipment`, {
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
                    setShipments(prev => [json.newShipment, ...prev]);
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

    // --- 3. Handle Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        saveShipmentData();

        setActiveTab('list');

        setCurrentShipmentId(generateShipmentId());
        setFormData(prev => ({
            ...prev, originAddress: '', senderName: '', senderPhone: '', destCountryId: '', destWarehouseId: '',
            destAddress: '', recipientName: '', recipientPhone: '', expectedDate: '', weight: '', description: ''
        }));
        setProducts([{ name: '', quantity: '1', hsCode: '', unitValue: '' }]);
    };

    // --- Input Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (cat: ShipmentCategory) => {
        setFormData(prev => ({ ...prev, category: cat, destCountryId: '', destWarehouseId: '', destAddress: '' }));
    };

    const handleProductChange = (index: number, field: keyof ProductItem, value: string) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;
        setProducts(updatedProducts);
    };

    const addProductRow = () => setProducts([...products, { name: '', quantity: '1', hsCode: '', unitValue: '' }]);
    const removeProductRow = (index: number) => { if (products.length > 1) setProducts(products.filter((_, i) => i !== index)); };

    // --- Views ---
    const renderList = () => (
        <div className="animate-in fade-in duration-300 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search shipments..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-globlePrimary/20 focus:border-globlePrimary transition-all" />
                </div>
                <button onClick={fetchShipments} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                    <Filter className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="overflow-x-auto min-h-75">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-globlePrimary" />
                        <p className="text-sm font-semibold uppercase tracking-wider">Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
                        <p className="font-bold">{error}</p>
                        <button onClick={fetchShipments} className="mt-3 text-sm text-globlePrimary underline">Try Again</button>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">Tracking ID</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Destination</th>
                                <th className="p-4">Carrier & Weight</th>
                                <th className="p-4">ETA</th>
                                <th className="p-4 pr-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {shipments.map((shipment, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <td className="p-4 pl-6 font-bold text-slate-900 group-hover:text-globlePrimary">{shipment.id}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${shipment.category === 'INVENTORY' ? 'bg-globleSecondary/20 text-lime-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {shipment.category === 'INVENTORY' ? <Building2 className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                                            {shipment.category === 'INVENTORY' ? 'To Warehouse' : 'Direct Ship'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-700">{shipment.destination}</td>
                                    <td className="p-4">
                                        <div className="text-slate-900 font-bold">{shipment.carrier}</div>
                                        <div className="text-xs text-slate-500">{shipment.weight}</div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">{shipment.expectedDate}</td>
                                    <td className="p-4 pr-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${shipment.status === 'Delivered' ? 'bg-globleSecondary/10 text-lime-700 border-globleSecondary/20' :
                                            shipment.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-globlePrimary/10 text-globlePrimary border-globlePrimary/20'
                                            }`}>
                                            {shipment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    const renderAddForm = () => {
        // Filter warehouses based on selected destination country
        const availableWarehouses = warehouses.filter(w => w.countryId === formData.destCountryId);

        return (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div onClick={() => handleCategoryChange('DIRECT')} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex items-start gap-4 ${formData.category === 'DIRECT' ? 'border-globlePrimary bg-globlePrimary/5 shadow-md shadow-globlePrimary/10' : 'border-slate-200 bg-white hover:border-globlePrimary/50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${formData.category === 'DIRECT' ? 'bg-globlePrimary text-white' : 'bg-slate-100 text-slate-400'}`}><UserCircle className="w-6 h-6" /></div>
                        <div>
                            <h3 className={`font-extrabold text-lg ${formData.category === 'DIRECT' ? 'text-globlePrimary' : 'text-slate-900'}`}>Direct to Customer</h3>
                            <p className="text-sm text-slate-500 mt-1">Ship goods directly to an end customer.</p>
                        </div>
                        {formData.category === 'DIRECT' && <CheckCircle2 className="w-6 h-6 text-globlePrimary ml-auto shrink-0" />}
                    </div>

                    <div onClick={() => handleCategoryChange('INVENTORY')} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex items-start gap-4 ${formData.category === 'INVENTORY' ? 'border-globleSecondary bg-globleSecondary/10 shadow-md shadow-globleSecondary/10' : 'border-slate-200 bg-white hover:border-globleSecondary/50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${formData.category === 'INVENTORY' ? 'bg-globleSecondary text-slate-900' : 'bg-slate-100 text-slate-400'}`}><Building2 className="w-6 h-6" /></div>
                        <div>
                            <h3 className={`font-extrabold text-lg ${formData.category === 'INVENTORY' ? 'text-lime-700' : 'text-slate-900'}`}>GlobalTrade Inventory</h3>
                            <p className="text-sm text-slate-500 mt-1">Send bulk stock to a GlobalTrade warehouse.</p>
                        </div>
                        {formData.category === 'INVENTORY' && <CheckCircle2 className="w-6 h-6 text-globleSecondary ml-auto shrink-0" />}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 sm:p-8 space-y-8">

                        {/* Header with Auto-Generated ID */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Box className="w-5 h-5 text-globlePrimary" /> Shipment Details</h2>
                            <div className="bg-globlePrimary/10 px-4 py-2 rounded-lg border border-globlePrimary/20">
                                <span className="text-xs font-bold text-globlePrimary uppercase tracking-wider mr-2">Shipment ID</span>
                                <span className="font-extrabold text-slate-900">{currentShipmentId}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Origin Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-slate-400" /> Origin Details</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Dispatch Country</label>
                                    <select name="originCountryId" value={formData.originCountryId} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none appearance-none font-semibold">
                                        <option value="">Select Origin...</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Pickup Address</label>
                                    <textarea name="originAddress" value={formData.originAddress} onChange={handleChange} required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20 outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Sender Name</label><input type="text" name="senderName" value={formData.senderName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20" /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Sender Phone</label><input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-globlePrimary focus:ring-2 focus:ring-globlePrimary/20" /></div>
                                </div>
                            </div>

                            {/* Destination Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-globlePrimary" /> Destination Details</h3>

                                {formData.category === 'INVENTORY' ? (
                                    <div className="space-y-4 bg-globlePrimary/5 p-5 rounded-2xl border border-globlePrimary/20">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-globlePrimary uppercase">Select Country</label>
                                            <select name="destCountryId" value={formData.destCountryId} onChange={handleChange} required className="w-full bg-white border border-globlePrimary/30 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary outline-none appearance-none font-bold shadow-sm">
                                                <option value="">Select Country...</option>
                                                {warehouseCountries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-globlePrimary uppercase">Select GlobalTrade Hub</label>
                                            <select name="destWarehouseId" value={formData.destWarehouseId} onChange={handleChange} required disabled={!formData.destCountryId} className="w-full bg-white border border-globlePrimary/30 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary outline-none appearance-none font-bold shadow-sm disabled:opacity-50 disabled:bg-slate-100">
                                                <option value="">{formData.destCountryId ? 'Select Warehouse...' : 'Select a country first'}</option>
                                                {availableWarehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 uppercase">Destination Country</label>
                                            <select name="destCountryId" value={formData.destCountryId} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary outline-none appearance-none font-semibold">
                                                <option value="">Select Destination...</option>
                                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 uppercase">Delivery Address</label>
                                            <textarea name="destAddress" value={formData.destAddress} onChange={handleChange} required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:border-globlePrimary outline-none resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Recipient Name</label><input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-globlePrimary" /></div>
                                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Recipient Phone</label><input type="tel" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-globlePrimary" /></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Details Section */}
                        <div className="border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-400" /> Product Details
                                </h3>
                                <button type="button" onClick={addProductRow} className="flex items-center gap-1.5 text-xs font-bold text-globlePrimary bg-globlePrimary/10 px-3 py-1.5 rounded-lg hover:bg-globlePrimary/20 transition-colors">
                                    <PlusCircle className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                            <div className="space-y-4">
                                {products.map((product, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="w-full sm:w-1/3 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Product Name</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <input type="text" required value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="e.g. Lithium Batteries" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-globlePrimary focus:ring-1 focus:ring-globlePrimary" />
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/6 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Qty</label>
                                            <input type="number" required min="1" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="1" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-globlePrimary focus:ring-1 focus:ring-globlePrimary" />
                                        </div>
                                        <div className="w-full sm:w-1/4 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">HS Code (Customs)</label>
                                            <input type="text" value={product.hsCode} onChange={(e) => handleProductChange(index, 'hsCode', e.target.value)} placeholder="8507.60.00" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-globlePrimary focus:ring-1 focus:ring-globlePrimary" />
                                        </div>
                                        <div className="w-full sm:w-1/4 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Unit Value (USD)</label>
                                            <input type="number" required min="0" step="0.01" value={product.unitValue} onChange={(e) => handleProductChange(index, 'unitValue', e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-globlePrimary focus:ring-1 focus:ring-globlePrimary" />
                                        </div>
                                        <button type="button" onClick={() => removeProductRow(index)} disabled={products.length === 1} className="p-2.5 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4"><Plane className="w-4 h-4 text-slate-400" /> Logistics Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Preferred Carrier</label>
                                    <div className="relative">
                                        <Truck className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                        <select name="carrier" value={formData.carrier} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-globlePrimary outline-none appearance-none font-semibold">
                                            <option value="">Select Carrier...</option><option value="FedEx">FedEx Express</option><option value="DHL">DHL Supply Chain</option><option value="Maersk">Maersk Logistics</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Expected Delivery Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                        <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-globlePrimary outline-none font-semibold" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Total Weight</label>
                                    <div className="relative flex items-center">
                                        <Weight className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-l-xl py-3 pl-10 pr-4 text-sm focus:border-globlePrimary outline-none" />
                                        <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="bg-slate-100 border border-slate-200 border-l-0 rounded-r-xl py-3 px-3 text-sm text-slate-700 font-bold outline-none"><option>kg</option></select>
                                    </div>
                                </div>
                                <div className="md:col-span-3 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Additional Remarks</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Any special handling instructions..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-globlePrimary outline-none resize-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-medium text-slate-500 max-w-md text-center sm:text-left">Ensure all customs declarations are attached before dispatching. GlobalTrade terms apply.</p>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button type="button" onClick={() => setActiveTab('list')} className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-700 text-sm bg-white border border-slate-300 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] transition-all shadow-md shadow-globlePrimary/25 flex items-center justify-center gap-2 disabled:opacity-70">
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Create Shipment <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        );
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><Truck className="w-8 h-8 text-globlePrimary" /> Vendor Shipments</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your active consignments and create new delivery orders.</p>
                        </div>
                        <div className="flex bg-slate-200/50 p-1 rounded-xl w-full sm:w-max border border-slate-200">
                            <button onClick={() => setActiveTab('list')} className={`flex-1 sm:w-40 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>My Shipments</button>
                            <button onClick={() => setActiveTab('add')} className={`flex-1 sm:w-40 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'add' ? 'bg-globlePrimary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><Plus className="w-4 h-4" /> New Shipment</button>
                        </div>
                    </div>
                    {activeTab === 'list' ? renderList() : renderAddForm()}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VendorShipments;