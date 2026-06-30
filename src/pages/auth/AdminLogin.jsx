import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdStore, MdEmail, MdLock } from 'react-icons/md';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GoogleLogin } from '@react-oauth/google';

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await authService.googleAdminLogin({
        credential: credentialResponse.credential,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      });

      login(data.token, data.user, 'admin');
      toast.success('Login successful!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err) || 'Google Login Failed');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.loginAdmin(data);
      login(res.data.token, res.data.user, 'admin');
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
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
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center">
              <MdStore className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold text-blue-700">PrintFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Admin Portal — Print Shop Owner</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@printshop.com"
              icon={<MdEmail />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<MdLock />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password?role=admin" className="text-xs text-blue-700 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Login as Admin →
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="outline"
              size="large"
              shape="pill"
              width="330"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            New print shop?{' '}
            <Link to="/admin/register" className="text-blue-700 font-medium hover:underline">Register Shop</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Are you a student?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:underline">Student Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
