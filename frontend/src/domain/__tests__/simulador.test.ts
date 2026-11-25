import { describe, expect, it } from 'vitest';
import { gerarOcupacaoSimulada, resimularTrechos } from '../services/simuladorService';
import { Trecho } from '../models/Trecho';

describe('simuladorService — Simulação Controlada (CT07 / RN03 / RN06)', () => {
  it('CT07: respeita 0 <= ocupadas <= total em 1000 execuções para totais 0, 1 e 20', () => {
    for (let i = 0; i < 1000; i += 1) {
      expect(gerarOcupacaoSimulada(0)).toBe(0);

      const paraUm = gerarOcupacaoSimulada(1);
      expect(Number.isInteger(paraUm)).toBe(true);
      expect(paraUm).toBeGreaterThanOrEqual(0);
      expect(paraUm).toBeLessThanOrEqual(1);

      const paraVinte = gerarOcupacaoSimulada(20);
      expect(Number.isInteger(paraVinte)).toBe(true);
      expect(paraVinte).toBeGreaterThanOrEqual(0);
      expect(paraVinte).toBeLessThanOrEqual(20);
    }
  });

  it('cobre ramos de limite do gerador com RNG determinístico (0.0 e 0.9999)', () => {
    expect(gerarOcupacaoSimulada(20, () => 0)).toBe(0);
    expect(gerarOcupacaoSimulada(20, () => 0.999999)).toBe(20);
    expect(gerarOcupacaoSimulada(20, () => 1)).toBe(20);
    expect(gerarOcupacaoSimulada(20, () => -0.5)).toBe(0);
    expect(gerarOcupacaoSimulada(-5)).toBe(0);
    expect(gerarOcupacaoSimulada(4.5)).toBe(0);
  });

  it('RN06: resimularTrechos altera apenas ocupacaoSimulada mantendo vagasTotais e dados cadastrais inalterados', () => {
    const entrada: Trecho[] = [
      {
        id: 'A4-PIT-001',
        logradouro: 'Av. Octávio Mangabeira',
        bairro: 'Pituaçu',
        vagasTotais: 52,
        ocupacaoSimulada: 10,
        coordenadas: { lat: -12.9667, lng: -38.4148 },
        coordenadasVerificadas: true,
        tarifa: 'R$ 2,50 / hora',
        horario: 'Segunda a Sábado | 07h às 19h',
        fonteReferencia: 'TransOnline',
      },
    ];

    const saida = resimularTrechos(entrada, () => 0.5);
    expect(saida[0].vagasTotais).toBe(52);
    expect(saida[0].id).toBe('A4-PIT-001');
    expect(saida[0].logradouro).toBe('Av. Octávio Mangabeira');
    expect(saida[0].ocupacaoSimulada).toBeGreaterThanOrEqual(0);
    expect(saida[0].ocupacaoSimulada).toBeLessThanOrEqual(52);
  });
});

