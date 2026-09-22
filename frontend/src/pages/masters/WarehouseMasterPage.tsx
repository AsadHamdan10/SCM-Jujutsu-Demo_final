import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Warehouse as WarehouseIcon, Plus, Pencil, Trash2, Search, MapPin,
  Phone, Mail, User, CheckCircle2, Star, Building2, Eye, ShieldCheck,
  Boxes, Navigation, Layers
} from 'lucide-react';
import {
  warehouseApi, Warehouse
} from '../../services/apiServices';
import {
  PageHeader, Modal, Field, Confirm, EmptyState, Spinner, StatCard
} from '../../components/ui';
import toast from 'react-hot-toast';

const WAREHOUSE_TYPES = [
  'Central Warehouse',
  'Manufacturing Plant',
  'Regional Hub',
  'Retail Outlet',
  'Transit / 3PL Depot',
  'Raw Material Yard',
  'Quarantine / QA Inspection',
];

const emptyWarehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'> = {
  warehouseCode: '',
  warehouseName: '',
  warehouseType: 'Central Warehouse',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  capacity: '',
  isDefault: false,
  status: 'active',
  totalItemsStored: 0,
  notes: '',
};

export default function WarehouseMasterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyWarehouse);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewWh, setViewWh] = useState<Warehouse | null>(null);

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...formData,
        totalItemsStored: Number(formData.totalItemsStored) || 0,
      };
      if (editingId) {
        return warehouseApi.update(editingId, payload);
      }
      return warehouseApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      setModalOpen(false);
      toast.success(editingId ? 'Warehouse updated' : 'Warehouse created');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save warehouse');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => warehouseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      setDeleteId(null);
      toast.success('Warehouse deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete warehouse');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (wh: Warehouse) => warehouseApi.update(wh.id, { isDefault: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Default warehouse updated');
    },
  });

  const filtered = useMemo(() => {
    return warehouses.filter((wh) => {
      const matchSearch =
        search === '' ||
        wh.warehouseName.toLowerCase().includes(search.toLowerCase()) ||
        wh.warehouseCode.toLowerCase().includes(search.toLowerCase()) ||
        (wh.city && wh.city.toLowerCase().includes(search.toLowerCase())) ||
        (wh.contactPerson && wh.contactPerson.toLowerCase().includes(search.toLowerCase()));

      const matchType = selectedType === 'ALL' || wh.warehouseType === selectedType;
      const matchStatus = selectedStatus === 'ALL' || wh.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [warehouses, search, selectedType, selectedStatus]);

  const defaultWarehouse = useMemo(() => {
    return warehouses.find((w) => w.isDefault) || warehouses[0];
  }, [warehouses]);

  const handleOpenCreate = () => {
    const nextNum = warehouses.length ? Math.max(...warehouses.map((w) => w.id)) + 1 : 1;
    setFormData({
      ...emptyWarehouse,
      warehouseCode: `WH-${nextNum < 10 ? '0' + nextNum : nextNum}`,
      isDefault: warehouses.length === 0,
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setFormData({
      warehouseCode: wh.warehouseCode,
      warehouseName: wh.warehouseName,
      warehouseType: wh.warehouseType,
      contactPerson: wh.contactPerson || '',
      contactPhone: wh.contactPhone || '',
      contactEmail: wh.contactEmail || '',
      addressLine1: wh.addressLine1 || '',
      addressLine2: wh.addressLine2 || '',
      city: wh.city || '',
      state: wh.state || '',
      pincode: wh.pincode || '',
      country: wh.country || 'India',
      capacity: wh.capacity || '',
      isDefault: wh.isDefault,
      status: wh.status,
      totalItemsStored: wh.totalItemsStored,
      notes: wh.notes || '',
    });
    setEditingId(wh.id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Warehouse Master"
        subtitle={`${warehouses.length} storage locations, manufacturing plants & distribution depots`}
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            Add Warehouse
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Facilities"
          value={warehouses.length}
          icon={WarehouseIcon}
          color="blue"
          sub="All registered locations"
        />
        <StatCard
          label="Active Facilities"
          value={warehouses.filter((w) => w.status === 'active').length}
          icon={Building2}
          color="green"
          sub="Operational godowns"
        />
        <StatCard
          label="Default Dispatch Hub"
          value={defaultWarehouse?.warehouseName || 'None'}
          icon={Star}
          color="purple"
          sub={defaultWarehouse?.city ? `Located in ${defaultWarehouse.city}` : 'Primary warehouse'}
        />
        <StatCard
          label="Total Storage Units"
          value={warehouses.reduce((s, w) => s + (w.totalItemsStored || 0), 0)}
          icon={Boxes}
          color="indigo"
          sub="Items in inventory"
        />
      </div>

      {/* Filter Bar */}
      <div className="card p-4 space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-9 w-full text-sm"
              placeholder="Search by code, name, city, manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="input w-full text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Warehouse Types</option>
              {WAREHOUSE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

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

        {(search || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <span>Showing {filtered.length} of {warehouses.length} locations</span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="table-container">
        {isLoading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="No warehouses found. Click 'Add Warehouse' to register a new storage location." />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Warehouse / Code</th>
                    <th>Type</th>
                    <th>Location / City</th>
                    <th>Facility Manager</th>
                    <th>Capacity &amp; Storage</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((wh) => (
                    <tr key={wh.id} className={wh.isDefault ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{wh.warehouseName}</span>
                          {wh.isDefault && (
                            <span className="badge-blue text-[10px] flex items-center gap-1 font-bold">
                              <Star size={10} className="fill-current text-blue-500" /> Default
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{wh.warehouseCode}</div>
                      </td>

                      <td>
                        <span className="badge-gray text-xs font-medium">{wh.warehouseType}</span>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200 font-medium">
                          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{wh.city || '—'}{wh.state ? `, ${wh.state}` : ''}</span>
                        </div>
                        {wh.pincode && <div className="text-[11px] font-mono text-gray-400 pl-4">PIN: {wh.pincode}</div>}
                      </td>

                      <td>
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {wh.contactPerson || '—'}
                        </div>
                        {wh.contactPhone && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} /> {wh.contactPhone}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {wh.capacity || 'Standard'}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {wh.totalItemsStored} items tracked
                        </div>
                      </td>

                      <td>
                        {wh.status === 'active' ? (
                          <span className="badge-green text-xs">Active</span>
                        ) : (
                          <span className="badge-gray text-xs">Inactive</span>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {!wh.isDefault && (
                            <button
                              onClick={() => setDefaultMutation.mutate(wh)}
                              className="btn-ghost btn-sm p-1.5 text-gray-400 hover:text-amber-500"
                              title="Set as Default Facility"
                            >
                              <Star size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setViewWh(wh)}
                            className="btn-ghost btn-sm p-1.5 text-gray-500 hover:text-indigo-600"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(wh)}
                            className="btn-ghost btn-sm p-1.5 text-gray-500 hover:text-blue-600"
                            title="Edit Warehouse"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(wh.id)}
                            className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-700"
                            title="Delete Warehouse"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((wh) => (
                <div key={wh.id} className="card overflow-hidden border border-gray-200 dark:border-gray-800">
                  <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-gray-900 dark:text-gray-100">{wh.warehouseName}</span>
                        {wh.isDefault && <span className="badge-blue text-[10px] font-bold">Default</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-indigo-600 font-bold">{wh.warehouseCode}</span>
                        <span className="badge-gray text-[10px]">{wh.warehouseType}</span>
                      </div>
                    </div>
                    <span className={wh.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
                      {wh.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{wh.city || '—'}{wh.state ? `, ${wh.state}` : ''} {wh.pincode ? `(${wh.pincode})` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span>Manager: {wh.contactPerson || '—'} {wh.contactPhone ? `(${wh.contactPhone})` : ''}</span>
                    </div>

                    {wh.capacity && (
                      <div className="text-xs text-gray-500">
                        Capacity: <span className="font-medium text-gray-800 dark:text-gray-200">{wh.capacity}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 border-t border-gray-200 dark:border-gray-800 divide-x divide-gray-200 dark:divide-gray-800 text-center text-xs font-semibold">
                    <button
                      onClick={() => setViewWh(wh)}
                      className="py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleOpenEdit(wh)}
                      className="py-2.5 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(wh.id)}
                      className="py-2.5 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Warehouse Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Storage Facility' : 'Add New Warehouse'}
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
            <Field label="Warehouse Code" required>
              <input
                type="text"
                className="input font-mono font-semibold"
                required
                value={formData.warehouseCode}
                onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
                placeholder="WH-01"
              />
            </Field>

            <Field label="Warehouse / Facility Name" required>
              <input
                type="text"
                className="input font-medium"
                required
                value={formData.warehouseName}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                placeholder="e.g. Main Central Hub"
              />
            </Field>

            <Field label="Facility Classification" required>
              <select
                className="input font-medium"
                value={formData.warehouseType}
                onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value })}
              >
                {WAREHOUSE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Storage Capacity &amp; Specs">
              <input
                type="text"
                className="input"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g. 25,000 sq.ft / 500 MT"
              />
            </Field>

            <Field label="Manager / In-Charge Name">
              <input
                type="text"
                className="input font-medium"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
              />
            </Field>

            <Field label="Contact Phone / Mobile">
              <input
                type="text"
                className="input font-mono"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 98450 12345"
              />
            </Field>

            <Field label="Contact Email">
              <input
                type="email"
                className="input"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="warehouse@company.com"
              />
            </Field>

            <Field label="Status">
              <select
                className="input font-medium"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Active Facility</option>
                <option value="inactive">Inactive / Closed</option>
              </select>
            </Field>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Address &amp; Geographic Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address Line 1">
                  <input
                    type="text"
                    className="input"
                    value={formData.addressLine1 || ''}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="Plot / Survey No, Street"
                  />
                </Field>
              </div>

              <Field label="City">
                <input
                  type="text"
                  className="input font-medium"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                />
              </Field>

              <Field label="State">
                <input
                  type="text"
                  className="input"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Karnataka"
                />
              </Field>

              <Field label="Pincode / Postal Code">
                <input
                  type="text"
                  className="input font-mono"
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560058"
                />
              </Field>

              <Field label="Country">
                <input
                  type="text"
                  className="input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="India"
                />
              </Field>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Set as Primary / Default Warehouse
              </span>
            </label>
          </div>

          <Field label="Operational Notes">
            <textarea
              rows={2}
              className="input resize-none text-sm"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Security instructions, dock hours, loading bay restrictions..."
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
              {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Warehouse Details Modal */}
      {viewWh && (
        <Modal
          open={Boolean(viewWh)}
          onClose={() => setViewWh(null)}
          title={`Facility Profile: ${viewWh.warehouseName}`}
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{viewWh.warehouseName}</h3>
                <span className={viewWh.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
                  {viewWh.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-indigo-600 font-bold">{viewWh.warehouseCode}</span>
                <span className="badge-blue text-xs">{viewWh.warehouseType}</span>
                {viewWh.isDefault && <span className="badge-purple text-xs font-bold">Primary Hub</span>}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-400">Full Address</p>
              <p className="text-gray-800 dark:text-gray-200">
                {viewWh.addressLine1 && <>{viewWh.addressLine1}<br /></>}
                {viewWh.addressLine2 && <>{viewWh.addressLine2}<br /></>}
                {viewWh.city}{viewWh.state ? `, ${viewWh.state}` : ''} - {viewWh.pincode}
                <br />{viewWh.country}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-400">Manager</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{viewWh.contactPerson || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-mono text-gray-800 dark:text-gray-200">{viewWh.contactPhone || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-gray-800 dark:text-gray-200">{viewWh.contactEmail || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Capacity</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{viewWh.capacity || 'Standard'}</p>
              </div>
            </div>

            {viewWh.notes && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Operational Instructions</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{viewWh.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setViewWh(null)}
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
        title="Delete Warehouse"
        message="Are you sure you want to delete this warehouse facility? Items linked to this location will need to be reassigned."
        danger
      />
    </div>
  );
}
