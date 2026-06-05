import React from 'react';
import { Home, Calendar, Clock, User, LayoutDashboard, Settings, Crown } from 'lucide-react';

export default function BottomNavigation({ onNavigate, currentPage, userRole }) {
  const clientNav = [
    { label: 'Início', id: 'home', icon: Home },
    { label: 'Agendar', id: 'details', icon: Calendar },
    { label: 'Reservas', id: 'bookings', icon: Clock },
    { label: 'Seja um Mensalista', id: 'subscribe', icon: Crown },
    { label: 'Perfil', id: 'profile', icon: User }
  ];

  const managerNav = [
    { label: 'Dashboard', id: 'home', icon: LayoutDashboard },
    { label: 'Gestão', id: 'management', icon: Settings },
    { label: 'Agenda', id: 'bookings', icon: Calendar },
    { label: 'Perfil', id: 'profile', icon: User }
  ];

  const barberNav = [
    { label: 'Dashboard', id: 'home', icon: LayoutDashboard },
    { label: 'Agenda', id: 'bookings', icon: Calendar },
    { label: 'Perfil', id: 'profile', icon: User }
  ];

  const currentNav = userRole === 'manager' 
    ? managerNav 
    : userRole === 'barber'
      ? barberNav
      : clientNav;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-lg border-t border-border z-50 flex justify-around pb-6 pt-3 px-4">
      {currentNav.map((item) => (
        <div 
          key={item.id}
          onClick={() => onNavigate(item.id)} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${currentPage === item.id ? 'text-brand-primary' : 'text-muted-foreground hover:text-white'}`}
        >
          <item.icon size={22} className={currentPage === item.id ? "stroke-[2.5px]" : "stroke-[2px]"} />
          <span className={`text-[10px] font-bold ${currentPage === item.id ? '' : 'opacity-70'}`}>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
