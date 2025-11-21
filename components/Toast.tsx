
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [{ id, message, type }, ...prevToasts]); // Add to the top
    const timer = setTimeout(() => {
      removeToast(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const toastStyles = {
    success: 'bg-green-500/95 border-green-600 dark:bg-green-600/95 dark:border-green-700',
    error: 'bg-red-500/95 border-red-600 dark:bg-red-600/95 dark:border-red-700',
    info: 'bg-gray-800/95 border-gray-900 dark:bg-gray-700/95 dark:border-gray-600',
  };
  
  const iconStyles = {
    success: 'M10 15l-3.89-3.89a.996.996 0 111.41-1.41L10 12.17l5.48-5.48a.996.996 0 111.41 1.41L10 15z',
    error: 'M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z',
    info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center text-white p-3 rounded-lg shadow-2xl border-l-4 ${toastStyles[toast.type]} animate-toast-in`}
            role="alert"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d={iconStyles[toast.type]}/></svg>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-white/80 hover:text-white focus:outline-none" aria-label="Close">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
