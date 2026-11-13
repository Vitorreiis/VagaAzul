
package br.com.vagaazul.repository;

import br.com.vagaazul.entity.Trecho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrechoRepository extends JpaRepository<Trecho, Long> {

    List<Trecho> findByBairroId(Long bairroId);
}
