import { FileText, Image, X, Loader2 } from 'lucide-react';
import { inputClass, labelClass, req } from './constants';
import type { SectionProps } from './types';

export const BasicInfoSection = ({ register, errors, departments, uploading, imageUrl, onImageSelect, onRemoveImage }: SectionProps) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <FileText className="w-4 h-4 text-brand" />
      <h4 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Información Básica</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>{req('SKU')}</label>
        <input {...register('sku')} className={inputClass} />
        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
      </div>
      <div>
        <label className={labelClass}>{req('Código de Barras')}</label>
        <input {...register('barcode')} className={inputClass} />
        {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode.message}</p>}
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>{req('Nombre')}</label>
        <input {...register('name')} className={inputClass} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Descripción</label>
        <textarea {...register('description')} rows={3} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>{req('Departamento')}</label>
        <select {...register('departmentId')} className={inputClass}>
          <option value="">Seleccionar departamento</option>
          {departments?.data?.map((dept: any) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
        {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Marca</label>
        <input {...register('brandId')} className={inputClass} placeholder="Nombre de la marca" />
        {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Imagen del Producto</label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text hover:border-brand/40 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
            <span>{uploading ? 'Subiendo...' : 'Seleccionar imagen'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={onImageSelect} disabled={uploading} />
          </label>
          {imageUrl && (
            <button type="button" onClick={onRemoveImage} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <X className="w-4 h-4" /> Eliminar
            </button>
          )}
        </div>
        {imageUrl && (
          <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <input type="hidden" {...register('image')} />
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
      </div>
    </div>
  </div>
);
