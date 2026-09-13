import { describe, expect, it } from 'vitest';
import { isMatchingPaidOrder, signFlowParameters } from './flow';

describe('Flow', () => {
  it('firma los parametros por nombre, independientemente del orden recibido', () => {
    const first = signFlowParameters({ token: 'abc', apiKey: 'key' }, 'secret');
    const second = signFlowParameters({ apiKey: 'key', token: 'abc' }, 'secret');
    expect(first).toBe(second);
    expect(first).toBe('228eb82efccaee56895c8f01c05c7fa24e643a47bc691e9d94c507551d24ab66');
  });

  it('solo acepta el pago confirmado de la pagina y el monto acordado', () => {
    const page = { id: 'page-1', flowOrder: 123, flowAmount: 10 };
    const payment = {
      commerceOrder: 'page-1',
      flowOrder: 123,
      amount: 10,
      currency: 'PEN',
      status: 2,
    };
    expect(isMatchingPaidOrder(page, payment)).toBe(true);
    expect(isMatchingPaidOrder(page, { ...payment, status: 1 })).toBe(false);
    expect(isMatchingPaidOrder(page, { ...payment, commerceOrder: 'page-2' })).toBe(false);
    expect(isMatchingPaidOrder(page, { ...payment, flowOrder: 124 })).toBe(false);
    expect(isMatchingPaidOrder(page, { ...payment, amount: 1 })).toBe(false);
    expect(isMatchingPaidOrder(page, { ...payment, currency: 'USD' })).toBe(false);
  });
});
