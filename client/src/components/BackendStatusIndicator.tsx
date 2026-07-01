import React from 'react';
import { useBackendStatus } from '../context/BackendStatusContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BackendStatusIndicator: React.FC = () => {
  const { status, lastChecked } = useBackendStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Backend Connected',
          bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-400'
        };
      case 'disconnected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Backend Disconnected - Waking up...',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-700 dark:text-yellow-300',
          borderColor: 'border-yellow-400'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting to Backend...',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} flex items-center gap-2 shadow-lg`}>
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
      {lastChecked && (
        <span className="text-xs opacity-70 ml-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default BackendStatusIndicator;
