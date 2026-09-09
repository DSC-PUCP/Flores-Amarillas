import styles from '@/assets/styles/no-scrollbar.module.css';
import { cn } from '@/lib/utils';
import MenuItems from './components/MenuItems';
import ProfileHeader from './components/ProfileHeader';
import StatsCards from './components/StatsCards';
import TripHistory from './components/TripHistory';

export default function Profile() {
  return (
    <div className="flex-1 flex w-full flex-col overflow-hidden">
      <main className={cn('flex-1 overflow-y-scroll', styles['no-scrollbar'])}>
        <ProfileHeader />
        <StatsCards />
        <MenuItems />
        <TripHistory />
      </main>
    </div>
  );
}
