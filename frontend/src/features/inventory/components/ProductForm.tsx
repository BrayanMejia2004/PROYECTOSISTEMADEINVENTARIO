import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductForm } from '../schemas';
import { useCreateProduct, useUpdateProduct, useProduct } from '../hooks';
import { useDepartments } from '../../departments/hooks';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Package, DollarSign, FileText, Box } from 'lucide-react';
import { NumberInput } from '../../../components/ui/NumberInput';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { SuccessToast } from '../../../components/ui/SuccessToast';

interface ProductFormProps {
  productId?: string;
}

export const ProductForm = ({ productId }: ProductFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: productData } = useProduct(productId || '');
  const { data: departments } = useDepartments();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const [confirmSave, setConfirmSave] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');
  const pendingFormData = useRef<ProductForm | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,

  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const applyTax = watch('applyTax');
  const allowsDiscount = watch('allowsDiscount');
  const costPrice = watch('costPrice');
  const profitPercent = watch('profitPercent');
  const price = watch('price');

  const manualPrice = useRef(false);

  const calculatedPrice = useMemo(() => {
    if (costPrice > 0 && profitPercent > 0) {
      return Math.round((costPrice / (1 - profitPercent / 100)) * 100) / 100;
    }
    return costPrice || 0;
  }, [costPrice, profitPercent]);

  useEffect(() => {
    if (!manualPrice.current) {
      setValue('price', calculatedPrice);
    }
  }, [calculatedPrice, setValue]);

  useEffect(() => {
    if (manualPrice.current && costPrice > 0 && price > 0) {
      const calcProfit = Math.round((1 - costPrice / price) * 100 * 10) / 10;
      setValue('profitPercent', Math.min(100, Math.max(0, calcProfit)));
    }
  }, [costPrice]);

  useEffect(() => {
    if (productData?.data) {
      const cp = productData.data.costPrice;
      const pr = productData.data.price;
      const pp = pr > cp ? Math.round((1 - cp / pr) * 100 * 10) / 10 : 0;
      manualPrice.current = true;
      reset({
        sku: productData.data.sku,
        barcode: productData.data.barcode || '',
        name: productData.data.name,
        description: productData.data.description || '',
        departmentId: productData.data.departmentId || '',
        brandId: productData.data.brandId || '',
        supplierId: productData.data.supplierId || '',
        image: productData.data.image || '',
        costPrice: cp,
        profitPercent: pp,
        price: pr,
        wholesalePrice: productData.data.wholesalePrice || undefined,
        specialPrice: productData.data.specialPrice || undefined,
        applyTax: productData.data.applyTax,
        taxPercentage: productData.data.taxPercentage,
        allowsDiscount: productData.data.allowsDiscount,
        maxDiscount: productData.data.maxDiscount,
        stock: productData.data.stock ?? 0,
        minStock: productData.data.minStock,
        maxStock: productData.data.maxStock,
        sellOutOfStock: productData.data.sellOutOfStock,
        unit: productData.data.unit,
      });
    }
  }, [productData, reset]);

  const onSubmit = (data: ProductForm) => {
    pendingFormData.current = data;
    setConfirmSave(true);
  };

  const handleConfirmSave = () => {
    const data = pendingFormData.current;
    if (!data) return;
    if (productId) {
      updateProduct(
        { id: productId, input: data },
        { onSuccess: () => {
          setShowSuccess('Producto actualizado exitosamente');
          setTimeout(() => navigate('/inventory'), 1500);
        }}
      );
    } else {
      createProduct(data, {
        onSuccess: () => {
          setShowSuccess('Producto creado exitosamente');
          setTimeout(() => navigate('/inventory'), 1500);
        },
      });
    }
    setConfirmSave(false);
    pendingFormData.current = null;
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-brand-text mb-1.5";
  const req = (label: string) => <>{label} <span className="text-red-400">*</span></>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-brand-text">
            {productId ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <p className="text-xs text-brand-muted">
            {productId ? 'Actualiza los datos del producto' : 'Ingresa los datos del nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Información Básica */}
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
              <label className={labelClass}>URL Imagen</label>
              <input {...register('image')} className={inputClass} placeholder="https://..." />
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Precios */}
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

        {/* Section 3: IVA */}
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

        {/* Section 4: Inventario */}
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

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating ? 'Guardando...' : productId ? 'Actualizar' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text hover:border-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title={productId ? 'Guardar cambios' : 'Crear producto'}
        message={productId ? '¿Estás seguro de guardar los cambios en este producto?' : '¿Estás seguro de crear este nuevo producto?'}
        confirmText={productId ? 'Guardar cambios' : 'Crear producto'}
        variant="success"
      />

      <SuccessToast
        open={!!showSuccess}
        onClose={() => setShowSuccess('')}
        message={showSuccess}
      />
    </div>
  );
};
