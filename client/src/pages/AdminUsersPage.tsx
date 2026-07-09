import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import * as userService from '../services/user.service';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { Users, Plus, Trash2, X, UserPlus, Building } from 'lucide-react';
import api from '../services/api';

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Block selection state
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');

  // Separate user lists per block
  const [blockAUsers, setBlockAUsers] = useState<User[]>([]);
  const [blockBUsers, setBlockBUsers] = useState<User[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
    fullName: '',
    rollNumber: '',
    mobileNumber: '',
    gender: 'Male',
    block: '',
    roomNumber: '',
    branch: ''
  });
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'warden') {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getAllUsers({ role: 'student' });
      if (res.success) {
        const allUsers = res.data || [];
        // Split users into blocks based on their block field or roomNumber prefix
        const aUsers: User[] = [];
        const bUsers: User[] = [];
        allUsers.forEach((u: any) => {
          if (u.block === 'B' || (u.roomNumber && u.roomNumber.startsWith('B'))) {
            bUsers.push(u);
          } else {
            aUsers.push(u);
          }
        });
        setBlockAUsers(aUsers);
        setBlockBUsers(bUsers);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current block's users
  const currentUsers = selectedBlock === 'A' ? blockAUsers : blockBUsers;
  const setCurrentUsers = selectedBlock === 'A' ? setBlockAUsers : setBlockBUsers;

  const handleDelete = async (id: string) => {
    try {
      const res = await userService.deleteUser(id);
      if (res.success) {
        if (selectedBlock === 'A') {
          setBlockAUsers(blockAUsers.filter(u => u._id !== id));
        } else {
          setBlockBUsers(blockBUsers.filter(u => u._id !== id));
        }
        toast.success('Student deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
    if (!formData.emailId.trim() || !emailRegex.test(formData.emailId)) newErrors.emailId = 'Invalid Email Id. Please enter a valid Email Id.';
    
    if (!formData.password.trim() || formData.password.length < 6) newErrors.password = 'Invalid Password. Please enter a valid Password.';
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Invalid Full Name. Please enter a valid Full Name.';
    
    if (!formData.rollNumber.trim() || !/^\d+$/.test(formData.rollNumber)) newErrors.rollNumber = 'Invalid Roll Number. Please enter a valid Roll Number.';
    
    if (!formData.mobileNumber.trim() || !/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid Mobile Number. Please enter a 10-digit number.';

    if (!formData.gender) newErrors.gender = 'Please select a gender.';
    
    if (!formData.block) newErrors.block = 'Invalid Block. Please enter a valid Block.';
    
    if (!formData.roomNumber.trim() || !/^\d+$/.test(formData.roomNumber)) newErrors.roomNumber = 'Invalid Room Number. Please enter a valid Room Number.';
    
    if (!formData.branch.trim()) newErrors.branch = 'Invalid Branch. Please enter a valid Branch.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/users', {
        name: formData.fullName,
        email: formData.emailId,
        password: formData.password,
        role: 'student',
        phone: formData.mobileNumber,
        gender: formData.gender,
        registrationNumber: formData.rollNumber,
        block: formData.block,
        roomNumber: `${formData.block}-${formData.roomNumber}`,
        department: formData.branch,
        rollNo: formData.rollNumber
      });
      
      if (res.data?.success) {
        const newUser = {
          _id: res.data.data?._id || Math.random().toString(),
          name: formData.fullName,
          email: formData.emailId,
          role: 'student',
          rollNo: formData.rollNumber,
          block: formData.block,
          roomNumber: `${formData.block}-${formData.roomNumber}`,
          department: formData.branch,
          lastLogin: 'Never'
        } as unknown as User;

        // Add to the correct block list sequentially (append to end)
        if (formData.block === 'A') {
          setBlockAUsers([...blockAUsers, newUser]);
        } else {
          setBlockBUsers([...blockBUsers, newUser]);
        }

        toast.success(`Student added to Block ${formData.block} successfully!`);
        
        // Reset and close
        setFormData({ emailId: '', password: '', fullName: '', rollNumber: '', mobileNumber: '', gender: 'Male', block: '', roomNumber: '', branch: '' });
        setErrors({});
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins and Wardens only.</div>;
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

        {/* Manage Students Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 sm:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-800">
              <Users className="h-6 w-6" />
              <h2 className="text-lg font-extrabold">Manage Students — Block {selectedBlock}</h2>
            </div>
            <button 
              onClick={() => {
                setErrors({});
                setFormData({ emailId: '', password: '', fullName: '', rollNumber: '', mobileNumber: '', gender: 'Male', block: selectedBlock, roomNumber: '', branch: '' });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Student
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
          ) : currentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Roll No</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Name</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Room</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Branch</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Last Login</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentUsers.map((u, index) => {
                    const rollNo = (u as any).rollNo || `${index + 1}`;
                    const branch = (u as any).department || 'cse';
                    const lastLogin = (u as any).lastLogin || 'Never';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 sm:px-8 py-5 font-medium">{rollNo}</td>
                        <td className="px-6 sm:px-8 py-5">{u.name}</td>
                        <td className="px-6 sm:px-8 py-5">{u.roomNumber || '-'}</td>
                        <td className="px-6 sm:px-8 py-5">{branch}</td>
                        <td className="px-6 sm:px-8 py-5">{lastLogin}</td>
                        <td className="px-6 sm:px-8 py-5 text-center">
                          <button 
                            onClick={() => handleDelete(u._id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Delete Student"
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
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">No students found in Block {selectedBlock}.</p>
              <p className="text-sm mt-1">Click "+ Add Student" to add a student to this block.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add Student</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="addStudentForm" onSubmit={handleCreateUser} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Id</label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.emailId ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="student@gmail.com"
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Roll Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.rollNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setFormData({...formData, rollNumber: val});
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.rollNumber ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="101"
                  />
                  {errors.rollNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.rollNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setFormData({...formData, mobileNumber: val});
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.mobileNumber ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.gender ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Block</label>
                  <div className={`flex items-center gap-6 py-2.5 px-4 bg-slate-50 border rounded-lg ${errors.block ? 'border-red-400' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="block"
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
                        name="block"
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.roomNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setFormData({...formData, roomNumber: val});
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.roomNumber ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="102"
                  />
                  {errors.roomNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.roomNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.branch ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="cse"
                  />
                  {errors.branch && <p className="text-red-500 text-xs mt-1 font-medium">{errors.branch}</p>}
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                type="submit"
                form="addStudentForm"
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
