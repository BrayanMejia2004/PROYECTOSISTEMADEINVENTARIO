import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';

const BREAKPOINT = 640;

export const MobileBlocker = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`).matches);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-xl font-sans font-bold text-brand-text mb-3">
            Aplicación no disponible en dispositivos móviles
          </h1>
          <p className="text-sm text-brand-muted leading-relaxed">
            Esta aplicación solo está disponible en tablets, laptops y computadoras de escritorio.
            Por favor, accede desde un dispositivo con pantalla más grande.
          </p>
        </div>
      </div>
    );
  }

  return children;
};
