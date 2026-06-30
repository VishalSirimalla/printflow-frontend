import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPrint, MdEmail, MdLock } from 'react-icons/md';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GoogleLogin } from '@react-oauth/google';

export default function StudentLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await authService.googleStudentLogin({
        credential: credentialResponse.credential,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      });

      login(data.token, data.user, 'student');
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err) || 'Google Login Failed');
    }
  };
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.loginStudent(data);
      login(res.data.token, res.data.user, 'student');
      toast.success('Welcome back!');
      navigate('/dashboard');
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
        transition={{ duration: 0.4 }}
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
          <p className="text-gray-500 text-sm">Sign in to your student portal to manage your print orders.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Student Email"
              type="email"
              placeholder="name@university.edu"
              icon={<MdEmail />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<MdLock />}
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-blue-700 hover:underline">Forgot password?</Link>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              Keep me signed in
            </label>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Login →
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
    onError={() => toast.error("Google Login Failed")}
    theme="outline"
    size="large"
    shape="pill"
    width="330"
    text="continue_with"
  />
</div>

          <p className="text-center text-sm text-gray-500 mt-5">
            New to PrintFlow?{' '}
            <Link to="/register" className="text-blue-700 font-medium hover:underline">Create Account</Link>
          </p>
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
          <button className="hover:text-gray-600">Help Center</button>
          <button className="hover:text-gray-600">Privacy Policy</button>
          <button className="hover:text-gray-600">Terms of Service</button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">© 2024 PRINTFLOW LABS. ALL RIGHTS RESERVED.</p>
      </motion.div>
    </div>
  );
}
