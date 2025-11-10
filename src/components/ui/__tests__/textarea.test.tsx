/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { Textarea } from '../textarea';
import userEvent from '@testing-library/user-event';

describe('Textarea', () => {
  it('deve renderizar textarea básico', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('deve renderizar com label', () => {
    render(<Textarea label="Descrição" />);
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
  });

  it('deve renderizar com placeholder', () => {
    render(<Textarea placeholder="Digite aqui..." />);
    expect(screen.getByPlaceholderText('Digite aqui...')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de erro', () => {
    render(<Textarea error="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('deve renderizar texto de ajuda', () => {
    render(<Textarea helperText="Máximo 500 caracteres" />);
    expect(screen.getByText('Máximo 500 caracteres')).toBeInTheDocument();
  });

  it('deve priorizar erro sobre helperText', () => {
    render(
      <Textarea error="Campo obrigatório" helperText="Máximo 500 caracteres" />
    );
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.queryByText('Máximo 500 caracteres')).not.toBeInTheDocument();
  });

  it('deve permitir digitação', async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Texto de teste');
    expect(textarea).toHaveValue('Texto de teste');
  });

  it('deve estar desabilitado quando disabled', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('deve aplicar className customizada', () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });
});
