import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Newsletter } from '@/components/home/newsletter';

// Agrupa todos os testes relacionados ao componente Newsletter.
describe('Newsletter', () => {
  // Verifica se o título da seção é renderizado como um heading de nível 2.
  it('deve renderizar o heading da seção', () => {
    render(<Newsletter />);

    const heading = screen.getByRole('heading', {
      name: 'Receba novidades da Le Coast',
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });

  // Verifica se o texto descritivo da newsletter aparece na tela.
  it('deve renderizar o texto descritivo', () => {
    render(<Newsletter />);

    const description = screen.getByText(
      'Inscreva-se para receber novidades, lançamentos e promoções direto no seu e-mail.',
    );

    expect(description).toBeInTheDocument();
  });

  // Verifica se o campo de e-mail é renderizado e associado ao label correto.
  it('deve renderizar o campo de e-mail', () => {
    render(<Newsletter />);

    const input = screen.getByRole('textbox', {
      name: 'Seu e-mail',
    });

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'voce@exemplo.com');
    expect(input).toBeRequired();
  });

  // Verifica se o botão de envio do formulário é renderizado.
  it('deve renderizar o botão Quero receber', () => {
    render(<Newsletter />);

    const button = screen.getByRole('button', {
      name: 'Quero receber',
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });
});