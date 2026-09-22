import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Boxes, Plus, Pencil, Trash2, Search, Filter, Eye, AlertTriangle,
  PackageCheck, CheckCircle2, XCircle, ArrowUpDown, Tag, Warehouse as WarehouseIcon,
  Download, RefreshCw, Layers
} from 'lucide-react';
import {
  itemMasterApi, categoryApi, warehouseApi,
  ItemMasterItem, ItemCategory, Warehouse
} from '../../services/apiServices';
import {
  PageHeader, Modal, Field, Confirm, EmptyState, Spinner, inr, StatCard
} from '../../components/ui';
import toast from 'react-hot-toast';

const ITEM_TYPES: Array<ItemMasterItem['itemType']> = [
  'Finished Goods',
  'Raw Material',
  'Work In Progress',
  'Trading Goods',
  'Consumable',
  'Service',
];

const UNITS = [
  'Nos', 'Kg', 'MT', 'Litre', 'Box', 'Set', 'Meter', 'Sq.Ft', 'Sq.Mt', 'Pair', 'Roll', 'Drum', 'Hour'
];

const GST_RATES = [0, 5, 12, 18, 28];

const emptyItem: Omit<ItemMasterItem, 'id' | 'createdAt' | 'updatedAt'> = {
  itemCode: '',
  itemName: '',
  itemType: 'Finished Goods',
  categoryId: null,
  categoryName: '',
  hsnCode: '',
  unit: 'Nos',
  purchasePrice: 0,
  sellingPrice: 0,
  gstRate: 18,
  minStockLevel: 10,
  maxStockLevel: 500,
  reorderQuantity: 50,
  currentStock: 0,
  warehouseId: null,
  warehouseName: '',
  barcode: '',
  status: 'active',
  description: '',
};

