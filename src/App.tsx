import React, { useState, useEffect } from 'react';
import { dentalStore } from './services/storage';
import { Service, Doctor, Promotion, BlockedSlot, Appointment, WebhookLog } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PromotionsSection } from './components/PromotionsSection';
import { ServicesPricing } from './components/ServicesPricing';
import { DoctorsSection } from './components/DoctorsSection';
import { ContactSection } from './components/ContactSection';
import { BookingForm } from './components/BookingForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectureHub } from './components/architecture/ArchitectureHub';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'architecture'>('public');

  // Dane kliniki ze store
  const [services, setServices] = useState<Service[]>(() => dentalStore.getServices());
  const [doctors, setDoctors] = useState<Doctor[]>(() => dentalStore.getDoctors());
  const [promotions, setPromotions] = useState<Promotion[]>(() => dentalStore.getPromotions());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => dentalStore.getBlockedSlots());
  const [appointments, setAppointments] = useState<Appointment[]>(() => dentalStore.getAppointments());
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(() => dentalStore.getWebhookLogs());
  const [isPromotionsSectionEnabled, setIsPromotionsSectionEnabled] = useState<boolean>(() => dentalStore.isPromotionsSectionEnabled());

  // Wybór kontekstowy z cennika / promocji / lekarza
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedDoctor, setPreselectedDoctor] = useState<Doctor | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [preselectedTimeSlot, setPreselectedTimeSlot] = useState<string | null>(null);

  // Subskrypcja na zmiany w reactive store
  useEffect(() => {
    const unsubscribe = dentalStore.subscribe(() => {
      setServices(dentalStore.getServices());
      setDoctors(dentalStore.getDoctors());
      setPromotions(dentalStore.getPromotions());
      setBlockedSlots(dentalStore.getBlockedSlots());
      setAppointments(dentalStore.getAppointments());
      setWebhookLogs(dentalStore.getWebhookLogs());
      setIsPromotionsSectionEnabled(dentalStore.isPromotionsSectionEnabled());
    });
    return unsubscribe;
  }, []);

  // Obsługa routingu hashowego (np. #admin, #architektura)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#architecture' || hash === '#d1' || hash === '#worker') {
        setCurrentView('architecture');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Przewijanie do sekcji rezerwacji
  const scrollToBooking = () => {
    setCurrentView('public');
    setTimeout(() => {
      const el = document.getElementById('rezerwacja');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSelectService = (service: Service) => {
    setPreselectedService(service);
    scrollToBooking();
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setPreselectedDoctor(doctor);
    scrollToBooking();
  };

  const handleSelectPromo = (promo: Promotion) => {
    // Dopasowanie powiązanej usługi jeśli istnieje
    if (promo.id === 'promo-1') {
      const higienizacja = services.find((s) => s.id === 'srv-3');
      if (higienizacja) setPreselectedService(higienizacja);
    } else if (promo.id === 'promo-2') {
      const implantKonsultacja = services.find((s) => s.id === 'srv-6');
      if (implantKonsultacja) setPreselectedService(implantKonsultacja);
    } else if (promo.id === 'promo-3') {
      const wybielanie = services.find((s) => s.id === 'srv-4');
      if (wybielanie) setPreselectedService(wybielanie);
    }
    scrollToBooking();
  };

  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'oczekujaca').length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Pływające powiadomienia Toast */}
      <NotificationToast />

      {/* Górny Pasek Nawigacji */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        pendingCount={pendingAppointmentsCount}
        onBookClick={scrollToBooking}
        showPromotionsLink={isPromotionsSectionEnabled}
      />

      {/* Główna Przestrzeń Widoków */}
      <main className="flex-1">
        {currentView === 'public' && (
          <>
            {/* Sekcja 1: Hero & Trust */}
            <Hero
              onBookClick={scrollToBooking}
              activePromotions={isPromotionsSectionEnabled ? promotions : []}
              onSelectPromo={handleSelectPromo}
            />

            {/* Sekcja 2: Promocje okresowe (CMS) */}
            {isPromotionsSectionEnabled && (
              <PromotionsSection
                promotions={promotions}
                onSelectPromo={handleSelectPromo}
                isEnabled={isPromotionsSectionEnabled}
              />
            )}

            {/* Sekcja 3: Usługi i Cennik z powiązanymi specjalistami */}
            <ServicesPricing
              services={services}
              doctors={doctors}
              onSelectService={handleSelectService}
            />

            {/* Sekcja 4: Zespół Lekarzy i wykonywane zabiegi */}
            <DoctorsSection
              doctors={doctors}
              services={services}
              onSelectDoctor={handleSelectDoctor}
              onSelectService={handleSelectService}
            />

            {/* Sekcja 5: Spójny, minimalistyczny Moduł Rezerwacji Wizyt */}
            <BookingForm
              services={services}
              doctors={doctors}
              preselectedService={preselectedService}
              preselectedDoctor={preselectedDoctor}
              preselectedDate={preselectedDate}
              preselectedTimeSlot={preselectedTimeSlot}
              onSuccess={(apt) => {
                // Po udanej rezerwacji resetujemy zaznaczenie
                setPreselectedService(null);
                setPreselectedDoctor(null);
                setPreselectedDate(null);
                setPreselectedTimeSlot(null);
              }}
            />

            {/* Sekcja 6: Kontakt, Gabinety i Godziny Otwarcia */}
            <ContactSection />
          </>
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            services={services}
            doctors={doctors}
            promotions={promotions}
            blockedSlots={blockedSlots}
            appointments={appointments}
            webhookLogs={webhookLogs}
          />
        )}

        {currentView === 'architecture' && (
          <ArchitectureHub />
        )}
      </main>

      {/* Stopka */}
      <Footer onNav={setCurrentView} />
    </div>
  );
}
