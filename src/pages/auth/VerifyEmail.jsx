import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdPrint, MdCheckCircle, MdError, MdHourglassEmpty } from 'react-icons/md';
import api from '../../services/api';

export default function VerifyEmail() {
  const { token }          = useParams();
  const [searchParams]     = useSearchParams();
  const role               = searchParams.get('role') || 'student';
  const navigate           = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('Verification page opened');
    console.log('Token:', token);
    console.log('Role:', role);

    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing a token.');
      return;
    }

    console.log('Calling backend...');
    api.get(`/auth/verify-email/${token}?role=${role}`)
      .then((res) => {
        console.log('Backend response:', res.data);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate(role === 'admin' ? '/admin/login' : '/login'), 3000);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Verification link is invalid or has expired.';
        console.error('Verification error:', msg);
        setStatus('error');
        setMessage(msg);
      });
  }, [token, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const loginPath = role === 'admin' ? '/admin/login' : '/login';

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
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MdHourglassEmpty className="text-blue-500 text-4xl animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5"
              >
                <MdCheckCircle className="text-green-500 text-4xl" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-sm text-gray-500 mb-5">{message}</p>
              <p className="text-xs text-gray-400 mb-4">Redirecting you to login…</p>
              <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-1 bg-blue-600 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MdError className="text-red-500 text-4xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <Link
                to={loginPath}
                className="inline-block bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-800 transition"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">© 2024 PRINTFLOW LABS. ALL RIGHTS RESERVED.</p>
      </motion.div>
    </div>
  );
}
