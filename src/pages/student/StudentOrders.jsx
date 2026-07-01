import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdSearch, MdPrint } from 'react-icons/md';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../../components/ui/Button';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    orderService.getStudentOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchesTab =
      tab === 'all' ? true :
      tab === 'active' ? !['completed', 'cancelled'].includes(o.status) :
      o.status === tab;
    const matchesSearch = !search ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.shop?.shopName?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <StudentLayout>
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
          <Link to="/upload"><Button size="sm">+ New Order</Button></Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or shop..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-[80px] py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <OrderCardSkeleton key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 sm:p-12 text-center">
            <MdPrint className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/orders/${order._id}`}>
                  <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{order.orderId}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-semibold text-gray-800 truncate text-sm">{order.file?.fileName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{order.shop?.shopName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-blue-700 text-sm">{formatCurrency(order.pricing?.grandTotal)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.printSettings?.copies} cop{order.printSettings?.copies > 1 ? 'ies' : 'y'}
                        </p>
                        {(order.status === 'waiting_otp' || order.status === 'otp_verified') && (
                          <p className="text-xs font-mono font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-0.5 rounded-lg">
                            OTP: {order.otp}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
