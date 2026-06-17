import { useState } from 'react';
import { Settings, Building2, Palette } from 'lucide-react';
import { TenantTab } from '@/features/settings/components/TenantTab';
import { BrandingTab } from '@/features/settings/components/BrandingTab';
import { BranchesTab } from '@/features/settings/components/BranchesTab';

const tabs = [
  { key: 'tenant', label: 'Tenant', icon: Settings },
  { key: 'branding', label: 'Personalización', icon: Palette },
  { key: 'branches', label: 'Sucursales', icon: Building2 },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('tenant');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-brand-text">Configuración</h1>
        <p className="text-sm text-brand-muted mt-1">Administra tu empresa, sucursales y personalización</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white text-brand-text shadow-sm' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'tenant' && <TenantTab />}
      {activeTab === 'branding' && <BrandingTab />}
      {activeTab === 'branches' && <BranchesTab />}
    </div>
  );
};
