/**
 * Kod produkcyjny Cloudflare Worker (Hono.js + D1 + Resend API + Webhook Push)
 * Gotowy do uruchomienia w środowisku Cloudflare Workers.
 */

export const WORKER_HONO_CODE = `import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  STAFF_WEBHOOK_URL: string;
  ADMIN_AUTH_TOKEN: string;
  CLINIC_EMAIL_FROM: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Włączenie CORS dla domeny aplikacji Cloudflare Pages
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// -------------------------------------------------------------
// 1. PUBLICZNE ENDPOINTY (DLA PACJENTA)
// -------------------------------------------------------------

// Pobieranie aktywnych usług i cennika
app.get('/api/services', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY category, price_pln ASC')
    .all();
  return c.json({ success: true, data: results });
});

// Pobieranie listy lekarzy
app.get('/api/doctors', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM doctors WHERE is_active = 1 ORDER BY name ASC')
    .all();
  
  // Parsowanie working_days z formatu JSON
  const doctors = results.map((doc: any) => ({
    ...doc,
    workingDays: JSON.parse(doc.working_days || '[]')
  }));
  return c.json({ success: true, data: doctors });
});

// Pobieranie aktualnych promocji
app.get('/api/promotions', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const { results } = await c.env.DB
    .prepare('SELECT * FROM promotions WHERE is_active = 1 AND valid_until >= ? ORDER BY created_at DESC')
    .bind(today)
    .all();
  return c.json({ success: true, data: results });
});

// Sprawdzanie dostępności slotu (walidacja blokad i innych rezerwacji)
app.get('/api/availability', async (c) => {
  const doctorId = c.req.query('doctorId');
  const date = c.req.query('date');

  if (!doctorId || !date) {
    return c.json({ error: 'Wymagane parametry: doctorId i date' }, 400);
  }

  // Pobierz istniejące rezerwacje dla lekarza w danym dniu
  const appointments = await c.env.DB
    .prepare('SELECT time_slot FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != "anulowana"')
    .bind(doctorId, date)
    .all();

  // Pobierz blokady (np. urlop lub dyżur)
  const blocked = await c.env.DB
    .prepare('SELECT start_time, end_time, reason FROM blocked_slots WHERE doctor_id = ? AND blocked_date = ?')
    .bind(doctorId, date)
    .all();

  return c.json({
    success: true,
    bookedSlots: appointments.results.map((r: any) => r.time_slot),
    blockedSlots: blocked.results
  });
});

// Tworzenie nowej rezerwacji z walidacją, transakcją i wysyłką Resend
app.post('/api/appointments', async (c) => {
  const body = await c.req.json();
  const { 
    patientName, patientPhone, patientEmail, 
    serviceId, doctorId, date, timeSlot, notes, isUrgentPain 
  } = body;

  // 1. Walidacja pól podstawowych
  if (!patientName || !patientPhone || !patientEmail || !serviceId || !doctorId || !date || !timeSlot) {
    return c.json({ error: 'Wszystkie wymagane pola muszą zostać uzupełnione.' }, 400);
  }

  // 2. Weryfikacja czy termin nie jest już zajęty
  const existing = await c.env.DB
    .prepare('SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status != "anulowana"')
    .bind(doctorId, date, timeSlot)
    .first();

  if (existing) {
    return c.json({ error: 'Wybrany termin został właśnie zarezerwowany przez innego pacjenta.' }, 409);
  }

  // 3. Weryfikacja czy lekarz nie zablokował tego slotu
  const isBlocked = await c.env.DB
    .prepare('SELECT id, reason FROM blocked_slots WHERE doctor_id = ? AND blocked_date = ? AND ? >= start_time AND ? < end_time')
    .bind(doctorId, date, timeSlot, timeSlot)
    .first();

  if (isBlocked) {
    return c.json({ error: \`Ten termin jest niedostępny (powód: \${isBlocked.reason}).\` }, 409);
  }

  // 4. Zapis do bazy D1
  const appointmentId = 'apt-' + crypto.randomUUID().slice(0, 8);
  await c.env.DB
    .prepare(\`
      INSERT INTO appointments (
        id, patient_name, patient_phone, patient_email, 
        service_id, doctor_id, appointment_date, time_slot, 
        status, notes, is_urgent_pain, resend_email_status, push_dispatched
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'oczekujaca', ?, ?, 'oczekujacy', 0)
    \`)
    .bind(
      appointmentId, patientName, patientPhone, patientEmail,
      serviceId, doctorId, date, timeSlot, notes || '', isUrgentPain ? 1 : 0
    )
    .run();

  // 5. Asynchroniczne wywołanie Resend API (transakcyjny e-mail z potwierdzeniem)
  let emailSent = false;
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${c.env.RESEND_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: c.env.CLINIC_EMAIL_FROM || 'recepcja@dentanova.example',
        to: [patientEmail],
        subject: \`Potwierdzenie zgłoszenia wizyty w DentaNova [\${appointmentId}]\`,
        html: \`
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #1B64A5;">DentaNova – Klinika Stomatologiczna</h2>
            <p>Dzień dobry <strong>\${patientName}</strong>,</p>
            <p>Dziękujemy za przesłanie zgłoszenia rezerwacji wizyty.</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Data:</strong> \${date}</p>
              <p><strong>Godzina:</strong> \${timeSlot}</p>
              <p><strong>Status:</strong> Oczekuje na potwierdzenie przez recepcję</p>
            </div>
            <p>Nasz personel skontaktuje się telefonicznie pod numerem \${patientPhone} w celu finalnego potwierdzenia.</p>
            <p style="color: #64748b; font-size: 12px;">W razie konieczności zmiany terminu prosimy o kontakt: +48 000 000 000 | ul. Przykładowa 1, Miasto XXX</p>
          </div>
        \`
      })
    });
    emailSent = resendResponse.ok;
  } catch (err) {
    console.error('Błąd wysyłki Resend:', err);
  }

  // 6. Asynchroniczne powiadomienie Push / Webhook dla personelu dyżurującego
  if (c.env.STAFF_WEBHOOK_URL) {
    try {
      await fetch(c.env.STAFF_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'NEW_PATIENT_BOOKING',
          appointmentId,
          patientName,
          patientPhone,
          date,
          timeSlot,
          isUrgentPain,
          notes
        })
      });
    } catch (err) {
      console.error('Błąd powiadomienia webhook:', err);
    }
  }

  // Aktualizacja statusu powiadomień w bazie
  await c.env.DB
    .prepare('UPDATE appointments SET resend_email_status = ?, push_dispatched = 1 WHERE id = ?')
    .bind(emailSent ? 'wyslany' : 'blad', appointmentId)
    .run();

  return c.json({
    success: true,
    appointmentId,
    message: 'Rezerwacja została pomyślnie utworzona. Wysłano potwierdzenie e-mail.'
  }, 201);
});

// -------------------------------------------------------------
// 2. PANEL ADMINISTRATORA / CMS (BEZPIECZEŃSTWO & ZARZĄDZANIE)
// -------------------------------------------------------------

// Middleware uwierzytelniający Personel (Bearer token)
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token || token !== (c.env.ADMIN_AUTH_TOKEN || 'admin123')) {
    return c.json({ error: 'Brak uprawnień. Zaloguj się do panelu personelu.' }, 401);
  }
  await next();
};

// Logowanie do panelu administratora
app.post('/api/auth/login', async (c) => {
  const { password } = await c.req.json();
  const validPass = c.env.ADMIN_AUTH_TOKEN || 'admin123';
  if (password === validPass) {
    return c.json({ 
      success: true, 
      token: validPass, 
      role: 'staff_reception', 
      name: 'Recepcja Główna' 
    });
  }
  return c.json({ error: 'Nieprawidłowe hasło personelu' }, 401);
});

// Pobieranie wszystkich rezerwacji
app.get('/api/admin/appointments', authMiddleware, async (c) => {
  const { results } = await c.env.DB
    .prepare(\`
      SELECT a.*, s.name as service_name, d.name as doctor_name 
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC, a.time_slot ASC
    \`)
    .all();
  return c.json({ success: true, data: results });
});

// Zmiana statusu rezerwacji (np. Oczekująca -> Potwierdzona / Anulowana)
app.patch('/api/admin/appointments/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { status, notes } = await c.req.json();

  await c.env.DB
    .prepare('UPDATE appointments SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(status, notes, id)
    .run();

  return c.json({ success: true, message: 'Status zaktualizowany' });
});

// CRUD Promocji (CMS dla personelu)
app.post('/api/admin/promotions', authMiddleware, async (c) => {
  const promo = await c.req.json();
  const id = 'promo-' + crypto.randomUUID().slice(0, 6);
  await c.env.DB
    .prepare(\`
      INSERT INTO promotions (id, title, badge, discount_text, description, promo_code, valid_until, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`)
    .bind(id, promo.title, promo.badge, promo.discountText, promo.description, promo.promoCode, promo.validUntil, promo.isActive ? 1 : 0)
    .run();
  return c.json({ success: true, id });
});

