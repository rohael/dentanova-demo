import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Info, 
  Layers, 
  Building, 
  CalendarDays,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RotateCcw,
  EyeOff,
  Eye
} from 'lucide-react';
import { Doctor, BlockedSlot, Appointment, Service } from '../../types';
import { dentalStore } from '../../services/storage';

interface ScheduleManagerProps {
  doctors: Doctor[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
  services: Service[];
}

const ALL_DAYS = [
  'Poniedziałek', 
  'Wtorek', 
  'Środa', 
  'Czwartek', 
  'Piątek', 
  'Sobota'
];

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  doctors,
  blockedSlots,
  appointments,
  services,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'slots' | 'weekly' | 'blocks'>('slots');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(() => doctors[0]?.id || 'doc-1');
  
  // Domyślna data: jutro lub dzisiaj
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Modal wyłączenia godzin z kalendarza
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [newBlock, setNewBlock] = useState<{
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: 'Urlop' | 'Szkolenie / Konferencja' | 'Dyżur chirurgiczny' | 'Brak przyjęć';
  }>({
    doctorId: doctors[0]?.id || 'doc-1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '13:00',
    reason: 'Brak przyjęć',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  // Edycja tygodniowego grafiku wybranego lekarza
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    return currentDoctor?.scheduleDays || {
      'Poniedziałek': { isEnabled: true, startTime: '09:00', endTime: '18:00', room: 'Gabinet 1' },
      'Wtorek': { isEnabled: true, startTime: '09:00', endTime: '18:00', room: 'Gabinet 1' },
      'Środa': { isEnabled: true, startTime: '09:00', endTime: '18:00', room: 'Gabinet 1' },
      'Czwartek': { isEnabled: true, startTime: '09:00', endTime: '18:00', room: 'Gabinet 1' },
      'Piątek': { isEnabled: true, startTime: '09:00', endTime: '16:00', room: 'Gabinet 1' },
      'Sobota': { isEnabled: false, startTime: '09:00', endTime: '14:00', room: 'Gabinet 1' },
    };
  });

  const [slotDuration, setSlotDuration] = useState<number>(currentDoctor?.slotDurationMinutes || 45);
  const [doctorRoom, setDoctorRoom] = useState<string>(currentDoctor?.room || 'Gabinet Stomatologiczny DentaNova');

  // Synchronizacja przy zmianie wybranego lekarza
  React.useEffect(() => {
    if (currentDoctor) {
      if (currentDoctor.scheduleDays) {
        setWeeklySchedule(currentDoctor.scheduleDays);
      }
      setSlotDuration(currentDoctor.slotDurationMinutes || 45);
      setDoctorRoom(currentDoctor.room || 'Gabinet 1 – Stomatologia DentaNova');
    }
  }, [currentDoctor]);

