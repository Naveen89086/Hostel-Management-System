import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Download, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/analytics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate basic CSV from stats
    if (!stats) return;
    
    let csv = 'Date,Request Count\n';
    stats.byDate.forEach((d: any) => {
      csv += `${d._id},${d.count}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostelhub_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (user?.role !== 'admin' && user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins and Wardens only.</div>;
  }

  if (isLoading || !stats) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  // Format data for Recharts
  const pieData = stats.byStatus.map((s: any) => ({
    name: s._id.replace('_', ' ').toUpperCase(),
    value: s.count
  }));

  const typeData = stats.byType.map((t: any) => ({
    name: t._id.replace('_', ' ').toUpperCase(),
    Requests: t.count
  }));

  const trendData = stats.byDate.map((d: any) => ({
    date: d._id.split('-').slice(1).join('/'), // Format MM/DD
    count: d.count
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">System-wide statistics and trends</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Requests Trend */}
        <div className="glass-card p-6 w-full h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Request Trend (Last 30 Days)</h2>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.2} />
                <XAxis dataKey="date" stroke="#8884d8" />
                <YAxis stroke="#8884d8" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Status */}
        <div className="glass-card p-6 w-full h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Requests by Status</h2>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Category */}
        <div className="glass-card p-6 w-full h-[400px] flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Requests by Category</h2>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#8884d8" tick={{fontSize: 12}} />
                <YAxis stroke="#8884d8" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                />
                <Legend />
                <Bar dataKey="Requests" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
