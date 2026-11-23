
package br.com.vagaazul.controller;

import br.com.vagaazul.dto.TrechoResponse;
import br.com.vagaazul.service.TrechoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TrechoControllerTest {

    private TrechoService trechoService;
    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        trechoService = mock(TrechoService.class);

        mockMvc = MockMvcBuilders
                .standaloneSetup(new TrechoController(trechoService))
                .build();
    }

    private TrechoResponse criarResposta() {
        return new TrechoResponse(
                1L,
                "Pituaçu",
                "Rua A",
                20,
                12,
                8,
                null,
                null,
                null,
                true
        );
    }

    @Test
    void deveListarTrechos() throws Exception {
        when(trechoService.listarTodos())
                .thenReturn(List.of(criarResposta()));

        mockMvc.perform(get("/trechos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].bairro").value("Pituaçu"))
                .andExpect(jsonPath("$[0].vagasLivres").value(8));

        verify(trechoService).listarTodos();
    }

    @Test
    void deveRetornarListaVazia() throws Exception {
        when(trechoService.listarTodos())
                .thenReturn(List.of());

        mockMvc.perform(get("/trechos"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void deveBuscarTrechoPorId() throws Exception {
        when(trechoService.buscarPorId(1L))
                .thenReturn(criarResposta());

        mockMvc.perform(get("/trechos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.quantidadeTotalVagas").value(20))
                .andExpect(jsonPath("$.vagasOcupadas").value(12));

        verify(trechoService).buscarPorId(1L);
    }

    @Test
    void deveRetornar404QuandoTrechoNaoExiste() throws Exception {
        when(trechoService.buscarPorId(999L))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        mockMvc.perform(get("/trechos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveSimularOcupacao() throws Exception {
        when(trechoService.simularOcupacao(1L))
                .thenReturn(criarResposta());

        mockMvc.perform(post("/trechos/1/simular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vagasOcupadas").value(12))
                .andExpect(jsonPath("$.vagasLivres").value(8));

        verify(trechoService).simularOcupacao(1L);
    }

    @Test
    void deveRetornar404AoSimularTrechoInexistente() throws Exception {
        when(trechoService.simularOcupacao(999L))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        mockMvc.perform(post("/trechos/999/simular"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveAtualizarOcupacao() throws Exception {
        when(trechoService.atualizarOcupacao(1L, 12))
                .thenReturn(criarResposta());

        mockMvc.perform(put("/trechos/1/ocupacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagasOcupadas\":12}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vagasOcupadas").value(12))
                .andExpect(jsonPath("$.vagasLivres").value(8));

        verify(trechoService).atualizarOcupacao(1L, 12);
    }

    @Test
    void deveRetornar400ParaOcupacaoInvalida() throws Exception {
        when(trechoService.atualizarOcupacao(1L, 21))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quantidade de vagas inválida"
                ));

        mockMvc.perform(put("/trechos/1/ocupacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagasOcupadas\":21}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar404AoAtualizarTrechoInexistente() throws Exception {
        when(trechoService.atualizarOcupacao(999L, 5))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        mockMvc.perform(put("/trechos/999/ocupacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vagasOcupadas\":5}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornar400ParaJsonInvalido() throws Exception {
        mockMvc.perform(put("/trechos/1/ocupacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{json-invalido}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(trechoService);
    }
}
