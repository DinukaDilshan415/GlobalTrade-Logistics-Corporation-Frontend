import React, { useState, useEffect } from 'react';
import {
    Search, Plus, CheckCircle2,
    XCircle, MapPin, ChevronRight,
    Package, Loader2,
    Trash2, Box, ShoppingCart, PlusCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_HEADERS, GLOBAL_BASE_URL } from '../../../api/client';
import { toast } from 'react-toastify';

const API_CONFIG = {
    USE_REAL_API: true,
    ENDPOINTS: {
        GET_ACTIVE_SHIPMENTS: '/admin/shipments/active',
        GET_PENDING_SHIPMENTS: '/admin/shipments/pending',
        UPDATE_STATUS: '/admin/shipments/status',
        CREATE_SHIPMENT: '/admin/shipments',
        GET_REFERENCE_DATA: '/get/countries',
        GET_WAREHOUSE_PRODUCTS: '/admin/inventory/products?warehouseId='
    }
};

// --- Type Definitions ---
type ShipCategory = 'DIRECT' | 'INVENTORY';
type ShipStatus = 'PENDING' | 'ACCEPTED' | 'NOT_ACCEPTED' | 'PROCESSING' | 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'CANCELLED';

interface InventoryProduct {
    id: string;
    name: string;
    hsCode: string;
    unitValue: string;
    availableQty: number;
}

interface SelectedProduct extends InventoryProduct {
    shipQuantity: number;
}

interface Shipment {
    shipment_id: string;
    carrier: string;
    expect_date: string;
    weight: string;
    description: string;
    originCountry: string;
    originAddress: string;
    destCountry: string;
    destAddress: string;
    category: ShipCategory;
    status: ShipStatus;
    products: SelectedProduct[];
}

interface ReferenceItem {
    id: string;
    name: string;
    countryId?: string;
}

