import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/features/settings/hooks';
import { branchSchema, type BranchForm } from '@/features/settings/schemas';
import { Building2, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export const BranchesTab = () => {
  const { data: branches, isLoading, isError, error, refetch } = useBranches();
  const { mutate: createBranch, isPending: isCreatingBranch } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdatingBranch } = useUpdateBranch();
  const { mutate: deleteBranch } = useDeleteBranch();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmSave, setConfirmSave] = useState<{ open: boolean; isEdit: boolean }>({ open: false, isEdit: false });
  const [showSuccess, setShowSuccess] = useState('');
  const pendingData = useRef<BranchForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BranchForm>({ resolver: zodResolver(branchSchema) });

  const resetForm = () => {
    reset({ name: '', address: '', phone: '' });
    setEditingBranch(null);
    setShowForm(false);
  };

  const onSubmit = (data: BranchForm) => {
    pendingData.current = data;
    setConfirmSave({ open: true, isEdit: !!editingBranch });
  };

  const handleConfirmSave = () => {
    const data = pendingData.current;
    if (!data) return;
    if (editingBranch) {
      updateBranch({ id: editingBranch._id, input: data }, {
        onSuccess: () => { setShowSuccess('Sucursal actualizada exitosamente'); resetForm(); },
      });
    } else {
      createBranch(data, {
        onSuccess: () => { setShowSuccess('Sucursal creada exitosamente'); resetForm(); },
      });
    }
    setConfirmSave({ open: false, isEdit: false });
    pendingData.current = null;
  };

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    reset({ name: branch.name, address: branch.address || '', phone: branch.phone || '' });
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDelete({ open: true, id, name });
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Building2 className="w-4 h-4" />
          Sucursales registradas
        </div>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva Sucursal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-sans font-semibold text-brand-text">{editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
              <input {...register('name')} className={inputClass} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
              <input {...register('address')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
              <input {...register('phone')} type="tel" className={inputClass} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isCreatingBranch || isUpdatingBranch} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
              Guardar
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Dirección</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Teléfono</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branches?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Building2} title="Sin sucursales" description="Crea tu primera sucursal para comenzar" />
                  </td>
                </tr>
              ) : (
                branches?.data?.map((branch: any) => (
                  <tr key={branch._id} className="hover:bg-brand/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{branch.name}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{branch.address || '—'}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{branch.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={branch.isActive ? 'success' : 'danger'}>
                        {branch.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Editar">
                          <button onClick={() => handleEdit(branch)} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"><Pencil className="w-4 h-4" /></button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <button onClick={() => handleDelete(branch._id, branch.name)} className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) deleteBranch(confirmDelete.id, { onSuccess: () => setShowSuccess('Sucursal eliminada exitosamente') });
          setConfirmDelete({ open: false });
        }}
        title="Eliminar sucursal"
        message={`¿Estás seguro de eliminar la sucursal "${confirmDelete.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmSave.open}
        onClose={() => setConfirmSave({ open: false, isEdit: false })}
        onConfirm={handleConfirmSave}
        title={confirmSave.isEdit ? 'Guardar cambios' : 'Crear sucursal'}
        message={confirmSave.isEdit ? '¿Estás seguro de guardar los cambios en esta sucursal?' : '¿Estás seguro de crear esta nueva sucursal?'}
        confirmText={confirmSave.isEdit ? 'Guardar cambios' : 'Crear sucursal'}
        variant="success"
      />

      <SuccessToast open={!!showSuccess} onClose={() => setShowSuccess('')} message={showSuccess} />
    </div>
  );
};
