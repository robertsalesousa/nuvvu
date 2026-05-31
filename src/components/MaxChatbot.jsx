import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Clock, Calendar, AlertTriangle, HelpCircle, Scissors } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const DAYS_MAP = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado"
};

export default function MaxChatbot({ currentUser, onRefresh }) {
  const isClient = currentUser?.role === 'client';
  const isSubscriber = currentUser?.subscription || null;
  
  if (!isClient) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'max', 
      text: `Olá, ${currentUser?.name || 'Cliente'}! Sou o Max, seu assistente da NaRégua. 💈 Como posso te ajudar hoje?` 
    }
  ]);

  // Position state for dragging (absolute coordinates)
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);

  // Chat Machine State
  const [step, setStep] = useState('idle');
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [tempRescheduleDate, setTempRescheduleDate] = useState('');

  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Dragging Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click
    e.preventDefault(); // Prevent text selection/default drag behavior
    setIsDragging(true);
    dragDistance.current = 0;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartOffset.current = { ...position };
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragDistance.current = 0;
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    dragStartOffset.current = { ...position };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);
      
      setPosition({
        x: Math.max(10, dragStartOffset.current.x - deltaX), // drag left increases right offset
        y: Math.max(10, dragStartOffset.current.y - deltaY)  // drag up increases bottom offset
      });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartPos.current.x;
      const deltaY = touch.clientY - dragStartPos.current.y;
      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);
      
      if (e.cancelable) {
        e.preventDefault(); // Prevent page scroll during dragging
      }

      setPosition({
        x: Math.max(10, dragStartOffset.current.x - deltaX),
        y: Math.max(10, dragStartOffset.current.y - deltaY)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleTriggerClick = () => {
    if (dragDistance.current > 5) {
      // Ignore click if they dragged
      return;
    }
    setIsOpen(!isOpen);
  };

  const addMessage = (text, sender, extraData = {}) => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text, ...extraData }]);
  };

  const addMaxMessageWithDelay = (text, extraData = {}) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'max', text, ...extraData }]);
    }, 500);
  };

  const fetchActiveBookings = async () => {
    try {
      const bookings = await api.getBookings();
      const services = await api.getServices();
      
      const clientBookings = bookings.filter(b => 
        String(b.client_id) === String(currentUser?.id) && 
        (b.status === 'pending' || b.status === 'confirmed')
      );

      return clientBookings.map(b => {
        const s = services.find(serv => Number(serv.id) === Number(b.service_id));
        return {
          ...b,
          serviceName: s ? s.name : 'Corte'
        };
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Helper to validate mensalista restrictions
  const validateMensalistaRules = async (dateStr, timeStr) => {
    if (!isSubscriber) return { valid: true };

    try {
      const config = await api.getMensalistasConfig();
      
      // 1. Day restriction check (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();

      if (!config.allowed_days.includes(dayOfWeek)) {
        const allowedDaysNames = config.allowed_days.map(d => DAYS_MAP[d]).join(', ');
        return {
          valid: false,
          reason: `Mensalistas só podem agendar nos seguintes dias: ${allowedDaysNames}. O dia selecionado (${DAYS_MAP[dayOfWeek]}) não é permitido pelo salão.`
        };
      }

      // 2. Hour restriction check
      const formattedTime = timeStr ? timeStr.slice(0, 5) : ''; // Ensure HH:MM
      if (formattedTime && (formattedTime < config.allowed_hours_start || formattedTime > config.allowed_hours_end)) {
        return {
          valid: false,
          reason: `Mensalistas só podem agendar no horário entre ${config.allowed_hours_start} e ${config.allowed_hours_end}.`
        };
      }

      return { valid: true };
    } catch (err) {
      console.warn("Falha ao consultar regras de mensalista:", err);
      return { valid: true }; // bypass on error for user convenience
    }
  };

  const processMessage = async (input) => {
    const cleanInput = input.trim();

    if (step === 'idle') {
      if (cleanInput.includes('endereço') || cleanInput.includes('onde fica') || cleanInput.includes('localização')) {
        addMaxMessageWithDelay("A barbearia The Gentlemen's Lounge fica no endereço: 📍 123 King Street, São Paulo - SP. Esperamos você!");
      } else if (cleanInput.includes('funcionamento') || cleanInput.includes('horas') || cleanInput.includes('aberto')) {
        addMaxMessageWithDelay("Nosso horário de funcionamento é: 📅 Terça a Sábado, das 09h às 20h. Agende seu horário pelo app!");
      } else if (cleanInput.includes('contato') || cleanInput.includes('telefone') || cleanInput.includes('whatsapp')) {
        addMaxMessageWithDelay("Você pode entrar em contato conosco pelo WhatsApp: 📞 (11) 98765-4321.");
      } else {
        addMaxMessageWithDelay("Desculpe, não entendi muito bem. Você pode utilizar os botões de ação ou perguntar sobre 'endereço' e 'funcionamento'.");
      }
    }
  };

  const handleQuickAction = async (action) => {
    if (action === 'cancelar') {
      addMessage("Quero cancelar meu horário", 'user');
      const bookings = await fetchActiveBookings();
      if (bookings.length === 0) {
        addMaxMessageWithDelay("Você não possui nenhum agendamento ativo para cancelar no momento.");
        return;
      }
      addMaxMessageWithDelay("Selecione qual agendamento você deseja cancelar:", { bookings, actionType: 'cancel' });
    }

    if (action === 'remarcar') {
      addMessage("Quero remarcar meu horário", 'user');
      const bookings = await fetchActiveBookings();
      if (bookings.length === 0) {
        addMaxMessageWithDelay("Você não possui nenhum agendamento ativo para remarcar no momento.");
        return;
      }
      addMaxMessageWithDelay("Selecione qual agendamento você deseja alterar:", { bookings, actionType: 'reschedule' });
    }

    if (action === 'atraso') {
      addMessage("Vou me atrasar", 'user');
      const bookings = await fetchActiveBookings();
      if (bookings.length === 0) {
        addMaxMessageWithDelay("Você não possui nenhum agendamento ativo.");
        return;
      }
      addMaxMessageWithDelay("Selecione para qual agendamento você deseja notificar atraso:", { bookings, actionType: 'delay' });
    }

    if (action === 'faqs') {
      addMessage("Ver informações frequentes", 'user');
      addMaxMessageWithDelay("Aqui estão as informações sobre nossa barbearia:\n\n📍 Endereço: 123 King Street, SP\n🕒 Horário: Terça a Sábado, 9h às 20h\n📞 WhatsApp: (11) 98765-4321");
    }
  };

  const handleSelectBooking = async (booking, actionType) => {
    addMessage(`Selecionado: ${booking.serviceName} em ${booking.booking_date}`, 'user');

    if (actionType === 'cancel') {
      try {
        await api.updateBooking(booking.id, { status: 'cancelled' });
        addMaxMessageWithDelay(`Feito! Seu agendamento de "${booking.serviceName}" para ${booking.booking_date} foi CANCELADO com sucesso. 🚫`);
        if (onRefresh) onRefresh();
      } catch (err) {
        addMaxMessageWithDelay("Ocorreu um erro no cancelamento.");
      }
    }

    if (actionType === 'reschedule') {
      setActiveBookingId(booking.id);
      setStep('reschedule_date');
      addMaxMessageWithDelay("Qual a nova data que você prefere? 📅 Selecione ou digite no formato AAAA-MM-DD:", {
        dateSuggestions: [
          { label: 'Amanhã', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
          { label: 'Depois de Amanhã', date: new Date(Date.now() + 172800000).toISOString().split('T')[0] }
        ]
      });
    }

    if (actionType === 'delay') {
      setActiveBookingId(booking.id);
      addMaxMessageWithDelay("Quantos minutos de atraso você estima? ⏱️ Selecione abaixo:", {
        delayMinutesOptions: [10, 15, 20, 30]
      });
    }
  };

  const handleSelectDate = (dateStr) => {
    addMessage(`Data escolhida: ${dateStr}`, 'user');
    setTempRescheduleDate(dateStr);
    setStep('reschedule_time');
    addMaxMessageWithDelay("Qual o novo horário de preferência? 🕒 Escolha abaixo ou digite no formato HH:MM:", {
      timeSuggestions: ['09:00', '10:30', '14:00', '15:30', '17:00', '18:30']
    });
  };

  const handleSelectTime = async (timeStr) => {
    addMessage(`Horário escolhido: ${timeStr}`, 'user');
    
    // Validate Mensalista Limits
    const validation = await validateMensalistaRules(tempRescheduleDate, timeStr);
    if (!validation.valid) {
      addMaxMessageWithDelay(`❌ Agendamento bloqueado! ${validation.reason}`);
      setStep('idle');
      setActiveBookingId(null);
      setTempRescheduleDate('');
      return;
    }

    try {
      await api.updateBooking(activeBookingId, {
        booking_date: tempRescheduleDate,
        booking_time: `${timeStr}:00`
      });
      addMaxMessageWithDelay(`Perfeito! Remarcado para o dia ${tempRescheduleDate} às ${timeStr}. 📅✨`);
      if (onRefresh) onRefresh();
    } catch {
      addMaxMessageWithDelay("Erro ao registrar remarcação no servidor local.");
    }
    setStep('idle');
    setActiveBookingId(null);
    setTempRescheduleDate('');
  };

  const handleSelectDelay = async (minutes) => {
    addMessage(`${minutes} minutos`, 'user');
    try {
      await api.updateBooking(activeBookingId, { 
        delay_minutes: minutes,
        delay_status: 'pending' // Inform the barber of a new delay to review!
      });
      addMaxMessageWithDelay(`Aviso enviado! Notificamos o barbeiro que você irá se atrasar ${minutes} minutos. Ele estará te aguardando! 👍`);
      if (onRefresh) onRefresh();
    } catch {
      addMaxMessageWithDelay("Erro ao atualizar atraso.");
    }
    setStep('idle');
    setActiveBookingId(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    addMessage(userText, 'user');
    setInputText('');

    if (step === 'reschedule_date') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(userText.trim())) {
        handleSelectDate(userText.trim());
      } else {
        addMaxMessageWithDelay("Formato inválido. Digite no formato AAAA-MM-DD:");
      }
    } else if (step === 'reschedule_time') {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (timeRegex.test(userText.trim())) {
        handleSelectTime(userText.trim());
      } else {
        addMaxMessageWithDelay("Formato inválido. Digite no formato HH:MM:");
      }
    } else {
      processMessage(userText.toLowerCase());
    }
  };

  return (
    <div 
      className="fixed z-50 flex flex-col items-end"
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        touchAction: 'none'
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-card/95 border border-white/5 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-black font-bold">
                <Bot size={22} className="text-black" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Max
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </h3>
                <span className="text-[10px] text-muted-foreground">Assistente Virtual NaRégua</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                setStep('idle');
              }}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                <div className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  {m.sender === 'max' && (
                    <div className="h-7 w-7 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0 self-end">
                      <Bot size={15} className="text-brand-primary" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${m.sender === 'user' ? 'bg-white text-black font-medium rounded-tr-sm' : 'bg-white/5 text-white rounded-tl-sm border border-white/5'}`}>
                    {m.text}
                  </div>
                </div>

                {/* 1. Clickable Active Bookings Cards */}
                {m.bookings && m.bookings.length > 0 && (
                  <div className="pl-9 flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {m.bookings.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBooking(b, m.actionType)}
                        className="text-left p-3.5 bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-2xl transition-all flex flex-col gap-1 shadow-sm w-full group"
                      >
                        <span className="font-bold text-white group-hover:text-black text-xs flex items-center gap-1">
                          <Scissors size={12} /> {b.serviceName}
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-black/80 flex items-center gap-1">
                          <Calendar size={11} /> {b.booking_date} • <Clock size={11} /> {b.booking_time ? b.booking_time.slice(0, 5) : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {m.dateSuggestions && (
                  <div className="pl-9 flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {m.dateSuggestions.map(s => (
                      <Button
                        key={s.date}
                        variant="outline"
                        onClick={() => handleSelectDate(s.date)}
                        className="h-8 rounded-xl text-[10px] px-3 font-semibold bg-white/5 border-white/5 hover:bg-brand-primary hover:text-black transition-all text-white"
                      >
                        {s.label} ({s.date ? s.date.slice(5) : ''})
                      </Button>
                    ))}
                  </div>
                )}

                {/* 3. Rescheduling Time Suggestions */}
                {m.timeSuggestions && (
                  <div className="pl-9 grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                    {m.timeSuggestions.map(t => (
                      <Button
                        key={t}
                        variant="outline"
                        onClick={() => handleSelectTime(t)}
                        className="h-8 rounded-xl text-[10px] px-2 font-semibold bg-white/5 border-white/5 hover:bg-brand-primary hover:text-black transition-all text-white"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                )}

                {/* 4. Delay Minutes Selection Chips */}
                {m.delayMinutesOptions && (
                  <div className="pl-9 flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {m.delayMinutesOptions.map(min => (
                      <Button
                        key={min}
                        variant="outline"
                        onClick={() => handleSelectDelay(min)}
                        className="h-9 rounded-xl text-[11px] px-3 font-bold bg-white/5 border-white/5 hover:bg-brand-primary hover:text-black transition-all text-white"
                      >
                        +{min} min
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips (Idle) */}
          {step === 'idle' && (
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden pb-3">
              <button 
                onClick={() => handleQuickAction('remarcar')}
                className="text-[10px] bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-lg px-3 py-1.5 text-white font-medium transition-all flex items-center gap-1"
              >
                <Calendar size={11} /> Alterar horário
              </button>
              <button 
                onClick={() => handleQuickAction('cancelar')}
                className="text-[10px] bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/5 rounded-lg px-3 py-1.5 text-white font-medium transition-all flex items-center gap-1"
              >
                <X size={11} /> Cancelar horário
              </button>
              <button 
                onClick={() => handleQuickAction('atraso')}
                className="text-[10px] bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-lg px-3 py-1.5 text-white font-medium transition-all flex items-center gap-1"
              >
                <Clock size={11} /> Vou me atrasar
              </button>
              <button 
                onClick={() => handleQuickAction('faqs')}
                className="text-[10px] bg-white/5 hover:bg-brand-primary hover:text-black border border-white/5 rounded-lg px-3 py-1.5 text-white font-medium transition-all flex items-center gap-1"
              >
                <HelpCircle size={11} /> Informações
              </button>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white/5 border-t border-white/5 flex gap-2 items-center">
            <Input 
              type="text" 
              placeholder={
                step === 'reschedule_date' ? "AAAA-MM-DD..." :
                step === 'reschedule_time' ? "HH:MM..." : 
                "Digite sua dúvida..."
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="bg-background/50 border-white/5 h-10 text-xs text-white placeholder:text-muted-foreground focus:ring-accent"
            />
            <Button type="submit" size="icon" className="bg-white hover:bg-white/90 text-black rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
              <Send size={14} className="text-black" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Draggable Trigger Button */}
      <button 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleTriggerClick}
        // Removing transition-all while dragging solves coordinate synchronization locks completely!
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl cursor-move border border-brand-primary/20 ${
          isOpen 
            ? 'bg-rose-500 text-white' 
            : 'bg-brand-primary text-white hover:shadow-brand-primary/25 hover:shadow-2xl'
        } ${isDragging ? 'scale-95 opacity-80' : 'hover:scale-105 transition-transform'}`}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Bot size={24} className="text-white stroke-2" />
        )}
      </button>
    </div>
  );
}
