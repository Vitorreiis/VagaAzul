
package br.com.vagaazul.repository;

import br.com.vagaazul.entity.Bairro;
import br.com.vagaazul.entity.Trecho;
import br.com.vagaazul.entity.OcupacaoSimulada;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class OcupacaoSimuladaRepositoryTest {

    @Autowired
    private BairroRepository bairroRepository;

    @Autowired
    private TrechoRepository trechoRepository;

    @Autowired
    private OcupacaoSimuladaRepository ocupacaoRepository;

    @Test
    void deveBuscarOcupacaoPorTrechoId() {
        Bairro bairro = bairroRepository.saveAndFlush(
                new Bairro("Bairro de Teste")
        );

        Trecho trecho = trechoRepository.saveAndFlush(
                new Trecho(
                        bairro,
                        "Rua de Teste",
                        20,
                        null,
                        null
                )
        );

        OcupacaoSimulada ocupacao = new OcupacaoSimulada(
                trecho,
                8,
                LocalDateTime.of(2026, 1, 1, 12, 0)
        );

        ocupacaoRepository.saveAndFlush(ocupacao);

        Optional<OcupacaoSimulada> resultado =
                ocupacaoRepository.findByTrechoId(trecho.getId());

        assertThat(resultado).isPresent();
        assertThat(resultado.orElseThrow().getVagasOcupadas())
                .isEqualTo(8);
    }
}