export default function ItemMasterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ItemMasterItem | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyItem);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Queries
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['item-master'],
    queryFn: () => itemMasterApi.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => categoryApi.list(),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseApi.list(),
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: () => {
      // Find category name and warehouse name
      const cat = categories.find((c) => c.id === Number(formData.categoryId));
      const wh = warehouses.find((w) => w.id === Number(formData.warehouseId));
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        categoryName: cat ? cat.categoryName : formData.categoryName,
        warehouseId: formData.warehouseId ? Number(formData.warehouseId) : null,
        warehouseName: wh ? wh.warehouseName : formData.warehouseName,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        gstRate: Number(formData.gstRate) || 0,
        minStockLevel: Number(formData.minStockLevel) || 0,
        maxStockLevel: Number(formData.maxStockLevel) || 0,
        reorderQuantity: Number(formData.reorderQuantity) || 0,
        currentStock: Number(formData.currentStock) || 0,
      };

      if (editingId) {
        return itemMasterApi.update(editingId, payload);
      }
      return itemMasterApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item-master'] });
      setModalOpen(false);
      toast.success(editingId ? 'Item updated successfully' : 'Item created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error saving item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => itemMasterApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item-master'] });
      setDeleteId(null);
      toast.success('Item deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error deleting item');
    },
  });

  // Filtered Items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === '' ||
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        (item.hsnCode && item.hsnCode.includes(search)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(search.toLowerCase()));

      const matchType = selectedType === 'ALL' || item.itemType === selectedType;
      const matchCat = selectedCategory === 'ALL' || String(item.categoryId) === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchSearch && matchType && matchCat && matchStatus;
    });
  }, [items, search, selectedType, selectedCategory, selectedStatus]);

  // KPI Calculations
  const totalStockValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.currentStock * item.purchasePrice), 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter((i) => i.currentStock <= i.minStockLevel).length;
  }, [items]);

  const handleOpenCreate = () => {
    const nextNum = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
    const defaultCat = categories[0];

    setFormData({
      ...emptyItem,
      itemCode: `ITM-${1000 + nextNum}`,
      categoryId: defaultCat?.id || null,
      categoryName: defaultCat?.categoryName || '',
      warehouseId: defaultWh?.id || null,
      warehouseName: defaultWh?.warehouseName || '',
      hsnCode: defaultCat?.defaultHsnCode || '',
      gstRate: defaultCat?.defaultGstRate ?? 18,
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ItemMasterItem) => {
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      itemType: item.itemType,
      categoryId: item.categoryId ?? null,
      categoryName: item.categoryName || '',
      hsnCode: item.hsnCode || '',
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      gstRate: item.gstRate,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel ?? 500,
      reorderQuantity: item.reorderQuantity ?? 50,
      currentStock: item.currentStock,
      warehouseId: item.warehouseId ?? null,
      warehouseName: item.warehouseName || '',
      barcode: item.barcode || '',
      status: item.status,
      description: item.description || '',
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error('No items to export');
      return;
    }
    const headers = ['Code', 'Name', 'Type', 'Category', 'HSN', 'Unit', 'Purchase Price', 'Selling Price', 'GST %', 'Current Stock', 'Min Stock', 'Warehouse', 'Status'];
    const rows = items.map((i) => [
      i.itemCode,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.itemType,
      `"${(i.categoryName || '').replace(/"/g, '""')}"`,
      i.hsnCode || '',
      i.unit,
      i.purchasePrice,
      i.sellingPrice,
      i.gstRate,
      i.currentStock,
      i.minStockLevel,
      `"${(i.warehouseName || '').replace(/"/g, '""')}"`,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `item_master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Item Master exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Item Master"
        subtitle={`${items.length} items registered across inventory, trading goods & raw materials`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs sm:text-sm flex items-center gap-1.5"
              title="Export to CSV"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn-primary text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Catalog Items"
          value={items.length}
          icon={Boxes}
          color="blue"
          sub="All registered items"
        />
        <StatCard
          label="Active Items"
          value={items.filter((i) => i.status === 'active').length}
          icon={PackageCheck}
          color="green"
          sub="Available for billing"
        />
        <StatCard
          label="Low Stock Warnings"
          value={lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'amber' : 'green'}
          sub="Below reorder threshold"
        />
        <StatCard
          label="Est. Inventory Value"
          value={inr(totalStockValue)}
          icon={Layers}
          color="purple"
          sub="At purchase cost"
        />
      </div>

      {/* Filters & Search Bar */}
      <div className="card p-4 space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-9 w-full text-sm"
              placeholder="Search by code, name, HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="input w-full text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Item Types</option>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="input w-full text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="input w-full text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {(search || selectedType !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <span>Showing {filtered.length} of {items.length} matching items</span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table / Content */}
      <div className="table-container">
        {isLoading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="No items match your search or filters. Click 'Add Item' to create one." />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item / Code</th>
                    <th>Type &amp; Category</th>
                    <th>HSN / SAC</th>
                    <th>Unit</th>
                    <th className="text-right">Cost Price</th>
                    <th className="text-right">Sale Price</th>
                    <th className="text-right">GST %</th>
                    <th className="text-right">Stock</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const isLow = item.currentStock <= item.minStockLevel;
                    const isOut = item.currentStock <= 0;
                    return (
                      <tr key={item.id} className={isLow ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                        <td>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{item.itemName}</div>
                          <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{item.itemCode}</div>
                        </td>

                        <td>
                          <div className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span className="badge-blue text-[11px]">{item.itemType}</span>
                          </div>
                          {item.categoryName && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{item.categoryName}</div>
                          )}
                        </td>

                        <td className="font-mono text-xs text-gray-600 dark:text-gray-300">
                          {item.hsnCode || '—'}
                        </td>

                        <td className="text-sm">{item.unit}</td>

                        <td className="text-right font-medium text-gray-700 dark:text-gray-300">
                          {inr(item.purchasePrice)}
                        </td>

                        <td className="text-right font-bold text-gray-900 dark:text-gray-100">
                          {inr(item.sellingPrice)}
                        </td>

                        <td className="text-right font-mono text-xs">{item.gstRate}%</td>

                        <td className="text-right">
                          <div className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.currentStock} {item.unit}
                          </div>
                          {isLow && (
                            <div className="text-[10px] text-amber-500 font-semibold">Min: {item.minStockLevel}</div>
                          )}
                        </td>

                        <td>
                          {item.status === 'active' ? (
                            <span className="badge-green text-xs font-medium">Active</span>
                          ) : (
                            <span className="badge-gray text-xs font-medium">Inactive</span>
                          )}
                        </td>

                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewItem(item)}
                              className="btn-ghost btn-sm p-1.5 text-gray-500 hover:text-indigo-600"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="btn-ghost btn-sm p-1.5 text-gray-500 hover:text-blue-600"
                              title="Edit Item"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-700"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStockLevel;
                const isOut = item.currentStock <= 0;
                return (
                  <div key={item.id} className="card overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{item.itemName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-indigo-600 font-bold">{item.itemCode}</span>
                          <span className="badge-blue text-[10px]">{item.itemType}</span>
                        </div>
                      </div>
                      <span className={item.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
                        {item.status}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{item.categoryName || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">HSN / GST</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{item.hsnCode || '—'} ({item.gstRate}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cost / Sale</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{inr(item.purchasePrice)} / {inr(item.sellingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stock</p>
                          <p className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 border-t border-gray-200 dark:border-gray-800 divide-x divide-gray-200 dark:divide-gray-800 text-center text-xs font-semibold">
                      <button
                        onClick={() => setViewItem(item)}
                        className="py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="py-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center gap-1.5"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Catalog Item' : 'New Catalog Item'}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Item Code / SKU" required>
              <input
                type="text"
                className="input font-mono font-semibold"
                required
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                placeholder="ITM-1001"
              />
            </Field>

            <Field label="Item Name" required>
              <input
                type="text"
                className="input font-medium"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="e.g. Stainless Steel Sheet 304"
              />
            </Field>

            <Field label="Item Classification / Type" required>
              <select
                className="input font-medium"
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value as any })}
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              <select
                className="input font-medium"
                value={formData.categoryId || ''}
                onChange={(e) => {
                  const catId = e.target.value ? Number(e.target.value) : null;
                  const cat = categories.find((c) => c.id === catId);
                  setFormData({
                    ...formData,
                    categoryId: catId,
                    categoryName: cat?.categoryName || '',
                    hsnCode: cat?.defaultHsnCode || formData.hsnCode,
                    gstRate: cat?.defaultGstRate ?? formData.gstRate,
                  });
                }}
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
              </select>
            </Field>

            <Field label="HSN / SAC Code">
              <input
                type="text"
                className="input font-mono"
                value={formData.hsnCode || ''}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                placeholder="e.g. 7219"
              />
            </Field>

            <Field label="Unit of Measurement (UOM)" required>
              <select
                className="input font-medium"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>

            <Field label="Purchase / Cost Price (₹)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input font-mono font-semibold"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Selling Price / MRP (₹)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input font-mono font-semibold"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              />
            </Field>

            <Field label="GST Tax Rate (%)" required>
              <select
                className="input font-medium"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value) || 0 })}
              >
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>{r}% GST</option>
                ))}
              </select>
            </Field>

            <Field label="Current / Opening Stock">
              <input
                type="number"
                step="0.01"
                className="input font-mono"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Minimum Reorder Threshold">
              <input
                type="number"
                className="input font-mono"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Default Storage Warehouse">
              <select
                className="input font-medium"
                value={formData.warehouseId || ''}
                onChange={(e) => {
                  const whId = e.target.value ? Number(e.target.value) : null;
                  const wh = warehouses.find((w) => w.id === whId);
                  setFormData({
                    ...formData,
                    warehouseId: whId,
                    warehouseName: wh?.warehouseName || '',
                  });
                }}
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouseName} ({w.city})</option>
                ))}
              </select>
            </Field>

            <Field label="Barcode / Serial / EAN">
              <input
                type="text"
                className="input font-mono"
                value={formData.barcode || ''}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 890123450001"
              />
            </Field>

            <Field label="Status">
              <select
                className="input font-medium"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <Field label="Description &amp; Specifications">
            <textarea
              rows={2}
              className="input resize-none text-sm"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter technical specifications, grade, dimensions, or vendor notes..."
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary"
            >
              {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Item Details Modal */}
      {viewItem && (
        <Modal
          open={Boolean(viewItem)}
          onClose={() => setViewItem(null)}
          title={`Item Details: ${viewItem.itemCode}`}
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{viewItem.itemName}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="badge-blue text-xs">{viewItem.itemType}</span>
                <span className="badge-purple text-xs">{viewItem.categoryName || 'Uncategorized'}</span>
                <span className={viewItem.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
                  {viewItem.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">HSN / SAC Code</p>
                <p className="font-mono font-medium text-gray-800 dark:text-gray-200">{viewItem.hsnCode || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">GST Tax Rate</p>
                <p className="font-mono font-medium text-gray-800 dark:text-gray-200">{viewItem.gstRate}%</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Purchase / Cost Price</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">{inr(viewItem.purchasePrice)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Selling Price / MRP</p>
                <p className="font-bold text-emerald-600">{inr(viewItem.sellingPrice)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Current Stock</p>
                <p className="font-bold text-indigo-600">{viewItem.currentStock} {viewItem.unit}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Min Reorder Level</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{viewItem.minStockLevel} {viewItem.unit}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Default Warehouse</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{viewItem.warehouseName || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Barcode / SKU</p>
                <p className="font-mono text-xs text-gray-800 dark:text-gray-200">{viewItem.barcode || '—'}</p>
              </div>
            </div>

            {viewItem.description && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Specifications &amp; Notes</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{viewItem.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <Confirm
        open={deleteId !== null}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action will remove it from the item master catalog."
        danger
      />
    </div>
  );
}
