import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        bg-slate-900/40 
        backdrop-blur-xl 
        border border-white/10 
        rounded-2xl 
        shadow-2xl 
        shadow-black/50
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm text-slate-400 font-medium">{label}</label>}
      <input 
        className={`
          bg-slate-800/50 
          border border-slate-700 
          focus:border-blue-500/50 
          focus:ring-2 focus:ring-blue-500/20 
          text-white 
          placeholder-slate-500 
          rounded-lg 
          px-4 py-2 
          outline-none 
          transition-all 
          duration-200
          hover:bg-slate-800/70
          ${className}
        `}
        {...props} 
      />
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  let variantStyles = "";
  switch(variant) {
    case 'primary':
      variantStyles = "bg-blue-600/80 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20";
      break;
    case 'secondary':
      variantStyles = "bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600";
      break;
    case 'danger':
      variantStyles = "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20";
      break;
  }

  return (
    <button 
      className={`
        px-4 py-2 
        rounded-lg 
        font-medium 
        transition-all 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        backdrop-blur-sm
        ${variantStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
