// Format file size to human readable
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Calculate print bill — mirrors backend utils/calculateBill.js exactly
export const calculateBill = (settings, shop, totalPages) => {
  if (!shop || !totalPages) {
    return { totalPrintablePages: 0, effectivePages: 0, copies: 1, pricePerPage: 0, printingCost: 0, duplexCost: 0, bindingCost: 0, laminationCost: 0, minimumAdjustment: 0, grandTotal: 0 };
  }
  const { color = 'bw', printSide = 'single', paperSize = 'A4', copies = 1, binding = 'none', lamination = 'none' } = settings;
  const p = shop.pricing || {};

  let pricePerPage = color === 'color' ? (p.colorPrice ?? 5) : (p.blackWhitePrice ?? 1.5);
  if (paperSize === 'A3')    pricePerPage += (p.a3Price    ?? 10);
  if (paperSize === 'Legal') pricePerPage += (p.legalPrice ?? 8);

  const effectivePages = printSide === 'double' ? Math.ceil(totalPages / 2) : totalPages;
  const duplexCost     = printSide === 'double' ? +((p.duplexCharge ?? 0) * effectivePages).toFixed(2) : 0;
  const printingCost   = +(pricePerPage * effectivePages * copies).toFixed(2);

  let bindingCost = 0;
  if (binding === 'spiral') bindingCost = p.spiralBindingCharge ?? 30;
  if (binding === 'hard')   bindingCost = p.hardBindingCharge   ?? 80;

  let laminationCost = 0;
  if (lamination === 'single')   laminationCost = p.singlePageLamination ?? 15;
  if (lamination === 'document') laminationCost = p.documentLamination   ?? 50;

  const minimum   = p.minimumOrderCharge ?? 0;
  const rawTotal  = printingCost + duplexCost + bindingCost + laminationCost;
  const minAdjust = rawTotal < minimum ? +(minimum - rawTotal).toFixed(2) : 0;

  return {
    totalPrintablePages: effectivePages * copies,
    effectivePages,
    copies,
    pricePerPage: +pricePerPage.toFixed(2),
    printingCost,
    duplexCost,
    bindingCost,
    laminationCost,
    minimumAdjustment: minAdjust,
    grandTotal: +(rawTotal + minAdjust).toFixed(2),
  };
};

// Legacy alias — kept so nothing else breaks
export const calculatePrice = calculateBill;

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
