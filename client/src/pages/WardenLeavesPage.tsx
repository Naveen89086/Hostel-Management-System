import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import { Request, User } from '../types';
import { Spinner } from '../components/ui/Spinner';

interface LeaveRequest {
  id: string;
  studentName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  block: 'A' | 'B';
}

export const WardenLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await requestService.getRequests({});
      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        // Filter for Leave requests
        const leaveReqs = all.filter((r: import('../types').Request) => r.category === 'Leave');
        
        const mappedLeaves: LeaveRequest[] = leaveReqs.map((req: import('../types').Request) => {
          // Parse description which we formatted as "startDate|endDate|reason"
          const parts = req.description ? req.description.split('|') : [];
          const startDate = parts[0] || '-';
          const endDate = parts[1] || '-';
          const reason = parts[2] || req.description;
          
          let statusStr = 'Awaiting Parent';
          if (req.status === 'resolved') statusStr = 'Approved';
          if (req.status === 'rejected') statusStr = 'Rejected';

          const student = req.user as User;
          let block: 'A' | 'B' = 'A';
          if (student && student.roomNumber) {
            if (student.roomNumber.startsWith('B') || student.roomNumber.startsWith('2') || student.roomNumber.startsWith('5')) {
              block = 'B';
            }
          }

          return {
            id: req._id,
            studentName: student?.name || 'Unknown',
            startDate,
            endDate,
            reason,
            status: statusStr,
            block
          };
        });

        // Add some mock data just for visual demonstration if database is empty
        if (mappedLeaves.length === 0) {
          mappedLeaves.push(
            {
              id: 'mock1',
              studentName: 'sruthika gunjnoor',
              startDate: '2026-05-12',
              endDate: '2026-05-23',
              reason: 'Sick',
              status: 'Awaiting Parent',
              block: 'A'
            },
            {
              id: 'mock2',
              studentName: 'sruthika gunjnoor',
              startDate: '2026-05-13',
              endDate: '2026-05-16',
              reason: 'fever',
              status: 'Awaiting Parent',
              block: 'B'
            }
          );
        }

        setLeaves(mappedLeaves);
      }
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (id.startsWith('mock')) {
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
      toast.success('Leave request approved.');
      return;
    }

    try {
      const res = await requestService.updateRequest(id, { status: 'resolved' });
      if (res.success) {
        setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
        toast.success('Leave request approved.');
      }
    } catch {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    if (id.startsWith('mock')) {
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
      toast.success('Leave request rejected.');
      return;
    }

    try {
      const res = await requestService.updateRequest(id, { status: 'rejected' });
      if (res.success) {
        setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
        toast.success('Leave request rejected.');
      }
    } catch {
      toast.error('Failed to reject leave');
    }
  };

  if (user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Wardens only.</div>;
  }

  const filteredLeaves = leaves.filter(l => l.block === selectedBlock);

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

        {/* Block Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 mr-2">Select Block:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="blockLeaves" 
                value="A" 
                checked={selectedBlock === 'A'} 
                onChange={() => setSelectedBlock('A')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
              />
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Block A</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="blockLeaves" 
                value="B" 
                checked={selectedBlock === 'B'} 
                onChange={() => setSelectedBlock('B')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
              />
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Block B</span>
            </label>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Pending Leave Requests</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">STUDENT NAME</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">START DATE</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">END DATE</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">REASON</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">STATUS</th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-4 font-semibold text-slate-800">{leave.studentName}</td>
                      <td className="py-6 px-4 text-slate-600 font-medium">{leave.startDate}</td>
                      <td className="py-6 px-4 text-slate-600 font-medium">{leave.endDate}</td>
                      <td className="py-6 px-4 text-slate-600 font-medium">{leave.reason}</td>
                      <td className="py-6 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          leave.status === 'Awaiting Parent' || leave.status === 'Pending'
                            ? 'bg-[#eab308] text-white shadow-sm' 
                            : leave.status === 'Approved' 
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-red-500 text-white shadow-sm'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex flex-col items-center justify-center gap-2">
                          {leave.status === 'Awaiting Parent' || leave.status === 'Pending' ? (
                            <>
                              <button 
                                onClick={() => handleApprove(leave.id)}
                                className="bg-[#6366f1] hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(leave.id)}
                                className="flex items-center justify-center h-6 w-8 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors"
                              >
                                <X className="h-4 w-4 stroke-[3]" />
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 font-medium text-xs">Action Taken</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeaves.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-medium">
                  No leave requests found for this block.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
