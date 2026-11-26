
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { ReactNode } from 'react';

import App from '../../App';

import {
  carregarTrechosAreaIV,
  simularOcupacaoTodos,
} from '../../data/trechosRepository';

import { processarTrecho } from '../../domain/services/trechosService';
import type { Trecho } from '../../domain/models/Trecho';
import { TrechoDetail } from '../details/TrechoDetail';

// Isola as requisições externas.
vi.mock('../../data/trechosRepository', () => ({
  carregarTrechosAreaIV: vi.fn(),
  simularOcupacaoTodos: vi.fn(),
}));

// Simula a infraestrutura do mapa.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
      <div data-testid="leaflet-map-mock">
        {children}
      </div>
  ),

  TileLayer: () => (
      <div data-testid="leaflet-tile-layer-mock" />
  ),

  Marker: ({
             title,
             eventHandlers,
           }: {
    title?: string;
    eventHandlers?: {
      click?: () => void;
    };
  }) => (
      <button
          type="button"
          aria-label={title}
          onClick={() => eventHandlers?.click?.()}
      >
        {title}
      </button>
  ),

  useMap: () => ({
    flyTo: vi.fn(),
    setView: vi.fn(),
    getZoom: vi.fn(() => 14),
    invalidateSize: vi.fn(),
  }),
}));

const carregarTrechosMock = vi.mocked(carregarTrechosAreaIV);
const simularOcupacaoMock = vi.mocked(simularOcupacaoTodos);

// Dados fictícios utilizados exclusivamente nos testes.
const trechoBase: Trecho = {
  id: 101,
  logradouro: 'Avenida Exemplo A',
  bairro: 'Pituaçu',
  quantidadeTotalVagas: 52,
  vagasOcupadas: 21,
  vagasLivres: 31,
  ocupacaoSimulada: true,
  coordenadas: {
    lat: -12.9667,
    lng: -38.4148,
  },
  coordenadasVerificadas: true,
  atualizadoEm: '2026-11-24T10:00:00',
};

const MASSA_TESTE: Trecho[] = [
  trechoBase,
  {
    ...trechoBase,
    id: 102,
    logradouro: 'Rua Exemplo B',
    quantidadeTotalVagas: 20,
    vagasOcupadas: 18,
    vagasLivres: 2,
    coordenadas: null,
    coordenadasVerificadas: false,
  },
  {
    ...trechoBase,
    id: 103,
    logradouro: 'Rua Exemplo C',
    quantidadeTotalVagas: 10,
    vagasOcupadas: 10,
    vagasLivres: 0,
    coordenadas: {
      lat: -12.9675,
      lng: -38.416,
    },
  },
  {
    ...trechoBase,
    id: 104,
    logradouro: 'Rua Exemplo D',
    quantidadeTotalVagas: 15,
    vagasOcupadas: null,
    vagasLivres: null,
    coordenadas: null,
    coordenadasVerificadas: false,
    atualizadoEm: null,
  },
];

async function abrirLista() {
  fireEvent.click(
      screen.getByTestId('bottom-nav-lista')
  );

  return screen.findByTestId('trecho-list');
}

async function abrirDetalhes(logradouro: string) {
  const lista = await abrirLista();

  fireEvent.click(
      within(lista).getByText(logradouro, { exact: true })
  );

  return screen.findByTestId('trecho-detail');
}

