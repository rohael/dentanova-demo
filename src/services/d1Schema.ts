/**
 * Schemat bazy danych Cloudflare D1 (Serverless SQLite)
 * dla nowoczesnego systemu DentaNova – Klinika Stomatologiczna.
 * 
 * Plik: migrations/0001_initial_schema.sql
 */

export const D1_SCHEMA_SQL = `-- ==========================================================
-- DentaNova – Klinika Stomatologiczna - Cloudflare D1 (SQLite) Schema
-- Migracja: 0001_initial_schema.sql
-- ==========================================================

-- 1. TABELA USŁUG I CENNIKA (HEADLESS CMS)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Zachowawcza', 'Higienizacja', 'Endodoncja', 'Implantologia', 'Ortodoncja', 'Protetyka')),
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price_pln NUMERIC NOT NULL,
    is_popular INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA LEKARZY / PERSONELU
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialization TEXT NOT NULL,
    pwz_number TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    working_days TEXT NOT NULL, -- Format JSON: ["Poniedziałek", "Środa", "Piątek"]
    working_hours_start TEXT NOT NULL DEFAULT '09:00',
    working_hours_end TEXT NOT NULL DEFAULT '17:00',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA OKRESOWYCH PROMOCJI I CMS AKTUALNOŚCI
CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    badge TEXT NOT NULL,
    discount_text TEXT NOT NULL,
    description TEXT,
    promo_code TEXT,
    valid_until DATE NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA ZABLOKOWANYCH TERMINÓW (URLOPY, SZKOLENIA, BLOKADY GODZINOWE)
CREATE TABLE IF NOT EXISTS blocked_slots (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TEXT NOT NULL, -- Format HH:MM
    end_time TEXT NOT NULL,   -- Format HH:MM
    reason TEXT NOT NULL CHECK(reason IN ('Urlop', 'Szkolenie / Konferencja', 'Dyżur chirurgiczny', 'Brak przyjęć')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 5. TABELA REZERWACJI WIZYT PACJENTÓW
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    service_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- Format HH:MM
    status TEXT NOT NULL DEFAULT 'oczekujaca' CHECK(status IN ('oczekujaca', 'potwierdzona', 'zrealizowana', 'anulowana')),
    notes TEXT,
    is_urgent_pain INTEGER NOT NULL DEFAULT 0,
    resend_email_status TEXT DEFAULT 'oczekujacy',
    push_dispatched INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);

-- 6. TABELA LOGÓW POWIADOMIEŃ / WEBHOOKÓW PERSONELU
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    appointment_id TEXT,
    payload_json TEXT,
    delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INDEKSY OPTYMALIZACYJNE DLA SZYBKIEGO WYSZUKIWANIA I DOSTĘPNOŚCI
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_appointments_lookup 
ON appointments(doctor_id, appointment_date, time_slot, status);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_lookup 
ON blocked_slots(doctor_id, blocked_date);

CREATE INDEX IF NOT EXISTS idx_services_active 
ON services(is_active, category);

CREATE INDEX IF NOT EXISTS idx_promotions_active 
ON promotions(is_active, valid_until);
`;