export const AdminShipments: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'add'>('active');

    // Separate states for Active and Pending shipments
    const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
    const [pendingShipments, setPendingShipments] = useState<Shipment[]>([]);

    // Reference Data
    const [countries, setCountries] = useState<ReferenceItem[]>([]);
    const [warehouses, setWarehouses] = useState<ReferenceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Inventory State
    const [availableProducts, setAvailableProducts] = useState<InventoryProduct[]>([]);
    const [isFetchingProducts, setIsFetchingProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

    // Status Update Modal State
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [statusUpdateForm, setStatusUpdateForm] = useState({
        status: 'IN_TRANSIT' as ShipStatus,
        location: '',
        description: ''
    });

    const { token, setAuth } = useAuth();

    // Add Shipment Form State
    const [addForm, setAddForm] = useState({
        originCountryId: '', originWarehouseId: '',
        destCountry: '', destAddress: '', recipientName: '', recipientPhone: '',
        carrier: '', expect_date: '', weight: '', description: '',
        category: 'DIRECT' as ShipCategory
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

    // --- 1. Data Fetching ---

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

                    setWarehouses(whList.filter((w) => w.id && w.name && w.countryId));
                } else {
                    console.warn('Failed to fetch reference data', res.status, res.statusText);
                }
            } else {
                setCountries([{ id: 'c1', name: 'Sri Lanka' }, { id: 'c2', name: 'China' }, { id: 'c3', name: 'Germany' }]);
                setWarehouses([
                    { id: 'w1', countryId: 'c1', name: 'Colombo Central Hub' },
                    { id: 'w2', countryId: 'c2', name: 'Shanghai Gateway' },
                    { id: 'w3', countryId: 'c3', name: 'Frankfurt Distribution' }
                ]);
            }
        } catch (e) {
            console.warn('Error fetching reference data', e);
        }
    };

    const fetchActiveShipments = async () => {
        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/shipment/getAllActiveShipments`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setActiveShipments(json.data);
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

    const fetchPendingShipments = async () => {
        try {
            const headers: Record<string, string> = {
                ...DEFAULT_HEADERS,
            };

            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn('No auth token available; request will be sent without Authorization header');
            }

            const response = await fetch(`${GLOBAL_BASE_URL}/shipment/getAllPendingShipmets`, {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (response.ok) {
                const json = await response.json();
                console.log(json);

                if (json.status) {
                    setPendingShipments(json.data);
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

    const loadAllInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchReferenceData(),
            fetchActiveShipments(),
            fetchPendingShipments()
        ]);
        setIsLoading(false);
    };

    useEffect(() => {
        loadAllInitialData();
    }, []);

    // --- 2. Fetch Warehouse Products ---
    const fetchWarehouseProducts = async (warehouseId: string) => {
        if (!warehouseId) {
            setAvailableProducts([]);
            setSelectedProducts([]);
            return;
        }

        setIsFetchingProducts(true);
        setSelectedProducts([]);

        try {
            if (API_CONFIG.USE_REAL_API) {
                const res = await fetch(`${GLOBAL_BASE_URL}/get/warehouseProducts/${warehouseId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: DEFAULT_HEADERS,
                });

                if (res.ok) {
                    const json = await res.json();
                    const productList = Array.isArray(json)
                        ? json as Record<string, unknown>[]
                        : Array.isArray(json?.data)
                            ? json.data as Record<string, unknown>[]
                            : Array.isArray(json?.products)
                                ? json.products as Record<string, unknown>[]
                                : [];

                    const parsedProducts = productList
                        .filter((product) => {
                            const warehouseValue = product.warehouseId ?? product.warehouse_id ?? (
                                typeof product.warehouse === 'object' && product.warehouse !== null
                                    ? (product.warehouse as Record<string, unknown>).id
                                    : undefined
                            );
                            return warehouseValue == null || String(warehouseValue) === String(warehouseId);
                        })
                        .map((product) => {
                            const id = product.id ?? product.productId ?? product.product_id ?? '';
                            const name = product.name ?? product.productName ?? 'Unknown product';
                            const hsCode = product.hsCode ?? product.hs_code ?? product.hsCodeNumber ?? '';
                            const unitValue = product.unitValue ?? product.unit_value ?? product.price ?? '0.00';
                            const availableQty = product.availableQty ?? product.available_qty ?? product.stockQty ?? 0;

                            return {
                                id: String(id),
                                name: String(name),
                                hsCode: String(hsCode),
                                unitValue: String(unitValue),
                                availableQty: Number(availableQty),
                            };
                        });

                    setAvailableProducts(parsedProducts);
                } else {
                    console.warn('Failed to fetch warehouse products', res.status, res.statusText);
                    setAvailableProducts([]);
                }
            } else {
                await new Promise(res => setTimeout(res, 800));
                const mockInventory: InventoryProduct[] = [
                    { id: 'p1', name: 'Lithium Ion Batteries (Pallet)', hsCode: '8507.60', unitValue: '450.00', availableQty: 150 },
                    { id: 'p2', name: 'Industrial Microcontrollers', hsCode: '8542.31', unitValue: '25.00', availableQty: 3200 },
                    { id: 'p3', name: 'Fiber Optic Cables (Spool)', hsCode: '8544.70', unitValue: '120.00', availableQty: 45 },
                    { id: 'p4', name: 'Hydraulic Pumps', hsCode: '8413.50', unitValue: '850.00', availableQty: 12 },
                ];
                const filteredMockInventory = warehouseId === 'w1'
                    ? mockInventory.filter(product => ['p1', 'p2', 'p3'].includes(product.id))
                    : mockInventory.filter(product => ['p2', 'p3', 'p4'].includes(product.id));

                setAvailableProducts(filteredMockInventory);
            }
        } catch (e) {
            console.warn('Error fetching warehouse products', e);
            setAvailableProducts([]);
        } finally {
            setIsFetchingProducts(false);
        }
    };

    useEffect(() => {
        fetchWarehouseProducts(addForm.originWarehouseId);
    }, [addForm.originWarehouseId]);

    // --- 3. Product Selection Logic ---
    const handleAddProduct = (product: InventoryProduct) => {
        if (selectedProducts.find(p => p.id === product.id)) return;
        setSelectedProducts([...selectedProducts, { ...product, shipQuantity: 1 }]);
    };

    const handleUpdateQuantity = (productId: string, qty: number, maxQty: number) => {
        const validQty = Math.max(1, Math.min(qty, maxQty));
        setSelectedProducts(selectedProducts.map(p =>
            p.id === productId ? { ...p, shipQuantity: validQty } : p
        ));
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    // --- 4. Submit Handlers ---
    const submitNewShipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProducts.length === 0) {
            toast.warn("Please add at least one product from the inventory to the shipment.");
            return;
        }

        const payload = {
            ...addForm,
            shipment_id: `SHP-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'ACCEPTED' as ShipStatus,
            products: selectedProducts
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
            const response = await fetch(`${GLOBAL_BASE_URL}/shipment/saveShipment`, {
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
                    setActiveShipments(prev => [json.newShip, ...prev]);

                    setAddForm({
                        originCountryId: '', originWarehouseId: '', destCountry: '', destAddress: '', recipientName: '', recipientPhone: '',
                        carrier: '', expect_date: '', weight: '', description: '', category: 'DIRECT'
                    });
                    setSelectedProducts([]);
                    setActiveTab('active');
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
        }
    }

    const handlePendingAction = async (
        shipment_id: string,
        category: 'DIRECT' | 'INVENTORY',
        action: 'ACCEPTED' | 'NOT_ACCEPTED'
    ) => {
        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/shipment/updatePendingShipment`, {
                method: "PUT",
                credentials: "include",
                headers,
                body: JSON.stringify({ shipment_id, category, status: action })
            });

            const json = await response.json();
            if (response.ok) {
                toast.success(json.message);

                // Local State Update
                const shipmentToMove = pendingShipments.find(s => s.shipment_id === shipment_id);
                setPendingShipments(prev => prev.filter(s => s.shipment_id !== shipment_id));

                if (action === 'ACCEPTED' && shipmentToMove) {
                    setActiveShipments(prev => [{ ...shipmentToMove, status: 'ACCEPTED' }, ...prev]);
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
        }
    }

    const submitTrackingUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipment) return;

        const payload = {
            shipment_id: selectedShipment.shipment_id,
            ...statusUpdateForm
        };

        console.log(payload);

        const headers: Record<string, string> = {
            ...DEFAULT_HEADERS,
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        } else {
            console.warn('No auth token available; request will be sent without Authorization header');
        }

        try {
            const response = await fetch(`${GLOBAL_BASE_URL}/shipment/updateProgress`, {
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

                    setActiveShipments(prev => prev.map(s => s.shipment_id === payload.shipment_id ? { ...s, status: payload.status } : s));
                    setUpdateModalOpen(false);
                    setStatusUpdateForm({ status: 'IN_TRANSIT', location: '', description: '' });
                } else {
                    toast.warn(json.message);
                }

            } else if (response.status == 400) {
                console.log(response);
                toast.error(json.message);
            } else {
                console.log(response);
                toast.error("Error : " + response.status + ", " + response.statusText + ". Please try again");
            }
        } catch (error) {
            toast.error("Something Wrong : " + error);
            console.error("Error:", error);
        }
    }

    // --- Helper: Status Styles ---
    const getStatusBadge = (status: ShipStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'ACCEPTED': case 'PROCESSING': return 'bg-globlePrimary/10 text-globlePrimary border-globlePrimary/20';
            case 'IN_TRANSIT': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'DELIVERED': return 'bg-globleSecondary/20 text-lime-700 border-globleSecondary/30';
            case 'DELAYED': case 'CANCELLED': case 'NOT_ACCEPTED': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    // --- Views ---

    const renderTable = (filterStatus: 'PENDING' | 'ACTIVE') => {
        const data = filterStatus === 'PENDING' ? pendingShipments : activeShipments;

        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search ID..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:border-globlePrimary" />
                    </div>
                </div>
                <div className="overflow-x-auto min-h-75">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-globlePrimary" /></div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-225">
                            <thead>
                                <tr className="bg-white border-b text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-4 pl-6">Shipment ID & Type</th>
                                    <th className="p-4">Route</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {data.map((s) => (
                                    <tr key={s.shipment_id} className="hover:bg-slate-50 group">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-900 group-hover:text-globlePrimary">{s.shipment_id}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{s.category}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800">{s.originCountry}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><ChevronRight className="w-3 h-3" /> {s.destCountry}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{s.carrier}</div>
                                            <div className="text-xs text-slate-500">{s.weight} • ETA: {s.expect_date}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(s.status)}`}>{s.status}</span>
                                        </td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            {filterStatus === 'PENDING' ? (
                                                <>
                                                    <button onClick={() => handlePendingAction(s.shipment_id, s.category, 'ACCEPTED')} className="p-2 text-lime-600 bg-lime-50 hover:bg-lime-100 rounded-lg" title="Accept"><CheckCircle2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handlePendingAction(s.shipment_id, s.category, 'NOT_ACCEPTED')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Reject"><XCircle className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => { setSelectedShipment(s); setStatusUpdateForm({ ...statusUpdateForm, }); setUpdateModalOpen(true); }} className="px-3 py-1.5 text-xs font-bold text-globlePrimary border border-globlePrimary rounded-lg hover:bg-globlePrimary hover:text-white transition-colors">
                                                    Update Status
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No shipments found.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    };

    const renderAddForm = () => {
        const availableWarehouses = warehouses.filter(w => w.countryId === addForm.originCountryId);

        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-globlePrimary/20 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="text-xl font-bold relative z-10 flex items-center gap-2"><Plus className="w-5 h-5 text-globleSecondary" /> Create Internal Shipment</h2>
                    <p className="text-sm text-slate-400 mt-1 relative z-10">Dispatch new inventory from a GlobalTrade warehouse.</p>
                </div>

                <form onSubmit={submitNewShipment} className="p-6 sm:p-8 space-y-8">

                    {/* 1. ORIGIN SELECTION */}
                    <div className="bg-globlePrimary/5 p-5 rounded-2xl border border-globlePrimary/20 space-y-4">
                        <h3 className="text-sm font-extrabold text-globlePrimary uppercase flex items-center gap-2"><MapPin className="w-4 h-4" /> 1. Select Origin Warehouse</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Origin Country</label>
                                <select required value={addForm.originCountryId} onChange={e => { setAddForm({ ...addForm, originCountryId: e.target.value, originWarehouseId: '' }); }} className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary font-bold shadow-sm">
                                    <option value="">Select Country...</option>
                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Origin Warehouse</label>
                                <select required value={addForm.originWarehouseId} disabled={!addForm.originCountryId} onChange={e => setAddForm({ ...addForm, originWarehouseId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary font-bold shadow-sm disabled:opacity-50">
                                    <option value="">{addForm.originCountryId ? 'Select Warehouse...' : 'Select Country First'}</option>
                                    {availableWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2. INVENTORY SELECTION */}
                    {addForm.originWarehouseId && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-sm font-extrabold text-slate-700 uppercase flex items-center gap-2 border-b border-slate-100 pb-2"><Package className="w-4 h-4 text-slate-400" /> 2. Add Products from Inventory</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Available Inventory List */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-80">
                                    <div className="bg-slate-50 p-3 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 flex items-center gap-2">
                                        <Box className="w-4 h-4" /> Available Stock
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                        {isFetchingProducts ? (
                                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-globlePrimary" /></div>
                                        ) : availableProducts.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400 text-sm">No products available in this warehouse.</div>
                                        ) : (
                                            availableProducts.map(prod => (
                                                <div key={prod.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-globlePrimary/30 transition-colors">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{prod.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">HS: {prod.hsCode} • Stock: <span className="font-bold text-slate-700">{prod.availableQty}</span></p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={selectedProducts.some(p => p.id === prod.id)}
                                                        onClick={() => handleAddProduct(prod)}
                                                        className="p-2 bg-globlePrimary/10 text-globlePrimary hover:bg-globlePrimary/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Selected Basket */}
                                <div className="border border-globleSecondary/40 rounded-2xl overflow-hidden flex flex-col h-80 bg-white">
                                    <div className="bg-globleSecondary/10 p-3 text-xs font-bold text-lime-700 uppercase border-b border-globleSecondary/20 flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Selected for Shipment
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                        {selectedProducts.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                                                <AlertCircle className="w-6 h-6 text-slate-300 mb-2" /> Select products to add to shipment
                                            </div>
                                        ) : (
                                            selectedProducts.map(prod => (
                                                <div key={prod.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                    <div className="flex-1 pr-3">
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">${prod.unitValue}/unit</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Ship Qty</label>
                                                            <input
                                                                type="number"
                                                                min="1" max={prod.availableQty}
                                                                value={prod.shipQuantity}
                                                                onChange={(e) => handleUpdateQuantity(prod.id, parseInt(e.target.value) || 1, prod.availableQty)}
                                                                className="w-16 px-2 py-1 text-sm font-bold border border-slate-300 rounded text-center outline-none focus:border-globlePrimary"
                                                            />
                                                        </div>
                                                        <button type="button" onClick={() => handleRemoveProduct(prod.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded mt-3">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* 3. DESTINATION & LOGISTICS */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-700 uppercase flex items-center gap-2 border-b border-slate-100 pb-2"><MapPin className="w-4 h-4 text-globleSecondary" /> 3. Destination & Logistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase">Dest. Country</label>
                                <select
                                    required
                                    value={addForm.destCountry}
                                    onChange={e => setAddForm({ ...addForm, destCountry: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary bg-white appearance-none"
                                >
                                    <option value="">Select Destination...</option>
                                    {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Address</label><input type="text" required onChange={e => setAddForm({ ...addForm, destAddress: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Recipient Name</label><input type="text" required onChange={e => setAddForm({ ...addForm, recipientName: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Recipient Phone</label><input type="tel" required onChange={e => setAddForm({ ...addForm, recipientPhone: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Carrier</label><input type="text" required onChange={e => setAddForm({ ...addForm, carrier: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Expected Date</label><input type="date" required onChange={e => setAddForm({ ...addForm, expect_date: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Total Weight</label><input type="text" placeholder="e.g. 500 kg" required onChange={e => setAddForm({ ...addForm, weight: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                            <div className="md:col-span-3"><label className="text-xs font-bold text-slate-600 uppercase">Description</label><textarea required onChange={e => setAddForm({ ...addForm, description: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-globlePrimary" /></div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setActiveTab('active')} className="px-6 py-2.5 rounded-xl font-bold text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white text-sm bg-globlePrimary hover:bg-[#0082ce] shadow-md shadow-globlePrimary/25 transition-all">Dispatch Shipment</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Package className="w-8 h-8 text-globlePrimary" /> Shipment Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Review vendor requests, track active freight, and dispatch internal stock.</p>
                    </div>
                    <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setActiveTab('active')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Active Logistics</button>
                        <button onClick={() => setActiveTab('pending')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                            Review Pending <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingShipments.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('add')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1 ${activeTab === 'add' ? 'bg-globlePrimary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><Plus className="w-4 h-4" /> New</button>
                    </div>
                </div>

                {/* Content Router */}
                {activeTab === 'pending' && renderTable('PENDING')}
                {activeTab === 'active' && renderTable('ACTIVE')}
                {activeTab === 'add' && renderAddForm()}

            </div>

            {/* --- Update Tracking Modal --- */}
            {updateModalOpen && selectedShipment && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">Update Tracking Node</h3>
                                <p className="text-xs font-bold text-globlePrimary uppercase mt-0.5">{selectedShipment.shipment_id}</p>
                            </div>
                            <button onClick={() => setUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-700"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitTrackingUpdate} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase">New Status</label>
                                <select
                                    value={statusUpdateForm.status}
                                    onChange={e => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value as ShipStatus })}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-3 text-sm font-bold outline-none focus:border-globlePrimary bg-white"
                                >
                                    <option value="PROCESSING">Processing</option>
                                    <option value="IN_TRANSIT">In Transit</option>
                                    <option value="DELAYED">Delayed</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase">Current Location / Node</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input type="text" required placeholder="e.g. Dubai Transit Hub" value={statusUpdateForm.location} onChange={e => setStatusUpdateForm({ ...statusUpdateForm, location: e.target.value })} className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-globlePrimary" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase">Status Description</label>
                                <textarea required rows={2} placeholder="e.g. Cleared customs and out for delivery..." value={statusUpdateForm.description} onChange={e => setStatusUpdateForm({ ...statusUpdateForm, description: e.target.value })} className="w-full border border-slate-200 rounded-xl py-3 px-3 text-sm outline-none focus:border-globlePrimary resize-none" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="submit" className="w-full py-3.5 bg-globlePrimary text-white rounded-xl font-bold text-sm hover:bg-[#0082ce] transition-colors shadow-md shadow-globlePrimary/20">Broadcast Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminShipments;