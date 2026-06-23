import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({ name: 'wishlist', initialState: { items: [], count: 0 }, reducers: { setWishlist: (s, a) => { s.items = a.payload || []; s.count = s.items.length; }, toggleItem: (s, a) => { const exists = s.items.findIndex(i => (i._id || i) === (a.payload._id || a.payload)); if (exists > -1) s.items.splice(exists, 1); else s.items.push(a.payload); s.count = s.items.length; } } });
export const { setWishlist, toggleItem } = slice.actions;
export default slice.reducer;
