const API_BASE_URL = 'http://localhost:3000/api';

// Fallback mocks if the server is not running
const MOCK_DATA = {
  profiles: [
    { id: 1, name: "Marcos Viana", email: "marcos@naregua.com", role: "barber" },
    { id: 2, name: "Ricardo Alves", email: "ricardo@naregua.com", role: "barber" },
  ],
  services: [
    { id: 1, name: "Corte Social", price: 50, duration_minutes: 45, description: "Corte clássico feito na tesoura e máquina." },
    { id: 2, name: "Barba Completa", price: 40, duration_minutes: 30, description: "Acabamento perfeito na toalha quente + massagem." },
    { id: 3, name: "Corte Clássico & Barba", price: 80, duration_minutes: 45, description: "O combo ideal para manter o estilo impecável." }
  ],
  units: [
    { id: 1, name: "Unidade Centro", address: "Rua das Flores, 100", city: "São Paulo" },
    { id: 2, name: "Unidade Jardins", address: "Av. Paulista, 1500", city: "São Paulo" }
  ],
  bookings: []
};

// Safe request wrapper that falls back to mock data if fetch fails
async function request(path, options = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[Local Server API] Falha na requisição para ${path}. Usando fallback local. Motivo:`, error.message);
    throw error; // Let the caller handle the fallback locally
  }
}

export const api = {
  login: async (email, role, name = '', phone = '', password = '') => {
    try {
      const data = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, role, name, phone, password })
      });
      return data.profile;
    } catch {
      // Mock Fallback
      return { 
        id: String(Date.now()), 
        name: name || email.split('@')[0], 
        email, 
        phone: phone || '(11) 98765-4321', 
        role,
        subscription: null,
        avatar: null
      };
    }
  },

  updateProfile: async (id, fields) => {
    try {
      return await request(`/profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields)
      });
    } catch {
      const profile = MOCK_DATA.profiles.find(p => String(p.id) === String(id));
      if (profile) {
        Object.assign(profile, fields);
        return profile;
      }
      return { id, ...fields };
    }
  },

  getMensalistasConfig: async () => {
    try {
      return await request('/config/mensalistas');
    } catch {
      // Offline fallback config
      if (!MOCK_DATA.mensalistas_config) {
        MOCK_DATA.mensalistas_config = {
          allowed_days: [2, 3, 4, 5, 6],
          allowed_hours_start: "09:00",
          allowed_hours_end: "20:00"
        };
      }
      return MOCK_DATA.mensalistas_config;
    }
  },

  updateMensalistasConfig: async (config) => {
    try {
      return await request('/config/mensalistas', {
        method: 'POST',
        body: JSON.stringify(config)
      });
    } catch {
      MOCK_DATA.mensalistas_config = config;
      return config;
    }
  },

  getProfiles: async () => {
    try {
      return await request('/profiles');
    } catch {
      return MOCK_DATA.profiles;
    }
  },

  subscribe: async (profileId, plan) => {
    try {
      return await request(`/profiles/${profileId}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ subscription: plan })
      });
    } catch {
      const profile = MOCK_DATA.profiles.find(p => String(p.id) === String(profileId));
      if (profile) {
        profile.subscription = plan;
        return profile;
      }
      return { id: profileId, subscription: plan };
    }
  },

  getBarbers: async () => {
    try {
      return await request('/barbers');
    } catch {
      return MOCK_DATA.profiles;
    }
  },

  addBarber: async (name, email) => {
    try {
      return await request('/barbers', {
        method: 'POST',
        body: JSON.stringify({ name, email })
      });
    } catch {
      const newBarber = { id: Date.now(), name, email, role: 'barber' };
      MOCK_DATA.profiles.push(newBarber);
      return newBarber;
    }
  },

  getServices: async () => {
    try {
      return await request('/services');
    } catch {
      return MOCK_DATA.services;
    }
  },

  addService: async (name, price, durationMinutes, description = '') => {
    try {
      return await request('/services', {
        method: 'POST',
        body: JSON.stringify({ name, price, duration_minutes: durationMinutes, description })
      });
    } catch {
      const newService = { id: Date.now(), name, price: Number(price), duration_minutes: Number(durationMinutes), description };
      MOCK_DATA.services.push(newService);
      return newService;
    }
  },

  getUnits: async () => {
    try {
      return await request('/units');
    } catch {
      return MOCK_DATA.units;
    }
  },

  addUnit: async (name, address, city) => {
    try {
      return await request('/units', {
        method: 'POST',
        body: JSON.stringify({ name, address, city })
      });
    } catch {
      const newUnit = { id: Date.now(), name, address, city };
      MOCK_DATA.units.push(newUnit);
      return newUnit;
    }
  },

  getBookings: async () => {
    try {
      return await request('/bookings');
    } catch {
      return MOCK_DATA.bookings;
    }
  },

  addBooking: async (serviceId, bookingDate, bookingTime, clientId = "1", barberId = null, unitId = null) => {
    try {
      return await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          barber_id: barberId,
          service_id: Number(serviceId),
          unit_id: unitId ? Number(unitId) : null,
          booking_date: bookingDate,
          booking_time: bookingTime
        })
      });
    } catch {
      const newBooking = {
        id: Date.now(),
        client_id: clientId,
        barber_id: barberId,
        service_id: Number(serviceId),
        unit_id: unitId ? Number(unitId) : null,
        booking_date: bookingDate,
        booking_time: bookingTime,
        status: 'confirmed' // Offline fallback also confirms automatically!
      };
      MOCK_DATA.bookings.push(newBooking);
      return newBooking;
    }
  },

  updateBooking: async (id, fields) => {
    try {
      return await request(`/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields)
      });
    } catch {
      const booking = MOCK_DATA.bookings.find(b => String(b.id) === String(id));
      if (booking) {
        Object.assign(booking, fields);
        return booking;
      }
      return { id, ...fields };
    }
  }
};
