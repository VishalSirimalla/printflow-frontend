import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdStore, MdEmail, MdPhone, MdLocationOn, MdPerson, MdEdit, MdSave,
  MdAccessTime, MdToggleOn, MdToggleOff,
} from 'react-icons/md';
import { IndianRupee, Printer, Palette, FileText, BookOpen, Layers, Clock } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { shopService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

// ── Reusable price input ────────────────────────────────────────────────────
function PriceInput({ label, name, register, errors, placeholder = '0.00' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <IndianRupee size={13} />
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          {...register(name, { valueAsNumber: true, min: { value: 0, message: 'Must be ≥ 0' } })}
          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-xl bg-gray-50 focus:bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            ${errors?.[name] ? 'border-red-400' : 'border-gray-200'}`}
        />
      </div>
      {errors?.[name] && <p className="text-xs text-red-500">{errors[name].message}</p>}
    </div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, color = 'text-blue-600 bg-blue-50' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={14} />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

// ── Toggle switch ───────────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full group"
    >
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const { user, login } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPricing, setSavingPricing]   = useState(false);
  const [isOpen, setIsOpen]         = useState(true);
  const [holidayMode, setHoliday]   = useState(false);
  const [shopData, setShopData]     = useState(null);

  // Profile form
  const profileForm = useForm();

  // Pricing form
  const {
    register: rp,
    handleSubmit: handlePricingSubmit,
    reset: resetPricing,
    formState: { errors: pricingErrors },
  } = useForm();

  // Load shop data on mount
  useEffect(() => {
    shopService.getProfile()
      .then(({ data }) => {
        const s = data.shop;
        setShopData(s);
        setIsOpen(s.isOpen ?? true);
        setHoliday(s.holidayMode ?? false);
        const pr = s.pricing || {};
        resetPricing({
          blackWhitePrice:      pr.blackWhitePrice      ?? 1.5,
          colorPrice:           pr.colorPrice           ?? 5.0,
          a3Price:              pr.a3Price              ?? 10.0,
          legalPrice:           pr.legalPrice           ?? 8.0,
          duplexCharge:         pr.duplexCharge         ?? 0.5,
          spiralBindingCharge:  pr.spiralBindingCharge  ?? 30.0,
          hardBindingCharge:    pr.hardBindingCharge    ?? 80.0,
          singlePageLamination: pr.singlePageLamination ?? 15.0,
          documentLamination:   pr.documentLamination   ?? 50.0,
          minimumOrderCharge:   pr.minimumOrderCharge   ?? 10.0,
          openingTime: s.openingTime || '09:00',
          closingTime: s.closingTime || '20:00',
        });
        profileForm.reset({
          shopName:    s.shopName,
          ownerName:   s.ownerName,
          phone:       s.phone,
          shopAddress: s.shopAddress,
        });
      })
      .catch(() => toast.error('Failed to load profile'));
  }, []);

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    try {
      await shopService.updateProfile(data);
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePricing = async (data) => {
    setSavingPricing(true);
    try {
      const { openingTime, closingTime, ...pricingFields } = data;
      await shopService.updatePricing({
        pricing: pricingFields,
        isOpen,
        holidayMode,
        openingTime,
        closingTime,
      });
      toast.success('Pricing updated successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPricing(false);
    }
  };

  const display = shopData || user;

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
        </div>

        {/* ── Shop Info Card ─────────────────────────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">
                {display?.shopName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{display?.shopName}</h2>
                <p className="text-sm text-gray-500">Print Shop Owner</p>
                <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${isOpen && !holidayMode ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen && !holidayMode ? 'bg-green-500' : 'bg-red-500'}`} />
                  {holidayMode ? 'Holiday Mode' : isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            </div>
            <Button
              variant={editingProfile ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setEditingProfile(e => !e)}
            >
              <MdEdit /> {editingProfile ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {editingProfile ? (
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid grid-cols-2 gap-4">
              {[
                { name: 'shopName',    label: 'Shop Name',    icon: MdStore },
                { name: 'ownerName',   label: 'Owner Name',   icon: MdPerson },
                { name: 'phone',       label: 'Phone',        icon: MdPhone },
                { name: 'shopAddress', label: 'Shop Address', icon: MdLocationOn, full: true },
              ].map(({ name, label, icon: Icon, full }) => (
                <div key={name} className={full ? 'col-span-2' : ''}>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      {...profileForm.register(name, { required: true })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
              <div className="col-span-2 flex justify-end mt-2">
                <Button type="submit" loading={savingProfile}>
                  <MdSave /> Save Profile
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {[
                { icon: MdStore,      label: 'Shop Name',    value: display?.shopName },
                { icon: MdPerson,     label: 'Owner Name',   value: display?.ownerName },
                { icon: MdEmail,      label: 'Email',        value: display?.email },
                { icon: MdPhone,      label: 'Phone',        value: display?.phone },
                { icon: MdLocationOn, label: 'Address',      value: display?.shopAddress, full: true },
              ].map(({ icon: Icon, label, value, full }) => (
                <div key={label} className={`flex items-center gap-3 ${full ? 'col-span-2' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="text-blue-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Pricing Management Card ────────────────────────────────────── */}
        <form onSubmit={handlePricingSubmit(onSavePricing)}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <IndianRupee size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Printing &amp; Service Pricing</h2>
                <p className="text-xs text-gray-400">All prices shown to students come from this configuration.</p>
              </div>
            </div>

            <div className="space-y-8">

              {/* B&W + Color ──────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={Printer} title="Base Printing" color="text-blue-600 bg-blue-50" />
                <div className="grid grid-cols-2 gap-4">
                  <PriceInput label="Black & White — Price Per Page" name="blackWhitePrice" register={rp} errors={pricingErrors} placeholder="1.50" />
                  <PriceInput label="Color — Price Per Page"         name="colorPrice"      register={rp} errors={pricingErrors} placeholder="5.00" />
                </div>
              </div>

              {/* Paper Sizes ──────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={FileText} title="Paper Size Charges" color="text-purple-600 bg-purple-50" />
                <div className="grid grid-cols-3 gap-4">
                  <PriceInput label="A4 Extra Charge"     name="a4ExtraCharge" register={rp} errors={pricingErrors} placeholder="0" />
                  <PriceInput label="A3 Price Per Page"   name="a3Price"       register={rp} errors={pricingErrors} placeholder="10.00" />
                  <PriceInput label="Legal Paper Price"   name="legalPrice"    register={rp} errors={pricingErrors} placeholder="8.00" />
                </div>
              </div>

              {/* Duplex ───────────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={Layers} title="Duplex Printing" color="text-orange-600 bg-orange-50" />
                <div className="grid grid-cols-3 gap-4">
                  <PriceInput label="Additional Charge Per Page" name="duplexCharge" register={rp} errors={pricingErrors} placeholder="0.50" />
                </div>
              </div>

              {/* Binding ──────────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={BookOpen} title="Binding Charges" color="text-green-600 bg-green-50" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">None</label>
                    <div className="pl-3 py-2 text-sm text-gray-400 border border-gray-100 rounded-xl bg-gray-50">₹0</div>
                  </div>
                  <PriceInput label="Spiral Binding" name="spiralBindingCharge" register={rp} errors={pricingErrors} placeholder="30.00" />
                  <PriceInput label="Hard Binding"   name="hardBindingCharge"   register={rp} errors={pricingErrors} placeholder="80.00" />
                </div>
              </div>

              {/* Lamination ───────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={Palette} title="Lamination" color="text-pink-600 bg-pink-50" />
                <div className="grid grid-cols-3 gap-4">
                  <PriceInput label="Single Page"         name="singlePageLamination" register={rp} errors={pricingErrors} placeholder="15.00" />
                  <PriceInput label="Document Lamination" name="documentLamination"   register={rp} errors={pricingErrors} placeholder="50.00" />
                </div>
              </div>

              {/* Minimum Order ────────────────────────────────────────── */}
              <div>
                <SectionHeading icon={IndianRupee} title="Minimum Order Charge" color="text-gray-600 bg-gray-100" />
                <div className="grid grid-cols-3 gap-4">
                  <PriceInput label="Minimum charge per order" name="minimumOrderCharge" register={rp} errors={pricingErrors} placeholder="10.00" />
                </div>
              </div>

              {/* Working Hours + Availability ─────────────────────────── */}
              <div>
                <SectionHeading icon={Clock} title="Working Hours &amp; Availability" color="text-blue-600 bg-blue-50" />
                <div className="grid grid-cols-2 gap-6">
                  {/* Toggles */}
                  <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
                    <Toggle label="Shop Open"     checked={isOpen}      onChange={setIsOpen} />
                    <div className="h-px bg-gray-200" />
                    <Toggle label="Holiday Mode"  checked={holidayMode} onChange={setHoliday} />
                  </div>

                  {/* Time pickers */}
                  <div className="space-y-3">
                    {[
                      { label: 'Opening Time', name: 'openingTime' },
                      { label: 'Closing Time', name: 'closingTime' },
                    ].map(({ label, name }) => (
                      <div key={name}>
                        <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                        <div className="relative">
                          <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                          <input
                            type="time"
                            {...rp(name)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button type="submit" size="lg" fullWidth loading={savingPricing}>
                <MdSave /> Save Pricing
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
