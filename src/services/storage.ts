import { Service, Doctor, Promotion, BlockedSlot, Appointment, WebhookLog, AppointmentStatus, HeroSlide, MediaAsset } from '../types';
import { 
  INITIAL_SERVICES, 
  INITIAL_DOCTORS, 
  INITIAL_PROMOTIONS, 
  INITIAL_BLOCKED_SLOTS, 
  INITIAL_APPOINTMENTS,
  INITIAL_HERO_SLIDES,
  INITIAL_CLINIC_MEDIA,
  ClinicMediaItem
} from '../data/initialData';

const STORAGE_KEYS = {
  SERVICES: 'scs_services_v3',
  DOCTORS: 'scs_doctors_v3',
  PROMOTIONS: 'scs_promotions_v3',
  BLOCKED_SLOTS: 'scs_blocked_slots_v3',
  APPOINTMENTS: 'scs_appointments_v3',
  WEBHOOK_LOGS: 'scs_webhook_logs_v3',
  ADMIN_AUTH: 'scs_admin_auth_v3',
  HERO_SLIDES: 'scs_hero_slides_v3',
  CLINIC_MEDIA: 'scs_clinic_media_v3',
  PROMOTIONS_SECTION_ENABLED: 'scs_promotions_section_enabled_v3',
};

type Listener = () => void;

