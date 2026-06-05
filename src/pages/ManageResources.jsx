import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, Scissors, MapPin, MoreVertical, Crown, Clock, Calendar, Check } from "lucide-react";
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

export default function ManageResources() {
  const [activeTab, setActiveTab] = useState("barbers");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form States
  const [barberForm, setBarberForm] = useState({ name: '', email: '', password: '', status: 'Ativo' });
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '45' });
  const [unitForm, setUnitForm] = useState({ name: '', address: '', city: 'São Paulo' });
  const [customizationForm, setCustomizationForm] = useState({
    welcome_title: '',
    welcome_description: '',
    address: '',
    hours: '',
    whatsapp: ''
  });
  const [photos, setPhotos] = useState([]);

  // Core Data States
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [units, setUnits] = useState([]);
  
  // Mensalistas States
  const [mensalistas, setMensalistas] = useState([]);
  const [mensalistasConfig, setMensalistasConfig] = useState({
    allowed_days: [2, 3, 4, 5, 6], // Ter, Qua, Qui, Sex, Sáb
    allowed_hours_start: "09:00",
    allowed_hours_end: "20:00",
    enabled: true
  });

  // Fetch Data from Local API
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Barbers
      const dbBarbers = await api.getBarbers();
      setBarbers(dbBarbers.map(b => ({
        id: b.id,
        name: b.name,
        email: b.email,
        status: 'Ativo'
      })));

      // 2. Fetch Services
      const dbServices = await api.getServices();
      setServices(dbServices.map(s => ({
        id: s.id,
        name: s.name,
        price: String(s.price),
        duration: `${s.duration_minutes} min`
      })));

      // 3. Fetch Units
      const dbUnits = await api.getUnits();
      setUnits(dbUnits.map(u => ({
        id: u.id,
        name: u.name,
        address: u.address,
        city: u.city
      })));

      // 4. Fetch Profiles (filter for mensalistas)
      const allProfiles = await api.getProfiles();
      const dbMensalistas = allProfiles.filter(p => p.subscription !== null && p.subscription !== undefined);
      setMensalistas(dbMensalistas);

      // 5. Fetch Mensalistas Config
      const config = await api.getMensalistasConfig();
      setMensalistasConfig(config);

      // 6. Fetch Customization Config
      const customConfig = await api.getCustomization();
      setCustomizationForm({
        welcome_title: customConfig.welcome_title,
        welcome_description: customConfig.welcome_description,
        address: customConfig.address,
        hours: customConfig.hours,
        whatsapp: customConfig.whatsapp
      });
      setPhotos(customConfig.photos || []);

    } catch (err) {
      console.error("Erro ao carregar dados do Localhost Server:", err);
      toast.error("Erro ao sincronizar com o banco de dados. Usando fallback offline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "barbers") {
        const added = await api.addBarber(barberForm.name, barberForm.email, barberForm.password);
        setBarbers(prev => [...prev, { id: added.id, name: added.name, email: added.email, status: 'Ativo' }]);
        toast.success(`Barbeiro ${barberForm.name} adicionado no localhost!`);
        setBarberForm({ name: '', email: '', password: '', status: 'Ativo' });

      } else if (activeTab === "services") {
        const added = await api.addService(serviceForm.name, serviceForm.price, serviceForm.duration);
        setServices(prev => [...prev, { id: added.id, name: added.name, price: String(added.price), duration: `${added.duration_minutes} min` }]);
        toast.success(`Serviço ${serviceForm.name} adicionado no localhost!`);
        setServiceForm({ name: '', price: '', duration: '45' });

      } else if (activeTab === "units") {
        const added = await api.addUnit(unitForm.name, unitForm.address, unitForm.city);
        setUnits(prev => [...prev, { id: added.id, name: added.name, address: added.address, city: added.city }]);
        toast.success(`Unidade ${unitForm.name} adicionada no localhost!`);
        setUnitForm({ name: '', address: '', city: 'São Paulo' });
      }

      setIsDialogOpen(false);
      loadData(); // Sync with backend

    } catch (error) {
      console.error("Erro ao salvar recurso local:", error);
      toast.error("Erro ao conectar com o banco de dados local.");
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento (Localhost)</h1>
          <p className="text-muted-foreground">Administre seus recursos salvando no banco local.</p>
        </div>
        {activeTab !== "mensalistas" && activeTab !== "customization" && (
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-white text-black hover:bg-white/90 rounded-xl gap-2 font-bold px-6"
          >
            <Plus size={18} /> Novo
          </Button>
        )}
      </div>

      <Tabs defaultValue="barbers" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-white/5 p-1 h-12 rounded-2xl w-fit">
          <TabsTrigger value="barbers" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-black">Barbeiros</TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-black">Serviços</TabsTrigger>
          <TabsTrigger value="mensalistas" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-black">Mensalistas</TabsTrigger>
          <TabsTrigger value="customization" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-black">Personalização</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Carregando dados do localhost:3000...
            </div>
          ) : (
            <>
              <TabsContent value="barbers" className="flex flex-col gap-4">
                {barbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhum barbeiro cadastrado.</div>
                ) : (
                  barbers.map(barber => (
                    <ResourceItem key={barber.id} icon={User} title={barber.name} subtitle={barber.email} tag={barber.status} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="services" className="flex flex-col gap-4">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhum serviço cadastrado.</div>
                ) : (
                  services.map(service => (
                    <ResourceItem key={service.id} icon={Scissors} title={service.name} subtitle={`${service.duration} • R$ ${service.price}`} />
                  ))
                )}
              </TabsContent>


              <TabsContent value="mensalistas" className="flex flex-col gap-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left column: List of Mensalistas */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col gap-1 mb-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Crown className="text-brand-primary" size={20} fill="currentColor" />
                        Clientes Mensalistas Ativos ({mensalistas.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">Clientes que possuem um plano de assinatura recorrente ativo.</p>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      {mensalistas.length === 0 ? (
                        <div className="text-center py-12 bg-card/30 border border-white/5 rounded-2xl text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <Crown size={32} className="text-white/20 animate-pulse" />
                          <span>Nenhum cliente mensalista ativo no momento.</span>
                        </div>
                      ) : (
                        mensalistas.map(m => (
                          <div key={m.id} className="flex items-center justify-between p-4 bg-card/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/5 bg-white/5 shrink-0 flex items-center justify-center">
                                {m.avatar ? (
                                  <img src={m.avatar} alt={m.name} className="object-cover h-full w-full" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-sm font-bold text-white bg-white/5">
                                    {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm flex items-center gap-1.5">
                                  {m.name}
                                  <span className="text-[10px] uppercase font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Crown size={10} fill="currentColor" /> {m.subscription}
                                  </span>
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{m.email} • {m.phone || 'Sem telefone'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2.5 py-1 rounded-lg uppercase tracking-wider font-black">Ativo</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right column: Scheduling Restriction Config */}
                  <div className="lg:col-span-1">
                    <div className="bg-card border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl"></div>
                      
                      <div className="space-y-1 relative z-10">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                          <Clock className="text-brand-primary" size={18} />
                          Regras de Limitação
                        </h3>
                        <p className="text-xs text-muted-foreground">Limite os dias e horários que mensalistas podem agendar.</p>
                      </div>

                      <hr className="border-white/5" />

                      {/* Toggle status of mensalistas */}
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 relative z-10">
                        <div className="space-y-0.5">
                          <Label className="text-xs text-white font-bold">Clube de Mensalistas</Label>
                          <p className="text-[10px] text-muted-foreground">Ativar/Desativar contratação e regras de mensalistas</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMensalistasConfig(prev => ({ ...prev, enabled: prev.enabled === false ? true : false }));
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${mensalistasConfig.enabled !== false ? 'bg-brand-primary' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${mensalistasConfig.enabled !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Day Selectors */}
                      <div className="space-y-3">
                        <Label className="text-xs text-white font-bold flex items-center gap-1.5">
                          <Calendar size={14} className="text-brand-primary" />
                          Dias Permitidos para Mensalistas
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Dom", value: 0 },
                            { label: "Seg", value: 1 },
                            { label: "Ter", value: 2 },
                            { label: "Qua", value: 3 },
                            { label: "Qui", value: 4 },
                            { label: "Sex", value: 5 },
                            { label: "Sáb", value: 6 }
                          ].map(d => {
                            const isSelected = mensalistasConfig.allowed_days.includes(d.value);
                            return (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => {
                                  const newDays = isSelected
                                    ? mensalistasConfig.allowed_days.filter(day => day !== d.value)
                                    : [...mensalistasConfig.allowed_days, d.value];
                                  setMensalistasConfig({ ...mensalistasConfig, allowed_days: newDays });
                                }}
                                className={`h-10 rounded-xl text-[10px] font-black uppercase transition-all ${
                                  isSelected
                                    ? 'bg-brand-primary text-black font-black shadow-lg shadow-brand-primary/10'
                                    : 'bg-background hover:bg-background/80 text-muted-foreground border border-white/5'
                                }`}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hour Inputs */}
                      <div className="space-y-3">
                        <Label className="text-xs text-white font-bold flex items-center gap-1.5">
                          <Clock size={14} className="text-brand-primary" />
                          Intervalo de Horário Permitido
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-semibold">Início</span>
                            <Input
                              type="time"
                              value={mensalistasConfig.allowed_hours_start}
                              onChange={e => setMensalistasConfig({ ...mensalistasConfig, allowed_hours_start: e.target.value })}
                              className="bg-background border-white/5 h-11 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-semibold">Término</span>
                            <Input
                              type="time"
                              value={mensalistasConfig.allowed_hours_end}
                              onChange={e => setMensalistasConfig({ ...mensalistasConfig, allowed_hours_end: e.target.value })}
                              className="bg-background border-white/5 h-11 text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-white/5" />

                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            const updated = await api.updateMensalistasConfig(mensalistasConfig);
                            setMensalistasConfig(updated);
                            toast.success("Regras de limitação de agendamento de mensalistas atualizadas com sucesso! 💈💾");
                          } catch {
                            toast.error("Erro ao salvar regras no banco local.");
                          }
                        }}
                        className="w-full bg-white hover:bg-white/95 text-black font-bold h-11 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[0.99] transition-transform"
                      >
                        <Check size={16} strokeWidth={3} />
                        Salvar Regras
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customization" className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Form Settings */}
                  <div className="lg:col-span-2 space-y-6 bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
                    <div>
                      <h3 className="text-lg font-bold text-white">Configurações Gerais</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Customize as informações públicas exibidas para seus clientes na home e no chatbot.</p>
                    </div>
                    <hr className="border-white/5" />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="welcome-title">Título de Boas-vindas</Label>
                        <Input 
                          id="welcome-title" 
                          value={customizationForm.welcome_title}
                          onChange={e => setCustomizationForm({ ...customizationForm, welcome_title: e.target.value })}
                          className="bg-background border-white/5 h-11 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcome-desc">Descrição / Biografia</Label>
                        <textarea
                          id="welcome-desc"
                          rows={4}
                          value={customizationForm.welcome_description}
                          onChange={e => setCustomizationForm({ ...customizationForm, welcome_description: e.target.value })}
                          className="w-full bg-background border border-white/5 rounded-lg text-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço Físico</Label>
                          <Input 
                            id="address" 
                            value={customizationForm.address}
                            onChange={e => setCustomizationForm({ ...customizationForm, address: e.target.value })}
                            className="bg-background border-white/5 h-11 text-white text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hours">Horário de Funcionamento</Label>
                          <Input 
                            id="hours" 
                            value={customizationForm.hours}
                            onChange={e => setCustomizationForm({ ...customizationForm, hours: e.target.value })}
                            className="bg-background border-white/5 h-11 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp de Contato</Label>
                        <Input 
                          id="whatsapp" 
                          value={customizationForm.whatsapp}
                          onChange={e => setCustomizationForm({ ...customizationForm, whatsapp: e.target.value })}
                          className="bg-background border-white/5 h-11 text-white text-sm"
                        />
                      </div>

                      <Button 
                        onClick={async () => {
                          try {
                            await api.updateCustomization({
                              ...customizationForm,
                              photos
                            });
                            toast.success("Personalização geral do aplicativo salva com sucesso! 💾💈");
                          } catch {
                            toast.error("Erro ao salvar personalização.");
                          }
                        }}
                        className="bg-white text-black hover:bg-white/90 font-bold h-11 rounded-xl px-6"
                      >
                        Salvar Informações
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Photos Manager */}
                  <div className="lg:col-span-1 space-y-6 bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
                    <div>
                      <h3 className="text-lg font-bold text-white">Fotos do Espaço</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Adicione fotos reais da sua barbearia para o banner rotativo.</p>
                    </div>
                    <hr className="border-white/5" />

                    <div className="space-y-4">
                      {/* Photo Upload Box */}
                      <div 
                        onClick={() => document.getElementById('shop-photo-upload').click()}
                        className="h-28 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-primary/40 transition-colors bg-white/[0.01]"
                      >
                        <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-white font-semibold">Adicionar Foto</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Tamanho máx: 2MB</span>
                        <input 
                          type="file" 
                          id="shop-photo-upload"
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2097152) {
                              toast.error("Por favor, selecione uma imagem menor que 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = reader.result;
                              const updatedPhotos = [base64, ...photos].slice(0, 3);
                              setPhotos(updatedPhotos);
                              try {
                                await api.updateCustomization({
                                  ...customizationForm,
                                  photos: updatedPhotos
                                });
                                toast.success("Foto do espaço adicionada e salva! 📸");
                              } catch {
                                toast.error("Falha ao salvar fotos.");
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>

                      {/* Photo Previews */}
                      <div className="space-y-3 mt-4">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Galeria ({photos.length})</span>
                        {photos.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground">Nenhuma foto adicionada ainda.</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {photos.map((p, idx) => (
                              <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-white/5 group">
                                <img src={p} alt="Shop" className="w-full h-full object-cover" />
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const filtered = photos.filter((_, i) => i !== idx);
                                    setPhotos(filtered);
                                    try {
                                      await api.updateCustomization({
                                        ...customizationForm,
                                        photos: filtered
                                      });
                                      toast.success("Foto removida da galeria.");
                                    } catch {
                                      toast.error("Falha ao salvar fotos.");
                                    }
                                  }}
                                  className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 rounded-lg p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                                >
                                  Remover
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Dynamic Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border border-white/5 rounded-2xl sm:max-w-[425px] text-white">
          <form onSubmit={handleAddResource}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">
                {activeTab === "barbers" && "Novo Barbeiro"}
                {activeTab === "services" && "Novo Serviço"}
                {activeTab === "units" && "Nova Unidade"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {activeTab === "barbers" && "Adicione um profissional para realizar os agendamentos."}
                {activeTab === "services" && "Cadastre um novo serviço e defina preço e duração."}
                {activeTab === "units" && "Registre uma nova filial ou unidade física."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {activeTab === "barbers" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="barber-name">Nome Completo</Label>
                    <Input 
                      id="barber-name" 
                      placeholder="Ex: Marcos Viana" 
                      value={barberForm.name} 
                      onChange={e => setBarberForm(prev => ({ ...prev, name: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barber-email">E-mail Profissional</Label>
                    <Input 
                      id="barber-email" 
                      type="email" 
                      placeholder="Ex: marcos@n1barberstudio.com" 
                      value={barberForm.email} 
                      onChange={e => setBarberForm(prev => ({ ...prev, email: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barber-password">Senha de Acesso</Label>
                    <Input 
                      id="barber-password" 
                      type="password" 
                      placeholder="Senha do profissional" 
                      value={barberForm.password || ''} 
                      onChange={e => setBarberForm(prev => ({ ...prev, password: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === "services" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Nome do Serviço</Label>
                    <Input 
                      id="service-name" 
                      placeholder="Ex: Corte Degradê" 
                      value={serviceForm.name} 
                      onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-price">Preço (R$)</Label>
                      <Input 
                        id="service-price" 
                        type="number" 
                        placeholder="Ex: 50" 
                        value={serviceForm.price} 
                        onChange={e => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                        required 
                        className="bg-background border-white/5 h-11 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-duration">Duração (Minutos)</Label>
                      <Input 
                        id="service-duration" 
                        type="number" 
                        placeholder="Ex: 45" 
                        value={serviceForm.duration} 
                        onChange={e => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                        required 
                        className="bg-background border-white/5 h-11 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "units" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="unit-name">Nome da Unidade</Label>
                    <Input 
                      id="unit-name" 
                      placeholder="Ex: Unidade Centro" 
                      value={unitForm.name} 
                      onChange={e => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit-address">Endereço</Label>
                    <Input 
                      id="unit-address" 
                      placeholder="Ex: Rua das Flores, 100" 
                      value={unitForm.address} 
                      onChange={e => setUnitForm(prev => ({ ...prev, address: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit-city">Cidade</Label>
                    <Input 
                      id="unit-city" 
                      placeholder="Ex: São Paulo" 
                      value={unitForm.city} 
                      onChange={e => setUnitForm(prev => ({ ...prev, city: e.target.value }))}
                      required 
                      className="bg-background border-white/5 h-11 text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-xl font-bold px-6">
                Salvar Recurso
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResourceItem({ icon: Icon, title, subtitle, tag }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-white group-hover:text-brand-primary" />
        </div>
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {tag && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded-md">{tag}</span>}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <MoreVertical size={16} />
        </Button>
      </div>
    </div>
  );
}
