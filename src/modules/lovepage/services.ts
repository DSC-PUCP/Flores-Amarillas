import { lovepageRepository } from '@/repository/lovepage';

export namespace LovepageService {
  export const getLovepage = async (id: string) => {
    const result = await lovepageRepository.getById(id);
    if (result.isFailure()) throw new Error(result.getError()?.message);

    const lovepage = result.getValue();
    if (!lovepage) return null;

    // Solo verificar expiracion si NO esta pagada
    if (
      (!lovepage.isPaid || lovepage.expiresAt === null) &&
      lovepage.expiresAt &&
      lovepage.expiresAt < new Date()
    )
      return {
        ...lovepage,
        configJson: null,
      };

    return lovepage;
  };
}
