import type { UseFormRegister, Control, FormState, UseFormSetValue } from 'react-hook-form';
import type { ProductForm } from '@/features/inventory/schemas';

export interface SectionProps {
  register: UseFormRegister<ProductForm>;
  control: Control<ProductForm>;
  errors: FormState<ProductForm>['errors'];
  setValue: UseFormSetValue<ProductForm>;
  departments?: { data?: any[] };
  uploading: boolean;
  imageUrl?: string;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}
