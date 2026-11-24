import { Info } from 'lucide-react';
import clsx from 'clsx';

interface SimulationBadgeProps {
  variant?: 'banner' | 'compact' | 'inline';
  className?: string;
}

/**
 * Aviso obrigatório de transparência (RN01, RN07, CA05):
 * Deixa explícito que a ocupação e as vagas livres são simuladas para demonstração acadêmica.
 */
export function SimulationBadge({
  variant = 'banner',
  className,
}: SimulationBadgeProps) {
  if (variant === 'compact') {
    return (
      <span
        data-testid="simulation-badge"
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-100',
          className
        )}
      >
        <Info className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
        <span>Dados simulados</span>
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span
        data-testid="simulation-badge"
        className={clsx(
          'inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/80',
          className
        )}
      >
        <Info className="h-3 w-3 shrink-0 text-amber-600" aria-hidden="true" />
        <span>Ocupação simulada (demonstração)</span>
      </span>
    );
  }

  return (
    <div
      role="note"
      data-testid="simulation-badge"
      className={clsx(
        'flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-xs',
        className
      )}
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Info className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="leading-snug">
        <p className="font-semibold text-amber-900">
          Ambiente de Demonstração — Ocupação Simulada
        </p>
        <p className="mt-0.5 text-xs text-amber-800/90">
          Os valores de vagas ocupadas e livres exibidos nesta tela são simulados para fins
          acadêmicos e não refletem monitoramento físico presencial.
        </p>
      </div>
    </div>
  );
}