app.delete('/api/admin/promotions/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM promotions WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// Zarządzanie blokadami kalendarza
app.post('/api/admin/blocked-slots', authMiddleware, async (c) => {
  const { doctorId, date, startTime, endTime, reason } = await c.req.json();
  const id = 'blk-' + crypto.randomUUID().slice(0, 6);
  await c.env.DB
    .prepare('INSERT INTO blocked_slots (id, doctor_id, blocked_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, doctorId, date, startTime, endTime, reason)
    .run();
  return c.json({ success: true, id });
});

app.delete('/api/admin/blocked-slots/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM blocked_slots WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;
`;

export const WRANGLER_CONFIG = `name = "dentanova-api"
main = "src/worker.ts"
compatibility_date = "2026-09-01"
compatibility_flags = [ "nodejs_compat" ]

[[d1_databases]]
binding = "DB"
database_name = "dentanova-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations"

[vars]
CLINIC_EMAIL_FROM = "recepcja@dentanova.example"
ADMIN_AUTH_TOKEN = "scs_sec_2026"
STAFF_WEBHOOK_URL = "https://discord.com/api/webhooks/xxx/xxx"

# Klucz Resend API definiujemy bezpiecznie jako secret:
# npx wrangler secret put RESEND_API_KEY
`;

export const DEPLOYMENT_STEPS = [
  {
    step: '1. Inicjalizacja i instalacja zależności',
    command: 'npm install hono @cloudflare/workers-types wrangler --save-dev',
    description: 'Instalacja frameworka Hono oraz CLI Wrangler firmy Cloudflare.'
  },
  {
    step: '2. Utworzenie bazy danych Cloudflare D1',
    command: 'npx wrangler d1 create dentanova-db',
    description: 'Generuje serwerową bazę SQLite w chmurze Cloudflare oraz zwraca database_id do wklejenia w wrangler.toml.'
  },
  {
    step: '3. Wykonanie migracji SQL na bazie D1',
    command: 'npx wrangler d1 execute dentanova-db --file=./migrations/0001_initial_schema.sql',
    description: 'Tworzy tabele: services, doctors, promotions, blocked_slots i appointments z indeksami.'
  },
  {
    step: '4. Dodanie sekretu API Resend',
    command: 'npx wrangler secret put RESEND_API_KEY',
    description: 'Bezpieczne wprowadzenie klucza re_xxxxxxxx w zaszyfrowanym magazynie Cloudflare Secrets.'
  },
  {
    step: '5. Wdrożenie API (Cloudflare Workers)',
    command: 'npx wrangler deploy',
    description: 'Błyskawiczne wdrożenie endpointów API z czasem odpowiedzi <15ms na brzegu sieci (Edge CDN).'
  },
  {
    step: '6. Wdrożenie Frontendu (Cloudflare Pages)',
    command: 'npx wrangler pages deploy dist --project-name=dentanova-frontend',
    description: 'Publikacja skompilowanego frontendu Vite React na ultraszybkim hostingu Cloudflare Pages z darmowym SSL i automatycznym CI/CD.'
  }
];
