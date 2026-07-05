import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentForm } from '../schemas';

interface Props {
  defaultValues?: DepartmentForm;
  isPending: boolean;
  editingId?: string;
  onSubmit: (data: DepartmentForm) => void;
  onCancel: () => void;
}

export const DepartmentFormComponent = ({ defaultValues, isPending, onSubmit, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 max-w-md">
      <h3 className="font-sans font-semibold text-brand-text mb-4">
        {defaultValues ? 'Editar Departamento' : 'Nuevo Departamento'}
      </h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
          placeholder="Nombre del departamento"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div className="flex justify-end gap-2">
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
