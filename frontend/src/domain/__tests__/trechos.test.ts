import { describe, expect, it } from 'vitest';
import {
  adicionarTrechoSemDuplicidade,
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
import { Trecho } from '../models/Trecho';

const MASSA_TESTE: Trecho[] = [
  {
    id: 'T-001',
    logradouro: 'Rua Exemplo A',
    bairro: 'Bairro X',
    vagasTotais: 20,
    ocupacaoSimulada: 8,
    coordenadas: { lat: -12.9667, lng: -38.4148 },
    coordenadasVerificadas: true,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
  {
    id: 'T-002',
    logradouro: 'Rua Exemplo A',
    referencia: 'Outro trecho da mesma rua',
    bairro: 'Bairro X',
    vagasTotais: 12,
    ocupacaoSimulada: 0,
    coordenadas: { lat: -12.9675, lng: -38.416 },
    coordenadasVerificadas: true,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
  {
    id: 'T-003',
    logradouro: 'Rua Exemplo B',
    bairro: 'Bairro Y',
    vagasTotais: 10,
    ocupacaoSimulada: 10,
    coordenadas: { lat: -12.9712, lng: -38.42 },
    coordenadasVerificadas: true,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
  {
    id: 'T-004',
    logradouro: 'Rua Exemplo C',
    bairro: undefined,
    vagasTotais: 15,
    ocupacaoSimulada: 5,
    coordenadas: null,
    coordenadasVerificadas: false,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
  {
    id: 'T-005',
    logradouro: 'Avenida Exemplo D',
    bairro: 'Bairro Z',
    vagasTotais: 0,
    ocupacaoSimulada: 0,
    coordenadas: { lat: -12.975, lng: -38.425 },
    coordenadasVerificadas: false,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
  {
    id: 'T-006',
    logradouro: 'Rua Exemplo E',
    bairro: 'Bairro Z',
    vagasTotais: 8,
    ocupacaoSimulada: 3,
    coordenadas: { lat: 91, lng: -38.43 },
    coordenadasVerificadas: true,
    tarifa: 'R$ 2,50 / hora',
    horario: 'Segunda a Sábado | 07h às 19h',
    fonteReferencia: 'Teste',
  },
];

describe('trechosService — Regras de Negócio e Validações (CT01 a CT10)', () => {
  it('CT01: calcula vagas livres no caso nominal (total 20, ocupadas 8 => 12 livres)', () => {
    const res = validarOcupacao(20, 8);
    expect(res).toEqual({ valido: true, vagasLivres: 12 });
  });

  it('CT02: aceita ocupação no limite inferior (total 12, ocupadas 0 e total 0, ocupadas 0)', () => {
    expect(validarOcupacao(12, 0)).toEqual({ valido: true, vagasLivres: 12 });
    expect(validarOcupacao(0, 0)).toEqual({ valido: true, vagasLivres: 0 });
  });

  it('CT03: aceita ocupação no limite superior e rejeita acima do total', () => {
    expect(validarOcupacao(10, 10)).toEqual({ valido: true, vagasLivres: 0 });
    expect(validarOcupacao(10, 11)).toEqual({
      valido: false,
      erro: 'OCUPACAO_EXCEDE_TOTAL',
    });
  });

  it('CT04: rejeita ocupação inválida (-1, 2.5, "abc", null)', () => {
    expect(validarOcupacao(20, -1)).toEqual({ valido: false, erro: 'OCUPACAO_NEGATIVA' });
    expect(validarOcupacao(20, 2.5)).toEqual({ valido: false, erro: 'OCUPACAO_INVALIDA' });
    expect(validarOcupacao(20, 'abc')).toEqual({ valido: false, erro: 'OCUPACAO_INVALIDA' });
    expect(validarOcupacao(20, null)).toEqual({ valido: false, erro: 'OCUPACAO_INVALIDA' });
  });

  it('CT05: rejeita capacidade total inválida (-1, 3.7, "abc", null)', () => {
    expect(validarOcupacao(-1, 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
    expect(validarOcupacao(3.7, 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
    expect(validarOcupacao('abc', 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
    expect(validarOcupacao(null, 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
  });

  it('CT06: cobre todos os caminhos de decisão de validarOcupacao (100% ramos)', () => {
    expect(validarOcupacao(3.7, 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
    expect(validarOcupacao(-1, 0)).toEqual({ valido: false, erro: 'TOTAL_INVALIDO' });
    expect(validarOcupacao(10, 2.5)).toEqual({ valido: false, erro: 'OCUPACAO_INVALIDA' });
    expect(validarOcupacao(10, -1)).toEqual({ valido: false, erro: 'OCUPACAO_NEGATIVA' });
    expect(validarOcupacao(10, 11)).toEqual({
      valido: false,
      erro: 'OCUPACAO_EXCEDE_TOTAL',
    });
    expect(validarOcupacao(10, 4)).toEqual({ valido: true, vagasLivres: 6 });
  });

  it('CT08: garante identificador único mesmo para trechos na mesma rua', () => {
    const baseInicial = [MASSA_TESTE[0]];
    const t002 = adicionarTrechoSemDuplicidade(baseInicial, MASSA_TESTE[1]);
    expect(t002.aceito).toBe(true);
    expect(t002.base).toHaveLength(2);

    const duplicado = adicionarTrechoSemDuplicidade(t002.base, {
      ...MASSA_TESTE[1],
      id: 'T-001',
    });
    expect(duplicado.aceito).toBe(false);
    expect(duplicado.base).toHaveLength(2);

    const checagem = validarIdentificadoresUnicos([MASSA_TESTE[0], MASSA_TESTE[0]]);
    expect(checagem.valido).toBe(false);
    expect(checagem.duplicados).toEqual(['T-001']);
  });

  it('CT09: decide exibição de marcador com tabela de decisão + AVL', () => {
    // T-001 verificada
    expect(avaliarMarcador(-12.9667, -38.4148, true)).toBe(true);
    // T-004 ausente
    expect(avaliarMarcador(undefined, undefined, false)).toBe(false);
    // T-005 não verificada
    expect(avaliarMarcador(-12.975, -38.425, false)).toBe(false);
    // T-006 latitude 91
    expect(avaliarMarcador(91, -38.43, true)).toBe(false);
    // Valores limite válidos
    expect(avaliarMarcador(90, 0, true)).toBe(true);
    expect(avaliarMarcador(-90, 0, true)).toBe(true);
    expect(avaliarMarcador(0, 180, true)).toBe(true);
    expect(avaliarMarcador(0, -180, true)).toBe(true);
    // Limite inválido
    expect(avaliarMarcador(0, 181, true)).toBe(false);
    expect(avaliarMarcador(0, -181, true)).toBe(false);
    expect(avaliarMarcador(-91, 0, true)).toBe(false);
  });

  it('CT10: cobre todas as decisões e condições de avaliarMarcador', () => {
    expect(avaliarMarcador(null, -38.4, true)).toBe(false);
    expect(avaliarMarcador(-12.9, null, true)).toBe(false);
    expect(avaliarMarcador(91, 0, true)).toBe(false);
    expect(avaliarMarcador(0, 181, true)).toBe(false);
    expect(avaliarMarcador(-12.9, -38.4, false)).toBe(false);
    expect(avaliarMarcador(-12.9, -38.4, true)).toBe(true);
  });

  it('CT11 e CT12: processa massa de 6 trechos gerando 6 na lista e 3 no mapa, preservando bairro ausente', () => {
    const lista = processarTrechos(MASSA_TESTE);
    const mapa = obterTrechosParaMapa(lista);

    expect(lista).toHaveLength(6);
    expect(mapa.map((t) => t.id)).toEqual(['T-001', 'T-002', 'T-003']);

    const t004 = buscarTrechoPorId(lista, 'T-004');
    expect(t004?.bairroExibicao).toBe('Bairro não informado');
    expect(t004?.exibirNoMapa).toBe(false);

    expect(buscarTrechoPorId(lista, 'INEXISTENTE')).toBeUndefined();
  });

  it('classifica corretamente status visual (livre, pouca_vaga, ocupado) e filtra por busca/status', () => {
    expect(calcularStatus(100, 40)).toBe('livre');
    expect(calcularStatus(100, 39)).toBe('pouca_vaga');
    expect(calcularStatus(100, 0)).toBe('ocupado');

    const processados = processarTrechos(MASSA_TESTE);
    expect(filtrarTrechos(processados, 'exemplo b', 'todos')).toHaveLength(1);
    expect(filtrarTrechos(processados, '', 'ocupados').map((t) => t.id)).toContain('T-003');
    expect(filtrarTrechos(processados, '', 'livres').map((t) => t.id)).toContain('T-001');
  });

  it('marca dados inválidos sem quebrar processamento quando capacidade/ocupação vier corrompida', () => {
    const corrompido = processarTrecho({
      ...MASSA_TESTE[0],
      ocupacaoSimulada: 999,
    });
    expect(corrompido.dadosValidos).toBe(false);
    expect(corrompido.erroValidacao).toBe('OCUPACAO_EXCEDE_TOTAL');
    expect(corrompido.vagasLivres).toBe(0);
  });
});

