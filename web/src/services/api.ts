import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials: any) => api.post('/auth/login', credentials);

// Internal
export const getModels = () => api.get('/internal/models');
export const getModelSchema = (modelName: string) => api.get(`/internal/models/${modelName}`);
export const publishModel = (modelDefinition: any) => api.post('/internal/models/publish', modelDefinition);

// Dynamic CRUD
export const getRecords = (modelName: string) => api.get(`/c/${modelName}`);
export const getRecordById = (modelName: string, id: string) => api.get(`/c/${modelName}/${id}`);
export const createRecord = (modelName: string, data: any) => api.post(`/c/${modelName}`, data);
export const updateRecord = (modelName: string, id: string, data: any) => api.put(`/c/${modelName}/${id}`, data);
export const deleteRecord = (modelName: string, id: string) => api.delete(`/c/${modelName}/${id}`);
