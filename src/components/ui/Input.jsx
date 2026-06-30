import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        ref={ref}
        className={`
          w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-900
          placeholder:text-gray-400 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}
          ${icon ? 'pl-10' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
