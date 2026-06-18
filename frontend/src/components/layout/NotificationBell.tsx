import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '@/api/axios';
import { cn } from '@/lib/utils';

const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.data?.count ?? 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=5');
      setNotifications(data.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[18px] min-h-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-border z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-brand-text">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-brand hover:text-brand-dark flex items-center gap-1">
                <CheckCheck className="h-3 w-3" /> Leer todas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-brand-muted">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {loading ? 'Cargando...' : 'Sin notificaciones'}
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={cn(
                    'px-4 py-3 border-b border-border-light last:border-b-0 hover:bg-surface-hover transition-colors cursor-pointer',
                    !n.read && 'bg-blue-50/50'
                  )}
                  onClick={() => { if (!n.read) markAsRead(n._id); }}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('mt-1 w-2 h-2 rounded-full shrink-0', n.read ? 'bg-transparent' : 'bg-brand')} />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', n.read ? 'text-brand-text' : 'font-semibold text-brand-text')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-brand-muted mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-brand-muted mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
