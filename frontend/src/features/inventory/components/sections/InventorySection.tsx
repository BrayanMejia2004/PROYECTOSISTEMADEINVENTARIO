import { Controller } from 'react-hook-form';
import { Box } from 'lucide-react';
import { NumberInput } from '../../../../components/ui/NumberInput';
import { inputClass, labelClass, req } from './constants';
import type { SectionProps } from './types';

export const InventorySection = ({ register, control, errors, allowsDiscount }: SectionProps & { allowsDiscount?: boolean }) => (
  <div className="border-t border-gray-100 pt-6">
    <div className="flex items-center gap-2 mb-4">
      <Box className="w-4 h-4 text-brand" />
      <h4 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Inventario</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div>
        <label className={labelClass}>{req('Stock Inicial')}</label>
        <Controller name="stock" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} min={0} className={inputClass} />
        )} />
        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Stock Mínimo</label>
        <Controller name="minStock" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} min={0} className={inputClass} />
        )} />
        {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Stock Máximo</label>
        <Controller name="maxStock" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} min={0} className={inputClass} />
        )} />
        {errors.maxStock && <p className="text-red-500 text-xs mt-1">{errors.maxStock.message}</p>}
      </div>
      <div>
        <label className={labelClass}>{req('Unidad de Medida')}</label>
        <select {...register('unit')} className={inputClass}>
          <option value="">Seleccionar unidad</option>
          <option value="unit">Unidad</option>
          <option value="kg">Kilogramo</option>
          <option value="g">Gramo</option>
          <option value="l">Litro</option>
          <option value="ml">Mililitro</option>
          <option value="box">Caja</option>
          <option value="pack">Paquete</option>
        </select>
        {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
      </div>
    </div>
    <label className="flex items-center gap-2.5 cursor-pointer mb-4">
      <input {...register('sellOutOfStock')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand/20" />
      <span className="text-sm text-brand-text">Permitir venta sin stock</span>
    </label>
    <label className="flex items-center gap-2.5 cursor-pointer mb-4">
      <input {...register('allowsDiscount')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand/20" />
      <span className="text-sm text-brand-text">Permite descuento</span>
    </label>
    {allowsDiscount && (
      <div className="max-w-xs mb-4">
        <label className={labelClass}>Descuento Máximo (%)</label>
        <Controller name="maxDiscount" control={control} render={({ field }) => (
          <NumberInput value={field.value ?? ''} onChange={(v) => field.onChange(v === '' ? undefined : v)} min={0} max={100} decimals={2} className={inputClass} />
        )} />
      </div>
    )}
  </div>
);
