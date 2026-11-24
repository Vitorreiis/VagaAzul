
import { describe, expect, it } from 'vitest';

import {
  avaliarMarcador,
  buscarTrechoPorId,
  calcularStatus,
  filtrarTrechos,
  obterTrechosParaMapa,
  processarTrecho,
  processarTrechos,
  validarIdentificadoresUnicos,
  validarOcupacao,
} from '../services/trechosService';

import type { Trecho } from '../models/Trecho';

// Dados fictícios utilizados nos testes.
const trechoBase: Trecho = {
  id: 1,
  logradouro: 'Rua Exemplo A',
  bairro: 'Bairro X',
  quantidadeTotalVagas: 20,
  vagasOcupadas: 8,
  vagasLivres: 12,
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
    id: 2,
    quantidadeTotalVagas: 12,
    vagasOcupadas: 0,
    vagasLivres: 12,
  },
  {
    ...trechoBase,
    id: 3,
    logradouro: 'Rua Exemplo B',
    bairro: 'Bairro Y',
    quantidadeTotalVagas: 10,
    vagasOcupadas: 10,
    vagasLivres: 0,
  },
  {
    ...trechoBase,
    id: 4,
    logradouro: 'Rua Exemplo C',
    bairro: null,
    coordenadas: null,
    coordenadasVerificadas: false,
    atualizadoEm: null,
  },
  {
    ...trechoBase,
    id: 5,
    logradouro: 'Avenida Exemplo D',
    bairro: 'Bairro Z',
    quantidadeTotalVagas: 0,
    vagasOcupadas: 0,
    vagasLivres: 0,
    coordenadasVerificadas: false,
  },
  {
    ...trechoBase,
    id: 6,
    logradouro: 'Rua Exemplo E',
    bairro: 'Bairro Z',
    coordenadas: {
      lat: 91,
      lng: -38.43,
    },
  },
];

describe('Validação de ocupação', () => {
  it('CT01: aceita valores consistentes', () => {
    expect(validarOcupacao(20, 8, 12)).toEqual({
      valido: true,
    });
  });

  it('CT02 e CT03: aceita os limites de ocupação', () => {
    expect(validarOcupacao(20, 0, 20).valido).toBe(true);
    expect(validarOcupacao(20, 20, 0).valido).toBe(true);
  });

  it('CT03: rejeita ocupação acima da capacidade', () => {
    expect(validarOcupacao(20, 21, 0)).toEqual({
      valido: false,
      erro: 'OCUPACAO_EXCEDE_TOTAL',
    });
  });

  it('CT04: rejeita ocupação negativa', () => {
    expect(validarOcupacao(20, -1, 21)).toEqual({
      valido: false,
      erro: 'OCUPACAO_NEGATIVA',
    });
  });

  it('CT04: rejeita ocupação inválida', () => {
    expect(validarOcupacao(20, 2.5, 12)).toEqual({
      valido: false,
      erro: 'OCUPACAO_INVALIDA',
    });

    expect(validarOcupacao(20, 'abc', 12).valido).toBe(false);
  });

  it('CT04 e CT06: identifica ocupação indisponível', () => {
    expect(validarOcupacao(20, null, null)).toEqual({
      valido: false,
      erro: 'OCUPACAO_INDISPONIVEL',
    });

    expect(validarOcupacao(20, 8, null)).toEqual({
      valido: false,
      erro: 'OCUPACAO_INDISPONIVEL',
    });
  });

  it('CT05: rejeita capacidade inválida', () => {
    expect(validarOcupacao(0, 0, 0)).toEqual({
      valido: false,
      erro: 'TOTAL_INVALIDO',
    });

    expect(validarOcupacao(-1, 0, 0).valido).toBe(false);
    expect(validarOcupacao(2.5, 0, 0).valido).toBe(false);
  });

  it('CT06: rejeita quantidade de vagas livres inconsistente', () => {
    expect(validarOcupacao(20, 8, 11)).toEqual({
      valido: false,
      erro: 'VAGAS_LIVRES_INCONSISTENTES',
    });

    expect(validarOcupacao(20, 8, -1).valido).toBe(false);
    expect(validarOcupacao(20, 8, 21).valido).toBe(false);
    expect(validarOcupacao(20, 8, 12.5).valido).toBe(false);
  });
});

