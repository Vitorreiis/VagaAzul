import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrechoListView } from '../list/TrechoListView';
import { TrechoDetail } from '../details/TrechoDetail';
import { TRECHOS_AREA_IV } from '../../data/trechosAreaIV';
import { processarTrechos } from '../../domain/services/trechosService';
import { useState } from 'react';
import { FiltroDisponibilidade, TrechoCalculado } from '../../domain/models/Trecho';

function ListHarness({ onSelect }: { onSelect: (t: TrechoCalculado) => void }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroDisponibilidade>('todos');
  const [bairro, setBairro] = useState('todos');
  const trechos = processarTrechos(TRECHOS_AREA_IV);

  return (
    <TrechoListView
      trechos={trechos}
      busca={busca}
      onChangeBusca={setBusca}
      filtro={filtro}
      onChangeFiltro={setFiltro}
      bairroFiltro={bairro}
      onChangeBairroFiltro={setBairro}
      onSelectTrecho={onSelect}
    />
  );
}

describe('Interface VagaAzul — Lista e Detalhes (CT17, CT18, CA05)', () => {
  it('exibe aviso visível de ocupação simulada e nunca utiliza o termo "tempo real"', () => {
    render(<ListHarness onSelect={vi.fn()} />);

    const badge = screen.getByTestId('simulation-badge');
    expect(badge).toHaveTextContent(/simulada/i);
    expect(document.body.textContent?.toLowerCase()).not.toContain('tempo real');
  });

  it('exibe todos os trechos da Área IV na lista, incluindo os sem coordenadas com selo "Sem mapa"', () => {
    render(<ListHarness onSelect={vi.fn()} />);

    const trechos = processarTrechos(TRECHOS_AREA_IV);
    expect(screen.getByTestId('trecho-list').children).toHaveLength(trechos.length);
    expect(screen.getByTestId('badge-sem-mapa-A4-BOC-003')).toHaveTextContent('Sem mapa');
  });

  it('filtra logradouros pela busca textual e exibe estado vazio amigável quando não há correspondência', () => {
    render(<ListHarness onSelect={vi.fn()} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Jorge Amado' } });
    expect(screen.getByTestId('trecho-list').children).toHaveLength(2);

    fireEvent.change(input, { target: { value: 'Rua Inexistente XYZ' } });
    expect(screen.getByTestId('empty-state-filtro')).toBeInTheDocument();
  });

  it('exibe detalhes corretos do trecho selecionado com cálculo exato e aviso de simulação', () => {
    const trechos = processarTrechos(TRECHOS_AREA_IV);
    const trecho = trechos[0]; // A4-PIT-001: 52 total, 21 ocupadas -> 31 livres

    render(
      <TrechoDetail
        trecho={trecho}
        onBack={vi.fn()}
        onViewOnMap={vi.fn()}
        onResimular={vi.fn()}
      />
    );

    expect(screen.getByTestId('trecho-detail')).toHaveTextContent(trecho.logradouro);
    expect(screen.getByTestId('stat-total')).toHaveTextContent('52');
    expect(screen.getByTestId('stat-livres')).toHaveTextContent('31');
    expect(screen.getByTestId('stat-ocupadas')).toHaveTextContent('21');
    expect(screen.getByTestId('simulation-badge')).toHaveTextContent(/simulada/i);
    expect(screen.getByTestId('btn-ver-no-mapa')).toBeEnabled();
  });

  it('desabilita "Ver no mapa" em trecho sem coordenadas confirmadas e trata trecho inexistente (CT12)', () => {
    const trechos = processarTrechos(TRECHOS_AREA_IV);
    const semMapa = trechos.find((t) => !t.exibirNoMapa)!;

    const { rerender } = render(
      <TrechoDetail
        trecho={semMapa}
        onBack={vi.fn()}
        onViewOnMap={vi.fn()}
        onResimular={vi.fn()}
      />
    );

    expect(screen.getByTestId('btn-ver-no-mapa-disabled')).toBeDisabled();

    rerender(
      <TrechoDetail
        trecho={undefined}
        onBack={vi.fn()}
        onViewOnMap={vi.fn()}
        onResimular={vi.fn()}
      />
    );
    expect(screen.getByTestId('trecho-detail-not-found')).toHaveTextContent(
      /Trecho não disponível/i
    );
  });
});

