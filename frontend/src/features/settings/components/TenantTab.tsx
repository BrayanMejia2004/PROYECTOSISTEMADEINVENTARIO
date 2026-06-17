import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTenant, useUpdateTenant } from '@/features/settings/hooks';
import { useAuth } from '@/hooks/useAuth';
import { tenantSettingsSchema, type TenantSettingsForm } from '@/features/settings/schemas';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SuccessToast } from '@/components/ui/SuccessToast';

export const TenantTab = () => {
  const { refreshTenant } = useAuth();
  const { data: tenant } = useTenant();
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant();
  const [confirmSave, setConfirmSave] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');
  const pendingData = useRef<TenantSettingsForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenantSettingsForm>({
    resolver: zodResolver(tenantSettingsSchema),
  });

  useEffect(() => {
    if (tenant?.data) {
      reset({
        name: tenant.data.name,
        email: tenant.data.email,
        phone: tenant.data.phone,
        address: tenant.data.address,
        nit: tenant.data.nit,
      });
    }
  }, [tenant?.data, reset]);

  const onSubmit = (data: TenantSettingsForm) => {
    pendingData.current = data;
    setConfirmSave(true);
  };

  const handleConfirm = () => {
    if (pendingData.current) {
      updateTenant(pendingData.current, {
        onSuccess: () => {
          setShowSuccess('Configuración guardada exitosamente');
          refreshTenant();
        },
      });
    }
    setConfirmSave(false);
    pendingData.current = null;
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-sans font-semibold text-brand-text mb-4">Información del Tenant</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Email</label>
            <input {...register('email')} type="email" className={inputClass} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">NIT</label>
            <input {...register('nit')} className={inputClass} placeholder="12345678-9" />
            {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Teléfono</label>
            <input {...register('phone')} type="tel" className={inputClass} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">Dirección</label>
            <input {...register('address')} className={inputClass} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isUpdatingTenant} className="bg-brand text-white px-5 py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50">
            {isUpdatingTenant ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirm}
        title="Guardar cambios"
        message="¿Estás seguro de guardar los cambios en la configuración del tenant?"
        confirmText="Guardar cambios"
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
