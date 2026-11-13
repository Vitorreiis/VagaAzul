
package br.com.vagaazul.repository;

import br.com.vagaazul.entity.Bairro;
import br.com.vagaazul.entity.Trecho;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TrechoRepositoryTest {

    @Autowired
    private BairroRepository bairroRepository;

    @Autowired
    private TrechoRepository trechoRepository;

    @Test
    void deveBuscarTrechosPorBairroId() {
        Bairro bairro = bairroRepository.saveAndFlush(
                new Bairro("Bairro de Teste")
        );

        Trecho trecho = new Trecho(
                bairro,
                "Rua de Teste",
                20,
                null,
                null
        );

        trechoRepository.saveAndFlush(trecho);

        List<Trecho> trechosEncontrados =
                trechoRepository.findByBairroId(bairro.getId());

        assertThat(trechosEncontrados).hasSize(1);
        assertThat(trechosEncontrados.get(0).getLogradouro())
                .isEqualTo("Rua de Teste");
    }
}
