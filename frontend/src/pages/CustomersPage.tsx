import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/features/customers/hooks';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerForm } from '@/features/customers/schemas';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';
import { Plus, Users, X, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';

export const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomers({ search: search || undefined, page, limit: 10 });
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmSave, setConfirmSave] = useState<{ open: boolean; isEdit: boolean }>({ open: false, isEdit: false });
  const [showSuccess, setShowSuccess] = useState('');
  const pendingData = useRef<CustomerForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (editingCustomer) {
      reset({
        name: editingCustomer.name,
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        address: editingCustomer.address || '',
        taxId: editingCustomer.taxId || '',
      });
    } else {
      reset({ name: '', phone: '', email: '', address: '', taxId: '' });
    }
  }, [editingCustomer, reset]);

  const onSubmit = (formData: CustomerForm) => {
    pendingData.current = formData;
    setConfirmSave({ open: true, isEdit: !!editingCustomer });
  };

  const handleConfirmSave = () => {
    const data = pendingData.current;
    if (!data) return;
    if (editingCustomer) {
      updateCustomer({ id: editingCustomer._id, input: data }, {
        onSuccess: () => {
          setShowSuccess('Cliente actualizado exitosamente');
          setShowForm(false);
          setEditingCustomer(null);
        },
      });
    } else {
      createCustomer(data, {
        onSuccess: () => {
          setShowSuccess('Cliente creado exitosamente');
          setShowForm(false);
          reset();
        },
      });
    }
    setConfirmSave({ open: false, isEdit: false });
    pendingData.current = null;
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (customer: any) => {
    setConfirmDelete({ open: true, id: customer._id, name: customer.name });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (isLoading) return <div className="text-sm text-brand-muted p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Clientes</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona tus clientes</p>
        </div>
        <button
          onClick={() => { if (showForm) handleCancel(); else setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-sans font-semibold text-brand-text mb-4">
            {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          Lista de clientes
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar cliente..."
              className="pl-9 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all w-full sm:w-56"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Teléfono</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Email</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Compras</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Gastado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Última Compra</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-brand-muted">No hay clientes registrados</td>
                </tr>
              ) : (
                data?.data?.map((customer: any) => (
                  <tr key={customer._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-center text-brand-muted">{formatNumber(customer.totalPurchases)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-brand-text">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(customer)} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(customer)} className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-500" title="Eliminar">
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
            {formatNumber(data.meta.total)} cliente(s) — Página {formatNumber(data.meta.page)} de {formatNumber(data.meta.totalPages)}
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
          if (confirmDelete.id) deleteCustomer(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar al cliente "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmSave.open}
        onClose={() => setConfirmSave({ open: false, isEdit: false })}
        onConfirm={handleConfirmSave}
        title={confirmSave.isEdit ? 'Guardar cambios' : 'Crear cliente'}
        message={confirmSave.isEdit ? '¿Estás seguro de guardar los cambios en este cliente?' : '¿Estás seguro de crear este nuevo cliente?'}
        confirmText={confirmSave.isEdit ? 'Guardar cambios' : 'Crear cliente'}
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
