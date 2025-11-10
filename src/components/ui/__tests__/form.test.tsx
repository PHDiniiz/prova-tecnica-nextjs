/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormErrorMessage,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';

const testSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

type TestFormData = z.infer<typeof testSchema>;

describe('Form Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(
      <Form schema={testSchema} onSubmit={mockOnSubmit}>
        {(methods) => (
          <>
            <FormItem>
              <FormLabel htmlFor="name-input">Nome</FormLabel>
              <FormControl>
                <Input id="name-input" {...methods.register('name')} />
              </FormControl>
            </FormItem>
            <Button type="submit">Enviar</Button>
          </>
        )}
      </Form>
    );

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('deve validar campos ao submeter', async () => {
    const user = userEvent.setup();
    render(
      <Form schema={testSchema} onSubmit={mockOnSubmit}>
        {(methods) => (
          <>
            <FormItem>
              <FormLabel htmlFor="name-input">Nome</FormLabel>
              <FormControl>
                <Input id="name-input" {...methods.register('name')} />
              </FormControl>
              {methods.formState.errors.name && (
                <FormErrorMessage>
                  {methods.formState.errors.name.message}
                </FormErrorMessage>
              )}
            </FormItem>
            <FormItem>
              <FormLabel htmlFor="email-input">Email</FormLabel>
              <FormControl>
                <Input id="email-input" type="email" {...methods.register('email')} />
              </FormControl>
              {methods.formState.errors.email && (
                <FormErrorMessage>
                  {methods.formState.errors.email.message}
                </FormErrorMessage>
              )}
            </FormItem>
            <Button type="submit">Enviar</Button>
          </>
        )}
      </Form>
    );

    const submitButton = screen.getByText('Enviar');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter o formulário com dados válidos', async () => {
    const user = userEvent.setup();
    render(
      <Form schema={testSchema} onSubmit={mockOnSubmit}>
        {(methods) => (
          <>
            <FormItem>
              <FormLabel htmlFor="name-input">Nome</FormLabel>
              <FormControl>
                <Input id="name-input" {...methods.register('name')} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel htmlFor="email-input">Email</FormLabel>
              <FormControl>
                <Input id="email-input" type="email" {...methods.register('email')} />
              </FormControl>
            </FormItem>
            <Button type="submit">Enviar</Button>
          </>
        )}
      </Form>
    );

    await user.type(screen.getByLabelText('Nome'), 'João Silva');
    await user.type(screen.getByLabelText('Email'), 'joao@test.com');
    await user.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@test.com',
      });
    });
  });

  it('deve renderizar FormDescription', () => {
    render(
      <Form schema={testSchema} onSubmit={mockOnSubmit}>
        {() => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormDescription>Digite seu nome completo</FormDescription>
            <FormControl>
              <Input />
            </FormControl>
          </FormItem>
        )}
      </Form>
    );

    expect(screen.getByText('Digite seu nome completo')).toBeInTheDocument();
  });

  it('deve renderizar FormLabel com required', () => {
    render(
      <Form schema={testSchema} onSubmit={mockOnSubmit}>
        {() => (
          <FormItem>
            <FormLabel required>Nome</FormLabel>
            <FormControl>
              <Input />
            </FormControl>
          </FormItem>
        )}
      </Form>
    );

    const label = screen.getByText('Nome');
    expect(label).toBeInTheDocument();
    // Verifica se tem o asterisco (after:content-['*'])
    expect(label).toHaveClass("after:content-['*']");
  });
});

