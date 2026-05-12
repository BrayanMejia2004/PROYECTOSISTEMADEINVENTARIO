import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../features/categories/hooks';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Tag, Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SuccessToast } from '../components/ui/SuccessToast';

export const CategoriesPage = () => {
  const { user } = useAuth();

  if (user?.role === 'owner') return <Navigate to="/" replace />;
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCategories({ page, limit: 10 });
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmSave, setConfirmSave] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');

  const resetForm = () => {
    setName('');
    setEditingCategory(null);
    setShowForm(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setConfirmSave(true);
  };

  const handleConfirmSave = () => {
    if (editingCategory) {
      updateCategory({ id: editingCategory._id, input: { name: name.trim() } }, {
        onSuccess: () => {
          setShowSuccess('Categoría actualizada exitosamente');
          resetForm();
        },
      });
    } else {
      createCategory({ name: name.trim() }, {
        onSuccess: () => {
          setShowSuccess('Categoría creada exitosamente');
          resetForm();
        },
      });
    }
    setConfirmSave(false);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setShowForm(true);
  };

  const handleDelete = (category: any) => {
    setConfirmDelete({ open: true, id: category._id, name: category.name });
  };

  if (isLoading) return <div className="text-sm text-brand-muted p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Categorías</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona las categorías de productos</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 max-w-md">
          <h3 className="font-sans font-semibold text-brand-text mb-4">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              placeholder="Nombre de la categoría"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isCreating || isUpdating || !name.trim()} className="bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
              {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
          <Tag className="w-4 h-4" />
          Lista de categorías
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
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-brand-muted">No hay categorías registradas</td>
                </tr>
              ) : (
                data?.data?.map((category: any) => (
                  <tr key={category._id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{category.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        category.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {category.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-600"
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
            {data.meta.total} categoría(s) — Página {data.meta.page} de {data.meta.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={data.meta.page <= 1}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.meta!.totalPages!, p + 1))}
              disabled={data.meta.page >= data.meta.totalPages}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
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
          if (confirmDelete.id) deleteCategory(confirmDelete.id);
          setConfirmDelete({ open: false });
        }}
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar la categoría "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title={editingCategory ? 'Guardar cambios' : 'Crear categoría'}
        message={editingCategory ? '¿Estás seguro de guardar los cambios en esta categoría?' : '¿Estás seguro de crear esta nueva categoría?'}
        confirmText={editingCategory ? 'Guardar cambios' : 'Crear categoría'}
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
