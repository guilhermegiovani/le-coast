import { Suspense } from 'react';

import { CheckoutConfirmation } from '@/components/checkout/checkout-confirmation';

function CheckoutConfirmationFallback() {
    return (
        <main className="py-10 md:py-14">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Carregando pedido...
                </h1>
            </div>
        </main>
    );
}

export default function CheckoutConfirmationPage() {
    return (
        <Suspense fallback={<CheckoutConfirmationFallback />}>
            <CheckoutConfirmation />
        </Suspense>
    );
}