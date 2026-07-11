import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdStore, MdEmail, MdLock, MdPerson, MdPhone, MdLocationOn } from 'react-icons/md';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminRegister() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const onSubmit = async (data) => {
  setLoading(true);
  try {
    const res = await authService.registerAdmin(data);

    toast.success(res.data.message);

    navigate('/admin/login');
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
              <MdStore className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold text-blue-700">PrintFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Register your print shop</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Shop Name"
              placeholder="Campus Copy Center"
              icon={<MdStore />}
              error={errors.shopName?.message}
              {...register('shopName', { required: 'Shop name is required' })}
            />
            <Input
              label="Owner Name"
              placeholder="John Doe"
              icon={<MdPerson />}
              error={errors.ownerName?.message}
              {...register('ownerName', { required: 'Owner name is required' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="shop@email.com"
              icon={<MdEmail />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="9876543210"
              icon={<MdPhone />}
              error={errors.phone?.message}
              maxLength={10}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid Indian mobile number',
                },
                minLength: { value: 10, message: 'Phone number must contain exactly 10 digits' },
                maxLength: { value: 10, message: 'Phone number must contain exactly 10 digits' },
              })}
            />
            <Input
              label="Shop Address"
              placeholder="Student Union, Level 2, Room 204"
              icon={<MdLocationOn />}
              error={errors.shopAddress?.message}
              {...register('shopAddress', { required: 'Shop address is required' })}
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
              Register Shop
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already registered?{' '}
            <Link to="/admin/login" className="text-blue-700 font-medium hover:underline">Admin Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
