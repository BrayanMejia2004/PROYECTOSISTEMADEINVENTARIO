import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerForm } from '../schemas';

interface Props {
  defaultValues?: CustomerForm;
  isPending: boolean;
  editingId?: string;
  onSubmit: (data: CustomerForm) => void;
  onCancel: () => void;
}

export const CustomerFormComponent = ({ defaultValues, isPending, onSubmit, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
      <h3 className="font-sans font-semibold text-brand-text mb-4">
        {defaultValues ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
          <input {...register('name')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
          <input {...register('phone')} type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
          <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
          <input {...register('address')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">RFC</label>
          <input {...register('taxId')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
