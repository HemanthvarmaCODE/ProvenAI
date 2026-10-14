import axios from 'axios';
import { AuthResponse, LoginForm, RegisterForm, DashboardStats, MetricsData, EmbedResponse, VerificationResult, AttackResult, User, Image } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints - backend uses OAuth2PasswordRequestForm for login (form data)
export const login = (data: LoginForm) => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);
  return client.post<AuthResponse>('/api/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const register = (data: RegisterForm) =>
  client.post<AuthResponse>('/api/register', data);

export const getProfile = () => client.get<User>('/api/profile');

export const updateProfile = (data: Partial<User>) =>
  client.put('/api/profile', data);

// Image endpoints
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/api/upload', formData);
};

export const embedWatermark = (formData: FormData) =>
  client.post<EmbedResponse>('/api/embed', formData);

export const verifyImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post<VerificationResult>('/api/verify', formData);
};

// Attack endpoints
export const attackImage = (imageId: number, attackType: string, params?: Record<string, unknown>) =>
  client.post<AttackResult>('/api/attack', {
    image_id: imageId,
    attack_type: attackType,
    attack_params: params || {},
  });

// Dashboard & stats
export const getHistory = () => client.get('/api/history');
export const getDashboard = () => client.get<DashboardStats>('/api/dashboard');
export const getStatistics = () => client.get<MetricsData>('/api/statistics');
export const getAdminDashboard = () => client.get('/api/admin/dashboard');

// File downloads
export const downloadImage = (filename: string) =>
  client.get(`/api/download/${filename}`, { responseType: 'blob' });

export const triggerDownload = async (filename: string) => {
  const safeFilename = filename.replace(/\\/g, '/').split('/').pop() || 'watermarked_image.png';
  const res = await downloadImage(safeFilename);
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getImageUrl = (path: string) => {
  if (!path) return '';
  const normalized = path.replace(/\\/g, '/');
  const filename = normalized.split('/').pop();
  if (normalized.includes('/watermarked/')) {
    return `${API_URL}/static/watermarked/${filename}`;
  }
  if (normalized.includes('/attacked/')) {
    return `${API_URL}/static/attacked/${filename}`;
  }
  if (normalized.includes('/uploads/')) {
    return `${API_URL}/static/uploads/${filename}`;
  }
  return path;
};

export default client;
