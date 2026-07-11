import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdPerson, MdEmail, MdPhone, MdSchool, MdEdit, MdClose, MdSave } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/ui/Card';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const startEdit = () => {
    reset({ fullName: user?.fullName, college: user?.college, phone: user?.phone });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await authService.updateStudentProfile(data);
      updateUser(res.data.user);
      toast.success(res.data.message);
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
        <Card className="p-6">
          {/* Avatar + name header */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">Student</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition"
              >
                <MdEdit className="text-base" /> Edit Profile
              </button>
            )}
          </div>

          {/* View mode */}
          {!editing && (
            <div className="space-y-4">
              <InfoRow icon={<MdPerson />} label="Full Name"  value={user?.fullName} />
              <InfoRow icon={<MdEmail />}  label="Email"      value={user?.email} />
              <InfoRow icon={<MdPhone />}  label="Phone"      value={user?.phone} />
              <InfoRow icon={<MdSchool />} label="College"    value={user?.college} />
            </div>
          )}

          {/* Edit mode */}
          {editing && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field
                label="Full Name"
                icon={<MdPerson />}
                error={errors.fullName?.message}
                inputProps={register('fullName', { required: 'Full name is required', validate: v => v.trim() !== '' || 'Full name is required' })}
              />
              <Field
                label="College / University"
                icon={<MdSchool />}
                error={errors.college?.message}
                inputProps={register('college', { required: 'College is required', validate: v => v.trim() !== '' || 'College is required' })}
              />
              <Field
                label="Phone Number"
                icon={<MdPhone />}
                error={errors.phone?.message}
                maxLength={10}
                inputProps={register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid Indian mobile number' },
                  minLength: { value: 10, message: 'Phone number must contain exactly 10 digits' },
                  maxLength: { value: 10, message: 'Phone number must contain exactly 10 digits' },
                })}
              />

              {/* Email — read only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-500">Email <span className="text-xs text-gray-400">(cannot be changed)</span></label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed">
                  <MdEmail className="text-gray-300 text-lg shrink-0" />
                  {user?.email}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><MdSave className="text-base" /> Save Changes</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition"
                >
                  <MdClose className="text-base" /> Cancel
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-gray-700">
      <span className="text-blue-600 text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

function Field({ label, icon, error, inputProps, maxLength }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>
        <input
          maxLength={maxLength}
          className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          {...inputProps}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
