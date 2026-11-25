-- Coordenadas de referencia coletadas no Google Maps.
-- Dados demonstrativos, sem vinculo com vagas oficiais da Zona Azul.

UPDATE trecho
SET latitude = -12.9759053,
    longitude = -38.4206882
WHERE logradouro = 'Avenida Octávio Mangabeira - Trecho 1'
  AND id_bairro = (SELECT id FROM bairro WHERE nome = 'Pituaçu');

UPDATE trecho
SET latitude = -12.9713779,
    longitude = -38.4129746
WHERE logradouro = 'Avenida Octávio Mangabeira - Trecho 2'
  AND id_bairro = (SELECT id FROM bairro WHERE nome = 'Pituaçu');

UPDATE trecho
SET logradouro = 'Rua Barreto Pedroso - Trecho 1',
    latitude = -12.9690573,
    longitude = -38.4118925
WHERE logradouro = 'Rua da Gratidão - Trecho 1'
  AND id_bairro = (SELECT id FROM bairro WHERE nome = 'Pituaçu');

UPDATE trecho
SET logradouro = 'Rua Barreto Pedroso - Trecho 2',
    latitude = -12.9699075,
    longitude = -38.4134291
WHERE logradouro = 'Rua da Gratidão - Trecho 2'
  AND id_bairro = (SELECT id FROM bairro WHERE nome = 'Pituaçu');

UPDATE trecho
SET latitude = -12.9689231,
    longitude = -38.4294579
WHERE logradouro = 'Avenida Jorge Amado - Trecho 1'
  AND id_bairro = (SELECT id FROM bairro WHERE nome = 'Pituaçu');