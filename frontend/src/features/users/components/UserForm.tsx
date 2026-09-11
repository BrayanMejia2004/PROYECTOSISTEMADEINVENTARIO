import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserForm } from '../schemas';

interface Props {
  defaultValues?: Partial<UserForm>;
  isPending: boolean;
  editingId?: string;
  serverError?: string;
  onSubmit: (data: UserForm) => void;
  onCancel: () => void;
  branchOptions?: Array<{ _id: string; name: string }>;
}

export const UserFormComponent = ({ defaultValues, isPending, editingId, serverError, onSubmit, onCancel, branchOptions }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
      <h3 className="font-sans font-semibold text-brand-text mb-4">
        {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
      </h3>
      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
          {serverError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
          <input {...register('firstName')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Apellido</label>
          <input {...register('lastName')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
          <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">
            {editingId ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña'}
          </label>
          <input {...register('password')} type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Confirmar Contraseña</label>
          <input {...register('confirmPassword')} type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Rol</label>
          <select {...register('role')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all">
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Sucursal</label>
          <select {...register('branchId')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all">
            <option value="">Sin sucursal</option>
            {branchOptions?.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
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
