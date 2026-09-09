import { HeartCrack } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';

export default function ErrorComponent() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HeartCrack />
        </EmptyMedia>
        <EmptyTitle>Ocurrió un error inesperado.</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
