import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../features/suppliers/hooks';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, type SupplierForm } from '../features/suppliers/schemas';
import { formatDate, formatNumber } from '../lib/utils';
import { Plus, Users, X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SuccessToast } from '../components/ui/SuccessToast';

export const SuppliersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSuppliers({ page, limit: 10 });
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmSave, setConfirmSave] = useState<{ open: boolean; isEdit: boolean }>({ open: false, isEdit: false });
  const [showSuccess, setShowSuccess] = useState('');
  const pendingData = useRef<SupplierForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    if (editingSupplier) {
      reset({
        name: editingSupplier.name,
        contactName: editingSupplier.contactName || '',
        email: editingSupplier.email || '',
        phone: editingSupplier.phone || '',
        address: editingSupplier.address || '',
        taxId: editingSupplier.taxId || '',
      });
    } else {
      reset({ name: '', contactName: '', email: '', phone: '', address: '', taxId: '' });
    }
  }, [editingSupplier, reset]);

  const onSubmit = (formData: SupplierForm) => {
    pendingData.current = formData;
    setConfirmSave({ open: true, isEdit: !!editingSupplier });
  };

  const handleConfirmSave = () => {
    const data = pendingData.current;
    if (!data) return;
    if (editingSupplier) {
      updateSupplier({ id: editingSupplier._id, input: data }, {
        onSuccess: () => {
          setShowSuccess('Proveedor actualizado exitosamente');
          setShowForm(false);
          setEditingSupplier(null);
        },
      });
    } else {
      createSupplier(data, {
        onSuccess: () => {
          setShowSuccess('Proveedor creado exitosamente');
          setShowForm(false);
          reset();
        },
      });
    }
    setConfirmSave({ open: false, isEdit: false });
    pendingData.current = null;
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = (supplier: any) => {
    setConfirmDelete({ open: true, id: supplier._id, name: supplier.name });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-sans font-semibold text-brand-text mb-4">
            {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
              <input {...register('name')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Contacto</label>
              <input {...register('contactName')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
              <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
              <input {...register('phone')} type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
              <input {...register('address')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">RFC</label>
              <input {...register('taxId')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
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
                data?.data?.map((supplier: any) => (
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
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p className="text-xs text-brand-muted">
            {formatNumber(data.meta.total)} proveedor(es) — Página {formatNumber(data.meta.page)} de {formatNumber(data.meta.totalPages)}
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
          if (confirmDelete.id) deleteSupplier(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar proveedor"
        message={`¿Estás seguro de eliminar al proveedor "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmSave.open}
        onClose={() => setConfirmSave({ open: false, isEdit: false })}
        onConfirm={handleConfirmSave}
        title={confirmSave.isEdit ? 'Guardar cambios' : 'Crear proveedor'}
        message={confirmSave.isEdit ? '¿Estás seguro de guardar los cambios en este proveedor?' : '¿Estás seguro de crear este nuevo proveedor?'}
        confirmText={confirmSave.isEdit ? 'Guardar cambios' : 'Crear proveedor'}
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