describe('Identificadores únicos', () => {
  it('CT08: aceita trechos diferentes no mesmo logradouro', () => {
    expect(
        validarIdentificadoresUnicos([
          MASSA_TESTE[0],
          MASSA_TESTE[1],
        ])
    ).toEqual({
      valido: true,
      duplicados: [],
    });
  });

  it('CT08: identifica e rejeita IDs duplicados', () => {
    const duplicados = [trechoBase, trechoBase];

    expect(validarIdentificadoresUnicos(duplicados)).toEqual({
      valido: false,
      duplicados: [1],
    });

    expect(() => processarTrechos(duplicados)).toThrow(/duplicados/i);
  });

  it('aceita uma base vazia', () => {
    expect(processarTrechos([])).toEqual([]);
  });
});

describe('Validação de coordenadas', () => {
  it('CT09: aceita coordenadas válidas e verificadas', () => {
    expect(avaliarMarcador(-12.9667, -38.4148, true)).toBe(true);
  });

  it('CT09: rejeita coordenadas não verificadas', () => {
    expect(avaliarMarcador(-12.9667, -38.4148, false)).toBe(false);
  });

  it('CT09: aceita os limites geográficos', () => {
    expect(avaliarMarcador(90, 180, true)).toBe(true);
    expect(avaliarMarcador(-90, -180, true)).toBe(true);
    expect(avaliarMarcador(0, 0, true)).toBe(true);
  });

  it('CT09: rejeita coordenadas inválidas', () => {
    expect(avaliarMarcador(91, 0, true)).toBe(false);
    expect(avaliarMarcador(-91, 0, true)).toBe(false);
    expect(avaliarMarcador(0, 181, true)).toBe(false);
    expect(avaliarMarcador(0, -181, true)).toBe(false);
    expect(avaliarMarcador(NaN, 0, true)).toBe(false);
    expect(avaliarMarcador(0, Infinity, true)).toBe(false);
  });

  it('CT10: rejeita coordenadas ausentes ou incompletas', () => {
    expect(avaliarMarcador(null, null, false)).toBe(false);
    expect(avaliarMarcador(null, -38.4, true)).toBe(false);
    expect(avaliarMarcador(-12.9, null, true)).toBe(false);
  });
});

describe('Processamento dos trechos', () => {
  it('CT11 e CT12: mantém seis trechos na lista e três no mapa', () => {
    const lista = processarTrechos(MASSA_TESTE);
    const mapa = obterTrechosParaMapa(lista);

    expect(lista).toHaveLength(6);
    expect(mapa.map((trecho) => trecho.id)).toEqual([1, 2, 3]);
  });

  it('preserva os dados válidos recebidos da API', () => {
    const trecho = processarTrecho(trechoBase);

    expect(trecho).toMatchObject({
      ...trechoBase,
      dadosValidos: true,
      status: 'livre',
      exibirNoMapa: true,
    });
  });

  it('identifica bairro ausente e permite buscar pelo ID', () => {
    const lista = processarTrechos(MASSA_TESTE);
    const trecho = buscarTrechoPorId(lista, 4);

    expect(trecho?.bairroExibicao).toBe('Bairro não informado');
    expect(trecho?.exibirNoMapa).toBe(false);
    expect(buscarTrechoPorId(lista, 999)).toBeUndefined();
  });

  it('trata dados inválidos sem modificar o objeto original', () => {
    const original = {
      ...trechoBase,
      vagasOcupadas: 999,
    };

    const trecho = processarTrecho(original);

    expect(trecho).toMatchObject({
      dadosValidos: false,
      erroValidacao: 'OCUPACAO_EXCEDE_TOTAL',
      vagasOcupadas: null,
      vagasLivres: null,
      status: 'indisponivel',
    });

    expect(original.vagasOcupadas).toBe(999);
    expect(original.vagasLivres).toBe(12);

    expect(processarTrecho(MASSA_TESTE[4]).status).toBe(
        'indisponivel'
    );
  });

  it('não confunde ocupação indisponível com estacionamento lotado', () => {
    const trecho = processarTrecho({
      ...trechoBase,
      vagasOcupadas: null,
      vagasLivres: null,
    });

    expect(trecho.dadosValidos).toBe(false);
    expect(trecho.status).toBe('indisponivel');
    expect(trecho.vagasLivres).toBeNull();
    expect(trecho.exibirNoMapa).toBe(true);
    expect(obterTrechosParaMapa([trecho])).toHaveLength(1);
  });
});

