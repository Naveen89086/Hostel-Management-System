import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Folder, CheckCircle, Bed, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import { User } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
      
      // Fetch emergency alerts for the Admin Dashboard
      const reqRes = await requestService.getRequests({});
      if (reqRes.success) {
        const emergencyReqs = (reqRes.data?.requests || []).filter(r => r.category === 'Emergency' || r.urgency === 'critical');
        const formattedAlerts = emergencyReqs.map(req => {
          const student = req.user as User;
          const dateObj = new Date(req.createdAt);
          const formattedTime = `${dateObj.toLocaleDateString('en-GB')}, ${dateObj.toLocaleTimeString('en-GB')}`;
          return {
            id: req._id,
            time: formattedTime,
            student: student?.name || 'Unknown',
            location: req.description || 'GPS Denied/Unavailable',
            status: req.status === 'resolved' ? 'Resolved' : 'Active',
          };
        });
        setAlerts(formattedAlerts);
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins and Wardens only.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
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

        {/* Stats Cards Section matched to Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Students */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
              <h3 className="text-3xl font-extrabold text-slate-800">1,240</h3>
            </div>
          </div>

          {/* Card 2: Total Complaints */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Folder className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Complaints</p>
              <h3 className="text-3xl font-extrabold text-slate-800">320</h3>
            </div>
          </div>

          {/* Card 3: Resolved Complaints */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Resolved Complaints</p>
              <h3 className="text-3xl font-extrabold text-slate-800">295</h3>
            </div>
          </div>

          {/* Card 4: Hostel Occupancy */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
              <Bed className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Hostel Occupancy</p>
              <h3 className="text-3xl font-extrabold text-slate-800">92%</h3>
            </div>
          </div>

        </div>

        {/* The rest of the page (kept intact but styled slightly) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h2>
              <button onClick={() => navigate('/admin/users')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl transition-colors font-medium flex items-center justify-between border border-slate-100 hover:border-blue-100">
                  <span>Manage Users</span> <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/admin/rooms')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl transition-colors font-medium flex items-center justify-between border border-slate-100 hover:border-blue-100">
                  <span>Manage Rooms</span> <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/admin/requests')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl transition-colors font-medium flex items-center justify-between border border-slate-100 hover:border-blue-100">
                  <span>Manage Requests</span> <ArrowRight className="h-4 w-4" />
              </button>
          </div>

          {/* Alerts Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>
              <div className="p-6">
                <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                  Emergency Alerts
                </h2>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{alert.student}</p>
                          <p className="text-sm text-slate-500 mt-1">{alert.time} • <span className="text-red-500 font-medium">{alert.location}</span></p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          alert.status === 'Resolved' 
                            ? 'bg-green-50 text-green-500' 
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <span className="text-sm">No critical system alerts at this time.</span>
                  </div>
                )}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};
