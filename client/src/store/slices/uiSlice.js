import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({ name: 'ui', initialState: { sidebarOpen: false, searchOpen: false, toastQueue: [] }, reducers: { toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; }, setSearchOpen: (s, a) => { s.searchOpen = a.payload; }, pushToast: (s, a) => { s.toastQueue.push(a.payload); } } });
export const { toggleSidebar, setSearchOpen, pushToast } = slice.actions;
export default slice.reducer;
