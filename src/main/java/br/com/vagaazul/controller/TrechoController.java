
package br.com.vagaazul.controller;

import br.com.vagaazul.dto.TrechoResponse;
import br.com.vagaazul.service.TrechoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import br.com.vagaazul.dto.AtualizarOcupacaoRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/trechos")
public class TrechoController {

    private final TrechoService trechoService;

    public TrechoController(TrechoService trechoService) {
        this.trechoService = trechoService;
    }

    @GetMapping
    public List<TrechoResponse> listarTodos() {
        return trechoService.listarTodos();
    }

    @GetMapping("/{id}")
    public TrechoResponse buscarPorId(@PathVariable Long id) {
        return trechoService.buscarPorId(id);
    }

    @PostMapping("/{id}/simular")
    public TrechoResponse simularOcupacao(@PathVariable Long id) {
        return trechoService.simularOcupacao(id);
    }


    @PutMapping("/{id}/ocupacao")
    public TrechoResponse atualizarOcupacao(
            @PathVariable Long id,
            @RequestBody AtualizarOcupacaoRequest request
    ) {
        return trechoService.atualizarOcupacao(
                id,
                request.vagasOcupadas()
        );
    }


}
