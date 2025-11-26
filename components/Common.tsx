import React from 'react';

export const PixelCard = ({ children, className = "", noPadding = false }: { children?: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-farm-card border-4 border-farm-border shadow-pixel ${className}`}>
    {children}
  </div>
);

export const PixelBtn = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  fullWidth = false 
}: { 
  children?: React.ReactNode, 
  onClick?: () => void, 
  className?: string, 
  disabled?: boolean,
  fullWidth?: boolean
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      relative border-4 border-farm-border font-bold uppercase tracking-widest transition-all text-sm font-pixel
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' : 'active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer hover:brightness-110'}
      ${fullWidth ? 'w-full' : ''}
      ${!disabled ? 'shadow-pixel' : ''}
      ${className}
    `}
  >
    {children}
  </button>
);

export const PixelInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full bg-[#FFFBF0] border-2 border-farm-border p-2 font-pixel text-sm outline-none focus:bg-[#fffbe6] focus:border-[#6DA34D] transition-colors placeholder-[#8C7B65]"
  />
);

export const PixelTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className="w-full bg-[#FFFBF0] border-2 border-farm-border p-2 font-pixel text-sm outline-none focus:bg-[#fffbe6] focus:border-[#6DA34D] transition-colors placeholder-[#8C7B65]"
  />
);

export const Toast = ({ message, show }: { message: string, show: boolean }) => (
  <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#5C4033] border-4 border-[#E8DCCA] text-[#E8DCCA] px-6 py-4 shadow-pixel transition-all duration-300 z-50 flex items-center gap-4 pointer-events-none ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
    <i className="fa-solid fa-angles-up text-2xl animate-bounce text-yellow-400"></i>
    <div className="flex flex-col">
      <span className="text-xs text-yellow-400 font-retro">SYSTEM</span>
      <span className="text-lg font-bold font-pixel">{message}</span>
    </div>
  </div>
);