  // Generowanie slotów na wybrany dzień
  const dailySlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return [];
    return dentalStore.getDoctorDailySlots(selectedDoctorId, selectedDate);
  }, [selectedDoctorId, selectedDate, doctors, blockedSlots, appointments]);

  // Dzień tygodnia z wybranej daty
  const selectedDayInfo = useMemo(() => {
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dayIndex = dateObj.getDay();
    const polishDays = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dayName = polishDays[dayIndex];
    return {
      dayName,
      formattedDate: dateObj.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  }, [selectedDate]);

  // Statystyki slotów dla wybranego dnia
  const totalSlotsCount = dailySlots.length;
  const availableSlotsCount = dailySlots.filter((s) => s.status === 'available').length;
  const bookedSlotsCount = dailySlots.filter((s) => s.status === 'booked').length;
  const blockedSlotsCount = dailySlots.filter((s) => s.status === 'blocked').length;

  // Zapisanie zmodyfikowanego tygodniowego grafiku
  const handleSaveWeeklySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;

    // Przeliczenie aktywnych dni dla workingDays
    const workingDays = Object.entries(weeklySchedule)
      .filter(([_, cfg]) => cfg.isEnabled)
      .map(([dayName]) => dayName);

    const updatedDoctor: Doctor = {
      ...currentDoctor,
      room: doctorRoom,
      slotDurationMinutes: slotDuration,
      scheduleDays: weeklySchedule,
      workingDays,
    };

    dentalStore.saveDoctor(updatedDoctor);
    showNotification(`Zapisano grafik przyjęć dla: ${currentDoctor.name}`);
  };

  // Wyłączenie lub przywrócenie pojedynczego slotu w kalendarzu
  const handleToggleSlotBlock = (timeSlot: string, currentStatus: 'available' | 'booked' | 'blocked') => {
    if (currentStatus === 'booked') {
      alert('Ten termin jest już zarezerwowany przez pacjenta. Aby zwolnić ten slot do kalendarza, zmień status rezerwacji na «anulowana» w zakładce «Wszystkie Rezerwacje».');
      return;
    }

    if (currentStatus === 'available') {
      // Specjalista nie pracuje w tym terminie -> termin znika z kalendarza
      dentalStore.removeSlotFromCalendar(selectedDoctorId, selectedDate, timeSlot, slotDuration || 45, 'Brak przyjęć');
      showNotification(`Wyłączono termin ${timeSlot} (${selectedDate}) z kalendarza – nie pojawi się dla pacjentów`);
    } else if (currentStatus === 'blocked') {
      // Specjalista jednak może pracować -> przywracamy termin do kalendarza
      dentalStore.restoreSlotToCalendar(selectedDoctorId, selectedDate, timeSlot);
      showNotification(`Przywrócono termin ${timeSlot} (${selectedDate}) do kalendarza – jest widoczny dla pacjentów`);
    }
  };

  // Wyłączenie całego dnia z kalendarza dla lekarza (np. nagła nieobecność, urlop)
  const handleExcludeWholeDay = () => {
    if (window.confirm(`Czy na pewno chcesz wyłączyć wszystkie godziny dla ${currentDoctor?.name} w dniu ${selectedDate}? Terminy natychmiast znikną z kalendarza dla pacjentów.`)) {
      dentalStore.excludeDoctorWholeDayFromCalendar(selectedDoctorId, selectedDate, 'Brak przyjęć');
      showNotification(`Wyłączono cały dzień (${selectedDate}) z kalendarza dla: ${currentDoctor?.name}`);
    }
  };

  // Przywrócenie wszystkich terminów w danym dniu do kalendarza
  const handleRestoreWholeDay = () => {
    dentalStore.restoreAllDoctorSlotsForDate(selectedDoctorId, selectedDate);
    showNotification(`Przywrócono wszystkie terminy dnia (${selectedDate}) do kalendarza dla: ${currentDoctor?.name}`);
  };

  // Obsługa wyłączenia zakresu godzin z kalendarza
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.doctorId || !newBlock.date || !newBlock.startTime || !newBlock.endTime) return;

    dentalStore.addBlockedSlot({
      doctorId: newBlock.doctorId,
      date: newBlock.date,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      reason: newBlock.reason,
    });

    setShowBlockedModal(false);
    showNotification('Wyłączono wskazany przedział godzin z kalendarza pacjentów');
  };

  return (
    <div className="space-y-6">
      {/* Pływające powiadomienie toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Górna belka informacyjna */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white p-6 rounded-2xl border border-purple-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
              Harmonogram & Grafik DentaNova
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Synchronizacja z publiczną stroną pacjenta 1:1
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Kalendarz Dostępności & Transparentny Grafik Przyjęć
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
            Konfiguracja godzin pracy specjalistów. Gdy lekarz nie przyjmuje, wyłącz termin – zniknie z kalendarza pacjentów. 
            Gdy okaże się, że może pracować, przywróć termin jednym kliknięciem do kalendarza publicznego.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setNewBlock({
                ...newBlock,
                doctorId: selectedDoctorId,
                date: selectedDate,
              });
              setShowBlockedModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            Wyłącz godziny z kalendarza
          </button>
        </div>
      </div>

      {/* Pasek wyboru lekarza */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          Wybierz specjalistę z zespołu DentaNova:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {doctors.map((doc) => {
            const isSelected = doc.id === selectedDoctorId;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50/80 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-purple-950 font-extrabold' : 'text-slate-900'}`}>
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">{doc.specialization}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-purple-700">
                    {doc.room || 'Gabinet 1'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Podzakładki managera */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('slots')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'slots'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dostępność & Kalendarz Dnia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'weekly'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Konfiguracja Harmonogramu Pracy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('blocks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'blocks'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>Wyłączenia z kalendarza ({blockedSlots.filter((b) => b.doctorId === selectedDoctorId).length})</span>
        </button>
      </div>

      {/* ========================================================
          WIDOK 1: PODGLĄD DZIENNYCH SLOTÓW & DOSTĘPNOŚCI
      ======================================================== */}
      {activeSubTab === 'slots' && (
        <div className="space-y-5">
          {/* Kontrolki wyboru dnia */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Wybierz datę grafiku:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium text-slate-800"
              />
              
              {/* Szybkie przyciski wyboru daty */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Dzisiaj
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Jutro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Pojutrze
                </button>
              </div>

              {/* Akcje masowe dla całego dnia */}
              <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                <button
                  type="button"
                  onClick={handleExcludeWholeDay}
                  title="Wyłącz wszystkie godziny tego dnia – lekarz nie przyjmuje"
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 cursor-pointer flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Wyłącz cały dzień</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreWholeDay}
                  title="Przywróć wszystkie godziny tego dnia do kalendarza – lekarz przyjmuje"
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Przywróć cały dzień</span>
                </button>
              </div>
            </div>

            {/* Podsumowanie wybranego dnia */}
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 capitalize block">
                {selectedDayInfo.formattedDate}
              </span>
              <span className="text-[11px] text-purple-700 font-medium">
                {currentDoctor?.name} • {currentDoctor?.room || 'Gabinet DentaNova'}
              </span>
            </div>
          </div>

          {/* Kafelki metryk dnia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium block">Wszystkie godziny grafiku</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalSlotsCount}</div>
              <span className="text-[10px] text-slate-500">
                Czas wizyty: {currentDoctor?.slotDurationMinutes || 45} min
              </span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
              <span className="text-[11px] text-emerald-800 font-bold block">🟢 W kalendarzu (wolne)</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{availableSlotsCount}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Widoczne dla pacjentów online
              </span>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 shadow-sm">
              <span className="text-[11px] text-sky-800 font-bold block">🔵 Zarezerwowane</span>
              <div className="text-2xl font-black text-sky-700 mt-1">{bookedSlotsCount}</div>
              <span className="text-[10px] text-sky-600 font-semibold">
                Zapisani pacjenci (zniknęły z kalendarza)
              </span>
            </div>

            <div className="bg-slate-100/90 p-4 rounded-xl border border-slate-300 shadow-sm">
              <span className="text-[11px] text-slate-700 font-bold block">⚪ Poza kalendarzem</span>
              <div className="text-2xl font-black text-slate-700 mt-1">{blockedSlotsCount}</div>
              <span className="text-[10px] text-slate-500 font-semibold">
                Brak przyjęć (nie pojawia się w kalendarzu)
              </span>
            </div>
          </div>

          {/* Siatka slotów */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Transparentna Siatka Godzinowa Przyjęć</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({selectedDayInfo.dayName}, {selectedDate})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gdy specjalista nie pracuje, wyłącz slot – natychmiast zniknie ze strony głównej. Jeżeli okaże się, że może pracować, przywróć termin jednym kliknięciem.
                </p>
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> W kalendarzu (wolny)
                </span>
                <span className="flex items-center gap-1 text-sky-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Zarezerwowany
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Poza kalendarzem
                </span>
              </div>
            </div>

            {dailySlots.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-700">Brak zaplanowanych przyjęć w ten dzień</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Specjalista {currentDoctor?.name} nie ma włączonego dnia «{selectedDayInfo.dayName}» w tygodniowym grafiku.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('weekly')}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                >
                  Włącz ten dzień w grafiku pracy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dailySlots.map((slot) => {
                  const isAvailable = slot.status === 'available';
                  const isBooked = slot.status === 'booked';
                  const isBlocked = slot.status === 'blocked';

                  return (
                    <div
                      key={slot.timeSlot}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isAvailable
                          ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400'
                          : isBooked
                          ? 'bg-sky-50/70 border-sky-300'
                          : 'bg-slate-100/80 border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-4 h-4 ${
                            isAvailable ? 'text-emerald-700' : isBooked ? 'text-sky-700' : 'text-slate-600'
                          }`} />
                          <span className="text-sm font-mono font-black text-slate-900">
                            {slot.timeSlot}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : isBooked
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isAvailable ? 'W KALENDARZU' : isBooked ? 'ZAJĘTY' : 'POZA KALENDARZEM'}
                        </span>
                      </div>

                      {/* Opis stanu slotu */}
                      <div className="mt-2 text-xs">
                        {isAvailable && (
                          <p className="text-emerald-800 font-medium text-[11px]">
                            Widoczny w kalendarzu – pacjent może zarezerwować.
                          </p>
                        )}
                        {isBooked && (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 truncate">
                              Pacjent: {slot.patientName || 'Anonimowy'}
                            </p>
                            <p className="text-[10px] text-sky-700 truncate">
                              {slot.serviceName}
                            </p>
                          </div>
                        )}
                        {isBlocked && (
                          <p className="text-slate-600 font-medium text-[11px]">
                            Specjalista nie pracuje ({slot.reason || 'Brak przyjęć'}). Termin nie pojawia się w kalendarzu.
                          </p>
                        )}
                      </div>

                      {/* Przycisk akcji */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => handleToggleSlotBlock(slot.timeSlot, 'available')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-[11px] font-semibold border border-slate-200 hover:border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Wyłącz ten termin z kalendarza – specjalista nie przyjmuje"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Wyłącz z kalendarza</span>
                          </button>
                        )}
                        {isBlocked && (
                          <button
                            type="button"
                            onClick={() => handleToggleSlotBlock(slot.timeSlot, 'blocked')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Przywróć ten termin do kalendarza – specjalista może pracować"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Przywróć do kalendarza</span>
                          </button>
                        )}
                        {isBooked && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Termin zarezerwowany
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          WIDOK 2: KONFIGURACJA TYGODNIOWEGO GRAFIKU PRACY
      ======================================================== */}
      {activeSubTab === 'weekly' && (
        <form onSubmit={handleSaveWeeklySchedule} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Konfiguracja Harmonogramu Tygodniowego: {currentDoctor?.name}
              </h4>
              <p className="text-xs text-slate-500">
                Ustaw godziny rozpoczęcia i zakończenia przyjęć w poszczególne dni robocze oraz przypisany gabinet.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Zapisz zmiany w grafiku
            </button>
          </div>

          {/* Domyślny gabinet i czas slotu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Domyślny Gabinet / Unit Przyjęć w DentaNova:
              </label>
              <input
                type="text"
                value={doctorRoom}
                onChange={(e) => setDoctorRoom(e.target.value)}
                placeholder="np. Gabinet 1 – Chirurgia i Implantologia"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Wyświetlane pacjentom na publicznej stronie w grafiku i potwierdzeniach wizyt.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Standardowy czas trwania slotu wizyty (interwał):
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
              >
                <option value={30}>30 minut (szybkie wizyty kontrolne / przeglądy)</option>
                <option value={45}>45 minut (standardowa wizyta stomatologiczna - rekomendowane)</option>
                <option value={60}>60 minut (zabiegi zaawansowane, chirurgia, endodoncja)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Określa odstępy między generowanymi slotami (np. 09:00, 09:45, 10:30...).
              </span>
            </div>
          </div>

          {/* Dni tygodnia */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Godziny przyjęć wg dni tygodnia:
            </h5>

            <div className="grid grid-cols-1 gap-3">
              {ALL_DAYS.map((dayName) => {
                const dayConfig = weeklySchedule[dayName] || {
                  isEnabled: false,
                  startTime: '09:00',
                  endTime: '18:00',
                  room: doctorRoom,
                };

                return (
                  <div
                    key={dayName}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      dayConfig.isEnabled
                        ? 'bg-purple-50/30 border-purple-200'
                        : 'bg-slate-50/50 border-slate-200 opacity-75'
                    }`}
                  >
                    {/* Włącznik dnia */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`check-${dayName}`}
                        checked={dayConfig.isEnabled}
                        onChange={(e) => {
                          setWeeklySchedule({
                            ...weeklySchedule,
                            [dayName]: {
                              ...dayConfig,
                              isEnabled: e.target.checked,
                            },
                          });
                        }}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor={`check-${dayName}`} className="text-sm font-bold text-slate-900 cursor-pointer">
                        {dayName}
                      </label>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dayConfig.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {dayConfig.isEnabled ? 'Przyjmuje' : 'Dzień wolny'}
                      </span>
                    </div>

                    {/* Godziny i gabinet jeśli dzień jest włączony */}
                    {dayConfig.isEnabled ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500">Od:</span>
                          <input
                            type="time"
                            value={dayConfig.startTime}
                            onChange={(e) => {
                              setWeeklySchedule({
                                ...weeklySchedule,
                                [dayName]: {
                                  ...dayConfig,
                                  startTime: e.target.value,
                                },
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500">Do:</span>
                          <input
                            type="time"
                            value={dayConfig.endTime}
                            onChange={(e) => {
                              setWeeklySchedule({
                                ...weeklySchedule,
                                [dayName]: {
                                  ...dayConfig,
                                  endTime: e.target.value,
                                },
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500">Gabinet:</span>
                          <input
                            type="text"
                            value={dayConfig.room || doctorRoom}
                            onChange={(e) => {
                              setWeeklySchedule({
                                ...weeklySchedule,
                                [dayName]: {
                                  ...dayConfig,
                                  room: e.target.value,
                                },
                              });
                            }}
                            placeholder="Gabinet przyjmujący"
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white w-40 truncate"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Brak planowych przyjęć w gabinecie
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Zapisz tygodniowy grafik
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          WIDOK 3: WYŁĄCZENIA Z KALENDARZA
      ======================================================== */}
      {activeSubTab === 'blocks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Wyłączenia z kalendarza dla: {currentDoctor?.name}
              </h4>
              <p className="text-xs text-slate-500">
                Godziny i dni, w których lekarz nie pracuje. Terminy te nie pojawiają się w kalendarzu dla pacjentów.
              </p>
            </div>
            <button
              onClick={() => {
                setNewBlock({
                  ...newBlock,
                  doctorId: selectedDoctorId,
                  date: selectedDate,
                });
                setShowBlockedModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Wyłącz godziny z kalendarza
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockedSlots
              .filter((slot) => slot.doctorId === selectedDoctorId)
              .map((slot) => (
                <div key={slot.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300">
                        {slot.reason}
                      </span>
                      <button
                        onClick={() => {
                          dentalStore.deleteBlockedSlot(slot.id);
                          showNotification('Przywrócono terminy do kalendarza – są znowu widoczne');
                        }}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        title="Przywróć te godziny do kalendarza"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Przywróć</span>
                      </button>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm mt-2">{currentDoctor?.name}</h5>
                    <p className="text-xs text-slate-500">{currentDoctor?.title || currentDoctor?.specialization}</p>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Data nieobecności:</span>
                        <span className="font-semibold text-slate-800">{slot.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Przedział godzin:</span>
                        <span className="font-semibold text-slate-800">{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Wycofano: {slot.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        dentalStore.deleteBlockedSlot(slot.id);
                        showNotification('Przywrócono terminy do kalendarza – są znowu widoczne');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Przywróć do kalendarza</span>
                    </button>
                  </div>
                </div>
              ))}

            {blockedSlots.filter((slot) => slot.doctorId === selectedDoctorId).length === 0 && (
              <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Wszystkie terminy z grafiku są aktywne w kalendarzu.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Brak wyłączeń ani zgłoszonych nieobecności dla {currentDoctor?.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal wyłączenia godzin z kalendarza */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-purple-600" />
              <span>Wyłącz godziny z kalendarza</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Wskazany przedział czasowy natychmiast zniknie z kalendarza na stronie głównej dla pacjentów. Jeśli lekarz znów będzie mógł pracować, w każdej chwili przywrócisz terminy.
            </p>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specjalista</label>
                <select
                  value={newBlock.doctorId}
                  onChange={(e) => setNewBlock({ ...newBlock, doctorId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={newBlock.date}
                  onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Od godziny</label>
                  <input
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Do godziny</label>
                  <input
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Powód nieobecności w kalendarzu</label>
                <select
                  value={newBlock.reason}
                  onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                >
                  <option value="Brak przyjęć">Brak przyjęć (specjalista nie pracuje)</option>
                  <option value="Urlop">Urlop wypoczynkowy / zwolnienie</option>
                  <option value="Szkolenie / Konferencja">Szkolenie / Konferencja medyczna</option>
                  <option value="Dyżur chirurgiczny">Dyżur chirurgiczny / operacyjny</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBlockedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm cursor-pointer"
                >
                  Wyłącz z kalendarza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
