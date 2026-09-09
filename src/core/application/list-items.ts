import type {
  ItemListFilters,
  ItemRepository,
} from '../interfaces/item-repository';

export const listItemsUseCase =
  (itemRepository: ItemRepository) => async (filters?: ItemListFilters) => {
    try {
      const items = await itemRepository.list(filters);
      if (items.isFailure()) {
        return {
          error: items.getError() ?? new Error('No se pudo listar items'),
          data: null,
        };
      }
      return {
        error: null,
        data: items.getValue() ?? [],
      };
    } catch (error) {
      return {
        error: error as Error,
        data: null,
      };
    }
  };
