import { ChevronLeft, Info, List, Map, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { SimulationBadge } from './SimulationBadge';

export type ActiveTab = 'mapa' | 'lista' | 'sobre';

interface HeaderProps {
  activeTab: ActiveTab;
  isDetailOpen: boolean;
  onChangeTab: (tab: ActiveTab) => void;
  onBackFromDetail: () => void;
  onResimular: () => void;
}

const TITLES: Record<ActiveTab, string> = {
  mapa: 'Zona Azul Salvador',
  lista: 'Logradouros',
  sobre: 'Sobre o VagaAzul',
};

export function Header({
  activeTab,
  isDetailOpen,
  onChangeTab,
  onBackFromDetail,
  onResimular,
}: HeaderProps) {
  const mobileTitle = isDetailOpen ? 'Detalhe do Trecho' : TITLES[activeTab];

  return (
    <header
      data-testid="header-nav"
      className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#08367D] via-[#0B46A0] to-[#1055BC] text-white shadow-md"
    >
      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Esquerda: Voltar no detalhe ou Marca VagaAzul */}
        <div className="flex items-center gap-3 min-w-0">
          {isDetailOpen ? (
            <button
              type="button"
              data-testid="btn-voltar"
              onClick={onBackFromDetail}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Voltar para a tela anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-xs">
              <span className="font-display text-sm font-extrabold tracking-tight text-white">
                VA
              </span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display truncate text-base font-bold tracking-tight sm:text-lg">
                <span className="lg:hidden">{mobileTitle}</span>
                <span className="hidden lg:inline">
                  {isDetailOpen ? 'VagaAzul • Detalhe do Trecho' : 'VagaAzul'}
                </span>
              </h1>
              <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-blue-100 uppercase lg:inline-block">
                Área IV
              </span>
            </div>
            <p className="hidden text-xs text-blue-100/85 lg:block">
              Pituaçu, Boca do Rio e Imbuí • Salvador
            </p>
          </div>
        </div>

        {/* Centro: Navegação Desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-1 rounded-xl bg-white/10 p-1 backdrop-blur-xs">
          <button
            type="button"
            data-testid="nav-mapa"
            onClick={() => onChangeTab('mapa')}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-white',
              !isDetailOpen && activeTab === 'mapa'
                ? 'bg-white text-[#0B46A0] shadow-xs font-semibold'
                : 'text-blue-50 hover:bg-white/10'
            )}
          >
            <Map className="h-4 w-4" aria-hidden="true" />
            <span>Mapa</span>
          </button>

          <button
            type="button"
            data-testid="nav-lista"
            onClick={() => onChangeTab('lista')}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-white',
              !isDetailOpen && activeTab === 'lista'
                ? 'bg-white text-[#0B46A0] shadow-xs font-semibold'
                : 'text-blue-50 hover:bg-white/10'
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            <span>Logradouros</span>
          </button>

          <button
            type="button"
            data-testid="nav-sobre"
            onClick={() => onChangeTab('sobre')}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-white',
              !isDetailOpen && activeTab === 'sobre'
                ? 'bg-white text-[#0B46A0] shadow-xs font-semibold'
                : 'text-blue-50 hover:bg-white/10'
            )}
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            <span>Sobre</span>
          </button>
        </nav>

        {/* Direita: Indicador de simulação + Re-simular */}
        <div className="flex items-center gap-2.5">
          <SimulationBadge variant="compact" className="hidden md:inline-flex" />
          <button
            type="button"
            data-testid="btn-resimular"
            onClick={onResimular}
            title="Gerar nova ocupação simulada (mantém capacidade oficial)"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Nova Simulação</span>
          </button>
        </div>
      </div>
    </header>
  );
}

