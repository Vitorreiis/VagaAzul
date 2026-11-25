import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { carregarTrechosAreaIV } from './data/trechosRepository';
import { TRECHOS_AREA_IV } from './data/trechosAreaIV';
import {
  FiltroDisponibilidade,
  Trecho,
  TrechoCalculado,
} from './domain/models/Trecho';
import { resimularTrechos } from './domain/services/simuladorService';
import {
  buscarTrechoPorId,
  processarTrechos,
} from './domain/services/trechosService';
import { AboutView } from './components/about/AboutView';
import { BottomNav } from './components/common/BottomNav';
import { ActiveTab, Header } from './components/common/Header';
import { TrechoDetail } from './components/details/TrechoDetail';
import { TrechoListView } from './components/list/TrechoListView';
import { MapView } from './components/map/MapView';

export function App() {
  const [trechosRaw, setTrechosRaw] = useState<Trecho[]>(TRECHOS_AREA_IV);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('mapa');
  const [detailTrechoId, setDetailTrechoId] = useState<string | null>(null);
  const [selectedMapTrechoId, setSelectedMapTrechoId] = useState<string | null>(null);

  const [buscaLista, setBuscaLista] = useState('');
  const [filtroLista, setFiltroLista] = useState<FiltroDisponibilidade>('todos');
  const [bairroFiltro, setBairroFiltro] = useState('todos');

  const carregarDados = useCallback(async () => {
    if (!import.meta.env.VITE_API_URL) {
      setErroCarga(null);
      return;
    }
    setCarregando(true);
    setErroCarga(null);
    try {
      const dados = await carregarTrechosAreaIV();
      setTrechosRaw(dados);
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível consultar a base de trechos.';
      setErroCarga(mensagem);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  // Base única calculada servindo Mapa, Lista e Detalhes simultaneamente (CA02)
  const trechosCalculados = useMemo(
    () => processarTrechos(trechosRaw),
    [trechosRaw]
  );

  const detailTrecho = useMemo(
    () => (detailTrechoId ? buscarTrechoPorId(trechosCalculados, detailTrechoId) : undefined),
    [trechosCalculados, detailTrechoId]
  );

  const handleResimular = useCallback(() => {
    setTrechosRaw((prev) => resimularTrechos(prev));
  }, []);

  const handleChangeTab = useCallback((tab: ActiveTab) => {
    setDetailTrechoId(null);
    setActiveTab(tab);
  }, []);

  const handleOpenDetails = useCallback((trecho: TrechoCalculado) => {
    setDetailTrechoId(trecho.id);
  }, []);

  const handleViewOnMap = useCallback((trecho: TrechoCalculado) => {
    if (!trecho.exibirNoMapa) return;
    setDetailTrechoId(null);
    setSelectedMapTrechoId(trecho.id);
    setActiveTab('mapa');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7FB] text-slate-900">
      <Header
        activeTab={activeTab}
        isDetailOpen={detailTrechoId !== null}
        onChangeTab={handleChangeTab}
        onBackFromDetail={() => setDetailTrechoId(null)}
        onResimular={handleResimular}
      />

      <main className="flex-1">
        {erroCarga ? (
          <div
            role="alert"
            data-testid="data-load-error"
            className="mx-auto my-10 max-w-lg rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-3 text-lg font-bold text-slate-900">
              Falha ao consultar os dados
            </h2>
            <p className="mt-1 text-sm text-slate-600">{erroCarga}</p>
            <button
              type="button"
              onClick={() => void carregarDados()}
              disabled={carregando}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1463E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B46A0] disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>{carregando ? 'Carregando...' : 'Tentar novamente'}</span>
            </button>
          </div>
        ) : detailTrechoId !== null ? (
          <TrechoDetail
            trecho={detailTrecho}
            onBack={() => setDetailTrechoId(null)}
            onViewOnMap={handleViewOnMap}
            onResimular={handleResimular}
          />
        ) : activeTab === 'mapa' ? (
          <MapView
            trechos={trechosCalculados}
            selectedTrechoId={selectedMapTrechoId}
            onSelectMarker={(t) => setSelectedMapTrechoId(t?.id ?? null)}
            onOpenDetails={handleOpenDetails}
            onGoToList={() => handleChangeTab('lista')}
          />
        ) : activeTab === 'lista' ? (
          <TrechoListView
            trechos={trechosCalculados}
            busca={buscaLista}
            onChangeBusca={setBuscaLista}
            filtro={filtroLista}
            onChangeFiltro={setFiltroLista}
            bairroFiltro={bairroFiltro}
            onChangeBairroFiltro={setBairroFiltro}
            onSelectTrecho={handleOpenDetails}
          />
        ) : (
          <AboutView />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
      />
    </div>
  );
}

export default App;

