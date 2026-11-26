import type { TrechoResponse } from './TrechoResponse';
import type { Trecho } from '../domain/models/Trecho';

const TIMEOUT_REQUISICAO_MS = 10_000;

function numeroOuNulo(valor: unknown): boolean {
  return (
      valor === null ||
      (typeof valor === 'number' && Number.isFinite(valor))
  );
}


function registroValido(row: unknown): row is TrechoResponse {
  if (typeof row !== 'object' || row === null) {
    return false;
  }

  const candidato = row as Record<string, unknown>;

  return (
      typeof candidato.id === 'number' &&
      Number.isSafeInteger(candidato.id) &&
      candidato.id > 0 &&
      typeof candidato.logradouro === 'string' &&
      candidato.logradouro.trim() !== '' &&
      typeof candidato.bairro === 'string' &&
      candidato.bairro.trim() !== '' &&
      typeof candidato.quantidadeTotalVagas === 'number' &&
      Number.isFinite(candidato.quantidadeTotalVagas) &&
      numeroOuNulo(candidato.vagasOcupadas) &&
      numeroOuNulo(candidato.vagasLivres) &&
      numeroOuNulo(candidato.latitude) &&
      numeroOuNulo(candidato.longitude) &&
      (
          candidato.atualizadoEm === null ||
          typeof candidato.atualizadoEm === 'string'
      ) &&
      typeof candidato.ocupacaoSimulada === 'boolean'
  );
}


export function mapearRegistroApiParaTrecho(
    row: TrechoResponse
): Trecho {
  const coordenadas =
      row.latitude !== null && row.longitude !== null
          ? { lat: row.latitude, lng: row.longitude }
          : null;

  return {
    id: row.id,
    logradouro: row.logradouro,
    bairro: row.bairro,
    quantidadeTotalVagas: row.quantidadeTotalVagas,
    vagasOcupadas: row.vagasOcupadas,
    vagasLivres: row.vagasLivres,
    ocupacaoSimulada: row.ocupacaoSimulada,
    coordenadas,
      coordenadasVerificadas:
          coordenadas !== null &&
          Number.isFinite(coordenadas.lat) &&
          Number.isFinite(coordenadas.lng) &&
          coordenadas.lat >= -90 &&
          coordenadas.lat <= 90 &&
          coordenadas.lng >= -180 &&
          coordenadas.lng <= 180,
    atualizadoEm: row.atualizadoEm,
  };
}

export async function carregarTrechosAreaIV(
    apiUrl: string | undefined = import.meta.env.VITE_API_URL
): Promise<Trecho[]> {
  if (!apiUrl || apiUrl.trim() === '') {
    throw new Error('Endereço da API não configurado.');
  }

  const endpoint = `${apiUrl.trim().replace(/\/+$/, '')}/trechos`;

  const controller = new AbortController();

  const timer = setTimeout(
      () => controller.abort(),
      TIMEOUT_REQUISICAO_MS
  );

  try {
    const resposta = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!resposta.ok) {
      throw new Error(
          `Falha ao consultar trechos (HTTP ${resposta.status}).`
      );
    }

    const dados: unknown = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error(
          'Formato de resposta inválido ao consultar trechos.'
      );
    }

    if (!dados.every(registroValido)) {
      throw new Error(
          'A API retornou registros de trechos incompatíveis com o contrato esperado.'
      );
    }

    return dados.map(mapearRegistroApiParaTrecho);
  } catch (erro) {
    if (controller.signal.aborted) {
      throw new Error(
          'Tempo limite excedido ao consultar trechos.'
      );
    }

    throw erro;
  } finally {
    clearTimeout(timer);
  }
}

export async function simularOcupacaoTodos(
    apiUrl: string | undefined = import.meta.env.VITE_API_URL
): Promise<Trecho[]> {
    if (!apiUrl || apiUrl.trim() === '') {
        throw new Error('Endereço da API não configurado.');
    }

    const endpoint = `${apiUrl.trim().replace(/\/+$/, '')}/trechos/simular`;

    const controller = new AbortController();

    const timer = setTimeout(
        () => controller.abort(),
        TIMEOUT_REQUISICAO_MS
    );

    try {
        const resposta = await fetch(endpoint, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });

        if (!resposta.ok) {
            throw new Error(
                `Falha ao simular ocupação (HTTP ${resposta.status}).`
            );
        }

        const dados: unknown = await resposta.json();

        if (!Array.isArray(dados) || !dados.every(registroValido)) {
            throw new Error('Resposta de simulação inválida.');
        }

        return dados.map(mapearRegistroApiParaTrecho);
    } catch (erro) {
        if (controller.signal.aborted) {
            throw new Error('Tempo limite excedido ao simular ocupação.');
        }

        throw erro;
    } finally {
        clearTimeout(timer);
    }
}
