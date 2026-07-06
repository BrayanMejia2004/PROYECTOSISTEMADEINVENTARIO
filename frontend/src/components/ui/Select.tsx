import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = '', wrapperClassName = '', ...props }, ref) => (
    <div className={`relative ${wrapperClassName}`}>
      <select
        ref={ref}
        className={`w-full px-4 py-3 rounded-lg border text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all appearance-none cursor-pointer ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
    </div>
  )
);
