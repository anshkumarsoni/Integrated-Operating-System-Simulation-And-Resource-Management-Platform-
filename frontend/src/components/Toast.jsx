import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils/helpers';

const ToastMessage = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-emerald-500/30 bg-emerald-500/10';
      case 'error': return 'border-rose-500/30 bg-rose-500/10';
      case 'warning': return 'border-amber-500/30 bg-amber-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className={cn(
      "flex items-start w-full max-w-sm p-4 mb-3 border rounded-lg shadow-lg pointer-events-auto bg-slate-900 backdrop-blur-md",
      getBorderColor()
    )}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-slate-200">
          {toast.message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={() => onRemove(toast.id)}
          className="inline-flex text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex flex-col items-end w-full">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default Toast;
