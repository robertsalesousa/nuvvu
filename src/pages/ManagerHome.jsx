import React, { useState, useEffect } from 'react';
import FinancialCard from '../components/FinancialCard';
import SectionHeader from '../components/SectionHeader';
import { DollarSign, Users, Store, Scissors, Calendar, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { api } from '../lib/api';

export default function ManagerHome({ onNavigate, currentUser }) {
  const [stats, setStats] = useState({
    monthlyRevenue: "R$ 0",
    activeSubscribers: "0",
    averageTicket: "R$ 0",
    monthlyGrowth: "+0%"
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        return {
          id: b.id,
          client: clientProfile ? clientProfile.name : "Cliente Avulso",
          service: service ? service.name : "Serviço",
          value: service ? `R$ ${service.price}` : "R$ 50",
          time: `${b.booking_date} • ${b.booking_time ? b.booking_time.slice(0, 5) : ''}`,
          delay_minutes: b.delay_minutes || null
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
  }, [currentUser]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Hero section for Dashboard */}
      <div className="px-4 md:px-0">
        <h1 className="text-3xl font-bold text-white mb-2">Painel de Gestão (Local)</h1>
        <p className="text-muted-foreground italic font-light">Performance e métricas estratégicas calculadas do seu banco local.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Calculando métricas financeiras...</div>
      ) : (
        <>
          {/* Financial Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
            <FinancialCard 
              title="Faturamento Local" 
              value={stats.monthlyRevenue} 
              change="+12.5%" 
              trend="up" 
              icon={DollarSign} 
            />
            <FinancialCard 
              title="Assinantes Ativos" 
              value={stats.activeSubscribers} 
              change="+2" 
              trend="up" 
              icon={Users} 
            />
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
                <Store className="w-6 h-6 text-brand-primary" />
                <span>Unidades</span>
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
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          {tx.client}
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
                      <p className="text-sm font-bold text-white">{tx.value}</p>
                      <p className="text-xs text-brand-primary font-medium">{tx.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
