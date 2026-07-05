import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, User, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'warden' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-50 dark:bg-surface-950">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary-400/20 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3 text-white">
          <Building2 className="h-10 w-10" />
          <span className="text-3xl font-bold tracking-tight">HostelHub Agent</span>
        </div>
        
        <div className="relative z-10 mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Join the smart<br />hostel community
          </h2>
          <p className="text-primary-100 text-lg max-w-md">
            Create an account to manage your room, submit requests, and stay updated.
          </p>
        </div>
        
        <div className="relative z-10 text-primary-200 text-sm">
          &copy; {new Date().getFullYear()} HostelHub. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in my-8">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-primary-600 dark:text-primary-400">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">HostelHub</span>
          </div>

          <div className="glass-card p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">Create Account</h2>
              <p className="text-surface-500 dark:text-surface-400">Sign up to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="flex p-1 bg-surface-100 dark:bg-surface-900 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'student' 
                      ? 'bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('warden')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'warden' 
                      ? 'bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                      : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  Warden
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-11"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                    placeholder="student@hostelhub.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 mt-4"
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
