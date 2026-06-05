import React, { useState } from 'react';
import Home from './pages/Home';
import Details from './pages/Details';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Subscribe from './pages/Subscribe';
import ManagerHome from './pages/ManagerHome';
import ManageResources from './pages/ManageResources';
import BookingsList from './pages/BookingsList';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from "@/components/ui/sonner"
import MaxChatbot from './components/MaxChatbot';
import { Crown } from 'lucide-react';
import { api } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const userRole = currentUser?.role || null;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const [showAd, setShowAd] = useState(false);

  const handleLogin = async (profile) => {
    setIsTransitioning(true);
    setCurrentUser(profile);
    setLoadingProgress(0);

    let config = null;
    try {
      config = await api.getMensalistasConfig();
    } catch (err) {
      console.warn("Erro ao obter config de mensalistas:", err);
    }

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 40); // Fills to 100% in ~1s

    setTimeout(() => {
      handleNavigate('home');
      setIsTransitioning(false);
      clearInterval(interval);

      // Show promotional ad if client is not subscribed and the club is enabled
      const isClient = profile.role === 'client';
      const isNotSubscribed = !profile.subscription;
      const isClubEnabled = !config || config.enabled !== false;

      if (isClient && isNotSubscribed && isClubEnabled) {
        setShowAd(true);
      }
    }, 1200); // 1.2 seconds sleek transition
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate('login');
  }

  const handleUpdateUser = (updatedProfile) => {
    setCurrentUser(updatedProfile);
  };

  const clientNav = [
    { label: 'Início', id: 'home' },
    { label: 'Agendar', id: 'details' },
    { label: 'Reservas', id: 'bookings' },
    { label: 'Seja um Mensalista', id: 'subscribe' },
    { label: 'Perfil', id: 'profile' }
  ];

  const managerNav = [
    { label: 'Dashboard', id: 'home' }, // Home for manager is ManagerHome
    { label: 'Gestão', id: 'management' },
    { label: 'Agenda', id: 'bookings' },
    { label: 'Perfil', id: 'profile' }
  ];

  const barberNav = [
    { label: 'Dashboard', id: 'home' },
    { label: 'Agenda', id: 'bookings' },
    { label: 'Perfil', id: 'profile' }
  ];

  const currentNav = userRole === 'manager' 
    ? managerNav 
    : userRole === 'barber'
      ? barberNav
      : clientNav;

  if (isTransitioning) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 max-w-xs text-center">
            {/* Powered by logo on top */}
            <div className="h-24 mb-4 flex items-center justify-center opacity-100">
              <img src="/powered.png" alt="Powered by Nivvu" className="h-full object-contain dark:brightness-0 dark:invert animate-cobrand-boot" />
            </div>
            
            {/* Brand Logo with pulse effect */}
            <div className="h-24 w-24 bg-card border border-white/5 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl animate-pulse">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            
            <div className="space-y-1 mt-2">
              <h2 className="text-xl font-bold tracking-widest text-foreground uppercase">N1 BARBER STUDIO</h2>
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">Inicializando sessão...</p>
            </div>
            
            {/* Minimal Modern Sleek Loading Bar */}
            <div className="w-40 h-[3px] bg-secondary rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-foreground transition-all duration-75 ease-out" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (currentPage === 'login') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border shrink-0 sticky top-0 h-screen p-6 bg-background z-20">
          <div className="flex flex-col mb-10">
            <div className="h-12 mb-4 flex items-center justify-start opacity-100">
              <img src="/powered.png" alt="Powered by Nivvu" className="h-full object-contain dark:brightness-0 dark:invert animate-cobrand-boot" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-card border border-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo.png" alt="N1 BARBER STUDIO Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground uppercase">N1 BARBER STUDIO</span>
            </div>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {currentNav.map((item) => (
              <button key={item.id} 
                onClick={() => handleNavigate(item.id)}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentPage === item.id ? 'bg-card text-foreground' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-border">
             <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors text-sm font-medium">Sair da conta</button>
          </div>
        </aside>

        <main className="flex-1 w-full max-full pb-20 md:pb-0 min-h-screen">
          <div className="md:max-w-5xl md:mx-auto md:p-8">
            <div className="md:hidden">
              <Header onNavigate={handleNavigate} onLogout={handleLogout} currentUser={currentUser} />
            </div>
            
            {currentPage === 'home' && (
              (userRole === 'manager' || userRole === 'barber')
                ? <ManagerHome onNavigate={handleNavigate} currentUser={currentUser} key={refreshKey} />
                : <Home onNavigate={handleNavigate} currentUser={currentUser} key={refreshKey} />
            )}
            
            {currentPage === 'management' && <ManageResources key={refreshKey} />}
            {currentPage === 'bookings' && <BookingsList currentUser={currentUser} onNavigate={handleNavigate} key={refreshKey} />}
            {currentPage === 'details' && <Details onNavigate={handleNavigate} currentUser={currentUser} key={refreshKey} />}
            {currentPage === 'subscribe' && <Subscribe onNavigate={handleNavigate} currentUser={currentUser} onUpdateUser={handleUpdateUser} key={refreshKey} />}
            {currentPage === 'profile' && <Profile onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} key={refreshKey} />}
            
          </div>
        </main>

        <BottomNavigation onNavigate={handleNavigate} currentPage={currentPage} userRole={userRole} />
        <MaxChatbot currentUser={currentUser} onRefresh={handleRefresh} />

        {/* Premium Animated Mensalista Ad Modal */}
        {showAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-card border border-brand-primary/20 rounded-3xl p-6 shadow-2xl shadow-brand-primary/5 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              {/* Ambient Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl"></div>
              
              {/* Spinning/pulsing crown container */}
              <div className="relative flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-lg shadow-brand-primary/5 animate-bounce">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-cover absolute opacity-10" />
                  <Crown className="w-8 h-8 text-brand-primary" fill="currentColor" />
                </div>
              </div>

              <div className="text-center space-y-2 relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                  Clube de Assinaturas N1
                </h3>
                <p className="text-xs text-brand-primary font-extrabold uppercase tracking-widest">
                  Seja um Mensalista
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  Pague uma mensalidade fixa e garanta seus cortes de cabelo no mês sem precisar pagar na hora! E mais: cervejas de cortesia, prioridade na agenda e área VIP exclusiva.
                </p>
              </div>

              {/* Quick Pricing Highlights */}
              <div className="grid grid-cols-2 gap-3 my-6 relative z-10">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Plano Silver</span>
                  <p className="text-lg font-black text-white mt-1">R$ 70<span className="text-[10px] font-normal text-muted-foreground">/mês</span></p>
                  <span className="text-[9px] text-brand-primary font-semibold block mt-1">2 Cortes Inclusos</span>
                </div>
                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4 text-center relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-brand-primary text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">VIP</div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Plano Gold</span>
                  <p className="text-lg font-black text-white mt-1">R$ 130<span className="text-[10px] font-normal text-muted-foreground">/mês</span></p>
                  <span className="text-[9px] text-brand-primary font-semibold block mt-1">Cortes Ilimitados</span>
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <button
                  onClick={() => {
                    setShowAd(false);
                    handleNavigate('subscribe');
                  }}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black font-black h-12 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/10 transition-transform active:scale-[0.98] duration-150"
                >
                  Quero Ser Mensalista
                </button>
                <button
                  onClick={() => setShowAd(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Talvez mais tarde
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
