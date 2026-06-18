import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const BlockedPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-red-900/5 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-brand-danger" />
          </div>

          <h1 className="text-xl font-sans font-semibold text-brand-text mb-2">
            Acceso Bloqueado
          </h1>
          <p className="text-brand-muted text-sm mb-6">
            Su suscripción ha expirado. Por favor, contacte al administrador para
            reactivar el servicio y poder seguir usando el sistema.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <h2 className="text-sm font-semibold text-brand-text">
              Contacte a su administrador:
            </h2>
            <div className="flex items-center gap-3 text-sm text-brand-muted">
              <Mail className="h-4 w-4 text-brand" />
              <span>admin@inventopro.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-muted">
              <Phone className="h-4 w-4 text-brand" />
              <span>+573024550409</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium text-sm"
          >
            Entendido, volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
