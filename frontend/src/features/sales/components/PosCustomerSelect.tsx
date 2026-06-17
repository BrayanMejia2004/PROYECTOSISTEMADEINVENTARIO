import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerForm } from '@/features/customers/schemas';
import { useCustomers, useCreateCustomer } from '@/features/customers/hooks';
import { Search, Plus, X, User, Check } from 'lucide-react';

interface PosCustomerSelectProps {
  selectedCustomer: { name: string; phone?: string } | null;
  onSelectCustomer: (customer: { name: string; phone?: string } | null) => void;
}

export const PosCustomerSelect = ({ selectedCustomer, onSelectCustomer }: PosCustomerSelectProps) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: customersData } = useCustomers(search ? { search, limit: 10 } : undefined);
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const customers = customersData?.data ?? [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer: { name: string; phone?: string }) => {
    onSelectCustomer(customer);
    setSearch('');
    setShowDropdown(false);
  };

  const onCreateCustomer = (data: CustomerForm) => {
    createCustomer(
      { name: data.name.trim(), phone: data.phone?.trim() || undefined },
      {
        onSuccess: (res) => {
          onSelectCustomer({ name: res.data.name, phone: res.data.phone });
          resetForm();
          setShowCreateForm(false);
          setShowDropdown(false);
        },
      }
    );
  };

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between bg-brand/5 rounded-lg px-3 py-2.5 border border-brand/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-text">{selectedCustomer.name}</p>
            {selectedCustomer.phone && (
              <p className="text-xs text-brand-muted">{selectedCustomer.phone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { onSelectCustomer(null); setSearch(''); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Quitar cliente"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar cliente..."
            className="w-full pl-8 pr-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-1.5 px-3 py-3 rounded-lg border border-dashed border-gray-300 text-sm text-brand-muted hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Crear
        </button>
      </div>

      {showDropdown && search && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
          {customers.length === 0 ? (
            <p className="text-sm text-brand-muted text-center py-4">Sin resultados</p>
          ) : (
            customers.map((c: any) => (
              <button
                key={c._id}
                onClick={() => handleSelect({ name: c.name, phone: c.phone })}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-brand-bg transition-colors text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-brand-muted" />
                </div>
                <div>
                  <p className="font-medium text-brand-text">{c.name}</p>
                  {c.phone && <p className="text-xs text-brand-muted">{c.phone}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleSubmit(onCreateCustomer)} className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
          <div>
            <input
              {...register('name')}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all"
              autoFocus
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input
              {...register('phone')}
              placeholder="Teléfono (opcional)"
              className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
