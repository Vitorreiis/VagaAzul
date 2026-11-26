
import { ChevronRight, MapPin, MapPinOff } from 'lucide-react';
import type { TrechoCalculado } from '../../domain/models/Trecho';
import { StatusBadge } from '../common/StatusBadge';

interface TrechoCardProps {
  trecho: TrechoCalculado;
  onSelect: (trecho: TrechoCalculado) => void;
}

export function TrechoCard({
                             trecho,
                             onSelect,
                           }: TrechoCardProps) {
  const totalValido =
      Number.isSafeInteger(trecho.quantidadeTotalVagas) &&
      trecho.quantidadeTotalVagas > 0;

  return (
      <button
          type="button"
          data-testid={`trecho-card-${trecho.id}`}
          onClick={() => onSelect(trecho)}
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-left shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] transition hover:border-blue-300 hover:shadow-[0_8px_24px_-6px_rgba(20,99,227,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-5 sm:py-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display break-words text-sm font-bold text-slate-900 group-hover:text-[#0B46A0] sm:text-base">
              {trecho.logradouro}
            </h3>

            {!trecho.exibirNoMapa && (
                <span
                    data-testid={`badge-sem-mapa-${trecho.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    title="Coordenadas indisponíveis ou pendentes de validação"
                >
              <MapPinOff
                  className="h-3 w-3 shrink-0 text-slate-500"
                  aria-hidden="true"
              />

              <span>Sem mapa</span>
            </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 sm:text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <MapPin
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
            />

            {trecho.bairroExibicao}
          </span>

            <span
                aria-hidden="true"
                className="text-slate-300"
            >
            •
          </span>

            <span>
            {totalValido
                ? `${trecho.quantidadeTotalVagas} ${
                    trecho.quantidadeTotalVagas === 1
                        ? 'vaga total'
                        : 'vagas totais'
                }`
                : 'Capacidade indisponível'}
          </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex flex-col items-end">
            <StatusBadge
                status={trecho.status}
                vagasLivres={trecho.vagasLivres}
                size="sm"
            />

            <span className="mt-1 text-[10px] font-medium tracking-wide text-slate-600 uppercase">
            simulado
          </span>
          </div>

          <ChevronRight
              className="h-4.5 w-4.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1463E3]"
              aria-hidden="true"
          />
        </div>
      </button>
  );
}
