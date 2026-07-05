import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/features/suppliers/hooks';
import { useState, useCallback } from 'react';
import { formatDate } from '@/lib/utils';
import { Plus, Users, X, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Pagination } from '@/components/ui/Pagination';
import { SupplierFormComponent } from '@/features/suppliers/components/SupplierForm';
import type { Supplier } from '@/types';
import type { SupplierForm } from '@/features/suppliers/schemas';

export const SuppliersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSuppliers({ page, limit: 10 });
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState('');

  const handleSubmitForm = useCallback((formData: SupplierForm) => {
    if (editingSupplier) {
      updateSupplier({ id: editingSupplier._id, input: formData }, {
        onSuccess: () => {
          setShowSuccess('Proveedor actualizado exitosamente');
          setShowForm(false);
          setEditingSupplier(null);
        },
      });
    } else {
      createSupplier(formData, {
        onSuccess: () => {
          setShowSuccess('Proveedor creado exitosamente');
          setShowForm(false);
        },
      });
    }
  }, [editingSupplier, updateSupplier, createSupplier]);

  const handleEdit = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((supplier: Supplier) => {
    setConfirmDelete({ open: true, id: supplier._id, name: supplier.name });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingSupplier(null);
  }, []);

  if (isLoading) return <div className="text-sm text-brand-muted p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Proveedores</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona tus proveedores</p>
        </div>
        <button
          onClick={() => {
            if (showForm) handleCancel();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Proveedor'}
        </button>
      </div>

      {showForm && (
        <SupplierFormComponent
          key={editingSupplier?._id ?? 'new'}
          defaultValues={editingSupplier ? {
            name: editingSupplier.name,
            contactName: editingSupplier.contactName || '',
            email: editingSupplier.email || '',
            phone: editingSupplier.phone || '',
            address: editingSupplier.address || '',
            taxId: editingSupplier.taxId || '',
          } : undefined}
          isPending={isCreating || isUpdating}
          editingId={editingSupplier?._id}
          onSubmit={handleSubmitForm}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
          <Users className="w-4 h-4" />
          Lista de proveedores
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Contacto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-brand-muted">No hay proveedores registrados</td>
                </tr>
              ) : (
                data?.data?.map((supplier: Supplier) => (
                  <tr key={supplier._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{supplier.name}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{supplier.contactName}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{supplier.email}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{formatDate(supplier.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
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
      {data?.meta && <Pagination meta={data.meta} setPage={setPage} label="proveedor(es)" />}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) deleteSupplier(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar proveedor"
        message={`¿Estás seguro de eliminar al proveedor "${confirmDelete.name}"?`}
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
