import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper function to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create empty db if doesn't exist
      const initialDb = { profiles: [], services: [], units: [], bookings: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Erro ao ler banco de dados JSON:", error);
    return { profiles: [], services: [], units: [], bookings: [] };
  }
}

// Helper function to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Erro ao gravar no banco de dados JSON:", error);
    return false;
  }
}

// 1. Auth Endpoint (Auto-register or fetch existing user)
app.post('/api/login', (req, res) => {
  const { email, role, name, phone, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const db = readDB();
  let profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

  if (profile) {
    if (name) profile.name = name;
    if (phone) profile.phone = phone;
    if (password) profile.password = password;
    writeDB(db);
    return res.json({ profile, registered: true });
  }

  // Create profile on register/login
  const cleanName = name || email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const newProfile = {
    id: String(Date.now()),
    name: cleanName,
    email: email.toLowerCase(),
    phone: phone || '(11) 98765-4321',
    password: password || 'senha123',
    role: role || 'client',
    subscription: null,
    avatar: null
  };

  db.profiles.push(newProfile);
  writeDB(db);

  return res.status(201).json({ profile: newProfile, registered: false });
});

app.get('/api/profiles', (req, res) => {
  const db = readDB();
  res.json(db.profiles);
});

app.patch('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, avatar } = req.body;

  const db = readDB();
  const profile = db.profiles.find(p => String(p.id) === String(id));

  if (!profile) {
    return res.status(404).json({ error: "Perfil não encontrado." });
  }

  if (name !== undefined) profile.name = name;
  if (email !== undefined) profile.email = email;
  if (phone !== undefined) profile.phone = phone;
  if (avatar !== undefined) profile.avatar = avatar;

  writeDB(db);
  res.json(profile);
});

app.post('/api/profiles/:id/subscribe', (req, res) => {
  const { id } = req.params;
  const { subscription } = req.body;

  const db = readDB();
  const profile = db.profiles.find(p => String(p.id) === String(id));

  if (!profile) {
    return res.status(404).json({ error: "Perfil não encontrado." });
  }

  profile.subscription = subscription || null;
  writeDB(db);

  res.json(profile);
});

// Mensalistas Config Endpoints
app.get('/api/config/mensalistas', (req, res) => {
  const db = readDB();
  const config = db.mensalistas_config || {
    allowed_days: [2, 3, 4, 5, 6], // Tue - Sat
    allowed_hours_start: "09:00",
    allowed_hours_end: "20:00"
  };
  res.json(config);
});

app.post('/api/config/mensalistas', (req, res) => {
  const { allowed_days, allowed_hours_start, allowed_hours_end } = req.body;
  
  const db = readDB();
  db.mensalistas_config = {
    allowed_days: allowed_days || [2, 3, 4, 5, 6],
    allowed_hours_start: allowed_hours_start || "09:00",
    allowed_hours_end: allowed_hours_end || "20:00"
  };
  writeDB(db);
  
  res.json(db.mensalistas_config);
});

// 2. Barbers Endpoints
app.get('/api/barbers', (req, res) => {
  const db = readDB();
  const barbers = db.profiles.filter(p => p.role === 'barber');
  res.json(barbers);
});

app.post('/api/barbers', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
  }

  const db = readDB();
  const newBarber = {
    id: String(Date.now()),
    name,
    email: email.toLowerCase(),
    role: 'barber'
  };

  db.profiles.push(newBarber);
  writeDB(db);

  res.status(201).json(newBarber);
});

// 3. Services Endpoints
app.get('/api/services', (req, res) => {
  const db = readDB();
  res.json(db.services);
});

app.post('/api/services', (req, res) => {
  const { name, price, duration_minutes, description } = req.body;
  if (!name || !price || !duration_minutes) {
    return res.status(400).json({ error: "Nome, preço e duração são obrigatórios." });
  }

  const db = readDB();
  const newService = {
    id: Date.now(),
    name,
    price: Number(price),
    duration_minutes: Number(duration_minutes),
    description: description || ""
  };

  db.services.push(newService);
  writeDB(db);

  res.status(201).json(newService);
});

// 4. Units Endpoints
app.get('/api/units', (req, res) => {
  const db = readDB();
  res.json(db.units);
});

app.post('/api/units', (req, res) => {
  const { name, address, city } = req.body;
  if (!name || !address || !city) {
    return res.status(400).json({ error: "Nome, endereço e cidade são obrigatórios." });
  }

  const db = readDB();
  const newUnit = {
    id: Date.now(),
    name,
    address,
    city
  };

  db.units.push(newUnit);
  writeDB(db);

  res.status(201).json(newUnit);
});

// 5. Bookings Endpoints
app.get('/api/bookings', (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

app.post('/api/bookings', (req, res) => {
  const { client_id, barber_id, service_id, unit_id, booking_date, booking_time } = req.body;
  
  if (!service_id || !booking_date || !booking_time) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = readDB();
  const newBooking = {
    id: Date.now(),
    client_id: client_id || "1", // Default to João Silva if not authenticated
    barber_id: barber_id || null,
    service_id: Number(service_id),
    unit_id: unit_id ? Number(unit_id) : 1,
    booking_date,
    booking_time,
    status: 'confirmed', // Automatic Confirmation by default!
    delay_minutes: null,
    delay_status: null
  };

  db.bookings.push(newBooking);
  writeDB(db);

  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status, booking_date, booking_time, delay_minutes, delay_status } = req.body;

  const db = readDB();
  const booking = db.bookings.find(b => String(b.id) === String(id));

  if (!booking) {
    return res.status(404).json({ error: "Agendamento não encontrado." });
  }

  if (status !== undefined) booking.status = status;
  if (booking_date !== undefined) booking.booking_date = booking_date;
  if (booking_time !== undefined) booking.booking_time = booking_time;
  if (delay_minutes !== undefined) booking.delay_minutes = delay_minutes === null ? null : Number(delay_minutes);
  if (delay_status !== undefined) booking.delay_status = delay_status;

  writeDB(db);

  res.json(booking);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor e Banco de Dados Local rodando em http://localhost:${PORT}`);
});
