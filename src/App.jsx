import React, { useState } from 'react';
import Home from './pages/Home';
import Details from './pages/Details';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ManagerHome from './pages/ManagerHome';
import ManageResources from './pages/ManageResources';
import BookingsList from './pages/BookingsList';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from "@/components/ui/sonner"
import MaxChatbot from './components/MaxChatbot';

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

  const handleLogin = (profile) => {
    setIsTransitioning(true);
    setCurrentUser(profile);
    setLoadingProgress(0);

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
            {currentPage === 'profile' && <Profile onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} key={refreshKey} />}
            
          </div>
        </main>

        <BottomNavigation onNavigate={handleNavigate} currentPage={currentPage} userRole={userRole} />
        <MaxChatbot currentUser={currentUser} onRefresh={handleRefresh} />
      </div>
    </ThemeProvider>
  );
}

export default App;
