import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-7xl font-sans font-bold text-brand/20">404</p>
        <h1 className="text-2xl font-sans font-semibold text-brand-text mt-4">
          Página no encontrada
        </h1>
        <p className="text-brand-muted mt-2 text-sm">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};
