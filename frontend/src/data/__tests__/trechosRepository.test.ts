
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    carregarTrechosAreaIV,
    mapearRegistroApiParaTrecho,
    simularOcupacaoTodos,
} from '../trechosRepository';

import type { TrechoResponse } from '../TrechoResponse';
import { processarTrecho } from '../../domain/services/trechosService';

const API_URL = 'http://localhost:8080';

const REGISTRO_API: TrechoResponse = {
    id: 101,
    bairro: 'Pituaçu',
    logradouro: 'Av. Exemplo',
    quantidadeTotalVagas: 52,
    vagasOcupadas: 21,
    vagasLivres: 31,
    latitude: -12.9667,
    longitude: -38.4148,
    atualizadoEm: '2026-11-24T10:00:00',
    ocupacaoSimulada: true,
};

function simularRespostaApi(dados: unknown) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(dados),
    });

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

function simularErroHttp(status: number) {
    const jsonMock = vi.fn();

    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            ok: false,
            status,
            json: jsonMock,
        })
    );

    return jsonMock;
}

function simularFalhaConexao() {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );
}

function simularJsonInvalido() {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockRejectedValue(
                new SyntaxError('JSON inválido')
            ),
        })
    );
}

function simularRequisicaoLenta() {
    const fetchMock = vi.fn(
        (_url: string, opcoes: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
                opcoes.signal?.addEventListener(
                    'abort',
                    () => reject(
                        new DOMException('Requisição cancelada', 'AbortError')
                    ),
                    { once: true }
                );
            })
    );

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('Mapeamento da API REST', () => {
    it('mapeia corretamente os dados recebidos da API', () => {
        const trecho = mapearRegistroApiParaTrecho(REGISTRO_API);

        expect(trecho).toEqual({
            id: 101,
            bairro: 'Pituaçu',
            logradouro: 'Av. Exemplo',
            quantidadeTotalVagas: 52,
            vagasOcupadas: 21,
            vagasLivres: 31,
            ocupacaoSimulada: true,
            coordenadas: {
                lat: -12.9667,
                lng: -38.4148,
            },
            coordenadasVerificadas: true,
            atualizadoEm: '2026-11-24T10:00:00',
        });

        expect(processarTrecho(trecho).exibirNoMapa).toBe(true);
    });

    it('trata coordenadas ausentes ou incompletas', () => {
        const coordenadasAusentes = [
            { latitude: null, longitude: null },
            { latitude: null },
            { longitude: null },
        ];

        for (const coordenadas of coordenadasAusentes) {
            const trecho = mapearRegistroApiParaTrecho({
                ...REGISTRO_API,
                ...coordenadas,
            });

            expect(trecho.coordenadas).toBeNull();
            expect(trecho.coordenadasVerificadas).toBe(false);
            expect(processarTrecho(trecho).exibirNoMapa).toBe(false);
        }
    });

    it('impede marcadores com coordenadas inválidas', () => {
        const coordenadasInvalidas = [
            { latitude: 91, longitude: -38 },
            { latitude: -91, longitude: -38 },
            { latitude: -12, longitude: 181 },
            { latitude: -12, longitude: -181 },
        ];

        for (const coordenadas of coordenadasInvalidas) {
            const trecho = mapearRegistroApiParaTrecho({
                ...REGISTRO_API,
                ...coordenadas,
            });

            expect(trecho.coordenadasVerificadas).toBe(false);
            expect(processarTrecho(trecho).exibirNoMapa).toBe(false);
        }
    });

    it('preserva valores indisponíveis sem substituir por zero', () => {
        const trecho = mapearRegistroApiParaTrecho({
            ...REGISTRO_API,
            vagasOcupadas: null,
            vagasLivres: null,
            atualizadoEm: null,
        });

        expect(trecho.vagasOcupadas).toBeNull();
        expect(trecho.vagasLivres).toBeNull();
        expect(trecho.atualizadoEm).toBeNull();
    });

    it('preserva dados inconsistentes sem alterar o registro original', () => {
        const registro = {
            ...REGISTRO_API,
            vagasOcupadas: 999,
            vagasLivres: -947,
        };

        const original = { ...registro };
        const trecho = mapearRegistroApiParaTrecho(registro);

        expect(trecho.vagasOcupadas).toBe(999);
        expect(trecho.vagasLivres).toBe(-947);
        expect(registro).toEqual(original);
    });
});

