import { createSlice } from '@reduxjs/toolkit';
const token = localStorage.getItem('niksa_token');
const user = JSON.parse(localStorage.getItem('niksa_user') || 'null');
const slice = createSlice({ name: 'auth', initialState: { user, token, isAuthenticated: Boolean(token), loading: false }, reducers: { setCredentials: (s, a) => { s.user = a.payload.user; s.token = a.payload.accessToken; s.isAuthenticated = true; localStorage.setItem('niksa_token', a.payload.accessToken); localStorage.setItem('niksa_user', JSON.stringify(a.payload.user)); }, logout: (s) => { s.user = null; s.token = null; s.isAuthenticated = false; localStorage.removeItem('niksa_token'); localStorage.removeItem('niksa_user'); }, setLoading: (s, a) => { s.loading = a.payload; } } });
export const { setCredentials, logout, setLoading } = slice.actions;
export default slice.reducer;
