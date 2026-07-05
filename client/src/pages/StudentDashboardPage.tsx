import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Folder, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// Mock chart data matching the reference image
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const submittedData = [12, 18, 15, 14, 9, 22];
const resolvedData = [10, 15, 13, 9, 8, 15];
const maxVal = 25;
const chartHeight = 220;
const chartWidth = 540;
const stepX = chartWidth / (months.length - 1);

const toPoint = (values: number[], i: number) => {
  const x = 50 + i * stepX;
  const y = chartHeight - (values[i] / maxVal) * (chartHeight - 40) + 15;
  return { x, y };
};

const makePath = (values: number[]) => {
  return values.map((_, i) => {
    const { x, y } = toPoint(values, i);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
};

const makeAreaPath = (values: number[]) => {
  const line = makePath(values);
  const lastPt = toPoint(values, values.length - 1);
  const firstPt = toPoint(values, 0);
  return `${line} L ${lastPt.x} ${chartHeight} L ${firstPt.x} ${chartHeight} Z`;
};

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();

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

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Complaints */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Folder className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Total Complaints</p>
              <h3 className="text-2xl font-extrabold text-slate-800">8</h3>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Pending</p>
              <h3 className="text-2xl font-extrabold text-slate-800">5</h3>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Resolved</p>
              <h3 className="text-2xl font-extrabold text-slate-800">3</h3>
            </div>
          </div>

          {/* Emergency Alerts */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Emergency Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-800">3</h3>
            </div>
          </div>
        </div>

        {/* Complaint Trends Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Complaint Trends</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 inline-block border-2 border-white shadow-sm"></span>
              <span className="text-slate-500 font-medium">Complaints Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500 inline-block border-2 border-white shadow-sm"></span>
              <span className="text-slate-500 font-medium">Complaints Resolved</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth + 100} ${chartHeight + 50}`} className="w-full max-w-3xl mx-auto h-auto" style={{ minWidth: '400px' }}>
              {/* Grid lines & Y labels */}
              {[0, 5, 10, 15, 20, 25].map((val) => {
                const y = chartHeight - (val / maxVal) * (chartHeight - 40) + 15;
                return (
                  <g key={val}>
                    <text x="35" y={y + 4} textAnchor="end" className="fill-slate-400" fontSize="11" fontFamily="sans-serif">{val}</text>
                    <line x1="50" y1={y} x2={chartWidth + 50} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                  </g>
                );
              })}

              {/* Area fill for submitted */}
              <path d={makeAreaPath(submittedData)} fill="url(#blueGradStudent)" opacity="0.15" />

              {/* Lines */}
              <path d={makePath(submittedData)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={makePath(resolvedData)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots */}
              {submittedData.map((_, i) => {
                const { x, y } = toPoint(submittedData, i);
                return <circle key={`s${i}`} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />;
              })}
              {resolvedData.map((_, i) => {
                const { x, y } = toPoint(resolvedData, i);
                return <circle key={`r${i}`} cx={x} cy={y} r="4" fill="#22c55e" stroke="white" strokeWidth="2" />;
              })}

              {/* X-axis labels */}
              {months.map((m, i) => {
                const { x } = toPoint(submittedData, i);
                return <text key={m} x={x} y={chartHeight + 30} textAnchor="middle" className="fill-slate-400" fontSize="12" fontFamily="sans-serif">{m}</text>;
              })}

              <defs>
                <linearGradient id="blueGradStudent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};
