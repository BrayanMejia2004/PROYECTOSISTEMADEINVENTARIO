import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: { value: string; positive: boolean };
}

export const StatCard = ({ icon, label, value, sublabel, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-2xl font-sans font-bold text-brand-text">{value}</p>
    <p className="text-sm text-brand-muted mt-1">{label}</p>
    {sublabel && (
      <p className="text-xs text-brand-muted/70 mt-0.5">{sublabel}</p>
    )}
  </div>
);
