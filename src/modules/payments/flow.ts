import { createHmac } from 'node:crypto';

export function signFlowParameters(
  parameters: Record<string, string>,
  secretKey: string
) {
  const message = Object.keys(parameters)
    .sort()
    .map((key) => `${key}${parameters[key]}`)
    .join('');
  return createHmac('sha256', secretKey).update(message).digest('hex');
}

export function isMatchingPaidOrder(
  page: { id: string; flowOrder: number | null; flowAmount: number | null },
  payment: {
    commerceOrder: string;
    flowOrder: number;
    amount: number;
    currency: string;
    status: number;
  }
) {
  return (
    payment.status === 2 &&
    payment.commerceOrder === page.id &&
    payment.flowOrder === page.flowOrder &&
    page.flowAmount !== null &&
    Math.round(payment.amount * 100) === Math.round(page.flowAmount * 100) &&
    payment.currency === 'PEN'
  );
}
