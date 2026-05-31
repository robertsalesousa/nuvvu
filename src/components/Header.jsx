import React from 'react';
import { MapPin, Bell, User, Settings, LogOut, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header({ onNavigate, onLogout, currentUser }) {
  const isClient = currentUser?.role === 'client';
  const isSubscriber = currentUser?.subscription || null;
  const userInitials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'JS';
  
  return (
    <header className="flex justify-between items-center py-6 px-4 md:px-0">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-11 w-11 border border-border cursor-pointer hover:ring-2 hover:ring-accent transition-all duration-300">
              <AvatarImage src={currentUser?.avatar || "/avatar.png"} className="object-cover" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none flex items-center gap-1.5">
                  {currentUser?.name || 'Cliente'}
                  {isSubscriber && <Crown size={13} className="text-brand-primary" fill="currentColor" />}
                </p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || 'cliente@naregua.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate('profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10" onClick={() => {
              toast.info("Saindo da conta...");
              onLogout();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-col">
          {isSubscriber ? (
            <div className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-wider bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-full w-fit mb-0.5">
              <Crown size={10} fill="currentColor" />
              <span>Membro {isSubscriber}</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Localização</span>
          )}
          <div className="flex items-center gap-1 font-medium text-sm">
            <MapPin size={14} className="text-accent" />
            <span>São Paulo, SP</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="h-11 w-11 rounded-xl flex items-center justify-center border border-border bg-transparent text-foreground hover:bg-card transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
