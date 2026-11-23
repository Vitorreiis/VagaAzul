import { TRECHOS_AREA_IV } from './trechosAreaIV';
import { Trecho } from '../domain/models/Trecho';

/**
 * Formato compatível com as tabelas do banco PostgreSQL (`vagaazul.sql`):
 * `trecho` + `bairro` + `ocupacao_simulada`.
 */
export interface TrechoApiRow {
  id_trecho?: number | string;
  id?: string;
  logradouro: string;
  referencia?: string;
  bairro?: string | null;
  nome_bairro?: string | null;
  quantidade_total_vagas?: number;
  vagasTotais?: number;
  vagas_ocupadas?: number;
  ocupacaoSimulada?: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  coordenadas?: { lat: number; lng: number } | null;
  coordenadas_verificadas?: boolean;
  coordenadasVerificadas?: boolean;
  ativo?: boolean;
  tarifa?: string;
  horario?: string;
  fonte_referencia?: string;
  fonteReferencia?: string;
  data_referencia?: string;
  dataReferencia?: string;
}

export function mapearRegistroApiParaTrecho(row: TrechoApiRow): Trecho {
  const lat =
    row.coordenadas?.lat ??
    (row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : undefined);
  const lng =
    row.coordenadas?.lng ??
    (row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : undefined);

  const temCoordenadas =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  return {
    id: String(row.id ?? row.id_trecho ?? ''),
    logradouro: row.logradouro,
    referencia: row.referencia,
    bairro: row.bairro ?? row.nome_bairro ?? null,
    vagasTotais: row.vagasTotais ?? row.quantidade_total_vagas ?? 0,
    ocupacaoSimulada: row.ocupacaoSimulada ?? row.vagas_ocupadas ?? 0,
    coordenadas: temCoordenadas ? { lat, lng } : null,
    coordenadasVerificadas:
      row.coordenadasVerificadas ?? row.coordenadas_verificadas ?? temCoordenadas,
    ativo: row.ativo ?? true,
    tarifa: row.tarifa ?? 'R$ 2,50 / hora',
    horario: row.horario ?? 'Segunda a Sábado | 07h às 19h',
    fonteReferencia:
      row.fonteReferencia ?? row.fonte_referencia ?? 'TransOnline / Portaria nº 121/2026',
    dataReferencia: row.dataReferencia ?? row.data_referencia,
  };
}

/**
 * Carrega os trechos da Área IV via API (quando `VITE_API_URL` está configurada)
 * ou diretamente da base local unificada (`TRECHOS_AREA_IV`).
 * Nunca expõe operações de escrita (RNF08 — somente consulta GET).
 */
export async function carregarTrechosAreaIV(
  apiUrl: string | undefined = import.meta.env.VITE_API_URL
): Promise<Trecho[]> {
  if (!apiUrl || apiUrl.trim() === '') {
    return TRECHOS_AREA_IV;
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/trechos`;
  const resposta = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar trechos (HTTP ${resposta.status}).`);
  }

  const dados = (await resposta.json()) as TrechoApiRow[];
  if (!Array.isArray(dados)) {
    throw new Error('Formato de resposta inválido ao consultar trechos.');
  }

  return dados.map(mapearRegistroApiParaTrecho);
}