class DentalStore {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initDefaultsIfEmpty();
  }

  private initDefaultsIfEmpty() {
    // Sprawdzamy czy usługi są zainicjalizowane lub czy wymagają migracji do DentaNova
    const rawServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!rawServices || rawServices.includes('Przegląd stomatologiczny + plan leczenia')) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }
    const rawDoctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (!rawDoctors || rawDoctors.includes('Michał Zarzycki') || rawDoctors.includes('Karolina Miller') || !rawDoctors.includes('Adam Nowicki') || !rawDoctors.includes('serviceIds')) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROMOTIONS)) {
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(INITIAL_PROMOTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS)) {
      localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(INITIAL_BLOCKED_SLOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WEBHOOK_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.WEBHOOK_LOGS, JSON.stringify([]));
    }
    const rawHeroSlides = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
    if (!rawHeroSlides || rawHeroSlides === '[]') {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    }
    const rawClinicMedia = localStorage.getItem(STORAGE_KEYS.CLINIC_MEDIA);
    if (!rawClinicMedia || rawClinicMedia === '[]') {
      localStorage.setItem(STORAGE_KEYS.CLINIC_MEDIA, JSON.stringify(INITIAL_CLINIC_MEDIA));
    }
    if (localStorage.getItem(STORAGE_KEYS.PROMOTIONS_SECTION_ENABLED) === null) {
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS_SECTION_ENABLED, 'true');
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- SERVICES ---
  public getServices(): Service[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : INITIAL_SERVICES;
  }

  public saveService(service: Service): void {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
    } else {
      services.push(service);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    this.notify();
  }

  public deleteService(id: string): void {
    const services = this.getServices().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    this.notify();
  }

  // --- DOCTORS ---
  public getDoctors(): Doctor[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    const parsed: Doctor[] = raw ? JSON.parse(raw) : INITIAL_DOCTORS;
    return parsed.map((doc) => {
      const initMatch = INITIAL_DOCTORS.find((d) => d.id === doc.id);
      return {
        ...doc,
        isActive: doc.isActive !== false,
        room: doc.room || initMatch?.room || 'Gabinet Stomatologiczny DentaNova',
        slotDurationMinutes: doc.slotDurationMinutes || initMatch?.slotDurationMinutes || 45,
        serviceIds: (doc.serviceIds && doc.serviceIds.length > 0) ? doc.serviceIds : (initMatch?.serviceIds || []),
        scheduleDays: doc.scheduleDays || initMatch?.scheduleDays || {
          'Poniedziałek': { isEnabled: doc.workingDays?.includes('Poniedziałek') ?? true, startTime: doc.workingHoursStart || '09:00', endTime: doc.workingHoursEnd || '18:00', room: doc.room || 'Gabinet 1' },
          'Wtorek': { isEnabled: doc.workingDays?.includes('Wtorek') ?? true, startTime: doc.workingHoursStart || '09:00', endTime: doc.workingHoursEnd || '18:00', room: doc.room || 'Gabinet 1' },
          'Środa': { isEnabled: doc.workingDays?.includes('Środa') ?? true, startTime: doc.workingHoursStart || '09:00', endTime: doc.workingHoursEnd || '18:00', room: doc.room || 'Gabinet 1' },
          'Czwartek': { isEnabled: doc.workingDays?.includes('Czwartek') ?? true, startTime: doc.workingHoursStart || '09:00', endTime: doc.workingHoursEnd || '18:00', room: doc.room || 'Gabinet 1' },
          'Piątek': { isEnabled: doc.workingDays?.includes('Piątek') ?? true, startTime: doc.workingHoursStart || '09:00', endTime: doc.workingHoursEnd || '18:00', room: doc.room || 'Gabinet 1' },
          'Sobota': { isEnabled: doc.workingDays?.includes('Sobota') ?? false, startTime: '09:00', endTime: '14:00', room: doc.room || 'Gabinet 1' },
        },
      };
    });
  }

  public getDoctorsForService(serviceId: string): Doctor[] {
    return this.getDoctors().filter((d) => d.isActive !== false && d.serviceIds?.includes(serviceId));
  }

  public getServicesForDoctor(doctorId: string): Service[] {
    const doc = this.getDoctors().find((d) => d.id === doctorId);
    if (!doc || !doc.serviceIds) return [];
    return this.getServices().filter((s) => s.isActive && doc.serviceIds?.includes(s.id));
  }

  public saveDoctor(doctor: Doctor): void {
    const doctors = this.getDoctors();
    const index = doctors.findIndex((d) => d.id === doctor.id);
    if (index >= 0) {
      doctors[index] = {
        ...doctor,
        isActive: doctor.isActive !== false,
      };
    } else {
      doctors.push({
        ...doctor,
        isActive: doctor.isActive !== false,
      });
    }
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
    this.notify();
  }

  public toggleDoctorVisibility(id: string): void {
    const doctors = this.getDoctors();
    const doc = doctors.find((d) => d.id === id);
    if (doc) {
      doc.isActive = !doc.isActive;
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
      this.notify();
    }
  }

  public deleteDoctor(id: string): void {
    const doctors = this.getDoctors().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
    this.notify();
  }

  // --- PROMOTIONS ---
  public getPromotions(): Promotion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    const parsed: Promotion[] = raw ? JSON.parse(raw) : INITIAL_PROMOTIONS;
    return parsed.map((p) => {
      const initMatch = INITIAL_PROMOTIONS.find((ip) => ip.id === p.id);
      return {
        ...p,
        showInHeroBadge: p.showInHeroBadge !== undefined ? p.showInHeroBadge : (initMatch?.showInHeroBadge ?? (p.id === 'promo-1')),
      };
    });
  }

  public savePromotion(promotion: Promotion): void {
    const promos = this.getPromotions();
    const index = promos.findIndex((p) => p.id === promotion.id);
    if (index >= 0) {
      promos[index] = promotion;
    } else {
      promos.unshift(promotion);
    }
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
    this.notify();
  }

  public togglePromotionHeroBadge(promoId: string): void {
    const promos = this.getPromotions();
    const target = promos.find((p) => p.id === promoId);
    if (target) {
      target.showInHeroBadge = !target.showInHeroBadge;
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
      this.notify();
    }
  }

  public deletePromotion(id: string): void {
    const promos = this.getPromotions().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
    this.notify();
  }

  public isPromotionsSectionEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.PROMOTIONS_SECTION_ENABLED);
    return val !== null ? val === 'true' : true;
  }

  public setPromotionsSectionEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS_SECTION_ENABLED, enabled ? 'true' : 'false');
    this.notify();
  }

  // --- DYNAMIC DOCTOR SLOTS GENERATION & SCHEDULE ---
  public getDoctorDailySlots(doctorId: string, date: string): import('../types').DoctorSlotInfo[] {
    const doctors = this.getDoctors();
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return [];

    const dateObj = new Date(date + 'T12:00:00');
    const dayIndex = dateObj.getDay();
    const polishDays = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dayName = polishDays[dayIndex];

    let isDayActive = false;
    let startH = doctor.workingHoursStart || '09:00';
    let endH = doctor.workingHoursEnd || '18:00';

    if (doctor.scheduleDays && doctor.scheduleDays[dayName]) {
      const dayCfg = doctor.scheduleDays[dayName];
      isDayActive = dayCfg.isEnabled;
      startH = dayCfg.startTime || startH;
      endH = dayCfg.endTime || endH;
    } else {
      isDayActive = doctor.workingDays?.includes(dayName) ?? false;
    }

    if (!isDayActive) {
      return [];
    }

    const interval = doctor.slotDurationMinutes || 45;
    const [sHour, sMin] = startH.split(':').map(Number);
    const [eHour, eMin] = endH.split(':').map(Number);
    const startMinutes = (sHour || 9) * 60 + (sMin || 0);
    const endMinutes = (eHour || 18) * 60 + (eMin || 0);

    const slots: import('../types').DoctorSlotInfo[] = [];
    const appts = this.getAppointments();
    const blockedSlots = this.getBlockedSlots();
    const services = this.getServices();

    for (let m = startMinutes; m + interval <= endMinutes; m += interval) {
      const hh = Math.floor(m / 60).toString().padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      const timeSlot = `${hh}:${mm}`;

      // Rezerwacja
      const bookedAppt = appts.find(
        (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'anulowana'
      );

      if (bookedAppt) {
        const srv = services.find((s) => s.id === bookedAppt.serviceId);
        slots.push({
          timeSlot,
          status: 'booked',
          patientName: bookedAppt.patientName,
          serviceName: srv?.name || 'Wizyta stomatologiczna',
        });
        continue;
      }

      // Blokada
      const block = blockedSlots.find((b) => {
        if (b.doctorId !== doctorId || b.date !== date) return false;
        return timeSlot >= b.startTime && timeSlot < b.endTime;
      });

      if (block) {
        slots.push({
          timeSlot,
          status: 'blocked',
          reason: block.reason,
        });
        continue;
      }

      slots.push({
        timeSlot,
        status: 'available',
      });
    }

    return slots;
  }

  // --- BLOCKED SLOTS ---
  public getBlockedSlots(): BlockedSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS);
    return raw ? JSON.parse(raw) : INITIAL_BLOCKED_SLOTS;
  }

  public addBlockedSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): BlockedSlot {
    const slots = this.getBlockedSlots();
    const newSlot: BlockedSlot = {
      ...slot,
      id: 'blk-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
    };
    slots.push(newSlot);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(slots));
    this.notify();
    return newSlot;
  }

  public createBlockedSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): BlockedSlot {
    return this.addBlockedSlot(slot);
  }

  public deleteBlockedSlot(id: string): void {
    const slots = this.getBlockedSlots().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(slots));
    this.notify();
  }

  // Szybkie wyłączenie pojedynczego slotu z kalendarza (specjalista nie pracuje)
  public removeSlotFromCalendar(doctorId: string, date: string, timeSlot: string, durationMinutes: number = 45, reason: string = 'Brak przyjęć'): void {
    const [h, m] = timeSlot.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endM = (totalMinutes % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    this.addBlockedSlot({
      doctorId,
      date,
      startTime: timeSlot,
      endTime,
      reason,
    });
  }

  // Przywrócenie terminu do kalendarza (specjalista jednak może pracować)
  public restoreSlotToCalendar(doctorId: string, date: string, timeSlot: string): void {
    const slots = this.getBlockedSlots();
    // Filtrujemy blokady pokrywające ten slot
    const updated = slots.filter((b) => {
      if (b.doctorId !== doctorId || b.date !== date) return true;
      // Jeśli blokada obejmuje tę godzinę, usuwamy ją
      return !(timeSlot >= b.startTime && timeSlot < b.endTime);
    });
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(updated));
    this.notify();
  }

  // Przywrócenie wszystkich godzin danego dnia do kalendarza
  public restoreAllDoctorSlotsForDate(doctorId: string, date: string): void {
    const slots = this.getBlockedSlots();
    const updated = slots.filter((b) => !(b.doctorId === doctorId && b.date === date));
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(updated));
    this.notify();
  }

  // Wyłączenie całego dnia z kalendarza dla specjalisty
  public excludeDoctorWholeDayFromCalendar(doctorId: string, date: string, reason: string = 'Urlop'): void {
    this.restoreAllDoctorSlotsForDate(doctorId, date);
    this.addBlockedSlot({
      doctorId,
      date,
      startTime: '07:00',
      endTime: '21:00',
      reason,
    });
  }

  // --- APPOINTMENTS ---
  public getAppointments(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
  }

  public updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string): void {
    const appts = this.getAppointments();
    const target = appts.find((a) => a.id === id);
    if (target) {
      target.status = status;
      if (notes !== undefined) target.notes = notes;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));
      
      this.logWebhook({
        type: 'STATUS_CHANGE',
        title: `Zmiana statusu wizyty ${target.patientName} na: ${status.toUpperCase()}`,
        payload: { appointmentId: id, status, patientPhone: target.patientPhone },
        status: 'delivered'
      });

      this.notify();
    }
  }

  // --- AVAILABILITY CHECK ---
  public checkSlotAvailability(doctorId: string, date: string, timeSlot: string): { available: boolean; reason?: string } {
    const appts = this.getAppointments();
    const isBooked = appts.some(
      (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'anulowana'
    );
    if (isBooked) {
      return { available: false, reason: 'Termin został już zarezerwowany przez innego pacjenta' };
    }

    const blockedSlots = this.getBlockedSlots();
    const isBlocked = blockedSlots.find((b) => {
      if (b.doctorId !== doctorId || b.date !== date) return false;
      // Sprawdzenie przedziału godzinowego
      return timeSlot >= b.startTime && timeSlot < b.endTime;
    });

    if (isBlocked) {
      return { available: false, reason: `Termin zablokowany przez lekarza (${isBlocked.reason})` };
    }

    return { available: true };
  }

  // --- CREATE APPOINTMENT (With D1 Transaction Simulation + Resend + Webhook) ---
  public createAppointment(data: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    serviceId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    isUrgentPain?: boolean;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const availability = this.checkSlotAvailability(data.doctorId, data.date, data.timeSlot);
    if (!availability.available) {
      return { success: false, error: availability.reason };
    }

    const appts = this.getAppointments();
    const newAppointment: Appointment = {
      ...data,
      id: 'apt-' + Math.random().toString(36).substring(2, 9),
      status: 'oczekujaca',
      createdAt: new Date().toISOString(),
      resendEmailStatus: 'wyslany',
      pushDispatched: true,
    };

    appts.unshift(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));

    // Symulacja e-maila transakcyjnego Resend
    this.logWebhook({
      type: 'RESEND_EMAIL',
      title: `Wysłano e-mail potwierdzający do ${data.patientEmail}`,
      payload: {
        to: data.patientEmail,
        subject: `DentaNova: Potwierdzenie przyjęcia zgłoszenia wizyty [${newAppointment.id}]`,
        template: 'transactional-appointment-confirmation',
        date: data.date,
        timeSlot: data.timeSlot,
      },
      status: 'delivered'
    });

    // Powiadomienie push / webhook dla dyżurnego personelu recepcji
    this.logWebhook({
      type: 'NEW_BOOKING_PUSH',
      title: `Nowe zgłoszenie wizyty od ${data.patientName}${data.isUrgentPain ? ' ⚠️ OSTRY BÓL' : ''}`,
      payload: {
        appointmentId: newAppointment.id,
        patientName: data.patientName,
        phone: data.patientPhone,
        date: data.date,
        timeSlot: data.timeSlot,
        isUrgentPain: data.isUrgentPain || false,
      },
      status: 'delivered'
    });

    // Wyzwolenie zdarzenia globalnego dla interfejsu
    window.dispatchEvent(
      new CustomEvent('dentanova:notification', {
        detail: {
          title: 'Nowe zgłoszenie rezerwacji!',
          message: `${data.patientName} zarezerwował termin ${data.date} o ${data.timeSlot}`,
          urgent: data.isUrgentPain,
        },
      })
    );

    this.notify();
    return { success: true, appointment: newAppointment };
  }

  // --- LOGS ---
  public getWebhookLogs(): WebhookLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBHOOK_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public logContactMessage(data: { name: string; email: string; subject: string; message: string }): void {
    this.logWebhook({
      type: 'CONTACT_FORM_SUBMISSION',
      title: `Wiadomość z formularza: ${data.name} (${data.email})`,
      payload: {
        ...data,
        submittedAt: new Date().toISOString(),
      },
      status: 'delivered'
    });
    this.notify();
  }

  private logWebhook(log: Omit<WebhookLog, 'id' | 'timestamp'>) {
    const logs = this.getWebhookLogs();
    logs.unshift({
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_LOGS, JSON.stringify(logs.slice(0, 30)));
  }

  // --- HERO SLIDES ---
  public getHeroSlides(): HeroSlide[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
    if (!raw) return INITIAL_HERO_SLIDES;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HERO_SLIDES;
    } catch {
      return INITIAL_HERO_SLIDES;
    }
  }

  public saveHeroSlide(slide: HeroSlide): void {
    const slides = this.getHeroSlides();
    const index = slides.findIndex((s) => s.id === slide.id);
    if (index >= 0) {
      slides[index] = { ...slide };
    } else {
      slides.push(slide);
    }
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.notify();
  }

  public toggleHeroSlideVisibility(id: string): void {
    const slides = this.getHeroSlides();
    const slide = slides.find((s) => s.id === id);
    if (slide) {
      slide.isActive = !slide.isActive;
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
      this.notify();
    }
  }

  public deleteHeroSlide(id: string): void {
    const slides = this.getHeroSlides().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.notify();
  }

  public resetHeroSlides(): void {
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    this.notify();
  }

  // --- CLINIC FACILITY & BRANDING MEDIA ---
  public getClinicMedia(): ClinicMediaItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLINIC_MEDIA);
    if (!raw) return INITIAL_CLINIC_MEDIA;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLINIC_MEDIA;
    } catch {
      return INITIAL_CLINIC_MEDIA;
    }
  }

  public saveClinicMedia(item: ClinicMediaItem): void {
    const list = this.getClinicMedia();
    const index = list.findIndex((m) => m.id === item.id);
    if (index >= 0) {
      list[index] = { ...item };
    } else {
      list.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.CLINIC_MEDIA, JSON.stringify(list));
    this.notify();
  }

  // --- UNIFIED MEDIA ASSETS CMS (ALL IMAGES ACROSS THE SITE) ---
  public getAllMediaAssets(): MediaAsset[] {
    const assets: MediaAsset[] = [];

    // 1. Sekcja Hero
    const heroSlides = this.getHeroSlides();
    heroSlides.forEach((slide, idx) => {
      assets.push({
        id: `media-hero-${slide.id}`,
        title: slide.title,
        category: 'hero',
        subcategory: slide.specialtyTag,
        imageUrl: slide.imageUrl,
        defaultImageUrl: INITIAL_HERO_SLIDES[idx]?.imageUrl || slide.imageUrl,
        locationLabel: `Sekcja Hero • Slajd #${idx + 1} (${slide.specialtyTag})`,
        dimensionsHint: '16:10 / 16:9 • Poziome HD',
        referenceType: 'hero_slide',
        referenceId: slide.id,
        isActive: slide.isActive,
      });
    });

    // 2. Usługi i Zabiegi
    const services = this.getServices();
    services.forEach((srv) => {
      assets.push({
        id: `media-srv-${srv.id}`,
        title: srv.name,
        category: 'services',
        subcategory: srv.category,
        imageUrl: srv.imageUrl || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=700&auto=format&fit=crop&q=80',
        defaultImageUrl: INITIAL_SERVICES.find((s) => s.id === srv.id)?.imageUrl || srv.imageUrl,
        locationLabel: `Katalog Usług • ${srv.category}`,
        dimensionsHint: '16:10 • Karta cennika & zabiegu',
        referenceType: 'service',
        referenceId: srv.id,
        isActive: srv.isActive,
      });
    });

    // 3. Lekarze i Zespół
    const doctors = this.getDoctors();
    doctors.forEach((doc) => {
      assets.push({
        id: `media-doc-${doc.id}`,
        title: doc.name,
        category: 'doctors',
        subcategory: doc.specialization,
        imageUrl: doc.avatarUrl,
        defaultImageUrl: INITIAL_DOCTORS.find((d) => d.id === doc.id)?.avatarUrl || doc.avatarUrl,
        locationLabel: `Nasz Zespół • Profil: ${doc.title}`,
        dimensionsHint: '1:1 / 4:5 • Portret medyczny',
        referenceType: 'doctor',
        referenceId: doc.id,
        isActive: doc.isActive !== false,
      });
    });

    // 4. Placówka & Gabinety
    const clinicMedia = this.getClinicMedia();
    clinicMedia.forEach((cli) => {
      assets.push({
        id: `media-cli-${cli.id}`,
        title: cli.title,
        category: 'clinic',
        subcategory: cli.locationLabel,
        imageUrl: cli.imageUrl,
        defaultImageUrl: INITIAL_CLINIC_MEDIA.find((c) => c.id === cli.id)?.imageUrl || cli.imageUrl,
        locationLabel: cli.locationLabel,
        dimensionsHint: '16:9 • Placówka i sprzęt DentaNova',
        referenceType: 'clinic_info',
        referenceId: cli.id,
        isActive: true,
      });
    });

    return assets;
  }

  public updateMediaAsset(assetId: string, newImageUrl: string, newTitle?: string): void {
    if (!newImageUrl) return;

    if (assetId.startsWith('media-hero-')) {
      const heroId = assetId.replace('media-hero-', '');
      const slides = this.getHeroSlides();
      const slide = slides.find((s) => s.id === heroId);
      if (slide) {
        slide.imageUrl = newImageUrl;
        if (newTitle) slide.title = newTitle;
        this.saveHeroSlide(slide);
      }
    } else if (assetId.startsWith('media-srv-')) {
      const srvId = assetId.replace('media-srv-', '');
      const services = this.getServices();
      const service = services.find((s) => s.id === srvId);
      if (service) {
        service.imageUrl = newImageUrl;
        if (newTitle) service.name = newTitle;
        this.saveService(service);
      }
    } else if (assetId.startsWith('media-doc-')) {
      const docId = assetId.replace('media-doc-', '');
      const doctors = this.getDoctors();
      const doctor = doctors.find((d) => d.id === docId);
      if (doctor) {
        doctor.avatarUrl = newImageUrl;
        if (newTitle) doctor.name = newTitle;
        this.saveDoctor(doctor);
      }
    } else if (assetId.startsWith('media-cli-')) {
      const cliId = assetId.replace('media-cli-', '');
      const clinicItems = this.getClinicMedia();
      const item = clinicItems.find((c) => c.id === cliId);
      if (item) {
        item.imageUrl = newImageUrl;
        if (newTitle) item.title = newTitle;
        this.saveClinicMedia(item);
      }
    }
    this.notify();
  }

  public resetAllMediaAssets(): void {
    // Przywracamy domyślne grafiki dla usług, lekarzy, slajdów i placówki
    const services = this.getServices().map((s) => {
      const def = INITIAL_SERVICES.find((init) => init.id === s.id);
      return def ? { ...s, imageUrl: def.imageUrl } : s;
    });
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));

    const doctors = this.getDoctors().map((d) => {
      const def = INITIAL_DOCTORS.find((init) => init.id === d.id);
      return def ? { ...d, avatarUrl: def.avatarUrl } : d;
    });
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));

    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    localStorage.setItem(STORAGE_KEYS.CLINIC_MEDIA, JSON.stringify(INITIAL_CLINIC_MEDIA));
    this.notify();
  }

  // --- ADMIN AUTH ---
  public isAdminAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  public setAdminAuthenticated(auth: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, auth ? 'true' : 'false');
    this.notify();
  }

  // --- RESET ---
  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(INITIAL_PROMOTIONS));
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS_SECTION_ENABLED, 'true');
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(INITIAL_BLOCKED_SLOTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    localStorage.setItem(STORAGE_KEYS.CLINIC_MEDIA, JSON.stringify(INITIAL_CLINIC_MEDIA));
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_LOGS, JSON.stringify([]));
    this.notify();
  }
}


export const dentalStore = new DentalStore();
