
import clsx from 'clsx';
import type { FiltroDisponibilidade } from '../../domain/models/Trecho';

interface FilterOption {
  id: FiltroDisponibilidade;
  label: string;
  count: number;
}

interface FilterPillsProps {
  activeFilter: FiltroDisponibilidade;
  onSelectFilter: (filter: FiltroDisponibilidade) => void;
  counts: {
    todos: number;
    livres: number;
    pouca_vaga: number;
    ocupados: number;
  };
}

export function FilterPills({
                              activeFilter,
                              onSelectFilter,
                              counts,
                            }: FilterPillsProps) {
  const options: FilterOption[] = [
    {
      id: 'todos',
      label: 'Todos',
      count: counts.todos,
    },
    {
      id: 'livres',
      label: 'Livres',
      count: counts.livres,
    },
    {
      id: 'pouca_vaga',
      label: 'Pouca vaga',
      count: counts.pouca_vaga,
    },
    {
      id: 'ocupados',
      label: 'Ocupados',
      count: counts.ocupados,
    },
  ];

  return (
      <div
          role="group"
          aria-label="Filtrar trechos por disponibilidade simulada"
          className="flex flex-wrap items-center gap-2"
      >
        {options.map((opt) => {
          const active = activeFilter === opt.id;

          return (
              <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  data-testid={`filter-pill-${opt.id}`}
                  onClick={() => onSelectFilter(opt.id)}
                  className={clsx(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                      active
                          ? 'bg-[#1463E3] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  )}
              >
                <span>{opt.label}</span>

                <span
                    className={clsx(
                        'rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
                        active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                    )}
                >
              {opt.count}
            </span>
              </button>
          );
        })}
      </div>
  );
}
