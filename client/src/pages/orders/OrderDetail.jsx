import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiBox, FiCheckCircle, FiTruck, FiHome, FiXCircle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderNumber}`);
        setOrder(data.order);
      } catch (err) {
        toast.error("Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/orders/${order._id}/cancel`);
      toast.success("Order Cancelled successfully");
      // refresh
      const { data } = await api.get(`/orders/${orderNumber}`);
      setOrder(data.order);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  if (loading) return <div className="min-h-screen py-20 text-center">Loading order tracking...</div>;
  if (!order) return <div className="min-h-screen py-20 text-center text-red-500 font-bold">Order not found.</div>;

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: <FiBox /> },
    { key: 'confirmed', label: 'Payment Confirmed', icon: <FiCheckCircle /> },
    { key: 'processing', label: 'Processing', icon: <FiCheckCircle /> },
    { key: 'shipped', label: 'Shipped', icon: <FiTruck /> },
    { key: 'delivered', label: 'Delivered', icon: <FiHome /> },
  ];

  let currentStepIndex = steps.findIndex(s => s.key === order.orderStatus);
  if (currentStepIndex === -1 && order.orderStatus !== 'cancelled') currentStepIndex = 0;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy mb-1">Order Tracking</h1>
            <p className="text-gray-500 font-mono text-sm">#{order.orderNumber}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">
              <FiDownload /> Invoice
            </button>
            {['pending', 'confirmed'].includes(order.orderStatus) && (
              <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors">
                <FiXCircle /> Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Timeline Vertical */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-max">
            <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">Status Timeline</h3>
            
            {order.orderStatus === 'cancelled' ? (
               <div className="flex items-start gap-4 text-red-500">
                 <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0"><FiXCircle /></div>
                 <div>
                   <p className="font-bold">Order Cancelled</p>
                   <p className="text-xs mt-1 opacity-80">Your order has been cancelled and refunded.</p>
                 </div>
               </div>
            ) : (
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                        isCurrent ? 'border-gold text-gold ring-4 ring-gold/20' : 
                        isCompleted ? 'border-navy text-navy' : 'border-gray-200 text-gray-300'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                        <div className={`font-bold ${isCurrent ? 'text-gold' : isCompleted ? 'text-navy' : 'text-gray-400'}`}>{step.label}</div>
                        {isCurrent && <div className="text-xs text-gray-500 mt-1">Updated recently</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 uppercase tracking-wider text-sm">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                    <div className="flex-1">
                      <Link to={`/product/${item.productId}`} className="font-bold text-gray-800 hover:text-navy line-clamp-1">{item.name}</Link>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.qty} | Status: <span className="font-semibold text-gold capitalize">{item.status}</span></p>
                    </div>
                    <div className="font-bold text-navy">₹{item.subtotal.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-sm">Shipping Address</h3>
                 <p className="text-gray-600 text-sm leading-relaxed">
                   {order.shippingAddress.label}<br/>
                   {order.shippingAddress.street}<br/>
                   {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                 </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
                 <h3 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-sm">Payment Summary</h3>
                 <div className="space-y-1 text-sm text-gray-500">
                   <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                   <div className="flex justify-between"><span>Delivery</span><span>₹{order.deliveryCharge}</span></div>
                   <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
                 </div>
                 <div className="flex justify-between font-bold text-navy text-lg pt-3 border-t border-gray-100 mt-3">
                   <span>Total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
