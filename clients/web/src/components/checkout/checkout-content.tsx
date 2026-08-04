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
  const [currentStep, setCurrentStep] =
    useState<CheckoutStep>('delivery');

  const [formData, setFormData] =
    useState<CheckoutFormData>(INITIAL_FORM_DATA);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | null>(null);

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

  function handleFinalizeOrder() {
    // A criação real do pedido será implementada com o backend.
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
        onFinalize={handleFinalizeOrder}
      />
    </div>
  );
}
