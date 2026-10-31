import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  X, 
  BellRing,
  ArrowRight,
  Info,
  UserCheck
} from 'lucide-react';
import { Service, Doctor, Appointment } from '../types';
import { dentalStore } from '../services/storage';

interface BookingFormProps {
  services: Service[];
  doctors: Doctor[];
  preselectedService?: Service | null;
  preselectedDoctor?: Doctor | null;
  preselectedDate?: string | null;
  preselectedTimeSlot?: string | null;
  onSuccess: (appointment: Appointment) => void;
}

const DEFAULT_TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00', 
  '13:00', '13:45', '14:30', '15:15', '16:00', '16:45'
];

export const BookingForm: React.FC<BookingFormProps> = ({
  services,
  doctors,
  preselectedService,
  preselectedDoctor,
  preselectedDate,
  preselectedTimeSlot,
  onSuccess,
}) => {
  // Format jutrzejszej daty jako domyślnej
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(preselectedDate || tomorrow);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(preselectedTimeSlot || '');
  
  // Dane pacjenta
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isUrgentPain, setIsUrgentPain] = useState<boolean>(false);

  // Stany formularza
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);
  const [showResendPreviewModal, setShowResendPreviewModal] = useState<boolean>(false);

  const availableServices = useMemo(() => services.filter(s => s.isActive), [services]);
  const availableDoctors = useMemo(() => doctors.filter(d => d.isActive !== false), [doctors]);

  // Lekarze posiadający kwalifikacje i powiązanie z wybraną usługą
  const qualifiedDoctors = useMemo(() => {
    if (!selectedServiceId) return availableDoctors;
    const matched = availableDoctors.filter(d => d.serviceIds?.includes(selectedServiceId));
    return matched.length > 0 ? matched : availableDoctors;
  }, [availableDoctors, selectedServiceId]);

  // Synchronizacja z pre-wybraną usługą z innych sekcji
  useEffect(() => {
    if (preselectedService && preselectedService.isActive) {
      setSelectedServiceId(preselectedService.id);
      const matched = availableDoctors.filter(d => d.serviceIds?.includes(preselectedService.id));
      if (matched.length > 0 && (!selectedDoctorId || !matched.some(d => d.id === selectedDoctorId))) {
        setSelectedDoctorId(matched[0].id);
      }
    } else if (availableServices.length > 0 && (!selectedServiceId || !availableServices.some(s => s.id === selectedServiceId))) {
      setSelectedServiceId(availableServices[0].id);
    }
  }, [preselectedService, availableServices]);

  // Synchronizacja z pre-wybranym lekarzem z innych sekcji
  useEffect(() => {
    if (preselectedDoctor && preselectedDoctor.isActive !== false) {
      setSelectedDoctorId(preselectedDoctor.id);
      if (preselectedDoctor.serviceIds && preselectedDoctor.serviceIds.length > 0) {
        if (!preselectedDoctor.serviceIds.includes(selectedServiceId)) {
          setSelectedServiceId(preselectedDoctor.serviceIds[0]);
        }
      }
    } else if (availableDoctors.length > 0 && (!selectedDoctorId || !availableDoctors.some(d => d.id === selectedDoctorId))) {
      setSelectedDoctorId(availableDoctors[0].id);
    }
  }, [preselectedDoctor, availableDoctors]);

  // Jeśli pacjent zmieni zabieg i obecny lekarz go nie wykonuje, przełącz na pierwszego wykwalifikowanego specjalistę
  useEffect(() => {
    if (qualifiedDoctors.length > 0 && !qualifiedDoctors.some(d => d.id === selectedDoctorId)) {
      setSelectedDoctorId(qualifiedDoctors[0].id);
    }
  }, [qualifiedDoctors, selectedDoctorId]);

  useEffect(() => {
    if (preselectedDate) {
      setSelectedDate(preselectedDate);
    }
  }, [preselectedDate]);

  useEffect(() => {
    if (preselectedTimeSlot) {
      setSelectedTimeSlot(preselectedTimeSlot);
    }
  }, [preselectedTimeSlot]);

  // Pobranie aktualnie wybranego serwisu i lekarza
  const currentService = useMemo(() => 
    services.find((s) => s.id === selectedServiceId), 
    [services, selectedServiceId]
  );
  
  const currentDoctor = useMemo(() => 
    doctors.find((d) => d.id === selectedDoctorId), 
    [doctors, selectedDoctorId]
  );

  // Dynamiczne sloty wyznaczone z grafiku wybranego lekarza
  // Zajęte wizyty oraz wyłączone godziny po prostu znikają z kalendarza – pacjent widzi wyłącznie dostępne terminy
  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return [];
    const generated = dentalStore.getDoctorDailySlots(selectedDoctorId, selectedDate);
    return generated
      .filter((s) => s.status === 'available')
      .map((s) => s.timeSlot);
  }, [selectedDoctorId, selectedDate, doctors]);

  // Reset wybranego slotu jeśli przestał być dostępny w grafiku
  useEffect(() => {
    if (selectedTimeSlot && !availableSlots.includes(selectedTimeSlot)) {
      setSelectedTimeSlot('');
    }
  }, [availableSlots, selectedTimeSlot]);

  // Obsługa wysłania formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Walidacja
    if (!patientName.trim()) {
      setErrorMessage('Proszę podać imię i nazwisko pacjenta.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 9) {
      setErrorMessage('Proszę podać poprawny numer telefonu kontaktowego.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setErrorMessage('Proszę podać poprawny adres e-mail do wysyłki potwierdzenia.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMessage('Proszę wybrać dostępną godzinę wizyty.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = dentalStore.createAppointment({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        serviceId: selectedServiceId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: notes.trim(),
        isUrgentPain,
      });

      setIsSubmitting(false);

      if (result.success && result.appointment) {
        setCompletedAppointment(result.appointment);
        onSuccess(result.appointment);
      } else {
        setErrorMessage(result.error || 'Wystąpił nieoczekiwany błąd podczas zapisu rezerwacji.');
      }
    }, 450);
  };

  // Resetowanie formularza do nowej rezerwacji
  const handleResetForm = () => {
    setCompletedAppointment(null);
    setSelectedTimeSlot('');
    setNotes('');
    setIsUrgentPain(false);
  };

  return (
    <section id="rezerwacja" className="py-20 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek modułu rezerwacji */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Inteligentny System Rezerwacji 24/7
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Umów wizytę w gabinecie
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Wybierz zabieg, lekarza i dogodną godzinę. System w czasie rzeczywistym weryfikuje zajętość w bazie Cloudflare D1 oraz blokady urlopowe.
          </p>
        </div>

        {/* EKRAN SUKCESU Z POTWIERDZENIEM I RESEND PREVIEW */}
        {completedAppointment ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ID Zgłoszenia: {completedAppointment.id}
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Dziękujemy, {completedAppointment.patientName}!
            </h3>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
              Twoje zgłoszenie rezerwacji zostało pomyślnie zapisane w bazie danych gabinetu.
            </p>

            {/* Karta szczegółów zarezerwowanej wizyty */}
            <div className="bg-slate-50 rounded-2xl p-5 my-6 text-left border border-slate-200 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Zabieg:</span>
                <span className="font-bold text-slate-900">{currentService?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Lekarz prowadzący:</span>
                <span className="font-bold text-slate-900">{currentDoctor?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Termin wizyty:</span>
                <span className="font-bold text-[#1B64A5]">{completedAppointment.date} o godz. {completedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Szacowany koszt:</span>
                <span className="font-bold text-slate-900">{currentService?.pricePln} PLN</span>
              </div>
            </div>

            {/* Informacje o integracjach zewnętrznych (Resend + Webhook Push) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#1B64A5] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-sky-950">Resend API Email: Wysłany</p>
                  <p className="text-[11px] text-sky-800">Na adres: {completedAppointment.patientEmail}</p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-950">Powiadomienie personelu: Aktywne</p>
                  <p className="text-[11px] text-blue-800">Webhook dyżurny wysłany w czasie rzeczywistym</p>
                </div>
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowResendPreviewModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                Podgląd wysłanego maila Resend
              </button>

              <button
                onClick={handleResetForm}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Umów kolejną wizytę
              </button>
            </div>

            {/* Modal podglądu maila Resend */}
            {showResendPreviewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#1B64A5]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Symulacja szablonu Resend API
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowResendPreviewModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Symulowane okno maila */}
                  <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3 font-sans">
                    <div className="border-b border-slate-200 pb-2 text-xs text-slate-500">
                      <div><strong>Od:</strong> DentaNova Recepcja &lt;recepcja@dentanova.example&gt;</div>
                      <div><strong>Do:</strong> {completedAppointment.patientEmail}</div>
                      <div><strong>Temat:</strong> Potwierdzenie zgłoszenia wizyty DentaNova [{completedAppointment.id}]</div>
                    </div>
                    
                    <div className="space-y-2 pt-2 text-xs">
                      <p className="font-bold text-sm text-[#1B64A5]">Dzień dobry {completedAppointment.patientName},</p>
                      <p>Dziękujemy za wybranie Kliniki DentaNova. Twoje zapytanie o wizytę zostało zarejestrowane w naszym systemie.</p>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <p><strong>Lekarz:</strong> {currentDoctor?.name}</p>
                        <p><strong>Zabieg:</strong> {currentService?.name}</p>
                        <p><strong>Data i godzina:</strong> {completedAppointment.date}, godz. {completedAppointment.timeSlot}</p>
                        <p><strong>Szacowany czas:</strong> {currentService?.durationMinutes} min</p>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Nasz personel recepcji DentaNova skontaktuje się telefonicznie pod numerem {completedAppointment.patientPhone} w celu ostatecznego potwierdzenia.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-right">
                    <button
                      onClick={() => setShowResendPreviewModal(false)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                    >
                      Zamknij podgląd
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* GŁÓWNY FORMULARZ REZERWACJI */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            
            <div className="p-6 sm:p-10 space-y-8">
              
              {/* KROK 1: Wybór Usługi i Lekarza */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Wybierz zabieg oraz lekarza prowadzącego
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Wybór Usługi */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Zabieg stomatologiczny *
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {services.filter(s => s.isActive).map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.pricePln} PLN • {srv.durationMinutes} min)
                        </option>
                      ))}
                    </select>
                    {currentService && (
                      <p className="text-[11px] text-slate-500 mt-1.5 pl-1">
                        Kategoria: <span className="font-semibold text-slate-700">{currentService.category}</span> • Czas: ~{currentService.durationMinutes} min
                      </p>
                    )}
                  </div>

                  {/* Wybór Lekarza */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Lekarz stomatolog *
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Dedykowany do zabiegu
                      </span>
                    </div>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      {qualifiedDoctors.length === 0 ? (
                        <option value="">Brak dostępnych lekarzy</option>
                      ) : (
                        qualifiedDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} – {doc.specialization}
                          </option>
                        ))
                      )}
                    </select>
                    {currentDoctor && (
                      <p className="text-[11px] text-slate-500 mt-1.5 pl-1">
                        Przyjmuje: <span className="font-semibold text-slate-700">{currentDoctor.workingDays.join(', ')}</span> ({currentDoctor.workingHoursStart} - {currentDoctor.workingHoursEnd})
                      </p>
                    )}
                  </div>
                </div>

                {/* Potwierdzenie powiązania specjalisty z usługą */}
                {currentDoctor && currentService && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentDoctor.avatarUrl}
                        alt={currentDoctor.name}
                        className="w-10 h-10 rounded-xl object-cover border border-sky-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{currentDoctor.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                            {currentDoctor.specialization}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Kwalifikowany specjalista do zabiegu: <strong className="text-slate-800">{currentService.name}</strong> • {currentDoctor.room || 'Gabinet DentaNova'}
                        </p>
                      </div>
                    </div>

                    {qualifiedDoctors.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        {qualifiedDoctors.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setSelectedDoctorId(doc.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                              selectedDoctorId === doc.id
                                ? 'bg-[#1B64A5] text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {doc.name.split(' ').slice(-1)[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KROK 2: Wybór Daty i Godziny ze sprawdzaniem dostępności */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Wybierz termin (weryfikacja D1 w czasie rzeczywistym)
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
                    Terminy na żywo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Wybór Daty */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Dzień wizyty *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 pl-1">
                      Wybierz dowolny dzień powszedni lub sobotę
                    </p>
                  </div>

                  {/* Siatka slotów godzinowych */}
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Dostępne godziny przyjęć dla wybranego dnia *</span>
                      {currentDoctor?.room && (
                        <span className="text-[11px] text-purple-700 font-semibold">
                          {currentDoctor.room}
                        </span>
                      )}
                    </label>
                    {availableSlots.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        Brak wolnych terminów w wybranym dniu. Specjalista w ten dzień nie przyjmuje lub wszystkie godziny zostały już zarezerwowane. Prosimy wybrać inną datę.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTimeSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600 scale-[1.02]'
                                  : 'bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 border border-slate-200 hover:border-emerald-300 shadow-xs'
                              }`}
                            >
                              <span className="font-mono text-xs font-black">{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {selectedTimeSlot ? (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Wybrano godzinę: {selectedTimeSlot} ({selectedDate})
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-2">
                        Wybierz godzinę spośród aktywnych kafelków powyżej
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* KROK 3: Dane Pacjenta & Priorytet Bólu */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Dane kontaktowe pacjenta
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Imię i nazwisko *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Jan Kowalski"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Numer telefonu *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+48 600 000 000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Adres e-mail (do e-maila Resend) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="jan.kowalski@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Notatka pacjenta */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Dodatkowe uwagi dla lekarza (opcjonalnie)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Opisz swoje dolegliwości, np. nadwrażliwość na zimno, złamany ząb, chęć znieczulenia komputerowego..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Toggle ostrego bólu zęba */}
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        Zgłoszenie z ostrym bólem zęba (Przypadek pilny)
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Zaznacz, jeśli potrzebujesz natychmiastowej interwencji dyżurnej. Personel otrzyma powiadomienie push o wysokim priorytecie.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isUrgentPain}
                      onChange={(e) => setIsUrgentPain(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

              </div>

              {/* Komunikat o błędzie jeśli wystąpił */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

            </div>

            {/* Dolny pasek potwierdzenia formularza */}
            <div className="bg-slate-50 px-6 sm:px-10 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#1B64A5] shrink-0" />
                <span>Twoje dane medyczne są chronione zgodnie z RODO i szyfrowane</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-bold text-sm shadow-md shadow-[#1B64A5]/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Zapisywanie w D1 & wysyłka Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Potwierdź i zarezerwuj termin</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
};
