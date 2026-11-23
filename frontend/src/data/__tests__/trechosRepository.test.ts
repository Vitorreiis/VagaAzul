import { describe, expect, it, vi } from 'vitest';
import {
  carregarTrechosAreaIV,
  mapearRegistroApiParaTrecho,
} from '../trechosRepository';
import { TRECHOS_AREA_IV } from '../trechosAreaIV';

describe('trechosRepository — Integração com esquema SQL e fallback local', () => {
  it('mapeia corretamente um registro no formato PostgreSQL (vagaazul.sql)', () => {
    const mapped = mapearRegistroApiParaTrecho({
      id_trecho: 101,
      logradouro: 'Av. Octávio Mangabeira',
      nome_bairro: 'Pituaçu',
      quantidade_total_vagas: 52,
      vagas_ocupadas: 21,
      latitude: '-12.966700',
      longitude: '-38.414800',
      coordenadas_verificadas: true,
    });

    expect(mapped.id).toBe('101');
    expect(mapped.bairro).toBe('Pituaçu');
    expect(mapped.vagasTotais).toBe(52);
    expect(mapped.ocupacaoSimulada).toBe(21);
    expect(mapped.coordenadas).toEqual({ lat: -12.9667, lng: -38.4148 });
    expect(mapped.coordenadasVerificadas).toBe(true);
  });

  it('mapeia trecho sem coordenadas mantendo coordenadas nulas e não verificadas', () => {
    const mapped = mapearRegistroApiParaTrecho({
      id_trecho: 202,
      logradouro: 'Rua Lúcio Manoel da Silva',
      nome_bairro: 'Boca do Rio',
      quantidade_total_vagas: 18,
      vagas_ocupadas: 6,
      latitude: null,
      longitude: null,
    });

    expect(mapped.coordenadas).toBeNull();
    expect(mapped.coordenadasVerificadas).toBe(false);
  });

  it('retorna base unificada TRECHOS_AREA_IV quando VITE_API_URL não está definida', async () => {
    const dados = await carregarTrechosAreaIV('');
    expect(dados).toHaveLength(TRECHOS_AREA_IV.length);
  });

  it('lança erro legível quando a API retorna HTTP de falha (CT15)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(carregarTrechosAreaIV('http://localhost:3001')).rejects.toThrow(/503/);
    vi.unstubAllGlobals();
  });
});

