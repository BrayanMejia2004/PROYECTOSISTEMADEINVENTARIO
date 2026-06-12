import { Controller } from 'react-hook-form';
import { DollarSign } from 'lucide-react';
import { NumberInput } from '../../../../components/ui/NumberInput';
import { inputClass, labelClass, req } from './constants';
import type { SectionProps } from './types';

export const PriceSection = ({ control, errors, costPrice, setValue, manualPrice }: SectionProps & { costPrice: number; manualPrice: React.MutableRefObject<boolean> }) => (
  <div className="border-t border-gray-100 pt-6">
    <div className="flex items-center gap-2 mb-4">
      <DollarSign className="w-4 h-4 text-brand" />
      <h4 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Precios</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>{req('Precio Costo')}</label>
        <Controller name="costPrice" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} decimals={2} className={inputClass} />
        )} />
        {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice.message}</p>}
      </div>
      <div>
        <label className={labelClass}>{req('Ganancia %')}</label>
        <Controller name="profitPercent" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => { field.onChange(v === '' ? undefined : v); if (v !== '') manualPrice.current = false; }} min={0} max={100} decimals={1} className={inputClass} placeholder="Ej: 20" />
        )} />
        {errors.profitPercent && <p className="text-red-500 text-xs mt-1">{errors.profitPercent.message}</p>}
      </div>
      <div>
        <label className={labelClass}>{req('Precio Venta')}</label>
        <Controller name="price" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => { field.onChange(v === '' ? undefined : v); if (v !== '' && v > 0 && costPrice > 0) { manualPrice.current = true; const cp = Math.round((1 - costPrice / v) * 100 * 10) / 10; setValue('profitPercent', Math.min(100, Math.max(0, cp))); } }} decimals={2} className={inputClass} />
        )} />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Precio Mayoreo</label>
        <Controller name="wholesalePrice" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} decimals={2} className={inputClass} />
        )} />
      </div>
      <div>
        <label className={labelClass}>Precio Especial</label>
        <Controller name="specialPrice" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} decimals={2} className={inputClass} />
        )} />
      </div>
    </div>
  </div>
);
