import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/features/users/hooks';
import { useBranches } from '@/features/settings/hooks';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { useState, useCallback } from 'react';
import { UserCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { UserFormComponent } from '@/features/users/components/UserForm';
import type { User, Branch } from '@/types';
import type { UserForm } from '@/features/users/schemas';

const roleVariant: Record<string, 'purple' | 'info' | 'neutral'> = {
  owner: 'purple',
  admin: 'info',
  cashier: 'neutral',
};

const resolveBranchName = (user: User, branches: Branch[] | undefined) => {
  if (!user.branchId) return '—';
  const branch = branches?.find((b) => b._id === user.branchId);
  return branch?.name || user.branchId;
};

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useUsers({ page, limit: 10 });
  const { data: branches } = useBranches();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { hasPermission } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const handleSubmitForm = useCallback((formData: UserForm) => {
    const { confirmPassword: _, ...payload } = formData;
    setServerError('');
    if (editingUser) {
      const input: any = { ...payload };
      if (!input.password) delete input.password;
      updateUser({ id: editingUser._id, input }, {
        onSuccess: () => {
          setShowSuccess('Usuario actualizado exitosamente');
          setShowForm(false);
          setEditingUser(null);
        },
        onError: (err: Error) => setServerError(getErrorMessage(err, 'No se pudo actualizar el usuario')),
      });
    } else {
      createUser(payload, {
        onSuccess: () => {
          setShowSuccess('Usuario creado exitosamente');
          setShowForm(false);
        },
        onError: (err: Error) => setServerError(getErrorMessage(err, 'No se pudo crear el usuario')),
      });
    }
  }, [editingUser, updateUser, createUser]);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setConfirmDelete({ open: true, id: user._id, name: `${user.firstName} ${user.lastName}` });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingUser(null);
    setServerError('');
  }, []);

  if (isLoading) return <TableSkeleton rows={5} columns={7} />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;

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
        <UserFormComponent
          key={editingUser?._id ?? 'new'}
          defaultValues={editingUser ? {
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            email: editingUser.email,
            password: '',
            confirmPassword: '',
            role: editingUser.role,
            branchId: editingUser.branchId || '',
          } : undefined}
          isPending={isCreating || isUpdating}
          editingId={editingUser?._id}
          onSubmit={handleSubmitForm}
          onCancel={handleCancel}
          serverError={serverError}
          branchOptions={branches?.data}
        />
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
                  <td colSpan={7}>
                    <EmptyState icon={UserCircle} title="Sin usuarios" description="Crea el primer usuario del sistema" />
                  </td>
                </tr>
              ) : (
                data?.data?.map((user: User) => (
                  <tr key={user._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{user.email}</td>
                    <td className="px-6 py-4"><Badge variant={roleVariant[user.role]}>{user.role}</Badge></td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{resolveBranchName(user, branches?.data)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Editar">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isDeleting}
                            className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data?.meta && <Pagination meta={data.meta} setPage={setPage} label="usuario(s)" />}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) {
            deleteUser(confirmDelete.id, {
              onSuccess: () => setShowSuccess('Usuario eliminado exitosamente'),
            });
          }
          setConfirmDelete({ open: false });
        }}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      <SuccessToast
        open={!!showSuccess}
        onClose={() => setShowSuccess('')}
        message={showSuccess}
      />
    </div>
  );
};
