'use client';

import { useState } from 'react';

import {
  CheckoutForm,
  type CheckoutFormData,
} from '@/components/checkout/checkout-form';

import {
  CheckoutPayment,
  type PaymentMethod,
} from '@/components/checkout/checkout-payment';

import { CheckoutSummary, type CheckoutStep } from '@/components/checkout/checkout-summary';
import { CheckoutReview } from '@/components/checkout/checkout-review';

import {
  createOrder,
} from '@/services/order-service';

import { createPayment } from '@/services/payment-service';

const INITIAL_FORM_DATA: CheckoutFormData = {
  city: '',
  complement: '',
  email: '',
  name: '',
  neighborhood: '',
  number: '',
  phone: '',
  state: '',
  street: '',
  zipCode: '',
};

export function CheckoutContent() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM_DATA);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Atualiza somente o campo alterado e preserva os demais dados.
  function handleFormChange(
    field: keyof CheckoutFormData,
    value: string,
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  // Guarda a forma de pagamento e avança para a revisão.
  function handlePaymentContinue(
    selectedPaymentMethod: PaymentMethod,
  ) {
    setPaymentMethod(selectedPaymentMethod);
    setCurrentStep('review');
  }

  async function handleFinalizeOrder() {
    if (isFinalizing) {
      return;
    }

    setIsFinalizing(true);

    try {
      // Primeiro cria o pedido usando o carrinho persistido no backend.
      const createdOrder = await createOrder({
        address: {
          city: formData.city,
          complement: formData.complement || undefined,
          country: 'BR',
          name: formData.name,
          neighborhood: formData.neighborhood,
          number: formData.number,
          state: formData.state,
          street: formData.street,
          zipCode: formData.zipCode,
        },
      });

      // Com o ID do pedido criado, solicita ao backend a criação
      // do pagamento no Mercado Pago.
      const payment = await createPayment(createdOrder.id);

      // Redireciona o cliente para o checkout do Mercado Pago.
      window.location.href = payment.checkoutUrl;
    } finally {
      setIsFinalizing(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
      {currentStep === 'delivery' && (
        <CheckoutForm
          formData={formData}
          onChange={handleFormChange}
          onContinue={() => setCurrentStep('payment')}
        />
      )}

      {currentStep === 'payment' && (
        <CheckoutPayment
          onBack={() => setCurrentStep('delivery')}
          onContinue={handlePaymentContinue}
        />
      )}

      {currentStep === 'review' && paymentMethod && (
        <CheckoutReview
          formData={formData}
          onBack={() => setCurrentStep('payment')}
          paymentMethod={paymentMethod}
        />
      )}

      <CheckoutSummary
        currentStep={currentStep}
        isFinalizing={isFinalizing}
        onFinalize={handleFinalizeOrder}
      />
    </div>
  );
}
