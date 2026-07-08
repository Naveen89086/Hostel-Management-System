import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Folder, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import * as requestService from '../services/request.service';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
  total: '#3B82F6',
  resolved: '#22C55E',
  pending: '#EAB308',
  inProgress: '#F97316',
  rejected: '#EF4444'
};

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, emergency: 0 });
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => fetchStats(false);
    socket.on('request:created', handleEvent);
    socket.on('request:updated', handleEvent);
    return () => {
      socket.off('request:created', handleEvent);
      socket.off('request:updated', handleEvent);
    };
  }, [socket]);

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await requestService.getRequests({});
      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        setAllRequests(all);
        setStats({
          total: all.length,
          pending: all.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length,
          resolved: all.filter((r: any) => r.status === 'resolved').length,
          emergency: all.filter((r: any) => r.category === 'Emergency' || r.urgency === 'critical').length,
        });
      }
    } catch {
      // Ignore API fail silently 
    } finally {
      setIsLoading(false);
    }
  };

  // --- Dynamic Chart Calculation ---
  const getLast6Months = () => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push(d.toLocaleString('en-US', { month: 'short' }));
    }
    return result;
  };

  const monthsKeys = getLast6Months();
  const monthlyData = monthsKeys.map(m => ({ 
    name: m, 
    Total: 0, 
    Resolved: 0, 
    Pending: 0, 
    InProgress: 0, 
    Rejected: 0 
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

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs mr-3">ST</div>
            <span className="text-sm font-semibold text-slate-700 pr-2">student</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Complaints */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Folder className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Total Complaints</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.total}</h3>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Pending</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.pending}</h3>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Resolved</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.resolved}</h3>
            </div>
          </div>

          {/* Emergency Alerts */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Emergency Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.emergency}</h3>
            </div>
          </div>
        </div>

        {/* Complaint Trends Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-200 pb-3">My Complaint Analytics (Last 6 Months)</h2>
          
          <div className="w-full">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} allowDecimals={false} dx={-10} />
                
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
                
                <Line type="monotone" dataKey="Total" stroke={COLORS.total} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: COLORS.total, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Resolved" stroke={COLORS.resolved} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: COLORS.resolved, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Pending" stroke={COLORS.pending} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: COLORS.pending, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="InProgress" name="In Progress" stroke={COLORS.inProgress} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: COLORS.inProgress, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Rejected" stroke={COLORS.rejected} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: COLORS.rejected, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
