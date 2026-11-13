
package br.com.vagaazul.repository;

import br.com.vagaazul.entity.OcupacaoSimulada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OcupacaoSimuladaRepository
        extends JpaRepository<OcupacaoSimulada, Long> {

    Optional<OcupacaoSimulada> findByTrechoId(Long trechoId);
}
