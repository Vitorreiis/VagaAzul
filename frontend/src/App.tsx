
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';

import {
    carregarTrechosAreaIV,
    simularOcupacaoTodos,
} from './data/trechosRepository';

import type {
    FiltroDisponibilidade,
    TrechoCalculado,
} from './domain/models/Trecho';

import {
    buscarTrechoPorId,
    processarTrechos,
} from './domain/services/trechosService';

import { AboutView } from './components/about/AboutView';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import type { ActiveTab } from './components/common/Header';
import { TrechoDetail } from './components/details/TrechoDetail';
import { TrechoListView } from './components/list/TrechoListView';
import { MapView } from './components/map/MapView';

export function App() {
    const [trechosCalculados, setTrechosCalculados] =
        useState<TrechoCalculado[]>([]);

    const [erroCarga, setErroCarga] =
        useState<string | null>(null);

    const [carregando, setCarregando] = useState(true);

    const [simulandoOcupacao, setSimulandoOcupacao] =
        useState(false);

    const [erroSimulacao, setErroSimulacao] =
        useState<string | null>(null);

    const [activeTab, setActiveTab] =
        useState<ActiveTab>('mapa');

    const [detailTrechoId, setDetailTrechoId] =
        useState<number | null>(null);

    const [selectedMapTrechoId, setSelectedMapTrechoId] =
        useState<number | null>(null);

    const [buscaLista, setBuscaLista] = useState('');

    const [filtroLista, setFiltroLista] =
        useState<FiltroDisponibilidade>('todos');

    const [bairroFiltro, setBairroFiltro] =
        useState('todos');

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErroCarga(null);

        try {
            const dados = await carregarTrechosAreaIV();
            const trechosProcessados = processarTrechos(dados);

            setTrechosCalculados(trechosProcessados);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : 'Não foi possível consultar a base de trechos.';

            setTrechosCalculados([]);
            setErroCarga(mensagem);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarDados();
    }, [carregarDados]);

    const handleSimularOcupacao = useCallback(async () => {
        if (simulandoOcupacao || carregando) return;

        setSimulandoOcupacao(true);
        setErroSimulacao(null);

        try {
            const dados = await simularOcupacaoTodos();

            const trechosProcessados = processarTrechos(dados);

            setTrechosCalculados(trechosProcessados);
            setSelectedMapTrechoId(null);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : 'Não foi possível simular as ocupações.';

            setErroSimulacao(mensagem);
        } finally {
            setSimulandoOcupacao(false);
        }
    }, [simulandoOcupacao, carregando]);

    const detailTrecho = useMemo(
        () =>
            detailTrechoId !== null
                ? buscarTrechoPorId(
                    trechosCalculados,
                    detailTrechoId
                )
                : undefined,
        [trechosCalculados, detailTrechoId]
    );

    const handleChangeTab = useCallback(
        (tab: ActiveTab) => {
            setDetailTrechoId(null);
            setActiveTab(tab);
        },
        []
    );

    const handleOpenDetails = useCallback(
        (trecho: TrechoCalculado) => {
            setDetailTrechoId(trecho.id);
        },
        []
    );

    const handleViewOnMap = useCallback(
        (trecho: TrechoCalculado) => {
            if (!trecho.exibirNoMapa) return;

            setDetailTrechoId(null);
            setSelectedMapTrechoId(trecho.id);
            setActiveTab('mapa');
        },
        []
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#F4F7FB] text-slate-900">
            <Header
                activeTab={activeTab}
                isDetailOpen={detailTrechoId !== null}
                onChangeTab={handleChangeTab}
                onBackFromDetail={() => setDetailTrechoId(null)}
                onSimularOcupacao={handleSimularOcupacao}
                isSimulando={simulandoOcupacao}
            />

            <main className="flex-1">
                {erroSimulacao && (
                    <div
                        role="alert"
                        className="mx-auto mt-4 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                        {erroSimulacao}
                    </div>
                )}

                {activeTab === 'sobre' ? (
                    <AboutView />
                ) : carregando ? (
                    <div
                        role="status"
                        aria-live="polite"
                        data-testid="data-loading"
                        className="mx-auto my-10 max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
                    >
                        <LoaderCircle
                            className="mx-auto h-8 w-8 animate-spin text-[#1463E3]"
                            aria-hidden="true"
                        />

                        <h2 className="font-display mt-3 text-lg font-bold text-slate-900">
                            Carregando trechos
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Consultando os dados de estacionamento.
                            Aguarde um momento.
                        </p>
                    </div>
                ) : erroCarga ? (
                    <div
                        role="alert"
                        data-testid="data-load-error"
                        className="mx-auto my-10 max-w-lg rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm"
                    >
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <AlertCircle
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </div>

                        <h2 className="font-display mt-3 text-lg font-bold text-slate-900">
                            Falha ao consultar os dados
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            {erroCarga}
                        </p>

                        <button
                            type="button"
                            onClick={() => void carregarDados()}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1463E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B46A0]"
                        >
                            <RefreshCw
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            <span>Tentar novamente</span>
                        </button>
                    </div>
                ) : detailTrechoId !== null ? (
                    <TrechoDetail
                        trecho={detailTrecho}
                        onBack={() => setDetailTrechoId(null)}
                        onViewOnMap={handleViewOnMap}
                    />
                ) : activeTab === 'mapa' ? (
                    <MapView
                        trechos={trechosCalculados}
                        selectedTrechoId={selectedMapTrechoId}
                        onSelectMarker={(trecho) =>
                            setSelectedMapTrechoId(trecho?.id ?? null)
                        }
                        onOpenDetails={handleOpenDetails}
                        onGoToList={() => handleChangeTab('lista')}
                    />
                ) : (
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
