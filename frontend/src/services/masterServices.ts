import api from './api';
import { useAuthStore } from '../store/authStore';

// ── Types ──────────────────────────────────────────────────────

export interface BusinessConfig {
  businessType: 'TRADING' | 'MANUFACTURING' | 'BOTH';
  companyType: string;
  industrySector: string;
  financialYearStart: string;
  currency: string;
  inventoryValuation: 'FIFO' | 'Weighted Average' | 'LIFO';
  defaultPaymentTerms: number;
  defaultGstRate: number;
  compositionScheme: boolean;
  enableRcm: boolean;
  enableEwayBill: boolean;
  ewayBillThreshold: number;
  enableEinvoice: boolean;
  invoicePrefix: string;
  invoiceNextNumber: number;
  poPrefix: string;
  poNextNumber: number;
  quotationPrefix: string;
  quotationNextNumber: number;
  enableMultiWarehouse: boolean;
  enableBatchTracking: boolean;
  enableSerialTracking: boolean;
  preventNegativeStock: boolean;
  enableLineDiscounts: boolean;
  autoRoundOff: boolean;
}

export interface ItemCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  defaultHsnCode?: string;
  defaultGstRate: number;
  description?: string;
  itemCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  capacity?: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  totalItemsStored: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemMasterItem {
  id: number;
  itemCode: string;
  itemName: string;
  itemType: 'Finished Goods' | 'Raw Material' | 'Work In Progress' | 'Trading Goods' | 'Consumable' | 'Service';
  categoryId?: number | null;
  categoryName?: string;
  hsnCode?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderQuantity?: number;
  currentStock: number;
  warehouseId?: number | null;
  warehouseName?: string;
  barcode?: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Default Datasets ───────────────────────────────────────────

const DEFAULT_CONFIG: BusinessConfig = {
  businessType: 'BOTH',
  companyType: 'Private Limited',
  industrySector: 'Manufacturing / Assembly',
  financialYearStart: 'April',
  currency: 'INR (₹)',
  inventoryValuation: 'FIFO',
  defaultPaymentTerms: 30,
  defaultGstRate: 18,
  compositionScheme: false,
  enableRcm: false,
  enableEwayBill: true,
  ewayBillThreshold: 50000,
  enableEinvoice: false,
  invoicePrefix: 'INV-',
  invoiceNextNumber: 1001,
  poPrefix: 'PO-',
  poNextNumber: 1001,
  quotationPrefix: 'QT-',
  quotationNextNumber: 1001,
  enableMultiWarehouse: true,
  enableBatchTracking: false,
  enableSerialTracking: false,
  preventNegativeStock: true,
  enableLineDiscounts: true,
  autoRoundOff: true,
};

const DEFAULT_CATEGORIES: ItemCategory[] = [
  {
    id: 1,
    categoryCode: 'CAT-RAW',
    categoryName: 'Raw Materials & Metals',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '7214',
    defaultGstRate: 18,
    description: 'Raw steel rods, sheets, aluminum ingots and base materials',
    itemCount: 14,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    categoryCode: 'CAT-FG',
    categoryName: 'Finished Industrial Goods',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '8479',
    defaultGstRate: 18,
    description: 'Finished machines, control panels, assembled components',
    itemCount: 22,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    categoryCode: 'CAT-ELEC',
    categoryName: 'Electrical & Electronics',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '8504',
    defaultGstRate: 18,
    description: 'Transformers, switchgears, circuit boards and wiring harnesses',
    itemCount: 18,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    categoryCode: 'CAT-PKG',
    categoryName: 'Packaging Materials',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '4819',
    defaultGstRate: 12,
    description: 'Corrugated cartons, bubble wrap, polybags and wooden pallets',
    itemCount: 8,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    categoryCode: 'CAT-CHEM',
    categoryName: 'Industrial Consumables & Chemicals',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '2710',
    defaultGstRate: 18,
    description: 'Lubricants, hydraulic oils, cleaning solvents, cutting fluids',
    itemCount: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    categoryCode: 'CAT-SRV',
    categoryName: 'Consulting & Engineering Services',
    parentCategoryId: null,
    parentCategoryName: null,
    defaultHsnCode: '9983',
    defaultGstRate: 18,
    description: 'Installation, design validation, maintenance and calibration',
    itemCount: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: 1,
    warehouseCode: 'WH-MAIN-01',
    warehouseName: 'Main Central Hub',
    warehouseType: 'Central Warehouse',
    contactPerson: 'Rajesh Kumar',
    contactPhone: '+91 98450 12345',
    contactEmail: 'rajesh.k@company.com',
    addressLine1: 'Plot No. 45, Phase 2 Industrial Area',
    addressLine2: 'Near Highway Toll Plaza',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    country: 'India',
    capacity: '25,000 sq.ft / 500 MT',
    isDefault: true,
    status: 'active',
    totalItemsStored: 64,
    notes: 'Primary dispatch and storage facility with round-the-clock security',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    warehouseCode: 'WH-PLANT-02',
    warehouseName: 'Plant 1 Storage Depot',
    warehouseType: 'Manufacturing Plant',
    contactPerson: 'Suresh Nair',
    contactPhone: '+91 94432 98765',
    contactEmail: 'suresh.n@company.com',
    addressLine1: 'Survey 112/4, SIPCOT Industrial Park',
    addressLine2: 'Sector 3B',
    city: 'Hosur',
    state: 'Tamil Nadu',
    pincode: '635126',
    country: 'India',
    capacity: '15,000 sq.ft',
    isDefault: false,
    status: 'active',
    totalItemsStored: 38,
    notes: 'Dedicated for raw material receipt and WIP storage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    warehouseCode: 'WH-NORTH-03',
    warehouseName: 'North Logistics Centre',
    warehouseType: 'Regional Hub',
    contactPerson: 'Amit Sharma',
    contactPhone: '+91 98110 45678',
    contactEmail: 'amit.s@company.com',
    addressLine1: 'Khasra 234, Pataudi Road Logistics Park',
    addressLine2: 'Sector 10',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    country: 'India',
    capacity: '18,000 sq.ft',
    isDefault: false,
    status: 'active',
    totalItemsStored: 29,
    notes: 'North region distribution and customer fulfillment hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_ITEMS: ItemMasterItem[] = [
  {
    id: 1,
    itemCode: 'ITM-1001',
    itemName: 'Stainless Steel Sheet 304 (2mm)',
    itemType: 'Raw Material',
    categoryId: 1,
    categoryName: 'Raw Materials & Metals',
    hsnCode: '7219',
    unit: 'Kg',
    purchasePrice: 220,
    sellingPrice: 285,
    gstRate: 18,
    minStockLevel: 100,
    maxStockLevel: 1500,
    reorderQuantity: 300,
    currentStock: 450,
    warehouseId: 1,
    warehouseName: 'Main Central Hub',
    barcode: '890123450001',
    status: 'active',
    description: 'High corrosion resistance cold rolled austenitic stainless steel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    itemCode: 'ITM-1002',
    itemName: 'Industrial Control Panel 3-Phase 415V',
    itemType: 'Finished Goods',
    categoryId: 2,
    categoryName: 'Finished Industrial Goods',
    hsnCode: '8537',
    unit: 'Nos',
    purchasePrice: 14500,
    sellingPrice: 21000,
    gstRate: 18,
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderQuantity: 10,
    currentStock: 18,
    warehouseId: 1,
    warehouseName: 'Main Central Hub',
    barcode: '890123450002',
    status: 'active',
    description: 'IP65 rated automated motor control center with PLC interface',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    itemCode: 'ITM-1003',
    itemName: 'Heavy Duty 5-Ply Corrugated Box',
    itemType: 'Consumable',
    categoryId: 4,
    categoryName: 'Packaging Materials',
    hsnCode: '4819',
    unit: 'Nos',
    purchasePrice: 24,
    sellingPrice: 38,
    gstRate: 12,
    minStockLevel: 300,
    maxStockLevel: 5000,
    reorderQuantity: 1000,
    currentStock: 1200,
    warehouseId: 1,
    warehouseName: 'Main Central Hub',
    barcode: '890123450003',
    status: 'active',
    description: 'Kraft paper double wall boxes for export shipping (600x400x400mm)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    itemCode: 'ITM-1004',
    itemName: 'Enameled Copper Winding Wire 1.5mm',
    itemType: 'Raw Material',
    categoryId: 1,
    categoryName: 'Raw Materials & Metals',
    hsnCode: '7408',
    unit: 'Kg',
    purchasePrice: 680,
    sellingPrice: 830,
    gstRate: 18,
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderQuantity: 100,
    currentStock: 85,
    warehouseId: 2,
    warehouseName: 'Plant 1 Storage Depot',
    barcode: '890123450004',
    status: 'active',
    description: 'Dual coated Class H polyesterimide enameled copper wire',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    itemCode: 'ITM-1005',
    itemName: 'Precision CNC Turned Shaft 25mm',
    itemType: 'Trading Goods',
    categoryId: 2,
    categoryName: 'Finished Industrial Goods',
    hsnCode: '8483',
    unit: 'Nos',
    purchasePrice: 350,
    sellingPrice: 520,
    gstRate: 18,
    minStockLevel: 50,
    maxStockLevel: 800,
    reorderQuantity: 150,
    currentStock: 320,
    warehouseId: 3,
    warehouseName: 'North Logistics Centre',
    barcode: '890123450005',
    status: 'active',
    description: 'EN8 grade hardened and ground transmission shafts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ── Storage Keys ───────────────────────────────────────────────

const KEY_CONFIG = 'inventra_masters_business_config';
const KEY_CATEGORIES = 'inventra_masters_categories';
const KEY_WAREHOUSES = 'inventra_masters_warehouses';
const KEY_ITEMS = 'inventra_masters_items';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error for', key, err);
  }
}

// ── API Services ───────────────────────────────────────────────

export const businessConfigApi = {
  get: async (): Promise<BusinessConfig> => {
    try {
      const res = await api.get('/masters/business-config');
      if (res?.data) {
        setStored(KEY_CONFIG, res.data);
        return res.data;
      }
    } catch {
      // fallback to persistent local storage
    }
    return getStored<BusinessConfig>(KEY_CONFIG, DEFAULT_CONFIG);
  },

  update: async (data: Partial<BusinessConfig>): Promise<BusinessConfig> => {
    const current = getStored<BusinessConfig>(KEY_CONFIG, DEFAULT_CONFIG);
    const merged = { ...current, ...data };
    setStored(KEY_CONFIG, merged);

    // Sync businessType with authStore and localStorage
    if (data.businessType) {
      localStorage.setItem('inventra-business-type', data.businessType);
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().updateUser({ ...user, businessType: data.businessType });
      }
    }

    try {
      const res = await api.put('/masters/business-config', merged);
      if (res?.data) return res.data;
    } catch {
      // offline / mock mode
    }
    return merged;
  },
};

export const categoryApi = {
  list: async (params?: any): Promise<ItemCategory[]> => {
    try {
      const res = await api.get('/masters/categories', { params });
      if (Array.isArray(res?.data)) {
        setStored(KEY_CATEGORIES, res.data);
        return res.data;
      }
    } catch {
      // fallback
    }
    return getStored<ItemCategory[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES);
  },

  get: async (id: number): Promise<ItemCategory | undefined> => {
    const list = await categoryApi.list();
    return list.find((c) => c.id === id);
  },

  create: async (data: Omit<ItemCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItemCategory> => {
    const list = getStored<ItemCategory[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES);
    const newCategory: ItemCategory = {
      ...data,
      id: list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1,
      itemCount: data.itemCount ?? 0,
      status: data.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newCategory, ...list];
    setStored(KEY_CATEGORIES, updated);

    try {
      const res = await api.post('/masters/categories', data);
      if (res?.data) return res.data;
    } catch {}
    return newCategory;
  },

  update: async (id: number, data: Partial<ItemCategory>): Promise<ItemCategory> => {
    const list = getStored<ItemCategory[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES);
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const updatedCat: ItemCategory = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedCat;
    setStored(KEY_CATEGORIES, list);

    try {
      const res = await api.put(`/masters/categories/${id}`, data);
      if (res?.data) return res.data;
    } catch {}
    return updatedCat;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const list = getStored<ItemCategory[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES);
    const filtered = list.filter((c) => c.id !== id);
    setStored(KEY_CATEGORIES, filtered);

    try {
      await api.delete(`/masters/categories/${id}`);
    } catch {}
    return { success: true };
  },
};

export const warehouseApi = {
  list: async (params?: any): Promise<Warehouse[]> => {
    try {
      const res = await api.get('/masters/warehouses', { params });
      if (Array.isArray(res?.data)) {
        setStored(KEY_WAREHOUSES, res.data);
        return res.data;
      }
    } catch {}
    return getStored<Warehouse[]>(KEY_WAREHOUSES, DEFAULT_WAREHOUSES);
  },

  get: async (id: number): Promise<Warehouse | undefined> => {
    const list = await warehouseApi.list();
    return list.find((w) => w.id === id);
  },

  create: async (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> => {
    const list = getStored<Warehouse[]>(KEY_WAREHOUSES, DEFAULT_WAREHOUSES);
    
    // If set as default, unset other defaults
    if (data.isDefault) {
      list.forEach((w) => { w.isDefault = false; });
    }

    const newWh: Warehouse = {
      ...data,
      id: list.length ? Math.max(...list.map((w) => w.id)) + 1 : 1,
      totalItemsStored: data.totalItemsStored ?? 0,
      status: data.status ?? 'active',
      country: data.country || 'India',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newWh, ...list];
    setStored(KEY_WAREHOUSES, updated);

    try {
      const res = await api.post('/masters/warehouses', data);
      if (res?.data) return res.data;
    } catch {}
    return newWh;
  },

  update: async (id: number, data: Partial<Warehouse>): Promise<Warehouse> => {
    const list = getStored<Warehouse[]>(KEY_WAREHOUSES, DEFAULT_WAREHOUSES);
    const index = list.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Warehouse not found');

    if (data.isDefault) {
      list.forEach((w) => { w.isDefault = false; });
    }

    const updatedWh: Warehouse = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedWh;
    setStored(KEY_WAREHOUSES, list);

    try {
      const res = await api.put(`/masters/warehouses/${id}`, data);
      if (res?.data) return res.data;
    } catch {}
    return updatedWh;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const list = getStored<Warehouse[]>(KEY_WAREHOUSES, DEFAULT_WAREHOUSES);
    const filtered = list.filter((w) => w.id !== id);
    setStored(KEY_WAREHOUSES, filtered);

    try {
      await api.delete(`/masters/warehouses/${id}`);
    } catch {}
    return { success: true };
  },
};

export const itemMasterApi = {
  list: async (params?: any): Promise<ItemMasterItem[]> => {
    try {
      const res = await api.get('/masters/items', { params });
      if (Array.isArray(res?.data)) {
        setStored(KEY_ITEMS, res.data);
        return res.data;
      }
    } catch {}
    return getStored<ItemMasterItem[]>(KEY_ITEMS, DEFAULT_ITEMS);
  },

  get: async (id: number): Promise<ItemMasterItem | undefined> => {
    const list = await itemMasterApi.list();
    return list.find((i) => i.id === id);
  },

  create: async (data: Omit<ItemMasterItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItemMasterItem> => {
    const list = getStored<ItemMasterItem[]>(KEY_ITEMS, DEFAULT_ITEMS);
    const newItem: ItemMasterItem = {
      ...data,
      id: list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1,
      status: data.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    setStored(KEY_ITEMS, updated);

    try {
      const res = await api.post('/masters/items', data);
      if (res?.data) return res.data;
    } catch {}
    return newItem;
  },

  update: async (id: number, data: Partial<ItemMasterItem>): Promise<ItemMasterItem> => {
    const list = getStored<ItemMasterItem[]>(KEY_ITEMS, DEFAULT_ITEMS);
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const updatedItem: ItemMasterItem = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedItem;
    setStored(KEY_ITEMS, list);

    try {
      const res = await api.put(`/masters/items/${id}`, data);
      if (res?.data) return res.data;
    } catch {}
    return updatedItem;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const list = getStored<ItemMasterItem[]>(KEY_ITEMS, DEFAULT_ITEMS);
    const filtered = list.filter((i) => i.id !== id);
    setStored(KEY_ITEMS, filtered);

    try {
      await api.delete(`/masters/items/${id}`);
    } catch {}
    return { success: true };
  },
};
