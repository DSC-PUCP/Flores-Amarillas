import type {
  ItemCreateInput,
  ItemRepository,
} from '../interfaces/item-repository';

export const createItemUseCase =
  (itemRepository: ItemRepository) => async (payload: ItemCreateInput) => {
    try {
      const result = await itemRepository.create(payload);
      if (result.isFailure()) {
        return {
          error: result.getError() ?? new Error('No se pudo crear el item'),
          data: null,
        };
      }
      return {
        error: null,
        data: result.getValue() ?? null,
      };
    } catch (error) {
      return {
        error: error as Error,
        data: null,
      };
    }
  };
