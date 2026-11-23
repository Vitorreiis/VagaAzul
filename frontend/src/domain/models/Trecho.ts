export type StatusOcupacao = 'livre' | 'pouca_vaga' | 'ocupado';

export type FiltroDisponibilidade = 'todos' | 'livres' | 'pouca_vaga' | 'ocupados';

export type ErroOcupacao =
  | 'TOTAL_INVALIDO'
  | 'OCUPACAO_INVALIDA'
  | 'OCUPACAO_NEGATIVA'
  | 'OCUPACAO_EXCEDE_TOTAL';

export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Representa um trecho regulamentado de Zona Azul conforme levantamento cadastral.
 * Espelha a modelagem relacional (tabela `trecho` + `bairro` + `ocupacao_simulada`).
 */
export interface Trecho {
  /** RN04: Identificador único obrigatório (diferencia múltiplos trechos na mesma via). */
  id: string;
  /** Nome oficial do logradouro. */
  logradouro: string;
  /** Complemento ou ponto de referência do trecho na via. */
  referencia?: string;
  /** Bairro na Área IV (Pituaçu, Boca do Rio, Imbuí). Pode estar ausente (UC03). */
  bairro?: string | null;
  /** Capacidade oficial de vagas cadastrada (inteiro >= 0). */
  vagasTotais: number;
  /** Quantidade simulada de vagas ocupadas (0 <= ocupacao <= vagasTotais). */
  ocupacaoSimulada: number;
  /** Coordenadas geográficas opcionais até validação (RN05). */
  coordenadas?: Coordenadas | null;
  /** Indica se as coordenadas foram conferidas e validadas pela equipe (RN05 / DEF-03). */
  coordenadasVerificadas?: boolean;
  /** Indica se o trecho está ativo na base da Área IV (DEF-04). */
  ativo?: boolean;
  /** Tarifa horária regulamentada. */
  tarifa: string;
  /** Dias e horários de cobrança. */
  horario: string;
  /** Fonte documental oficial (ex.: TransOnline / Portaria nº 121/2026). */
  fonteReferencia: string;
  /** Data de referência do levantamento cadastral. */
  dataReferencia?: string;
}

export interface TrechoCalculado extends Trecho {
  bairroExibicao: string;
  vagasLivres: number;
  status: StatusOcupacao;
  exibirNoMapa: boolean;
  dadosValidos: boolean;
  erroValidacao?: ErroOcupacao;
}

