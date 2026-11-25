# VagaAzul — Zona Azul Salvador (Área IV)

Aplicação web responsiva em React + TypeScript para consulta de trechos regulamentados de Zona Azul na **Área IV de Salvador (Pituaçu, Boca do Rio e Imbuí)**, desenvolvida para a disciplina **Gestão e Qualidade de Software (Trabalho A3)**.

## Arquitetura em 3 Camadas (RNF09)

```text
src/
├── domain/                   # Camada de Negócio (100% isolada da UI)
│   ├── models/Trecho.ts      # Tipos e contratos dos trechos
│   ├── services/
│   │   ├── trechosService.ts # Cálculo de vagas livres, validações, filtros e regra de marcador
│   │   └── simuladorService.ts # Simulação controlada de ocupação (RN03, RN06)
│   └── __tests__/            # Testes unitários (CT01 a CT10)
├── data/
│   └── trechosAreaIV.ts      # Fonte única de dados (Single Source of Truth - CA02)
└── components/               # Camada de Apresentação (React + Tailwind + Leaflet)
    ├── common/               # Header, BottomNav, SimulationBadge, StatusBadge
    ├── map/                  # MapView (Leaflet/OSM) e MapCallout
    ├── list/                 # TrechoListView, TrechoCard, FilterPills
    ├── details/              # TrechoDetail e StatCard
    └── about/                # AboutView (escopo, regras, fontes e equipe)
```

## Requisitos Atendidos

- **RF01 / RN05**: Mapa interativo (OpenStreetMap + Leaflet) exibindo apenas trechos com coordenadas presentes, dentro da faixa geográfica e verificadas.
- **RF02 / CA02**: Lista completa compartilhando exatamente a mesma base do mapa, mantendo trechos sem coordenadas acessíveis com a etiqueta `Sem mapa`.
- **RF03 / UC03**: Tela de detalhes com logradouro, bairro, total de vagas, ocupação simulada, vagas livres calculadas, coordenadas, tarifa, horário e fonte documental.
- **RF04 / RN02 / RN03 / RN06**: Cálculo determinístico (`vagasLivres = vagasTotais - ocupacaoSimulada`), validação de limites inteiros e simulação sem alteração da capacidade oficial.
- **RN01 / RN07 / CA05**: Avisos explícitos de **dados simulados** em todas as telas que apresentam ocupação ou vagas livres.

## Como Executar Localmente

Pré-requisito: Node.js 20+ e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Executar suíte de testes unitários e de componentes
npm test

# 4. Verificar cobertura das regras de negócio (RNF10 >= 70%)
npm run test:coverage

# 5. Gerar build de produção (TypeScript + Vite)
npm run build
```

