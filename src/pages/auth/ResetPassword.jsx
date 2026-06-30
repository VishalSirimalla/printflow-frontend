import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPrint, MdLock, MdArrowBack, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';

// ── Password strength helper ─────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)               score++;
  if (pw.length >= 12)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;

  if (score <= 1) return { score, label: 'Weak',      color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair',      color: 'bg-orange-400' };
  if (score <= 3) return { score, label: 'Good',      color: 'bg-yellow-400' };
  if (score <= 4) return { score, label: 'Strong',    color: 'bg-green-500' };
  return            { score, label: 'Very Strong', color: 'bg-green-600' };
};

function StrengthBar({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score <= 2 ? 'text-orange-500' : score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
        {label}
      </p>
    </div>
  );
}

// ── Password field with show/hide ────────────────────────────────────────────
function PasswordField({ label, placeholder, error, showState, onToggle, registerProps, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type={showState ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl bg-gray-50
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          {...registerProps}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showState ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ResetPassword() {
  const { token }           = useParams();
  const [searchParams]      = useSearchParams();
  const role                = searchParams.get('role') || 'student';
  const navigate            = useNavigate();

  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password', '');

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, { password, role });
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate(role === 'admin' ? '/admin/login' : '/login'), 2500);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center">
              <MdPrint className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold text-blue-700">PrintFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Create a new password for your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {!success ? (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <MdLock className="text-blue-600 text-3xl" />
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Set New Password</h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Your new password must be at least 8 characters long.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <PasswordField
                  label="New Password"
                  placeholder="Min. 8 characters"
                  error={errors.password?.message}
                  showState={showNew}
                  onToggle={() => setShowNew(v => !v)}
                  registerProps={register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters required' },
                  })}
                >
                  <StrengthBar password={passwordValue} />
                </PasswordField>

                <PasswordField
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword?.message}
                  showState={showConfirm}
                  onToggle={() => setShowConfirm(v => !v)}
                  registerProps={register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === passwordValue || 'Passwords do not match',
                  })}
                />

                {/* Requirements list */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {[
                    { label: 'At least 8 characters',     met: passwordValue.length >= 8 },
                    { label: 'One uppercase letter',       met: /[A-Z]/.test(passwordValue) },
                    { label: 'One number',                 met: /[0-9]/.test(passwordValue) },
                    { label: 'One special character',      met: /[^A-Za-z0-9]/.test(passwordValue) },
                  ].map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {met && <MdCheckCircle className="text-white text-xs" />}
                      </div>
                      <span className={`text-xs transition-colors ${met ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Reset Password
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to={role === 'admin' ? '/admin/login' : '/login'}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MdArrowBack className="text-base" /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5"
              >
                <MdCheckCircle className="text-green-500 text-4xl" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
              <p className="text-sm text-gray-500 mb-5">
                Your password has been reset successfully. Redirecting you to the login page…
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1 mb-5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'linear' }}
                  className="h-1 bg-blue-600 rounded-full"
                />
              </div>

              <Link
                to={role === 'admin' ? '/admin/login' : '/login'}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
              >
                <MdArrowBack className="text-base" /> Go to Login now
              </Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">© 2024 PRINTFLOW LABS. ALL RIGHTS RESERVED.</p>
      </motion.div>
    </div>
  );
}
