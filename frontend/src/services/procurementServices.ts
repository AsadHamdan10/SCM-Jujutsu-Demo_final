import api from './api';

export const purchaseRequisitionApi = {
  list: (params?: any) => api.get('/procurement/requisitions', { params }).then((r) => r.data),
  create: (data: any) => api.post('/procurement/requisitions', data).then((r) => r.data),
  approve: (id: number) => api.post(`/procurement/requisitions/${id}/approve`).then((r) => r.data),
};

export const purchaseQuotationApi = {
  list: (params?: any) => api.get('/procurement/quotations', { params }).then((r) => r.data),
  create: (data: any) => api.post('/procurement/quotations', data).then((r) => r.data),
  approve: (id: number) => api.post(`/procurement/quotations/${id}/approve`).then((r) => r.data),
};

export const purchaseOrderApi = {
  list: (params?: any) => api.get('/procurement/orders', { params }).then((r) => r.data),
  create: (data: any) => api.post('/procurement/orders', data).then((r) => r.data),
  approve: (id: number) => api.post(`/procurement/orders/${id}/approve`).then((r) => r.data),
};

export const goodsReceiptApi = {
  list: (params?: any) => api.get('/procurement/receipts', { params }).then((r) => r.data),
  create: (data: any) => api.post('/procurement/receipts', data).then((r) => r.data),
  post: (id: number) => api.post(`/procurement/receipts/${id}/post`).then((r) => r.data),
};

export const purchaseInvoiceApi = {
  createFromGRN: (data: any) => api.post('/procurement/invoices/from-grn', data).then((r) => r.data),
};
