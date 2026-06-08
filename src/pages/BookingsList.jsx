import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Scissors, User, CheckCircle2, XCircle, AlertCircle, Calendar, Crown } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function BookingsList({ currentUser, onNavigate }) {
  const isClient = currentUser?.role === 'client';
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [units, setUnits] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [clients, setClients] = useState([]); // In case of manager view to look up client names
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all lookups first
      const allServices = await api.getServices();
      setServices(allServices);

      const allUnits = await api.getUnits();
      setUnits(allUnits);

      const allBarbers = await api.getBarbers();
      setBarbers(allBarbers);

      // Load bookings
      const allBookings = await api.getBookings();

      if (isClient) {
        // Filter for this specific client
        const clientBookings = allBookings.filter(b => String(b.client_id) === String(currentUser?.id));
        setBookings(clientBookings);
      } else {
        // Manager shows all bookings
        setBookings(allBookings);

        // Fetch client profiles to show client names in manager view
        try {
          const allProfiles = await api.getProfiles();
          setClients(allProfiles.filter(p => p.role === 'client'));
        } catch (err) {
          console.warn("Erro ao buscar perfis para nomes de clientes:", err);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar reservas:", err);
      toast.error("Erro ao carregar dados da agenda local.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.updateBooking(bookingId, { status: newStatus });
      toast.success(`Agendamento atualizado para "${
        newStatus === 'confirmed' ? 'Confirmado' : 
        newStatus === 'completed' ? 'Concluído' : 'Cancelado'
      }"!`);
      loadData(); // Reload list to reflect status change
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      toast.error("Não foi possível atualizar o agendamento.");
    }
  };

  const handleUpdateDelayStatus = async (bookingId, newDelayStatus) => {
    try {
      await api.updateBooking(bookingId, { delay_status: newDelayStatus });
      toast.success(`Atraso do cliente ${newDelayStatus === 'accepted' ? 'ACEITO' : 'RECUSADO'}! ⏱️`);
      loadData(); // Reload list to reflect changes
    } catch (err) {
      console.error("Erro ao alterar status do atraso:", err);
      toast.error("Não foi possível atualizar o status do atraso.");
    }
  };

  // Helper resolvers
  const getServiceName = (id) => services.find(s => Number(s.id) === Number(id))?.name || "Corte de Cabelo";
  const getServicePrice = (id) => services.find(s => Number(s.id) === Number(id))?.price || 50;
  const getUnitName = (id) => units.find(u => Number(u.id) === Number(id))?.name || "Unidade Centro";
  const getUnitAddress = (id) => {
    const unit = units.find(u => Number(u.id) === Number(id));
    return unit ? `${unit.address}, ${unit.city}` : "Rua das Flores, 100, SP";
  };
  const getBarberName = (id) => barbers.find(b => String(b.id) === String(id))?.name || "Qualquer Barbeiro";
  const getClientName = (id) => clients.find(c => String(c.id) === String(id))?.name || "Cliente " + id;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 gap-1"><CheckCircle2 size={12} /> Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 gap-1"><CheckCircle2 size={12} /> Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 gap-1"><XCircle size={12} /> Cancelado</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 gap-1"><AlertCircle size={12} /> Pendente</Badge>;
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-8 animate-in fade-in zoom-in-95 duration-300 px-4 md:px-0">
      
      <div className="flex justify-between items-center py-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isClient ? "Minhas Reservas" : "Agenda do Salão"}
          </h1>
          <p className="text-muted-foreground">
            {isClient 
              ? "Gerencie seus horários agendados e histórico de cortes."
              : "Visualize e gerencie todos os agendamentos da barbearia."
            }
          </p>
        </div>
        {isClient && (
          <Button 
            onClick={() => onNavigate('details')}
            className="bg-white text-black hover:bg-white/90 rounded-xl font-bold gap-2"
          >
            <Calendar size={16} /> Novo Horário
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          Carregando agendamentos...
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border border-white/5 bg-card/40 py-12 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-white/5 rounded-full text-muted-foreground">
              <CalendarClock size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Nenhum agendamento encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isClient 
                  ? "Você não possui nenhuma reserva ativa no momento. Que tal escolher um serviço agora?"
                  : "Não há reservas cadastradas no sistema para hoje ou datas futuras."
                }
              </p>
            </div>
            {isClient && (
              <Button onClick={() => onNavigate('details')} className="mt-2 bg-white text-black hover:bg-white/90 rounded-xl px-6 font-bold">
                Escolher Serviço
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings
            .sort((a, b) => new Date(`${a.booking_date}T${a.booking_time}`) - new Date(`${b.booking_date}T${b.booking_time}`))
            .map(booking => (
              <div 
                key={booking.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-card/60 border border-white/5 rounded-2xl hover:border-white/10 transition-all gap-4"
              >
                {/* Details */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="p-3 bg-white/5 rounded-xl self-start md:self-center">
                    <Scissors className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-white font-bold text-lg">{getServiceName(booking.service_id)}</h4>
                      {getStatusBadge(booking.status)}
                      {booking.paid_in_advance && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-xs">
                          💸 PAGO ANTECIPADAMENTE
                        </Badge>
                      )}
                      {booking.dependent_name && (
                        <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 font-black text-xs">
                          👥 Dependente: {booking.dependent_name}
                        </Badge>
                      )}
                      {booking.delay_minutes && (
                        <Badge variant="outline" className={`border gap-1 animate-pulse font-bold text-xs ${
                          booking.delay_status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-none' :
                          booking.delay_status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-none' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          ⏱️ Atraso: {booking.delay_minutes} min ({
                            booking.delay_status === 'accepted' ? 'Aceito' :
                            booking.delay_status === 'rejected' ? 'Recusado' :
                            'Pendente'
                          })
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-brand-primary" />
                        <span>{booking.booking_date} às {booking.booking_time ? booking.booking_time.slice(0, 5) : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand-primary" />
                        <span>{getUnitName(booking.unit_id)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-brand-primary" />
                        <span>Barbeiro: {getBarberName(booking.barber_id)}</span>
                      </div>
                      {!isClient && (
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-brand-primary" />
                          <span>Cliente: <strong className="text-white">{getClientName(booking.client_id)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing and Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-white/5 gap-4">
                  <div className="text-left md:text-right">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Valor total</span>
                    <span className="block text-xl font-black text-white">
                      {currentUser?.subscription ? (
                        <span className="text-brand-primary flex items-center gap-1 text-sm font-black uppercase">
                          <Crown size={12} fill="currentColor" /> Coberto
                        </span>
                      ) : (
                        `R$ ${getServicePrice(booking.service_id)}`
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Client actions */}
                    {isClient && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button 
                        variant="destructive"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="rounded-xl h-10 px-4 text-xs font-bold"
                      >
                        Cancelar
                      </Button>
                    )}

                    {/* Manager actions */}
                    {!isClient && (
                      <div className="flex flex-wrap gap-2 items-center justify-end">
                        {/* Atraso (Delay) approval buttons */}
                        {booking.delay_minutes && (!booking.delay_status || booking.delay_status === 'pending') && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleUpdateDelayStatus(booking.id, 'accepted')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                            >
                              Aceitar Atraso
                            </Button>
                            <Button 
                              onClick={() => handleUpdateDelayStatus(booking.id, 'rejected')}
                              variant="destructive"
                              className="rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                            >
                              Recusar Atraso
                            </Button>
                          </div>
                        )}

                        {booking.status === 'pending' && (
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                          >
                            Confirmar
                          </Button>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                          >
                            Concluir
                          </Button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button 
                            variant="destructive"
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
