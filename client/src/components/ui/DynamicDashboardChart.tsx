import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

interface DynamicDashboardChartProps {
  requests: any[];
  students?: any[]; // For admin dashboard
}

const STATUS_COLORS = {
  total: '#3B82F6',
  resolved: '#22C55E',
  pending: '#EAB308',
  inProgress: '#F97316',
  rejected: '#EF4444',
  students: '#8B5CF6'
};

const EMPTY_ARRAY: any[] = [];

export const DynamicDashboardChart: React.FC<DynamicDashboardChartProps> = ({ requests, students = EMPTY_ARRAY }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const chartData = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    
    if (viewMode === 'daily') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const obj: any = {
          dateObj: d,
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Total: 0, Resolved: 0, Pending: 0, InProgress: 0, Rejected: 0
        };
        if (students.length > 0) obj.Students = 0;
        data.push(obj);
      }
    } else if (viewMode === 'weekly') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
        // Start of week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        const startOfWeek = new Date(d.setDate(diff));
        
        const obj: any = {
          dateObj: startOfWeek,
          name: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Total: 0, Resolved: 0, Pending: 0, InProgress: 0, Rejected: 0
        };
        if (students.length > 0) obj.Students = 0;
        data.push(obj);
      }
    } else if (viewMode === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const obj: any = {
          dateObj: d,
          name: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          Total: 0, Resolved: 0, Pending: 0, InProgress: 0, Rejected: 0
        };
        if (students.length > 0) obj.Students = 0;
        data.push(obj);
      }
    }

    // Helper to find bin index
    const getBinIndex = (dateStr: string | number | Date) => {
      const d = new Date(dateStr);
      if (viewMode === 'daily') {
        return data.findIndex(bin => 
          bin.dateObj.getFullYear() === d.getFullYear() && 
          bin.dateObj.getMonth() === d.getMonth() && 
          bin.dateObj.getDate() === d.getDate()
        );
      } else if (viewMode === 'weekly') {
         // Find which week bucket it falls into
         for (let i = 0; i < data.length - 1; i++) {
            if (d >= data[i].dateObj && d < data[i+1].dateObj) return i;
         }
         if (d >= data[data.length-1].dateObj) return data.length - 1;
         return -1;
      } else if (viewMode === 'monthly') {
        return data.findIndex(bin => 
          bin.dateObj.getFullYear() === d.getFullYear() && 
          bin.dateObj.getMonth() === d.getMonth()
        );
      }
      return -1;
    };

    // Populate Request Data
    requests.forEach(r => {
      const idx = getBinIndex(r.createdAt || Date.now());
      if (idx !== -1) {
        data[idx].Total++;
        if (r.status === 'resolved') data[idx].Resolved++;
        else if (r.status === 'pending') data[idx].Pending++;
        else if (r.status === 'in_progress') data[idx].InProgress++;
        else if (r.status === 'rejected') data[idx].Rejected++;
      }
    });

    // Populate Student Data (Cumulative)
    if (students.length > 0) {
      students.forEach(s => {
        const idx = getBinIndex(s.createdAt || Date.now());
        if (idx !== -1) {
          data[idx].Students++;
        }
      });

      // Calculate cumulative sum
      let runningStudentTotal = students.length;
      for (let i = data.length - 1; i >= 0; i--) {
        const registeredThisBin = data[i].Students;
        data[i].Students = runningStudentTotal;
        runningStudentTotal -= registeredThisBin;
      }
    }

    return data;
  }, [requests, students, viewMode]);

  const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: 0 });

  React.useEffect(() => {
    let start = 0;
    if (viewMode === 'daily') start = Math.max(0, chartData.length - 14);
    if (viewMode === 'weekly') start = Math.max(0, chartData.length - 8);
    if (viewMode === 'monthly') start = Math.max(0, chartData.length - 6);
    setBrushRange({ startIndex: start, endIndex: chartData.length - 1 });
  }, [chartData, viewMode]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-slate-100 pb-4 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Dynamic Analytics</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          {['daily', 'weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 capitalize ${
                viewMode === mode 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="99%" debounce={1}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STATUS_COLORS.total} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={STATUS_COLORS.total} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STATUS_COLORS.resolved} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={STATUS_COLORS.resolved} stopOpacity={0}/>
              </linearGradient>
              {students.length > 0 && (
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STATUS_COLORS.students} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={STATUS_COLORS.students} stopOpacity={0}/>
                </linearGradient>
              )}
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} allowDecimals={false} dx={-10} />
            
            <RechartsTooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.4)', 
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px',
                zIndex: 100
              }} 
              itemStyle={{ fontWeight: 600 }}
              labelStyle={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={40} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingBottom: '20px' }} 
            />
            
            <Area type="monotone" dataKey="Total" stroke={STATUS_COLORS.total} strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" isAnimationActive={true} />
            <Area type="monotone" dataKey="Resolved" stroke={STATUS_COLORS.resolved} strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" isAnimationActive={true} />
            <Area type="monotone" dataKey="Pending" stroke={STATUS_COLORS.pending} strokeWidth={2} fill="transparent" isAnimationActive={true} />
            <Area type="monotone" dataKey="InProgress" name="In Progress" stroke={STATUS_COLORS.inProgress} strokeWidth={2} fill="transparent" isAnimationActive={true} />
            <Area type="monotone" dataKey="Rejected" stroke={STATUS_COLORS.rejected} strokeWidth={2} fill="transparent" isAnimationActive={true} />
            
            {students.length > 0 && (
              <Area type="monotone" dataKey="Students" stroke={STATUS_COLORS.students} strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" isAnimationActive={true} />
            )}

            <Brush 
              dataKey="name" 
              height={30} 
              stroke="#cbd5e1" 
              fill="#f8fafc"
              startIndex={brushRange.startIndex}
              endIndex={brushRange.endIndex}
              onChange={(e) => {
                if (e && typeof e.startIndex === 'number' && typeof e.endIndex === 'number') {
                  setBrushRange({ startIndex: e.startIndex, endIndex: e.endIndex });
                }
              }}
              tickFormatter={() => ''}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
