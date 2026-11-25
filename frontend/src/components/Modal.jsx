import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/helpers';

const Modal = ({ isOpen, onClose, title, children, size = 'md', theme = 'light', className = '' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-7xl'
  };

  const isLight = theme === 'light' || theme === 'calm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4">
      <div 
        className={cn(
          "fixed inset-0 transition-opacity backdrop-blur-sm",
          isLight ? "bg-slate-900/40" : "bg-black/70"
        )} 
        onClick={onClose}
      ></div>
      
      <div className={cn(
        "relative w-full rounded-2xl shadow-2xl transform transition-all",
        isLight 
          ? "bg-[#f0f7ff] border border-blue-200 text-slate-800 shadow-blue-900/10" 
          : "bg-slate-900 border border-slate-700 text-slate-100",
        sizeClasses[size] || sizeClasses.md,
        className
      )}>
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          isLight ? "border-blue-100 bg-white rounded-t-2xl" : "border-slate-800"
        )}>
          <h3 className={cn("text-lg font-semibold", isLight ? "text-slate-800" : "text-slate-100")}>{title}</h3>
          <button 
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isLight 
                ? "text-blue-500 hover:text-blue-800 hover:bg-blue-50" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[82vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
