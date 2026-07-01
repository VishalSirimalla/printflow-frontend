import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdListAlt, MdCheckCircle, MdPending, MdToday } from 'react-icons/md';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAdminStats()
      .then(({ data }) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: MdToday, color: 'text-blue-700 bg-blue-50' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: MdPending, color: 'text-orange-600 bg-orange-50' },
    { label: 'Completed', value: stats?.completedOrders || 0, icon: MdCheckCircle, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl w-full">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage incoming print orders from students.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {loading
            ? [1,2,3].map(i => <CardSkeleton key={i} />)
            : statCards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))
          }
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-blue-700 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
          ) : recentOrders.length === 0 ? (
            <Card className="p-10 sm:p-12 text-center">
              <MdListAlt className="text-5xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No orders yet. Students will send orders to your shop.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link key={order._id} to={`/admin/orders/${order._id}`}>
                  <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{order.orderId}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{order.student?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.student?.college} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <p className="font-bold text-blue-700 text-sm shrink-0">
                        {formatCurrency(order.pricing?.grandTotal)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
