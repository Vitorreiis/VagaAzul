import { Trecho } from '../models/Trecho';

/**
 * Gera um valor inteiro de ocupação simulada dentro do intervalo [0, total] (RN03, RN06).
 * Regra documentada (DEF-02): distribuição uniforme discreta sobre [0, total],
 * garantindo inclusão dos extremos 0 (totalmente livre) e total (totalmente ocupado).
 */
export function gerarOcupacaoSimulada(
  total: number,
  rng: () => number = Math.random
): number {
  if (!Number.isInteger(total) || total <= 0) {
    return 0;
  }

  const amostra = rng();
  const amostraNormalizada =
    Number.isFinite(amostra) && amostra >= 0 ? (amostra >= 1 ? 0.999999999 : amostra) : 0;

  const ocupadas = Math.floor(amostraNormalizada * (total + 1));
  return Math.max(0, Math.min(total, ocupadas));
}

/**
 * Re-simula a ocupação de uma lista de trechos sem jamais alterar a capacidade total
 * ou qualquer outro dado cadastral oficial (RN06).
 */
export function resimularTrechos(
  trechos: Trecho[],
  rng: () => number = Math.random
): Trecho[] {
  return trechos.map((trecho) => ({
    ...trecho,
    ocupacaoSimulada: gerarOcupacaoSimulada(trecho.vagasTotais, rng),
  }));
}

