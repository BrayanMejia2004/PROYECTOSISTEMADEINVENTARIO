import { createContext, useContext, useState, ReactNode } from 'react';
import type { Branch } from '@/types';

interface BranchContextType {
  activeBranch: Branch | null;
  setActiveBranch: (branch: Branch) => void;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  return (
    <BranchContext.Provider
      value={{
        activeBranch,
        setActiveBranch,
        branches,
        setBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};
