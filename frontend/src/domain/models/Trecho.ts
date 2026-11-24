
export type StatusOcupacao =
    | 'livre'
    | 'pouca_vaga'
    | 'ocupado'
    | 'indisponivel';

export type FiltroDisponibilidade =
    | 'todos'
    | 'livres'
    | 'pouca_vaga'
    | 'ocupados';

export type ErroOcupacao =
    | 'TOTAL_INVALIDO'
    | 'OCUPACAO_INVALIDA'
    | 'OCUPACAO_NEGATIVA'
    | 'OCUPACAO_EXCEDE_TOTAL'
    | 'OCUPACAO_INDISPONIVEL'
    | 'VAGAS_LIVRES_INCONSISTENTES';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Trecho {
  id: number;
  logradouro: string;
  bairro: string | null;
  quantidadeTotalVagas: number;
  vagasOcupadas: number | null;
  vagasLivres: number | null;
  ocupacaoSimulada: boolean;
  coordenadas: Coordenadas | null;
  coordenadasVerificadas: boolean;
  atualizadoEm: string | null;
}

export interface TrechoCalculado extends Trecho {
  bairroExibicao: string;
  status: StatusOcupacao;
  exibirNoMapa: boolean;
  dadosValidos: boolean;
  erroValidacao?: ErroOcupacao;
}
