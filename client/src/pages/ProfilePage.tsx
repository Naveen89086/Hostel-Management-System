import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, BookOpen, GraduationCap, Building2, Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import * as userService from '../services/user.service';
import { toast } from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    year: user?.year?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined
      };
      
      const res = await userService.updateProfile(dataToSubmit);
      if (res.success) {
        toast.success('Profile updated successfully');
        await checkAuth(); // Refresh user context
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  console.log('--- RENDERING PROFILE PAGE --- Pathname:', location.pathname);
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
          
          {/* Header Cover - using a solid blue gradient for a professional look */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          </div>
          
          <div className="px-6 sm:px-10 pb-10 relative">
            {/* Avatar */}
            <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-6">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white p-2 shadow-sm border border-slate-100">
                <div className="h-full w-full rounded-full bg-blue-50 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-inner">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
                {user.name}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                  user.role === 'warden' ? 'bg-amber-100 text-amber-600' : 
                  'bg-[#6366f1]/10 text-[#6366f1]'
                }`}>
                  {user.role}
                </span>
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-2">Edit Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><UserIcon className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-white" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-400" /></div>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-white" placeholder="+1234567890" />
                    </div>
                  </div>
                  {user.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><BookOpen className="h-4 w-4 text-slate-400" /></div>
                          <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-white" placeholder="e.g. Computer Science" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year of Study</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><GraduationCap className="h-4 w-4 text-slate-400" /></div>
                          <input type="number" name="year" min="1" max="5" value={formData.year} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-white" placeholder="e.g. 2" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3 pt-6 justify-end border-t border-slate-200 mt-6">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                    {isSaving ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</p>
                  <p className="font-bold text-slate-800">{user.phone || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><Building2 className="h-4 w-4" /> Room Number</p>
                  <p className="font-bold text-slate-800">{user.roomNumber || 'Not assigned'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><Building2 className="h-4 w-4" /> Hostel Block</p>
                  <p className="font-bold text-slate-800">{user.block || 'Not assigned'}</p>
                </div>
                {user.role === 'student' && (
                  <>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><UserIcon className="h-4 w-4" /> Registration Number</p>
                      <p className="font-bold text-slate-800">{user.registrationNumber || 'Not provided'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><UserIcon className="h-4 w-4" /> Gender</p>
                      <p className="font-bold text-slate-800 capitalize">{user.gender || 'Not provided'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Department</p>
                      <p className="font-bold text-slate-800">{user.department || 'Not provided'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Year</p>
                      <p className="font-bold text-slate-800">{user.year ? `Year ${user.year}` : 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
