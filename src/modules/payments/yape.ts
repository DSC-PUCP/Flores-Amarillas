import { pagoRepository } from '@/repository';
import { storageRepository } from '@/repository/storage';

/**
 * QR de Yape al que se le paga.
 *
 * Vive en el bucket publico del proyecto, no en `public/`: ese despliegue no
 * esta sirviendo los archivos estaticos y ademas el QR puede cambiar sin tener
 * que desplegar de nuevo. Para cambiarlo, sube la imagen nueva y pega su URL
 * aqui.
 */
export const QR_YAPE_URL =
  'https://ewnkbapajehtlumggpvl.supabase.co/storage/v1/object/public/flores-amarillas/Qr-pago/IMG_1399.jpeg';

/**
 * Numero de Yape al que se paga.
 *
 * Va junto al QR y no solo dentro de el: si la camara no lee el codigo —o si
 * alguien abre el regalo en el mismo celular con el que va a yapear, donde no
 * hay nada que escanear—, el numero a mano es la unica salida.
 */
export const NUMERO_YAPE = '951722132';

/** Lo que aguanta Supabase Storage en el plan gratuito sin devolver 413. */
const MAX_COMPROBANTE_BYTES = 5 * 1024 * 1024;

const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export type DatosAvisoPago = {
  pageId: string;
  nombre: string;
  correo: string;
  comprobante: File;
  /** Enlace del regalo, tal como lo ve el cliente en la barra del navegador. */
  enlace: string;
};

/**
 * Valida en el navegador antes de gastar una subida.
 *
 * Las mismas reglas estan como CHECK en la tabla: esto es para decirlo claro y
 * rapido, no para confiar. Quien quiera saltarselo llega igual a la base, y
 * ahi la restriccion no se negocia.
 */
export function validarAvisoPago(datos: {
  nombre: string;
  correo: string;
  comprobante: File | null;
}): string | null {
  const nombre = datos.nombre.trim();
  if (nombre.length < 2) return 'Escribe tu nombre completo.';
  if (nombre.length > 120) return 'Ese nombre es demasiado largo.';

  const correo = datos.correo.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo))
    return 'Revisa tu correo: parece que le falta algo.';

  if (!datos.comprobante) return 'Adjunta la captura de tu pago.';
  if (!TIPOS_ACEPTADOS.includes(datos.comprobante.type))
    return 'El comprobante tiene que ser una imagen (JPG, PNG o WEBP).';
  if (datos.comprobante.size > MAX_COMPROBANTE_BYTES)
    return 'La imagen pesa más de 5 MB. Prueba con una captura más liviana.';

  return null;
}

/**
 * Sube el comprobante y deja el aviso en la bandeja.
 *
 * El orden importa: primero la imagen, porque si falla no queremos una fila de
 * pago apuntando a un comprobante que no existe. Al reves —fila primero— nos
 * dejaria avisos imposibles de verificar.
 */
export async function registrarAvisoPago(datos: DatosAvisoPago) {
  const subida = await storageRepository.uploadComprobante({
    file: datos.comprobante,
    pageId: datos.pageId,
  });

  if (subida.isFailure()) {
    throw new Error(
      subida.getError()?.message ?? 'No se pudo subir tu comprobante'
    );
  }

  const comprobanteUrl = subida.getValue();
  if (!comprobanteUrl) throw new Error('No se pudo subir tu comprobante');

  const guardado = await pagoRepository.registrar({
    pageId: datos.pageId,
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim(),
    comprobanteUrl,
    enlace: datos.enlace,
  });

  if (guardado.isFailure()) {
    throw new Error(
      guardado.getError()?.message ?? 'No se pudo registrar tu pago'
    );
  }
}
