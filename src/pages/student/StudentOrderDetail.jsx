import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdDescription, MdLocationOn, MdEmail } from 'react-icons/md';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function StudentOrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const otp = location.state?.otp || order?.otp;
  const justCreated = location.state?.justCreated;

  useEffect(() => {
    orderService.getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <StudentLayout><div className="max-w-3xl space-y-4"><CardSkeleton /><CardSkeleton /></div></StudentLayout>;
  if (!order) return <StudentLayout><p className="text-gray-500">Order not found.</p></StudentLayout>;

  const { file, printSettings, pricing, shop, student } = order;

  return (
    <StudentLayout>
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/orders" className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center">
            <MdArrowBack className="text-xl" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-mono truncate">{order.orderId}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* OTP Banner */}
        {justCreated && otp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6 mb-5 text-center"
          >
            <p className="text-green-800 font-semibold text-base sm:text-lg mb-1">🎉 Order Placed Successfully!</p>
            <p className="text-green-600 text-xs sm:text-sm mb-4">Show this OTP to the print shop owner to verify your order.</p>
            <div className="bg-white rounded-xl px-6 sm:px-8 py-4 inline-block border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Your OTP</p>
              <p className="text-4xl sm:text-5xl font-bold text-blue-700 font-mono tracking-[0.3em]">{otp}</p>
            </div>
            <p className="text-xs text-green-600 mt-3">Keep this OTP safe. Do not share with anyone else.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Student Details */}
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Details</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{student?.fullName}</p>
            <p className="text-sm text-gray-500 mt-1">{student?.college}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <MdEmail className="text-blue-500 shrink-0" />
              <span className="truncate">{student?.email}</span>
            </div>
          </Card>

          {/* OTP for active orders */}
          {!justCreated && otp && !['completed', 'cancelled'].includes(order.status) && (
            <Card className="p-4 sm:p-5 border-2 border-blue-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your OTP</p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-700 font-mono tracking-widest">{otp}</p>
              <p className="text-xs text-gray-400 mt-2">Show this to the shop owner</p>
            </Card>
          )}

          {/* Print Specifications */}
          <Card className="p-4 sm:p-5 col-span-1 sm:col-span-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Print Specifications</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-400">Print Type</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">
                  {printSettings?.color === 'bw' ? 'B&W' : 'Color'}{' '}
                  {printSettings?.printSide === 'double' ? 'Double-Sided' : 'Single-Sided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Paper Size</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{printSettings?.paperSize}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Pages / Copies</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">
                  {file?.totalPages} Pages • {printSettings?.copies}{' '}
                  {printSettings?.copies > 1 ? 'Copies' : 'Copy'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Orientation</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">
                  {printSettings?.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                </p>
              </div>
              {printSettings?.additionalNotes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700 mt-0.5">{printSettings.additionalNotes}</p>
                </div>
              )}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Amount</span>
              <span className="text-lg sm:text-xl font-bold text-blue-700">{formatCurrency(pricing?.grandTotal)}</span>
            </div>
          </Card>

          {/* Shop */}
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Print Shop</p>
            <p className="font-semibold text-gray-900 text-sm">{shop?.shopName}</p>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MdLocationOn className="shrink-0" /> {shop?.shopAddress}
            </p>
          </Card>

          {/* File */}
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Document</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <MdDescription className="text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{file?.fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{file?.totalPages} pages</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
