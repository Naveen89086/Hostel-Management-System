import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, colorClass }) => {
  return (
    <div className="glass-card p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-current`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-surface-500 dark:text-surface-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
};
