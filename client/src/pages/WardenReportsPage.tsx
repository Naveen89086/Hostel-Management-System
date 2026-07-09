import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { ClipboardList, Download, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import { Spinner } from '../components/ui/Spinner';
import ExcelJS from 'exceljs';



const generatedDate = new Date().toLocaleString('en-GB', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(',', ',');

export const WardenReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [pendingComplaints, setPendingComplaints] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => fetchData(false);
    socket.on('request:created', handleEvent);
    socket.on('request:updated', handleEvent);
    return () => {
      socket.off('request:created', handleEvent);
      socket.off('request:updated', handleEvent);
    };
  }, [socket]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await requestService.getRequests({});
      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        
        const pending = all.filter((r: any) => 
          (r.status === 'pending' || r.status === 'in_progress') && 
          r.category !== 'Emergency' && r.category !== 'Leave'
        ).map((c: any) => ({
          room: c.roomNumber || '-',
          student: typeof c.user === 'object' && c.user ? c.user.name : 'Unknown',
          category: c.category || c.type || 'general',
          title: c.title
        }));

        const alerts = all.filter((r: any) => 
          (r.category === 'Emergency' || r.urgency === 'critical') && 
          r.status !== 'resolved'
        ).map((a: any) => {
          const dateObj = new Date(a.createdAt);
          const formattedTime = `${dateObj.toLocaleDateString('en-GB')}, ${dateObj.toLocaleTimeString('en-GB')}`;
          return {
            location: a.description || 'GPS Denied/Unavailable',
            student: typeof a.user === 'object' && a.user ? a.user.name : 'Unknown',
            time: formattedTime
          };
        });

        setPendingComplaints(pending);
        setActiveAlerts(alerts);
      }
    } catch {
      toast.error('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Warden Shift Report');

      sheet.addRow(['WARDEN SHIFT REPORT']);
      sheet.addRow([`Generated on ${generatedDate}`]);
      sheet.addRow([]);
      sheet.addRow([`Pending Complaints: ${pendingComplaints.length}`]);
      sheet.addRow([`Emergency Alerts: ${activeAlerts.length}`]);
      sheet.addRow([]);

      sheet.addRow(['PENDING COMPLAINTS DETAILS']);
      const complaintHeaders = sheet.addRow(['Room', 'Student', 'Category', 'Title']);
      complaintHeaders.font = { bold: true };
      
      pendingComplaints.forEach(c => {
        sheet.addRow([c.room, c.student, c.category, c.title]);
      });

      sheet.addRow([]);
      
      sheet.addRow(['ACTIVE EMERGENCY ALERTS']);
      const alertsHeaders = sheet.addRow(['Location', 'Student', 'Time']);
      alertsHeaders.font = { bold: true };

      activeAlerts.forEach(a => {
        sheet.addRow([a.location, a.student, a.time]);
      });

      sheet.columns.forEach((column) => {
        let maxColumnLength = 0;
        column?.eachCell?.({ includeEmpty: true }, (cell: any) => {
          let columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > 50) columnLength = 50; 
          if (columnLength > maxColumnLength) {
            maxColumnLength = columnLength;
          }
        });
        column.width = maxColumnLength < 15 ? 15 : maxColumnLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `warden_shift_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel report');
    }
  };

  if (user?.role !== 'warden' && user?.role !== 'admin') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied.</div>;
  }

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center bg-slate-50"><Spinner size="lg" className="text-blue-500" /></div>;
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
