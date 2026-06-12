import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductForm as ProductFormType } from '../schemas';
import { useCreateProduct, useUpdateProduct, useProduct, useUploadProductImage } from '../hooks';
import { useDepartments } from '../../departments/hooks';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { SuccessToast } from '../../../components/ui/SuccessToast';
import toast from 'react-hot-toast';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PriceSection } from './sections/PriceSection';
import { TaxSection } from './sections/TaxSection';
import { InventorySection } from './sections/InventorySection';

interface ProductFormProps {
  productId?: string;
}

export const ProductForm = ({ productId }: ProductFormProps) => {
  const navigate = useNavigate();
  const { data: productData } = useProduct(productId || '');
  const { data: departments } = useDepartments();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const [confirmSave, setConfirmSave] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const pendingFormData = useRef<ProductFormType | null>(null);
  const { mutateAsync: uploadImage } = useUploadProductImage();
  const manualPrice = useRef(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
  });

  const applyTax = watch('applyTax');
  const allowsDiscount = watch('allowsDiscount');
  const costPrice = watch('costPrice');
  const profitPercent = watch('profitPercent');
  const price = watch('price');
  const imageUrl = watch('image');

  const calculatedPrice = useMemo(() => {
    if (costPrice > 0 && profitPercent > 0) {
      return Math.round((costPrice / (1 - profitPercent / 100)) * 100) / 100;
    }
    return costPrice || 0;
  }, [costPrice, profitPercent]);

  useEffect(() => {
    if (!manualPrice.current) setValue('price', calculatedPrice);
  }, [calculatedPrice, setValue]);

  useEffect(() => {
    if (manualPrice.current && costPrice > 0 && price > 0) {
      setValue('profitPercent', Math.min(100, Math.max(0, Math.round((1 - costPrice / price) * 100 * 10) / 10)));
    }
  }, [costPrice]);

  useEffect(() => {
    if (productData?.data) {
      const d = productData.data;
      manualPrice.current = true;
      reset({
        sku: d.sku, barcode: d.barcode || '', name: d.name,
        description: d.description || '', departmentId: d.departmentId || '',
        brandId: d.brandId || '', supplierId: d.supplierId || '', image: d.image || '',
        costPrice: d.costPrice, profitPercent: d.price > d.costPrice ? Math.round((1 - d.costPrice / d.price) * 1000) / 10 : 0,
        price: d.price, wholesalePrice: d.wholesalePrice || undefined,
        specialPrice: d.specialPrice || undefined, applyTax: d.applyTax,
        taxPercentage: d.taxPercentage, allowsDiscount: d.allowsDiscount,
        maxDiscount: d.maxDiscount, stock: d.stock ?? 0, minStock: d.minStock,
        maxStock: d.maxStock, sellOutOfStock: d.sellOutOfStock, unit: d.unit,
      });
    }
  }, [productData, reset]);

  const onSubmit = (data: ProductFormType) => { pendingFormData.current = data; setConfirmSave(true); };

  const handleConfirmSave = () => {
    const data = pendingFormData.current;
    if (!data) return;
    const cb = {
      onSuccess: () => { setShowSuccess(productId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'); setTimeout(() => navigate('/inventory'), 1500); },
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Error al guardar el producto'),
    };
    if (productId) updateProduct({ id: productId, input: data }, cb);
    else createProduct(data, cb);
    setConfirmSave(false);
    pendingFormData.current = null;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { setValue('image', await uploadImage(file)); }
    catch { setValue('image', ''); }
    finally { setUploading(false); }
  };

  const handleRemoveImage = () => setValue('image', '');

  const sectionProps = { register, control, errors, setValue, departments, uploading, imageUrl, onImageSelect: handleImageSelect, onRemoveImage: handleRemoveImage };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-brand-text">{productId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <p className="text-xs text-brand-muted">{productId ? 'Actualiza los datos del producto' : 'Ingresa los datos del nuevo producto'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoSection {...sectionProps} />
        <PriceSection {...sectionProps} costPrice={costPrice} manualPrice={manualPrice} />
        <TaxSection {...sectionProps} applyTax={applyTax} />
        <InventorySection {...sectionProps} allowsDiscount={allowsDiscount} />

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isCreating || isUpdating} className="bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {isCreating || isUpdating ? 'Guardando...' : productId ? 'Actualizar' : 'Crear Producto'}
          </button>
          <button type="button" onClick={() => navigate('/inventory')} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text hover:border-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>

      <ConfirmDialog open={confirmSave} onClose={() => setConfirmSave(false)} onConfirm={handleConfirmSave}
        title={productId ? 'Guardar cambios' : 'Crear producto'}
        message={productId ? '¿Estás seguro de guardar los cambios en este producto?' : '¿Estás seguro de crear este nuevo producto?'}
        confirmText={productId ? 'Guardar cambios' : 'Crear producto'} variant="success" />

      <SuccessToast open={!!showSuccess} onClose={() => setShowSuccess('')} message={showSuccess} />
    </div>
  );
};
