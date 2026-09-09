import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { navItems } from '@/components/layout/nav-items';
import {
  Navbar,
  NavbarAction,
  NavbarItem,
  NavbarItemIcon,
  NavbarItemLabel,
} from '../layout/nav-bar/Navbar';

export default function AppNavbar() {
  const location = useLocation();

  const navigate = useNavigate();
  const halfCount = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, halfCount);
  const rightItems = navItems.slice(halfCount);

  return (
    <Navbar>
      {/* Left side items */}
      <div className="flex flex-1 justify-around items-center h-full">
        {leftItems.map((item) => (
          <NavbarItem key={item.href} active={location.pathname === item.href}>
            <Link
              to={item.href}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <NavbarItemIcon>
                <item.icon size={20} />
              </NavbarItemIcon>
              <NavbarItemLabel>{item.label}</NavbarItemLabel>
            </Link>
          </NavbarItem>
        ))}
      </div>

      {/* Central Action Button Spacer/Wrapper */}
      <NavbarAction
        onClick={() =>
          navigate({
            to: '/template',
          })
        }
      >
        <Plus size={28} />
      </NavbarAction>

      {/* Right side items */}
      <div className="flex flex-1 justify-around items-center h-full">
        {rightItems.map((item) => (
          <NavbarItem key={item.href} active={location.pathname === item.href}>
            <Link
              to={item.href}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <NavbarItemIcon>
                <item.icon size={20} />
              </NavbarItemIcon>
              <NavbarItemLabel>{item.label}</NavbarItemLabel>
            </Link>
          </NavbarItem>
        ))}
        {/* Maintain symmetry if we have an odd number of total items */}
        {rightItems.length < leftItems.length && (
          <div className="flex-1" aria-hidden="true" />
        )}
      </div>
    </Navbar>
  );
}
