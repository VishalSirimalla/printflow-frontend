import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdCloudUpload, MdDescription, MdClose, MdAdd, MdRemove, MdPrint, MdLocationOn, MdStar } from 'react-icons/md';
import StudentLayout from '../../layouts/StudentLayout';
import Stepper from '../../components/ui/Stepper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { orderService } from '../../services/orderService';
import { calculateBill, formatCurrency, formatFileSize, getErrorMessage } from '../../utils/helpers';
import BillSummary from '../../components/ui/BillSummary';

const STEPS = ['Upload', 'Configure', 'Checkout'];

const defaultSettings = {
  color: 'bw',
  printSide: 'single',
  orientation: 'portrait',
  paperSize: 'A4',
  pageRange: 'all',
  copies: 1,
  binding: 'none',
  lamination: 'none',
  additionalNotes: '',
};

export default function UploadPage() {
  const [step, setStep]                   = useState(1);
  const [file, setFile]                   = useState(null);
  const [totalPages, setTotalPages]       = useState(1);
  const [settings, setSettings]           = useState(defaultSettings);
  const [shops, setShops]                 = useState([]);
  const [selectedShop, setSelectedShop]   = useState(null);
  const [loadingShops, setLoadingShops]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const navigate  = useNavigate();
  const location   = useLocation();
  const preSelectedId = location.state?.preSelectedShopId;

  useEffect(() => {
    if (step === 2 || step === 3) {
      setLoadingShops(true);
      orderService.getPrintShops()
        .then(({ data }) => {
          setShops(data.shops);
          // Auto-select if navigated from Print Shops page
          if (preSelectedId) {
            const match = data.shops.find(s => s._id === preSelectedId);
            if (match) setSelectedShop(match);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingShops(false));
    }
  }, [step]);

  // Recalculate whenever shop, settings, or page count changes
  const bill = calculateBill(settings, selectedShop, totalPages);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    if (!allowed.includes(f.type)) return toast.error('Only PDF, PNG, JPG files allowed');
    if (f.size > 20 * 1024 * 1024) return toast.error('File must be under 20MB');
    setFile(f);
    setTotalPages(1);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSubmit = async () => {
    if (!file || !selectedShop) return toast.error('Please select file and shop');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('shopId', selectedShop._id);
      formData.append('totalPages', totalPages);
      formData.append('printSettings', JSON.stringify(settings));
      const { data } = await orderService.createOrder(formData);
      toast.success('Order placed! Save your OTP.');
      navigate(`/orders/${data.order._id}`, { state: { otp: data.otp, justCreated: true } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        <Stepper steps={STEPS} currentStep={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Upload ──────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Document</h2>

              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('file-input').click()}
                  className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors cursor-pointer
                    ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                >
                  <MdCloudUpload className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-400">PDF, PNG, JPG, JPEG • Max 20MB</p>
                  <input id="file-input" type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <MdDescription className="text-blue-700 text-3xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Total Pages</label>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setTotalPages(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"><MdRemove /></button>
                          <input type="number" value={totalPages} onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setTotalPages(p => p + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"><MdAdd /></button>
                          <span className="text-xs text-gray-400">Enter actual page count</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><MdClose /></button>
                  </div>
                </Card>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!file} size="lg">Continue to Configure →</Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Configure ───────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Configure Print Settings</h2>

                <Card className="p-6 space-y-5">
                  <SettingRow label="Color">
                    <ToggleGroup options={[{ value: 'bw', label: 'Black & White' }, { value: 'color', label: 'Color' }]} value={settings.color} onChange={v => set('color', v)} />
                  </SettingRow>
                  <SettingRow label="Print Side">
                    <ToggleGroup options={[{ value: 'single', label: 'Single Side' }, { value: 'double', label: 'Double Side' }]} value={settings.printSide} onChange={v => set('printSide', v)} />
                  </SettingRow>
                  <SettingRow label="Orientation">
                    <ToggleGroup options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} value={settings.orientation} onChange={v => set('orientation', v)} />
                  </SettingRow>
                  <SettingRow label="Paper Size">
                    <ToggleGroup options={[{ value: 'A4', label: 'A4' }, { value: 'A3', label: 'A3' }, { value: 'Legal', label: 'Legal' }]} value={settings.paperSize} onChange={v => set('paperSize', v)} />
                  </SettingRow>
                  <SettingRow label="Binding">
                    <ToggleGroup options={[{ value: 'none', label: 'None' }, { value: 'spiral', label: 'Spiral' }, { value: 'hard', label: 'Hard' }]} value={settings.binding} onChange={v => set('binding', v)} />
                  </SettingRow>
                  <SettingRow label="Lamination">
                    <ToggleGroup options={[{ value: 'none', label: 'None' }, { value: 'single', label: 'Single Page' }, { value: 'document', label: 'Document' }]} value={settings.lamination} onChange={v => set('lamination', v)} />
                  </SettingRow>
                  <SettingRow label="Pages">
                    <div className="flex gap-3 items-center">
                      <ToggleGroup
                        options={[{ value: 'all', label: 'All Pages' }, { value: 'custom', label: 'Custom' }]}
                        value={settings.pageRange === 'all' ? 'all' : 'custom'}
                        onChange={v => set('pageRange', v === 'all' ? 'all' : '')}
                      />
                      {settings.pageRange !== 'all' && (
                        <input placeholder="e.g. 1-5, 8" value={settings.pageRange} onChange={e => set('pageRange', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" />
                      )}
                    </div>
                  </SettingRow>
                  <SettingRow label="Copies">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => set('copies', Math.max(1, settings.copies - 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"><MdRemove /></button>
                      <span className="w-8 text-center font-semibold text-gray-900">{settings.copies}</span>
                      <button type="button" onClick={() => set('copies', settings.copies + 1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"><MdAdd /></button>
                    </div>
                  </SettingRow>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Additional Notes</label>
                    <textarea value={settings.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder="Any special instructions..." rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </Card>

                {/* Select Shop */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Print Shop</h3>
                  {loadingShops ? <p className="text-sm text-gray-400">Loading shops...</p> : shops.length === 0 ? (
                    <Card className="p-6 text-center text-gray-400">No print shops available</Card>
                  ) : (
                    <div className="space-y-3">
                      {shops.map(shop => (
                        <div key={shop._id} onClick={() => setSelectedShop(shop)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-colors
                            ${selectedShop?._id === shop._id ? 'border-blue-700 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-300'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <MdPrint className="text-blue-700" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{shop.shopName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <MdLocationOn className="text-base" />{shop.shopAddress}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <MdStar className="text-yellow-400 text-sm" />
                                <span className="text-sm font-medium">{shop.rating}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                ₹{shop.pricing?.blackWhitePrice ?? '—'}/page B&W
                              </p>
                              <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                ${shop.isOpen && !shop.holidayMode ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen && !shop.holidayMode ? 'bg-green-500' : 'bg-red-500'}`} />
                                {shop.holidayMode ? 'Holiday' : shop.isOpen ? 'Open' : 'Closed'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill Summary Sidebar — Step 2 */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {!selectedShop ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                      <p className="text-sm text-gray-400 text-center">Select a shop to see pricing</p>
                    </div>
                  ) : (
                    <BillSummary
                      bill={bill}
                      settings={settings}
                      totalPages={totalPages}
                      shopName={selectedShop.shopName}
                      compact
                    />
                  )}
                </div>
              </div>

              <div className="col-span-1 lg:col-span-3 flex justify-between mt-2">
                <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedShop} size="lg">Continue to Checkout →</Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Checkout ────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>

                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <MdDescription className="text-gray-400 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{file?.name}</p>
                        <button onClick={() => setStep(1)} className="text-xs text-blue-700 hover:underline">Change File</button>
                      </div>
                      <p className="text-sm text-gray-500">{totalPages} Pages • {formatFileSize(file?.size)}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {[
                          settings.color === 'bw' ? 'B&W' : 'Color',
                          settings.printSide === 'double' ? 'Double-sided' : 'Single-sided',
                          settings.paperSize,
                          `${settings.copies} Copies`,
                          settings.binding !== 'none' && `${settings.binding} binding`,
                          settings.lamination !== 'none' && 'Lamination',
                        ].filter(Boolean).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                    <button onClick={() => setStep(2)} className="text-xs text-blue-700 hover:underline">Edit Shop</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <MdPrint className="text-blue-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedShop?.shopName}</p>
                      <p className="text-sm text-gray-500">{selectedShop?.shopAddress}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                  <div className="flex items-center gap-3 p-3 border-2 border-blue-700 rounded-xl bg-blue-50">
                    <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
                      <MdPrint className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Pay at Shop</p>
                      <p className="text-xs text-gray-500">Pay upon collection via cash or card</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-blue-700 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-700" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bill Summary — Step 3 */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <BillSummary
                    bill={bill}
                    settings={settings}
                    totalPages={totalPages}
                    shopName={selectedShop?.shopName}
                  />
                  <Card className="p-5">
                    <Button fullWidth size="lg" loading={submitting} onClick={handleSubmit}>
                      Submit Order
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-3">
                      By clicking submit, you agree to our{' '}
                      <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span>
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-3">🔒 Secure checkout powered by PrintFlow</p>
                  </Card>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-3 flex justify-start mt-2">
                <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudentLayout>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
      <span className="text-sm font-medium text-gray-700 shrink-0 sm:w-28">{label}</span>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${value === opt.value ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
