/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { PerformanceChart } from '../PerformanceChart';
import { MemberPerformance } from '@/types/dashboard';

const mockDados: MemberPerformance[] = [
  {
    membroId: 'membro-1',
    membroNome: 'João Silva',
    membroEmail: 'joao@example.com',
    membroEmpresa: 'Empresa A',
    totalIndicacoesFeitas: 5,
    totalIndicacoesRecebidas: 10,
    indicacoesFechadas: 5,
    totalObrigadosRecebidos: 3,
    taxaFechamento: 50,
    valorTotalGerado: 50000,
    periodo: 'mensal' as const,
  },
  {
    membroId: 'membro-2',
    membroNome: 'Maria Santos',
    membroEmail: 'maria@example.com',
    membroEmpresa: 'Empresa B',
    totalIndicacoesFeitas: 3,
    totalIndicacoesRecebidas: 8,
    indicacoesFechadas: 4,
    totalObrigadosRecebidos: 2,
    taxaFechamento: 50,
    valorTotalGerado: 40000,
    periodo: 'mensal' as const,
  },
];

describe('PerformanceChart', () => {
  it('deve renderizar o gráfico com dados', () => {
    render(<PerformanceChart dados={mockDados} />);

    expect(screen.getByText('Performance dos Membros')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('deve ordenar membros por total de indicações recebidas', () => {
    render(<PerformanceChart dados={mockDados} />);

    const membros = screen.getAllByText(/indicações/);
    expect(membros[0]).toHaveTextContent('10 indicações');
    expect(membros[1]).toHaveTextContent('8 indicações');
  });

  it('deve limitar o número de itens exibidos', () => {
    const muitosDados = Array.from({ length: 20 }, (_, i) => ({
      ...mockDados[0],
      membroId: `membro-${i}`,
      membroNome: `Membro ${i}`,
      totalIndicacoesRecebidas: 20 - i,
    }));

    render(<PerformanceChart dados={muitosDados} maxItems={5} />);

    const membros = screen.getAllByText(/indicações/);
    expect(membros.length).toBe(5);
  });

  it('deve exibir mensagem quando não há dados', () => {
    render(<PerformanceChart dados={[]} />);

    expect(
      screen.getByText('Nenhum dado disponível para o período selecionado')
    ).toBeInTheDocument();
  });

  it('deve usar título customizado quando fornecido', () => {
    render(<PerformanceChart dados={mockDados} titulo="Top 10 Membros" />);

    expect(screen.getByText('Top 10 Membros')).toBeInTheDocument();
  });

  it('deve exibir taxa de fechamento para cada membro', () => {
    render(<PerformanceChart dados={mockDados} />);

    const taxas = screen.getAllByText(/Taxa: 50%/);
    expect(taxas.length).toBeGreaterThan(0);
  });
});