describe('Classificação de disponibilidade', () => {
  it('classifica como livre a partir de 40% de vagas livres', () => {
    expect(calcularStatus(100, 40)).toBe('livre');
    expect(calcularStatus(100, 100)).toBe('livre');
  });

  it('classifica como pouca vaga abaixo de 40%', () => {
    expect(calcularStatus(100, 39)).toBe('pouca_vaga');
    expect(calcularStatus(100, 1)).toBe('pouca_vaga');
  });

  it('classifica como ocupado quando não existem vagas livres', () => {
    expect(calcularStatus(100, 0)).toBe('ocupado');
  });

  it('classifica dados inválidos ou ausentes como indisponíveis', () => {
    expect(calcularStatus(100, null)).toBe('indisponivel');
    expect(calcularStatus(0, 0)).toBe('indisponivel');
    expect(calcularStatus(100, -1)).toBe('indisponivel');
    expect(calcularStatus(100, 101)).toBe('indisponivel');
    expect(calcularStatus(100, 2.5)).toBe('indisponivel');
  });
});

describe('Busca e filtros', () => {
  const processados = processarTrechos(MASSA_TESTE);

  it('busca logradouros ignorando acentos e maiúsculas', () => {
    const resultado = filtrarTrechos(
        processados,
        '  EXÉMPLO B  ',
        'todos'
    );

    expect(resultado.map((trecho) => trecho.id)).toEqual([3]);
  });

  it('permite buscar pelo identificador e filtrar pelo bairro', () => {
    const porId = filtrarTrechos(processados, '3', 'todos');

    const porBairro = filtrarTrechos(
        processados,
        '',
        'todos',
        'Bairro X'
    );

    expect(porId.map((trecho) => trecho.id)).toEqual([3]);
    expect(porBairro.map((trecho) => trecho.id)).toEqual([1, 2]);
  });

  it('filtra trechos pela disponibilidade', () => {
    const poucaVaga = processarTrecho({
      ...trechoBase,
      id: 7,
      vagasOcupadas: 19,
      vagasLivres: 1,
    });

    const lista = [...processados, poucaVaga];

    expect(
        filtrarTrechos(lista, '', 'livres').map((trecho) => trecho.id)
    ).toEqual([1, 2, 4, 6]);

    expect(
        filtrarTrechos(lista, '', 'pouca_vaga').map((trecho) => trecho.id)
    ).toEqual([7]);

    expect(
        filtrarTrechos(lista, '', 'ocupados').map((trecho) => trecho.id)
    ).toEqual([3]);
  });

  it('mantém trechos indisponíveis no filtro Todos', () => {
    const resultado = filtrarTrechos(processados, '', 'todos');

    expect(resultado).toHaveLength(6);
    expect(
        resultado.some((trecho) => trecho.status === 'indisponivel')
    ).toBe(true);
  });

  it('retorna uma lista vazia quando não encontra correspondência', () => {
    expect(
        filtrarTrechos(processados, 'Rua inexistente', 'todos')
    ).toEqual([]);
  });
});
