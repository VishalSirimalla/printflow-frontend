import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ShieldCheck, IndianRupee, Phone,
  Search, ChevronDown, Mail, Clock,
  FileText, BookOpen, Info, MessageCircle,
  ArrowRight, HelpCircle,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';

// ─── Data ────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Upload,       title: 'Uploading Documents', desc: 'Learn how to upload your files correctly.' },
  { icon: ShieldCheck,  title: 'OTP Verification',    desc: 'Understand how document security works.' },
  { icon: IndianRupee,  title: 'Pricing',              desc: 'Know how printing costs are calculated.' },
  { icon: Phone,        title: 'Contact Support',      desc: 'Reach us if you need assistance.' },
];

const FAQS = [
  {
    q: 'How do I place an order?',
    a: (
      <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm leading-relaxed">
        {[
          'Upload your document.',
          'Select print settings.',
          'Choose a print shop.',
          'Review your total price.',
          'Submit the order.',
          'A secure OTP will be generated.',
          'Visit the selected shop and share the OTP.',
          'Collect your printed documents and pay at the shop.',
        ].map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    ),
  },
  {
    q: 'Which file formats are supported?',
    a: (
      <div className="flex gap-2 flex-wrap">
        {['PDF', 'PNG', 'JPG', 'JPEG'].map(f => (
          <span key={f} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">{f}</span>
        ))}
      </div>
    ),
  },
  {
    q: 'How is the printing cost calculated?',
    a: (
      <ul className="space-y-1 text-sm text-gray-600">
        {['Number of pages', 'Color or Black & White', 'Single or Double-sided printing', 'Number of copies'].map(item => (
          <li key={item} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    q: 'How does OTP verification work?',
    a: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Every order generates a unique 6-digit OTP. The print shop owner cannot access your document
        until this OTP is entered correctly. This ensures your files remain secure.
      </p>
    ),
  },
  {
    q: 'When do I make the payment?',
    a: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Payment is collected directly at the print shop after your documents are printed.
        Online payment is not required.
      </p>
    ),
  },
  {
    q: 'Can I cancel an order?',
    a: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Yes. Orders can only be cancelled before printing begins.
      </p>
    ),
  },
  {
    q: 'Where can I find my OTP?',
    a: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Go to <span className="font-semibold text-blue-600">My Orders</span> and open the order details.
        Your OTP will remain visible until the order is completed.
      </p>
    ),
  },
  {
    q: 'What should I do if my file upload fails?',
    a: (
      <ul className="space-y-1 text-sm text-gray-600">
        {['Your internet connection is stable.', 'The file format is supported.', 'The file size is within the allowed limit.'].map(item => (
          <li key={item} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {item}
          </li>
        ))}
        <li className="text-gray-500 mt-2 italic">Then try uploading again.</li>
      </ul>
    ),
  },
];

const USEFUL_LINKS = [
  { icon: FileText,      label: 'Privacy Policy' },
  { icon: BookOpen,      label: 'Terms & Conditions' },
  { icon: Info,          label: 'About Us' },
  { icon: MessageCircle, label: 'Contact Us' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickActionCard({ icon: Icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,0.10)' }}
      className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer group transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
        <Icon size={20} className="text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function AccordionItem({ faq, isOpen, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-gray-100 rounded-2xl bg-white overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors pr-4">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 border-t border-gray-50">
              <div className="pt-4">{faq.a}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UsefulLinkCard({ icon: Icon, label, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="flex items-center justify-between w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 group hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <Icon size={15} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{label}</span>
      </div>
      <ArrowRight size={15} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HelpCenter() {
  const [search, setSearch]   = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i);

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle size={22} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Need assistance? Find answers to common questions or contact support.
          </p>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 shadow-sm transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        {!search && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Help</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((card, i) => (
                <QuickActionCard key={card.title} {...card} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ Accordion ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Frequently Asked Questions
            {search && (
              <span className="ml-2 text-xs font-normal normal-case text-gray-400">
                — {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{search}"
              </span>
            )}
          </h2>

          {filteredFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 rounded-2xl p-10 text-center"
            >
              <Search size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No results found for "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-3 text-xs text-blue-600 hover:underline">Clear search</button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  faq={faq}
                  index={i}
                  isOpen={openIdx === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Contact Support Card ── */}
        {!search && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Support</h2>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href="mailto:support@printflow.com" className="text-sm font-medium text-blue-600 hover:underline">
                      support@printflow.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-gray-800">+91 XXXXX XXXXX</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Working Hours</p>
                    <p className="text-sm font-medium text-gray-800">Mon – Sat</p>
                    <p className="text-xs text-gray-500">9:00 AM – 8:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <a
                  href="mailto:support@printflow.com"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Mail size={15} /> Email Support
                </a>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-colors"
                >
                  <Phone size={15} /> Call Support
                </a>
              </div>
            </motion.div>
          </section>
        )}

        {/* ── Useful Links ── */}
        {!search && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Useful Links</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {USEFUL_LINKS.map((link, i) => (
                <UsefulLinkCard key={link.label} {...link} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        {!search && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <h3 className="font-bold text-lg mb-1">Still need help?</h3>
                <p className="text-blue-100 text-sm">
                  If you couldn't find the answer you're looking for, our support team is here to assist you.
                </p>
              </div>
              <motion.a
                href="mailto:support@printflow.com"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="shrink-0 flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <MessageCircle size={15} /> Contact Support
              </motion.a>
            </div>
          </motion.div>
        )}

      </div>
    </StudentLayout>
  );
}
