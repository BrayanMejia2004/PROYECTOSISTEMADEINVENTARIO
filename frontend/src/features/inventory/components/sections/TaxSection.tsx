import { Controller } from 'react-hook-form';
import { Package } from 'lucide-react';
import { NumberInput } from '../../../../components/ui/NumberInput';
import { inputClass, labelClass } from './constants';
import type { SectionProps } from './types';

export const TaxSection = ({ register, control, applyTax }: SectionProps & { applyTax?: boolean }) => (
  <div className="border-t border-gray-100 pt-6">
    <div className="flex items-center gap-2 mb-4">
      <Package className="w-4 h-4 text-brand" />
      <h4 className="text-sm font-semibold text-brand-text uppercase tracking-wider">IVA</h4>
    </div>
    <div className="space-y-4">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input {...register('applyTax')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand/20" />
        <span className="text-sm text-brand-text">Aplica IVA</span>
      </label>
      {applyTax && (
        <div className="max-w-xs">
          <label className={labelClass}>Porcentaje IVA (%)</label>
          <Controller name="taxPercentage" control={control} render={({ field }) => (
            <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} min={0} max={100} decimals={2} className={inputClass} />
          )} />
        </div>
      )}
    </div>
  </div>
);
