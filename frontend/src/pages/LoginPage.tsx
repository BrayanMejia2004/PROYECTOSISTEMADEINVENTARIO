import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
  tenantSlug: z.string().min(1, 'Slug del tenant requerido'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password, data.tenantSlug);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Error al iniciar sesión'));
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg shadow-green-900/5 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-sans font-semibold text-brand-text">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Ingresa a tu panel de inventario
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Slug del Tenant
              </label>
              <input
                {...register('tenantSlug')}
                placeholder="mi-empresa"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {errors.tenantSlug && (
                <p className="text-red-500 text-xs mt-1">{errors.tenantSlug.message}</p>
              )}
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
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            ¿Nueva empresa?{' '}
            <Link to="/register" className="text-brand hover:text-brand-dark font-medium transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
