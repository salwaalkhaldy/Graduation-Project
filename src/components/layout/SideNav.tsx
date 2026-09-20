import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Truck,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Role } from '../../types/domain';

export interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  end?: boolean;
}

export const SideNav: React.FC<{
  role: Role;
  pendingDriverCount?: number;
}> = ({ role, pendingDriverCount = 0 }) => {
  const sellerLinks: NavLinkItem[] = [
    {
      to: '/seller',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/seller/requests/new',
      label: 'Create Request',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      to: '/seller/profile',
      label: 'Seller Profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  const driverLinks: NavLinkItem[] = [
    {
      to: '/driver',
      label: 'Nearby Requests',
      icon: <Compass className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/driver/active',
      label: 'Active Delivery',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      to: '/driver/profile',
      label: 'Driver Profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  const adminLinks: NavLinkItem[] = [
    {
      to: '/admin',
      label: 'Platform Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/admin/drivers',
      label: 'Driver Management',
      icon: <Users className="w-4 h-4" />,
      badge: pendingDriverCount > 0 ? pendingDriverCount : undefined,
    },
  ];

  const links =
    role === 'SELLER'
      ? sellerLinks
      : role === 'DRIVER'
      ? driverLinks
      : adminLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <span className="shrink-0">{link.icon}</span>
              <span>{link.label}</span>
            </div>
            {link.badge !== undefined && link.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
