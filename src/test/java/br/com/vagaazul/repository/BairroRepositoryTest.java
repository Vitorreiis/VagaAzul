
package br.com.vagaazul.repository;

import br.com.vagaazul.entity.Bairro;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BairroRepositoryTest {

    @Autowired
    private BairroRepository bairroRepository;

    @Test
    void deveSalvarEBuscarBairroPorId() {
        Bairro bairro = new Bairro("Bairro de Teste");

        Bairro bairroSalvo = bairroRepository.saveAndFlush(bairro);

        assertThat(bairroSalvo.getId()).isNotNull();

        Bairro bairroEncontrado = bairroRepository
                .findById(bairroSalvo.getId())
                .orElseThrow();

        assertThat(bairroEncontrado.getNome())
                .isEqualTo("Bairro de Teste");
    }
}
