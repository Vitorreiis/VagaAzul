export interface TrechoResponse {
    id: number;
    bairro: string;
    logradouro: string;
    quantidadeTotalVagas: number;
    vagasOcupadas: number | null;
    vagasLivres: number | null;
    latitude: number | null;
    longitude: number | null;
    atualizadoEm: string | null;
    ocupacaoSimulada: boolean;
}