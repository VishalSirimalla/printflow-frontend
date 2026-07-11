import { MdReceipt } from 'react-icons/md';
import { formatCurrency } from '../../utils/helpers';

/**
 * BillSummary — reactive bill card for PrintFlow checkout
 *
 * Props:
 *   bill        — output of calculateBill()
 *   settings    — current print settings (for labels)
 *   totalPages  — raw page count from document
 *   shopName    — string, shown in header
 *   compact     — boolean, hides zero-value rows when true (default false)
 */
export default function BillSummary({ bill, settings, totalPages, shopName, compact = false }) {
  if (!bill || !settings) return null;

  const {
    totalPrintablePages,
    printingCost,
    duplexCost,
    bindingCost,
    laminationCost,
    minimumAdjustment,
    grandTotal,
  } = bill;

  const printLabel = settings.color === 'color' ? 'Color' : 'Black & White';
  const sideLabel  = settings.printSide === 'double' ? 'Duplex' : 'Simplex';
  const bindLabel  = settings.binding === 'spiral' ? 'Spiral Binding'
                   : settings.binding === 'hard'   ? 'Hard Binding'
                   : 'Binding';
  const lamLabel   = settings.lamination === 'single'   ? 'Single Page Lamination'
                   : settings.lamination === 'document' ? 'Document Lamination'
                   : 'Lamination';

  const rows = [
    {
      label: `Printing (${printLabel} · ${settings.paperSize} · ${settings.copies} cop${settings.copies > 1 ? 'ies' : 'y'} · ${totalPrintablePages} pages)`,
      value: printingCost,
      always: true,
    },
    { label: `${sideLabel} charge`,  value: duplexCost,        always: false },
    { label: bindLabel,              value: bindingCost,        always: false },
    { label: lamLabel,               value: laminationCost,     always: false },
    { label: 'Minimum order adjust', value: minimumAdjustment,  always: false },
  ];

  const visibleRows = compact
    ? rows.filter(r => r.always || r.value > 0)
    : rows;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <MdReceipt className="text-blue-600 text-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">Bill Summary</p>
          {shopName && <p className="text-xs text-gray-400 truncate">{shopName}</p>}
        </div>
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 space-y-2 border-b border-gray-100">
        <InfoRow label="Documents"   value="1" />
        <InfoRow label="Total Pages" value={String(totalPages)} />
        <InfoRow label="Print Type"  value={printLabel} />
        <InfoRow label="Paper Size"  value={settings.paperSize} />
        <InfoRow label="Print Side"  value={sideLabel} />
        <InfoRow label="Copies"      value={String(settings.copies)} />
      </div>

      {/* Cost rows */}
      <div className="px-5 py-4 space-y-2.5 border-b border-gray-100">
        {visibleRows.map(({ label, value }) => (
          <CostRow key={label} label={label} value={value} />
        ))}
      </div>

      {/* Grand Total */}
      <div className="px-5 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">Grand Total</span>
        <span className="text-xl font-bold text-blue-700">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 leading-snug pr-3">{label}</span>
      <span className={`shrink-0 font-medium ${value === 0 ? 'text-gray-300' : 'text-gray-900'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
