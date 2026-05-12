import { createContext, useContext, useState, ReactNode } from 'react';
import type { IBranch } from '../types';

interface BranchContextType {
  activeBranch: IBranch | null;
  setActiveBranch: (branch: IBranch) => void;
  branches: IBranch[];
  setBranches: (branches: IBranch[]) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [activeBranch, setActiveBranch] = useState<IBranch | null>(null);
  const [branches, setBranches] = useState<IBranch[]>([]);

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
