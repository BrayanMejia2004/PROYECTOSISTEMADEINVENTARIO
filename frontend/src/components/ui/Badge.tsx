interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const Badge = ({ variant = 'neutral', children }: BadgeProps) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}>
    {children}
  </span>
);
