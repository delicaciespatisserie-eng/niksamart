import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiStar, FiPackage } from 'react-icons/fi';
import api from '../../utils/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(o.orderStatus);
    return o.orderStatus === activeTab;
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-navy mb-8">My Orders</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 custom-scrollbar">
        {['all', 'active', 'delivered', 'cancelled'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
             <FiPackage size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders in this category.</p>
          <Link to="/products" className="bg-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gold/30 transition-all">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="flex gap-6">
                  <div><span className="block text-gray-500 uppercase text-xs font-bold tracking-wider">Order Number</span><span className="font-mono font-bold text-navy">{order.orderNumber}</span></div>
                  <div><span className="block text-gray-500 uppercase text-xs font-bold tracking-wider">Date Placed</span><span className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                  <div><span className="block text-gray-500 uppercase text-xs font-bold tracking-wider">Total Amount</span><span className="font-bold text-navy">₹{order.totalAmount.toLocaleString()}</span></div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200 relative group">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold text-center p-1 leading-tight">
                         {item.qty}x
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  {order.orderStatus === 'delivered' && (
                    <button className="flex items-center gap-2 text-gold font-bold hover:underline px-4 py-2">
                      <FiStar /> Rate Products
                    </button>
                  )}
                  <Link to={`/account/orders/${order.orderNumber}`} className="flex items-center gap-2 bg-navy text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90">
                    <FiEye /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
