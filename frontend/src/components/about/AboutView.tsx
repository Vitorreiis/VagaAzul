import { BookOpen, CheckCircle2, FileText, MapPin, ShieldCheck, Users } from 'lucide-react';
import { SimulationBadge } from '../common/SimulationBadge';

const EQUIPE = [
  { nome: 'Hudson Santos Martins', ra: '127261850' },
  { nome: 'Icaro Souza Tannus', ra: '12725131074' },
  { nome: 'Mateus Silva da Conceição Santos', ra: '12725143458' },
  { nome: 'Pedro Henrique de Araújo Meira', ra: '1272329427' },
  { nome: 'Vitor Reis dos Santos', ra: '12722124265' },
  { nome: 'Gabriel Barboza Figueira Cavalcante', ra: '1272417678' },
];

export function AboutView() {
  return (
    <section
      aria-label="Informações sobre o projeto VagaAzul"
      className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-24 pt-6 sm:px-6 lg:pb-12"
    >
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B46A0]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Gestão e Qualidade de Software • Trabalho A3
            </span>
            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
              VagaAzul — Área IV de Salvador
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Aplicação web responsiva para consulta de trechos regulamentados de Zona Azul na{' '}
          <strong className="font-semibold text-slate-800">
            Área IV de Salvador (Pituaçu, Boca do Rio e Imbuí)
          </strong>
          , integrando visualização cartográfica em OpenStreetMap/Leaflet e listagem detalhada a
          partir de uma fonte única de dados.
        </p>

        <SimulationBadge variant="banner" className="mt-5" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Regras e Garantias */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Regras de Qualidade e Negócio
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <strong>RN02 / RN03:</strong> Vagas livres calculadas deterministicamente (
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  total − ocupadas
                </code>
                ), com limites inteiros garantidos entre 0 e a capacidade oficial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <strong>RN04 / RN05:</strong> Identificadores únicos por trecho; apenas coordenadas
                validadas geram marcadores no mapa, mantendo os demais trechos acessíveis na lista.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <strong>RNF08 / RNF09:</strong> Interface pública exclusivamente de consulta (somente
                leitura) e lógica de negócio desacoplada da UI para testes unitários automatizados.
              </span>
            </li>
          </ul>
        </div>

        {/* Fontes Oficiais */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Fontes Oficiais e Tecnologia
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]" aria-hidden="true" />
              <span>
                <strong>TransOnline Salvador:</strong> Listagem pública de logradouros de Zona Azul.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]" aria-hidden="true" />
              <span>
                <strong>Diário Oficial de Salvador:</strong> Portaria nº 121/2026 (Área IV — Pituaçu,
                Boca do Rio e Imbuí).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]" aria-hidden="true" />
              <span>
                <strong>Cartografia:</strong> OpenStreetMap integrado via Leaflet + React.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Equipe */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-base font-bold text-slate-900">
            Equipe do Projeto
          </h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {EQUIPE.map((membro) => (
            <div
              key={membro.ra}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
            >
              <p className="text-sm font-semibold text-slate-800">{membro.nome}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-500">RA: {membro.ra}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

