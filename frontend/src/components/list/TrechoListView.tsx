import { Search, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import { FiltroDisponibilidade, TrechoCalculado } from '../../domain/models/Trecho';
import { filtrarTrechos } from '../../domain/services/trechosService';
import { SimulationBadge } from '../common/SimulationBadge';
import { FilterPills } from './FilterPills';
import { TrechoCard } from './TrechoCard';

interface TrechoListViewProps {
  trechos: TrechoCalculado[];
  busca: string;
  onChangeBusca: (valor: string) => void;
  filtro: FiltroDisponibilidade;
  onChangeFiltro: (filtro: FiltroDisponibilidade) => void;
  bairroFiltro: string;
  onChangeBairroFiltro: (bairro: string) => void;
  onSelectTrecho: (trecho: TrechoCalculado) => void;
}

const BAIRROS_AREA_IV = ['todos', 'Pituaçu', 'Boca do Rio', 'Imbuí'];

export function TrechoListView({
  trechos,
  busca,
  onChangeBusca,
  filtro,
  onChangeFiltro,
  bairroFiltro,
  onChangeBairroFiltro,
  onSelectTrecho,
}: TrechoListViewProps) {
  const counts = {
    todos: trechos.length,
    livres: trechos.filter((t) => t.status === 'livre').length,
    pouca_vaga: trechos.filter((t) => t.status === 'pouca_vaga').length,
    ocupados: trechos.filter((t) => t.status === 'ocupado').length,
  };

  const filtrados = filtrarTrechos(trechos, busca, filtro, bairroFiltro);
  const comMapaCount = filtrados.filter((t) => t.exibirNoMapa).length;

  const limparFiltros = () => {
    onChangeBusca('');
    onChangeFiltro('todos');
    onChangeBairroFiltro('todos');
  };

  return (
    <section
      aria-label="Lista de logradouros da Área IV"
      className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 sm:px-6 lg:pb-12"
    >
      {/* Aviso obrigatório de simulação (RN01 / CA05) */}
      <SimulationBadge variant="banner" className="mb-5" />

      {/* Painel de Busca e Filtros */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            data-testid="search-input"
            value={busca}
            onChange={(e) => onChangeBusca(e.target.value)}
            placeholder="Buscar logradouro, bairro ou referência..."
            aria-label="Buscar logradouro, bairro ou referência"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#1463E3] focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/15"
          />
          {busca && (
            <button
              type="button"
              onClick={() => onChangeBusca('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterPills
            activeFilter={filtro}
            onSelectFilter={onChangeFiltro}
            counts={counts}
          />

          {/* Filtro rápido por bairro da Área IV */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            {BAIRROS_AREA_IV.map((b) => {
              const ativo = bairroFiltro === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => onChangeBairroFiltro(b)}
                  className={clsx(
                    'rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-blue-600',
                    ativo
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {b === 'todos' ? 'Todos bairros' : b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumo da listagem */}
      <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 sm:text-sm">
        <p>
          Exibindo <strong className="font-semibold text-slate-800">{filtrados.length}</strong>{' '}
          {filtrados.length === 1 ? 'trecho' : 'trechos'} cadastrados
          {filtrados.length > 0 && (
            <span className="text-slate-400">
              {' '}
              ({comMapaCount} com localização no mapa)
            </span>
          )}
        </p>
        {(busca || filtro !== 'todos' || bairroFiltro !== 'todos') && (
          <button
            type="button"
            onClick={limparFiltros}
            className="text-xs font-semibold text-[#1463E3] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de Cards */}
      {trechos.length === 0 ? (
        <div
          data-testid="empty-state-base"
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
        >
          <p className="font-display text-base font-semibold text-slate-800">
            Nenhum trecho cadastrado na base
          </p>
          <p className="mt-1 text-sm text-slate-500">
            A base cadastral da Área IV não possui registros ativos no momento.
          </p>
        </div>
      ) : filtrados.length === 0 ? (
        <div
          data-testid="empty-state-filtro"
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
        >
          <p className="font-display text-base font-semibold text-slate-800">
            Nenhum trecho encontrado
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Tente ajustar os termos da busca ou remover os filtros de disponibilidade.
          </p>
          <button
            type="button"
            onClick={limparFiltros}
            className="mt-4 inline-flex items-center rounded-xl bg-[#1463E3] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0B46A0]"
          >
            Ver todos os trechos
          </button>
        </div>
      ) : (
        <div
          data-testid="trecho-list"
          className="grid grid-cols-1 gap-3 lg:grid-cols-2"
        >
          {filtrados.map((trecho) => (
            <TrechoCard key={trecho.id} trecho={trecho} onSelect={onSelectTrecho} />
          ))}
        </div>
      )}
    </section>
  );
}

