import { useMemo } from 'react';
import { useGetCartQuery } from '../store/api/orderApi';
export const useCart = () => { const { data, isLoading } = useGetCartQuery(); const items = data?.cart?.items || []; return useMemo(() => ({ items, isLoading, itemCount: items.reduce((n, i) => n + Number(i.qty || 0), 0), total: items.reduce((n, i) => n + Number(i.price || i.productId?.salePrice || 0) * Number(i.qty || 0), 0) }), [items, isLoading]); };
export default useCart;