describe('Consulta de trechos — GET', () => {
    it('consulta o endpoint correto e retorna os trechos mapeados', async () => {
        const segundoRegistro: TrechoResponse = {
            ...REGISTRO_API,
            id: 202,
            logradouro: 'Rua Exemplo B',
        };

        const fetchMock = simularRespostaApi([
            REGISTRO_API,
            segundoRegistro,
        ]);

        const resultado = await carregarTrechosAreaIV(
            '  http://localhost:8080///  '
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/trechos`,
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    Accept: 'application/json',
                }),
                signal: expect.any(AbortSignal),
            })
        );

        expect(resultado).toEqual([
            mapearRegistroApiParaTrecho(REGISTRO_API),
            mapearRegistroApiParaTrecho(segundoRegistro),
        ]);
    });

    it('aceita uma lista vazia', async () => {
        simularRespostaApi([]);

        await expect(
            carregarTrechosAreaIV(API_URL)
        ).resolves.toEqual([]);
    });

    it('utiliza a variável de ambiente VITE_API_URL', async () => {
        vi.stubEnv('VITE_API_URL', API_URL);

        const fetchMock = simularRespostaApi([]);

        await carregarTrechosAreaIV();

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/trechos`,
            expect.any(Object)
        );
    });

    it('rejeita uma URL não configurada', async () => {
        const fetchMock = vi.fn();

        vi.stubGlobal('fetch', fetchMock);
        vi.stubEnv('VITE_API_URL', undefined);

        await expect(
            carregarTrechosAreaIV()
        ).rejects.toThrow(/não configurado/i);

        await expect(
            carregarTrechosAreaIV('   ')
        ).rejects.toThrow(/não configurado/i);

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('trata erros HTTP retornados pelo backend', async () => {
        for (const status of [404, 500]) {
            const jsonMock = simularErroHttp(status);

            await expect(
                carregarTrechosAreaIV(API_URL)
            ).rejects.toThrow(String(status));

            expect(jsonMock).not.toHaveBeenCalled();
        }
    });

    it('trata falhas de conexão e JSON inválido', async () => {
        simularFalhaConexao();

        await expect(
            carregarTrechosAreaIV(API_URL)
        ).rejects.toThrow('Failed to fetch');

        simularJsonInvalido();

        await expect(
            carregarTrechosAreaIV(API_URL)
        ).rejects.toThrow('JSON inválido');
    });

    it('interrompe a consulta após o tempo limite', async () => {
        vi.useFakeTimers();

        const fetchMock = simularRequisicaoLenta();

        const requisicao = carregarTrechosAreaIV(API_URL);
        const verificacao = expect(requisicao).rejects.toThrow();

        await vi.advanceTimersByTimeAsync(10000);
        await verificacao;

        expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('remove o temporizador após sucesso ou falha', async () => {
        vi.useFakeTimers();

        simularRespostaApi([REGISTRO_API]);

        await carregarTrechosAreaIV(API_URL);

        expect(vi.getTimerCount()).toBe(0);

        simularFalhaConexao();

        await expect(
            carregarTrechosAreaIV(API_URL)
        ).rejects.toThrow();

        expect(vi.getTimerCount()).toBe(0);
    });
});

describe('Validação do contrato REST', () => {
    it('rejeita respostas que não sejam listas', async () => {
        for (const dados of [null, {}, 'resposta inválida']) {
            simularRespostaApi(dados);

            await expect(
                carregarTrechosAreaIV(API_URL)
            ).rejects.toThrow();
        }
    });

    it('rejeita registros com campos incompatíveis', async () => {
        const alteracoes = [
            { id: '101' },
            { id: 0 },
            { id: 1.5 },
            { bairro: null },
            { bairro: '   ' },
            { logradouro: null },
            { logradouro: '' },
            { quantidadeTotalVagas: '52' },
            { vagasOcupadas: '21' },
            { vagasLivres: undefined },
            { latitude: '-12.9667' },
            { longitude: '-38.4148' },
            { atualizadoEm: 123 },
            { ocupacaoSimulada: 'true' },
        ];

        for (const alteracao of alteracoes) {
            simularRespostaApi([
                {
                    ...REGISTRO_API,
                    ...alteracao,
                },
            ]);

            await expect(
                carregarTrechosAreaIV(API_URL)
            ).rejects.toThrow();
        }
    });

    it('rejeita listas com registros inválidos', async () => {
        const listasInvalidas = [
            [null],
            ['registro inválido'],
            [REGISTRO_API, { ...REGISTRO_API, id: 'invalido' }],
        ];

        for (const lista of listasInvalidas) {
            simularRespostaApi(lista);

            await expect(
                carregarTrechosAreaIV(API_URL)
            ).rejects.toThrow();
        }
    });

    it('aceita campos nulos previstos no contrato', async () => {
        simularRespostaApi([
            {
                ...REGISTRO_API,
                vagasOcupadas: null,
                vagasLivres: null,
                latitude: null,
                longitude: null,
                atualizadoEm: null,
            },
        ]);

        const resultado = await carregarTrechosAreaIV(API_URL);

        expect(resultado).toHaveLength(1);

        expect(resultado[0]).toMatchObject({
            vagasOcupadas: null,
            vagasLivres: null,
            coordenadas: null,
            coordenadasVerificadas: false,
            atualizadoEm: null,
        });
    });
});

describe('Simulação coletiva — POST', () => {
    it('utiliza o endpoint correto de simulação coletiva', async () => {
        const fetchMock = simularRespostaApi([REGISTRO_API]);

        await simularOcupacaoTodos(
            '  http://localhost:8080///  '
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/trechos/simular`,
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Accept: 'application/json',
                }),
                signal: expect.any(AbortSignal),
            })
        );
    });

    it('retorna todos os trechos com a ocupação atualizada', async () => {
        const registros: TrechoResponse[] = [
            {
                ...REGISTRO_API,
                vagasOcupadas: 40,
                vagasLivres: 12,
                atualizadoEm: '2026-11-24T11:00:00',
            },
            {
                ...REGISTRO_API,
                id: 202,
                vagasOcupadas: 0,
                vagasLivres: 52,
            },
            {
                ...REGISTRO_API,
                id: 303,
                vagasOcupadas: 52,
                vagasLivres: 0,
            },
        ];

        simularRespostaApi(registros);

        const resultado = await simularOcupacaoTodos(API_URL);

        expect(resultado).toEqual(
            registros.map(mapearRegistroApiParaTrecho)
        );

        expect(resultado.map((trecho) => trecho.vagasOcupadas))
            .toEqual([40, 0, 52]);

        expect(resultado[0]).toMatchObject({
            id: REGISTRO_API.id,
            bairro: REGISTRO_API.bairro,
            logradouro: REGISTRO_API.logradouro,
            quantidadeTotalVagas: 52,
            ocupacaoSimulada: true,
            atualizadoEm: '2026-11-24T11:00:00',
        });

        expect(processarTrecho(resultado[1]).status).toBe('livre');
        expect(processarTrecho(resultado[2]).status).toBe('ocupado');
    });

    it('utiliza a variável de ambiente e aceita lista vazia', async () => {
        vi.stubEnv('VITE_API_URL', API_URL);

        const fetchMock = simularRespostaApi([]);

        await expect(
            simularOcupacaoTodos()
        ).resolves.toEqual([]);

        expect(fetchMock).toHaveBeenCalledWith(
            `${API_URL}/trechos/simular`,
            expect.any(Object)
        );
    });

    it('rejeita simulação com URL não configurada', async () => {
        const fetchMock = vi.fn();

        vi.stubGlobal('fetch', fetchMock);
        vi.stubEnv('VITE_API_URL', undefined);

        await expect(
            simularOcupacaoTodos()
        ).rejects.toThrow(/não configurado/i);

        await expect(
            simularOcupacaoTodos('   ')
        ).rejects.toThrow(/não configurado/i);

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('trata erros HTTP durante a simulação', async () => {
        for (const status of [400, 500]) {
            const jsonMock = simularErroHttp(status);

            await expect(
                simularOcupacaoTodos(API_URL)
            ).rejects.toThrow(String(status));

            expect(jsonMock).not.toHaveBeenCalled();
        }
    });

    it('trata falhas de conexão e respostas inválidas', async () => {
        simularFalhaConexao();

        await expect(
            simularOcupacaoTodos(API_URL)
        ).rejects.toThrow('Failed to fetch');

        simularJsonInvalido();

        await expect(
            simularOcupacaoTodos(API_URL)
        ).rejects.toThrow('JSON inválido');

        const respostasInvalidas = [
            null,
            {},
            [null],
            [
                REGISTRO_API,
                { ...REGISTRO_API, vagasOcupadas: '30' },
            ],
        ];

        for (const resposta of respostasInvalidas) {
            simularRespostaApi(resposta);

            await expect(
                simularOcupacaoTodos(API_URL)
            ).rejects.toThrow('Resposta de simulação inválida.');
        }
    });

    it('interrompe a simulação após o tempo limite', async () => {
        vi.useFakeTimers();

        const fetchMock = simularRequisicaoLenta();

        const requisicao = simularOcupacaoTodos(API_URL);

        const verificacao = expect(requisicao).rejects.toThrow(
            'Tempo limite excedido ao simular ocupação.'
        );

        await vi.advanceTimersByTimeAsync(10000);
        await verificacao;

        expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('remove o temporizador após sucesso ou falha', async () => {
        vi.useFakeTimers();

        simularRespostaApi([REGISTRO_API]);

        await simularOcupacaoTodos(API_URL);

        expect(vi.getTimerCount()).toBe(0);

        simularFalhaConexao();

        await expect(
            simularOcupacaoTodos(API_URL)
        ).rejects.toThrow();

        expect(vi.getTimerCount()).toBe(0);
    });
});
