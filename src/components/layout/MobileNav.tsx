import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Compass,
  Truck,
  Users,
} from 'lucide-react';
import { Role } from '../../types/domain';

export const MobileNav: React.FC<{ role: Role }> = ({ role }) => {
  const sellerLinks = [
    { to: '/seller', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { to: '/seller/requests/new', label: 'Create', icon: <PlusCircle className="w-5 h-5" /> },
    { to: '/seller/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const driverLinks = [
    { to: '/driver', label: 'Nearby', icon: <Compass className="w-5 h-5" />, end: true },
    { to: '/driver/active', label: 'Active', icon: <Truck className="w-5 h-5" /> },
    { to: '/driver/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { to: '/admin/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
  ];

  const links =
    role === 'SELLER'
      ? sellerLinks
      : role === 'DRIVER'
      ? driverLinks
      : adminLinks;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 h-16 px-2 flex items-center justify-around shadow-lg">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
              isActive
                ? 'text-teal-800 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {link.icon}
          <span className="mt-0.5">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
