import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { Folder, Clock, CheckCircle, Building, ClipboardList, Check, Eye, X, AlertTriangle } from 'lucide-react';
import * as requestService from '../services/request.service';
import { Request, User } from '../types';
import { toast } from 'react-hot-toast';

export const WardenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [allComplaints, setAllComplaints] = useState<Request[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');
  const [selectedComplaint, setSelectedComplaint] = useState<Request | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await requestService.getRequests({});
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
    const room = c.roomNumber || '';
    if (selectedBlock === 'A') {
      return room.startsWith('A') || room.startsWith('1') || room.startsWith('3') || (!room.startsWith('B'));
    } else {
      return room.startsWith('B') || room.startsWith('2') || room.startsWith('5');
    }
  });

  const handleResolve = async (id: string) => {
    try {
      const res = await requestService.updateRequest(id, { status: 'resolved' });
      if (res.success) {
        setAllComplaints(allComplaints.map(c => c._id === id ? { ...c, status: 'resolved' as const } : c));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, resolved: prev.resolved + 1 }));
        toast.success('Complaint resolved!');
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

  // Chart data (mock for visual match)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const submittedData = [12, 19, 15, 14, 9, 22];
  const resolvedData = [10, 15, 14, 13, 8, 18];
  const maxVal = 25;
  const chartHeight = 200;
  const chartWidth = 500;
  const stepX = chartWidth / (months.length - 1);

  const toPoint = (values: number[], i: number) => {
    const x = 40 + i * stepX;
    const y = chartHeight - (values[i] / maxVal) * (chartHeight - 30) + 10;
    return { x, y };
  };

  const makePath = (values: number[]) => {
    return values.map((_, i) => {
      const { x, y } = toPoint(values, i);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const makeAreaPath = (values: number[]) => {
    const line = makePath(values);
    const lastPt = toPoint(values, values.length - 1);
    const firstPt = toPoint(values, 0);
    return `${line} L ${lastPt.x} ${chartHeight} L ${firstPt.x} ${chartHeight} Z`;
  };

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

        {/* Block Selector */}
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600 mr-2">Select Block:</span>
          <button
            onClick={() => setSelectedBlock('A')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'A' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >Block A</button>
          <button
            onClick={() => setSelectedBlock('B')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'B' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >Block B</button>
        </div>

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-800">
              <ClipboardList className="h-6 w-6" />
              <h2 className="text-lg font-extrabold">Recent Complaints — Block {selectedBlock}</h2>
            </div>
          </div>

          {blockComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Room No.</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Description</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Priority</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                    <th className="px-6 sm:px-8 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {blockComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 sm:px-8 py-5 font-medium">{c.roomNumber || '-'}</td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">By: {getAuthorName(c)}</div>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" /> Repeated
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="font-bold text-slate-800 capitalize">{getCategoryLabel(c)}</div>
                        <span className={`text-xs font-semibold capitalize ${getPriorityColor(c.urgency)}`}>{c.urgency} Priority</span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'resolved' ? 'bg-green-50 text-green-600'
                            : c.status === 'rejected' ? 'bg-red-50 text-red-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {c.status === 'in_progress' ? 'Pending' : (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Unknown')}
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {(c.status === 'pending' || c.status === 'in_progress') && (
                            <button onClick={() => handleResolve(c._id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Resolved">
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button onClick={() => setSelectedComplaint(c)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">No complaints in Block {selectedBlock}.</p>
            </div>
          )}
        </div>

        {/* Complaint Trends Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Complaint Trends</h2>
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-slate-500 font-medium">Complaints Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-slate-500 font-medium">Complaints Resolved</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth + 80} ${chartHeight + 40}`} className="w-full max-w-2xl h-auto" style={{ minWidth: '400px' }}>
              {[0, 5, 10, 15, 20, 25].map((val) => {
                const y = chartHeight - (val / maxVal) * (chartHeight - 30) + 10;
                return (
                  <g key={val}>
                    <text x="28" y={y + 4} textAnchor="end" className="text-xs fill-slate-400" fontSize="11">{val}</text>
                    <line x1="40" y1={y} x2={chartWidth + 40} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                  </g>
                );
              })}
              <path d={makeAreaPath(submittedData)} fill="url(#blueGradDash)" opacity="0.15" />
              <path d={makePath(submittedData)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={makePath(resolvedData)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {submittedData.map((_, i) => { const { x, y } = toPoint(submittedData, i); return <circle key={`s${i}`} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />; })}
              {resolvedData.map((_, i) => { const { x, y } = toPoint(resolvedData, i); return <circle key={`r${i}`} cx={x} cy={y} r="4" fill="#22c55e" stroke="white" strokeWidth="2" />; })}
              {months.map((m, i) => { const { x } = toPoint(submittedData, i); return <text key={m} x={x} y={chartHeight + 25} textAnchor="middle" className="text-xs fill-slate-400" fontSize="11">{m}</text>; })}
              <defs>
                <linearGradient id="blueGradDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
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
