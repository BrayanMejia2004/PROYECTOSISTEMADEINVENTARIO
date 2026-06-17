import { useParams } from 'react-router-dom';
import { ProductForm } from '@/features/inventory/components/ProductForm';

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductForm productId={id} />;
};
