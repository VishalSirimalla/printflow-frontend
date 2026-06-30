import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPrint, MdEmail, MdLock, MdPerson, MdPhone, MdSchool } from 'react-icons/md';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function StudentRegister() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.registerStudent(data);
      login(res.data.token, res.data.user, 'student');
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center">
              <MdPrint className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold text-blue-700">PrintFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Create your student account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<MdPerson />}
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <Input
              label="College / University"
              placeholder="State University"
              icon={<MdSchool />}
              error={errors.college?.message}
              {...register('college', { required: 'College is required' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@university.edu"
              icon={<MdEmail />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              icon={<MdPhone />}
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              icon={<MdLock />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:underline">Sign In</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Are you a print shop owner?{' '}
            <Link to="/admin/register" className="text-blue-700 font-medium hover:underline">Register Shop</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
