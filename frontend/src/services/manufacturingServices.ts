import api from './api';

export const billOfMaterialApi = {
  list: (params?: any) => api.get('/manufacturing/boms', { params }).then((r) => r.data),
  create: (data: any) => api.post('/manufacturing/boms', data).then((r) => r.data),
  activate: (id: number) => api.post(`/manufacturing/boms/${id}/activate`).then((r) => r.data),
};

export const routingApi = {
  list: (params?: any) => api.get('/manufacturing/routings', { params }).then((r) => r.data),
  create: (data: any) => api.post('/manufacturing/routings', data).then((r) => r.data),
  activate: (id: number) => api.post(`/manufacturing/routings/${id}/activate`).then((r) => r.data),
};

export const workCenterApi = {
  list: (params?: any) => api.get('/manufacturing/work-centers', { params }).then((r) => r.data),
  create: (data: any) => api.post('/manufacturing/work-centers', data).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/manufacturing/work-centers/${id}`, data).then((r) => r.data),
};

export const productionOrderApi = {
  list: (params?: any) => api.get('/manufacturing/production-orders', { params }).then((r) => r.data),
  create: (data: any) => api.post('/manufacturing/production-orders', data).then((r) => r.data),
  release: (id: number) => api.post(`/manufacturing/production-orders/${id}/release`).then((r) => r.data),
};

export const manufacturingPlanningApi = {
  checkAvailability: (params?: any) => api.get('/manufacturing/planning/check-availability', { params }).then((r) => r.data),
  calculateCost: (params?: any) => api.post('/manufacturing/planning/calculate-cost', params).then((r) => r.data),
};

export const productionExecutionApi = {
  startExecution: (orderId: number) => api.post(`/manufacturing/production-orders/${orderId}/start`).then((r) => r.data),
  postMaterialIssue: (executionId: number, materialId: number, warehouseId: number, quantity: number) => 
    api.post(`/manufacturing/executions/${executionId}/materials`, { materialId, warehouseId, quantity }).then((r) => r.data),
  postProductionOutput: (executionId: number, quantity: number) => 
    api.post(`/manufacturing/executions/${executionId}/output`, { quantity }).then((r) => r.data),
};
