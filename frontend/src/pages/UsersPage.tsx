import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/features/users/hooks';
import { useBranches } from '@/features/settings/hooks';
import { formatDate } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { useState, useCallback } from 'react';
import { UserCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Pagination } from '@/components/ui/Pagination';
import { UserFormComponent } from '@/features/users/components/UserForm';
import type { User, Branch } from '@/types';
import type { UserForm } from '@/features/users/schemas';

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

const resolveBranchName = (user: User, branches: Branch[] | undefined) => {
  if (!user.branchId) return '—';
  const branch = branches?.find((b) => b._id === user.branchId);
  return branch?.name || user.branchId;
};

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, limit: 10 });
  const { data: branches } = useBranches();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { hasPermission } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState('');

  const handleSubmitForm = useCallback((formData: UserForm) => {
    const { confirmPassword: _, ...payload } = formData;
    if (editingUser) {
      const input: any = { ...payload };
      if (!input.password) delete input.password;
      updateUser({ id: editingUser._id, input }, {
        onSuccess: () => {
          setShowSuccess('Usuario actualizado exitosamente');
          setShowForm(false);
          setEditingUser(null);
        },
      });
    } else {
      createUser(payload, {
        onSuccess: () => {
          setShowSuccess('Usuario creado exitosamente');
          setShowForm(false);
        },
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
  }, []);

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
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-brand-muted">No hay usuarios registrados</td>
                </tr>
              ) : (
                data?.data?.map((user: User) => (
                  <tr key={user._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{user.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{resolveBranchName(user, branches?.data)}</td>
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
      {data?.meta && <Pagination meta={data.meta} setPage={setPage} label="usuario(s)" />}
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

      <SuccessToast
        open={!!showSuccess}
        onClose={() => setShowSuccess('')}
        message={showSuccess}
      />
    </div>
  );
};
