import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function inputClass(hasError?: boolean) {
  return cn(
    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors',
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
    hasError ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
  );
}