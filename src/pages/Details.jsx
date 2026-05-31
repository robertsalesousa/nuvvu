import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bookmark, Phone, MessageSquare, Navigation, Globe, Star, Calendar, Clock, Crown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from '../lib/api';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Details({ onNavigate, currentUser }) {
  const [services, setServices] = useState([]);
  const [units, setUnits] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);

  // Booking Form State
  const [selectedService, setSelectedService] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const dbServices = await api.getServices();
      setServices(dbServices);

      const dbUnits = await api.getUnits();
      setUnits(dbUnits);
      if (dbUnits.length > 0) {
        setSelectedUnit(dbUnits[0].id);
      }

      const dbBarbers = await api.getBarbers();
      setBarbers(dbBarbers);
    } catch (err) {
      console.warn("Falha ao carregar dados no localhost:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime || !selectedUnit) {
      toast.error("Por favor, preencha todos os campos do agendamento.");
      return;
    }

    // Validate Monthly subscription (Mensalista) booking limits
    if (currentUser?.subscription) {
      try {
        const config = await api.getMensalistasConfig();
        
        // 1. Validate allowed days (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
        const dateObj = new Date(bookingDate + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        
        const DAYS_MAP = {
          0: "Domingo",
          1: "Segunda-feira",
          2: "Terça-feira",
          3: "Quarta-feira",
          4: "Quinta-feira",
          5: "Sexta-feira",
          6: "Sábado"
        };

        if (!config.allowed_days.includes(dayOfWeek)) {
          const allowedDaysNames = config.allowed_days.map(d => DAYS_MAP[d]).join(', ');
          toast.error(`❌ Agendamento Bloqueado! Como Mensalista, seus agendamentos são permitidos apenas nos dias: ${allowedDaysNames}. O dia selecionado (${DAYS_MAP[dayOfWeek]}) não é permitido.`);
          return;
        }

        // 2. Validate allowed hour range
        const formattedTime = bookingTime ? bookingTime.slice(0, 5) : ''; // Ensure HH:MM
        if (formattedTime && (formattedTime < config.allowed_hours_start || formattedTime > config.allowed_hours_end)) {
          toast.error(`❌ Agendamento Bloqueado! Como Mensalista, seus agendamentos são permitidos apenas no intervalo entre ${config.allowed_hours_start} e ${config.allowed_hours_end}.`);
          return;
        }

      } catch (err) {
        console.warn("Falha ao validar regras de mensalistas:", err);
      }
    }

    const service = services.find(s => s.id === Number(selectedService) || s.id === selectedService);
    const serviceName = service ? service.name : "Serviço";

    try {
      await api.addBooking(
        selectedService, 
        bookingDate, 
        bookingTime, 
        currentUser?.id || "1", 
        selectedBarber || null, 
        selectedUnit
      );
      toast.success(`Agendamento de "${serviceName}" realizado com sucesso no seu banco local!`);
      setIsBookDialogOpen(false);
      setSelectedService("");
      setBookingDate("");
      setBookingTime("");
      setSelectedBarber("");
    } catch (err) {
      console.error("Erro ao efetuar reserva no localhost:", err);
      toast.error("Erro ao conectar com o banco local.");
    }
  };

  return (
    <div className="flex flex-col relative w-full pb-24 md:pb-8">
      <div className="relative w-full h-[320px] md:h-[400px] md:rounded-t-2xl overflow-hidden shrink-0">
        <img src="/hero.png" alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background"></div>
        <div className="absolute top-6 left-4 right-4 md:left-6 md:right-6 flex justify-between z-10">
          <button onClick={() => onNavigate('home')} className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition">
            <ChevronLeft size={24} />
          </button>
          <button className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition">
            <Bookmark size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 relative -mt-6 z-10">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-foreground">The Gentlemen's Lounge</h1>
          <Badge variant="outline" className="bg-card px-3 py-1 flex items-center gap-1.5 text-sm whitespace-nowrap border-border">
            <Star size={14} fill="#F5C451" color="#F5C451" />
            4.9
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">123 King Street, SP</p>

        <div className="flex justify-between items-center mb-8 max-w-sm mx-auto md:mx-0 md:gap-8">
          {[
            { icon: Phone, label: 'Ligar' },
            { icon: MessageSquare, label: 'Mensagem' },
            { icon: Navigation, label: 'Rotas' },
            { icon: Globe, label: 'Site' }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-foreground cursor-pointer group">
              <Button variant="outline" size="icon" className="w-14 h-14 rounded-xl bg-input border-border shadow-sm group-hover:bg-card">
                <action.icon size={18} />
              </Button>
              <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
            </div>
          ))}
        </div>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full bg-input rounded-full p-1 h-auto mb-6 grid grid-cols-3">
            <TabsTrigger value="about" className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Sobre</TabsTrigger>
            <TabsTrigger value="services" className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Serviços</TabsTrigger>
            <TabsTrigger value="review" className="rounded-full py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-6 animate-in fade-in-50 duration-500">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Experimente a arte de cuidar de você na The Gentlemen's Lounge. Nossos mestres barbeiros misturam técnicas clássicas com cortes modernos para entregar um estilo perfeito em um ambiente totalmente de luxo.
            </p>
            
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">Trabalhos Recentes</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <img src="/hero.png" alt="Work" className="w-[100px] h-[100px] rounded-xl object-cover shrink-0 border border-border" />
                <img src="/avatar.png" alt="Work" className="w-[100px] h-[100px] rounded-xl object-cover shrink-0 border border-border" />
                <img src="/hero.png" alt="Work" className="w-[100px] h-[100px] rounded-xl object-cover shrink-0 border border-border" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="text-sm text-muted-foreground min-h-[150px]">
            <div className="flex flex-col gap-4 mt-2">
              {isLoading ? (
                <div className="text-center py-8">Carregando serviços do banco local...</div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum serviço disponível no banco de dados local.</div>
              ) : (
                services.map(service => (
                  <div 
                    key={service.id} 
                    onClick={() => {
                      setSelectedService(service.id);
                      setIsBookDialogOpen(true);
                    }}
                    className="flex justify-between items-center bg-card p-4 rounded-xl border border-border hover:border-accent/40 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                      {service.description && <p className="text-xs text-muted-foreground mt-1">{service.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-sm text-foreground">
                        {currentUser?.subscription ? (
                          <span className="text-brand-primary flex items-center gap-1">
                            <Crown size={12} fill="currentColor" /> Coberto
                          </span>
                        ) : (
                          `R$ ${service.price}`
                        )}
                      </span>
                      <span className="block text-[10px] text-accent font-medium uppercase">{service.duration_minutes} MIN</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="review" className="text-sm text-muted-foreground">
            Avaliações e comentários dos clientes...
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent z-50">
        <Button 
          onClick={() => setIsBookDialogOpen(true)}
          className="w-full h-14 rounded-full text-base font-semibold shadow-[0_8px_16px_rgba(255,255,255,0.05)] shadow-black/10 text-primary-foreground hover:scale-[0.98] transition-transform"
        >
          Reservar Horário
        </Button>
      </div>

      {/* Reservation Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="bg-card border border-white/5 rounded-2xl sm:max-w-[425px] text-white">
          <form onSubmit={handleBookingSubmit}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold flex gap-2 items-center">
                <Calendar className="text-brand-primary" />
                Agendar Horário (Local)
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Escolha o serviço desejado, a data e o horário. Os dados serão salvos no seu banco de dados local.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-select">Selecione o Serviço</Label>
                <select
                  id="service-select"
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  required
                  className="w-full bg-background border border-white/5 rounded-lg h-11 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="" disabled>Escolha um serviço...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {currentUser?.subscription ? "(Coberto 👑)" : `(R$ ${s.price})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-select">Selecione a Unidade</Label>
                <select
                  id="unit-select"
                  value={selectedUnit}
                  onChange={e => setSelectedUnit(e.target.value)}
                  required
                  className="w-full bg-background border border-white/5 rounded-lg h-11 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="" disabled>Escolha uma unidade...</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.address}, {u.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barber-select">Selecione o Barbeiro (Profissional)</Label>
                <select
                  id="barber-select"
                  value={selectedBarber}
                  onChange={e => setSelectedBarber(e.target.value)}
                  className="w-full bg-background border border-white/5 rounded-lg h-11 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">Qualquer Barbeiro (Sem Preferência)</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Data</Label>
                  <Input 
                    id="booking-date" 
                    type="date"
                    value={bookingDate} 
                    onChange={e => setBookingDate(e.target.value)}
                    required 
                    className="bg-background border-white/5 h-11 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-time">Horário</Label>
                  <Input 
                    id="booking-time" 
                    type="time"
                    value={bookingTime} 
                    onChange={e => setBookingTime(e.target.value)}
                    required 
                    className="bg-background border-white/5 h-11 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsBookDialogOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-xl font-bold px-6">
                Confirmar Reserva
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
