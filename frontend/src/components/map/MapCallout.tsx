import { ChevronRight, X } from 'lucide-react';
import { TrechoCalculado } from '../../domain/models/Trecho';
import { SimulationBadge } from '../common/SimulationBadge';
import { StatusBadge } from '../common/StatusBadge';

interface MapCalloutProps {
  trecho: TrechoCalculado;
  onOpenDetails: (trecho: TrechoCalculado) => void;
  onClose: () => void;
}

/**
 * Cartão flutuante exibido ao clicar em um marcador no mapa (Tela 1 da imagem + RN01).
 */
export function MapCallout({
  trecho,
  onOpenDetails,
  onClose,
}: MapCalloutProps) {
  return (
    <div
      data-testid="map-callout"
      role="dialog"
      aria-label={`Resumo do trecho ${trecho.logradouro}`}
      className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_14px_34px_-8px_rgba(15,23,42,0.22)] backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wide text-[#0B46A0] uppercase">
              {trecho.bairroExibicao}
            </span>
            <span className="text-slate-300" aria-hidden="true">
              •
            </span>
            <span className="font-mono text-[11px] text-slate-400">{trecho.id}</span>
          </div>
          <h3 className="font-display mt-0.5 truncate text-base font-bold text-slate-900">
            {trecho.logradouro}
          </h3>
          {trecho.referencia && (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
              {trecho.referencia}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar resumo do trecho"
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">
            {trecho.vagasTotais} vagas
          </span>
          <StatusBadge status={trecho.status} vagasLivres={trecho.vagasLivres} size="sm" />
        </div>
        <SimulationBadge variant="inline" />
      </div>

      <button
        type="button"
        data-testid="callout-ver-detalhes"
        onClick={() => onOpenDetails(trecho)}
        className="mt-3.5 flex w-full items-center justify-between rounded-xl bg-[#1463E3] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0B46A0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span>Ver detalhes completos</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

