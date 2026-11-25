
package br.com.vagaazul.service;

import br.com.vagaazul.dto.TrechoResponse;
import br.com.vagaazul.entity.Bairro;
import br.com.vagaazul.entity.OcupacaoSimulada;
import br.com.vagaazul.entity.Trecho;
import br.com.vagaazul.repository.OcupacaoSimuladaRepository;
import br.com.vagaazul.repository.TrechoRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TrechoServiceTest {

    @Mock
    private TrechoRepository trechoRepository;

    @Mock
    private OcupacaoSimuladaRepository ocupacaoRepository;

    private TrechoService trechoService;
    private AutoCloseable mocks;

    @BeforeEach
    void configurar() {
        mocks = MockitoAnnotations.openMocks(this);
        trechoService = new TrechoService(
                trechoRepository,
                ocupacaoRepository
        );
    }

    @AfterEach
    void encerrar() throws Exception {
        mocks.close();
    }

    private Trecho criarTrecho(int totalVagas) {
        Trecho trecho = mock(Trecho.class);

        when(trecho.getId()).thenReturn(1L);
        when(trecho.getQuantidadeTotalVagas())
                .thenReturn(totalVagas);

        return trecho;
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoExistiremTrechos() {
        when(trechoRepository.findAll())
                .thenReturn(List.of());

        List<TrechoResponse> resultado =
                trechoService.listarTodos();

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveListarTrechosCadastrados() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);
        when(trecho.getLogradouro()).thenReturn("Rua A");

        when(trechoRepository.findAll())
                .thenReturn(List.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.empty());

        List<TrechoResponse> resultado =
                trechoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals(1L, resultado.get(0).id());
        assertEquals("Pituaçu", resultado.get(0).bairro());
        assertEquals(20, resultado.get(0).quantidadeTotalVagas());
    }

    @Test
    void deveBuscarTrechoExistente() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);
        when(trecho.getLogradouro()).thenReturn("Rua A");

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.empty());

        TrechoResponse resultado =
                trechoService.buscarPorId(1L);

        assertEquals(1L, resultado.id());
        assertEquals("Rua A", resultado.logradouro());
    }

    @Test
    void deveRetornar404QuandoTrechoNaoExiste() {
        when(trechoRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.buscarPorId(999L)
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                excecao.getStatusCode()
        );
    }

    @Test
    void deveRejeitarOcupacaoMaiorQueCapacidade() {
        Trecho trecho = criarTrecho(20);

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.atualizarOcupacao(1L, 21)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                excecao.getStatusCode()
        );

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveRejeitarOcupacaoNegativa() {
        Trecho trecho = criarTrecho(20);

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.atualizarOcupacao(1L, -1)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                excecao.getStatusCode()
        );

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveRejeitarOcupacaoNula() {
        Trecho trecho = criarTrecho(20);

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.atualizarOcupacao(1L, null)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                excecao.getStatusCode()
        );

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveRetornar404AoAtualizarTrechoInexistente() {
        when(trechoRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.atualizarOcupacao(999L, 5)
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                excecao.getStatusCode()
        );

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveAtualizarOcupacaoValida() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);

        OcupacaoSimulada ocupacao = new OcupacaoSimulada(
                trecho,
                5,
                LocalDateTime.now()
        );

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.of(ocupacao));

        TrechoResponse resultado =
                trechoService.atualizarOcupacao(1L, 12);

        assertEquals(12, ocupacao.getVagasOcupadas());
        assertEquals(12, resultado.vagasOcupadas());
        assertEquals(8, resultado.vagasLivres());

        verify(ocupacaoRepository)
                .saveAndFlush(ocupacao);
    }

    @Test
    void deveAceitarOcupacaoZero() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);

        OcupacaoSimulada ocupacao = new OcupacaoSimulada(
                trecho,
                10,
                LocalDateTime.now()
        );

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.of(ocupacao));

        TrechoResponse resultado =
                trechoService.atualizarOcupacao(1L, 0);

        assertEquals(0, resultado.vagasOcupadas());
        assertEquals(20, resultado.vagasLivres());

        verify(ocupacaoRepository)
                .saveAndFlush(ocupacao);
    }

    @Test
    void deveAceitarOcupacaoMaxima() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);

        OcupacaoSimulada ocupacao = new OcupacaoSimulada(
                trecho,
                10,
                LocalDateTime.now()
        );

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.of(ocupacao));

        TrechoResponse resultado =
                trechoService.atualizarOcupacao(1L, 20);

        assertEquals(20, resultado.vagasOcupadas());
        assertEquals(0, resultado.vagasLivres());

        verify(ocupacaoRepository)
                .saveAndFlush(ocupacao);
    }

    @Test
    void deveSimularOcupacaoDentroDaCapacidade() {
        Trecho trecho = criarTrecho(20);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho.getBairro()).thenReturn(bairro);

        OcupacaoSimulada ocupacao = new OcupacaoSimulada(
                trecho,
                5,
                LocalDateTime.now()
        );

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.of(ocupacao));

        TrechoResponse resultado =
                trechoService.simularOcupacao(1L);

        assertNotNull(resultado.vagasOcupadas());

        assertTrue(resultado.vagasOcupadas() >= 0);
        assertTrue(resultado.vagasOcupadas() <= 20);

        assertEquals(
                20,
                resultado.vagasOcupadas() + resultado.vagasLivres()
        );

        verify(ocupacaoRepository)
                .saveAndFlush(ocupacao);
    }

    @Test
    void deveRetornar404AoSimularTrechoInexistente() {
        when(trechoRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> trechoService.simularOcupacao(999L)
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                excecao.getStatusCode()
        );

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveRetornarListaVaziaAoSimularSemTrechos() {
        when(trechoRepository.findAll())
                .thenReturn(List.of());

        List<TrechoResponse> resultado =
                trechoService.simularTodos();

        assertTrue(resultado.isEmpty());

        verify(ocupacaoRepository, never())
                .saveAndFlush(any());
    }

    @Test
    void deveSimularOcupacaoDeTodosOsTrechos() {
        Trecho trecho1 = criarTrecho(20);
        Trecho trecho2 = criarTrecho(15);

        when(trecho2.getId()).thenReturn(2L);

        Bairro bairro = mock(Bairro.class);
        when(bairro.getNome()).thenReturn("Pituaçu");

        when(trecho1.getBairro()).thenReturn(bairro);
        when(trecho2.getBairro()).thenReturn(bairro);

        OcupacaoSimulada ocupacao1 = new OcupacaoSimulada(
                trecho1, 5, LocalDateTime.now()
        );

        OcupacaoSimulada ocupacao2 = new OcupacaoSimulada(
                trecho2, 3, LocalDateTime.now()
        );

        when(trechoRepository.findAll())
                .thenReturn(List.of(trecho1, trecho2));

        when(trechoRepository.findById(1L))
                .thenReturn(Optional.of(trecho1));

        when(trechoRepository.findById(2L))
                .thenReturn(Optional.of(trecho2));

        when(ocupacaoRepository.findByTrechoId(1L))
                .thenReturn(Optional.of(ocupacao1));

        when(ocupacaoRepository.findByTrechoId(2L))
                .thenReturn(Optional.of(ocupacao2));

        List<TrechoResponse> resultado =
                trechoService.simularTodos();

        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0).id());
        assertEquals(2L, resultado.get(1).id());

        for (TrechoResponse trecho : resultado) {
            assertTrue(trecho.vagasOcupadas() >= 0);

            assertTrue(trecho.vagasOcupadas()
                    <= trecho.quantidadeTotalVagas());

            assertEquals(
                    trecho.quantidadeTotalVagas().intValue(),
                    trecho.vagasOcupadas() + trecho.vagasLivres()
            );

            assertTrue(trecho.ocupacaoSimulada());
        }

        verify(ocupacaoRepository).saveAndFlush(ocupacao1);
        verify(ocupacaoRepository).saveAndFlush(ocupacao2);
    }
}
