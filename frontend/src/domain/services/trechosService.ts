import type {
  ErroOcupacao,
  FiltroDisponibilidade,
  StatusOcupacao,
  Trecho,
  TrechoCalculado,
} from '../models/Trecho';

export type ResultadoValidacaoOcupacao =
    | { valido: true }
    | { valido: false; erro: ErroOcupacao };

export function validarOcupacao(
    total: unknown,
    ocupadas: unknown,
    livres: unknown
): ResultadoValidacaoOcupacao {
  if (
      typeof total !== 'number' ||
      !Number.isSafeInteger(total) ||
      total <= 0
  ) {
    return { valido: false, erro: 'TOTAL_INVALIDO' };
  }

  if (ocupadas === null) {
    return { valido: false, erro: 'OCUPACAO_INDISPONIVEL' };
  }

  if (
      typeof ocupadas !== 'number' ||
      !Number.isSafeInteger(ocupadas)
  ) {
    return { valido: false, erro: 'OCUPACAO_INVALIDA' };
  }

  if (ocupadas < 0) {
    return { valido: false, erro: 'OCUPACAO_NEGATIVA' };
  }

  if (ocupadas > total) {
    return { valido: false, erro: 'OCUPACAO_EXCEDE_TOTAL' };
  }

  if (livres === null) {
    return { valido: false, erro: 'OCUPACAO_INDISPONIVEL' };
  }

  if (
      typeof livres !== 'number' ||
      !Number.isSafeInteger(livres) ||
      livres < 0 ||
      livres > total ||
      livres !== total - ocupadas
  ) {
    return {
      valido: false,
      erro: 'VAGAS_LIVRES_INCONSISTENTES',
    };
  }

  return { valido: true };
}

/**
 * Permite marcadores somente para coordenadas
 * numericamente válidas e previamente verificadas.
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

  return verificada === true;
}

/**
 * Classifica a disponibilidade para apresentação visual.
 * Livre: pelo menos 40% das vagas disponíveis.
 * Pouca vaga: disponibilidade positiva inferior a 40%.
 * Ocupado: nenhuma vaga disponível.
 * Indisponível: dados ausentes ou inválidos.
 */
export function calcularStatus(
    vagasTotais: number,
    vagasLivres: number | null
): StatusOcupacao {
  if (
      !Number.isSafeInteger(vagasTotais) ||
      vagasTotais <= 0 ||
      vagasLivres === null ||
      !Number.isSafeInteger(vagasLivres) ||
      vagasLivres < 0 ||
      vagasLivres > vagasTotais
  ) {
    return 'indisponivel';
  }

  if (vagasLivres === 0) {
    return 'ocupado';
  }

  return vagasLivres / vagasTotais >= 0.4
      ? 'livre'
      : 'pouca_vaga';
}

/**
 * Verifica a unicidade dos identificadores recebidos.
 */
export function validarIdentificadoresUnicos(
    trechos: Trecho[]
): {
  valido: boolean;
  duplicados: number[];
} {
  const vistos = new Set<number>();
  const duplicados = new Set<number>();

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
 * Enriquece o modelo de domínio com informações
 * necessárias à apresentação.
 */
export function processarTrecho(
    trecho: Trecho
): TrechoCalculado {
  const validacao = validarOcupacao(
      trecho.quantidadeTotalVagas,
      trecho.vagasOcupadas,
      trecho.vagasLivres
  );

  const status = validacao.valido
      ? calcularStatus(
          trecho.quantidadeTotalVagas,
          trecho.vagasLivres
      )
      : 'indisponivel';

  const exibirNoMapa = avaliarMarcador(
      trecho.coordenadas?.lat,
      trecho.coordenadas?.lng,
      trecho.coordenadasVerificadas
  );

  return {
    ...trecho,
    bairroExibicao:
        trecho.bairro?.trim() || 'Bairro não informado',
    vagasOcupadas: validacao.valido
        ? trecho.vagasOcupadas
        : null,
    vagasLivres: validacao.valido
        ? trecho.vagasLivres
        : null,
    status,
    exibirNoMapa,
    dadosValidos: validacao.valido,
    erroValidacao: validacao.valido
        ? undefined
        : validacao.erro,
  };
}

export function processarTrechos(
    trechos: Trecho[]
): TrechoCalculado[] {
  const validacao = validarIdentificadoresUnicos(trechos);

  if (!validacao.valido) {
    throw new Error(
        `Identificadores de trechos duplicados: ${validacao.duplicados.join(', ')}.`
    );
  }

  return trechos.map(processarTrecho);
}

function normalizarTexto(texto: string): string {
  return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
}

export function filtrarTrechos(
    trechos: TrechoCalculado[],
    busca: string,
    filtro: FiltroDisponibilidade,
    bairroFiltro?: string
): TrechoCalculado[] {
  const termo = normalizarTexto(busca);
  const bairroAlvo = bairroFiltro
      ? normalizarTexto(bairroFiltro)
      : '';

  return trechos.filter((trecho) => {
    if (filtro === 'livres' && trecho.status !== 'livre') {
      return false;
    }

    if (
        filtro === 'pouca_vaga' &&
        trecho.status !== 'pouca_vaga'
    ) {
      return false;
    }

    if (
        filtro === 'ocupados' &&
        trecho.status !== 'ocupado'
    ) {
      return false;
    }

    if (bairroAlvo && bairroAlvo !== 'todos') {
      if (
          normalizarTexto(trecho.bairroExibicao) !== bairroAlvo
      ) {
        return false;
      }
    }

    if (!termo) {
      return true;
    }

    const alvo = normalizarTexto(
        `${trecho.logradouro} ${trecho.bairroExibicao} ${trecho.id}`
    );

    return alvo.includes(termo);
  });
}

export function obterTrechosParaMapa(
    trechos: TrechoCalculado[]
): TrechoCalculado[] {
  return trechos.filter((trecho) => trecho.exibirNoMapa);
}

export function buscarTrechoPorId(
    trechos: TrechoCalculado[],
    id: number
): TrechoCalculado | undefined {
  return trechos.find((trecho) => trecho.id === id);
}
