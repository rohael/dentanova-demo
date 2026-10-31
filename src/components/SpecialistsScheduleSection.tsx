import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  Building, 
  Info,
  CalendarCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Doctor, Service } from '../types';
import { dentalStore } from '../services/storage';

interface SpecialistsScheduleSectionProps {
  doctors: Doctor[];
  onSelectSlot: (doctor: Doctor, date: string, timeSlot: string) => void;
}

export const SpecialistsScheduleSection: React.FC<SpecialistsScheduleSectionProps> = ({
  doctors,
  onSelectSlot,
}) => {
  const activeDoctors = useMemo(() => doctors.filter((d) => d.isActive !== false), [doctors]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(() => activeDoctors[0]?.id || 'doc-1');

  // Generowanie najbliższych 7 dni (dziś + 6 kolejnych dni)
  const availableDays = useMemo(() => {
    const days = [];
    const polishDaysShort = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
    const polishDaysFull = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const monthsGenitive = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();

      let label = '';
      if (i === 0) label = 'Dzisiaj';
      else if (i === 1) label = 'Jutro';
      else label = polishDaysFull[dayIdx];

      days.push({
        dateStr: iso,
        dayOfWeek: polishDaysFull[dayIdx],
        shortDay: polishDaysShort[dayIdx],
        dayNum: d.getDate(),
        monthName: monthsGenitive[d.getMonth()],
        label,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Domyślnie wybrany dzień (jutro lub dzisiaj)
  const [selectedDate, setSelectedDate] = useState<string>(() => availableDays[1]?.dateStr || availableDays[0]?.dateStr);

  const currentDoctor = useMemo(() => {
    return activeDoctors.find((d) => d.id === selectedDoctorId) || activeDoctors[0];
  }, [activeDoctors, selectedDoctorId]);

  const currentDayInfo = useMemo(() => {
    return availableDays.find((d) => d.dateStr === selectedDate) || availableDays[0];
  }, [availableDays, selectedDate]);

  // Pobranie slotów wybranego lekarza na wybrany dzień
  const slots = useMemo(() => {
    if (!currentDoctor || !selectedDate) return [];
    return dentalStore.getDoctorDailySlots(currentDoctor.id, selectedDate);
  }, [currentDoctor, selectedDate]);

  // Tylko aktywne i wolne terminy – zajęte oraz wyłączone z grafiku po prostu nie pojawiają się w kalendarzu
  const availableSlots = useMemo(() => {
    return slots.filter((s) => s.status === 'available');
  }, [slots]);

  // Sprawdzenie konfiguracji godzin dla wybranego dnia
  const dayScheduleConfig = useMemo(() => {
    if (!currentDoctor) return null;
    const dayName = currentDayInfo.dayOfWeek;
    if (currentDoctor.scheduleDays && currentDoctor.scheduleDays[dayName]) {
      return currentDoctor.scheduleDays[dayName];
    }
    const isWorking = currentDoctor.workingDays?.includes(dayName);
    return {
      isEnabled: isWorking,
      startTime: currentDoctor.workingHoursStart || '09:00',
      endTime: currentDoctor.workingHoursEnd || '18:00',
      room: currentDoctor.room || 'Gabinet 1',
    };
  }, [currentDoctor, currentDayInfo]);

  return (
    <section id="grafik" className="py-16 sm:py-20 bg-slate-50/80 border-t border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek Sekcji */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-[#1B64A5] text-xs font-bold mb-3 border border-sky-200 shadow-xs">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>TRANSPARENTNY KALENDARZ PRZYJĘĆ & WOLNE TERMINY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kiedy przyjmują nasi specjaliści?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Sprawdź w czasie rzeczywistym aktualny grafik dyżurów lekarzy oraz dokładne, wolne sloty godzinowe. 
            Wystarczy kliknąć wybrany termin, aby przejść od razu do bezpiecznej rezerwacji.
          </p>
        </div>

        {/* 1. KROK: WYBÓR LEKARZA ZE SPECJALIZACJĄ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1B64A5]" />
              1. Wybierz lekarza stomatologa:
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Liczba dostępnych specjalistów: {activeDoctors.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {activeDoctors.map((doc) => {
              const isSelected = doc.id === selectedDoctorId;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#1B64A5] shadow-md ring-2 ring-[#1B64A5]/20'
                      : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-[#1B64A5]' : 'text-slate-900'}`}>
                        {doc.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {doc.specialization}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {doc.room || 'Gabinet DentaNova'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Slot wizyty:</span>
                    <span className="font-bold text-slate-700">{doc.slotDurationMinutes || 45} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. KROK: WYBÓR DNIA TYGODNIA */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#1B64A5]" />
              2. Wybierz dzień tygodnia:
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold">
              ✓ Aktualny harmonogram na najbliższy tydzień
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {availableDays.map((d) => {
              const isSelected = d.dateStr === selectedDate;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#1B64A5] text-white border-[#1B64A5] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50/50 hover:border-sky-300'
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                    {d.label}
                  </span>
                  <span className={`text-xl font-black mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {d.dayNum}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                    {d.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. KARTA GRAFIKU & WOLNYCH SLOTÓW WYBRANEGO LEKARZA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
          
          {/* Informacja o dyżurze lekarza */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <img
                src={currentDoctor.avatarUrl}
                alt={currentDoctor.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1B64A5]/20 shrink-0 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {currentDoctor.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#1B64A5] border border-sky-200">
                    PWZ: {currentDoctor.pwzNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentDoctor.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Building className="w-3.5 h-3.5 text-[#1B64A5]" />
                    {dayScheduleConfig?.room || currentDoctor.room || 'Gabinet DentaNova'}
                  </span>
                  {dayScheduleConfig?.isEnabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Godziny przyjęć: {dayScheduleConfig.startTime} – {dayScheduleConfig.endTime}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Lekarz w ten dzień nie przyjmuje
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Podsumowanie slotów */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Dostępność na dzień:</span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {currentDayInfo.dayOfWeek}, {currentDayInfo.dayNum} {currentDayInfo.monthName}
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-bold block">Dostępne terminy:</span>
                <span className="text-xl font-black text-emerald-700">{availableSlots.length}</span>
              </div>
            </div>
          </div>

          {/* Siatka slotów na dany dzień */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1B64A5]" />
                Wolne godziny przyjęć w DentaNova:
              </h4>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kliknij wybrany termin, aby przejść do bezpiecznej rezerwacji</span>
              </div>
            </div>

            {!dayScheduleConfig?.isEnabled || availableSlots.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-800">
                  {!dayScheduleConfig?.isEnabled 
                    ? `W tym dniu ${currentDoctor.name} nie ma zaplanowanych przyjęć`
                    : `Brak wolnych terminów u ${currentDoctor.name} w wybranym dniu`}
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {!dayScheduleConfig?.isEnabled 
                    ? 'Lekarz w ten dzień nie przyjmuje. Wybierz inny dzień w grafiku powyżej.' 
                    : 'Wszystkie godziny zostały zarezerwowane lub specjalista w tym terminie nie przyjmuje. Wybierz inny dzień w grafiku lub sprawdź terminy u innego lekarza.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {availableDays
                    .filter((d) => d.dateStr !== selectedDate)
                    .slice(0, 3)
                    .map((d) => (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(d.dateStr)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#1B64A5] hover:border-[#1B64A5] shadow-xs cursor-pointer"
                      >
                        Sprawdź {d.label} ({d.dayNum} {d.monthName})
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.timeSlot}
                      type="button"
                      onClick={() => onSelectSlot(currentDoctor, selectedDate, slot.timeSlot)}
                      className="group p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-600 border border-emerald-300 hover:border-emerald-600 text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-mono font-black text-slate-900 group-hover:text-white">
                          {slot.timeSlot}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-white animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 group-hover:text-emerald-100 mt-2 flex items-center justify-between">
                        <span>WOLNY TERMIN</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  ))}
                </div>

                {/* Belka zachęcająca na dole karty */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <Sparkles className="w-5 h-5 text-[#1B64A5] shrink-0" />
                    <span>
                      Widzisz dogodną dla siebie godzinę? <strong>Kliknij zielony kafelek</strong>, a lekarz, data i godzina zostaną automatycznie uzupełnione w formularzu rezerwacji!
                    </span>
                  </div>
                  <a
                    href="tel:446471234"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1B64A5] font-bold text-xs border border-sky-200 shadow-xs shrink-0 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    Rejestracja: 44 647 12 34
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