beforeEach(() => {
  carregarTrechosMock.mockReset();
  carregarTrechosMock.mockResolvedValue(MASSA_TESTE);

  simularOcupacaoMock.mockReset();
  simularOcupacaoMock.mockResolvedValue(MASSA_TESTE);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Carregamento e tratamento de falhas', () => {
  it('exibe carregamento e apresenta o mapa após receber os dados', async () => {
    render(<App />);

    expect(
        screen.getByTestId('data-loading')
    ).toBeInTheDocument();

    await screen.findByTestId('leaflet-map-mock');

    expect(
        screen.queryByTestId('data-loading')
    ).not.toBeInTheDocument();

    expect(carregarTrechosMock).toHaveBeenCalledTimes(1);

    expect(
        screen.getByTestId('bottom-nav-mapa')
    ).toHaveAttribute('aria-current', 'page');
  });

  it('apresenta erro da API e permite tentar novamente', async () => {
    carregarTrechosMock
        .mockRejectedValueOnce(new Error('API indisponível'))
        .mockResolvedValueOnce(MASSA_TESTE);

    render(<App />);

    const erro = await screen.findByTestId('data-load-error');

    expect(erro).toHaveTextContent(/API indisponível/i);
    expect(erro).toHaveAttribute('role', 'alert');

    expect(
        screen.queryByTestId('data-loading')
    ).not.toBeInTheDocument();

    fireEvent.click(
        within(erro).getByRole('button', {
          name: /tentar novamente/i,
        })
    );

    await screen.findByTestId('leaflet-map-mock');

    expect(
        screen.queryByTestId('data-load-error')
    ).not.toBeInTheDocument();

    expect(carregarTrechosMock).toHaveBeenCalledTimes(2);
  });

  it('rejeita dados com identificadores duplicados', async () => {
    carregarTrechosMock.mockResolvedValue([
      trechoBase,
      trechoBase,
    ]);

    render(<App />);

    expect(
        await screen.findByTestId('data-load-error')
    ).toHaveTextContent(/duplicados/i);
  });

  it('permite acessar a tela Sobre quando a API falha', async () => {
    carregarTrechosMock.mockRejectedValue(
        new Error('API indisponível')
    );

    render(<App />);

    await screen.findByTestId('data-load-error');

    fireEvent.click(
        screen.getByTestId('bottom-nav-sobre')
    );

    expect(
        screen.getByRole('region', {
          name: 'Informações sobre o projeto VagaAzul',
        })
    ).toBeInTheDocument();
  });
});

