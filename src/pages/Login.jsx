import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from "sonner";

export default function Login({ onLogin }) {
  const [role, setRole] = useState('client');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login Form States
  const [email, setEmail] = useState('joao.silva@exemplo.com');
  const [password, setPassword] = useState('senha123');

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if(newRole === 'client') {
      setEmail('joao.silva@exemplo.com');
      setPassword('senha123');
    } else {
      setEmail('gestor@barberpro.com');
      setPassword('admin1234');
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Registration Flow
        const profile = await api.login(email, role, registerName, registerPhone, password);
        toast.success(`Cadastro realizado! Bem-vindo(a), ${profile.name}! 🎉`);
        onLogin(profile);
      } else {
        // Standard Login Flow
        const profile = await api.login(email, role);
        toast.success(`Login efetuado como ${profile.role === 'client' ? 'Cliente' : 'Barbeiro/Gestor'}!`);
        onLogin(profile);
      }
    } catch (err) {
      console.error("Erro no fluxo de autenticação local:", err);
      toast.warning("Erro de conexão. Efetuando login local temporário.");
      onLogin({ 
        id: String(Date.now()), 
        name: isRegisterMode ? registerName : email.split('@')[0], 
        email, 
        phone: isRegisterMode ? registerPhone : '(11) 98765-4321',
        role 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative selection:bg-primary selection:text-primary-foreground">
      
      {/* Decorative Branding Section */}
      <div className="hidden md:flex md:w-1/2 bg-card border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <div className="h-12 flex items-center justify-start opacity-100">
            <img src="/powered.png" alt="Powered by Nivvu" className="h-full object-contain dark:brightness-0 dark:invert animate-cobrand-boot" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-card border border-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="N1 BARBER STUDIO Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground uppercase">N1 BARBER STUDIO</span>
          </div>
        </div>
        <div className="relative z-10 max-w-sm mt-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Gestão inteligente e experiência premium.
          </h1>
          <p className="text-muted-foreground text-lg">
            O padrão ouro para barbearias de alto nível e clientes exigentes.
          </p>
        </div>
      </div>

      {/* Login Container */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-24 relative w-full min-h-screen md:min-h-0 py-12 md:py-0">
        
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="md:hidden flex flex-col items-center justify-center mb-10 gap-3">
            <div className="h-12 flex items-center justify-center opacity-100">
              <img src="/powered.png" alt="Powered by Nivvu" className="h-full object-contain dark:brightness-0 dark:invert animate-cobrand-boot" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-card border border-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo.png" alt="N1 BARBER STUDIO Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground uppercase">N1 BARBER STUDIO</span>
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {isRegisterMode ? "Criar nova conta" : "Bem-vindo de volta"}
            </h2>
            <p className="text-muted-foreground">
              {isRegisterMode 
                ? "Preencha os campos abaixo para se cadastrar." 
                : "Insira suas credenciais para acessar sua conta."
              }
            </p>
          </div>

          {!isRegisterMode && (
            <Tabs value={role} onValueChange={handleRoleChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-input rounded-xl mb-6 h-auto">
                <TabsTrigger value="client" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-muted-foreground py-2.5">
                  Sou Cliente
                </TabsTrigger>
                <TabsTrigger value="barber" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-muted-foreground py-2.5 flex gap-2 justify-center items-center">
                  <Scissors size={16} />
                  Sou Barbeiro / Gestor
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {isRegisterMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="registerName" className="text-foreground">Nome Completo</Label>
                  <Input 
                    id="registerName" 
                    type="text" 
                    placeholder="Ex: João da Silva"
                    value={registerName} 
                    onChange={e => setRegisterName(e.target.value)} 
                    required 
                    className="h-12 bg-card border-border" 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPhone" className="text-foreground">Celular (com DDD)</Label>
                  <Input 
                    id="registerPhone" 
                    type="tel" 
                    placeholder="Ex: (11) 98765-4321"
                    value={registerPhone} 
                    onChange={e => setRegisterPhone(e.target.value)} 
                    required 
                    className="h-12 bg-card border-border" 
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="h-12 bg-card border-border" 
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                {!isRegisterMode && <a href="#" className="text-sm font-medium text-accent hover:underline">Esqueceu a senha?</a>}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="h-12 bg-card border-border" 
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold text-primary-foreground shadow-xl rounded-xl mt-4 bg-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (isRegisterMode ? "Cadastrando..." : "Entrando...") : (isRegisterMode ? "Cadastrar" : "Entrar")}
            </Button>
          </form>

          {/* Toggle Register Mode */}
          <div className="text-center">
            <button 
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                // Clear fields
                if (isRegisterMode) {
                  setEmail('joao.silva@exemplo.com');
                  setPassword('senha123');
                } else {
                  setEmail('');
                  setPassword('');
                }
              }}
              className="text-sm text-accent hover:underline font-medium focus:outline-none"
            >
              {isRegisterMode ? "Já tem uma conta? Entre agora" : "Não tem uma conta? Cadastre-se gratuitamente"}
            </button>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Termos de Serviço</a> e{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
