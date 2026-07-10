import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Spinner } from '../components/ui/Spinner';
import { Folder, Clock, CheckCircle, Building, ClipboardList, Check, Eye, X, AlertTriangle } from 'lucide-react';
import * as requestService from '../services/request.service';
import { Request, User } from '../types';
import { toast } from 'react-hot-toast';
import { DynamicDashboardChart } from '../components/ui/DynamicDashboardChart';

import * as userService from '../services/user.service';

const STATUS_COLORS = {
  total: '#3B82F6',
  resolved: '#22C55E',
  pending: '#EAB308',
  inProgress: '#F97316',
  rejected: '#EF4444'
};

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const WardenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  console.log('--- RENDERING WARDEN DASHBOARD PAGE --- Pathname:', location.pathname);
  const [isLoading, setIsLoading] = useState(true);
  const [allComplaints, setAllComplaints] = useState<Request[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');
  const [selectedComplaint, setSelectedComplaint] = useState<Request | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleEvent = () => fetchData(false);
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

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [res, usersRes] = await Promise.all([
        requestService.getRequests({}),
        userService.getAllUsers({ role: 'student' })
      ]);
      
      if (usersRes.success) {
        // @ts-ignore
        setAllStudents(usersRes.data?.users || usersRes.data || []);
      }

      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        setAllComplaints(all);
        setStats({
          total: all.length,
          pending: all.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length,
          resolved: all.filter((r: any) => r.status === 'resolved').length,
        });
      }
    } catch {
      setStats({ total: 8, pending: 6, resolved: 2 });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter complaints by block
  const blockComplaints = allComplaints.filter((c) => {
    const userBlock = (typeof c.user === 'object' && c.user !== null) ? c.user.block : undefined;
    const room = (typeof c.user === 'object' && c.user !== null) ? (c.user.roomNumber || '') : (c.roomNumber || '');
    
    // If no block and no recognizable room, show in all views so it's not lost
    if (!userBlock && (!room || room === 'Not Assigned' || room === '-')) return true;

    // Fallback to room prefix if block is undefined
    const blockMatch = userBlock ? userBlock === selectedBlock : room.startsWith(selectedBlock);
    return blockMatch;
  });

  const handleResolve = async (id: string) => {
    try {
      const res = await requestService.updateRequest(id, { status: 'resolved' });
      if (res.success) {
        setAllComplaints(allComplaints.map(c => c._id === id ? { ...c, status: 'resolved' as const } : c));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, resolved: prev.resolved + 1 }));
        toast.success('Problem Solved.', {
          style: {
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: '0',
            borderRadius: '0'
          }
        });
      }
    } catch {
      toast.error('Failed to resolve complaint');
    }
  };

  const getAuthorName = (c: Request) => {
    if (typeof c.user === 'object' && c.user !== null) return (c.user as User).name;
    return 'Unknown';
  };

  const getCategoryLabel = (c: Request) => c.category || c.type?.replace('_', ' ') || 'General';

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-800">Warden Dashboard</h1>
          <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs mr-3">WA</div>
            <span className="text-sm font-semibold text-slate-700 pr-2">warden</span>
          </div>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Folder className="h-7 w-7" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Complaints</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><Clock className="h-7 w-7" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.pending}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0"><CheckCircle className="h-7 w-7" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Resolved</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.resolved}</h3>
            </div>
          </div>
        </div>



        {/* --- ENTERPRISE ANALYTICS DASHBOARD --- */}
        <div className="mt-10 mb-6">
          <DynamicDashboardChart requests={allComplaints} />
        </div>

      </div>

      {/* Complaint Detail Popup */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Number</label>
                  <p className="text-base font-semibold text-slate-800 mt-1">{selectedComplaint.roomNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedComplaint.status === 'resolved' ? 'bg-green-50 text-green-600' : selectedComplaint.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {selectedComplaint.status === 'in_progress' ? 'Pending' : (selectedComplaint.status ? selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1) : 'Unknown')}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                <p className="text-base font-semibold text-slate-800 mt-1">{selectedComplaint.title}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedComplaint.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">{getCategoryLabel(selectedComplaint)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                  <p className={`text-sm font-semibold mt-1 capitalize ${getPriorityColor(selectedComplaint.urgency)}`}>{selectedComplaint.urgency}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted By</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{getAuthorName(selectedComplaint)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(selectedComplaint.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
              {(selectedComplaint.status === 'pending' || selectedComplaint.status === 'in_progress') && (
                <button onClick={() => { handleResolve(selectedComplaint._id); setSelectedComplaint(null); }} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" /> Mark Resolved
                </button>
              )}
              <button onClick={() => setSelectedComplaint(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