describe('Navegação e listagem', () => {
  it('permite navegar entre Mapa, Lista e Sobre', async () => {
    render(<App />);

    await screen.findByTestId('leaflet-map-mock');
    await abrirLista();

    expect(
        screen.getByTestId('bottom-nav-lista')
    ).toHaveAttribute('aria-current', 'page');

    expect(
        screen.getByTestId('bottom-nav-mapa')
    ).not.toHaveAttribute('aria-current');

    fireEvent.click(
        screen.getByTestId('bottom-nav-sobre')
    );

    expect(
        screen.getByRole('region', {
          name: 'Informações sobre o projeto VagaAzul',
        })
    ).toBeInTheDocument();

    expect(
        screen.getByTestId('bottom-nav-sobre')
    ).toHaveAttribute('aria-current', 'page');

    fireEvent.click(
        screen.getByTestId('bottom-nav-mapa')
    );

    expect(
        await screen.findByTestId('leaflet-map-mock')
    ).toBeInTheDocument();
  });

  it('lista todos os trechos, inclusive aqueles sem coordenadas', async () => {
    render(<App />);

    const lista = await abrirLista();

    expect(lista.children).toHaveLength(4);

    for (const trecho of MASSA_TESTE) {
      expect(
          within(lista).getByText(trecho.logradouro, {
            exact: true,
          })
      ).toBeInTheDocument();
    }

    expect(
        screen.getByTestId('badge-sem-mapa-102')
    ).toHaveTextContent('Sem mapa');

    expect(
        screen.getByTestId('badge-sem-mapa-104')
    ).toHaveTextContent('Sem mapa');
  });

  it('filtra pela busca textual e informa quando não há resultados', async () => {
    render(<App />);

    await abrirLista();

    fireEvent.change(
        screen.getByTestId('search-input'),
        {
          target: { value: 'Exemplo B' },
        }
    );

    const lista = screen.getByTestId('trecho-list');

    expect(lista.children).toHaveLength(1);
    expect(lista).toHaveTextContent('Rua Exemplo B');

    fireEvent.change(
        screen.getByTestId('search-input'),
        {
          target: { value: 'Logradouro inexistente XYZ' },
        }
    );

    expect(
        screen.getByTestId('empty-state-filtro')
    ).toBeInTheDocument();
  });

  it('identifica dados de ocupação indisponíveis na lista', async () => {
    render(<App />);

    await abrirLista();

    expect(
        screen.getByTestId('resumo-ocupacao-indisponivel')
    ).toHaveTextContent(/indisponível/i);
  });

describe('Consulta dos detalhes', () => {
  it('apresenta os dados do trecho selecionado corretamente', async () => {
    render(<App />);

    const detalhe = await abrirDetalhes('Avenida Exemplo A');

    expect(detalhe).toHaveTextContent('Avenida Exemplo A');

    expect(
        screen.getByTestId('stat-total')
    ).toHaveTextContent('52');

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('31');

    expect(
        screen.getByTestId('stat-ocupadas')
    ).toHaveTextContent('21');

    expect(
        screen.getByTestId('data-atualizacao')
    ).toHaveTextContent('24/11/2026');

    expect(
        screen.getByTestId('btn-ver-no-mapa')
    ).toBeEnabled();
  });

  it('desabilita localização de trecho sem coordenadas', async () => {
    render(<App />);

    await abrirDetalhes('Rua Exemplo B');

    expect(
        screen.getByTestId('btn-ver-no-mapa-disabled')
    ).toBeDisabled();
  });

  it('apresenta ocupação indisponível sem informar valores incorretos', async () => {
    render(<App />);

    await abrirDetalhes('Rua Exemplo D');

    expect(
        screen.getByTestId('stat-total')
    ).toHaveTextContent('15');

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('—');

    expect(
        screen.getByTestId('stat-ocupadas')
    ).toHaveTextContent('—');

    expect(
        screen.getByTestId('ocupacao-indisponivel')
    ).toBeInTheDocument();

    expect(
        screen.queryByRole('progressbar')
    ).not.toBeInTheDocument();
  });

  it('apresenta zero vagas livres quando o trecho está lotado', async () => {
    render(<App />);

    await abrirDetalhes('Rua Exemplo C');

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('0');

    expect(
        screen.queryByTestId('ocupacao-indisponivel')
    ).not.toBeInTheDocument();
  });

  it('não apresenta controles de edição manual nos detalhes', async () => {
    render(<App />);

    const detalhe = await abrirDetalhes('Avenida Exemplo A');

    expect(
        within(detalhe).queryByRole('button', {
          name: /resimular|simular novamente|alterar ocupação|editar/i,
        })
    ).not.toBeInTheDocument();

    expect(
        screen.getByTestId('btn-simular-ocupacao')
    ).toBeInTheDocument();
  });
});

describe('Visualização do mapa', () => {
  it('exibe marcadores somente para trechos com coordenadas verificadas', async () => {
    render(<App />);

    const mapa = await screen.findByTestId('leaflet-map-mock');

    expect(
        within(mapa).getAllByRole('button')
    ).toHaveLength(2);

    expect(
        within(mapa).getByRole('button', {
          name: /Avenida Exemplo A/i,
        })
    ).toBeInTheDocument();

    expect(
        within(mapa).getByRole('button', {
          name: /Rua Exemplo C/i,
        })
    ).toBeInTheDocument();

    expect(
        within(mapa).queryByRole('button', {
          name: /Rua Exemplo B/i,
        })
    ).not.toBeInTheDocument();
  });

  it('permite abrir os detalhes a partir de um marcador', async () => {
    render(<App />);

    const mapa = await screen.findByTestId('leaflet-map-mock');

    fireEvent.click(
        within(mapa).getByRole('button', {
          name: /Avenida Exemplo A/i,
        })
    );

    fireEvent.click(
        await screen.findByTestId('callout-ver-detalhes')
    );

    expect(
        await screen.findByTestId('trecho-detail')
    ).toHaveTextContent('Avenida Exemplo A');
  });

  it('permite localizar no mapa o trecho selecionado nos detalhes', async () => {
    render(<App />);

    await abrirDetalhes('Avenida Exemplo A');

    fireEvent.click(
        screen.getByTestId('btn-ver-no-mapa')
    );

    await screen.findByTestId('leaflet-map-mock');

    expect(
        await screen.findByTestId('callout-ver-detalhes')
    ).toBeInTheDocument();
  });

  it('exibe estado vazio quando não existem coordenadas verificadas', async () => {
    carregarTrechosMock.mockResolvedValue(
        MASSA_TESTE.map((trecho) => ({
          ...trecho,
          coordenadasVerificadas: false,
        }))
    );

    render(<App />);

    expect(
        await screen.findByTestId('map-empty-state')
    ).toBeInTheDocument();
  });
});

describe('Simulação coletiva de ocupação', () => {
  it('atualiza a ocupação exibida após a simulação', async () => {
    const trechosAtualizados = MASSA_TESTE.map((trecho) => ({
      ...trecho,
      vagasOcupadas: trecho.quantidadeTotalVagas,
      vagasLivres: 0,
      atualizadoEm: '2026-11-24T11:00:00',
    }));

    simularOcupacaoMock.mockResolvedValue(trechosAtualizados);

    render(<App />);

    await screen.findByTestId('leaflet-map-mock');

    fireEvent.click(
        screen.getByTestId('btn-simular-ocupacao')
    );

    await waitFor(() => {
      expect(simularOcupacaoMock).toHaveBeenCalledTimes(1);

      expect(
          screen.getByTestId('btn-simular-ocupacao')
      ).toBeEnabled();
    });

    await abrirDetalhes('Avenida Exemplo A');

    expect(
        screen.getByTestId('stat-total')
    ).toHaveTextContent('52');

    expect(
        screen.getByTestId('stat-ocupadas')
    ).toHaveTextContent('52');

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('0');
  });

  it('desabilita o botão enquanto a simulação está em andamento', async () => {
    let concluirSimulacao!: (trechos: Trecho[]) => void;

    simularOcupacaoMock.mockImplementation(
        () => new Promise<Trecho[]>((resolve) => {
          concluirSimulacao = resolve;
        })
    );

    render(<App />);

    await screen.findByTestId('leaflet-map-mock');

    const botao = screen.getByTestId('btn-simular-ocupacao');

    fireEvent.click(botao);

    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(botao);

    expect(simularOcupacaoMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      concluirSimulacao(MASSA_TESTE);
    });

    expect(botao).toBeEnabled();
    expect(botao).toHaveAttribute('aria-busy', 'false');
  });

  it('informa falha na simulação e preserva os dados anteriores', async () => {
    simularOcupacaoMock.mockRejectedValue(
        new Error('Falha na simulação')
    );

    render(<App />);

    await screen.findByTestId('leaflet-map-mock');

    fireEvent.click(
        screen.getByTestId('btn-simular-ocupacao')
    );

    await waitFor(() => {
      expect(
          screen.getByRole('alert')
      ).toHaveTextContent(/Falha na simulação/i);

      expect(
          screen.getByTestId('btn-simular-ocupacao')
      ).toBeEnabled();
    });

    await abrirDetalhes('Avenida Exemplo A');

    expect(
        screen.getByTestId('stat-ocupadas')
    ).toHaveTextContent('21');

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('31');
  });
});

describe('Tratamento de dados excepcionais nos detalhes', () => {
  it('trata trecho inexistente sem interromper a aplicação', () => {
    render(
        <TrechoDetail
            trecho={undefined}
            onBack={vi.fn()}
            onViewOnMap={vi.fn()}
        />
    );

    expect(
        screen.getByTestId('trecho-detail-not-found')
    ).toBeInTheDocument();
  });

  it('não apresenta ocupação corrompida como válida', () => {
    const trecho = processarTrecho({
      ...trechoBase,
      vagasOcupadas: 999,
    });

    render(
        <TrechoDetail
            trecho={trecho}
            onBack={vi.fn()}
            onViewOnMap={vi.fn()}
        />
    );

    expect(
        screen.getByTestId('stat-livres')
    ).toHaveTextContent('—');

    expect(
        screen.getByTestId('ocupacao-indisponivel')
    ).toBeInTheDocument();
  });

  it('trata data de atualização inválida', () => {
    const trecho = processarTrecho({
      ...trechoBase,
      atualizadoEm: 'data-invalida',
    });

    render(
        <TrechoDetail
            trecho={trecho}
            onBack={vi.fn()}
            onViewOnMap={vi.fn()}
        />
    );

    expect(
        screen.getByTestId('data-atualizacao')
    ).toHaveTextContent(/não informada/i);
  });
});
});
