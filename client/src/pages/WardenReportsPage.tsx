import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList, Download, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data matching the reference image
const pendingComplaints = [
  { room: 'Rm 308', student: 'sruthika gunjnoor', category: 'electrical', title: 'fan' },
  { room: 'Rm 308', student: 'sruthika gunjnoor', category: 'electrical', title: 'fan issue' },
  { room: 'Rm 308', student: 'sruthika gunjnoor', category: 'electrical', title: 'Tubelight' },
  { room: 'Rm 308', student: 'sruthika gunjnoor', category: 'internet', title: 'no wifi or internet' },
  { room: 'Rm 308', student: 'sruthika gunjnoor', category: 'plumbing', title: 'room not cleaned' },
];

const activeAlerts = [
  { location: 'GPS Denied/Unavailable', student: 'sruthika gunjnoor', time: '12/05/2026, 12:56:50' },
  { location: 'Lat: 17.7239, Lng: 78.2562', student: 'sruthika gunjnoor', time: '09/04/2026, 23:37:40' },
  { location: 'Lat: 17.7239, Lng: 78.2562', student: 'sruthika gunjnoor', time: '09/04/2026, 23:35:50' },
];

const generatedDate = new Date().toLocaleString('en-GB', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(',', ',');

export const WardenReportsPage: React.FC = () => {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Build CSV content from the report data
    let csv = 'WARDEN SHIFT REPORT\n';
    csv += `Generated on ${generatedDate}\n\n`;
    csv += `Pending Complaints: ${pendingComplaints.length}\n`;
    csv += `Emergency Alerts: ${activeAlerts.length}\n\n`;

    csv += 'PENDING COMPLAINTS DETAILS\n';
    csv += 'Room,Student,Category,Title\n';
    pendingComplaints.forEach(c => {
      csv += `${c.room},${c.student},${c.category},${c.title}\n`;
    });

    csv += '\nACTIVE EMERGENCY ALERTS\n';
    csv += 'Location,Student,Time\n';
    activeAlerts.forEach(a => {
      csv += `"${a.location}",${a.student},${a.time}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warden_shift_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  if (user?.role !== 'warden' && user?.role !== 'admin') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-800">Hostel Reports</h1>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {/* Report Card */}
        <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10 space-y-8">

          {/* Report Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Warden Shift Report</h2>
            <p className="text-sm text-slate-500">Generated on {generatedDate}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl px-6 py-5">
              <p className="text-sm text-slate-500 font-medium mb-1">Pending Complaints</p>
              <p className="text-3xl font-extrabold text-slate-800">{pendingComplaints.length}</p>
            </div>
            <div className="border border-slate-200 rounded-xl px-6 py-5">
              <p className="text-sm text-slate-500 font-medium mb-1">Emergency Alerts</p>
              <p className="text-3xl font-extrabold text-slate-800">{activeAlerts.length}</p>
            </div>
          </div>

          {/* Pending Complaints Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Complaints Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">ROOM</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">STUDENT</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">CATEGORY</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">TITLE</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingComplaints.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-slate-600 font-medium">{c.room}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{c.student}</td>
                      <td className="py-4 px-4 text-slate-600">{c.category}</td>
                      <td className="py-4 px-4 text-slate-600">{c.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Emergency Alerts */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Active Emergency Alerts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">LOCATION</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">STUDENT</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAlerts.map((a, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-slate-600 font-medium">{a.location}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{a.student}</td>
                      <td className="py-4 px-4 text-slate-600">{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
