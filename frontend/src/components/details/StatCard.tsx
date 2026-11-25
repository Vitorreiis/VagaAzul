import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  tone: 'neutral' | 'success' | 'danger';
  subtitle?: string;
  testId?: string;
}

const TONE_MAP = {
  neutral: 'text-slate-900',
  success: 'text-emerald-600',
  danger: 'text-rose-600',
};

export function StatCard({
  label,
  value,
  tone,
  subtitle,
  testId,
}: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:py-5"
    >
      <span className="text-xs font-medium text-slate-600 sm:text-sm">
        {label}
      </span>
      <span
        className={clsx(
          'font-display mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl',
          TONE_MAP[tone]
        )}
      >
        {value}
      </span>
      {subtitle && (
        <span className="mt-1 text-[10px] font-medium tracking-wide text-slate-400 uppercase">
          {subtitle}
        </span>
      )}
    </div>
  );
}

