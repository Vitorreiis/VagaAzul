
# VagaAzul — Salvador

Aplicação web responsiva desenvolvida para a disciplina Gestão e Qualidade de Software (Trabalho A3), com foco na consulta de vagas de estacionamento rotativo no bairro de Pituaçu, em Salvador, Bahia.

O VagaAzul é um protótipo acadêmico. Os dados de ocupação são simulados e não representam a disponibilidade real de vagas em tempo real.

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet e React Leaflet
- OpenStreetMap e CARTO
- Vitest
- React Testing Library

O frontend consome uma API REST desenvolvida em Java com Spring Boot, utilizando PostgreSQL para persistência dos dados.

## Arquitetura em três camadas (RNF09)

O frontend separa as responsabilidades de apresentação, regras de negócio e acesso aos dados.

```text
src/
├── domain/
│   ├── models/
│   │   └── Trecho.ts
│   ├── services/
│   │   └── trechosService.ts
│   └── __tests__/
├── data/
│   ├── TrechoResponse.ts
│   ├── trechosRepository.ts
│   └── __tests__/
├── components/
│   ├── common/
│   ├── map/
│   ├── list/
│   ├── details/
│   ├── about/
│   └── __tests__/
├── test/
│   └── setup.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### Camada de negócio

Responsável pela validação dos dados de ocupação, verificação da consistência das vagas livres, classificação da disponibilidade, identificação de registros duplicados, filtros e critérios de exibição dos marcadores.

### Camada de acesso aos dados

Responsável pela comunicação com a API REST, validação do formato das respostas, conversão dos registros para o modelo de domínio e tratamento de falhas de comunicação.

### Camada de apresentação

Responsável pela interface responsiva, navegação, mapa, lista de trechos, detalhes, indicadores de disponibilidade e mensagens de carregamento, erro e ausência de dados.

## Integração com a API REST

A fonte de dados do frontend é a API REST do VagaAzul.

O endpoint utilizado para carregar os trechos é:

```http
GET /trechos
```

O contrato de resposta contempla os seguintes campos:

| Campo | Tipo |
|---|---|
| id | number |
| bairro | string |
| logradouro | string |
| quantidadeTotalVagas | number |
| vagasOcupadas | number ou null |
| vagasLivres | number ou null |
| latitude | number ou null |
| longitude | number ou null |
| atualizadoEm | string ou null |
| ocupacaoSimulada | boolean |

O frontend não possui uma base local alternativa de trechos e não gera valores de ocupação simulada.

A geração e a persistência da ocupação são responsabilidades do backend.

Em caso de falha na API, a aplicação apresenta uma mensagem de erro e permite uma nova tentativa de carregamento.

## Regras de negócio

- Cada trecho deve possuir um identificador único.
- A capacidade total deve ser um número inteiro positivo.
- A ocupação deve ser um número inteiro entre zero e a capacidade total.
- A quantidade de vagas livres deve corresponder à diferença entre a capacidade total e a ocupação.
- Dados ausentes ou inconsistentes de ocupação devem ser apresentados como indisponíveis.
- Ocupação indisponível não deve ser confundida com ausência de vagas livres.
- Somente trechos com coordenadas válidas e verificadas podem possuir marcadores no mapa.
- Trechos sem coordenadas verificadas permanecem acessíveis pela lista.
- Os dados de ocupação devem ser identificados como simulados.
- A interface pública do frontend é destinada exclusivamente à consulta.

## Funcionalidades

- Consulta de trechos em mapa interativo.
- Consulta de trechos em lista.
- Visualização de detalhes dos trechos.
- Busca por logradouro, bairro ou identificador.
- Filtros por disponibilidade e bairro.
- Indicadores de vagas livres e ocupação simulada.
- Tratamento de falhas de comunicação com a API.
- Tratamento de indisponibilidade do mapa base.
- Navegação responsiva.

A exibição efetiva dos marcadores depende da disponibilidade e da validação das coordenadas fornecidas pelo sistema.

## Como executar localmente

### Pré-requisitos

- Node.js 22 LTS ou 24 LTS, atualizado.
- npm.
- Backend do VagaAzul configurado e em execução.
- PostgreSQL configurado para utilização pelo backend.

Execute os comandos a seguir dentro da pasta `frontend`.

### 1. Instalar as dependências

```bash
npm ci
```

O comando utiliza o arquivo `package-lock.json` para realizar uma instalação reproduzível das dependências.

### 2. Configurar as variáveis de ambiente

No Windows, utilizando PowerShell:

```powershell
Copy-Item -LiteralPath .\.env.example -Destination .\.env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

