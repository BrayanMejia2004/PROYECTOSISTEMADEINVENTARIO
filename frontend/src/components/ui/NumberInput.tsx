import { forwardRef, useState } from 'react';

const LOCALE = 'es-MX';

const formatLocale = (num: number, decimals = 0): string => {
  return num.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const parseLocale = (str: string): number | '' => {
  if (!str || str.trim() === '') return '';
  const normalized = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  if (isNaN(num)) return '';
  return num;
};

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  decimals?: number;
  autoFocus?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled,
  className,
  decimals = 0,
  autoFocus,
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [editValue, setEditValue] = useState('');

  const hasValue = value !== '' && value !== null && value !== undefined;

  const displayValue = focused
    ? editValue
    : (hasValue ? formatLocale(value, decimals) : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9.,\-]/g, '');
    setEditValue(cleaned);
    const parsed = parseLocale(cleaned);
    onChange(parsed);
  };

  const handleFocus = () => {
    setFocused(true);
    setEditValue(hasValue ? String(value) : '');
  };

  const handleBlur = () => {
    setFocused(false);
    if (editValue) {
      const parsed = parseLocale(editValue);
      if (parsed !== '' && min !== undefined && parsed < min) {
        onChange(min);
      } else if (parsed !== '' && max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    } else {
      onChange('');
    }
    setEditValue('');
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      autoFocus={autoFocus}
    />
  );
});

NumberInput.displayName = 'NumberInput';