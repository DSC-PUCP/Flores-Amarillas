import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Result } from '@/lib/utils';
import { registrarAvisoPago, validarAvisoPago } from './yape';

const { registrar, uploadComprobante } = vi.hoisted(() => ({
  registrar: vi.fn(),
  uploadComprobante: vi.fn(),
}));

vi.mock('@/repository', () => ({ pagoRepository: { registrar } }));
vi.mock('@/repository/storage', () => ({
  storageRepository: { uploadComprobante },
}));

const captura = (
  nombre = 'yape.jpg',
  tipo = 'image/jpeg',
  bytes = 1024
): File => new File([new Uint8Array(bytes)], nombre, { type: tipo });

const datosValidos = {
  nombre: 'Ana Quispe',
  correo: 'ana@correo.com',
  comprobante: captura(),
};

describe('validarAvisoPago', () => {
  it('acepta un aviso completo', () => {
    expect(validarAvisoPago(datosValidos)).toBeNull();
  });

  it('no deja pasar un nombre de una letra ni uno vacío', () => {
    expect(validarAvisoPago({ ...datosValidos, nombre: 'A' })).toMatch(/nombre/i);
    expect(validarAvisoPago({ ...datosValidos, nombre: '   ' })).toMatch(
      /nombre/i
    );
  });

  it('pide un correo con forma de correo', () => {
    expect(validarAvisoPago({ ...datosValidos, correo: 'ana@' })).toMatch(
      /correo/i
    );
    expect(validarAvisoPago({ ...datosValidos, correo: 'ana correo.com' })).toMatch(
      /correo/i
    );
  });

  it('exige el comprobante y que sea una imagen', () => {
    expect(validarAvisoPago({ ...datosValidos, comprobante: null })).toMatch(
      /comprobante|captura/i
    );
    expect(
      validarAvisoPago({
        ...datosValidos,
        comprobante: captura('pago.pdf', 'application/pdf'),
      })
    ).toMatch(/imagen/i);
  });

  it('rechaza una captura de más de 5 MB antes de gastar la subida', () => {
    expect(
      validarAvisoPago({
        ...datosValidos,
        comprobante: captura('grande.jpg', 'image/jpeg', 6 * 1024 * 1024),
      })
    ).toMatch(/5 MB/);
  });
});

describe('registrarAvisoPago', () => {
  beforeEach(() => {
    registrar.mockReset();
    uploadComprobante.mockReset();
  });

  it('sube la captura y guarda el aviso con los datos limpios', async () => {
    uploadComprobante.mockResolvedValue(Result.success('https://cdn/abc.jpg'));
    registrar.mockResolvedValue(Result.success());

    await registrarAvisoPago({
      pageId: 'pagina-1',
      nombre: '  Ana Quispe  ',
      correo: '  ana@correo.com ',
      comprobante: captura(),
      enlace: 'https://sitio/lovepage/pagina-1',
    });

    expect(uploadComprobante).toHaveBeenCalledWith(
      expect.objectContaining({ pageId: 'pagina-1' })
    );
    expect(registrar).toHaveBeenCalledWith({
      pageId: 'pagina-1',
      nombre: 'Ana Quispe',
      correo: 'ana@correo.com',
      comprobanteUrl: 'https://cdn/abc.jpg',
      enlace: 'https://sitio/lovepage/pagina-1',
    });
  });

  it('no deja un aviso sin comprobante si la subida falla', async () => {
    uploadComprobante.mockResolvedValue(Result.error(new Error('bucket lleno')));

    await expect(
      registrarAvisoPago({
        pageId: 'pagina-1',
        nombre: 'Ana Quispe',
        correo: 'ana@correo.com',
        comprobante: captura(),
        enlace: 'https://sitio/lovepage/pagina-1',
      })
    ).rejects.toThrow('bucket lleno');

    expect(registrar).not.toHaveBeenCalled();
  });

  it('avisa si la subida va bien pero la fila no entra', async () => {
    uploadComprobante.mockResolvedValue(Result.success('https://cdn/abc.jpg'));
    registrar.mockResolvedValue(Result.error(new Error('RLS')));

    await expect(
      registrarAvisoPago({
        pageId: 'pagina-1',
        nombre: 'Ana Quispe',
        correo: 'ana@correo.com',
        comprobante: captura(),
        enlace: 'https://sitio/lovepage/pagina-1',
      })
    ).rejects.toThrow('RLS');
  });
});
