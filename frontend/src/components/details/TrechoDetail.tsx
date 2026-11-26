
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  Hash,
  Map as MapIcon,
  MapPin,
  MapPinOff,
} from 'lucide-react';

import type { TrechoCalculado } from '../../domain/models/Trecho';
import { StatusLabel } from '../common/StatusBadge';
import { StatCard } from './StatCard';

interface TrechoDetailProps {
  trecho: TrechoCalculado | undefined;
  onBack: () => void;
  onViewOnMap: (trecho: TrechoCalculado) => void;
}

/**
 * Formata a data de atualização recebida da API.
 */
function formatarDataAtualizacao(
    atualizadoEm: string | null
): string {
  if (!atualizadoEm) {
    return 'Não informada';
  }

  const data = new Date(atualizadoEm);

  if (Number.isNaN(data.getTime())) {
    return 'Não informada';
  }

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function TrechoDetail({
                               trecho,
                               onBack,
                               onViewOnMap,
                             }: TrechoDetailProps) {
  if (!trecho) {
    return (
        <section
            data-testid="trecho-detail-not-found"
            className="mx-auto max-w-2xl px-4 py-12 text-center"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle
                  className="h-6 w-6"
                  aria-hidden="true"
              />
            </div>

            <h2 className="font-display mt-4 text-lg font-bold text-slate-900">
              Trecho não disponível
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              O trecho selecionado não foi encontrado
              na base de dados.
            </p>

            <button
                type="button"
                onClick={onBack}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1463E3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B46A0]"
            >
              <ChevronLeft
                  className="h-4 w-4"
                  aria-hidden="true"
              />
              Voltar
            </button>
          </div>
        </section>
    );
  }

  const totalValido =
      Number.isSafeInteger(trecho.quantidadeTotalVagas) &&
      trecho.quantidadeTotalVagas > 0;

  const percentualOcupacao =
      trecho.dadosValidos &&
      trecho.vagasOcupadas !== null &&
      totalValido
          ? Math.round(
              (trecho.vagasOcupadas /
                  trecho.quantidadeTotalVagas) *
              100
          )
          : null;

  return (
      <section
          data-testid="trecho-detail"
          aria-label={`Detalhes do trecho ${trecho.logradouro}`}
          className="mx-auto w-full max-w-3xl px-0 pb-24 sm:px-6 sm:pt-6 lg:pb-12"
      >
        <div className="overflow-hidden bg-white shadow-[0_8px_30px_-8px_rgba(15,23,42,0.08)] sm:rounded-3xl sm:border sm:border-slate-200/80">

          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-[#0A3D8F] via-[#1360CC] to-[#0EA5E9] sm:h-48">
            <svg
                viewBox="0 0 800 220"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full opacity-90"
                aria-hidden="true"
            >
              <defs>
                <linearGradient
                    id="skyGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                  <stop offset="0%" stopColor="#083378" />
                  <stop offset="55%" stopColor="#1259C3" />
                  <stop offset="100%" stopColor="#1D8FE1" />
                </linearGradient>

                <linearGradient
                    id="seaGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                >
                  <stop
                      offset="0%"
                      stopColor="#0EA5E9"
                      stopOpacity="0.45"
                  />
                  <stop
                      offset="100%"
                      stopColor="#38BDF8"
                      stopOpacity="0.25"
                  />
                </linearGradient>
              </defs>

              <rect
                  width="800"
                  height="220"
                  fill="url(#skyGrad)"
              />

              <circle
                  cx="670"
                  cy="64"
                  r="46"
                  fill="#FDE68A"
                  fillOpacity="0.22"
              />

              <circle
                  cx="670"
                  cy="64"
                  r="28"
                  fill="#FEF08A"
                  fillOpacity="0.35"
              />

              <path
                  d="M0 175 L0 120 L48 120 L48 92 L95 92 L95 135 L132 135 L132 76 L186 76 L186 125 L235 125 L235 102 L292 102 L292 138 L350 138 L350 86 L406 86 L406 130 L470 130 L470 98 L525 98 L525 140 L595 140 L595 112 L645 112 L645 148 L800 148 L800 175 Z"
                  fill="#062861"
                  fillOpacity="0.38"
              />

              <path
                  d="M0 170 Q200 154 420 168 T800 162 L800 220 L0 220 Z"
                  fill="url(#seaGrad)"
              />

              <rect
                  x="0"
                  y="182"
                  width="800"
                  height="38"
                  fill="#0F172A"
                  fillOpacity="0.55"
              />

              <line
                  x1="20"
                  y1="201"
                  x2="780"
                  y2="201"
                  stroke="#60A5FA"
                  strokeWidth="3"
                  strokeDasharray="24 18"
                  strokeOpacity="0.7"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
              <button
                  type="button"
                  onClick={onBack}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-950/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-slate-950/55"
              >
                <ChevronLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                />
                <span>Voltar</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/25">
                Área IV • {trecho.bairroExibicao}
              </span>

                <StatusLabel status={trecho.status} />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-end justify-between px-4 sm:mt-10 sm:px-6">
              <div className="inline-flex items-center gap-2 rounded-t-xl bg-white px-3.5 py-1.5 text-xs font-bold text-[#0B46A0] shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1463E3] text-[11px] font-extrabold text-white">
                E
              </span>
                <span>Zona Azul</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {trecho.logradouro}
                </h2>

                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  {trecho.bairroExibicao}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-600">
              <Hash
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
              />
                {trecho.id}
            </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                  testId="stat-total"
                  label="Total de vagas"
                  value={
                    totalValido
                        ? trecho.quantidadeTotalVagas
                        : '—'
                  }
                  tone="neutral"
                  subtitle="Cadastrado"
              />

              <StatCard
                  testId="stat-livres"
                  label="Livres"
                  value={trecho.vagasLivres ?? '—'}
                  tone={
                    trecho.dadosValidos
                        ? 'success'
                        : 'neutral'
                  }
                  subtitle="Simulado"
              />

              <StatCard
                  testId="stat-ocupadas"
                  label="Ocupadas"
                  value={trecho.vagasOcupadas ?? '—'}
                  tone={
                    trecho.dadosValidos
                        ? 'danger'
                        : 'neutral'
                  }
                  subtitle="Simulado"
              />
            </div>

            {!trecho.dadosValidos && (
                <div
                    role="alert"
                    data-testid="ocupacao-indisponivel"
                    className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                  Os dados de ocupação deste trecho estão
                  indisponíveis no momento.
                </div>
            )}

            {percentualOcupacao !== null && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                    <span>Taxa de ocupação simulada</span>

                    <span className="font-semibold text-slate-700">
                  {percentualOcupacao}% ocupado
                </span>
                  </div>

                  <div
                      role="progressbar"
                      aria-label="Taxa de ocupação simulada"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percentualOcupacao}
                      className="h-2 w-full overflow-hidden rounded-full bg-emerald-100"
                  >
                    <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-300"
                        style={{
                          width: `${percentualOcupacao}%`,
                        }}
                    />
                  </div>
                </div>
            )}

            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-slate-50/40 px-4 sm:px-5">
              <div className="flex items-start gap-3.5 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1463E3]">
                  {trecho.exibirNoMapa ? (
                      <MapPin
                          className="h-4.5 w-4.5"
                          aria-hidden="true"
                      />
                  ) : (
                      <MapPinOff
                          className="h-4.5 w-4.5 text-slate-500"
                          aria-hidden="true"
                      />
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Coordenadas
                  </p>

                  {trecho.exibirNoMapa &&
                  trecho.coordenadas ? (
                      <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                        {trecho.coordenadas.lat.toFixed(4)}
                        {', '}
                        {trecho.coordenadas.lng.toFixed(4)}
                      </p>
                  ) : (
                      <p className="mt-0.5 text-sm font-medium text-amber-700">
                        Coordenadas indisponíveis ou
                        pendentes de validação.
                      </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1463E3]">
                  <Clock
                      className="h-4.5 w-4.5"
                      aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Última atualização da ocupação
                  </p>

                  <p
                      data-testid="data-atualizacao"
                      className="mt-0.5 text-sm font-semibold text-slate-900"
                  >
                    {formatarDataAtualizacao(
                        trecho.atualizadoEm
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Navegação para o mapa */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {trecho.exibirNoMapa ? (
                  <button
                      type="button"
                      data-testid="btn-ver-no-mapa"
                      onClick={() => onViewOnMap(trecho)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1463E3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B46A0] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <MapIcon
                        className="h-4.5 w-4.5"
                        aria-hidden="true"
                    />
                    <span>Ver no mapa</span>
                  </button>
              ) : (
                  <button
                      type="button"
                      disabled
                      data-testid="btn-ver-no-mapa-disabled"
                      className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
                  >
                    <MapPinOff
                        className="h-4.5 w-4.5"
                        aria-hidden="true"
                    />
                    <span>
                  Sem coordenadas confirmadas no mapa
                </span>
                  </button>

              )}

            </div>
          </div>
        </div>
      </section>
  );
}
