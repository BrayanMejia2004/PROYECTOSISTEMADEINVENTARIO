import { useTenant, useBranches, useUpdateTenant, useCreateBranch, useUpdateBranch, useDeleteBranch, useUploadLogo } from '../features/settings/hooks';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantSettingsSchema, branchSchema, type TenantSettingsForm, type BranchForm } from '../features/settings/schemas';
import { useAuth } from '../hooks/useAuth';
import { Settings, Building2, Palette, Plus, X, Pencil, Trash2, Image, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SuccessToast } from '../components/ui/SuccessToast';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { refreshTenant } = useAuth();
  const { data: tenant } = useTenant();
  const { data: branches } = useBranches();
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant();
  const { mutate: createBranch, isPending: isCreatingBranch } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdatingBranch } = useUpdateBranch();
  const { mutate: deleteBranch } = useDeleteBranch();
  const { mutateAsync: uploadLogoMutation, isPending: isUploadingLogo } = useUploadLogo();
  const [activeTab, setActiveTab] = useState('tenant');
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [confirmDeleteBranch, setConfirmDeleteBranch] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [confirmTenantSave, setConfirmTenantSave] = useState(false);
  const [confirmBranchSave, setConfirmBranchSave] = useState<{ open: boolean; isEdit: boolean }>({ open: false, isEdit: false });
  const [showSuccess, setShowSuccess] = useState('');
  const [brandColor, setBrandColor] = useState('#2D8A4E');
  const [brandSidebar, setBrandSidebar] = useState('#1E293B');
  const pendingTenantData = useRef<TenantSettingsForm | null>(null);
  const pendingBranchData = useRef<BranchForm | null>(null);

  const {
    register: registerTenant,
    handleSubmit: handleTenantSubmit,
    formState: { errors: tenantErrors },
    reset: resetTenant,
  } = useForm<TenantSettingsForm>({
    resolver: zodResolver(tenantSettingsSchema),
  });

  useEffect(() => {
    if (tenant?.data) {
      resetTenant({
        name: tenant.data.name,
        email: tenant.data.email,
        phone: tenant.data.phone,
        address: tenant.data.address,
        nit: tenant.data.nit,
      });
      if (tenant.data.brandColor) setBrandColor(tenant.data.brandColor);
      if (tenant.data.brandSidebar) setBrandSidebar(tenant.data.brandSidebar);
    }
  }, [tenant?.data, resetTenant]);

  const onTenantSubmit = (data: TenantSettingsForm) => {
    pendingTenantData.current = data;
    setConfirmTenantSave(true);
  };

  const handleConfirmTenantSave = () => {
    if (pendingTenantData.current) {
      updateTenant(pendingTenantData.current, {
        onSuccess: () => {
          setShowSuccess('Configuración guardada exitosamente');
          refreshTenant();
        },
      });
    }
    setConfirmTenantSave(false);
    pendingTenantData.current = null;
  };

  const handleSaveBrandColor = () => {
    updateTenant({ brandColor } as any, {
      onSuccess: () => {
        setShowSuccess('Color guardado exitosamente');
        refreshTenant();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Error al guardar el color');
      },
    });
  };

  const handleSaveSidebarColor = () => {
    updateTenant({ brandSidebar } as any, {
      onSuccess: () => {
        setShowSuccess('Color del menú guardado exitosamente');
        refreshTenant();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Error al guardar el color');
      },
    });
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogoMutation(file);
      setShowSuccess('Logo actualizado exitosamente');
      refreshTenant();
    } catch {
      toast.error('Error al subir el logo');
    }
  };

  const {
    register: registerBranch,
    handleSubmit: handleBranchSubmit,
    formState: { errors: branchErrors },
    reset: resetBranch,
  } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
  });

  const resetBranchForm = () => {
    resetBranch({ name: '', address: '', phone: '' });
    setEditingBranch(null);
    setShowBranchForm(false);
  };

  const onBranchSubmit = (data: BranchForm) => {
    pendingBranchData.current = data;
    setConfirmBranchSave({ open: true, isEdit: !!editingBranch });
  };

  const handleConfirmBranchSave = () => {
    const data = pendingBranchData.current;
    if (!data) return;
    if (editingBranch) {
      updateBranch({ id: editingBranch._id, input: data }, {
        onSuccess: () => {
          setShowSuccess('Sucursal actualizada exitosamente');
          resetBranchForm();
        },
      });
    } else {
      createBranch(data, {
        onSuccess: () => {
          setShowSuccess('Sucursal creada exitosamente');
          resetBranchForm();
        },
      });
    }
    setConfirmBranchSave({ open: false, isEdit: false });
    pendingBranchData.current = null;
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    resetBranch({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
    });
    setShowBranchForm(true);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    setConfirmDeleteBranch({ open: true, id, name });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-brand-text">Configuración</h1>
        <p className="text-sm text-brand-muted mt-1">Administra tu empresa, sucursales y personalización</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('tenant')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'tenant' ? 'bg-white text-brand-text shadow-sm' : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <Settings className="w-4 h-4" />
          Tenant
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'branding' ? 'bg-white text-brand-text shadow-sm' : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <Palette className="w-4 h-4" />
          Personalización
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'branches' ? 'bg-white text-brand-text shadow-sm' : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Sucursales
        </button>
      </div>

      {activeTab === 'tenant' && (
        <div className="space-y-6">
          <form onSubmit={handleTenantSubmit(onTenantSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-sans font-semibold text-brand-text mb-4">Información del Tenant</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
                <input {...registerTenant('name')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                {tenantErrors.name && <p className="text-red-500 text-xs mt-1">{tenantErrors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
                <input {...registerTenant('email')} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                {tenantErrors.email && <p className="text-red-500 text-xs mt-1">{tenantErrors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">NIT</label>
                <input {...registerTenant('nit')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="12345678-9" />
                {tenantErrors.nit && <p className="text-red-500 text-xs mt-1">{tenantErrors.nit.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
                <input {...registerTenant('phone')} type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                {tenantErrors.phone && <p className="text-red-500 text-xs mt-1">{tenantErrors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
                <input {...registerTenant('address')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isUpdatingTenant} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
                {isUpdatingTenant ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-sans font-semibold text-brand-text mb-4">Logo de la Empresa</h3>
            <p className="text-sm text-brand-muted mb-4">Sube el logo de tu empresa para que aparezca en el sistema.</p>
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {tenant?.data?.logo ? (
                  <img src={tenant.data.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Image className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text hover:border-brand/40 transition-colors">
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Image className="w-4 h-4" />
                  )}
                  <span>{isUploadingLogo ? 'Subiendo...' : 'Seleccionar imagen'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleUploadLogo}
                    disabled={isUploadingLogo}
                  />
                </label>
                <p className="text-xs text-brand-muted mt-2">JPEG, PNG, WebP o AVIF. Máximo 5 MB.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-sans font-semibold text-brand-text mb-4">Color Corporativo</h3>
            <p className="text-sm text-brand-muted mb-4">Elige el color principal que identificará a tu empresa en el sistema.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  placeholder="#2D8A4E"
                />
              </div>
              <button
                onClick={handleSaveBrandColor}
                className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium shrink-0"
              >
                Guardar color
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-brand-muted">Vista previa:</span>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: brandColor }}>
                <span className="text-white text-sm font-medium">InventoPro</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-sans font-semibold text-brand-text mb-4">Color del Menú Lateral</h3>
            <p className="text-sm text-brand-muted mb-4">Personaliza el color de fondo del menú de navegación.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={brandSidebar}
                onChange={(e) => setBrandSidebar(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={brandSidebar}
                  onChange={(e) => setBrandSidebar(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  placeholder="#1E293B"
                />
              </div>
              <button
                onClick={handleSaveSidebarColor}
                className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium shrink-0"
              >
                Guardar color
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-brand-muted">Vista previa:</span>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: brandSidebar }}>
                <span className="text-white text-sm font-medium">Menú</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-brand-muted">
              <Building2 className="w-4 h-4" />
              Sucursales registradas
            </div>
            <button
              onClick={() => {
                if (showBranchForm) resetBranchForm();
                else setShowBranchForm(true);
              }}
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
            >
              {showBranchForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showBranchForm ? 'Cancelar' : 'Nueva Sucursal'}
            </button>
          </div>

          {showBranchForm && (
            <form onSubmit={handleBranchSubmit(onBranchSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
              <h3 className="font-sans font-semibold text-brand-text">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
                  <input {...registerBranch('name')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                  {branchErrors.name && <p className="text-red-500 text-xs mt-1">{branchErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
                  <input {...registerBranch('address')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
                  <input {...registerBranch('phone')} type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" />
                  {branchErrors.phone && <p className="text-red-500 text-xs mt-1">{branchErrors.phone.message}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isCreatingBranch || isUpdatingBranch} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
                  Guardar
                </button>
              </div>
            </form>
          )}

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
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-brand-muted">No hay sucursales registradas</td>
                    </tr>
                  ) : (
                    branches?.data?.map((branch: any) => (
                      <tr key={branch._id} className="hover:bg-brand-bg/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-brand-text">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-brand-muted">{branch.address || '—'}</td>
                        <td className="px-6 py-4 text-sm text-brand-muted">{branch.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            branch.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {branch.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditBranch(branch)}
                              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBranch(branch._id, branch.name)}
                              className="p-2.5 rounded-lg hover:bg-red-50 transition-colors text-brand-muted hover:text-red-600"
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
        </div>
      )}
      <ConfirmDialog
        open={confirmDeleteBranch.open}
        onClose={() => setConfirmDeleteBranch({ open: false })}
        onConfirm={() => {
          if (confirmDeleteBranch.id) {
            deleteBranch(confirmDeleteBranch.id, {
              onSuccess: () => setShowSuccess('Sucursal eliminada exitosamente'),
            });
          }
          setConfirmDeleteBranch({ open: false });
        }}
        title="Eliminar sucursal"
        message={`¿Estás seguro de eliminar la sucursal "${confirmDeleteBranch.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmTenantSave}
        onClose={() => setConfirmTenantSave(false)}
        onConfirm={handleConfirmTenantSave}
        title="Guardar cambios"
        message="¿Estás seguro de guardar los cambios en la configuración del tenant?"
        confirmText="Guardar cambios"
        variant="success"
      />

      <ConfirmDialog
        open={confirmBranchSave.open}
        onClose={() => setConfirmBranchSave({ open: false, isEdit: false })}
        onConfirm={handleConfirmBranchSave}
        title={confirmBranchSave.isEdit ? 'Guardar cambios' : 'Crear sucursal'}
        message={confirmBranchSave.isEdit ? '¿Estás seguro de guardar los cambios en esta sucursal?' : '¿Estás seguro de crear esta nueva sucursal?'}
        confirmText={confirmBranchSave.isEdit ? 'Guardar cambios' : 'Crear sucursal'}
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
