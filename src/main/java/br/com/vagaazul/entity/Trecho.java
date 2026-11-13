
package br.com.vagaazul.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "trecho")
public class Trecho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_bairro", nullable = false)
    private Bairro bairro;

    @Column(name = "logradouro", nullable = false, length = 200)
    private String logradouro;

    @Column(name = "quantidade_total_vagas", nullable = false)
    private Integer quantidadeTotalVagas;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    protected Trecho() {}

    public Trecho(Bairro bairro, String logradouro, Integer quantidadeTotalVagas,
                  BigDecimal latitude, BigDecimal longitude) {
        this.bairro = bairro;
        this.logradouro = logradouro;
        this.quantidadeTotalVagas = quantidadeTotalVagas;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() {
        return id;
    }

    public Bairro getBairro() {
        return bairro;
    }

    public void setBairro(Bairro bairro) {
        this.bairro = bairro;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public Integer getQuantidadeTotalVagas() {
        return quantidadeTotalVagas;
    }

    public void setQuantidadeTotalVagas(Integer quantidadeTotalVagas) {
        this.quantidadeTotalVagas = quantidadeTotalVagas;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
}
