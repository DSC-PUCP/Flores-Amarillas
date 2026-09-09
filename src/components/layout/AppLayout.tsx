import { useMatchRoute } from '@tanstack/react-router';
import { Activity, type PropsWithChildren } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppNavbar from '../common/AppNavbar';
import { SidebarTrigger } from '../ui/sidebar';

export default function AppLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  const matchRoute = useMatchRoute();
  const isCreateRoute = matchRoute({
    to: '/template',
  });
  return (
    <div className="flex flex-col h-dvh w-full">
      <Activity mode={isMobile ? 'hidden' : 'visible'}>
        <SidebarTrigger />
      </Activity>
      {children}{' '}
      <Activity mode={isMobile && !isCreateRoute ? 'visible' : 'hidden'}>
        <AppNavbar />
      </Activity>
    </div>
  );
}
