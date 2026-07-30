import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnnouncementBar } from '@/components/layout/announcement-bar';

describe('AnnouncementBar', () => {
  it('deve renderizar a mensagem de frete grátis', () => {
    render(<AnnouncementBar />);

    expect(
      screen.getByText('Frete grátis para compras acima de R$ 299'),
    ).toBeInTheDocument();
  });

  it('deve renderizar uma section', () => {
    const { container } = render(<AnnouncementBar />);

    expect(container.querySelector('section')).toBeInTheDocument();
  });
});