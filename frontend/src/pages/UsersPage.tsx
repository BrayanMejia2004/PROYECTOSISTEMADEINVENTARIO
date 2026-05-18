import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../features/users/hooks';
import { useBranches } from '../features/settings/hooks';
import { formatDate, formatNumber } from '../lib/utils';
import { usePermission } from '../hooks/usePermission';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserForm } from '../features/users/schemas';
import { UserCircle, Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SuccessToast } from '../components/ui/SuccessToast';

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, limit: 10 });
  const { data: branches } = useBranches();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { hasPermission } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmSave, setConfirmSave] = useState<{ open: boolean; isEdit: boolean }>({ open: false, isEdit: false });
  const [showSuccess, setShowSuccess] = useState('');
  const pendingData = useRef<UserForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        branchId: editingUser.branchId || '',
      });
    } else {
      reset({ firstName: '', lastName: '', email: '', password: '', role: 'cashier', branchId: '' });
    }
  }, [editingUser, reset]);

  const onSubmit = (formData: UserForm) => {
    pendingData.current = formData;
    setConfirmSave({ open: true, isEdit: !!editingUser });
  };

  const handleConfirmSave = () => {
    const data = pendingData.current;
    if (!data) return;
    if (editingUser) {
      const input: any = { ...data };
      if (!input.password) delete input.password;
      updateUser({ id: editingUser._id, input }, {
        onSuccess: () => {
          setShowSuccess('Usuario actualizado exitosamente');
          setShowForm(false);
          setEditingUser(null);
        },
      });
    } else {
      createUser(data, {
        onSuccess: () => {
          setShowSuccess('Usuario creado exitosamente');
          setShowForm(false);
          reset();
        },
      });
    }
    setConfirmSave({ open: false, isEdit: false });
    pendingData.current = null;
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: any) => {
    setConfirmDelete({ open: true, id: user._id, name: `${user.firstName} ${user.lastName}` });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  if (isLoading) return <div className="text-sm text-brand-muted p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Usuarios</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona los usuarios del sistema</p>
        </div>
        {hasPermission('users:create-cashier') && (
          <button
            onClick={() => {
              if (showForm) handleCancel();
              else setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Nuevo Usuario'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-sans font-semibold text-brand-text mb-4">
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
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
                {editingUser ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña'}
              </label>
              <input {...register('password')} type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
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
                {branches?.data?.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isCreating || isUpdating} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
              {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
          <UserCircle className="w-4 h-4" />
          Usuarios del sistema
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Sucursal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-brand-muted">No hay usuarios registrados</td>
                </tr>
              ) : (
                data?.data?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">
                      {user.branchId ? branches?.data?.find((b: any) => b._id === user.branchId)?.name || user.branchId : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isDeleting}
                          className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-500 disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p className="text-xs text-brand-muted">
            {formatNumber(data.meta.total)} usuario(s) — Página {formatNumber(data.meta.page)} de {formatNumber(data.meta.totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={data.meta.page <= 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.meta!.totalPages!, p + 1))}
              disabled={data.meta.page >= data.meta.totalPages}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) deleteUser(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmSave.open}
        onClose={() => setConfirmSave({ open: false, isEdit: false })}
        onConfirm={handleConfirmSave}
        title={confirmSave.isEdit ? 'Guardar cambios' : 'Crear usuario'}
        message={confirmSave.isEdit ? '¿Estás seguro de guardar los cambios en este usuario?' : '¿Estás seguro de crear este nuevo usuario?'}
        confirmText={confirmSave.isEdit ? 'Guardar cambios' : 'Crear usuario'}
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

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    owner: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    cashier: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || styles.cashier}`}>
      {role}
    </span>
  );
};
