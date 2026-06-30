import api from './api';

export const orderService = {
  createOrder: (formData) =>
    api.post('/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStudentOrders: () => api.get('/orders/student'),
  getAdminOrders:   () => api.get('/orders/admin'),
  getAdminStats:    () => api.get('/orders/admin/stats'),
  getOrderById:     (id) => api.get(`/orders/${id}`),
  verifyOTP:        (id, otp) => api.post(`/orders/${id}/verify-otp`, { otp }),
  updateStatus:     (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getPrintShops:    () => api.get('/orders/shops'),
};

export const shopService = {
  getProfile:    ()       => api.get('/shop/profile'),
  updateProfile: (data)   => api.put('/shop/profile', data),
  updatePricing: (data)   => api.put('/shop/pricing', data),
  getShopPricing:(shopId) => api.get(`/shop/pricing/${shopId}`),
};
