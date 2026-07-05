import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type BackendStatus = 'connected' | 'disconnected' | 'connecting';

interface BackendStatusContextType {
  status: BackendStatus;
  lastChecked: Date | null;
  checkBackend: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<BackendStatus>('connecting');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkBackend = async () => {
    try {
      const response = await fetch('/api');
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <BackendStatusContext.Provider value={{ status, lastChecked, checkBackend }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (context === undefined) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
};
