import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertCircle,
  Layers,
  List,
  LocateFixed,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import {
  FiltroDisponibilidade,
  StatusOcupacao,
  TrechoCalculado,
} from '../../domain/models/Trecho';
import { filtrarTrechos, obterTrechosParaMapa } from '../../domain/services/trechosService';
import { SimulationBadge } from '../common/SimulationBadge';
import { StatusBadge } from '../common/StatusBadge';
import { MapCallout } from './MapCallout';

const AREA_IV_CENTER: [number, number] = [-12.9712, -38.4265];
const DEFAULT_ZOOM = 14;

const PIN_COLORS: Record<StatusOcupacao, { fill: string; stroke: string }> = {
  livre: { fill: '#16A34A', stroke: '#14532D' },
  pouca_vaga: { fill: '#F59E0B', stroke: '#92400E' },
  ocupado: { fill: '#EF4444', stroke: '#991B1B' },
};

function createPinIcon(status: StatusOcupacao, selected: boolean): L.DivIcon {
  const { fill, stroke } = PIN_COLORS[status];
  const size = selected ? 40 : 32;
  const ring = selected
    ? `<circle cx="16" cy="14" r="14" fill="${fill}" fill-opacity="0.22" />`
    : '';

  const html = `
    <div style="display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 6px rgba(15,23,42,0.28));">
      <svg width="${size}" height="${size + 8}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${ring}
        <path d="M16 2C9.37258 2 4 7.37258 4 14C4 22.75 16 36 16 36C16 36 28 22.75 28 14C28 7.37258 22.6274 2 16 2Z" fill="${fill}" stroke="#FFFFFF" stroke-width="2.2"/>
        <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
        <circle cx="16" cy="14" r="2.2" fill="${stroke}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'vaga-custom-pin',
    html,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 4],
  });
}

interface MapControllerProps {
  centerTarget: [number, number] | null;
  zoomTarget: number;
  resetSignal: number;
}

function MapController({ centerTarget, zoomTarget, resetSignal }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (centerTarget) {
      map.flyTo(centerTarget, zoomTarget, { duration: 0.7 });
    }
  }, [map, centerTarget, zoomTarget]);

  useEffect(() => {
    if (resetSignal > 0) {
      map.flyTo(AREA_IV_CENTER, DEFAULT_ZOOM, { duration: 0.7 });
    }
  }, [map, resetSignal]);

  return null;
}

interface MapViewProps {
  trechos: TrechoCalculado[];
  selectedTrechoId: string | null;
  onSelectMarker: (trecho: TrechoCalculado | null) => void;
  onOpenDetails: (trecho: TrechoCalculado) => void;
  onGoToList: () => void;
}

export function MapView({
  trechos,
  selectedTrechoId,
  onSelectMarker,
  onOpenDetails,
  onGoToList,
}: MapViewProps) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroDisponibilidade>('todos');
  const [tileLayerMode, setTileLayerMode] = useState<'osm' | 'clean'>('clean');
  const [tileError, setTileError] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const trechosFiltrados = useMemo(
    () => filtrarTrechos(trechos, busca, filtro),
    [trechos, busca, filtro]
  );

  const marcadores = useMemo(
    () => obterTrechosParaMapa(trechosFiltrados),
    [trechosFiltrados]
  );

  const totalSemMapa = useMemo(
    () => trechos.filter((t) => !t.exibirNoMapa).length,
    [trechos]
  );

  const selectedTrecho = useMemo(
    () => marcadores.find((m) => m.id === selectedTrechoId) ?? null,
    [marcadores, selectedTrechoId]
  );

  const centerTarget: [number, number] | null = selectedTrecho?.coordenadas
    ? [selectedTrecho.coordenadas.lat, selectedTrecho.coordenadas.lng]
    : null;

  const tileUrl =
    tileLayerMode === 'clean'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution =
    tileLayerMode === 'clean'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div
      data-testid="map-container"
      className="relative flex h-[calc(100vh-3.75rem-4rem)] w-full overflow-hidden lg:h-[calc(100vh-3.75rem)]"
    >
      {/* Painel lateral Desktop (estilo Dashboard elegante) */}
      <aside
        aria-label="Painel de consulta rápida do mapa"
        className="z-20 hidden w-[370px] shrink-0 flex-col border-r border-slate-200/90 bg-white lg:flex"
      >
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar rua, bairro ou região..."
              aria-label="Buscar rua, bairro ou região no mapa"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1463E3] focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/15"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca do mapa"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'livres', label: 'Livres' },
                { id: 'pouca_vaga', label: 'Pouca vaga' },
                { id: 'ocupados', label: 'Ocupados' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFiltro(opt.id)}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold transition',
                  filtro === opt.id
                    ? 'bg-[#1463E3] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <SimulationBadge variant="inline" className="w-full justify-center py-1" />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-500">
          <span>
            <strong className="text-slate-800">{marcadores.length}</strong> pontos no mapa
          </span>
          {totalSemMapa > 0 && (
            <button
              type="button"
              onClick={onGoToList}
              className="font-semibold text-[#1463E3] hover:underline"
            >
              +{totalSemMapa} apenas na lista
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {marcadores.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              Nenhum marcador encontrado para o filtro atual.
            </div>
          ) : (
            marcadores.map((trecho) => {
              const isSelected = trecho.id === selectedTrechoId;
              return (
                <button
                  key={trecho.id}
                  type="button"
                  onClick={() => onSelectMarker(trecho)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition',
                    isSelected
                      ? 'border-[#1463E3] bg-blue-50/70 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-blue-200 hover:bg-slate-50'
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-display truncate text-sm font-bold text-slate-900">
                      {trecho.logradouro}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {trecho.bairroExibicao} • {trecho.vagasTotais} vagas
                    </p>
                  </div>
                  <StatusBadge
                    status={trecho.status}
                    vagasLivres={trecho.vagasLivres}
                    size="sm"
                  />
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Área do Mapa Leaflet */}
      <div className="relative flex-1">
        {/* Barra de busca flutuante Mobile (Tela 1 da imagem) */}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col items-center gap-2 px-3 lg:hidden">
          <div className="pointer-events-auto relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar rua, bairro ou região..."
              aria-label="Buscar rua, bairro ou região no mapa"
              className="w-full rounded-2xl border border-slate-200/90 bg-white/95 py-2.5 pl-10 pr-9 text-sm text-slate-900 shadow-lg backdrop-blur-md placeholder:text-slate-400 focus:border-[#1463E3] focus:outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="pointer-events-auto">
            <SimulationBadge variant="inline" className="shadow-md" />
          </div>
        </div>

        {/* Estado alternativo CT19b: nenhum marcador disponível */}
        {marcadores.length === 0 && (
          <div className="pointer-events-none absolute inset-x-4 top-24 z-20 flex justify-center lg:top-6">
            <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur-md">
              <MapPin className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  Nenhum marcador para exibir no mapa
                </p>
                <p className="text-xs text-slate-500">
                  Trechos sem coordenadas validadas permanecem acessíveis na lista.
                </p>
              </div>
              <button
                type="button"
                onClick={onGoToList}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#1463E3] px-3 py-1.5 text-xs font-semibold text-white"
              >
                <List className="h-3.5 w-3.5" aria-hidden="true" />
                Lista
              </button>
            </div>
          </div>
        )}

        {/* Alerta amigável de falha de serviço de mapa (RNF05 / CT19c) */}
        {tileError && (
          <div
            role="alert"
            data-testid="map-tile-error"
            className="absolute inset-x-4 top-24 z-30 mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-rose-200 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:top-6"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-semibold text-slate-900">
                Mapa base temporariamente indisponível
              </p>
              <p className="mt-0.5 text-slate-600">
                Não foi possível carregar os blocos cartográficos do OpenStreetMap. Você pode
                continuar consultando todos os trechos pela aba Logradouros.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onGoToList}
                  className="rounded-lg bg-[#1463E3] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Ir para Logradouros
                </button>
                <button
                  type="button"
                  onClick={() => setTileError(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={AREA_IV_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          className="h-full w-full z-10"
        >
          <TileLayer
            key={tileLayerMode}
            attribution={tileAttribution}
            url={tileUrl}
            eventHandlers={{
              tileerror: () => setTileError(true),
            }}
          />

          <MapController
            centerTarget={centerTarget}
            zoomTarget={16}
            resetSignal={resetSignal}
          />

          {marcadores.map((trecho) => {
            if (!trecho.coordenadas) return null;
            const isSelected = trecho.id === selectedTrechoId;
            return (
              <Marker
                key={trecho.id}
                position={[trecho.coordenadas.lat, trecho.coordenadas.lng]}
                icon={createPinIcon(trecho.status, isSelected)}
                eventHandlers={{
                  click: () => onSelectMarker(trecho),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Callout flutuante do marcador selecionado */}
        {selectedTrecho && (
          <div className="pointer-events-none absolute inset-x-3 bottom-16 z-20 flex justify-center sm:bottom-20 lg:inset-x-auto lg:left-6 lg:bottom-20">
            <div className="pointer-events-auto w-full max-w-sm">
              <MapCallout
                trecho={selectedTrecho}
                onOpenDetails={onOpenDetails}
                onClose={() => onSelectMarker(null)}
              />
            </div>
          </div>
        )}

        {/* Botões flutuantes à direita (Camadas + Centralizar) */}
        <div className="absolute bottom-16 right-3 z-20 flex flex-col gap-2.5 sm:right-5 sm:bottom-6">
          <button
            type="button"
            onClick={() =>
              setTileLayerMode((prev) => (prev === 'clean' ? 'osm' : 'clean'))
            }
            title="Alternar estilo do mapa"
            aria-label="Alternar estilo do mapa"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-[#0B46A0] shadow-lg backdrop-blur-md transition hover:bg-slate-50 active:scale-95"
          >
            <Layers className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMarker(null);
              setResetSignal((n) => n + 1);
            }}
            title="Centralizar na Área IV (Pituaçu, Boca do Rio e Imbuí)"
            aria-label="Centralizar mapa na Área IV"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-[#0B46A0] shadow-lg backdrop-blur-md transition hover:bg-slate-50 active:scale-95"
          >
            <LocateFixed className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Legenda horizontal inferior (Tela 1 da imagem) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 sm:bottom-5">
          <div
            aria-label="Legenda de disponibilidade simulada"
            className="pointer-events-auto inline-flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md sm:gap-6 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span>Livre</span>
            </span>
            <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
              <span>Pouca vaga</span>
            </span>
            <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
              <span>Ocupado</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

