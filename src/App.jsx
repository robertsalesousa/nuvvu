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
import ColorCustomizer from './components/ColorCustomizer';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from "@/components/ui/sonner"
import MaxChatbot from './components/MaxChatbot';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const userRole = currentUser?.role || null;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (profile) => {
    setCurrentUser(profile);
    handleNavigate('home');
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
    { label: 'Explorar', id: 'explore' },
    { label: 'Reservas', id: 'bookings' },
    { label: 'Perfil', id: 'profile' }
  ];

  const managerNav = [
    { label: 'Dashboard', id: 'home' }, // Home for manager is ManagerHome
    { label: 'Gestão', id: 'management' },
    { label: 'Agenda', id: 'bookings' },
    { label: 'Perfil', id: 'profile' }
  ];

  const currentNav = userRole === 'manager' ? managerNav : clientNav;

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
      <ColorCustomizer />
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border shrink-0 sticky top-0 h-screen p-6 bg-background z-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-black font-bold text-xl">B</div>
            <span className="font-bold text-xl tracking-tight text-foreground">NaRégua</span>
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
              userRole === 'manager' 
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
