import ProductGrid from '../../components/product/ProductGrid';
import { useGetWishlistQuery } from '../../store/api/orderApi';
export default function Wishlist(){const{data,isLoading}=useGetWishlistQuery();return <main className="mx-auto max-w-7xl px-4 py-10"><h1 className="font-heading text-5xl text-navy">Wishlist</h1><div className="mt-6"><ProductGrid products={data?.wishlist?.products||[]} isLoading={isLoading}/></div></main>}
