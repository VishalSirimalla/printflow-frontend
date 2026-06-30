import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/ui/Card';
import { MdPerson, MdEmail, MdPhone, MdSchool } from 'react-icons/md';

export default function StudentProfile() {
  const { user } = useAuth();
  return (
    <StudentLayout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <MdPerson className="text-blue-600 text-xl shrink-0" />
              <div><p className="text-xs text-gray-400">Full Name</p><p className="font-medium">{user?.fullName}</p></div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MdEmail className="text-blue-600 text-xl shrink-0" />
              <div><p className="text-xs text-gray-400">Email</p><p className="font-medium">{user?.email}</p></div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MdPhone className="text-blue-600 text-xl shrink-0" />
              <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium">{user?.phone}</p></div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MdSchool className="text-blue-600 text-xl shrink-0" />
              <div><p className="text-xs text-gray-400">College</p><p className="font-medium">{user?.college}</p></div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
