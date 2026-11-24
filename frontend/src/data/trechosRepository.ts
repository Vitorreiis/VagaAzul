import { TRECHOS_AREA_IV } from './trechosAreaIV';
import { Trecho } from '../domain/models/Trecho';

const TARIFA_PADRAO = 'R$ 2,50 / hora';
const HORARIO_PADRAO = 'Segunda a Sábado | 07h às 19h';
const FONTE_REFERENCIA_PADRAO = 'TransOnline / Portaria nº 121/2026';
const TIMEOUT_REQUISICAO_MS = 10_000;

/**
 * Formato compatível com as tabelas do banco PostgreSQL (`vagaazul.sql`):
 * `trecho` + `bairro` + `ocupacao_simulada`.
 *
 * Aceita camelCase e snake_case porque a API pode devolver qualquer um dos dois.
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

/** Converte para número finito; devolve undefined para null, vazio ou inválido. */
function paraNumero(valor: unknown): number | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string' && valor.trim() === '') return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

/** Contagem de vagas: inteiro >= 0. */
function paraContagem(valor: unknown): number {
  const numero = paraNumero(valor);
  return numero === undefined || numero < 0 ? 0 : Math.floor(numero);
}

function obterId(row: TrechoApiRow): string {
  const id = row.id ?? row.id_trecho;
  return id === undefined || id === null ? '' : String(id).trim();
}

/** Registro mínimo para ser exibido: precisa de id e logradouro. */
function registroValido(row: unknown): row is TrechoApiRow {
  if (typeof row !== 'object' || row === null) return false;
  const candidato = row as TrechoApiRow;
  return (
    typeof candidato.logradouro === 'string' &&
    candidato.logradouro.trim() !== '' &&
    obterId(candidato) !== ''
  );
}

export function mapearRegistroApiParaTrecho(row: TrechoApiRow): Trecho {
  const lat = paraNumero(row.coordenadas?.lat ?? row.latitude);
  const lng = paraNumero(row.coordenadas?.lng ?? row.longitude);
  const temCoordenadas = lat !== undefined && lng !== undefined;

  const vagasTotais = paraContagem(row.vagasTotais ?? row.quantidade_total_vagas);
  const ocupacaoBruta = paraContagem(row.ocupacaoSimulada ?? row.vagas_ocupadas);

  return {
    id: obterId(row),
    logradouro: row.logradouro,
    referencia: row.referencia,
    bairro: row.bairro ?? row.nome_bairro ?? null,
    vagasTotais,
    // Garante 0 <= ocupação <= total, evitando percentual > 100% na UI.
    ocupacaoSimulada: Math.min(ocupacaoBruta, vagasTotais),
    coordenadas: temCoordenadas ? { lat, lng } : null,
    // Só é "verificada" se o backend disser explicitamente e houver coordenadas.
    coordenadasVerificadas:
      temCoordenadas && (row.coordenadasVerificadas ?? row.coordenadas_verificadas ?? false),
    ativo: row.ativo ?? true,
    tarifa: row.tarifa ?? TARIFA_PADRAO,
    horario: row.horario ?? HORARIO_PADRAO,
    fonteReferencia: row.fonteReferencia ?? row.fonte_referencia ?? FONTE_REFERENCIA_PADRAO,
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

  const endpoint = `${apiUrl.trim().replace(/\/+$/, '')}/trechos`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_REQUISICAO_MS);

  try {
    const resposta = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!resposta.ok) {
      throw new Error(`Falha ao consultar trechos (HTTP ${resposta.status}).`);
    }

    const dados: unknown = await resposta.json();
    if (!Array.isArray(dados)) {
      throw new Error('Formato de resposta inválido ao consultar trechos.');
    }

    const validos = dados.filter(registroValido);
    if (validos.length !== dados.length) {
      console.warn(
        `${dados.length - validos.length} registro(s) de trecho descartado(s) por falta de id ou logradouro.`
      );
    }

    return validos.map(mapearRegistroApiParaTrecho);
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao consultar trechos.');
    }
    throw erro;
  } finally {
    clearTimeout(timer);
  }
}
