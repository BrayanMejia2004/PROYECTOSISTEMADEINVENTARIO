import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/features/customers/hooks';
import { useState, useCallback } from 'react';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';
import { Plus, Users, X, Pencil, Trash2, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip } from '@/components/ui/Tooltip';
import { CustomerFormComponent } from '@/features/customers/components/CustomerForm';
import type { Customer } from '@/types';
import type { CustomerForm } from '@/features/customers/schemas';

export const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useCustomers({ search: search || undefined, page, limit: 10 });
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState('');

  const handleSubmitForm = useCallback((formData: CustomerForm) => {
    if (editingCustomer) {
      updateCustomer({ id: editingCustomer._id, input: formData }, {
        onSuccess: () => {
          setShowSuccess('Cliente actualizado exitosamente');
          setShowForm(false);
          setEditingCustomer(null);
        },
      });
    } else {
      createCustomer(formData, {
        onSuccess: () => {
          setShowSuccess('Cliente creado exitosamente');
          setShowForm(false);
        },
      });
    }
  }, [editingCustomer, updateCustomer, createCustomer]);

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((customer: Customer) => {
    setConfirmDelete({ open: true, id: customer._id, name: customer.name });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingCustomer(null);
  }, []);

  if (isLoading) return <TableSkeleton rows={5} columns={7} />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;

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
        <CustomerFormComponent
          key={editingCustomer?._id ?? 'new'}
          defaultValues={editingCustomer ? {
            name: editingCustomer.name,
            phone: editingCustomer.phone || '',
            email: editingCustomer.email || '',
            address: editingCustomer.address || '',
            taxId: editingCustomer.taxId || '',
          } : undefined}
          isPending={isCreating || isUpdating}
          editingId={editingCustomer?._id}
          onSubmit={handleSubmitForm}
          onCancel={handleCancel}
        />
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
                  <td colSpan={7}>
                    <EmptyState icon={Users} title="Sin clientes" description="Crea tu primer cliente para comenzar" />
                  </td>
                </tr>
              ) : (
                data?.data?.map((customer: Customer) => (
                  <tr key={customer._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-center text-brand-muted">{formatNumber(customer.totalPurchases)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-brand-text">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted">{customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Editar">
                          <button onClick={() => handleEdit(customer)} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <button onClick={() => handleDelete(customer)} className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-500">
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
      {data?.meta && <Pagination meta={data.meta} setPage={setPage} label="cliente(s)" />}
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

      <SuccessToast
        open={!!showSuccess}
        onClose={() => setShowSuccess('')}
        message={showSuccess}
      />
    </div>
  );
};
