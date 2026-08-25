import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {
    api,
    setApiAccessToken,
} from '@/lib/api';

describe('setApiAccessToken', () => {
    beforeEach(() => {
        // Garante que cada teste comece sem
        // um Authorization herdado do anterior.
        delete api.defaults.headers.common.Authorization;
    });

    // Garante que o access token seja adicionado
    // às próximas requisições realizadas pela API.
    it('deve configurar o header Authorization', () => {
        setApiAccessToken('access-token');

        expect(
            api.defaults.headers.common.Authorization,
        ).toBe('Bearer access-token');
    });

    // Garante que o header seja removido quando
    // não existir mais uma sessão autenticada.
    it('deve remover o header Authorization', () => {
        setApiAccessToken('access-token');

        setApiAccessToken(null);

        expect(
            api.defaults.headers.common.Authorization,
        ).toBeUndefined();
    });
});