import { Cat, SearchX } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';

export default function NotFound() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Pagina no encontrada.</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <a href="/home">
            <Cat />
            Volver al inicio
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
