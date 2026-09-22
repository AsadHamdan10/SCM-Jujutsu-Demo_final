import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tags, Plus, Pencil, Trash2, Search, FolderTree, CheckCircle2,
  Layers, Hash, Percent, FileText, ArrowRight
} from 'lucide-react';
import {
  categoryApi, ItemCategory
} from '../../services/apiServices';
import {
  PageHeader, Modal, Field, Confirm, EmptyState, Spinner, StatCard
} from '../../components/ui';
import toast from 'react-hot-toast';

const GST_RATES = [0, 5, 12, 18, 28];

const emptyCategory: Omit<ItemCategory, 'id' | 'createdAt' | 'updatedAt'> = {
  categoryCode: '',
  categoryName: '',
  parentCategoryId: null,
  parentCategoryName: null,
  defaultHsnCode: '',
  defaultGstRate: 18,
  description: '',
  itemCount: 0,
  status: 'active',
};

export default function ItemCategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyCategory);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => categoryApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const parent = categories.find((c) => c.id === Number(formData.parentCategoryId));
      const payload = {
        ...formData,
        parentCategoryId: formData.parentCategoryId ? Number(formData.parentCategoryId) : null,
        parentCategoryName: parent ? parent.categoryName : null,
        defaultGstRate: Number(formData.defaultGstRate) || 18,
        itemCount: Number(formData.itemCount) || 0,
      };

      if (editingId) {
        return categoryApi.update(editingId, payload);
      }
      return categoryApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item-categories'] });
      setModalOpen(false);
      toast.success(editingId ? 'Category updated' : 'Category created');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error saving category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item-categories'] });
      setDeleteId(null);
      toast.success('Category deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error deleting category');
    },
  });

  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        search === '' ||
        cat.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        cat.categoryCode.toLowerCase().includes(search.toLowerCase()) ||
        (cat.defaultHsnCode && cat.defaultHsnCode.includes(search)) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = selectedStatus === 'ALL' || cat.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [categories, search, selectedStatus]);

  const rootCount = useMemo(() => {
    return categories.filter((c) => !c.parentCategoryId).length;
  }, [categories]);

  const subCount = useMemo(() => {
    return categories.filter((c) => Boolean(c.parentCategoryId)).length;
  }, [categories]);

  const handleOpenCreate = () => {
    const nextNum = categories.length ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    setFormData({
      ...emptyCategory,
      categoryCode: `CAT-${nextNum < 10 ? '0' + nextNum : nextNum}`,
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ItemCategory) => {
    setFormData({
      categoryCode: cat.categoryCode,
      categoryName: cat.categoryName,
      parentCategoryId: cat.parentCategoryId ?? null,
      parentCategoryName: cat.parentCategoryName ?? null,
      defaultHsnCode: cat.defaultHsnCode || '',
      defaultGstRate: cat.defaultGstRate,
      description: cat.description || '',
      itemCount: cat.itemCount,
      status: cat.status,
    });
    setEditingId(cat.id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Item Categories"
        subtitle={`${categories.length} item taxonomies with default HSN codes and GST rates`}
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            Add Category
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Categories"
          value={categories.length}
          icon={Tags}
          color="blue"
          sub="All registered taxonomies"
        />
        <StatCard
          label="Active Taxonomies"
          value={categories.filter((c) => c.status === 'active').length}
          icon={CheckCircle2}
          color="green"
          sub="Available in catalog"
        />
        <StatCard
          label="Root Categories"
          value={rootCount}
          icon={FolderTree}
          color="purple"
          sub="Top-level groups"
        />
        <StatCard
          label="Sub-Categories"
          value={subCount}
          icon={Layers}
          color="indigo"
          sub="Nested sub-groups"
        />
      </div>

      {/* Filter Bar */}
      <div className="card p-4 space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-9 w-full text-sm"
              placeholder="Search by code, category name, HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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

        {(search || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <span>Showing {filtered.length} of {categories.length} categories</span>
            <button
              onClick={() => {
                setSearch('');
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
          <EmptyState message="No item categories found. Click 'Add Category' to create one." />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category / Code</th>
                    <th>Parent Group</th>
                    <th>Default HSN / SAC</th>
                    <th>Default GST Rate</th>
                    <th>Linked Items</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{cat.categoryName}</div>
                        <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{cat.categoryCode}</div>
                        {cat.description && (
                          <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-sm">{cat.description}</div>
                        )}
                      </td>

                      <td>
                        {cat.parentCategoryName ? (
                          <span className="badge-purple text-xs flex items-center gap-1">
                            <ArrowRight size={10} /> {cat.parentCategoryName}
                          </span>
                        ) : (
                          <span className="badge-gray text-xs">Root / Top Level</span>
                        )}
                      </td>

                      <td className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {cat.defaultHsnCode || '—'}
                      </td>

                      <td className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {cat.defaultGstRate}%
                      </td>

                      <td>
                        <span className="badge-blue text-xs font-bold">
                          {cat.itemCount} items
                        </span>
                      </td>

                      <td>
                        {cat.status === 'active' ? (
                          <span className="badge-green text-xs">Active</span>
                        ) : (
                          <span className="badge-gray text-xs">Inactive</span>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="btn-ghost btn-sm p-1.5 text-gray-500 hover:text-blue-600"
                            title="Edit Category"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-700"
                            title="Delete Category"
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
              {filtered.map((cat) => (
                <div key={cat.id} className="card overflow-hidden border border-gray-200 dark:border-gray-800">
                  <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{cat.categoryName}</div>
                      <div className="font-mono text-xs text-indigo-600 font-bold mt-0.5">{cat.categoryCode}</div>
                    </div>
                    <span className={cat.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
                      {cat.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5 text-sm">
                    {cat.parentCategoryName && (
                      <div className="text-xs text-gray-500">
                        Parent: <span className="font-medium text-gray-800 dark:text-gray-200">{cat.parentCategoryName}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Default HSN:</span> <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{cat.defaultHsnCode || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">GST:</span> <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{cat.defaultGstRate}%</span>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 border-t border-gray-200 dark:border-gray-800 divide-x divide-gray-200 dark:divide-gray-800 text-center text-xs font-semibold">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="py-2.5 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(cat.id)}
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

      {/* Add / Edit Category Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Item Category' : 'Create Item Category'}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Category Code" required>
            <input
              type="text"
              className="input font-mono font-semibold"
              required
              value={formData.categoryCode}
              onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value })}
              placeholder="CAT-RAW"
            />
          </Field>

          <Field label="Category Name" required>
            <input
              type="text"
              className="input font-medium"
              required
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="e.g. Raw Materials & Metals"
            />
          </Field>

          <Field label="Parent Category (Optional Hierarchy)">
            <select
              className="input font-medium"
              value={formData.parentCategoryId || ''}
              onChange={(e) => {
                const pId = e.target.value ? Number(e.target.value) : null;
                const p = categories.find((c) => c.id === pId);
                setFormData({
                  ...formData,
                  parentCategoryId: pId,
                  parentCategoryName: p ? p.categoryName : null,
                });
              }}
            >
              <option value="">None (Root Category)</option>
              {categories
                .filter((c) => !editingId || c.id !== editingId)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Default HSN / SAC Code">
              <input
                type="text"
                className="input font-mono"
                value={formData.defaultHsnCode || ''}
                onChange={(e) => setFormData({ ...formData, defaultHsnCode: e.target.value })}
                placeholder="e.g. 7214"
              />
            </Field>

            <Field label="Default GST Rate (%)">
              <select
                className="input font-medium"
                value={formData.defaultGstRate}
                onChange={(e) => setFormData({ ...formData, defaultGstRate: parseInt(e.target.value) || 18 })}
              >
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>{r}% GST</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={2}
              className="input resize-none text-sm"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category scope, material classification notes..."
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
              {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Confirm
        open={deleteId !== null}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        title="Delete Category"
        message="Are you sure you want to delete this item category? Items assigned to this category will need to be re-categorized."
        danger
      />
    </div>
  );
}
