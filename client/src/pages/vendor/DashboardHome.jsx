import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { FiTrendingUp, FiShoppingBag, FiPackage, FiStar, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/axios';

const mockChartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 7490 },
];

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/vendor/dashboard');
        setStats(data.dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-200 rounded-2xl"></div><div className="h-96 bg-gray-200 rounded-2xl"></div></div>;

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.stats?.totalEarnings?.toLocaleString() || 0}`, icon: <FiTrendingUp />, color: 'bg-green-100 text-green-600' },
    { title: 'Orders Today', value: stats?.recentOrders?.length || 0, icon: <FiShoppingBag />, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Products', value: stats?.stats?.totalProducts || 0, icon: <FiPackage />, color: 'bg-purple-100 text-purple-600' },
    { title: 'Average Rating', value: `${stats?.stats?.rating || 0}/5`, icon: <FiStar />, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-8">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-6">Revenue (Last 7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#000080" strokeWidth={4} dot={{r: 4, fill: '#C8A84B', strokeWidth: 2}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy">Low Stock Alerts</h2>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Action Required</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {/* Mock Data for Low Stock */}
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                  <FiAlertCircle />
                </div>
                <div className="flex-1 truncate">
                  <h4 className="text-sm font-bold text-gray-800 truncate">Premium A2 Ghee</h4>
                  <p className="text-xs text-red-500 font-semibold mt-0.5">Only 2 left in stock</p>
                </div>
                <button className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-navy hover:text-navy transition-colors shrink-0">
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Recent Orders</h2>
          <button className="text-sm font-bold text-navy hover:text-gold transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {stats?.recentOrders?.slice(0, 5).map(order => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-mono font-medium text-navy">{order.orderNumber}</td>
                  <td className="p-4 text-gray-800 font-medium">{order.customerId?.name || 'Customer'}</td>
                  <td className="p-4 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
