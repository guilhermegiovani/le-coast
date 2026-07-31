'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { Container } from '@/components/layout/container';
import { HeaderActions } from '@/components/layout/header-actions';
import { Logo } from '@/components/layout/logo';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  // Controla se o menu mobile está aberto ou fechado.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Alterna o estado atual do menu mobile.
  function toggleMenu() {
    setIsMenuOpen((currentState) => !currentState);
  }

  // Fecha o menu após o usuário selecionar um destino.
  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="w-full border-b border-border py-3 md:py-4">
      <Container>
        <div className="flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex md:flex-1 md:justify-center">
            <Navigation />
          </div>

          <div className="hidden md:block">
            <HeaderActions />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <Menu aria-hidden="true" className="size-6" />
            )}
          </Button>
        </div>

        {/* Exibe o menu completo apenas em telas mobile. */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="mt-3 border-t border-border pt-4 md:hidden"
          >
            <div className="flex flex-col gap-6">
              <Navigation
                ariaLabel="Navegação mobile"
                direction="vertical"
                onNavigate={closeMenu}
              />

              <div className="border-t border-border pt-6">
                <HeaderActions
                  ariaLabel="Ações do menu mobile"
                  direction="vertical"
                  onNavigate={closeMenu}
                  showLabels
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}