
package br.com.vagaazul.service;

import br.com.vagaazul.dto.TrechoResponse;
import br.com.vagaazul.entity.OcupacaoSimulada;
import br.com.vagaazul.entity.Trecho;
import br.com.vagaazul.repository.OcupacaoSimuladaRepository;
import br.com.vagaazul.repository.TrechoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TrechoService {

    private final TrechoRepository trechoRepository;
    private final OcupacaoSimuladaRepository ocupacaoRepository;

    public TrechoService(
            TrechoRepository trechoRepository,
            OcupacaoSimuladaRepository ocupacaoRepository
    ) {
        this.trechoRepository = trechoRepository;
        this.ocupacaoRepository = ocupacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<TrechoResponse> listarTodos() {
        return trechoRepository.findAll()
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public TrechoResponse buscarPorId(Long id) {
        Trecho trecho = trechoRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        return converterParaResponse(trecho);
    }


    @Transactional
    public TrechoResponse simularOcupacao(Long id) {
        Trecho trecho = trechoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        int totalVagas = trecho.getQuantidadeTotalVagas();

        // Gera um número entre 0 e totalVagas
        int novasVagasOcupadas = ThreadLocalRandom.current()
                .nextInt(totalVagas);

        OcupacaoSimulada ocupacao = ocupacaoRepository
                .findByTrechoId(id)
                .orElse(null);

        if (ocupacao == null) {
            ocupacao = new OcupacaoSimulada(
                    trecho,
                    novasVagasOcupadas,
                    LocalDateTime.now()
            );
        } else {
            ocupacao.setVagasOcupadas(novasVagasOcupadas);
            ocupacao.setAtualizadoEm(LocalDateTime.now());
        }

        ocupacaoRepository.saveAndFlush(ocupacao);

        return converterParaResponse(trecho);
    }


    @Transactional
    public TrechoResponse atualizarOcupacao(Long id, Integer vagasOcupadas) {
        Trecho trecho = trechoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trecho não encontrado"
                ));

        int totalVagas = trecho.getQuantidadeTotalVagas();

        if (vagasOcupadas == null
                || vagasOcupadas < 0
                || vagasOcupadas > totalVagas) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A quantidade de vagas ocupadas deve estar entre 0 e "
                            + totalVagas
            );
        }

        OcupacaoSimulada ocupacao = ocupacaoRepository
                .findByTrechoId(id)
                .orElse(null);

        if (ocupacao == null) {
            ocupacao = new OcupacaoSimulada(
                    trecho,
                    vagasOcupadas,
                    LocalDateTime.now()
            );
        } else {
            ocupacao.setVagasOcupadas(vagasOcupadas);
            ocupacao.setAtualizadoEm(LocalDateTime.now());
        }

        ocupacaoRepository.saveAndFlush(ocupacao);

        return converterParaResponse(trecho);
    }


    private TrechoResponse converterParaResponse(Trecho trecho) {
        OcupacaoSimulada ocupacao = ocupacaoRepository
                .findByTrechoId(trecho.getId())
                .orElse(null);

        Integer vagasOcupadas = ocupacao != null
                ? ocupacao.getVagasOcupadas()
                : null;

        Integer vagasLivres = vagasOcupadas != null
                ? trecho.getQuantidadeTotalVagas() - vagasOcupadas
                : null;

        return new TrechoResponse(
                trecho.getId(),
                trecho.getBairro().getNome(),
                trecho.getLogradouro(),
                trecho.getQuantidadeTotalVagas(),
                vagasOcupadas,
                vagasLivres,
                trecho.getLatitude(),
                trecho.getLongitude(),
                ocupacao != null ? ocupacao.getAtualizadoEm() : null,
                true
        );
    }
}
