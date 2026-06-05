const API_BASE_URL = 'http://localhost:3000/api';

// Fallback mocks if the server is not running
const MOCK_DATA = {
  profiles: [
    { id: 1, name: "Marcos Viana", email: "marcos@n1barberstudio.com", role: "barber" },
    { id: 2, name: "Ricardo Alves", email: "ricardo@n1barberstudio.com", role: "barber" },
  ],
  services: [
    { id: 1, name: "Corte Social", price: 50, duration_minutes: 45, description: "Corte clássico feito na tesoura e máquina." },
    { id: 2, name: "Barba Completa", price: 40, duration_minutes: 30, description: "Acabamento perfeito na toalha quente + massagem." },
    { id: 3, name: "Corte Clássico & Barba", price: 80, duration_minutes: 45, description: "O combo ideal para manter o estilo impecável." }
  ],
  units: [
    { id: 1, name: "N1 BARBER STUDIO - Unidade Central", address: "123 King Street", city: "São Paulo" }
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

  getCustomization: async () => {
    try {
      return await request('/customization');
    } catch {
      if (!MOCK_DATA.customization) {
        MOCK_DATA.customization = {
          welcome_title: "N1 BARBER STUDIO",
          welcome_description: "Bem-vindo à N1 BARBER STUDIO! Oferecemos um conceito premium de barbearia com profissionais altamente qualificados, toalhas quentes, massagem capilar e um atendimento totalmente exclusivo e personalizado para você.",
          address: "123 King Street, SP",
          hours: "Terça a Sábado, 9h às 20h",
          whatsapp: "(11) 98765-4321",
          photos: ["/hero.png"]
        };
      }
      return MOCK_DATA.customization;
    }
  },

  updateCustomization: async (fields) => {
    try {
      return await request('/customization', {
        method: 'POST',
        body: JSON.stringify(fields)
      });
    } catch {
      MOCK_DATA.customization = { ...MOCK_DATA.customization, ...fields };
      return MOCK_DATA.customization;
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
          allowed_hours_end: "20:00",
          enabled: true
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

  addBarber: async (name, email, password = '') => {
    try {
      return await request('/barbers', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
    } catch {
      const newBarber = { id: Date.now(), name, email, password, role: 'barber' };
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

  addBooking: async (serviceId, bookingDate, bookingTime, clientId = "1", barberId = null, unitId = null, paidInAdvance = false) => {
    try {
      return await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          barber_id: barberId,
          service_id: Number(serviceId),
          unit_id: unitId ? Number(unitId) : null,
          booking_date: bookingDate,
          booking_time: bookingTime,
          paid_in_advance: paidInAdvance
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
        status: 'confirmed', // Offline fallback also confirms automatically!
        paid_in_advance: paidInAdvance
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
  },

  getChatRequests: async () => {
    try {
      return await request('/chat-requests');
    } catch {
      if (!MOCK_DATA.chat_requests) MOCK_DATA.chat_requests = [];
      return MOCK_DATA.chat_requests;
    }
  },

  createChatRequest: async (clientId, clientName, barberName) => {
    try {
      return await request('/chat-requests', {
        method: 'POST',
        body: JSON.stringify({ client_id: clientId, client_name: clientName, barber_name: barberName })
      });
    } catch {
      if (!MOCK_DATA.chat_requests) MOCK_DATA.chat_requests = [];
      MOCK_DATA.chat_requests.forEach(r => {
        if (String(r.client_id) === String(clientId) && r.status !== 'closed') {
          r.status = 'closed';
        }
      });
      const newRequest = {
        id: Date.now(),
        client_id: clientId,
        client_name: clientName,
        barber_name: barberName,
        status: 'pending',
        messages: [],
        last_update: Date.now(),
        last_barber_message_time: Date.now()
      };
      MOCK_DATA.chat_requests.push(newRequest);
      return newRequest;
    }
  },

  sendChatMessage: async (chatId, sender, text) => {
    try {
      return await request(`/chat-requests/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({ sender, text })
      });
    } catch {
      if (!MOCK_DATA.chat_requests) MOCK_DATA.chat_requests = [];
      const req = MOCK_DATA.chat_requests.find(r => String(r.id) === String(chatId));
      if (req) {
        const newMsg = { id: Date.now(), sender, text, timestamp: Date.now() };
        req.messages.push(newMsg);
        req.last_update = Date.now();
        if (sender === 'barber') {
          req.last_barber_message_time = Date.now();
        }
        return req;
      }
      return null;
    }
  },

  updateChatRequest: async (chatId, fields) => {
    try {
      return await request(`/chat-requests/${chatId}`, {
        method: 'PATCH',
        body: JSON.stringify(fields)
      });
    } catch {
      if (!MOCK_DATA.chat_requests) MOCK_DATA.chat_requests = [];
      const req = MOCK_DATA.chat_requests.find(r => String(r.id) === String(chatId));
      if (req) {
        Object.assign(req, fields);
        req.last_update = Date.now();
        return req;
      }
      return null;
    }
  }
};
