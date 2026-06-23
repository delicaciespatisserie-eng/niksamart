import axios from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });
api.interceptors.request.use((config) => { config.headers['X-Requested-With'] = 'XMLHttpRequest'; const token = store.getState().auth.token; if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((r) => r, async (error) => { const original = error.config; if (error.response?.status === 401 && !original._retry) { original._retry = true; try { const { data } = await api.post('/auth/refresh-token'); store.dispatch(setCredentials({ user: store.getState().auth.user, accessToken: data.accessToken })); original.headers.Authorization = `Bearer ${data.accessToken}`; return api(original); } catch (refreshError) { store.dispatch(logout()); window.location.href = '/login'; } } return Promise.reject(error); });
export default api;
