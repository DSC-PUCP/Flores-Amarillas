import { env } from '@/env';

export const whatsappConfig = {
  // Numero institucional de ventas de DSC PUCP.
  // Se configura con VITE_WHATSAPP_PHONE, nunca hardcodeado aqui.
  phoneNumber: env.VITE_WHATSAPP_PHONE,
};

export const generateWhatsappUrl = (
  link: string,
  price: number | null
): string => {
  const priceText = price ? price.toFixed(2) : '';
  const message = `Hola! Quisiera obtener el link permanente de mis flores amarillas ${link}. Voy a realizar el pago de S/ ${priceText} y les envio el comprobante.`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappConfig.phoneNumber}?text=${encodedMessage}`;
};
