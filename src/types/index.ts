export type ServiceCategory = 
  | 'Chirurgia stomatologiczna'
  | 'Chirurgia szczękowo-twarzowa'
  | 'Implanty'
  | 'Stomatologia zachowawcza'
  | 'Endodoncja'
  | 'Stomatologia dziecięca'
  | 'Protetyka'
  | 'Periodontologia'
  | 'Tomografia Komputerowa 3D i RTG'
  | string;

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  pricePln: number;
  imageUrl?: string;
  isPopular?: boolean;
  isActive: boolean;
}

export interface DaySchedule {
  isEnabled: boolean;
  startTime: string; // np. '08:30'
  endTime: string;   // np. '16:00'
  room?: string;      // np. 'Gabinet 1 - Chirurgia'
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  pwzNumber: string;
  avatarUrl: string;
  bio: string;
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  isActive?: boolean; // Czy wyświetlać na stronie (domyślnie: true)
  room?: string; // Domyślny gabinet/unit w DentaNova
  slotDurationMinutes?: number; // Czas trwania pojedynczego slotu w minutach (domyślnie: 45)
  scheduleDays?: Record<string, DaySchedule>; // Szczegółowy grafik na poszczególne dni tygodnia
  serviceIds?: string[]; // Identyfikatory przypisanych usług stomatologicznych wykonywanych przez lekarza
}

export interface DoctorSlotInfo {
  timeSlot: string;
  status: 'available' | 'booked' | 'blocked';
  reason?: string;
  patientName?: string;
  serviceName?: string;
}

export interface Promotion {
  id: string;
  title: string;
  badge: string;
  discountText: string;
  description: string;
  promoCode: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  showInHeroBadge?: boolean; // Czy promocja ma być wyświetlana na górnej etykiecie powitalnej (Hero badge)
}

export interface BlockedSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason: 'Urlop' | 'Szkolenie / Konferencja' | 'Dyżur chirurgiczny' | 'Brak przyjęć' | string;
  createdAt: string;
}

export type AppointmentStatus = 'oczekujaca' | 'potwierdzona' | 'zrealizowana' | 'anulowana';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  serviceId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  status: AppointmentStatus;
  notes?: string;
  isUrgentPain?: boolean;
  createdAt: string;
  resendEmailStatus: 'wyslany' | 'oczekujacy' | 'blad';
  pushDispatched: boolean;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  type: 'NEW_BOOKING_PUSH' | 'RESEND_EMAIL' | 'STATUS_CHANGE' | 'CONTACT_FORM_SUBMISSION';
  title: string;
  payload: Record<string, unknown>;
  status: 'delivered' | 'simulated';
}

export interface HeroSlide {
  id: string;
  specialtyTag: string; // np. 'PROTETYKA', 'CHIRURGIA SZCZĘKOWO-TWARZOWA', 'IMPLANTOLOGIA'
  title: string;
  subtitle: string;
  badge: string;
  floatingBadge: string;
  imageUrl: string;
  serviceCategory?: string; // Kategoria usług do filtrowania przy kliknięciu
  isActive: boolean;
  order: number;
}

export type MediaCategory = 'hero' | 'services' | 'doctors' | 'clinic';

export interface MediaAsset {
  id: string;
  title: string;
  category: MediaCategory;
  subcategory?: string;
  imageUrl: string;
  defaultImageUrl?: string;
  locationLabel: string;
  dimensionsHint?: string;
  referenceType: 'hero_slide' | 'service' | 'doctor' | 'clinic_info';
  referenceId: string;
  isActive?: boolean;
}
