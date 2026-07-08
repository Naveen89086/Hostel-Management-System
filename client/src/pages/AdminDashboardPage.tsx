import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Folder, CheckCircle, Bed, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import * as userService from '../services/user.service';
import { User } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = {
  total: '#3B82F6',
  resolved: '#22C55E',
  pending: '#EAB308',
  inProgress: '#F97316',
  rejected: '#EF4444',
  students: '#8B5CF6'
};

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => fetchStats(false);
    socket.on('request:created', handleEvent);
    socket.on('request:updated', handleEvent);
    socket.on('user:created', handleEvent);
    socket.on('user:updated', handleEvent);
    socket.on('user:deleted', handleEvent);
    return () => {
      socket.off('request:created', handleEvent);
      socket.off('request:updated', handleEvent);
      socket.off('user:created', handleEvent);
      socket.off('user:updated', handleEvent);
      socket.off('user:deleted', handleEvent);
    };
  }, [socket]);

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const [reqRes, studentsRes, wardensRes] = await Promise.all([
        requestService.getRequests({}),
        userService.getAllUsers({ role: 'student' }),
        userService.getAllUsers({ role: 'warden' })
      ]);

      let studentCount = 0;
      if (studentsRes.success) {
        // @ts-ignore
        const students = studentsRes.data?.users || studentsRes.data || [];
        setAllStudents(students);
        studentCount = students.length;
      }

      let wardenCount = 0;
      if (wardensRes.success) {
        // @ts-ignore
        const wardens = wardensRes.data?.users || wardensRes.data || [];
        wardenCount = wardens.length;
      }

      if (reqRes.success) {
        // @ts-ignore
        const allRequestsData = reqRes.data?.requests || reqRes.data || [];
        setAllRequests(allRequestsData);
        
        const allComplaints = allRequestsData.filter((r: any) => r.category !== 'Emergency' && r.category !== 'Leave' && r.urgency !== 'critical');
        const emergencyReqs = allRequestsData.filter((r: import('../types').Request) => r.category === 'Emergency' || r.urgency === 'critical');
        const leaveReqs = allRequestsData.filter((r: import('../types').Request) => r.category === 'Leave');
        
        setStats({
          totalStudents: studentCount,
          totalWardens: wardenCount,
          totalComplaints: allComplaints.length,
          pendingComplaints: allComplaints.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length,
          resolvedComplaints: allComplaints.filter((r: any) => r.status === 'resolved').length,
          emergencyAlerts: emergencyReqs.length,
          approvedLeaves: leaveReqs.filter((r: any) => r.status === 'resolved').length,
          rejectedLeaves: leaveReqs.filter((r: any) => r.status === 'rejected').length
        });

        const formattedAlerts = emergencyReqs.map((req: import('../types').Request) => {
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
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        toast.error('Failed to load dashboard stats');
      }
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

  // --- Data Preparation for Recharts ---

  // 1. Enterprise Monthly Trends
  const getLast6Months = () => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push(d.toLocaleString('en-US', { month: 'short' }));
    }
    return result;
  };

  const months = getLast6Months();
  const monthlyData = months.map(m => ({ 
    name: m, 
    Total: 0, 
    Resolved: 0, 
    Pending: 0, 
    InProgress: 0, 
    Rejected: 0,
    Students: 0
  }));

  allRequests.forEach(r => {
    const d = new Date(r.createdAt || Date.now());
    const mStr = d.toLocaleString('en-US', { month: 'short' });
    const idx = monthlyData.findIndex(m => m.name === mStr);
    if (idx !== -1) {
      monthlyData[idx].Total++;
      if (r.status === 'resolved') monthlyData[idx].Resolved++;
      else if (r.status === 'pending') monthlyData[idx].Pending++;
      else if (r.status === 'in_progress') monthlyData[idx].InProgress++;
      else if (r.status === 'rejected') monthlyData[idx].Rejected++;
    }
  });

  allStudents.forEach(s => {
    const d = new Date(s.createdAt || Date.now());
    const mStr = d.toLocaleString('en-US', { month: 'short' });
    const idx = monthlyData.findIndex(m => m.name === mStr);
    if (idx !== -1) {
      // Create a cumulative sum logic if required, but for registration per month:
      monthlyData[idx].Students++;
    }
  });

  // Calculate cumulative students for better visualization
  let runningStudentTotal = allStudents.length;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    const registeredThatMonth = monthlyData[i].Students;
    monthlyData[i].Students = runningStudentTotal;
    runningStudentTotal -= registeredThatMonth;
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-indigo-500 mb-1">{stats?.totalStudents || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Students</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-blue-500 mb-1">{stats?.totalWardens || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Wardens</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-slate-700 mb-1">{stats?.totalComplaints || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Complaints</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-yellow-500 mb-1">{stats?.pendingComplaints || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Pending CMP</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-green-500 mb-1">{stats?.resolvedComplaints || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Resolved CMP</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-red-500 mb-1">{stats?.emergencyAlerts || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">SOS Alerts</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-emerald-500 mb-1">{stats?.approvedLeaves || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">App. Leaves</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-extrabold text-rose-500 mb-1">{stats?.rejectedLeaves || 0}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Rej. Leaves</p>
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


        {/* --- ENTERPRISE ANALYTICS DASHBOARD --- */}
        <div className="mt-10 mb-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-200 pb-3">Enterprise Analytics (Last 6 Months)</h2>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  
                  {/* Primary Y-Axis for Complaints */}
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} allowDecimals={false} dx={-10} />
                  
                  {/* Secondary Y-Axis for Students */}
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#8b5cf6', fontWeight: 500 }} allowDecimals={false} dx={10} />
                  
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255, 255, 255, 0.2)', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      padding: '12px 16px'
                    }} 
                    itemStyle={{ fontWeight: 600 }}
                  />
                  
                  <Legend 
                    verticalAlign="top" 
                    height={50} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingBottom: '20px' }} 
                  />
                  
                  {/* Complaint Lines mapping to Left Y-Axis */}
                  <Line yAxisId="left" type="monotone" dataKey="Total" name="Total Complaints" stroke={STATUS_COLORS.total} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.total, strokeWidth: 2 }} />
                  <Line yAxisId="left" type="monotone" dataKey="Resolved" stroke={STATUS_COLORS.resolved} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.resolved, strokeWidth: 2 }} />
                  <Line yAxisId="left" type="monotone" dataKey="Pending" stroke={STATUS_COLORS.pending} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.pending, strokeWidth: 2 }} />
                  <Line yAxisId="left" type="monotone" dataKey="InProgress" name="In Progress" stroke={STATUS_COLORS.inProgress} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.inProgress, strokeWidth: 2 }} />
                  <Line yAxisId="left" type="monotone" dataKey="Rejected" stroke={STATUS_COLORS.rejected} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.rejected, strokeWidth: 2 }} />
                  
                  {/* Students Line mapping to Right Y-Axis */}
                  <Line yAxisId="right" type="monotone" dataKey="Students" name="Total Students" stroke={STATUS_COLORS.students} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: STATUS_COLORS.students, strokeWidth: 2 }} />
                  
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
