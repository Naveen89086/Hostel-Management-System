import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import * as userService from '../services/user.service';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Plus, Trash2, X, UserPlus, Building } from 'lucide-react';
import api from '../services/api';

export const AdminWardensPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Block selection state
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');

  // Separate warden lists per block
  const [blockAWardens, setBlockAWardens] = useState<User[]>([]);
  const [blockBWardens, setBlockBWardens] = useState<User[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
    fullName: '',
    block: '',
  });
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchWardens();
    }
  }, []);

  const fetchWardens = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getAllUsers({ role: 'warden' });
      if (res.success) {
        const allWardens = res.data || [];
        const aWardens: User[] = [];
        const bWardens: User[] = [];
        allWardens.forEach((w: any) => {
          if (w.block === 'B') {
            bWardens.push(w);
          } else {
            aWardens.push(w);
          }
        });
        setBlockAWardens(aWardens);
        setBlockBWardens(bWardens);
      }
    } catch (error) {
      toast.error('Failed to load wardens');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current block's wardens
  const currentWardens = selectedBlock === 'A' ? blockAWardens : blockBWardens;

  const handleDelete = async (id: string) => {
    try {
      const res = await userService.deleteUser(id);
      if (res.success) {
        if (selectedBlock === 'A') {
          setBlockAWardens(blockAWardens.filter(w => w._id !== id));
        } else {
          setBlockBWardens(blockBWardens.filter(w => w._id !== id));
        }
        toast.success('Warden deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete warden');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\\.com$/;
    
    if (!formData.emailId.trim() || !emailRegex.test(formData.emailId)) newErrors.emailId = 'Invalid Email Id. Please enter a valid Email Id.';
    
    if (!formData.password.trim() || formData.password.length < 6) newErrors.password = 'Invalid Password. Please enter a valid Password.';
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Invalid Full Name. Please enter a valid Full Name.';
    
    if (!formData.block) newErrors.block = 'Invalid Block. Please enter a valid Block.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.emailId,
        password: formData.password,
        role: 'warden',
        block: formData.block
      });
      
      if (res.data?.success) {
        const newWarden = {
          _id: res.data.data?.user?._id || Math.random().toString(),
          name: formData.fullName,
          email: formData.emailId,
          role: 'warden',
          block: formData.block,
          lastLogin: 'Never'
        } as unknown as User;

        // Add to the correct block list sequentially (append to end)
        if (formData.block === 'A') {
          setBlockAWardens([...blockAWardens, newWarden]);
        } else {
          setBlockBWardens([...blockBWardens, newWarden]);
        }

        toast.success(`Warden added to Block ${formData.block} successfully!`);
        
        // Reset and close
        setFormData({ emailId: '', password: '', fullName: '', block: '' });
        setErrors({});
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create warden');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins only.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">
            Administrator Dashboard
          </h1>
          <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs mr-3">
              AD
            </div>
            <span className="text-sm font-semibold text-slate-700 pr-2">admin</span>
          </div>
        </div>

        {/* Block Selector */}
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600 mr-2">Select Block:</span>
          <button
            onClick={() => setSelectedBlock('A')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'A'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Block A
          </button>
          <button
            onClick={() => setSelectedBlock('B')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'B'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Block B
          </button>
        </div>

        {/* Manage Wardens Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 sm:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-800">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-lg font-extrabold">Manage Wardens — Block {selectedBlock}</h2>
            </div>
            <button 
              onClick={() => {
                setErrors({});
                setFormData({ emailId: '', password: '', fullName: '', block: selectedBlock });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Warden
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
          ) : currentWardens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Username</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Name</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Role</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Last Login</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentWardens.map((w) => {
                    const lastLogin = (w as any).lastLogin || 'Never';

                    return (
                      <tr key={w._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 sm:px-8 py-5 font-medium">{w.email || (w as any).username || '-'}</td>
                        <td className="px-6 sm:px-8 py-5">{w.name}</td>
                        <td className="px-6 sm:px-8 py-5 capitalize">{w.role}</td>
                        <td className="px-6 sm:px-8 py-5">{lastLogin}</td>
                        <td className="px-6 sm:px-8 py-5 text-center">
                          <button 
                            onClick={() => handleDelete(w._id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Delete Warden"
                          >
                            <Trash2 className="h-5 w-5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">No wardens found in Block {selectedBlock}.</p>
              <p className="text-sm mt-1">Click "+ Add Warden" to add a warden to this block.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Warden Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add Warden</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="addWardenForm" onSubmit={handleCreateWarden} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Id</label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.emailId ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="warden@gmail.com"
                  />
                  {errors.emailId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emailId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.fullName ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Block</label>
                  <div className={`flex items-center gap-6 py-2.5 px-4 bg-slate-50 border rounded-lg ${errors.block ? 'border-red-400' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="wardenBlock"
                        value="A"
                        checked={formData.block === 'A'}
                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                        className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">A</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="wardenBlock"
                        value="B"
                        checked={formData.block === 'B'}
                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                        className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">B</span>
                    </label>
                  </div>
                  {errors.block && <p className="text-red-500 text-xs mt-1 font-medium">{errors.block}</p>}
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                type="submit"
                form="addWardenForm"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {isSubmitting ? <Spinner size="sm" /> : (
                  <><UserPlus className="h-5 w-5" /> Create User</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
