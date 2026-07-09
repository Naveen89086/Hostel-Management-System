import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Spinner } from '../components/ui/Spinner';
import * as requestService from '../services/request.service';
import { Request, User } from '../types';
import { toast } from 'react-hot-toast';
import { ClipboardList, Filter, Check, Eye, X, Building, AlertTriangle } from 'lucide-react';

export const WardenComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [complaints, setComplaints] = useState<Request[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRoom, setSearchRoom] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');

  // Detail popup state
  const [selectedComplaint, setSelectedComplaint] = useState<Request | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => fetchComplaints();
    socket.on('request:created', handleEvent);
    socket.on('request:updated', handleEvent);
    return () => {
      socket.off('request:created', handleEvent);
      socket.off('request:updated', handleEvent);
    };
  }, [socket]);

  useEffect(() => {
    filterByBlock();
  }, [selectedBlock, complaints]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await requestService.getRequests({});
      if (res.success) {
        // @ts-ignore
        const all = res.data?.requests || res.data || [];
        const complaintsOnly = all.filter((r: import('../types').Request) => r.category !== 'Leave' && r.category !== 'Emergency' && r.urgency !== 'critical');
        setComplaints(complaintsOnly);
      }
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const getNormalizedBlockAndRoom = (c: Request) => {
    const u = typeof c.user === 'object' ? (c.user as User) : null;
    let block = u?.block || '';
    let room = u?.roomNumber || c.roomNumber || '-';

    if (room === '-' || room === 'Not Assigned') {
      return { block, room };
    }

    // Extract block from room if it exists (e.g. "B-102" -> block "B", room "102")
    if (room.includes('-')) {
      const parts = room.split('-');
      if (!block) block = parts[0];
      room = parts[1];
    } else if (/^[a-zA-Z]/.test(room)) {
      // e.g. "A101" -> block "A", room "101"
      if (!block) block = room.charAt(0).toUpperCase();
      room = room.substring(1).replace(/^[-\s]+/, '');
    }

    return { block, room };
  };

  const filterByBlock = () => {
    const blockFiltered = complaints.filter((c) => {
      const { block, room } = getNormalizedBlockAndRoom(c);
      
      // If student has no block and no room, show their complaint in all blocks so it doesn't get lost
      if (!block && (room === '-' || room === 'Not Assigned')) return true;

      // Also if block is completely unknown, we shouldn't hide it
      if (!block && room) {
        // Fallback: If no block is known but there is a room number, 
        // we can try to guess or just show it in all to avoid losing it.
        return true; 
      }

      return block === selectedBlock;
    });
    setFilteredComplaints(blockFiltered);
  };

  const handleFilter = () => {
    if (!searchRoom.trim()) {
      filterByBlock();
      return;
    }
    const results = complaints.filter((c) =>
      (c.roomNumber || '').toLowerCase().includes(searchRoom.toLowerCase())
    );
    setFilteredComplaints(results);
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await requestService.updateRequest(id, { status: 'resolved' });
      if (res.success) {
        setComplaints(complaints.map(c => c._id === id ? { ...c, status: 'resolved' as const } : c));
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
    if (typeof c.user === 'object' && c.user !== null) {
      return (c.user as User).name;
    }
    return 'Unknown';
  };

  const getCategoryLabel = (c: Request) => {
    return c.category || c.type?.replace('_', ' ') || 'General';
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getRoomDisplay = (c: Request) => {
    const { block, room } = getNormalizedBlockAndRoom(c);
    if (room === '-' || room === 'Not Assigned') return room;
    if (block) return `${block}-${room}`;
    return room;
  };

  if (user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Wardens only.</div>;
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

        {/* Block Selector */}
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600 mr-2">Select Block:</span>
          <button
            onClick={() => { setSelectedBlock('A'); setSearchRoom(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'A' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >Block A</button>
          <button
            onClick={() => { setSelectedBlock('B'); setSearchRoom(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              selectedBlock === 'B' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >Block B</button>
        </div>

        {/* Complaints Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Card Header */}
          <div className="p-6 sm:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-800">
              <ClipboardList className="h-6 w-6" />
              <h2 className="text-lg font-extrabold">Recent Complaints</h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
              <button
                onClick={handleFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
          ) : filteredComplaints.length > 0 ? (
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
                  {filteredComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 sm:px-8 py-5 font-medium">{getRoomDisplay(c)}</td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">By: {getAuthorName(c)}</div>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" /> Repeated
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="font-bold text-slate-800 capitalize">{getCategoryLabel(c)}</div>
                        <span className={`text-xs font-semibold capitalize ${getPriorityColor(c.urgency)}`}>
                          {c.urgency} Priority
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'resolved'
                            ? 'bg-green-50 text-green-600'
                            : c.status === 'rejected'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {c.status === 'in_progress' ? 'Pending' : (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Unknown')}
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {(c.status === 'pending' || c.status === 'in_progress') && (
                            <button
                              onClick={() => handleResolve(c._id)}
                              className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Resolved"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
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
              <p className="font-medium text-slate-500">No complaints found{searchRoom ? ` for room "${searchRoom}"` : ` in Block ${selectedBlock}`}.</p>
            </div>
          )}
        </div>

      </div>

      {/* Complaint Detail Popup */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Number</label>
                  <p className="text-base font-semibold text-slate-800 mt-1">{getRoomDisplay(selectedComplaint)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedComplaint.status === 'resolved' ? 'bg-green-50 text-green-600'
                        : selectedComplaint.status === 'rejected' ? 'bg-red-50 text-red-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
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
                <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedComplaint.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">{getCategoryLabel(selectedComplaint)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                  <p className={`text-sm font-semibold mt-1 capitalize ${getPriorityColor(selectedComplaint.urgency)}`}>
                    {selectedComplaint.urgency}
                  </p>
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

              {selectedComplaint.response && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warden Response</label>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-100">
                    {selectedComplaint.response}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
              {(selectedComplaint.status === 'pending' || selectedComplaint.status === 'in_progress') && (
                <button
                  onClick={() => { handleResolve(selectedComplaint._id); setSelectedComplaint(null); }}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" /> Mark Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
