import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileText,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Service, Doctor } from '../types';

interface ServicesPricingProps {
  services: Service[];
  doctors?: Doctor[];
  onSelectService: (service: Service) => void;
}

const CATEGORIES = [
  'Wszystkie',
  'Chirurgia stomatologiczna',
  'Chirurgia szczękowo-twarzowa',
  'Implanty',
  'Stomatologia zachowawcza',
  'Endodoncja',
  'Stomatologia dziecięca',
  'Protetyka',
  'Periodontologia',
  'Tomografia Komputerowa 3D i RTG',
] as const;

export const ServicesPricing: React.FC<ServicesPricingProps> = ({
  services,
  doctors = [],
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (!srv.isActive) return false;
      const matchesCat = selectedCategory === 'Wszystkie' || srv.category === selectedCategory || srv.name === selectedCategory;
      const matchesSearch = 
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <section id="uslugi" className="py-20 bg-slate-50/50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek sekcji - dokładnie jak w przesłanym projekcie: NASZE USŁUGI */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-wider uppercase mb-3">
            NASZE USŁUGI
          </h2>
          <div className="w-16 h-1 bg-[#1B64A5] mx-auto rounded-full mb-4" />
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Klinika DentaNova oferuje pełen zakres leczenia stomatologicznego, chirurgicznego oraz nowoczesną diagnostykę obrazową 3D w jednym miejscu.
          </p>
        </div>

        {/* Pasek filtrowania i wyszukiwania */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Kategorie (Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1B64A5] text-white shadow-sm'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Wyszukiwarka */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Szukaj zabiegu np. implanty, tomografia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B64A5] focus:border-transparent transition-all"
            />
          </div>

        </div>

        {/* Siatka usług - 3 kolumny jak w załączniku od użytkownika */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Brak usług pasujących do podanych kryteriów.</p>
            <button
              onClick={() => { setSelectedCategory('Wszystkie'); setSearchQuery(''); }}
              className="mt-3 text-xs text-[#1B64A5] font-semibold hover:underline cursor-pointer"
            >
              Wyczyść filtry wyszukiwania
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden card-subtle flex flex-col justify-between group"
              >
                <div>
                  {/* Zdjęcie usługi - wzorowane na przesłanym szablonie */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm font-medium">
                        DentaNova
                      </div>
                    )}
                    
                    {/* Badge z czasem trwania */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur-xs text-slate-200 text-[10px] font-mono flex items-center gap-1 shadow-xs border border-slate-700/60">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{service.durationMinutes} min</span>
                    </div>

                    {service.isPopular && (
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-[#1B64A5] text-white text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        Główny profil
                      </div>
                    )}
                  </div>

                  {/* Treść kafelka */}
                  <div className="p-6">
                    {/* Tytuł usługi dokładnie jak na grafice */}
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1B64A5] transition-colors leading-snug">
                      {service.name}
                    </h3>
                    
                    {/* Opis kliniczny */}
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Powiązani specjaliści wykonujący dany zabieg */}
                    {(() => {
                      const serviceDoctors = doctors.filter(d => d.isActive !== false && d.serviceIds?.includes(service.id));
                      if (serviceDoctors.length === 0) return null;
                      return (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#1B64A5]" />
                            Lekarz prowadzący:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {serviceDoctors.map((doc) => (
                              <span
                                key={doc.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                                title={`${doc.name} (${doc.specialization})`}
                              >
                                <img 
                                  src={doc.avatarUrl} 
                                  alt={doc.name} 
                                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0" 
                                />
                                <span className="truncate max-w-[130px]">
                                  {doc.name.replace('dr n. med. ', '').replace('lek. dent. ', '')}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Dolny pasek: cena i przycisk rezerwacji */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Cena od</span>
                    <div className="text-2xl font-black text-slate-900">
                      {service.pricePln} <span className="text-xs font-semibold text-slate-500">PLN</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectService(service)}
                    className="btn-subtle inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Umów wizytę</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