O arquivo `.env` deve conter o endereço base da API:

```env
VITE_API_URL=http://localhost:8080
```

Ajuste o endereço caso o backend esteja sendo executado em outra porta ou ambiente.

O arquivo `.env` não deve ser versionado. O arquivo `.env.example` deve permanecer disponível no repositório como modelo de configuração.

Variáveis com o prefixo `VITE_` são acessíveis pelo código executado no navegador e não devem conter credenciais ou segredos.

### 3. Iniciar o backend

Siga as instruções de configuração e execução do backend disponíveis no projeto.

Na configuração local padrão, a API deve estar disponível em:

```text
http://localhost:8080
```

### 4. Iniciar o frontend

```bash
npm run dev
```

Endereço padrão:

```text
http://localhost:5173
```

## Testes automatizados

Os testes do frontend utilizam Vitest e React Testing Library.

A suíte contempla testes de:

- Validação das regras de negócio.
- Limites e consistência da ocupação.
- Classificação da disponibilidade.
- Identificadores duplicados.
- Validação de coordenadas.
- Busca e filtros.
- Contrato e comunicação com a API REST.
- Tratamento de respostas inválidas.
- Falhas de comunicação e timeout.
- Renderização e navegação dos componentes.
- Estados de carregamento, erro e recuperação.

### Executar todos os testes do frontend

```bash
npm test
```

### Executar testes em modo de observação

```bash
npm run test:watch
```

### Gerar relatório de cobertura

```bash
npm run test:coverage
```

A configuração de cobertura utiliza o provedor V8 e contempla os serviços de domínio e o repositório de acesso à API.

Em conformidade com a meta de qualidade definida no RNF10, foram configurados limites mínimos de 70% por arquivo para:

- Instruções (statements).
- Ramificações (branches).
- Funções (functions).
- Linhas (lines).

O relatório HTML é gerado em:

```text
coverage/index.html
```

O atendimento efetivo da meta deve ser confirmado pelos resultados da execução da suíte de testes.

Os testes do frontend não substituem os testes do backend nem os testes de integração do sistema completo.

## Build de produção

Para verificar a compilação TypeScript e gerar os arquivos de produção:

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`.

Para visualizar localmente o build:

```bash
npm run preview
```

## Segurança e limitações

- O frontend não disponibiliza funcionalidades de alteração da ocupação.
- Credenciais e segredos não devem ser armazenados no código do frontend.
- Os arquivos locais de ambiente não devem ser versionados.
- A ocupação apresentada é simulada.
- O protótipo não representa um serviço oficial da Prefeitura de Salvador.
- O sistema não realiza reservas, pagamentos ou autorização de estacionamento.
- A disponibilidade do mapa depende dos serviços externos de mapas.
- A segurança dos endpoints da API deve ser garantida pelo backend.

## Qualidade de software

O desenvolvimento considera os seguintes aspectos:

- Adequação funcional.
- Confiabilidade.
- Usabilidade e acessibilidade.
- Integridade dos dados.
- Segurança.
- Manutenibilidade.
- Testabilidade.
- Rastreabilidade dos requisitos.

A conformidade com os requisitos deve ser demonstrada por meio de testes automatizados, testes de integração, inspeções técnicas e evidências de execução.

## Contexto acadêmico

Projeto VagaAzul.

Disciplina: Gestão e Qualidade de Software.

Trabalho A3.
