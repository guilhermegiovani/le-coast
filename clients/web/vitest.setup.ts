import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { vi } from 'vitest';

vi.mock('next/link', async () => {
  const React = await import('react');

  return {
    default: ({
      children,
      href,
      onClick,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    }) =>
      React.createElement(
        'a',
        {
          ...props,
          href,

          // Impede que o JSDOM tente navegar durante os testes.
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            onClick?.(event);
          },
        },
        children,
      ),
  };
});

afterEach(() => {
  cleanup();
});