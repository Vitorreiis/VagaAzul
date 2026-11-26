
import clsx from 'clsx';
import type { StatusOcupacao } from '../../domain/models/Trecho';

interface StatusBadgeProps {
  status: StatusOcupacao;
  vagasLivres: number | null;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_STYLE: Record<
    StatusOcupacao,
    { container: string; dot: string; label: string }
> = {
  livre: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
    label: 'Livre',
  },
  pouca_vaga: {
    container: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500',
    label: 'Pouca vaga',
  },
  ocupado: {
    container: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-500',
    label: 'Ocupado',
  },
  indisponivel: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Indisponível',
  },
};

export function StatusBadge({
                              status,
                              vagasLivres,
                              size = 'md',
                              className,
                            }: StatusBadgeProps) {
  const statusExibicao: StatusOcupacao =
      vagasLivres === null
          ? 'indisponivel'
          : status;

  const style = STATUS_STYLE[statusExibicao];

  const textoVagas =
      statusExibicao === 'indisponivel'
          ? 'Indisponível'
          : vagasLivres === 1
              ? '1 livre'
              : `${vagasLivres} livres`;

  return (
      <span
          className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap',
              size === 'sm'
                  ? 'px-2.5 py-0.5 text-xs'
                  : 'px-3 py-1 text-xs sm:text-sm',
              style.container,
              className
          )}
          aria-label={
            statusExibicao === 'indisponivel'
                ? 'Dados de ocupação indisponíveis'
                : `${style.label}: ${textoVagas}`
          }
      >
      <span
          className={clsx(
              'h-2 w-2 rounded-full shrink-0',
              style.dot
          )}
          aria-hidden="true"
      />

      <span>{textoVagas}</span>
    </span>
  );
}

export function StatusLabel({
                              status,
                            }: {
  status: StatusOcupacao;
}) {
  const style = STATUS_STYLE[status];

  return (
      <span
          className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              style.container
          )}
      >
      <span
          className={clsx(
              'h-2 w-2 rounded-full',
              style.dot
          )}
          aria-hidden="true"
      />

      <span>{style.label}</span>
    </span>
  );
}
