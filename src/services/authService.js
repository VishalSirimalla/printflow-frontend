import api from './api';

export const authService = {
  registerStudent: (data) => api.post('/auth/student/register', data),
  loginStudent:    (data) => api.post('/auth/student/login', data),
  googleStudentLogin: (data) => api.post('/auth/student/google', data),
  registerAdmin:   (data) => api.post('/auth/admin/register', data),
  loginAdmin:      (data) => api.post('/auth/admin/login', data),
  googleAdminLogin: (data) => api.post('/auth/admin/google', data),
  getMe:           ()     => api.get('/auth/me'),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (token, data) => api.post(`/auth/reset-password/${token}`, data),
  updateStudentProfile: (data) => api.put('/auth/student/profile', data),
};
