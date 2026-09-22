import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sliders, Building2, Layers, ShieldCheck, FileCheck, CheckCircle2,
  AlertCircle, Save, RotateCcw, Factory, ShoppingCart, Briefcase,
  TrendingUp, Warehouse, DollarSign,
} from 'lucide-react';
import { businessConfigApi, BusinessConfig } from '../../services/apiServices';
import { PageHeader, Spinner, Field } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const COMPANY_TYPES = [
  'Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company',
  'Public Limited Company',
  'Trust / Society',
  'Other',
];

const SECTORS = [
  'Trading / Wholesale Distribution',
  'Manufacturing / Assembly & Fabrication',
  'Retail / FMCG',
  'Engineering & Heavy Machinery',
  'Electrical & Electronics',
  'Textiles & Garments',
  'Chemicals, Petrochemicals & Polymers',
  'Automotive & Spare Parts',
  'Packaging & Printing',
  'Pharmaceutical & Healthcare',
  'Services & Consulting',
  'Other',
];

const INVENTORY_VALUATIONS: Array<BusinessConfig['inventoryValuation']> = [
  'FIFO',
  'Weighted Average',
  'LIFO',
];

const GST_RATES = [0, 5, 12, 18, 28];

export default function BusinessConfigurationPage() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'type' | 'inventory' | 'tax' | 'documents'>('type');

  const { data: config, isLoading } = useQuery({
    queryKey: ['business-config'],
    queryFn: () => businessConfigApi.get(),
  });

  const [form, setForm] = useState<BusinessConfig | null>(null);

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (updated: BusinessConfig) => businessConfigApi.update(updated),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['business-config'] });
      setForm(saved);
      if (user) {
        updateUser({ ...user, businessType: saved.businessType });
      }
      toast.success('Business configuration updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save configuration');
    },
  });

  if (isLoading || !form) {
    return <Spinner className="py-20" />;
  }

  const updateField = <K extends keyof BusinessConfig>(key: K, value: BusinessConfig[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form) return;
    saveMutation.mutate(form);
  };

  const handleReset = () => {
    if (config) {
      setForm(config);
      toast('Form reset to saved settings', { icon: '🔄' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <PageHeader
        title="Business Configuration"
        subtitle="Manage business operation modes, accounting policies, taxation rules & document numbering"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={saveMutation.isPending}
              className="btn-secondary flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saveMutation.isPending}
              className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Save size={14} />
              {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        }
      />

      {/* Mode Banner / High Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trading Mode Card */}
        <div
          onClick={() => updateField('businessType', 'TRADING')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative ${
            form.businessType === 'TRADING'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShoppingCart size={20} />
            </div>
            {form.businessType === 'TRADING' && (
              <span className="badge-blue flex items-center gap-1 text-xs font-semibold">
                <CheckCircle2 size={12} /> Active Mode
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Trading & Distribution</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Wholesale, retail, and drop-shipping of ready goods. Hides manufacturing & bill-of-materials modules.
          </p>
        </div>

        {/* Manufacturing Mode Card */}
        <div
          onClick={() => updateField('businessType', 'MANUFACTURING')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative ${
            form.businessType === 'MANUFACTURING'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Factory size={20} />
            </div>
            {form.businessType === 'MANUFACTURING' && (
              <span className="badge-yellow flex items-center gap-1 text-xs font-semibold">
                <CheckCircle2 size={12} /> Active Mode
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Manufacturing & Assembly</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Raw materials intake, WIP stage tracking, production orders, and finished goods conversion.
          </p>
        </div>

        {/* Hybrid Mode Card */}
        <div
          onClick={() => updateField('businessType', 'BOTH')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative ${
            form.businessType === 'BOTH'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
            {form.businessType === 'BOTH' && (
              <span className="badge-purple flex items-center gap-1 text-xs font-semibold">
                <CheckCircle2 size={12} /> Active Mode
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Hybrid (Trading + Mfg)</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Full unified ERP suite with complete manufacturing pipelines, trading goods, and service items.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('type')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'type'
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Briefcase size={16} />
          General & Organization
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Warehouse size={16} />
          Inventory & Warehouse Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tax'
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ShieldCheck size={16} />
          GST & Statutory Compliance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileCheck size={16} />
          Document Prefixes & Sequencing
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        {/* ── TAB 1: General & Organization ── */}
        {activeTab === 'type' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                Company Structure & Fiscal Cycle
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Define your legal entity structure, primary industry, and accounting year.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Business Type / Operational Model" required>
                <select
                  className="input"
                  value={form.businessType}
                  onChange={(e) => updateField('businessType', e.target.value as any)}
                >
                  <option value="TRADING">Trading & Distribution (No Mfg)</option>
                  <option value="MANUFACTURING">Manufacturing & Assembly</option>
                  <option value="BOTH">Hybrid (Trading + Manufacturing)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Selecting TRADING hides the Manufacturing menu group from the sidebar navigation.
                </p>
              </Field>

              <Field label="Company Legal Entity Structure">
                <select
                  className="input"
                  value={form.companyType}
                  onChange={(e) => updateField('companyType', e.target.value)}
                >
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Primary Industry Sector">
                <select
                  className="input"
                  value={form.industrySector}
                  onChange={(e) => updateField('industrySector', e.target.value)}
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Financial Year Cycle">
                <select
                  className="input"
                  value={form.financialYearStart}
                  onChange={(e) => updateField('financialYearStart', e.target.value)}
                >
                  <option value="April">April 1st to March 31st (Standard Indian FY)</option>
                  <option value="January">January 1st to December 31st (Calendar Year)</option>
                </select>
              </Field>

              <Field label="Base Operating Currency">
                <input
                  type="text"
                  className="input font-medium"
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  placeholder="INR (₹)"
                />
              </Field>

              <Field label="Default Payment / Credit Terms (Days)">
                <input
                  type="number"
                  min={0}
                  max={365}
                  className="input font-medium"
                  value={form.defaultPaymentTerms}
                  onChange={(e) => updateField('defaultPaymentTerms', parseInt(e.target.value) || 0)}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Auto-populated on new sales & purchase orders to calculate due dates.
                </p>
              </Field>
            </div>
          </div>
        )}

        {/* ── TAB 2: Inventory & Warehouse Rules ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Warehouse size={18} className="text-indigo-600" />
                Inventory Valuation & Tracking Policies
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Control how stock values are computed, storage locations managed, and negative balances handled.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Inventory Valuation Method" required>
                <select
                  className="input font-medium"
                  value={form.inventoryValuation}
                  onChange={(e) => updateField('inventoryValuation', e.target.value as any)}
                >
                  {INVENTORY_VALUATIONS.map((v) => (
                    <option key={v} value={v}>
                      {v === 'FIFO' ? 'FIFO (First-In, First-Out)' : v === 'Weighted Average' ? 'Weighted Average Costing' : 'LIFO (Last-In, First-Out)'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Determines how COGS and current valuation are derived in Profit & Loss reports.
                </p>
              </Field>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Feature Toggles & Guardrails</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Multi-Warehouse Toggle */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.enableMultiWarehouse}
                    onChange={(e) => updateField('enableMultiWarehouse', e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Multi-Warehouse Management</span>
                    <p className="text-xs text-gray-500 mt-0.5">Enable multiple godowns, regional hubs, and intra-warehouse transfers.</p>
                  </div>
                </label>

                {/* Prevent Negative Stock Toggle */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.preventNegativeStock}
                    onChange={(e) => updateField('preventNegativeStock', e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Prevent Negative Stock</span>
                    <p className="text-xs text-gray-500 mt-0.5">Block creating sales invoices when available physical inventory is insufficient.</p>
                  </div>
                </label>

                {/* Batch Tracking Toggle */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.enableBatchTracking}
                    onChange={(e) => updateField('enableBatchTracking', e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Batch & Expiry Date Tracking</span>
                    <p className="text-xs text-gray-500 mt-0.5">Track manufacturing batches, lot numbers, and expiry alerts.</p>
                  </div>
                </label>

                {/* Serial Number Tracking Toggle */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.enableSerialTracking}
                    onChange={(e) => updateField('enableSerialTracking', e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Individual Serial Number Tracking</span>
                    <p className="text-xs text-gray-500 mt-0.5">Track high-value equipment or warranty items via unique serial keys.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: GST & Statutory Compliance ── */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                GST, E-Way Bill & Compliance Settings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure default GST tax rates, reverse charge, composition scheme, and e-way bill automation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Default GST Rate (%)">
                <select
                  className="input font-medium"
                  value={form.defaultGstRate}
                  onChange={(e) => updateField('defaultGstRate', parseInt(e.target.value) || 18)}
                >
                  {GST_RATES.map((r) => (
                    <option key={r} value={r}>{r}% GST</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Default rate assigned when adding new items or services.</p>
              </Field>

              <Field label="E-Way Bill Threshold Limit (₹)">
                <input
                  type="number"
                  className="input font-medium"
                  value={form.ewayBillThreshold}
                  onChange={(e) => updateField('ewayBillThreshold', parseInt(e.target.value) || 50000)}
                />
                <p className="text-[11px] text-gray-400 mt-1">Invoices exceeding this invoice value will trigger E-Way Bill fields.</p>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.enableEwayBill}
                  onChange={(e) => updateField('enableEwayBill', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">E-Way Bill Management</span>
                  <p className="text-xs text-gray-500 mt-0.5">Enable E-Way Bill Number, Vehicle Number & Transport mode tracking.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.enableEinvoice}
                  onChange={(e) => updateField('enableEinvoice', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">E-Invoicing (IRN & QR Code)</span>
                  <p className="text-xs text-gray-500 mt-0.5">Enable B2B E-Invoice generation fields for GST portal compliance.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.compositionScheme}
                  onChange={(e) => updateField('compositionScheme', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Composition Scheme Dealer</span>
                  <p className="text-xs text-gray-500 mt-0.5">Check if registered under GST composition scheme (Bill of Supply instead of Tax Invoice).</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.enableRcm}
                  onChange={(e) => updateField('enableRcm', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Reverse Charge Mechanism (RCM)</span>
                  <p className="text-xs text-gray-500 mt-0.5">Enable RCM liability tracking on applicable purchases.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ── TAB 4: Document Prefixes & Sequencing ── */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileCheck size={18} className="text-indigo-600" />
                Voucher Prefixes, Auto-Sequencing & Formatting
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Set custom document prefixes and next incremental numbers for auto-generated documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Invoice Sequencing */}
              <div className="card p-4 space-y-3 bg-gray-50 dark:bg-gray-800/40">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Sales Invoice</h3>
                <Field label="Prefix">
                  <input
                    type="text"
                    className="input font-mono"
                    value={form.invoicePrefix}
                    onChange={(e) => updateField('invoicePrefix', e.target.value)}
                    placeholder="INV-"
                  />
                </Field>
                <Field label="Next Number">
                  <input
                    type="number"
                    className="input font-mono"
                    value={form.invoiceNextNumber}
                    onChange={(e) => updateField('invoiceNextNumber', parseInt(e.target.value) || 1)}
                  />
                </Field>
                <div className="text-xs text-gray-500">
                  Preview: <span className="font-mono font-semibold text-indigo-600">{form.invoicePrefix}{form.invoiceNextNumber}</span>
                </div>
              </div>

              {/* Purchase Order Sequencing */}
              <div className="card p-4 space-y-3 bg-gray-50 dark:bg-gray-800/40">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Purchase Order</h3>
                <Field label="Prefix">
                  <input
                    type="text"
                    className="input font-mono"
                    value={form.poPrefix}
                    onChange={(e) => updateField('poPrefix', e.target.value)}
                    placeholder="PO-"
                  />
                </Field>
                <Field label="Next Number">
                  <input
                    type="number"
                    className="input font-mono"
                    value={form.poNextNumber}
                    onChange={(e) => updateField('poNextNumber', parseInt(e.target.value) || 1)}
                  />
                </Field>
                <div className="text-xs text-gray-500">
                  Preview: <span className="font-mono font-semibold text-indigo-600">{form.poPrefix}{form.poNextNumber}</span>
                </div>
              </div>

              {/* Quotation Sequencing */}
              <div className="card p-4 space-y-3 bg-gray-50 dark:bg-gray-800/40">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Quotation / Estimate</h3>
                <Field label="Prefix">
                  <input
                    type="text"
                    className="input font-mono"
                    value={form.quotationPrefix}
                    onChange={(e) => updateField('quotationPrefix', e.target.value)}
                    placeholder="QT-"
                  />
                </Field>
                <Field label="Next Number">
                  <input
                    type="number"
                    className="input font-mono"
                    value={form.quotationNextNumber}
                    onChange={(e) => updateField('quotationNextNumber', parseInt(e.target.value) || 1)}
                  />
                </Field>
                <div className="text-xs text-gray-500">
                  Preview: <span className="font-mono font-semibold text-indigo-600">{form.quotationPrefix}{form.quotationNextNumber}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.enableLineDiscounts}
                  onChange={(e) => updateField('enableLineDiscounts', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Line-Item Discounts</span>
                  <p className="text-xs text-gray-500 mt-0.5">Allow separate discount percentages or fixed amounts per line item.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={form.autoRoundOff}
                  onChange={(e) => updateField('autoRoundOff', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Automatic Round-Off</span>
                  <p className="text-xs text-gray-500 mt-0.5">Automatically calculate rounding difference to the nearest whole rupee on invoices.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-indigo-500 flex-shrink-0" />
            <span>Changes take effect immediately across newly created transactions and navigation.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saveMutation.isPending}
              className="btn-secondary text-sm"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Save size={16} />
              {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
