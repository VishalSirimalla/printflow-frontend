import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdArrowBack, MdLock, MdShield, MdDescription, MdDownload, MdEmail } from 'react-icons/md';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

const STATUS_ACTIONS = [
  { from: 'otp_verified', to: 'printing', label: 'Accept & Start Printing', variant: 'primary' },
  { from: 'printing', to: 'ready', label: 'Mark Ready for Pickup', variant: 'success' },
  { from: 'ready', to: 'completed', label: 'Mark Completed', variant: 'success' },
];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [updating, setUpdating] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    orderService.getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Enter complete 6-digit OTP');
    setVerifying(true);
    try {
      const { data } = await orderService.verifyOTP(id, otpStr);
      setOrder(data.order);
      toast.success('OTP verified! Document unlocked.');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      const { data } = await orderService.updateStatus(id, status);
      setOrder(data.order);
      toast.success('Order status updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    await handleStatusUpdate('cancelled');
  };

  if (loading) return <AdminLayout><div className="max-w-4xl space-y-4"><CardSkeleton /><CardSkeleton /></div></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-gray-500">Order not found.</p></AdminLayout>;

  const { file, printSettings, pricing, student } = order;
  const nextAction = STATUS_ACTIONS.find(a => a.from === order.status);

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/orders" className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
            <MdArrowBack className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 font-mono">{order.orderId}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Left: Order Info */}
          <div className="col-span-2 space-y-4">
            {/* Student */}
            <Card className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Details</p>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xl font-bold text-gray-900">{student?.fullName}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-500">ID: #{student?._id?.slice(-6).toUpperCase()} • {student?.college}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <MdEmail className="text-blue-500" />
                {student?.email}
              </div>
            </Card>

            {/* Print Specs */}
            <Card className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Print Specifications</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Print Type</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">
                    {printSettings?.color === 'bw' ? 'B&W' : 'Color'} {printSettings?.printSide === 'double' ? 'Double-Sided' : 'Single-Sided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Paper Size</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{printSettings?.paperSize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pages / Copies</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">
                    {file?.totalPages} Pages • {printSettings?.copies} {printSettings?.copies > 1 ? 'Copies' : 'Copy'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Orientation</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{printSettings?.orientation}</p>
                </div>
                {printSettings?.additionalNotes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Notes</p>
                    <p className="text-sm text-gray-700 mt-0.5">{printSettings.additionalNotes}</p>
                  </div>
                )}
              </div>
              <hr className="my-3" />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-bold text-blue-700">{formatCurrency(pricing?.grandTotal)}</span>
              </div>
            </Card>

            {/* Actions */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Card className="p-5 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Actions</p>
                {nextAction && (
                  <Button fullWidth variant={nextAction.variant} loading={updating} onClick={() => handleStatusUpdate(nextAction.to)}>
                    {nextAction.label}
                  </Button>
                )}
                {!['completed', 'cancelled'].includes(order.status) && (
                  <Button fullWidth variant="danger" loading={updating} onClick={handleCancel}>
                    Cancel Order
                  </Button>
                )}
              </Card>
            )}
          </div>

          {/* Right: OTP + Document */}
          <div className="col-span-3 space-y-4">
            {/* OTP Verification */}
            {!order.otpVerified ? (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Security Verification</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the 6-digit verification code provided by the student to unlock the document for printing.
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <MdShield className="text-blue-700 text-xl" />
                  </div>
                </div>

                {/* OTP Input */}
                <div className="flex items-center gap-2 mb-5" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`otp-input ${digit ? 'filled' : ''}`}
                    />
                  ))}
                  <span className="text-gray-300 text-xl mx-1">-</span>
                  {/* Extra styling hint: the dash is decorative; actual split is 3-3 visually */}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleVerify} loading={verifying} size="lg">
                    Verify & Access Files
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }}
                  >
                    Resend Code
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-5 border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <MdShield className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">OTP Verified Successfully</p>
                    <p className="text-sm text-green-600">Document is now unlocked. Verified at {formatDate(order.otpVerifiedAt)}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Document Preview / Locked */}
            <Card className="overflow-hidden">
              {!order.otpVerified ? (
                <div className="relative">
                  {/* Blurred placeholder */}
                  <div className="h-64 bg-gray-100 flex flex-col items-center justify-center gap-3">
                    <div className="filter blur-sm select-none pointer-events-none absolute inset-0 flex flex-col gap-2 p-8">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-3 bg-gray-300 rounded ${i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-full' : 'w-1/2'}`} />
                      ))}
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <MdLock className="text-4xl text-gray-500" />
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Locked Content</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MdDescription className="text-blue-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{file?.fileName}</p>
                        <p className="text-sm text-gray-500">{file?.totalPages} pages</p>
                      </div>
                    </div>
                    <a
                      href={file?.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={file?.fileName}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
                    >
                      <MdDownload /> Download
                    </a>
                  </div>

                  {/* PDF preview or image */}
                  {file?.fileUrl && (
                    file?.fileName?.endsWith('.pdf') ? (
                      <iframe
                        src={file.fileUrl}
                        title="Document Preview"
                        className="w-full h-96 rounded-xl border border-gray-200"
                      />
                    ) : (
                      <img
                        src={file.fileUrl}
                        alt="Document"
                        className="w-full max-h-96 object-contain rounded-xl border border-gray-200"
                      />
                    )
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
