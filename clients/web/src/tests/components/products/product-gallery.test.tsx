import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductGallery } from '@/components/products/product-gallery';

// Agrupa os testes das responsabilidades do componente ProductGallery.
describe('ProductGallery', () => {
  // Garante que a galeria possui um nome acessível relacionado ao produto.
  it('deve renderizar a galeria com o nome acessível correto', () => {
    render(<ProductGallery productName="Top Essential" />);

    expect(
      screen.getByRole('region', {
        name: 'Galeria de imagens de Top Essential',
      }),
    ).toBeInTheDocument();
  });

  // Garante que a imagem principal do produto é renderizada.
  it('deve renderizar a imagem principal', () => {
    render(<ProductGallery productName="Top Essential" />);

    expect(
      screen.getByRole('img', {
        name: 'Imagem principal de Top Essential',
      }),
    ).toBeInTheDocument();
  });

  // Garante que as três miniaturas temporárias são renderizadas.
  it('deve renderizar as imagens da galeria', () => {
    render(<ProductGallery productName="Top Essential" />);

    expect(
      screen.getByRole('img', {
        name: 'Imagem 1 de Top Essential',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('img', {
        name: 'Imagem 2 de Top Essential',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('img', {
        name: 'Imagem 3 de Top Essential',
      }),
    ).toBeInTheDocument();
  });
});