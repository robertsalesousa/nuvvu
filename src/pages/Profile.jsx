import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Phone, Lock, Camera, ArrowLeft, LogOut, Crown, Check } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Profile({ currentUser, onNavigate, onLogout, onUpdateUser }) {
  const isClient = currentUser?.role === 'client';
  const activeSubscription = currentUser?.subscription || null;
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Usuário N1 BARBER STUDIO',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '(11) 98765-4321',
    avatar: currentUser?.avatar || ''
  });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updated = await api.updateProfile(currentUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      toast.success('Perfil atualizado com sucesso no seu banco local! 💾');
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordOpen(false);
    toast.success('Senha alterada com sucesso!');
  };

  // Avatar Upload Handlers
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (keep Base64 string relatively compact for database.json, under 2MB)
    if (file.size > 2097152) {
      toast.error("Por favor, selecione uma imagem menor que 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setIsLoading(true);
      try {
        await api.updateProfile(currentUser.id, { avatar: base64String });
        setFormData(prev => ({ ...prev, avatar: base64String }));
        toast.success("Foto de perfil atualizada com sucesso!");
        if (onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            avatar: base64String
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar foto de perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubscribe = async (plan) => {
    setIsLoading(true);
    try {
      await api.subscribe(currentUser.id, plan);
      toast.success(plan 
        ? `Parabéns! Você assinou o Plano ${plan.toUpperCase()} e agora é Mensalista! 🎉` 
        : 'Assinatura cancelada com sucesso.'
      );
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          subscription: plan
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar assinatura.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-8 animate-in fade-in zoom-in-95 duration-300 px-4 md:px-0">
      
      <div className="md:hidden flex items-center justify-between py-6 mb-2">
        <div className="flex items-center">
          <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full flex items-center justify-center text-foreground bg-input mr-4">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
        </div>
        <button 
          onClick={onLogout} 
          className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>

      <div className="hidden md:flex flex-col mb-8 mt-4">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas configurações, assinatura de mensalista e preferências.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              
              {/* Profile Image with File Uploader Overlay */}
              <div 
                className="relative mb-4 group cursor-pointer overflow-hidden rounded-full h-32 w-32 border-4 border-background shadow-xl"
                onClick={handleAvatarClick}
              >
                <Avatar className="h-full w-full">
                  <AvatarImage src={formData.avatar || "/avatar.png"} className="object-cover h-full w-full" />
                  <AvatarFallback className="text-4xl">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 rounded-full flex gap-2 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                  <span className="text-xs text-white font-medium">Trocar Foto</span>
                </div>
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />

              <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
              
              {activeSubscription ? (
                <div className="mt-2 flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <Crown size={14} fill="currentColor" />
                  <span>Mensalista {activeSubscription}</span>
                </div>
              ) : (
                <p className="text-sm text-accent font-medium mt-1 uppercase tracking-widest">
                  {isClient ? 'Cliente Premium' : 'Conta Gestor'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* MENSALISTA / SUBSCRIPTION SECTION */}
          {isClient && (
            <Card className="border-brand-primary/20 bg-brand-primary/[0.02] overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex gap-2 items-center text-white">
                      <Crown className="text-brand-primary" fill="currentColor" />
                      Clube de Assinaturas (Mensalista)
                    </CardTitle>
                    <CardDescription>
                      Pague uma mensalidade e tenha agendamentos cobertos sem pagar nada a mais no dia!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {activeSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/20">
                      <Crown className="w-10 h-10 text-brand-primary" fill="currentColor" />
                      <div>
                        <h4 className="text-white font-bold text-base uppercase">Você é um Assinante {activeSubscription}!</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activeSubscription === 'gold' 
                            ? "Plano Gold • Cortes Ilimitados e prioridade máxima na barbearia."
                            : "Plano Silver • 2 Cortes inclusos por mês com agendamento facilitado."
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                      <span>Valor da mensalidade: {activeSubscription === 'gold' ? 'R$ 130/mês' : 'R$ 70/mês'}</span>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        disabled={isLoading}
                        onClick={() => handleSubscribe(null)}
                        className="rounded-lg h-9 font-bold px-4"
                      >
                        Cancelar Assinatura
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Silver Plan Card */}
                    <div className="bg-card border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-white/5 px-2 py-1 rounded text-muted-foreground">Plano Silver</span>
                          <span className="text-lg font-black text-white">R$ 70 <span className="text-[10px] font-medium text-muted-foreground">/mês</span></span>
                        </div>
                        <h4 className="text-white font-bold text-sm">2 Cortes inclusos</h4>
                        <ul className="text-xs text-muted-foreground space-y-1.5">
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> 2 cortes por mês</li>
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Atendimento preferencial</li>
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Agendamento pelo app</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleSubscribe('silver')}
                        disabled={isLoading}
                        className="mt-6 w-full bg-white hover:bg-white/90 text-black font-bold rounded-xl"
                      >
                        Assinar Silver
                      </Button>
                    </div>

                    {/* Gold Plan Card */}
                    <div className="bg-card border border-brand-primary/20 rounded-2xl p-5 hover:border-brand-primary/30 transition-all flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-primary/10 rounded-full blur-xl group-hover:bg-brand-primary/20 transition-all"></div>
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black tracking-wider uppercase bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">Plano Gold 👑</span>
                          <span className="text-lg font-black text-brand-primary">R$ 130 <span className="text-[10px] font-medium text-muted-foreground">/mês</span></span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Cortes Ilimitados</h4>
                        <ul className="text-xs text-muted-foreground space-y-1.5">
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Cortes ilimitados/mês</li>
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Barba incluída</li>
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Prioridade máxima na agenda</li>
                          <li className="flex items-center gap-1.5"><Check size={12} className="text-brand-primary" /> Massagem capilar</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleSubscribe('gold')}
                        disabled={isLoading}
                        className="mt-6 w-full bg-brand-primary hover:bg-brand-primary/95 text-black font-black rounded-xl relative z-10 shadow-lg shadow-brand-primary/10"
                      >
                        Assinar Gold
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize os dados básicos da sua conta aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="pl-10" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="pl-10" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/40 py-4 mt-2">
              <p className="text-xs text-muted-foreground flex-1">Esses dados são visíveis apenas para você e pro salão.</p>
              <Button onClick={handleSaveProfile} className="shrink-0 transition-transform hover:scale-[0.98]">Salvar Alterações</Button>
            </CardFooter>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Proteja sua conta utilizando uma senha forte.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Senha da Conta</h4>
                  <p className="text-sm text-muted-foreground">Última alteração ocorreu há 3 meses.</p>
                </div>
                
                <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Lock size={16} />
                      Alterar Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Alterar Sua Senha</DialogTitle>
                      <DialogDescription>
                        Crie uma nova senha forte contendo letras, números e símbolos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current">Senha Atual</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new">Nova Senha</Label>
                        <Input id="new" type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm">Confirmar Nova Senha</Label>
                        <Input id="confirm" type="password" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancelar</Button>
                      <Button type="submit" onClick={handlePasswordChange}>Atualizar Senha</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
