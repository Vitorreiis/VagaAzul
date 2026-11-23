package br.com.vagaazul.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TrechoResponse(
        Long id,
        String bairro,
        String logradouro,
        Integer quantidadeTotalVagas,
        Integer vagasOcupadas,
        Integer vagasLivres,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalDateTime atualizadoEm,
        boolean ocupacaoSimulada
) {
}