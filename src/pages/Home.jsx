import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Scissors, User, Star, Clock, MapPin } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import UpcomingAppointment from '../components/UpcomingAppointment';
import { api } from '../lib/api';
import { Button } from "@/components/ui/button";

export default function Home({ onNavigate, currentUser }) {
  const userRole = currentUser?.role || 'client';
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customization, setCustomization] = useState({
    welcome_title: "N1 BARBER STUDIO",
    welcome_description: "Bem-vindo à N1 BARBER STUDIO! Oferecemos um conceito premium de barbearia com profissionais altamente qualificados, toalhas quentes, massagem capilar e um atendimento totalmente exclusivo e personalizado para você.",
    address: "123 King Street, SP",
    hours: "Terça a Sábado, 9h às 20h",
    whatsapp: "(11) 98765-4321",
    photos: ["/hero.png"]
  });

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch upcoming booking if client
        if (userRole === 'client') {
          const bookings = await api.getBookings();
          const clientBookings = bookings.filter(b => 
            String(b.client_id) === String(currentUser?.id) && 
            (b.status === 'pending' || b.status === 'confirmed')
          );

          if (clientBookings.length > 0) {
            const sorted = clientBookings.sort((a, b) => 
              new Date(`${a.booking_date}T${a.booking_time}`) - new Date(`${b.booking_date}T${b.booking_time}`)
            );
            setUpcomingBooking(sorted[0]);
          } else {
            setUpcomingBooking(null);
          }
        }

        // 2. Fetch Barbers
        const dbBarbers = await api.getBarbers();
        setBarbers(dbBarbers);

        // 3. Fetch Services
        const dbServices = await api.getServices();
        setServices(dbServices.slice(0, 3)); // show top 3

        // 4. Fetch Customization
        const dbCustomization = await api.getCustomization();
        setCustomization(dbCustomization);
      } catch (err) {
        console.warn("Erro ao buscar dados da home:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [currentUser, userRole]);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-0 md:mt-4">
        {userRole === 'client' && (
          <UpcomingAppointment 
            booking={upcomingBooking} 
            isLoading={isLoading} 
            onNavigate={onNavigate} 
          />
        )}
      </div>

      {/* Premium Exclusive N1 Barber Studio Presentation Card */}
      <div className="px-4 md:px-0">
        <div className="bg-card border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col md:flex-row gap-6 items-center">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl"></div>
          
          <div className="w-full md:w-1/3 h-48 rounded-2xl overflow-hidden shrink-0 border border-white/5">
            <img src={customization.photos[0] || "/hero.png"} alt={customization.welcome_title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase font-black tracking-wider">Nosso Espaço</span>
                <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2 uppercase">{customization.welcome_title}</h2>
              </div>
              <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shrink-0">
                <Star size={13} fill="#F5C451" color="#F5C451" /> 4.9
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {customization.welcome_description}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-primary" /> {customization.address}</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-brand-primary" /> {customization.hours}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => onNavigate('details')}
                className="bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-xl h-11 px-6 shadow-lg shadow-brand-primary/15"
              >
                <Calendar size={15} className="mr-2" /> Agendar Horário
              </Button>
              <Button 
                variant="outline"
                onClick={() => onNavigate('subscribe')}
                className="bg-white/5 hover:bg-white/10 text-white border-white/5 rounded-xl h-11 px-5"
              >
                Seja um Mensalista
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Professionals Section */}
      <div className="mt-4">
        <SectionHeader title="Nossos Profissionais" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 md:px-0 mt-4">
          {barbers.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground">Nenhum profissional cadastrado no momento.</div>
          ) : (
            barbers.map(barber => (
              <div key={barber.id} className="bg-card/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-white/10 transition-all group">
                <div className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-sm font-bold text-white overflow-hidden mb-3">
                  {barber.avatar ? (
                    <img src={barber.avatar} alt={barber.name} className="object-cover h-full w-full" />
                  ) : (
                    barber.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
                <h4 className="text-white font-bold text-sm tracking-tight">{barber.name}</h4>
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Master Barber</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Featured Services Section */}
      <div className="mt-4 mb-8">
        <SectionHeader title="Serviços em Destaque" actionText="Ver Todos" onActionClick={() => onNavigate('details')} />
        <div className="flex flex-col gap-3 px-4 md:px-0 mt-4">
          {services.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">Nenhum serviço cadastrado no momento.</div>
          ) : (
            services.map(s => (
              <div 
                key={s.id} 
                onClick={() => onNavigate('details')}
                className="flex justify-between items-center bg-card/40 p-4 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:bg-brand-primary/10 transition-all">
                    <Scissors className="w-5 h-5 text-white group-hover:text-brand-primary transition-all" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description || 'Tratamento clássico premium.'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-sm text-white">
                    {currentUser?.subscription ? (
                      <span className="text-brand-primary flex items-center gap-1 text-xs">
                        👑 Coberto
                      </span>
                    ) : (
                      `R$ ${s.price}`
                    )}
                  </span>
                  <span className="block text-[10px] text-brand-primary font-bold uppercase mt-0.5">{s.duration_minutes} MIN</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
