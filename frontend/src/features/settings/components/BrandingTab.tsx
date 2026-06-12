import { useState, useEffect } from 'react';
import { useTenant, useUpdateTenant, useUploadLogo } from '../hooks';
import { useAuth } from '../../../hooks/useAuth';
import { Image, Loader2 } from 'lucide-react';
import { SuccessToast } from '../../../components/ui/SuccessToast';
import toast from 'react-hot-toast';

export const BrandingTab = () => {
  const { refreshTenant } = useAuth();
  const { data: tenant } = useTenant();
  const { mutate: updateTenant } = useUpdateTenant();
  const { mutateAsync: uploadLogoMutation, isPending: isUploadingLogo } = useUploadLogo();
  const [showSuccess, setShowSuccess] = useState('');
  const [brandColor, setBrandColor] = useState('#2D8A4E');
  const [brandSidebar, setBrandSidebar] = useState('#1E293B');

  useEffect(() => {
    if (tenant?.data) {
      if (tenant.data.brandColor) setBrandColor(tenant.data.brandColor);
      if (tenant.data.brandSidebar) setBrandSidebar(tenant.data.brandSidebar);
    }
  }, [tenant?.data]);

  const handleSaveBrandColor = () => {
    updateTenant({ brandColor } as any, {
      onSuccess: () => { setShowSuccess('Color guardado exitosamente'); refreshTenant(); },
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Error al guardar el color'),
    });
  };

  const handleSaveSidebarColor = () => {
    updateTenant({ brandSidebar } as any, {
      onSuccess: () => { setShowSuccess('Color del menú guardado exitosamente'); refreshTenant(); },
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Error al guardar el color'),
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

  return (
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
              {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              <span>{isUploadingLogo ? 'Subiendo...' : 'Seleccionar imagen'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleUploadLogo} disabled={isUploadingLogo} />
            </label>
            <p className="text-xs text-brand-muted mt-2">JPEG, PNG, WebP o AVIF. Máximo 5 MB.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-sans font-semibold text-brand-text mb-4">Color Corporativo</h3>
        <p className="text-sm text-brand-muted mb-4">Elige el color principal que identificará a tu empresa en el sistema.</p>
        <div className="flex items-center gap-4">
          <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
          <div className="flex-1">
            <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="#2D8A4E" />
          </div>
          <button onClick={handleSaveBrandColor} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium shrink-0">Guardar color</button>
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
          <input type="color" value={brandSidebar} onChange={(e) => setBrandSidebar(e.target.value)} className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
          <div className="flex-1">
            <input type="text" value={brandSidebar} onChange={(e) => setBrandSidebar(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text font-mono focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="#1E293B" />
          </div>
          <button onClick={handleSaveSidebarColor} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium shrink-0">Guardar color</button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-brand-muted">Vista previa:</span>
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: brandSidebar }}>
            <span className="text-white text-sm font-medium">Menú</span>
          </div>
        </div>
      </div>

      <SuccessToast open={!!showSuccess} onClose={() => setShowSuccess('')} message={showSuccess} />
    </div>
  );
};
