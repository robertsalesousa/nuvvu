import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import TopCategories from '../components/TopCategories';
import SectionHeader from '../components/SectionHeader';
import SalonCard from '../components/SalonCard';
import UpcomingAppointment from '../components/UpcomingAppointment';
import { api } from '../lib/api';

export default function Home({ onNavigate, currentUser }) {
  const userRole = currentUser?.role || 'client';
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUpcomingBooking = async () => {
      if (userRole !== 'client') return;
      setIsLoading(true);
      try {
        const bookings = await api.getBookings();
        // Filter active bookings for this user
        const clientBookings = bookings.filter(b => 
          String(b.client_id) === String(currentUser?.id) && 
          (b.status === 'pending' || b.status === 'confirmed')
        );

        if (clientBookings.length > 0) {
          // Sort chronologically
          const sorted = clientBookings.sort((a, b) => 
            new Date(`${a.booking_date}T${a.booking_time}`) - new Date(`${b.booking_date}T${b.booking_time}`)
          );
          setUpcomingBooking(sorted[0]);
        } else {
          setUpcomingBooking(null);
        }
      } catch (err) {
        console.warn("Erro ao buscar próximo agendamento:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingBooking();
  }, [currentUser, userRole]);

  return (
    <div className="flex flex-col">
      {/* Note: Desktop Header is now positioned structurally above Home in App.jsx */}

      <div className="px-4 md:px-0 md:mt-4">
        {userRole === 'client' && (
          <UpcomingAppointment 
            booking={upcomingBooking} 
            isLoading={isLoading} 
            onNavigate={onNavigate} 
          />
        )}
        
        <SearchBar />
      </div>
      
      <div className="mt-8 mb-8">
        <SectionHeader title="Categorias em Alta" actionText="Ver Todas" />
        <TopCategories />
      </div>
      
      <div className="mb-4">
        <SectionHeader title="Melhores Barbearias" actionText="Ver Mais" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          <SalonCard 
            name="The Gentlemen's Lounge" 
            address="123 King Street, SP" 
            rating="4.9" 
            image="/hero.png" 
            onClick={() => onNavigate('details')}
          />
          <SalonCard 
            name="Classic Cuts Barbershop" 
            address="45 Queen Ave, SP" 
            rating="4.7" 
            image="/hero.png" 
            onClick={() => onNavigate('details')}
          />
        </div>
      </div>
    </div>
  );
}
