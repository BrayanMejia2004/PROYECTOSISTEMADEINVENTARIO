import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/features/departments/hooks';
import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tag, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DepartmentFormComponent } from '@/features/departments/components/DepartmentForm';
import type { Department } from '@/types';
import type { DepartmentForm } from '@/features/departments/schemas';

export const DepartmentsPage = () => {
  const { user } = useAuth();
  if (user?.role === 'owner') return <Navigate to="/" replace />;

  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useDepartments({ page, limit: 10 });
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutate: deleteDepartment } = useDeleteDepartment();
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState('');

  const handleSubmitForm = useCallback((formData: DepartmentForm) => {
    if (editingDepartment) {
      updateDepartment({ id: editingDepartment._id, input: { name: formData.name.trim() } }, {
        onSuccess: () => {
          setShowSuccess('Departamento actualizado exitosamente');
          resetForm();
        },
      });
    } else {
      createDepartment({ name: formData.name.trim() }, {
        onSuccess: () => {
          setShowSuccess('Departamento creado exitosamente');
          resetForm();
        },
      });
    }
  }, [editingDepartment, updateDepartment, createDepartment]);

  const resetForm = useCallback(() => {
    setEditingDepartment(null);
    setShowForm(false);
  }, []);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDelete = (department: Department) => {
    setConfirmDelete({ open: true, id: department._id, name: department.name });
  };

  if (isLoading) return <TableSkeleton rows={5} columns={3} />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Departamentos</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona los departamentos de productos</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Departamento'}
        </button>
      </div>

      {showForm && (
        <DepartmentFormComponent
          key={editingDepartment?._id ?? 'new'}
          defaultValues={editingDepartment ? { name: editingDepartment.name } : undefined}
          isPending={isCreating || isUpdating}
          editingId={editingDepartment?._id}
          onSubmit={handleSubmitForm}
          onCancel={resetForm}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
          <Tag className="w-4 h-4" />
          Lista de departamentos
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState icon={Tag} title="Sin departamentos" description="Crea el primer departamento para comenzar" />
                  </td>
                </tr>
              ) : (
                data?.data?.map((department: Department) => (
                  <tr key={department._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{department.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={department.isActive ? 'success' : 'danger'}>
                        {department.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Editar">
                          <button
                            onClick={() => handleEdit(department)}
                            className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <button
                            onClick={() => handleDelete(department)}
                            className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-600"
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
      {data?.meta && <Pagination meta={data.meta} setPage={setPage} label="departamento(s)" />}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) deleteDepartment(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar departamento"
        message={`¿Estás seguro de eliminar el departamento "${confirmDelete.name}"?`}
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
