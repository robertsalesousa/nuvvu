import React, { useState, useEffect } from 'react';
import { CalendarClock, MapPin, Sparkles, Scissors, Calendar } from 'lucide-react';
import { api } from '../lib/api';

export default function UpcomingAppointment({ booking, isLoading, onNavigate }) {
  const [service, setService] = useState(null);
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    const fetchResolvers = async () => {
      if (!booking) return;
      try {
        const services = await api.getServices();
        const foundService = services.find(s => Number(s.id) === Number(booking.service_id));
        setService(foundService);

        const units = await api.getUnits();
        const foundUnit = units.find(u => Number(u.id) === Number(booking.unit_id));
        setUnit(foundUnit);
      } catch (err) {
        console.warn("Falha ao resolver agendamento na home:", err);
      }
    };

    fetchResolvers();
  }, [booking]);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-8 animate-pulse flex flex-col gap-3 h-32">
        <div className="h-4 bg-white/5 rounded w-1/3"></div>
        <div className="h-6 bg-white/5 rounded w-2/3"></div>
        <div className="h-4 bg-white/5 rounded w-1/2"></div>
      </div>
    );
  }

  // Elegant empty state CTA banner if there are no bookings
  if (!booking) {
    return (
      <div 
        className="bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent border border-brand-primary/20 rounded-2xl p-5 mb-8 relative overflow-hidden group cursor-pointer hover:border-brand-primary/40 transition-all"
        onClick={() => onNavigate('details')}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-all"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-brand-primary font-bold text-sm">
              <Sparkles size={14} className="animate-bounce" />
              <span>Nenhum corte marcado</span>
            </div>
            <h3 className="text-lg font-bold text-white">Pronto para dar aquele trato no visual?</h3>
            <p className="text-xs text-muted-foreground mt-1">Clique para escolher seu serviço e reservar seu horário hoje mesmo!</p>
          </div>
          <div className="p-3 bg-brand-primary/20 text-brand-primary rounded-xl shrink-0 group-hover:scale-105 transition-transform">
            <Calendar size={20} />
          </div>
        </div>
      </div>
    );
  }

  // Active booking display card
  const serviceName = service ? service.name : "Corte & Estilo";
  const unitName = unit ? unit.name : "The Gentlemen's Lounge";
  const unitAddress = unit ? `${unit.address}, ${unit.city}` : "123 King Street, SP";

  // Check if booking date is today
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = booking.booking_date === todayStr;

  return (
    <div 
      className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm relative overflow-hidden group cursor-pointer hover:border-brand-primary/30 transition-colors" 
      onClick={() => onNavigate('bookings')}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-brand-primary font-semibold mb-1">
            <CalendarClock size={16} />
            <span className="text-sm">Próximo Agendamento</span>
          </div>
          <h3 className="text-xl font-bold text-white">{unitName}</h3>
        </div>
        <div className="bg-background/80 backdrop-blur-md rounded-xl p-2 text-center border border-border min-w-[70px] shadow-sm">
          <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            {isToday ? "Hoje" : (booking.booking_date ? booking.booking_date.slice(5) : "")}
          </span>
          <span className="block text-base font-black text-brand-primary leading-tight">
            {booking.booking_time ? booking.booking_time.slice(0, 5) : ""}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={13} className="text-brand-primary" />
            <span>{unitAddress}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-black bg-brand-primary px-3 py-1.5 rounded-lg font-black shadow-sm group-hover:scale-98 transition-transform">
          <Scissors size={12} />
          <span>{serviceName}</span>
        </div>
      </div>
    </div>
  );
}
