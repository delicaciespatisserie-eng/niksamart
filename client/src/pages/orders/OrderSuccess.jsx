import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { FiDownload, FiTruck, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/axios';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  
  // Basic mock checkmark animation data (Ideally import a real lottie JSON file)
  // Using a fallback UI if lottie is skipped for simplicity
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Here we assume the ID passed is the mongo _id, need to find the orderNumber
        // Let's call a generic /my-orders and find it, or use a new endpoint if needed.
        // Assuming we update the backend to allow fetching by _id or we just fetch user orders and filter
        const { data } = await api.get('/orders/my-orders');
        const currentOrder = data.orders.find(o => o._id === id);
        if (currentOrder) setOrder(currentOrder);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrder();
    window.scrollTo(0,0);
  }, [id]);

  if (!order) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
        
        {/* Decorative Top */}
        <div className="absolute top-0 left-0 w-full h-3 gradient-navy"></div>
        
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={48} />
        </div>

        <h1 className="text-4xl font-display font-bold text-navy mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 text-lg">Thank you for your purchase. We've sent a confirmation email.</p>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8 inline-block w-full max-w-md">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Number</p>
          <p className="text-2xl font-bold text-gray-800 mb-4 tracking-widest">{order.orderNumber}</p>
          
          <div className="w-full h-px bg-gray-200 my-4"></div>
          
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Estimated Delivery</p>
          <p className="text-lg font-bold text-navy">Within 3-5 Business Days</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={`/orders/${order.orderNumber}`} className="w-full sm:w-auto gradient-navy text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <FiTruck /> Track Order
          </Link>
          <Link to="/products" className="w-full sm:w-auto bg-white border-2 border-navy text-navy px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-navy/5 transition-all">
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default OrderSuccess;
