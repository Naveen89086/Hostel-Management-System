import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── Leave Requests ─── */
interface LeaveEntry {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending';
}

const initialLeaves: LeaveEntry[] = [
  { id: 1, startDate: '2026-05-12', endDate: '2026-05-16', reason: 'Sick', status: 'Approved' },
  { id: 2, startDate: '2026-05-13', endDate: '2026-05-16', reason: 'fever', status: 'Pending' },
  { id: 3, startDate: '2026-05-10', endDate: '2026-05-15', reason: 'Fever', status: 'Approved' },
  { id: 4, startDate: '2026-04-15', endDate: '2026-04-17', reason: 'sick', status: 'Approved' },
  { id: 5, startDate: '2026-04-09', endDate: '2026-04-15', reason: 'headache', status: 'Approved' },
  { id: 6, startDate: '2026-03-31', endDate: '2026-04-01', reason: 'cold', status: 'Approved' },
  { id: 7, startDate: '2026-03-29', endDate: '2026-03-31', reason: 'sick', status: 'Approved' },
];

/* ─── Complaints ─── */
interface Complaint {
  id: number;
  roomNo: string;
  description: string;
  repeated: boolean;
  category: string;
  priority: string;
  status: 'Pending' | 'Resolved';
}

const initialComplaints: Complaint[] = [
  { id: 1, roomNo: '305', description: 'Fan issue', repeated: true, category: 'Electrical', priority: 'Medium Priority', status: 'Resolved' },
  { id: 2, roomNo: '108', description: 'fan', repeated: true, category: 'Electrical', priority: 'Medium Priority', status: 'Pending' },
  { id: 3, roomNo: '307', description: 'fan issue', repeated: true, category: 'Electrical', priority: 'Medium Priority', status: 'Pending' },
  { id: 4, roomNo: 'r-310', description: 'no proper internet connection', repeated: true, category: 'Internet', priority: 'Medium Priority', status: 'Resolved' },
  { id: 5, roomNo: '305', description: 'Tubelight', repeated: false, category: 'Electrical', priority: 'Low Priority', status: 'Pending' },
  { id: 6, roomNo: '305', description: 'no wifi or internet', repeated: false, category: 'Internet', priority: 'Low Priority', status: 'Pending' },
  { id: 7, roomNo: '108', description: 'room not cleaned', repeated: false, category: 'Plumbing', priority: 'Medium Priority', status: 'Pending' },
];

/* ─── Emergency Alerts ─── */
interface EmergencyAlert {
  id: number;
  time: string;
  location: string;
  status: 'Active' | 'Resolved';
}

const initialAlerts: EmergencyAlert[] = [
  { id: 1, time: '12/05/2026, 13:49:51', location: 'GPS Denied/Unavailable', status: 'Resolved' },
  { id: 2, time: '12/05/2026, 12:56:50', location: 'GPS Denied/Unavailable', status: 'Active' },
  { id: 3, time: '10/05/2026, 21:27:16', location: 'Lat: 17.7239, Lng: 78.2562', status: 'Resolved' },
  { id: 4, time: '10/04/2026, 15:04:04', location: 'Lat: 17.7249, Lng: 78.2555', status: 'Resolved' },
  { id: 5, time: '10/04/2026, 10:34:11', location: 'Lat: 17.7253, Lng: 78.2560', status: 'Resolved' },
  { id: 6, time: '09/04/2026, 23:37:40', location: 'Lat: 17.7239, Lng: 78.2562', status: 'Active' },
  { id: 7, time: '09/04/2026, 23:35:50', location: 'Lat: 17.7239, Lng: 78.2562', status: 'Active' },
];

export const StudentActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveEntry[]>(initialLeaves);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);

  /* ─── Handlers ─── */
  const deleteLeave = (id: number) => {
    setLeaves(leaves.filter(l => l.id !== id));
    toast.success('Leave request deleted.');
  };

  const deleteComplaint = (id: number) => {
    setComplaints(complaints.filter(c => c.id !== id));
    toast.success('Complaint deleted.');
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Emergency alert deleted.');
  };

  const getPriorityColor = (priority: string) => {
    if (priority.toLowerCase().includes('high')) return 'text-red-500';
    if (priority.toLowerCase().includes('medium')) return 'text-amber-500';
    return 'text-green-500';
  };

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

        {/* ════════════════════════════════════════════════════════════
            SECTION 1 — My Leave Requests
           ════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">My Leave Requests</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">START DATE</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">END DATE</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">REASON</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4 text-slate-600 font-medium">{leave.startDate}</td>
                    <td className="py-6 px-4 text-slate-600 font-medium">{leave.endDate}</td>
                    <td className="py-6 px-4 text-slate-600 font-medium">{leave.reason}</td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        leave.status === 'Approved'
                          ? 'bg-green-50 text-green-500 border border-green-200'
                          : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <button onClick={() => deleteLeave(leave.id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leaves.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">No leave requests found.</div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2 — My Complaints
           ════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">My Complaints</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">ROOM NO.</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">DESCRIPTION</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">CATEGORY</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4 font-semibold text-slate-800">{c.roomNo}</td>
                    <td className="py-6 px-4">
                      <div className="font-medium text-slate-700">{c.description}</div>
                      {c.repeated && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" /> Repeated
                        </span>
                      )}
                    </td>
                    <td className="py-6 px-4">
                      <div className="font-bold text-slate-800">{c.category}</div>
                      <span className={`text-xs font-semibold ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        c.status === 'Resolved'
                          ? 'bg-green-50 text-green-500 border border-green-200'
                          : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <button onClick={() => deleteComplaint(c.id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
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

        {/* ════════════════════════════════════════════════════════════
            SECTION 3 — My Emergency Alerts
           ════════════════════════════════════════════════════════════ */}
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
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-4 text-slate-600 font-medium">{alert.time}</td>
                      <td className="py-6 px-4 text-slate-600 font-medium">{alert.location}</td>
                      <td className="py-6 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          alert.status === 'Resolved'
                            ? 'bg-green-50 text-green-500 border border-green-200'
                            : 'bg-red-50 text-red-500 border border-red-200'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <button onClick={() => deleteAlert(alert.id)} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
