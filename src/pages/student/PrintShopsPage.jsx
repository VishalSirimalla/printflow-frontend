import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdLocationOn, MdAccessTime, MdPhone, MdClose, MdSearch,
  MdPrint, MdStar, MdCheckCircle, MdInfo,
} from 'react-icons/md';
import { Printer, Palette, FileText, BookOpen, Layers, X } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { orderService } from '../../services/orderService';

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt12 = (t24) => {
  if (!t24) return '—';
  const [h, m] = t24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmt = (n) => (n !== undefined && n !== null) ? `₹${Number(n).toFixed(2)}` : '—';

const isShopOpen = (shop) => shop.isOpen && !shop.holidayMode;

// ── Price row inside card / modal ─────────────────────────────────────────────
function PriceItem({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${accent ? '' : ''}`}>
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <Icon size={12} className="shrink-0" />
        {label}
      </div>
      <span className={`text-xs font-semibold ${accent ? 'text-blue-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ shop }) {
  const open = isShopOpen(shop);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-500' : 'bg-red-500'}`} />
      {shop.holidayMode ? 'Holiday' : open ? 'Open' : 'Closed'}
    </span>
  );
}

// ── Shop Card ─────────────────────────────────────────────────────────────────
function ShopCard({ shop, index, onSelect, onViewDetails }) {
  const p = shop.pricing || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(37,99,235,0.10)' }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all"
    >
      <div className="p-5 grid grid-cols-[auto_1fr_auto] gap-5">

        {/* ── Left: identity ── */}
        <div className="flex flex-col items-center gap-3 min-w-[80px]">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
            {shop.shopName?.[0]?.toUpperCase()}
          </div>
          <StatusBadge shop={shop} />
        </div>

        {/* ── Centre: info + pricing ── */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{shop.shopName}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-0.5">{shop.ownerName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <MdLocationOn className="text-base text-blue-400 shrink-0" />{shop.shopAddress}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MdAccessTime className="text-sm shrink-0" />
            {fmt12(shop.openingTime)} – {fmt12(shop.closingTime)}
          </p>

          {/* Pricing grid */}
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-x-4 gap-y-0.5">
            <PriceItem icon={Printer}     label="B&W / page"   value={fmt(p.blackWhitePrice)}   accent />
            <PriceItem icon={Palette}     label="Color / page" value={fmt(p.colorPrice)}         accent />
            <PriceItem icon={FileText}    label="A3 / page"    value={fmt(p.a3Price)} />
            <PriceItem icon={FileText}    label="Legal / page" value={fmt(p.legalPrice)} />
            <PriceItem icon={Layers}      label="Duplex extra" value={fmt(p.duplexCharge)} />
            <PriceItem icon={BookOpen}    label="Spiral bind"  value={fmt(p.spiralBindingCharge)} />
            <PriceItem icon={BookOpen}    label="Hard bind"    value={fmt(p.hardBindingCharge)} />
            <PriceItem icon={Palette}     label="Lamination"   value={fmt(p.singlePageLamination)} />
          </div>
        </div>

        {/* ── Right: rating + actions ── */}
        <div className="flex flex-col items-end justify-between gap-3 shrink-0">
          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-0.5">
              <MdStar className="text-yellow-400 text-lg" />
              <span className="text-lg font-bold text-gray-900">{shop.rating?.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-400">124 reviews</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
              <MdAccessTime className="text-sm" /> 10–15 min
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => onViewDetails(shop)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <MdInfo className="text-sm" /> View Details
            </button>
            <Button size="sm" onClick={() => onSelect(shop)}>
              Select Shop
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ShopModal({ shop, onClose, onSelect }) {
  const p = shop.pricing || {};

  const SERVICES = [
    { label: 'Black & White Printing', enabled: true },
    { label: 'Color Printing',         enabled: (p.colorPrice ?? 0) > 0 },
    { label: 'Duplex Printing',        enabled: (p.duplexCharge ?? 0) > 0 },
    { label: 'A3 Printing',            enabled: (p.a3Price ?? 0) > 0 },
    { label: 'Legal Paper',            enabled: (p.legalPrice ?? 0) > 0 },
    { label: 'Spiral Binding',         enabled: (p.spiralBindingCharge ?? 0) > 0 },
    { label: 'Hard Binding',           enabled: (p.hardBindingCharge ?? 0) > 0 },
    { label: 'Lamination',             enabled: (p.singlePageLamination ?? 0) > 0 },
  ];

  const PRICING_TABLE = [
    { label: 'Black & White / page',   value: fmt(p.blackWhitePrice) },
    { label: 'Color / page',           value: fmt(p.colorPrice) },
    { label: 'A3 paper / page',        value: fmt(p.a3Price) },
    { label: 'Legal paper / page',     value: fmt(p.legalPrice) },
    { label: 'Duplex charge / page',   value: fmt(p.duplexCharge) },
    { label: 'Spiral binding',         value: fmt(p.spiralBindingCharge) },
    { label: 'Hard binding',           value: fmt(p.hardBindingCharge) },
    { label: 'Single-page lamination', value: fmt(p.singlePageLamination) },
    { label: 'Document lamination',    value: fmt(p.documentLamination) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-lg font-bold">
              {shop.shopName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{shop.shopName}</h2>
              <p className="text-xs text-gray-500">{shop.ownerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + rating row */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge shop={shop} />
            <div className="flex items-center gap-1">
              <MdStar className="text-yellow-400 text-base" />
              <span className="text-sm font-semibold text-gray-800">{shop.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-400 ml-1">· 124 reviews</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MdAccessTime className="text-sm" /> 10–15 min est.
            </span>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MdLocationOn, label: 'Address',       value: shop.shopAddress },
              { icon: MdPhone,      label: 'Phone',         value: shop.phone || '—' },
              { icon: MdAccessTime, label: 'Opening Time',  value: fmt12(shop.openingTime) },
              { icon: MdAccessTime, label: 'Closing Time',  value: fmt12(shop.closingTime) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                <Icon className="text-blue-500 text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Available Services</h3>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map(({ label, enabled }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                  ${enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <MdCheckCircle className={`text-base ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Pricing Details</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {PRICING_TABLE.map(({ label, value }, i) => (
                <div key={label} className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Select button */}
          <Button fullWidth size="lg" onClick={() => { onSelect(shop); onClose(); }}>
            Select This Shop
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap
        ${active ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
    >
      {children}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Open Now', 'Lowest Price', 'Highest Rating'];

export default function PrintShopsPage() {
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [modalShop, setModalShop]   = useState(null);
  const navigate                    = useNavigate();

  useEffect(() => {
    orderService.getPrintShops()
      .then(({ data }) => setShops(data.shops))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback((shop) => {
    // Navigate to upload page — UploadPage reads shops fresh itself,
    // but we store the pre-selected shop ID so it can be auto-selected
    navigate('/upload', { state: { preSelectedShopId: shop._id } });
  }, [navigate]);

  const displayed = useMemo(() => {
    let list = [...shops];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.shopName?.toLowerCase().includes(q) ||
        s.shopAddress?.toLowerCase().includes(q)
      );
    }

    // filter
    if (filter === 'Open Now')       list = list.filter(s => isShopOpen(s));
    if (filter === 'Lowest Price')   list = list.sort((a, b) => (a.pricing?.blackWhitePrice ?? 99) - (b.pricing?.blackWhitePrice ?? 99));
    if (filter === 'Highest Rating') list = list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [shops, search, filter]);

  return (
    <StudentLayout>
      <div className="max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Print Shops</h1>
          <p className="text-sm text-gray-500 mt-1">Select a nearby print shop to print your documents.</p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by shop name or location..."
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <MdClose className="text-lg" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterBtn>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            {displayed.length} shop{displayed.length !== 1 ? 's' : ''} found
            {search && <> for "<span className="text-gray-600 font-medium">{search}</span>"</>}
          </p>
        )}

        {/* Shop list */}
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : displayed.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
            <MdPrint className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No print shops found</p>
            {search && <button onClick={() => setSearch('')} className="mt-2 text-sm text-blue-600 hover:underline">Clear search</button>}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {displayed.map((shop, i) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                index={i}
                onSelect={handleSelect}
                onViewDetails={setModalShop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {modalShop && (
          <ShopModal
            shop={modalShop}
            onClose={() => setModalShop(null)}
            onSelect={handleSelect}
          />
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
