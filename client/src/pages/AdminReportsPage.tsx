import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import ExcelJS from 'exceljs';
import { FileText, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import * as userService from '../services/user.service';
import { Spinner } from '../components/ui/Spinner';

export const AdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [systemComplaints, setSystemComplaints] = useState<any[]>([]);
  const [alertsAndLeaves, setAlertsAndLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generatedDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(',', ',');

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
      const [requestsRes, usersRes] = await Promise.all([
        requestService.getRequests({}),
        userService.getAllUsers({ role: 'student' })
      ]);
      
      if (usersRes.success) {
        // @ts-ignore
        const users = usersRes.data?.users || usersRes.data || [];
        setTotalStudents(users.length);
      }

      if (requestsRes.success) {
        // @ts-ignore
        const all = requestsRes.data?.requests || requestsRes.data || [];
        
        const complaints = all.filter((r: any) => 
          r.category !== 'Emergency' && r.category !== 'Leave'
        ).map((c: any) => ({
          student: typeof c.user === 'object' && c.user ? c.user.name : 'Unknown',
          room: c.roomNumber || '-',
          category: c.category || c.type || 'general',
          title: c.title,
          status: c.status === 'in_progress' ? 'Pending' : (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Unknown')
        }));

        const alertsLeaves = all.filter((r: any) => 
          r.category === 'Emergency' || r.urgency === 'critical' || r.category === 'Leave'
        ).map((a: any) => {
          let type = 'Emergency';
          if (a.category === 'Leave') type = 'Leave';
          
          let details = a.description || '';
          if (type === 'Leave' && details.includes('|')) {
            const parts = details.split('|');
            details = `${parts[0]} to ${parts[1]} - ${parts[2]}`;
          } else if (type === 'Emergency' && !details) {
            details = 'GPS Denied/Unavailable';
          }

          let status = 'Active';
          if (a.status === 'resolved') {
            status = type === 'Leave' ? 'Approved' : 'Resolved';
          } else if (a.status === 'rejected') {
            status = 'Rejected';
          } else if (type === 'Leave') {
            status = 'Pending';
          }

          return {
            type,
            student: typeof a.user === 'object' && a.user ? a.user.name : 'Unknown',
            details: details,
            status: status
          };
        });

        setSystemComplaints(complaints);
        setAlertsAndLeaves(alertsLeaves);
      }
    } catch {
      toast.error('Failed to load system reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('System Report');

      sheet.addRow(['SMARTHOSTEL OFFICIAL SYSTEM REPORT']);
      sheet.addRow([`Generated on ${generatedDate}`]);
      sheet.addRow([]);
      sheet.addRow([`Total Students: ${totalStudents}`]);
      sheet.addRow([`Total Complaints: ${systemComplaints.length}`]);
      sheet.addRow([]);

      sheet.addRow(['ALL SYSTEM COMPLAINTS']);
      const complaintHeaders = sheet.addRow(['Student', 'Room', 'Category', 'Title', 'Status']);
      complaintHeaders.font = { bold: true };
      
      systemComplaints.forEach(c => {
        sheet.addRow([c.student, c.room, c.category, c.title, c.status]);
      });

      sheet.addRow([]);
      
      sheet.addRow(['RECENT ALERTS & LEAVES']);
      const alertsHeaders = sheet.addRow(['Type', 'Student', 'Details', 'Status']);
      alertsHeaders.font = { bold: true };

      alertsAndLeaves.forEach(a => {
        sheet.addRow([a.type, a.student, a.details, a.status]);
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
      link.download = `smarthostel_system_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel report');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins only.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
          <h1 className="text-2xl font-bold text-slate-800">Administrator Dashboard</h1>
          <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs mr-3">AD</div>
            <span className="text-sm font-semibold text-slate-700 pr-2">admin</span>
          </div>
        </div>

        {/* Report Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10" ref={reportRef}>
          
          <div className="flex justify-between items-center mb-8 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-800">System Reports</h2>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md print:hidden"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>

          <div className="text-center space-y-2 mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900">SmartHostel Official Report</h1>
            <p className="text-sm text-slate-500">Generated on {generatedDate}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12 print:hidden"><Spinner size="lg" className="text-blue-500" /></div>
          ) : (
            <div className="space-y-10">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">Total Students</p>
                  <p className="text-3xl font-extrabold text-slate-900">{totalStudents}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">Total Complaints</p>
                  <p className="text-3xl font-extrabold text-slate-900">{systemComplaints.length}</p>
                </div>
              </div>

              {/* All System Complaints */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">All System Complaints</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">STUDENT</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">ROOM</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">CATEGORY</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">TITLE</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemComplaints.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800">{c.student}</td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{c.room}</td>
                          <td className="py-4 px-4 text-slate-600 font-medium capitalize">{c.category}</td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{c.title}</td>
                          <td className="py-4 px-4 font-bold text-slate-700">{c.status}</td>
                        </tr>
                      ))}
                      {systemComplaints.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500">No complaints found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Alerts & Leaves */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Alerts & Leaves</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">TYPE</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">STUDENT</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">DETAILS</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 tracking-wider uppercase">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alertsAndLeaves.map((a, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800">{a.type}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{a.student}</td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{a.details}</td>
                          <td className="py-4 px-4 font-bold text-slate-700">{a.status}</td>
                        </tr>
                      ))}
                      {alertsAndLeaves.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-slate-500">No alerts or leaves found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
