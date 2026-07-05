import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, MapPin, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';
import { User } from '../types';
import { Spinner } from '../components/ui/Spinner';

interface Alert {
  id: string;
  time: string;
  student: string;
  location: string;
  status: 'Active' | 'Resolved';
  block: 'A' | 'B';
}

export const WardenAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B'>('A');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await requestService.getRequests({});
      if (res.success) {
        const emergencyReqs = (res.data || []).filter((r: import('../types').Request) => r.category === 'Emergency' || r.urgency === 'critical');
        
        const mappedAlerts: Alert[] = emergencyReqs.map((req: import('../types').Request) => {
          const student = req.user as User;
          let block: 'A' | 'B' = 'A';
          if (student && student.roomNumber) {
            if (student.roomNumber.startsWith('B') || student.roomNumber.startsWith('2') || student.roomNumber.startsWith('5')) {
              block = 'B';
            }
          }

          const dateObj = new Date(req.createdAt);
          const formattedTime = `${dateObj.toLocaleDateString('en-GB')}, ${dateObj.toLocaleTimeString('en-GB')}`;

          return {
            id: req._id,
            time: formattedTime,
            student: student?.name || 'Unknown',
            location: req.description || 'GPS Denied/Unavailable',
            status: req.status === 'resolved' ? 'Resolved' : 'Active',
            block
          };
        });

        // Mock data fallback just for visual demonstration
        if (mappedAlerts.length === 0) {
          mappedAlerts.push(
            { id: 'mock1', time: '12/05/2026, 14:01:37', student: 'sruthika gunjnoor', location: 'GPS Denied/Unavailable', status: 'Resolved', block: 'A' },
            { id: 'mock2', time: '12/05/2026, 13:49:51', student: 'sruthika gunjnoor', location: 'GPS Denied/Unavailable', status: 'Resolved', block: 'A' },
            { id: 'mock3', time: '12/05/2026, 12:56:50', student: 'sruthika gunjnoor', location: 'GPS Denied/Unavailable', status: 'Active', block: 'A' },
            { id: 'mock4', time: '10/05/2026, 21:27:16', student: 'sruthika gunjnoor', location: 'Lat: 17.7239, Lng: 78.2562', status: 'Resolved', block: 'B' }
          );
        }

        setAlerts(mappedAlerts);
      }
    } catch {
      toast.error('Failed to load emergency alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (id.startsWith('mock')) {
      setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
      toast.success('Alert marked as resolved.');
      return;
    }

    try {
      const res = await requestService.updateRequest(id, { status: 'resolved' });
      if (res.success) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
        toast.success('Alert marked as resolved.');
      }
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  if (user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Wardens only.</div>;
  }

  const filteredAlerts = alerts.filter(a => a.block === selectedBlock);

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
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="block" 
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
                name="block" 
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>
          
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-red-500">Emergency Alerts</h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">TIME</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">STUDENT</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">REPORTED LOCATION</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">STATUS</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 px-4 text-slate-600 font-medium">{alert.time}</td>
                        <td className="py-6 px-4 font-bold text-slate-800">{alert.student}</td>
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{alert.location}</span>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            alert.status === 'Resolved' 
                              ? 'bg-green-50 text-green-500' 
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          {alert.status === 'Active' ? (
                            <button 
                              onClick={() => handleResolve(alert.id)}
                              className="bg-[#22c55e] hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-slate-400 font-bold px-2">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAlerts.length === 0 && (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No emergency alerts found for this block.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
