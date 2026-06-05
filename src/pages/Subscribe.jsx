import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, ArrowLeft, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Subscribe({ currentUser, onNavigate, onUpdateUser }) {
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const activeSubscription = currentUser?.subscription || null;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.getMensalistasConfig();
        setConfig(res);
      } catch (err) {
        console.warn("Erro ao obter configurações de mensalistas:", err);
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubscribe = async (plan) => {
    setIsLoadingAction(true);
    try {
      const updatedProfile = await api.subscribe(currentUser.id, plan);
      toast.success(plan 
        ? `Parabéns! Você agora é um mensalista do Plano ${plan.toUpperCase()}! 🎉💈` 
        : 'Sua assinatura foi cancelada com sucesso.'
      );
      if (onUpdateUser) {
        onUpdateUser(updatedProfile);
      }
    } catch (err) {
      console.error("Erro ao alterar assinatura:", err);
      toast.error('Ocorreu um erro ao processar sua assinatura no servidor.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const DAYS_MAP = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado"
  };

  if (isLoadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
        <span className="text-xs uppercase font-bold tracking-wider">Carregando planos...</span>
      </div>
    );
  }

  const isClubDisabled = config?.enabled === false;

  return (
    <div className="flex flex-col w-full pb-24 md:pb-8 animate-in fade-in zoom-in-95 duration-300 px-4 md:px-0">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center py-6 mb-2">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full flex items-center justify-center text-foreground bg-input mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Clube de Assinaturas</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col mb-8 mt-4">
        <h1 className="text-3xl font-bold text-foreground">Clube N1 Barber Studio</h1>
        <p className="text-muted-foreground mt-1">Conheça nossos planos mensais e economize em seus agendamentos.</p>
      </div>

      {isClubDisabled ? (
        <Card className="border-rose-500/20 bg-rose-500/[0.02] p-8 text-center max-w-lg mx-auto mt-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500"></div>
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-2 uppercase">Clube Suspenso</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Clube de Assinaturas para mensalistas está temporariamente desativado pela administração da barbearia. 
            Novas assinaturas ou agendamentos como mensalista não estão disponíveis no momento. 
            Em caso de dúvidas, por favor fale com a nossa equipe.
          </p>
          <Button 
            onClick={() => onNavigate('home')} 
            className="mt-6 bg-white/5 hover:bg-white/10 text-white rounded-xl h-10 text-xs px-6"
          >
            Voltar ao Início
          </Button>
        </Card>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto w-full">
          {/* Active Subscription Status */}
          {activeSubscription && (
            <Card className="border-brand-primary/20 bg-brand-primary/[0.02] overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.01] p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8 text-brand-primary animate-pulse" fill="currentColor" />
                    <div>
                      <CardTitle className="text-white text-lg font-extrabold uppercase">Sua Assinatura Ativa</CardTitle>
                      <CardDescription className="text-xs">
                        Você faz parte do nosso clube de vantagens exclusivo.
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-brand-primary text-black px-2.5 py-1 rounded-full shadow-lg shadow-brand-primary/10 animate-pulse">
                    Plano {activeSubscription}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      {activeSubscription === 'gold' 
                        ? "Plano Gold • Acesso Total Ilimitado" 
                        : "Plano Silver • Pacote 2 Cortes"
                      }
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      {activeSubscription === 'gold' 
                        ? "Seu plano cobre agendamentos ilimitados dentro dos dias e horários permitidos. Aproveite todo o conforto da N1 Barber Studio." 
                        : "Seu plano cobre até 2 agendamentos de cortes por mês dentro dos dias e horários permitidos."
                      }
                    </p>
                  </div>
                  <div className="text-right self-start md:self-center">
                    <span className="text-2xl font-black text-white">
                      {activeSubscription === 'gold' ? 'R$ 130' : 'R$ 70'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold"> /mês</span>
                  </div>
                </div>

                {config && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-card p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} className="text-brand-primary" />
                      <span>
                        Dias permitidos: <strong className="text-white">{config.allowed_days.map(d => DAYS_MAP[d]).join(', ')}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={14} className="text-brand-primary" />
                      <span>
                        Horários permitidos: <strong className="text-white">{config.allowed_hours_start} às {config.allowed_hours_end}</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-muted-foreground">O valor é cobrado mensalmente e pode ser cancelado a qualquer momento.</span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={isLoadingAction}
                    onClick={() => handleSubscribe(null)}
                    className="rounded-xl h-10 font-bold px-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                  >
                    Cancelar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Silver Plan Card */}
            <Card className={`border border-white/5 bg-card overflow-hidden rounded-3xl hover:border-white/10 transition-all flex flex-col justify-between relative ${activeSubscription === 'silver' ? 'ring-2 ring-brand-primary ring-offset-4 ring-offset-background' : ''}`}>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/5 px-2.5 py-1 rounded text-muted-foreground">
                      Plano Silver
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3">2 Cortes no Mês</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">R$ 70</span>
                    <span className="text-[10px] text-muted-foreground font-semibold block">/mês</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                <ul className="space-y-3">
                  {[
                    "2 agendamentos inclusos por mês",
                    "Atendimento preferencial na barbearia",
                    "Válido de terça a sábado",
                    "Agendamento direto pelo aplicativo"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Check size={14} className="text-brand-primary shrink-0" strokeWidth={3} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-white/[0.01] border-t border-white/5 mt-auto">
                {activeSubscription === 'silver' ? (
                  <Button disabled className="w-full bg-brand-primary text-black font-bold h-11 rounded-xl">
                    Seu Plano Atual
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe('silver')} 
                    disabled={isLoadingAction}
                    className="w-full bg-white hover:bg-white/95 text-black font-bold h-11 rounded-xl shadow-lg"
                  >
                    Assinar Plano Silver
                  </Button>
                )}
              </div>
            </Card>

            {/* Gold Plan Card */}
            <Card className={`border-brand-primary/20 bg-brand-primary/[0.02] overflow-hidden rounded-3xl hover:border-brand-primary/30 transition-all flex flex-col justify-between relative ${activeSubscription === 'gold' ? 'ring-2 ring-brand-primary ring-offset-4 ring-offset-background' : ''}`}>
              {/* Premium Glow Badge */}
              <div className="absolute top-3 right-3 bg-brand-primary text-black text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-brand-primary/10">
                Recomendado
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-brand-primary/15 border border-brand-primary/20 px-2.5 py-1 rounded text-brand-primary">
                      Plano Gold
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3">Cortes Ilimitados</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">R$ 130</span>
                    <span className="text-[10px] text-muted-foreground font-semibold block">/mês</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                <ul className="space-y-3">
                  {[
                    "Cortes de cabelo ILIMITADOS",
                    "Cerveja ou chopp de cortesia por visita",
                    "Prioridade máxima na agenda",
                    "10% de desconto em produtos da barbearia",
                    "Acesso à área VIP"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Check size={14} className="text-brand-primary shrink-0" strokeWidth={3} />
                      <span className={i === 0 ? "font-bold text-white" : ""}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-brand-primary/[0.04] border-t border-brand-primary/15 mt-auto">
                {activeSubscription === 'gold' ? (
                  <Button disabled className="w-full bg-brand-primary text-black font-bold h-11 rounded-xl">
                    Seu Plano Atual
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe('gold')} 
                    disabled={isLoadingAction}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black font-bold h-11 rounded-xl shadow-lg shadow-brand-primary/10"
                  >
                    Assinar Plano Gold
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
