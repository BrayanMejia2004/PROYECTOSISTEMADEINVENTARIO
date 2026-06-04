import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerTenantSchema, type RegisterTenantForm } from '../features/auth/schemas';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Store } from 'lucide-react';

export const RegisterTenantPage = () => {
  const navigate = useNavigate();
  const { registerTenant } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTenantForm>({
    resolver: zodResolver(registerTenantSchema),
  });

  const onSubmit = async (data: RegisterTenantForm) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      await registerTenant(payload);
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al registrar. Verifica los datos.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-green-900/5 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-sans font-semibold text-brand-text">
              Registrar Empresa
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Crea tu cuenta para empezar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">
                  Nombre
                </label>
                <input
                  {...register('firstName')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">
                  Apellido
                </label>
                <input
                  {...register('lastName')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Nombre de la Empresa
              </label>
              <input
                {...register('tenantName')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.tenantName && <p className="text-red-500 text-xs mt-1">{errors.tenantName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Slug del Tenant
              </label>
              <input
                {...register('tenantSlug')}
                placeholder="mi-empresa"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.tenantSlug && <p className="text-red-500 text-xs mt-1">{errors.tenantSlug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Confirmar Contraseña
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand hover:text-brand-dark font-medium transition-colors">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
