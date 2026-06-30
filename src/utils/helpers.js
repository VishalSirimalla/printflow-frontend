// Format file size to human readable
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Calculate print pricing using shop's dynamic pricing object
export const calculatePrice = (settings, shop, totalPages) => {
  if (!shop || !totalPages) return { pricePerPage: 0, subtotal: 0, serviceFee: 0.5, grandTotal: 0.5 };
  const { color, printSide, paperSize, copies = 1, binding = 'none', lamination = 'none' } = settings;
  const p = shop.pricing || {};

  let pricePerPage = color === 'color' ? (p.colorPrice || 5) : (p.blackWhitePrice || 1.5);
  if (paperSize === 'A3')    pricePerPage += (p.a3Price    || 10);
  if (paperSize === 'Legal') pricePerPage += (p.legalPrice || 8);

  const effectivePages = printSide === 'double' ? Math.ceil(totalPages / 2) : totalPages;
  const duplexCharge   = printSide === 'double' ? (p.duplexCharge || 0) * effectivePages : 0;

  let bindingCharge = 0;
  if (binding === 'spiral') bindingCharge = p.spiralBindingCharge || 30;
  if (binding === 'hard')   bindingCharge = p.hardBindingCharge   || 80;

  let laminationCharge = 0;
  if (lamination === 'single')   laminationCharge = p.singlePageLamination || 15;
  if (lamination === 'document') laminationCharge = p.documentLamination   || 50;

  const raw        = (pricePerPage * effectivePages * copies) + duplexCharge + bindingCharge + laminationCharge;
  const subtotal   = parseFloat(Math.max(raw, p.minimumOrderCharge || 0).toFixed(2));
  const serviceFee = 0.5;

  return {
    pricePerPage,
    effectivePages,
    duplexCharge: +duplexCharge.toFixed(2),
    bindingCharge,
    laminationCharge,
    subtotal,
    serviceFee,
    grandTotal: +(subtotal + serviceFee).toFixed(2),
  };
};

// Format currency
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

// Format date
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Get status badge color classes
export const getStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    waiting_otp: 'bg-orange-100 text-orange-800',
    otp_verified: 'bg-blue-100 text-blue-800',
    printing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

// Format status label
export const formatStatus = (status) => {
  const map = {
    pending: 'Pending',
    waiting_otp: 'Waiting for OTP',
    otp_verified: 'OTP Verified',
    printing: 'Printing',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

// Extract error message from axios error
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
