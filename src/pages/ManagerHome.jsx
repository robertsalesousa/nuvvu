import React, { useState, useEffect } from 'react';
import FinancialCard from '../components/FinancialCard';
import SectionHeader from '../components/SectionHeader';
import { DollarSign, Users, Store, Scissors, Calendar, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function ManagerHome({ onNavigate, currentUser }) {
  const [stats, setStats] = useState({
    monthlyRevenue: "R$ 0",
    activeSubscribers: "0",
    averageTicket: "R$ 0",
    monthlyGrowth: "+0%"
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chat Integration States
  const [chatRequests, setChatRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120);

  // Mensalistas Status State
  const [mensalistasConfig, setMensalistasConfig] = useState({
    allowed_days: [2, 3, 4, 5, 6],
    allowed_hours_start: "09:00",
    allowed_hours_end: "20:00",
    enabled: true
  });

  const loadMensalistasConfig = async () => {
    try {
      const config = await api.getMensalistasConfig();
      setMensalistasConfig(config);
    } catch (err) {
      console.warn("Erro ao obter configurações de mensalistas:", err);
    }
  };

  const toggleMensalistas = async () => {
    const updated = {
      ...mensalistasConfig,
      enabled: mensalistasConfig.enabled === false ? true : false
    };
    try {
      const saved = await api.updateMensalistasConfig(updated);
      setMensalistasConfig(saved);
      toast.success(`Clube de mensalistas ${saved.enabled !== false ? 'ativado' : 'desativado'} com sucesso! 💈`);
    } catch {
      toast.error("Erro ao salvar configuração do clube.");
    }
  };

  const handleAcceptChat = async (chatId) => {
    try {
      const updated = await api.updateChatRequest(chatId, { 
        status: 'active',
        last_barber_message_time: Date.now() 
      });
      setActiveChat(updated);
      toast.success("Atendimento iniciado! Responda em menos de 2 minutos para evitar desconexão.");
    } catch {
      toast.error("Erro ao aceitar atendimento.");
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChat) return;

    try {
      const updated = await api.sendChatMessage(activeChat.id, 'barber', chatInputText.trim());
      setActiveChat(updated);
      setChatInputText('');
      setTimeRemaining(120); // reset countdown
    } catch {
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await api.updateChatRequest(chatId, { status: 'closed' });
      setActiveChat(null);
      toast.info("Atendimento encerrado.");
    } catch {
      toast.error("Erro ao fechar chamado.");
    }
  };

  const calculateMetrics = async () => {
    setIsLoading(true);
    try {
      const bookings = await api.getBookings();
      const services = await api.getServices();
      const profiles = await api.getProfiles();

      // 1. Calculate Subscriptions Revenue (MRR)
      const subscriptionsRevenue = profiles.reduce((sum, p) => {
        if (p.subscription === 'gold') return sum + 130;
        if (p.subscription === 'silver') return sum + 70;
        return sum;
      }, 0);

      // 2. Calculate Monthly Revenue (active bookings + subscriptions revenue)
      const activeBookings = bookings.filter(b => b.status !== 'cancelled');
      const bookingsRevenue = activeBookings.reduce((sum, booking) => {
        const service = services.find(s => Number(s.id) === Number(booking.service_id));
        return sum + (service ? Number(service.price) : 0);
      }, 0);
      
      const totalRevenue = bookingsRevenue + subscriptionsRevenue;

      // 3. Active subscribers count
      const subscribersCount = profiles.filter(p => p.subscription && p.subscription !== null).length;

      // 4. Average ticket
      const avgTicket = activeBookings.length > 0 ? Math.round(bookingsRevenue / activeBookings.length) : 0;

      // 5. Update Stats State
      setStats({
        monthlyRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
        activeSubscribers: String(subscribersCount),
        averageTicket: `R$ ${avgTicket.toLocaleString('pt-BR')}`,
        monthlyGrowth: activeBookings.length > 0 ? "+15%" : "0%"
      });

      // 5. Populate Recent Transactions
      // Sort bookings by ID/time descending to get latest
      const sortedBookings = bookings
        .sort((a, b) => b.id - a.id)
        .slice(0, 5); // Show top 5 latest bookings

      const transactions = sortedBookings.map(b => {
        const clientProfile = profiles.find(p => String(p.id) === String(b.client_id));
        const service = services.find(s => Number(s.id) === Number(b.service_id));
        const clientName = clientProfile ? clientProfile.name : "Cliente Avulso";
        return {
          id: b.id,
          client: b.dependent_name ? `${clientName} (Dependente: ${b.dependent_name})` : clientName,
          service: service ? service.name : "Serviço",
          value: service ? `R$ ${service.price}` : "R$ 50",
          time: `${b.booking_date} • ${b.booking_time ? b.booking_time.slice(0, 5) : ''}`,
          delay_minutes: b.delay_minutes || null,
          paid_in_advance: b.paid_in_advance || false
        };
      });

      setRecentTransactions(transactions);

    } catch (err) {
      console.warn("Erro ao calcular métricas no gestor:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();
    loadMensalistasConfig();
  }, [currentUser]);

  // Poll Active Chats if logged in as a barber or manager
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'barber' && currentUser.role !== 'manager')) return;

    const pollChats = async () => {
      try {
        const chats = await api.getChatRequests();
        const myName = currentUser.name.toLowerCase();
        
        // Filter chats that match the barber's name or are directed to "barbeiro" generally
        const activeRequests = chats.filter(r => {
          if (r.status === 'closed') return false;
          const reqBarberName = r.barber_name.toLowerCase();
          return reqBarberName.includes(myName) || myName.includes(reqBarberName) || reqBarberName === 'barbeiro' || reqBarberName === '';
        });
        
        setChatRequests(activeRequests);

        if (activeChat) {
          const updated = activeRequests.find(r => r.id === activeChat.id);
          if (updated) {
            setActiveChat(updated);
            // Calculate time remaining (2 minutes = 120s)
            const elapsedSeconds = Math.floor((Date.now() - updated.last_barber_message_time) / 1000);
            const remaining = Math.max(0, 120 - elapsedSeconds);
            setTimeRemaining(remaining);

            // Automatically close chat on barber side if 2m inactivity exceeded
            if (remaining === 0 && updated.status === 'active') {
              handleCloseChat(updated.id);
            }
          } else {
            setActiveChat(null);
          }
        }
      } catch (err) {
        console.warn("Erro ao consultar chamados de chat:", err);
      }
    };

    pollChats();
    const interval = setInterval(pollChats, 3000);
    return () => clearInterval(pollChats);
  }, [currentUser, activeChat]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Hero section for Dashboard */}
      <div className="px-4 md:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Gestão (Local)</h1>
          <p className="text-muted-foreground italic font-light">Performance e métricas estratégicas calculadas do seu banco local.</p>
        </div>
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 self-start sm:self-center shrink-0 shadow-lg shadow-black/10">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Clube de Mensalistas</span>
            <span className={`text-[10px] ${mensalistasConfig.enabled !== false ? 'text-brand-primary' : 'text-rose-400'} font-black uppercase mt-0.5`}>
              {mensalistasConfig.enabled !== false ? 'Ativado' : 'Desativado'}
            </span>
          </div>
          <button
            onClick={toggleMensalistas}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${mensalistasConfig.enabled !== false ? 'bg-brand-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${mensalistasConfig.enabled !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Calculando métricas financeiras...</div>
      ) : (
        <>
          {/* Financial Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
            {currentUser?.role !== 'barber' && (
              <FinancialCard 
                title="Faturamento Local" 
                value={stats.monthlyRevenue} 
                change="+12.5%" 
                trend="up" 
                icon={DollarSign} 
              />
            )}
            {currentUser?.role !== 'barber' && (
              <FinancialCard 
                title="Assinantes Ativos" 
                value={stats.activeSubscribers} 
                change="+2" 
                trend="up" 
                icon={Users} 
              />
            )}
            <FinancialCard 
              title="Ticket Médio" 
              value={stats.averageTicket} 
              change="+3%" 
              trend="up" 
              icon={TrendingUp} 
            />
            <FinancialCard 
              title="Crescimento Estimado" 
              value={stats.monthlyGrowth} 
              icon={TrendingUp} 
            />
          </div>

          {/* Management Quick Access */}
          <div className="px-4 md:px-0 mt-4">
            <SectionHeader title="Gestão Rápida" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Button variant="secondary" className="h-24 flex flex-col gap-2 rounded-2xl bg-card border-white/5 hover:bg-white/10 text-white" onClick={() => onNavigate('management')}>
                <Scissors className="w-6 h-6 text-brand-primary" />
                <span>Barbeiros</span>
              </Button>
              <Button variant="secondary" className="h-24 flex flex-col gap-2 rounded-2xl bg-card border-white/5 hover:bg-white/10 text-white" onClick={() => onNavigate('management')}>
                <Store className="w-6 h-6 text-brand-primary" />
                <span>Serviços</span>
              </Button>
              <Button variant="secondary" className="h-24 flex flex-col gap-2 rounded-2xl bg-card border-white/5 hover:bg-white/10 text-white" onClick={() => onNavigate('management')}>
                <Users className="w-6 h-6 text-brand-primary" />
                <span>Mensalistas</span>
              </Button>
              <Button variant="secondary" className="h-24 flex flex-col gap-2 rounded-2xl bg-card border-white/5 hover:bg-white/10 text-white" onClick={() => onNavigate('bookings')}>
                <Calendar className="w-6 h-6 text-brand-primary" />
                <span>Agenda</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-4 md:px-0">
            <SectionHeader title="Atividade Recente" actionText="Ver Tudo" />
            <div className="mt-6 bg-card border border-white/5 rounded-2xl overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma atividade recente registrada.</div>
              ) : (
                recentTransactions.map((tx, idx) => (
                  <div key={tx.id} className={`flex items-center justify-between p-4 ${idx !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white">
                        {tx.client[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                          {tx.client}
                          {tx.paid_in_advance && (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">
                              💸 Pago Antecipado
                            </span>
                          )}
                          {tx.delay_minutes && (
                            <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-black animate-pulse">
                              ⏱️ Atrasado ({tx.delay_minutes}m)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {currentUser?.role !== 'barber' && (
                        <p className="text-sm font-bold text-white">{tx.value}</p>
                      )}
                      <p className="text-xs text-brand-primary font-medium">{tx.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Central de Chat de Atendimento (Barbeiro / Staff) */}
          {(currentUser?.role === 'barber' || currentUser?.role === 'manager') && (
            <div className="px-4 md:px-0 mt-8">
              <SectionHeader title="Central de Atendimento ao Cliente" />
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* List of Chat Requests */}
                <div className="lg:col-span-1 bg-card border border-white/5 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Chamados Ativos</h3>
                  {chatRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic p-4 text-center">Nenhum chamado de cliente no momento.</p>
                  ) : (
                    <div className="space-y-2">
                      {chatRequests.map(req => {
                        const isActive = activeChat?.id === req.id;
                        return (
                          <div 
                            key={req.id} 
                            className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                              isActive 
                                ? 'bg-blue-600/10 border-blue-500/30' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-white">{req.client_name}</h4>
                                <p className="text-[10px] text-muted-foreground">Solicitado para: {req.barber_name}</p>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                                req.status === 'pending' 
                                  ? 'bg-amber-500/10 text-amber-500 animate-pulse' 
                                  : 'bg-green-500/10 text-green-500'
                              }`}>
                                {req.status === 'pending' ? 'Pendente' : 'Ativo'}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              {req.status === 'pending' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcceptChat(req.id)}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black h-7 rounded-lg"
                                >
                                  Aceitar Conversa
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => setActiveChat(req)}
                                  className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black h-7 rounded-lg"
                                >
                                  {isActive ? 'Conversando...' : 'Abrir Chat'}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Active Chat Conversation Pane */}
                <div className="lg:col-span-2 bg-card border border-white/5 rounded-2xl p-4 flex flex-col h-[320px]">
                  {activeChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {activeChat.client_name}
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          </h3>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            Inatividade em: 
                            <span className={`font-bold ${timeRemaining < 30 ? 'text-rose-500 animate-bounce' : 'text-blue-400'}`}>
                              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                            </span>
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleCloseChat(activeChat.id)}
                          className="h-7 text-[10px] font-black rounded-lg px-3 bg-rose-600 hover:bg-rose-500"
                        >
                          Encerrar
                        </Button>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        {activeChat.messages.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic text-center p-8">Nenhuma mensagem trocada ainda. Envie um "Olá!" para o cliente.</p>
                        ) : (
                          activeChat.messages.map(m => (
                            <div 
                              key={m.id} 
                              className={`flex flex-col max-w-[80%] ${
                                m.sender === 'barber' ? 'ml-auto items-end' : 'mr-auto items-start'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl text-xs ${
                                m.sender === 'barber' 
                                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                                  : 'bg-white/5 text-white border border-white/5 rounded-tl-sm'
                              }`}>
                                {m.text}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Message Input Form */}
                      <form onSubmit={handleSendChatMessage} className="flex gap-2">
                        <Input 
                          placeholder="Digite sua resposta..." 
                          value={chatInputText}
                          onChange={e => setChatInputText(e.target.value)}
                          className="bg-background border-white/5 text-xs text-white h-9 focus:ring-blue-500 animate-none"
                        />
                        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white h-9 rounded-lg px-4 font-bold text-xs">
                          Enviar
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                      <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-3">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">Sem Chat Selecionado</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">Selecione ou aceite um chamado ativo para conversar diretamente com o cliente em tempo real.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
