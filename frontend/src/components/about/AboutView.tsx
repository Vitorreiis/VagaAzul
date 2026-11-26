
import {
  BookOpen,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

const EQUIPE = [
  'Hudson Santos Martins',
  'Mateus Silva da Conceição Santos',
  'Pedro Henrique de Araújo Meira',
  'Vitor Reis dos Santos',
  'Gabriel Barboza Figueira Cavalcante',
];

export function AboutView() {
  return (
      <section
          aria-label="Informações sobre o projeto VagaAzul"
          className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-24 pt-6 sm:px-6 lg:pb-12"
      >
        {/* Apresentação do projeto */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B46A0]">
              <MapPin
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
              />
              Gestão e Qualidade de Software • Trabalho A3
            </span>

              <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                VagaAzul — Salvador
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Aplicação web responsiva desenvolvida como
            projeto acadêmico voltado à consulta de
            vagas de estacionamento rotativo, com foco
            no bairro de{' '}
            <strong className="font-semibold text-slate-800">
              Pituaçu, em Salvador, Bahia.
            </strong>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            O projeto permite consultar trechos
            cadastrados por meio de mapa, listagem
            de logradouros e informações detalhadas,
            utilizando dados disponibilizados por
            uma API REST.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
                <ShieldCheck
                    className="h-5 w-5"
                    aria-hidden="true"
                />
              </div>

              <h3 className="font-display text-base font-bold text-slate-900">
                Regras de Qualidade e Negócio
              </h3>
            </div>

            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                />

                <span>
                <strong>Consistência:</strong>{' '}
                  a quantidade de vagas livres deve
                corresponder à diferença entre a
                capacidade cadastrada e a ocupação
                simulada.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                />

                <span>
                <strong>Integridade:</strong>{' '}
                  os trechos devem possuir identificadores
                únicos e valores de ocupação compatíveis
                com sua capacidade cadastrada.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                />

                <span>
                <strong>Localização:</strong>{' '}
                  apenas trechos com coordenadas
                validadas devem aparecer no mapa.
                Os demais permanecem disponíveis
                para consulta na lista.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                />

                <span>
                <strong>Escopo:</strong>{' '}
                  a interface pública destina-se
                exclusivamente à consulta de
                informações.
              </span>
              </li>
            </ul>
          </div>

          {/* Dados e tecnologias */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
                <FileText
                    className="h-5 w-5"
                    aria-hidden="true"
                />
              </div>

              <h3 className="font-display text-base font-bold text-slate-900">
                Dados e Tecnologias
              </h3>
            </div>

            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Dados cadastrais:</strong>{' '}
                  registros mantidos na base de dados
                do projeto para fins acadêmicos.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Frontend:</strong>{' '}
                  React, TypeScript e Vite.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Backend:</strong>{' '}
                  Java, Spring Boot e API REST.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Persistência:</strong>{' '}
                  PostgreSQL, Spring Data JPA e Flyway.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Cartografia:</strong>{' '}
                  OpenStreetMap e CARTO, integrados
                por meio do Leaflet e React Leaflet.
              </span>
              </li>

              <li className="flex items-start gap-2">
                <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1463E3]"
                    aria-hidden="true"
                />

                <span>
                <strong>Testes automatizados:</strong>{' '}
                  JUnit, Mockito, Vitest e React
                Testing Library.
              </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1463E3]">
              <Users
                  className="h-5 w-5"
                  aria-hidden="true"
              />
            </div>

            <h3 className="font-display text-base font-bold text-slate-900">
              Equipe do Projeto
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPE.map((nome) => (
                <div
                    key={nome}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {nome}
                  </p>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
}
