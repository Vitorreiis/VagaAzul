import {
  ErroOcupacao,
  FiltroDisponibilidade,
  StatusOcupacao,
  Trecho,
  TrechoCalculado,
} from '../models/Trecho';

export type ResultadoValidacaoOcupacao =
  | { valido: true; vagasLivres: number }
  | { valido: false; erro: ErroOcupacao };

/**
 * Valida a capacidade total e a ocupação simulada e calcula vagas livres (RN02, RN03).
 * Implementa exatamente as 4 decisões especificadas na Seção 3.1 do Plano de Testes:
 * D1: total inválido -> TOTAL_INVALIDO
 * D2: ocupadas não inteiro -> OCUPACAO_INVALIDA
 * D3: ocupadas < 0 -> OCUPACAO_NEGATIVA
 * D4: ocupadas > total -> OCUPACAO_EXCEDE_TOTAL
 */
export function validarOcupacao(
  total: unknown,
  ocupadas: unknown
): ResultadoValidacaoOcupacao {
  if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) {
    return { valido: false, erro: 'TOTAL_INVALIDO' };
  }

  if (typeof ocupadas !== 'number' || !Number.isInteger(ocupadas)) {
    return { valido: false, erro: 'OCUPACAO_INVALIDA' };
  }

  if (ocupadas < 0) {
    return { valido: false, erro: 'OCUPACAO_NEGATIVA' };
  }

  if (ocupadas > total) {
    return { valido: false, erro: 'OCUPACAO_EXCEDE_TOTAL' };
  }

  return { valido: true, vagasLivres: total - ocupadas };
}

/**
 * Decide se um trecho deve receber marcador no mapa (RF01, RN05).
 * D1: lat/lon ausentes ou não numéricos -> false
 * D2: lat fora de [-90, 90] ou lon fora de [-180, 180] -> false
 * D3: coordenadas não verificadas -> false
 */
export function avaliarMarcador(
  lat: unknown,
  lon: unknown,
  verificada: unknown
): boolean {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    return false;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return false;
  }

  if (verificada !== true) {
    return false;
  }

  return true;
}

/**
 * Classifica o nível de disponibilidade para exibição visual (Verde, Amarelo, Vermelho):
 * - Livre: >= 40% das vagas livres
 * - Pouca vaga: entre 1% e 39% livres
 * - Ocupado: 0 vagas livres
 */
export function calcularStatus(vagasTotais: number, vagasLivres: number): StatusOcupacao {
  if (vagasLivres <= 0 || vagasTotais <= 0) {
    return 'ocupado';
  }

  const proporcaoLivre = vagasLivres / vagasTotais;
  if (proporcaoLivre >= 0.4) {
    return 'livre';
  }

  return 'pouca_vaga';
}

/**
 * Garante unicidade do identificador `id` na coleção de trechos (RN04 / CT08).
 */
export function validarIdentificadoresUnicos(trechos: Trecho[]): {
  valido: boolean;
  duplicados: string[];
} {
  const vistos = new Set<string>();
  const duplicados = new Set<string>();

  for (const trecho of trechos) {
    if (vistos.has(trecho.id)) {
      duplicados.add(trecho.id);
    } else {
      vistos.add(trecho.id);
    }
  }

  return {
    valido: duplicados.size === 0,
    duplicados: Array.from(duplicados),
  };
}

/**
 * Tenta cadastrar um novo trecho em uma base existente rejeitando IDs duplicados (CT08).
 */
export function adicionarTrechoSemDuplicidade(
  baseAtual: Trecho[],
  novoTrecho: Trecho
): { aceito: boolean; base: Trecho[]; motivo?: string } {
  const existe = baseAtual.some((item) => item.id === novoTrecho.id);
  if (existe) {
    return {
      aceito: false,
      base: baseAtual,
      motivo: `Identificador duplicado: ${novoTrecho.id}`,
    };
  }

  return {
    aceito: true,
    base: [...baseAtual, novoTrecho],
  };
}

/**
 * Converte um registro bruto em TrechoCalculado com validações aplicadas.
 */
export function processarTrecho(trecho: Trecho): TrechoCalculado {
  const validacao = validarOcupacao(trecho.vagasTotais, trecho.ocupacaoSimulada);
  const vagasLivres = validacao.valido ? validacao.vagasLivres : 0;
  const status = validacao.valido
    ? calcularStatus(trecho.vagasTotais, vagasLivres)
    : 'ocupado';

  const exibirNoMapa = avaliarMarcador(
    trecho.coordenadas?.lat,
    trecho.coordenadas?.lng,
    trecho.coordenadasVerificadas
  );

  const bairroLimpo = trecho.bairro?.trim();

  return {
    ...trecho,
    bairroExibicao: bairroLimpo && bairroLimpo.length > 0 ? bairroLimpo : 'Bairro não informado',
    vagasLivres,
    status,
    exibirNoMapa,
    dadosValidos: validacao.valido,
    erroValidacao: validacao.valido ? undefined : validacao.erro,
  };
}

/**
 * Processa todos os trechos ativos garantindo base única para Mapa, Lista e Detalhes (CA02).
 */
export function processarTrechos(trechos: Trecho[]): TrechoCalculado[] {
  const vistos = new Set<string>();
  const resultado: TrechoCalculado[] = [];

  for (const trecho of trechos) {
    if (trecho.ativo === false) {
      continue;
    }
    if (vistos.has(trecho.id)) {
      continue;
    }
    vistos.add(trecho.id);
    resultado.push(processarTrecho(trecho));
  }

  return resultado;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra trechos por busca textual (rua, bairro ou referência) e por estado de ocupação.
 */
export function filtrarTrechos(
  trechos: TrechoCalculado[],
  busca: string,
  filtro: FiltroDisponibilidade,
  bairroFiltro?: string
): TrechoCalculado[] {
  const termo = normalizarTexto(busca);
  const bairroAlvo = bairroFiltro ? normalizarTexto(bairroFiltro) : '';

  return trechos.filter((trecho) => {
    if (filtro === 'livres' && trecho.status !== 'livre') return false;
    if (filtro === 'pouca_vaga' && trecho.status !== 'pouca_vaga') return false;
    if (filtro === 'ocupados' && trecho.status !== 'ocupado') return false;

    if (bairroAlvo && bairroAlvo !== 'todos') {
      if (normalizarTexto(trecho.bairroExibicao) !== bairroAlvo) {
        return false;
      }
    }

    if (!termo) return true;

    const alvo = normalizarTexto(
      `${trecho.logradouro} ${trecho.bairroExibicao} ${trecho.referencia ?? ''} ${trecho.id}`
    );
    return alvo.includes(termo);
  });
}

/**
 * Retorna apenas os trechos elegíveis para exibição no mapa (RF01, RN05).
 */
export function obterTrechosParaMapa(trechos: TrechoCalculado[]): TrechoCalculado[] {
  return trechos.filter((trecho) => trecho.exibirNoMapa);
}

/**
 * Recupera um trecho pelo identificador único (UC03, CT12).
 */
export function buscarTrechoPorId(
  trechos: TrechoCalculado[],
  id: string
): TrechoCalculado | undefined {
  return trechos.find((trecho) => trecho.id === id);
}

