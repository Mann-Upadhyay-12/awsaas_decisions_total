import { createContext, useContext, useState, type ReactNode } from 'react';
import { useAWSaaS, type Strategy } from '../hooks/useAWSaaS';

interface ContextType {
  strategy: Strategy | null;
  loading: boolean;
  error: string | null;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  refetch: () => Promise<void>;
}

const AWSaaSContext = createContext<ContextType | undefined>(undefined);

export const AWSaaSProvider = ({ children }: { children: ReactNode }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const data = useAWSaaS();
  
  return (
    <AWSaaSContext.Provider value={{ ...data, isEnabled, setIsEnabled }}>
      {children}
    </AWSaaSContext.Provider>
  );
};

export const useAWSaaSContext = () => {
  const context = useContext(AWSaaSContext);
  if (!context) {
    throw new Error('useAWSaaSContext must be used within AWSaaSProvider');
  }
  return context;
};
