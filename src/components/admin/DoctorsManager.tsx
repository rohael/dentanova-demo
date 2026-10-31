import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Upload, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Search, 
  Sparkles, 
  UserCheck
} from 'lucide-react';
import { Doctor, Service } from '../../types';
import { dentalStore } from '../../services/storage';

interface DoctorsManagerProps {
  doctors: Doctor[];
  services?: Service[];
}

const PRESET_AVATARS = [
  {
    label: 'Męski 1 (Implantolog)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Żeński 1 (Endodoncja)',
    url: 'https://images.unsplash.com/photo-1594824813589-980b1e427771?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Żeński 2 (Ortodonta)',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Męski 2 (Stomatolog estetyczny)',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Męski 3 (Chirurg w kitlu)',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Żeński 3 (Pedodoncja / Ogólna)',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
  },
];

const ALL_DAYS = [
  'Poniedziałek', 
  'Wtorek', 
  'Środa', 
  'Czwartek', 
  'Piątek', 
  'Sobota'
];

export const DoctorsManager: React.FC<DoctorsManagerProps> = ({ doctors, services = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isNewDoctorModalOpen, setIsNewDoctorModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Formularz edycji / tworzenia
  const [formData, setFormData] = useState<Doctor>({
    id: '',
    name: '',
    title: '',
    specialization: '',
    pwzNumber: '',
    avatarUrl: PRESET_AVATARS[0].url,
    bio: '',
    workingDays: ['Poniedziałek', 'Środa', 'Piątek'],
    workingHoursStart: '08:30',
    workingHoursEnd: '16:00',
    isActive: true,
    serviceIds: [],
  });

  const showNotification = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleOpenNewModal = () => {
    setFormData({
      id: 'doc-' + Math.random().toString(36).substring(2, 7),
      name: '',
      title: 'lek. dent.',
      specialization: 'Stomatologia zachowawcza i estetyczna',
      pwzNumber: Math.floor(1000000 + Math.random() * 9000000).toString(),
      avatarUrl: PRESET_AVATARS[0].url,
      bio: '',
      workingDays: ['Poniedziałek', 'Środa', 'Piątek'],
      workingHoursStart: '08:30',
      workingHoursEnd: '16:00',
      isActive: true,
      serviceIds: services.slice(0, 2).map(s => s.id),
    });
    setEditingDoctor(null);
    setIsNewDoctorModalOpen(true);
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setFormData({
      ...doctor,
      isActive: doctor.isActive !== false,
      workingDays: doctor.workingDays || ['Poniedziałek'],
      serviceIds: doctor.serviceIds || [],
    });
    setEditingDoctor(doctor);
    setIsNewDoctorModalOpen(true);
  };

  const handleToggleServiceId = (serviceId: string) => {
    setFormData((prev) => {
      const current = prev.serviceIds || [];
      const updated = current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId];
      return { ...prev, serviceIds: updated };
    });
  };

  const handleToggleVisibility = (doctor: Doctor) => {
    dentalStore.toggleDoctorVisibility(doctor.id);
    const newStatus = doctor.isActive === false ? 'widoczny na stronie głównej' : 'ukryty przed pacjentami';
    showNotification(`Status lekarza ${doctor.name} został zmieniony: ${newStatus}`);
  };

  const handleDelete = (doctor: Doctor) => {
    if (window.confirm(`Czy na pewno chcesz usunąć profil lekarza ${doctor.name}?`)) {
      dentalStore.deleteDoctor(doctor.id);
      showNotification(`Lekarz ${doctor.name} został usunięty z bazy.`);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Proszę podać imię i nazwisko lekarza.');
      return;
    }
    if (!formData.bio.trim()) {
      alert('Proszę uzupełnić opis / biogram lekarza.');
      return;
    }

    dentalStore.saveDoctor({
      ...formData,
      name: formData.name.trim(),
      title: formData.title.trim(),
      specialization: formData.specialization.trim(),
      pwzNumber: formData.pwzNumber.trim(),
      bio: formData.bio.trim(),
      avatarUrl: formData.avatarUrl.trim() || PRESET_AVATARS[0].url,
      isActive: formData.isActive !== false,
    });

    setIsNewDoctorModalOpen(false);
    showNotification(
      editingDoctor 
        ? `Zaktualizowano profil lekarza ${formData.name}.` 
        : `Pomyślnie dodano nowego lekarza: ${formData.name}.`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Rozmiar pliku zdjęcia nie powinien przekraczać 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFormData((prev) => ({
            ...prev,
            avatarUrl: loadEvt.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const current = prev.workingDays || [];
      if (current.includes(day)) {
        if (current.length === 1) {
          alert('Lekarz musi przyjmować w przynajmniej 1 dzień tygodnia.');
          return prev;
        }
        return { ...prev, workingDays: current.filter((d) => d !== day) };
      } else {
        return { ...prev, workingDays: [...current, day] };
      }
    });
  };

  // Filtrowanie lekarzy
  const filteredDoctors = doctors.filter((doc) => {
    const isVisible = doc.isActive !== false;
    if (filterVisibility === 'visible' && !isVisible) return false;
    if (filterVisibility === 'hidden' && isVisible) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      doc.name.toLowerCase().includes(term) ||
      doc.specialization.toLowerCase().includes(term) ||
      doc.pwzNumber.includes(term) ||
      doc.bio.toLowerCase().includes(term)
    );
  });

  const visibleCount = doctors.filter((d) => d.isActive !== false).length;
  const hiddenCount = doctors.filter((d) => d.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Toast wewnętrzny */}
      {feedbackToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Górny pasek filtrów i akcji */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Zarządzanie profilem lekarzy (CMS)</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
              Łącznie: {doctors.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pełna edycja opisów, zdjęć oraz natychmiastowe włączanie lub wyłączanie widoczności lekarza na stronie głównej i w formularzu rezerwacji.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj nowego lekarza</span>
          </button>
        </div>
      </div>

      {/* Filtry wyszukiwania i przełączniki widoczności */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj po nazwisku, PWZ, specjalizacji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium mr-1 shrink-0">Filtr widoczności:</span>
          <button
            onClick={() => setFilterVisibility('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterVisibility === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Wszyscy ({doctors.length})
          </button>
          <button
            onClick={() => setFilterVisibility('visible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterVisibility === 'visible' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Widoczni na stronie ({visibleCount})
          </button>
          <button
            onClick={() => setFilterVisibility('hidden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterVisibility === 'hidden' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Ukryci na stronie ({hiddenCount})
          </button>
        </div>
      </div>

      {/* Lista / Karty Lekarzy */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nie znaleziono lekarzy spełniających kryteria</h3>
          <p className="text-xs text-slate-400 mt-1">Zmień frazę wyszukiwania lub zresetuj filtr widoczności.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => {
            const isVisible = doc.isActive !== false;
            return (
              <div
                key={doc.id}
                className={`bg-white rounded-3xl border transition-all p-6 shadow-sm flex flex-col justify-between gap-5 relative ${
                  isVisible ? 'border-slate-200 hover:border-purple-300' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Górna część: Zdjęcie + Dane */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Zdjęcie profilowe */}
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-sm bg-slate-100"
                      onError={(e) => {
                        // Fallback jeśli błędny URL
                        (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                      }}
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs flex items-center gap-1 ${
                        isVisible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Widoczny
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Ukryty
                        </>
                      )}
                    </div>
                  </div>

                  {/* Informacje o lekarzu */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                        {doc.specialization}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono shrink-0">
                        PWZ: {doc.pwzNumber}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {doc.title}
                    </p>

                    {/* Dni i godziny przyjęć */}
                    <div className="pt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold">Dni przyjęć:</span>
                        <span className="text-slate-700">{doc.workingDays.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold">Godziny:</span>
                        <span className="text-slate-700">{doc.workingHoursStart} - {doc.workingHoursEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przypisane usługi */}
                <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#1B64A5] uppercase tracking-wider flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Wykonywane zabiegi ({(doc.serviceIds || []).length}):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {services
                      .filter((s) => doc.serviceIds?.includes(s.id))
                      .map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-white text-sky-900 border border-sky-200 text-[10px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    {(doc.serviceIds || []).length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        Brak przypisanych zabiegów – kliknij edytuj, aby przypisać.
                      </span>
                    )}
                  </div>
                </div>

                {/* Opis / Biografia */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Opis / Biogram na stronie:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {doc.bio.length} znaków
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {doc.bio}
                  </p>
                </div>

                {/* Dolny pasek akcji: Szybki Toggle Widoczności + Edycja + Usunięcie */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Przełącznik widoczności na stronie */}
                  <button
                    onClick={() => handleToggleVisibility(doc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                    title={isVisible ? 'Kliknij, aby ukryć lekarza na stronie i w rezerwacji' : 'Kliknij, aby włączyć wyświetlanie lekarza'}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ukryj na stronie</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pokaż na stronie</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edytuj profil i zdjęcie</span>
                    </button>

                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Usuń profil lekarza"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: EDYCJA / DODAWANIE LEKARZA
      ======================================================== */}
      {isNewDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Nagłówek modalu */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingDoctor ? 'Edycja profilu lekarza' : 'Dodaj nowego lekarza stomatologa'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wszystkie zmiany zostaną natychmiast uwzględnione w witrynie oraz w kalendarzu D1.
                </p>
              </div>
              <button
                onClick={() => setIsNewDoctorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6 pt-4">
              
              {/* 1. SEKCJA WIDOCZNOŚCI NA STRONIE (KLUCZOWY TOGGLE) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Widoczność na stronie internetowej
                    </span>
                    {formData.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        WŁĄCZONY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        UKRYTY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Gdy włączone: lekarz jest prezentowany w sekcji „Nasi lekarze” oraz w liście wyboru formularza rezerwacji.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-800">
                    {formData.isActive ? 'Wyświetlaj' : 'Ukryj'}
                  </span>
                </label>
              </div>

              {/* 2. ZDJĘCIE PROFILOWE (PEŁNA EDYCJA + PODGLĄD + GALERIA) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Zdjęcie lekarza (Avatar)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Podgląd live miniatury */}
                  <div className="relative shrink-0">
                    <img
                      src={formData.avatarUrl}
                      alt="Podgląd zdjęcia"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500 shadow-md bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                      }}
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-purple-600 text-white p-1 rounded-full text-[10px]">
                      <ImageIcon className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Wprowadzanie URL lub wgrywanie pliku */}
                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600">Link URL do zdjęcia:</span>
                      <input
                        type="url"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>Wgraj z komputera (plik)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">lub wybierz gotowe zdjęcie poniżej</span>
                    </div>
                  </div>
                </div>

                {/* Szybki wybór ze sprawdzonych portretów medycznych */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                    Szybki wybór ze sprawdzonych portretów stomatologicznych:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group ${
                          formData.avatarUrl === preset.url 
                            ? 'border-purple-600 ring-2 ring-purple-200' 
                            : 'border-transparent hover:border-purple-300'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-12 object-cover rounded-lg"
                        />
                        {formData.avatarUrl === preset.url && (
                          <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. PODSTAWOWE DANE LEKARZA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Imię i nazwisko lekarza *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="np. dr n. med. Michał Zarzycki"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tytuł naukowy / zawodowy
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="np. Chirurg stomatologiczny, Implantolog"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Główna specjalizacja *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="np. Implantologia i chirurgia mikronaczyniowa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numer PWZ (Prawo Wykonywania Zawodu) *
                  </label>
                  <input
                    type="text"
                    value={formData.pwzNumber}
                    onChange={(e) => setFormData({ ...formData, pwzNumber: e.target.value })}
                    placeholder="np. 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 4. PEŁNY OPIS / BIOGRAFIA (BIO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Pełny opis / Biogram lekarza na stronie *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.bio.length} znaków
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Opisz doświadczenie kliniczne, ukończone uczelnie, przynależność do stowarzyszeń (np. PSI, PTE, ICOI) oraz podejście do pacjentów..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ten tekst pojawia się bezpośrednio na karcie lekarza na stronie głównej gabinetu.
                </p>
              </div>

              {/* 5. DNI PRZYJĘĆ I GODZINY PRACY */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Harmonogram pracy w klinice
                </label>

                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Dni przyjęć w tygodniu:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_DAYS.map((day) => {
                      const isSelected = formData.workingDays?.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Godzina rozpoczęcia:
                    </span>
                    <input
                      type="time"
                      value={formData.workingHoursStart}
                      onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Godzina zakończenia:
                    </span>
                    <input
                      type="time"
                      value={formData.workingHoursEnd}
                      onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Gabinet / Sala zabiegowa:
                    </span>
                    <input
                      type="text"
                      value={formData.room || ''}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="np. Gabinet 1 – Chirurgia"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Interwał slotu (minuty):
                    </span>
                    <select
                      value={formData.slotDurationMinutes || 45}
                      onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                    >
                      <option value={30}>30 minut</option>
                      <option value={45}>45 minut (standard)</option>
                      <option value={60}>60 minut</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. PRZYPISANIE USŁUG I ZABIEGÓW */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1B64A5]" />
                    Przypisane zabiegi & kwalifikacje kliniczne *
                  </label>
                  <span className="text-[11px] font-semibold text-[#1B64A5]">
                    Wybrano: {(formData.serviceIds || []).length} / {services.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Zaznacz usługi, które ten lekarz wykonuje w gabinecie. W formularzu rezerwacji pacjent zobaczy tego specjalistę tylko przy wyborze odpowiedniego zabiegu.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-52 overflow-y-auto pr-1">
                  {services.map((srv) => {
                    const isChecked = formData.serviceIds?.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleToggleServiceId(srv.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-[#1B64A5] text-[#1B64A5] shadow-xs font-semibold'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 mt-0.5 rounded text-[#1B64A5] focus:ring-[#1B64A5] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="truncate">{srv.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {srv.pricePln} PLN • {srv.category}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Przyciski modalu */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDoctorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDoctor ? 'Zapisz zmiany w profilu' : 'Zapisz nowego lekarza'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
