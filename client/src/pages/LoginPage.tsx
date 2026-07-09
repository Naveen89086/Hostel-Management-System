import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, ShieldCheck, Users, Settings, ArrowLeft, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';

type Role = 'student' | 'warden' | 'admin' | null;

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back!');
        // Redirect based on actual user role from response, fallback to selected role
        const loggedInUser = res.data?.user || res.user;
        const userRole = loggedInUser?.role || selectedRole;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'warden') {
          navigate('/warden/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfig = {
    student: {
      title: 'Student',
      description: 'Access your dashboard to submit complaints, apply for leaves, and more.',
      icon: <GraduationCap className="h-12 w-12 text-blue-500" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      ringColor: 'focus:ring-blue-500',
      defaultEmail: 'rahul@gmail.com',
      defaultPass: 'student123'
    },
    warden: {
      title: 'Warden',
      description: 'Manage hostel operations, complaints, verify leaves, and view reports.',
      icon: <ShieldCheck className="h-12 w-12 text-purple-500" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      ringColor: 'focus:ring-purple-500',
      defaultEmail: 'warden@gmail.com',
      defaultPass: 'warden123'
    },
    admin: {
      title: 'Administrator',
      description: 'Full system control, hostel analytics, user management, and configuration.',
      icon: <Settings className="h-12 w-12 text-orange-500" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      ringColor: 'focus:ring-orange-500',
      defaultEmail: 'admin@gmail.com',
      defaultPass: 'admin123'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center gap-2">
        <Building2 className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold text-blue-600">HostelHub Agent</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {!selectedRole ? (
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Welcome to HostelHub</h1>
              <p className="text-slate-500 text-lg">Please select your role to proceed to the login portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(roleConfig) as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-slate-100 hover:-translate-y-1"
                >
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {roleConfig[role!]?.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{roleConfig[role!]?.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {roleConfig[role!]?.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-fade-in">
            <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-t-4 ${roleConfig[selectedRole].borderColor}`}>
              <div className="p-8 sm:p-10">
                
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="mb-4">
                    {roleConfig[selectedRole].icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{roleConfig[selectedRole].title} Portal</h2>
                  <p className="text-slate-500 text-sm mt-2">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email / Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 ${roleConfig[selectedRole].ringColor} transition-all`}
                        placeholder={`Enter ${selectedRole} email`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 ${roleConfig[selectedRole].ringColor} transition-all`}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a href="#" className={`text-sm font-medium ${roleConfig[selectedRole].textColor} hover:opacity-80 transition-opacity`}>
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 ${roleConfig[selectedRole].color} text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md`}
                  >
                    {isSubmitting ? <Spinner size="sm" /> : (
                      <><LogIn className="h-5 w-5" /> Login</>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Test Credentials</p>
                  <p className="text-sm font-medium text-slate-700">Email: {roleConfig[selectedRole].defaultEmail}</p>
                  <p className="text-sm font-medium text-slate-700">Password: {roleConfig[selectedRole].defaultPass}</p>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Role Selection
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
