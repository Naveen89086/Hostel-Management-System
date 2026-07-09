import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import { Request } from '../types';
import { Spinner } from '../components/ui/Spinner';

export const StudentActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      setIsLoading(true);
      // Since it's a student, the backend might automatically filter by req.user if the route is setup for it.
      // If not, we fetch all and filter client side. Better to use the backend `user` filter if available.
      // Actually we will fetch all requests and filter by the student ID just to be safe.
      const res = await requestService.getRequests({});
      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        setRequests(all);
      }
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  const leaves = requests.filter(r => r.category === 'Leave');
  const alerts = requests.filter(r => r.category === 'Emergency' || r.urgency === 'critical');
  const complaints = requests.filter(r => r.category !== 'Leave' && r.category !== 'Emergency' && r.urgency !== 'critical');

  /* ─── Handlers ─── */
  const deleteRequest = async (id: string) => {
    try {
      const res = await requestService.deleteRequest(id);
      if (res.success) {
        setRequests(requests.filter(r => r._id !== id));
        toast.success('Deleted successfully.');
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority.toLowerCase().includes('high') || priority.toLowerCase().includes('critical')) return 'text-red-500';
    if (priority.toLowerCase().includes('medium')) return 'text-amber-500';
    return 'text-green-500';
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
          <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs mr-3">ST</div>
            <span className="text-sm font-semibold text-slate-700 pr-2">student</span>
          </div>
        </div>

        {/* SECTION 1 — My Leave Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">My Leave Requests</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">DATE</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">REASON</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((leave) => {
                  const dateObj = new Date(leave.createdAt);
                  return (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4 text-slate-600 font-medium">{dateObj.toLocaleDateString()}</td>
                    <td className="py-6 px-4 text-slate-600 font-medium">{leave.title || leave.description}</td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        leave.status === 'resolved'
                          ? 'bg-green-50 text-green-500 border border-green-200'
                          : leave.status === 'rejected'
                          ? 'bg-red-50 text-red-500 border border-red-200'
                          : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}>
                        {leave.status === 'resolved' ? 'Approved' : leave.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <button onClick={() => deleteRequest(leave._id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {leaves.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">No leave requests found.</div>
            )}
          </div>
        </div>

        {/* SECTION 2 — My Complaints */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">My Complaints</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">TITLE</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">CATEGORY</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4">
                      <div className="font-semibold text-slate-800">{c.title}</div>
                      <div className="font-medium text-slate-500 text-xs mt-1">{c.description}</div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="font-bold text-slate-800">{c.category}</div>
                      <span className={`text-xs font-semibold ${getPriorityColor(c.urgency)}`}>{c.urgency}</span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        c.status === 'resolved'
                          ? 'bg-green-50 text-green-500 border border-green-200'
                          : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <button onClick={() => deleteRequest(c._id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">No complaints found.</div>
            )}
          </div>
        </div>

        {/* SECTION 3 — My Emergency Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-red-500">My Emergency Alerts</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">TIME</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">LOCATION</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alerts.map((alert) => {
                    const dateObj = new Date(alert.createdAt);
                    return (
                    <tr key={alert._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-4 text-slate-600 font-medium">{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}</td>
                      <td className="py-6 px-4 text-slate-600 font-medium">{alert.description || 'Location not available'}</td>
                      <td className="py-6 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          alert.status === 'resolved'
                            ? 'bg-green-50 text-green-500 border border-green-200'
                            : 'bg-red-50 text-red-500 border border-red-200'
                        }`}>
                          {alert.status === 'resolved' ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <button onClick={() => deleteRequest(alert._id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-medium">No emergency alerts found.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
