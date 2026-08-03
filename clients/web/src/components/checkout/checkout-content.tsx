'use client';

import { useState } from 'react';

import {
  CheckoutForm,
  type CheckoutFormData,
} from '@/components/checkout/checkout-form';
import { CheckoutPayment } from '@/components/checkout/checkout-payment';
import { CheckoutSummary } from '@/components/checkout/checkout-summary';

type CheckoutStep = 'delivery' | 'payment';

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

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
      {currentStep === 'delivery' ? (
        <CheckoutForm
          formData={formData}
          onChange={handleFormChange}
          onContinue={() => setCurrentStep('payment')}
        />
      ) : (
        <CheckoutPayment
          onBack={() => setCurrentStep('delivery')}
        />
      )}

      <CheckoutSummary />
    </div>
  );
}