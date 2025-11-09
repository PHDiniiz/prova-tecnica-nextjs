import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../table';

describe('Table Component', () => {
  it('deve renderizar uma tabela básica', () => {
    render(
      <Table>
        <TableCaption>Teste de Tabela</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>João</TableCell>
            <TableCell>joao@test.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Teste de Tabela')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('joao@test.com')).toBeInTheDocument();
    expect(screen.getByText('Total: 1')).toBeInTheDocument();
  });

  it('deve aplicar variantes corretas', () => {
    const { rerender } = render(
      <Table variant="striped">
        <TableBody>
          <TableRow>
            <TableCell>Teste</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByText('Teste').closest('table');
    expect(table).toHaveClass('divide-y');

    rerender(
      <Table variant="bordered">
        <TableBody>
          <TableRow>
            <TableCell>Teste</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const borderedTable = screen.getByText('Teste').closest('table');
    expect(borderedTable).toHaveClass('border');
  });

  it('deve aplicar hover em TableRow quando variant é hover', () => {
    render(
      <Table>
        <TableBody>
          <TableRow variant="hover">
            <TableCell>Teste</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByText('Teste').closest('tr');
    expect(row).toHaveClass('hover:bg-gray-50');
  });
});

