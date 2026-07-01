import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdUploadFile, MdPrint, MdCheckCircle, MdPending } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getStudentOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completed = orders.filter(o => o.status === 'completed');

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: MdPrint, color: 'text-blue-700 bg-blue-50' },
    { label: 'Active Orders', value: active.length, icon: MdPending, color: 'text-orange-600 bg-orange-50' },
    { label: 'Completed', value: completed.length, icon: MdCheckCircle, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <StudentLayout>
      <div className="max-w-4xl w-full">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your print orders from here.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
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
          ))}
        </div>

        {/* Quick Action */}
        <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-r from-blue-700 to-blue-600 border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg">Ready to print something?</h2>
              <p className="text-blue-200 text-sm mt-1">Upload your document and send it to a nearby print shop.</p>
            </div>
            <Link to="/upload" className="shrink-0">
              <Button variant="ghost" className="bg-white text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
                <MdUploadFile /> New Order
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-blue-700 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <OrderCardSkeleton key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-10 sm:p-12 text-center">
              <MdPrint className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders yet. Upload a document to get started!</p>
              <Link to="/upload" className="mt-4 inline-block">
                <Button>Create First Order</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <motion.div key={order._id} whileHover={{ y: -1 }}>
                  <Link to={`/orders/${order._id}`}>
                    <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-400">{order.orderId}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="font-medium text-gray-800 truncate text-sm">{order.file.fileName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {order.shop?.shopName} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-blue-700 text-sm">{formatCurrency(order.pricing.grandTotal)}</p>
                          {order.status === 'waiting_otp' && (
                            <p className="text-xs text-orange-600 mt-1 font-mono font-bold">OTP: {order.otp}</p>
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
      </div>
    </StudentLayout>
  );
}
