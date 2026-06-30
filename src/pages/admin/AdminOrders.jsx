import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdSearch, MdListAlt } from 'react-icons/md';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'waiting_otp', label: 'Waiting OTP' },
  { key: 'otp_verified', label: 'Verified' },
  { key: 'printing', label: 'Printing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    orderService.getAdminOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchesTab = tab === 'all' || o.status === tab;
    const matchesSearch = !search ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.student?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

        {/* Search */}
        <div className="relative mb-4">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or student name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-colors
                ${tab === t.key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <OrderCardSkeleton key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <MdListAlt className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No orders found</p>
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
                <Link to={`/admin/orders/${order._id}`}>
                  <Card className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{order.orderId}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-semibold text-gray-800">{order.student?.fullName}</p>
                        <p className="text-sm text-gray-500">{order.student?.college}</p>
                        <p className="text-xs text-gray-400 mt-1">{order.file?.fileName} • {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700">{formatCurrency(order.pricing?.grandTotal)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {order.printSettings?.color === 'bw' ? 'B&W' : 'Color'} •{' '}
                          {order.printSettings?.copies} cop{order.printSettings?.copies > 1 ? 'ies' : 'y'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
