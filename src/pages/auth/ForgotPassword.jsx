import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPrint, MdEmail, MdArrowBack, MdMarkEmailRead } from 'react-icons/md';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPassword() {
  const [searchParams]  = useSearchParams();
  const isAdmin         = searchParams.get('role') === 'admin';
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email, role: isAdmin ? 'admin' : 'student' });
      setSentEmail(email);
      setSubmitted(true);
      toast.success('Reset link sent!');
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
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Admin Portal' : 'Student Portal'} — Password Recovery
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <MdEmail className="text-blue-600 text-3xl" />
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Forgot your password?</h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder={isAdmin ? 'admin@printshop.com' : 'name@university.edu'}
                  icon={<MdEmail />}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                  })}
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to={isAdmin ? '/admin/login' : '/login'}
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
              className="text-center"
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <MdMarkEmailRead className="text-green-500 text-4xl" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-1">We've sent a reset link to</p>
              <p className="text-sm font-semibold text-blue-700 mb-4 break-all">{sentEmail}</p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Check your spam or junk folder if you don't see it.</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> The link expires in <strong>1 hour</strong>.</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Click the link in the email to set a new password.</li>
                </ul>
              </div>

              <button
                onClick={() => { setSubmitted(false); setSentEmail(''); }}
                className="text-sm text-blue-600 hover:underline mb-4 block w-full text-center"
              >
                Didn't receive it? Try again
              </button>

              <Link
                to={isAdmin ? '/admin/login' : '/login'}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MdArrowBack className="text-base" /> Back to Login
              </Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">© 2024 PRINTFLOW LABS. ALL RIGHTS RESERVED.</p>
      </motion.div>
    </div>
  );
}
