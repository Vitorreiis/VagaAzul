-- OBS: Como não tivemos acesso aos dados da Zona Azul de salvador,
-- vamos popular o banco de dados com dados fictícios para demonstrar
-- o funcionamento do app.


INSERT INTO bairro (nome)
VALUES ('Pituaçu');

INSERT INTO trecho (
    id_bairro,
    logradouro,
    quantidade_total_vagas,
    latitude,
    longitude
)
VALUES
    ((SELECT id FROM bairro WHERE nome = 'Pituaçu'),
     'Avenida Octávio Mangabeira - Trecho 1', 20, NULL, NULL),

    ((SELECT id FROM bairro WHERE nome = 'Pituaçu'),
     'Avenida Octávio Mangabeira - Trecho 2', 15, NULL, NULL),

    ((SELECT id FROM bairro WHERE nome = 'Pituaçu'),
     'Rua da Gratidão - Trecho 1', 12, NULL, NULL),

    ((SELECT id FROM bairro WHERE nome = 'Pituaçu'),
     'Rua da Gratidão - Trecho 2', 18, NULL, NULL),

    ((SELECT id FROM bairro WHERE nome = 'Pituaçu'),
     'Avenida Jorge Amado - Trecho 1', 25, NULL, NULL);


INSERT INTO ocupacao_simulada (
    id_trecho,
    vagas_ocupadas,
    atualizado_em
)
SELECT
    t.id,
    CASE t.logradouro
        WHEN 'Avenida Octávio Mangabeira - Trecho 1' THEN 12
        WHEN 'Avenida Octávio Mangabeira - Trecho 2' THEN 8
        WHEN 'Rua da Gratidão - Trecho 1' THEN 5
        WHEN 'Rua da Gratidão - Trecho 2' THEN 10
        WHEN 'Avenida Jorge Amado - Trecho 1' THEN 15
        END,
    CURRENT_TIMESTAMP
FROM trecho t
         JOIN bairro b ON b.id = t.id_bairro
WHERE b.nome = 'Pituaçu'
  AND t.logradouro IN (
                       'Avenida Octávio Mangabeira - Trecho 1',
                       'Avenida Octávio Mangabeira - Trecho 2',
                       'Rua da Gratidão - Trecho 1',
                       'Rua da Gratidão - Trecho 2',
                       'Avenida Jorge Amado - Trecho 1'
    );