import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  ShieldAlert, 
  Filter, 
  Search, 
  Activity, 
  RotateCcw,
  Layers,
  Send,
  BellRing,
  Users,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { Service, Doctor, Promotion, BlockedSlot, Appointment, AppointmentStatus, WebhookLog, HeroSlide } from '../../types';
import { dentalStore } from '../../services/storage';
import { DoctorsManager } from './DoctorsManager';
import { MediaManager } from './MediaManager';
import { ScheduleManager } from './ScheduleManager';

interface AdminDashboardProps {
  services: Service[];
  doctors: Doctor[];
  promotions: Promotion[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
  webhookLogs: WebhookLog[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  doctors,
  promotions,
  blockedSlots,
  appointments,
  webhookLogs,
}) => {
  // Stan autoryzacji
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => dentalStore.isAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Aktywna podzakładka
  const [activeTab, setActiveTab] = useState<'appointments' | 'blocked' | 'doctors' | 'promotions' | 'services' | 'webhooks' | 'media' | 'hero'>('appointments');

  // Slajdy Hero w CMS
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => dentalStore.getHeroSlides());
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);
  const [showHeroModal, setShowHeroModal] = useState<boolean>(false);

  // Włącznik/wyłącznik całej sekcji ofert specjalnych
  const [promotionsSectionEnabled, setPromotionsSectionEnabled] = useState<boolean>(() => dentalStore.isPromotionsSectionEnabled());

  useEffect(() => {
    const unsubscribe = dentalStore.subscribe(() => {
      setHeroSlides(dentalStore.getHeroSlides());
      setPromotionsSectionEnabled(dentalStore.isPromotionsSectionEnabled());
    });
    return unsubscribe;
  }, []);

  // Filtry rezerwacji
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appointmentSearch, setAppointmentSearch] = useState<string>('');

  // Formularz nowej promocji
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
  const [newPromo, setNewPromo] = useState({
    title: '',
    badge: 'Oferta specjalna',
    discountText: '',
    description: '',
    promoCode: '',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    showInHeroBadge: true,
  });

  // Formularz nowej usługi
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    category: 'Zachowawcza',
    description: '',
    durationMinutes: 30,
    pricePln: 200,
    isPopular: false,
    isActive: true,
  });

  // Obsługa logowania
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === 'admin123') {
      dentalStore.setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Nieprawidłowe hasło. Wprowadź hasło: admin123');
    }
  };

  const handleLogout = () => {
    dentalStore.setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Statystyki dla personelu
  const pendingCount = appointments.filter((a) => a.status === 'oczekujaca').length;
  const confirmedCount = appointments.filter((a) => a.status === 'potwierdzona').length;
  const urgentCount = appointments.filter((a) => a.isUrgentPain && a.status === 'oczekujaca').length;

  // Filtrowane rezerwacje
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      apt.patientPhone.includes(appointmentSearch) ||
      apt.patientEmail.toLowerCase().includes(appointmentSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obsługa dodania promocji
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.title || !newPromo.promoCode) return;

    dentalStore.savePromotion({
      id: 'promo-' + Math.random().toString(36).substring(2, 7),
      title: newPromo.title,
      badge: newPromo.badge,
      discountText: newPromo.discountText,
      description: newPromo.description,
      promoCode: newPromo.promoCode.toUpperCase(),
      validUntil: newPromo.validUntil,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      showInHeroBadge: newPromo.showInHeroBadge,
    });

    setShowPromoModal(false);
    setNewPromo({
      title: '',
      badge: 'Oferta specjalna',
      discountText: '',
      description: '',
      promoCode: '',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      showInHeroBadge: true,
    });
  };

  // Obsługa przełączania widoczności całej sekcji promocji
  const handleTogglePromotionsSection = () => {
    const next = !promotionsSectionEnabled;
    dentalStore.setPromotionsSectionEnabled(next);
    setPromotionsSectionEnabled(next);
  };

  // Obsługa dodania usługi
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name) return;
    dentalStore.saveService({
      ...newService,
      id: 'srv-' + Math.random().toString(36).substring(2, 7),
    });
    setShowServiceModal(false);
  };

  // --- EKRAN LOGOWANIA ---
  if (!isAuthenticated) {
    return (
      <div className="py-24 px-4 bg-slate-100 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900">
            Panel Personelu DentaNova
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm text-center mt-1 mb-6">
            Dostęp chroniony dla recepcji i personelu medycznego.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hasło personelu / Token
              </label>
              <input
                type="password"
                placeholder="Wpisz hasło (domyślne: admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Zaloguj się do panelu
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setPasswordInput('admin123');
                dentalStore.setAdminAuthenticated(true);
                setIsAuthenticated(true);
              }}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 cursor-pointer"
            >
              👉 Szybkie logowanie demo (admin123)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ZALOGOWANY PANEL ADMINISTRATORA ---
  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      
      {/* Pasek górny panelu */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              CMS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Panel Personelu Gabinetu</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  D1 SQLite Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Zarządzanie rezerwacjami, blokadami lekarzy, cennikiem i promocjami</p>
            </div>
          </div>

          {/* Szybkie statystyki */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Nowe zgłoszenia:</span>{' '}
              <strong className="text-amber-400">{pendingCount}</strong>
            </div>
            {urgentCount > 0 && (
              <div className="bg-rose-950/80 border border-rose-600/50 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-rose-300 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Ostry ból: <strong>{urgentCount}</strong></span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              Wyloguj
            </button>
          </div>
        </div>
      </div>

      {/* Nawigacja zakładek CMS */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Rezerwacje i Zgłoszenia</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'blocked'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Grafik & Wolne Terminy ({blockedSlots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'doctors'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lekarze & Zespół ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'promotions'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>CMS Promocji ({promotions.length})</span>
            {!promotionsSectionEnabled && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'promotions' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
              }`}>
                Wyłączona
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cennik i Usługi ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'webhooks'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dziennik Zdarzeń & Resend ({webhookLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Wszystkie Grafiki & Media (CMS)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'media' ? 'bg-white/20 text-white' : 'bg-sky-100 text-[#1B64A5]'}`}>
              Pełny CMS
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Panel Hero ({heroSlides.length})</span>
          </button>
        </div>
      </div>

      {/* GŁÓWNA ZAWARTOŚĆ ZAKŁADEK */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

        {/* ========================================================
            ZAKŁADKA 1: REZERWACJE
        ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            {/* Pasek filtrowania i wyszukiwania */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
                {['all', 'oczekujaca', 'potwierdzona', 'zrealizowana', 'anulowana'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' ? 'Wszystkie' : st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj pacjenta / telefonu..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Tabela rezerwacji */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Pacjent</th>
                      <th className="px-5 py-3.5">Zabieg & Lekarz</th>
                      <th className="px-5 py-3.5">Termin</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Uwagi kliniczne</th>
                      <th className="px-5 py-3.5 text-right">Akcja personelu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                          Brak zgłoszeń pasujących do podanych kryteriów.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const srv = services.find((s) => s.id === apt.serviceId);
                        const doc = doctors.find((d) => d.id === apt.doctorId);

                        return (
                          <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Pacjent */}
                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                {apt.patientName}
                                {apt.isUrgentPain && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-extrabold flex items-center gap-0.5">
                                    <AlertTriangle className="w-3 h-3" /> BÓL
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                                <span>{apt.patientPhone}</span>
                                <span>•</span>
                                <span>{apt.patientEmail}</span>
                              </div>
                            </td>

                            {/* Zabieg & Lekarz */}
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800">{srv?.name || 'Zabieg stomatologiczny'}</div>
                              <div className="text-slate-500 text-[11px]">{doc?.name}</div>
                            </td>

                            {/* Termin */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{apt.date}</div>
                              <div className="text-emerald-700 font-semibold text-xs">godz. {apt.timeSlot}</div>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  apt.status === 'potwierdzona'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : apt.status === 'oczekujaca'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : apt.status === 'zrealizowana'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {apt.status.toUpperCase()}
                              </span>
                            </td>

                            {/* Uwagi */}
                            <td className="px-5 py-4 max-w-xs">
                              <p className="text-slate-600 text-xs italic truncate" title={apt.notes || 'Brak uwag'}>
                                {apt.notes || '—'}
                              </p>
                            </td>

                            {/* Akcja */}
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {apt.status !== 'potwierdzona' && (
                                  <button
                                    onClick={() => dentalStore.updateAppointmentStatus(apt.id, 'potwierdzona')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                                    title="Zmień na potwierdzona"
                                  >
                                    Potwierdź
                                  </button>
                                )}
                                {apt.status !== 'zrealizowana' && (
                                  <button
                                    onClick={() => dentalStore.updateAppointmentStatus(apt.id, 'zrealizowana')}
                                    className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                                    title="Zmień na zrealizowana"
                                  >
                                    Zrealizowano
                                  </button>
                                )}
                                {apt.status !== 'anulowana' && (
                                  <button
                                    onClick={() => dentalStore.updateAppointmentStatus(apt.id, 'anulowana')}
                                    className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors border border-rose-200 cursor-pointer"
                                    title="Anuluj wizytę"
                                  >
                                    Anuluj
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            ZAKŁADKA 2: KALENDARZ & BLOKADY TERMINÓW LEKARZY
        ======================================================== */}
        {activeTab === 'blocked' && (
          <ScheduleManager
            doctors={doctors}
            blockedSlots={blockedSlots}
            appointments={appointments}
            services={services}
          />
        )}

        {/* ========================================================
            ZAKŁADKA 3: CMS LEKARZY (EDYCJA OPISÓW, ZDJĘĆ, WIDOCZNOŚĆ)
        ======================================================== */}
        {activeTab === 'doctors' && (
          <DoctorsManager doctors={doctors} services={services} />
        )}

        {/* ========================================================
            ZAKŁADKA 4: CMS PROMOCJI & OFERT SPECJALNYCH
        ======================================================== */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            {/* Główny przełącznik włączania / wyłączania całej sekcji */}
            <div className={`p-6 rounded-2xl border transition-all ${
              promotionsSectionEnabled
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-emerald-200 shadow-sm'
                : 'bg-gradient-to-r from-amber-50/90 via-rose-50/40 to-white border-amber-300 shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    promotionsSectionEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {promotionsSectionEnabled ? (
                      <Eye className="w-6 h-6" />
                    ) : (
                      <EyeOff className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-base font-extrabold text-slate-900">
                        Widoczność sekcji Ofert Specjalnych
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        promotionsSectionEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${promotionsSectionEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {promotionsSectionEnabled ? 'SEKCJA WŁĄCZONA (WIDOCZNA)' : 'SEKCJA WYŁĄCZONA (CAŁKOWICIE UKRYTA)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {promotionsSectionEnabled ? (
                        <>
                          Sekcja z ofertami specjalnymi i pakietami rabatowymi jest <strong>obecnie włączona i widoczna dla pacjentów</strong> na stronie głównej gabinetu. Link «Oferty» jest aktywny w menu nawigacji.
                        </>
                      ) : (
                        <>
                          Cała sekcja ofert specjalnych została <strong>wyłączona i ukryta</strong>. Pacjenci nie widzą żadnych promocji na stronie głównej, a odnośnik «Oferty» został usunięty z menu nawigacji. Wszystkie promocje pozostają zapisane w systemie.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Przycisk Master Switch */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleTogglePromotionsSection}
                    className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 shadow-md transition-all cursor-pointer ${
                      promotionsSectionEnabled
                        ? 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {promotionsSectionEnabled ? (
                      <>
                        <EyeOff className="w-4 h-4 text-rose-500" />
                        <span>Wyłącz całą sekcję ofert</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-white" />
                        <span>Włącz całą sekcję ofert</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pasek statusu podsumowujący */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <span>Liczba ofert w bazie: <strong className="text-slate-700">{promotions.length}</strong></span>
                  <span>•</span>
                  <span>Aktywne pozycje: <strong className="text-emerald-700">{promotions.filter((p) => p.isActive).length}</strong></span>
                  <span>•</span>
                  <span>Wstrzymane pozycje: <strong className="text-slate-600">{promotions.filter((p) => !p.isActive).length}</strong></span>
                </div>
                {!promotionsSectionEnabled ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    ⚠️ Pacjenci nie widzą sekcji dopóki nie zostanie włączona powyższym przyciskiem
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ Sekcja wyświetla się poprawnie na stronie głównej
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Headless CMS: Okresowe Promocje</h3>
                <p className="text-xs text-slate-500">
                  Recepcja może dodawać i edytować promocje bez wsparcia programisty. Zmiany pojawiają się natychmiast na stronie pacjenta.
                </p>
              </div>
              <button
                onClick={() => setShowPromoModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Dodaj nową promocję
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        {promo.badge}
                      </span>
                      <button
                        onClick={() => dentalStore.deletePromotion(promo.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Usuń promocję"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{promo.title}</h4>
                    <p className="text-xs font-semibold text-emerald-700 mt-1">{promo.discountText}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{promo.description}</p>

                    <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                      <span>KOD: {promo.promoCode}</span>
                      <span className="text-[11px] font-sans font-normal text-slate-400">Do: {promo.validUntil}</span>
                    </div>

                    {/* Przełącznik etykiety w Hero */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!promo.showInHeroBadge}
                          onChange={() => dentalStore.togglePromotionHeroBadge(promo.id)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>Wyróżnij w etykiecie Hero</span>
                      </label>
                      {promo.showInHeroBadge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          promotionsSectionEnabled
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {promotionsSectionEnabled ? '✨ Aktywna w Hero' : 'Etykieta wstrzymana'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Status w D1:</span>
                      {!promotionsSectionEnabled && promo.isActive && (
                        <span className="text-[10px] text-amber-600 font-medium">(sekcja wyłączona)</span>
                      )}
                    </div>
                    <button
                      onClick={() => dentalStore.savePromotion({ ...promo, isActive: !promo.isActive })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        promo.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {promo.isActive ? 'Aktywna' : 'Wstrzymana'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal nowej promocji */}
            {showPromoModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Stwórz nową ofertę promocyjną (CMS)
                  </h3>
                  <form onSubmit={handleCreatePromo} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tytuł oferty</label>
                      <input
                        type="text"
                        placeholder="np. Pakiet Higienizacyjny 4w1 -20%"
                        value={newPromo.title}
                        onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Etykieta (Badge)</label>
                        <input
                          type="text"
                          placeholder="np. Wiosenna okazja"
                          value={newPromo.badge}
                          onChange={(e) => setNewPromo({ ...newPromo, badge: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Kod rabatowy</label>
                        <input
                          type="text"
                          placeholder="np. WIOSNA20"
                          value={newPromo.promoCode}
                          onChange={(e) => setNewPromo({ ...newPromo, promoCode: e.target.value.toUpperCase() })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Krótki opis rabatu</label>
                      <input
                        type="text"
                        placeholder="np. -20% na skaling i piaskowanie dla nowych pacjentów"
                        value={newPromo.discountText}
                        onChange={(e) => setNewPromo({ ...newPromo, discountText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pełny opis warunków</label>
                      <textarea
                        rows={2}
                        placeholder="Szczegóły zabiegu..."
                        value={newPromo.description}
                        onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ważne do dnia</label>
                      <input
                        type="date"
                        value={newPromo.validUntil}
                        onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                      />
                    </div>

                    <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPromo.showInHeroBadge}
                          onChange={(e) => setNewPromo({ ...newPromo, showInHeroBadge: e.target.checked })}
                          className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Wyświetlaj tę ofertę na etykiecie Hero (banner powitalny)
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Etykieta na samej górze strony będzie aktywna automatycznie, dopóki całościowy panel ofert jest włączony.
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPromoModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                      >
                        Publikuj promocję
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            ZAKŁADKA 4: CENNIK I USŁUGI (HEADLESS CMS)
        ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Zarządzanie Cennikiem Usług</h3>
                <p className="text-xs text-slate-500">
                  Edycja cen, czasu trwania oraz opisów zabiegów w bazie SQLite Cloudflare D1.
                </p>
              </div>
              <button
                onClick={() => setShowServiceModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Dodaj nową pozycję cennika
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Zabieg</th>
                      <th className="px-5 py-3.5">Kategoria</th>
                      <th className="px-5 py-3.5">Czas</th>
                      <th className="px-5 py-3.5">Cena (PLN)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {srv.name}
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {srv.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {srv.durationMinutes} min
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {srv.pricePln} PLN
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            Aktywny
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => dentalStore.deleteService(srv.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Usuń usługę"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal nowej usługi */}
            {showServiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Dodaj zabieg do cennika
                  </h3>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nazwa zabiegu</label>
                      <input
                        type="text"
                        placeholder="np. Skaling poddziąsłowy"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kategoria</label>
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                      >
                        <option value="Zachowawcza">Zachowawcza</option>
                        <option value="Higienizacja">Higienizacja</option>
                        <option value="Endodoncja">Endodoncja</option>
                        <option value="Implantologia">Implantologia</option>
                        <option value="Ortodoncja">Ortodoncja</option>
                        <option value="Protetyka">Protetyka</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cena (PLN)</label>
                        <input
                          type="number"
                          value={newService.pricePln}
                          onChange={(e) => setNewService({ ...newService, pricePln: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Czas trwania (min)</label>
                        <input
                          type="number"
                          value={newService.durationMinutes}
                          onChange={(e) => setNewService({ ...newService, durationMinutes: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Opis dla pacjenta</label>
                      <textarea
                        rows={2}
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowServiceModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                      >
                        Zapisz usługę
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            ZAKŁADKA 5: DZIENNIK ZDARZEŃ, RESEND API & WEBHOOKI
        ======================================================== */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dziennik Zdarzeń & Transakcyjnych Integracji</h3>
                <p className="text-xs text-slate-500">
                  Podgląd wywołań Resend API (e-maile do pacjentów) oraz webhooków powiadomień personelu.
                </p>
              </div>
              <button
                onClick={() => dentalStore.resetToDefaults()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetuj dane demonstracyjne
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              {webhookLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Brak zarejestrowanych wywołań webhooków. Złóż nowe zgłoszenie rezerwacji w formularzu publicznym, aby zobaczyć zdarzenie na żywo!
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg text-white ${
                        log.type === 'RESEND_EMAIL' ? 'bg-emerald-600' : 'bg-purple-600'
                      }`}>
                        {log.type === 'RESEND_EMAIL' ? <Mail className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{log.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {log.status}
                          </span>
                        </div>
                        <pre className="text-[11px] text-slate-600 mt-1 font-mono bg-white p-2 rounded-lg border border-slate-200 overflow-x-auto max-w-2xl">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            ZAKŁADKA: WSZYSTKIE GRAFIKI & MEDIA (CMS)
        ======================================================== */}
        {activeTab === 'media' && (
          <MediaManager
            onOpenHeroModal={() => {
              setEditingHeroSlide({
                id: `hero-${Date.now()}`,
                title: 'Nowa Specjalizacja DentaNova',
                subtitle: 'Opis zabiegów i korzyści dla pacjenta',
                specialtyTag: 'NOWOŚĆ',
                badge: 'Nowoczesna Stomatologia',
                floatingBadge: 'Standard DentaNova',
                imageUrl: '/images/hero-protetyka.jpg',
                isActive: true,
                order: heroSlides.length + 1,
              });
              setShowHeroModal(true);
            }}
          />
        )}

        {/* ========================================================
            ZAKŁADKA: HERO & ZDJĘCIA PANELU
        ======================================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#1B64A5]" />
                  Zarządzanie Zdjęciami w Panelu Hero
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kontroluj zdjęcia i treści wyświetlane w interaktywnym prawym panelu sekcji głównej Hero. Możesz zmieniać zdjęcia, etykiety specjalizacji oraz włączać/wyłączać poszczególne slajdy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (confirm('Czy na pewno chcesz przywrócić domyślne slajdy i zdjęcia panelu Hero?')) {
                      dentalStore.resetHeroSlides();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Przywróć domyślne</span>
                </button>
                <button
                  onClick={() => {
                    setEditingHeroSlide({
                      id: `hero-${Date.now()}`,
                      title: 'Nowa Specjalizacja DentaNova',
                      subtitle: 'Opis zabiegów i korzyści dla pacjenta',
                      specialtyTag: 'NOWOŚĆ',
                      badge: 'Nowoczesna Stomatologia',
                      floatingBadge: 'Standard DentaNova',
                      imageUrl: '/images/hero-protetyka.jpg',
                      isActive: true,
                      order: heroSlides.length + 1,
                    });
                    setShowHeroModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#1B64A5]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dodaj nowy slajd</span>
                </button>
              </div>
            </div>

            {/* Siatka slajdów */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {heroSlides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col shadow-sm ${
                    slide.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}
                >
                  {/* Podgląd zdjęcia */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Pozycja w kolejce */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                      Slajd #{index + 1}
                    </div>

                    {/* Tag specjalizacji */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-[#1B64A5] text-[10px] font-bold text-white shadow-sm">
                      {slide.specialtyTag}
                    </div>

                    {/* Floating badge */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[10px] font-semibold text-sky-200 block truncate">
                        {slide.floatingBadge}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">
                        {slide.title}
                      </h4>
                    </div>
                  </div>

                  {/* Informacje i akcje */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {slide.subtitle}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[150px] font-mono text-[10px] text-slate-400">
                          {slide.imageUrl.startsWith('/images/') ? 'Plik lokalny AI' : 'Zewnętrzny URL'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          slide.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {slide.isActive ? 'Aktywny' : 'Ukryty'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => dentalStore.toggleHeroSlideVisibility(slide.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                          slide.isActive 
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                        title={slide.isActive ? 'Ukryj w karuzeli Hero' : 'Aktywuj w karuzeli Hero'}
                      >
                        {slide.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{slide.isActive ? 'Ukryj' : 'Aktywuj'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingHeroSlide({ ...slide });
                          setShowHeroModal(true);
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#1B64A5] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-sky-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edytuj</span>
                      </button>

                      {heroSlides.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Czy na pewno usunąć slajd "${slide.title}"?`)) {
                              dentalStore.deleteHeroSlide(slide.id);
                            }
                          }}
                          className="py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer border border-rose-200"
                          title="Usuń slajd"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL EDYCJI / DODAWANIA SLAJDU HERO */}
        {showHeroModal && editingHeroSlide && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#1B64A5]" />
                  {heroSlides.some((s) => s.id === editingHeroSlide.id) ? 'Edycja Slajdu Hero' : 'Dodaj Nowy Slajd Hero'}
                </h3>
                <button
                  onClick={() => setShowHeroModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Etykieta specjalizacji (tag):
                    </label>
                    <input
                      type="text"
                      value={editingHeroSlide.specialtyTag}
                      onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, specialtyTag: e.target.value })}
                      placeholder="np. PROTETYKA, IMPLANTY"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#1B64A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pływająca plakietka (góra):
                    </label>
                    <input
                      type="text"
                      value={editingHeroSlide.floatingBadge}
                      onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, floatingBadge: e.target.value })}
                      placeholder="np. Projektowanie Uśmiechu DSD"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#1B64A5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Główny tytuł slajdu:
                  </label>
                  <input
                    type="text"
                    value={editingHeroSlide.title}
                    onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, title: e.target.value })}
                    placeholder="np. Precyzyjna Protetyka & Estetyka Uśmiechu"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#1B64A5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Podtytuł / Opis:
                  </label>
                  <textarea
                    rows={2}
                    value={editingHeroSlide.subtitle}
                    onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, subtitle: e.target.value })}
                    placeholder="np. Nowoczesne korony cyrkonowe, licówki estetyczne..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#1B64A5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dolny badge wyróżniający:
                  </label>
                  <input
                    type="text"
                    value={editingHeroSlide.badge}
                    onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, badge: e.target.value })}
                    placeholder="np. Pełna Metamorfoza Uśmiechu"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#1B64A5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Zdjęcia (lokalne z folderu public lub zewnętrzny link):
                  </label>
                  <input
                    type="text"
                    value={editingHeroSlide.imageUrl}
                    onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: e.target.value })}
                    placeholder="/images/hero-protetyka.jpg lub https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#1B64A5]"
                  />
                  
                  {/* Szybkie presety zdjęć kliniki */}
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                      Wybierz gotowe zdjęcie kliniki:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: '/images/hero-protetyka.jpg' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
                      >
                        Protetyka & Uśmiech
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: '/images/hero-implanty.jpg' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
                      >
                        Chirurgia & Implanty
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: '/images/hero-tomografia.jpg' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
                      >
                        Tomografia 3D CBCT
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop&q=80' })}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
                      >
                        Gabinet DentaNova
                      </button>
                    </div>
                  </div>

                  {/* Miniaturowy podgląd wybranego zdjęcia */}
                  {editingHeroSlide.imageUrl && (
                    <div className="mt-3 relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img
                        src={editingHeroSlide.imageUrl}
                        alt="Podgląd"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px]">
                        Podgląd miniatury
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="slideActive"
                    checked={editingHeroSlide.isActive}
                    onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#1B64A5] rounded cursor-pointer"
                  />
                  <label htmlFor="slideActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Slajd aktywny (widoczny w karuzeli Hero na stronie głównej)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowHeroModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingHeroSlide.title || !editingHeroSlide.imageUrl) {
                      alert('Wypełnij tytuł i adres URL zdjęcia.');
                      return;
                    }
                    dentalStore.saveHeroSlide(editingHeroSlide);
                    setShowHeroModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white text-xs font-bold transition-all shadow-md shadow-[#1B64A5]/25 cursor-pointer"
                >
                  Zapisz Slajd
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
