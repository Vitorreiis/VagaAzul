
import { Search, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';

import type {
  FiltroDisponibilidade,
  TrechoCalculado,
} from '../../domain/models/Trecho';

import { filtrarTrechos } from '../../domain/services/trechosService';
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
  // Bairros disponíveis na base recebida da API.
  const bairros = [
    'todos',
    ...Array.from(
        new Set(trechos.map((trecho) => trecho.bairroExibicao))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
  ];

  const bairroFiltroEfetivo = bairros.includes(bairroFiltro)
      ? bairroFiltro
      : 'todos';

  // Contadores gerais da base cadastrada.
  const counts = {
    todos: trechos.length,
    livres: trechos.filter(
        (t) => t.status === 'livre'
    ).length,
    pouca_vaga: trechos.filter(
        (t) => t.status === 'pouca_vaga'
    ).length,
    ocupados: trechos.filter(
        (t) => t.status === 'ocupado'
    ).length,
  };

  const filtrados = filtrarTrechos(
      trechos,
      busca,
      filtro,
      bairroFiltroEfetivo
  );

  const comMapaCount = filtrados.filter(
      (t) => t.exibirNoMapa
  ).length;

  const indisponiveisCount = filtrados.filter(
      (t) => t.status === 'indisponivel'
  ).length;

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
                placeholder="Buscar logradouro, bairro ou ID..."
                aria-label="Buscar logradouro, bairro ou identificador"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#1463E3] focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/15"
            />

            {busca && (
                <button
                    type="button"
                    onClick={() => onChangeBusca('')}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                >
                  <X
                      className="h-4 w-4"
                      aria-hidden="true"
                  />
                </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterPills
                activeFilter={filtro}
                onSelectFilter={onChangeFiltro}
                counts={counts}
            />

            <div
                role="group"
                aria-label="Filtrar trechos por bairro"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
            >
              <SlidersHorizontal
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  aria-hidden="true"
              />

              {bairros.map((bairro) => {
                const ativo =
                    bairroFiltroEfetivo === bairro;

                return (
                    <button
                        key={bairro}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() =>
                            onChangeBairroFiltro(bairro)
                        }
                        className={clsx(
                            'rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-blue-600',
                            ativo
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                      {bairro === 'todos'
                          ? 'Todos os bairros'
                          : bairro}
                    </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 sm:text-sm">
          <div
              aria-live="polite"
              aria-atomic="true"
          >
            <p>
              Exibindo{' '}
              <strong className="font-semibold text-slate-800">
                {filtrados.length}
              </strong>{' '}
              {filtrados.length === 1
                  ? 'trecho cadastrado'
                  : 'trechos cadastrados'}

              {filtrados.length > 0 && (
                  <span className="text-slate-500">
                {' '}
                    ({comMapaCount} com localização no mapa)
              </span>
              )}
            </p>

            {indisponiveisCount > 0 && (
                <p
                    data-testid="resumo-ocupacao-indisponivel"
                    className="mt-1 text-slate-600"
                >
                  {indisponiveisCount}{' '}
                  {indisponiveisCount === 1
                      ? 'trecho com ocupação indisponível'
                      : 'trechos com ocupação indisponível'}
                </p>
            )}
          </div>

          {(busca ||
              filtro !== 'todos' ||
              bairroFiltro !== 'todos') && (
              <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-xs font-semibold text-[#1463E3] hover:underline"
              >
                Limpar filtros
              </button>
          )}
        </div>

        {trechos.length === 0 ? (
            <div
                data-testid="empty-state-base"
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
            >
              <p className="font-display text-base font-semibold text-slate-800">
                Nenhum trecho cadastrado na base
              </p>

              <p className="mt-1 text-sm text-slate-500">
                A base de dados não possui trechos
                cadastrados no momento.
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
                Tente ajustar os termos da busca ou
                remover os filtros selecionados.
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
                  <TrechoCard
                      key={trecho.id}
                      trecho={trecho}
                      onSelect={onSelectTrecho}
                  />
              ))}
            </div>
        )}
      </section>
  );
}
