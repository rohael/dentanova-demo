import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Plus, 
  Sparkles, 
  Info, 
  X, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Trash2
} from 'lucide-react';
import { MediaAsset, MediaCategory, HeroSlide } from '../../types';
import { dentalStore } from '../../services/storage';

interface MediaManagerProps {
  onOpenHeroModal?: () => void;
}

// Kolekcja wyselekcjonowanych, gotowych fotografii stomatologicznych HD do szybkiego wyboru
const PRESET_DENTAL_GALLERY = [
  // Portrety i lekarze
  {
    category: 'doctors',
    label: 'Chirurg stomatologiczny męski',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'doctors',
    label: 'Lekarz stomatolog męski w okularach',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'doctors',
    label: 'Lekarka stomatolog uśmiechnięta',
    url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'doctors',
    label: 'Lekarka specjalista endodoncji',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'doctors',
    label: 'Stomatolog dziecięcy / pedodonta',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80',
  },

  // Zabiegi & Usługi & Hero
  {
    category: 'services',
    label: 'Implant zębowy i chirurgia',
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Ekstrakcja & chirurgia stomatologiczna',
    url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Chirurgia rekonstrukcyjna twarzoczaszki',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Leczenie zachowawcze i wypełnienia',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Mikroskop Carl Zeiss i kanałowe',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Stomatologia dziecięca & adaptacja',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Protetyka, licówki & biały uśmiech',
    url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Periodontologia i higienizacja',
    url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=900&auto=format&fit=crop&q=80',
  },
  {
    category: 'services',
    label: 'Tomografia CBCT 3D & diagnostyka RTG',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&auto=format&fit=crop&q=80',
  },

  // Hero & Gabinety
  {
    category: 'hero',
    label: 'DentaNova Protetyka & Uśmiech (Lokalny AI)',
    url: '/images/hero-protetyka.jpg',
  },
  {
    category: 'hero',
    label: 'DentaNova Implanty & Chirurgia (Lokalny AI)',
    url: '/images/hero-implanty.jpg',
  },
  {
    category: 'hero',
    label: 'DentaNova Pracownia Tomografii 3D (Lokalny AI)',
    url: '/images/hero-tomografia.jpg',
  },
  {
    category: 'clinic',
    label: 'Nowoczesny gabinet zabiegowy DentaNova',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop&q=80',
  },
];

export const MediaManager: React.FC<MediaManagerProps> = ({ onOpenHeroModal }) => {
  const [assets, setAssets] = useState<MediaAsset[]>(() => dentalStore.getAllMediaAssets());
  const [activeCategory, setActiveCategory] = useState<MediaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal edycji grafiki
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  
  // Modal podglądu w powiększeniu
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Komunikaty sukcesu
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshAssets = () => {
    setAssets(dentalStore.getAllMediaAssets());
  };

  useEffect(() => {
    const unsubscribe = dentalStore.subscribe(refreshAssets);
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Obsługa otwarcia edytora grafiki
  const handleOpenEdit = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setNewImageUrl(asset.imageUrl);
    setNewTitle(asset.title);
  };

  // Zapis zmian
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !newImageUrl.trim()) {
      alert('Proszę podać adres URL grafiki lub wgrać plik.');
      return;
    }

    dentalStore.updateMediaAsset(editingAsset.id, newImageUrl.trim(), newTitle.trim());
    showToast(`Pomyślnie zaktualizowano grafikę dla: "${editingAsset.title}"`);
    setEditingAsset(null);
    refreshAssets();
  };

  // Przywrócenie domyślnej grafiki dla pojedynczej pozycji
  const handleRestoreDefaultSingle = (asset: MediaAsset) => {
    if (asset.defaultImageUrl) {
      dentalStore.updateMediaAsset(asset.id, asset.defaultImageUrl);
      showToast(`Przywrócono domyślną grafikę dla "${asset.title}"`);
      refreshAssets();
      if (editingAsset && editingAsset.id === asset.id) {
        setNewImageUrl(asset.defaultImageUrl);
      }
    }
  };

  // Przywrócenie wszystkich grafik
  const handleResetAllMedia = () => {
    if (window.confirm('Czy na pewno chcesz przywrócić fabryczne zdjęcia dla wszystkich elementów strony (Hero, usługi, lekarze, placówka)?')) {
      dentalStore.resetAllMediaAssets();
      showToast('Wszystkie grafiki w serwisie zostały zresetowane do ustawień domyślnych.');
      refreshAssets();
    }
  };

  // Wgrywanie pliku z komputera jako Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Rozmiar pliku grafiki nie powinien przekraczać 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtrowanie grafik
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      asset.title.toLowerCase().includes(term) ||
      (asset.subcategory && asset.subcategory.toLowerCase().includes(term)) ||
      asset.locationLabel.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  // Statystyki
  const countAll = assets.length;
  const countHero = assets.filter(a => a.category === 'hero').length;
  const countServices = assets.filter(a => a.category === 'services').length;
  const countDoctors = assets.filter(a => a.category === 'doctors').length;
  const countClinic = assets.filter(a => a.category === 'clinic').length;

  return (
    <div className="space-y-6">
      {/* Toast wewnętrzny */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Górny panel nagłówka CMS Mediów */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-[#1B64A5]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Menedżer Wszystkich Grafik & Mediów (CMS)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1B64A5] text-white font-bold">
                  {countAll} pozycji
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralne miejsce do edycji wszystkich zdjęć na stronie: slajdów Hero, miniatur usług i cennika, portretów lekarzy oraz gabinetów.
              </p>
            </div>
          </div>
        </div>

        {/* Globalne przyciski akcji */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onOpenHeroModal && (
            <button
              onClick={onOpenHeroModal}
              className="px-3.5 py-2 rounded-xl bg-[#1B64A5] hover:bg-[#154d80] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj slajd Hero</span>
            </button>
          )}

          <button
            onClick={handleResetAllMedia}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Przywróć domyślne zdjęcia we wszystkich sekcjach"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Przywróć domyślne</span>
          </button>
        </div>
      </div>

      {/* Pasek filtrów zakładek i wyszukiwania */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Zakładki kategorii */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>Wszystkie grafiki</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('hero')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'hero'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>Sekcja Hero & Banery</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'hero' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countHero}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('services')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'services'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>Usługi & Cennik</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'services' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countServices}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('doctors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'doctors'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>Lekarze & Zespół</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'doctors' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countDoctors}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('clinic')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'clinic'
                ? 'bg-[#1B64A5] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>Placówka & Gabinet</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'clinic' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countClinic}
            </span>
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj grafiki (np. implant, tomograf)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B64A5]/30 focus:border-[#1B64A5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Siatka prezentacji grafik */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nie znaleziono grafik</h3>
          <p className="text-xs text-slate-500 mt-1">
            Brak grafik odpowiadających filtrowi &bdquo;{searchQuery}&rdquo;. Spróbuj wpisać inną frazę lub przełączyć zakładkę.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => {
            const isLocal = asset.imageUrl.startsWith('/images/');
            const isBase64 = asset.imageUrl.startsWith('data:image/');

            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1B64A5]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Podgląd grafiki */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Badge kategorii */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {asset.category === 'hero' && 'Sekcja Hero'}
                      {asset.category === 'services' && 'Zabieg / Usługa'}
                      {asset.category === 'doctors' && 'Lekarz / Zespół'}
                      {asset.category === 'clinic' && 'Placówka DentaNova'}
                    </div>

                    {/* Przyciski podglądu */}
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                      title="Powiększ grafikę"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Etykieta typu źródła */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                      <span className="truncate font-semibold drop-shadow-sm">
                        {asset.locationLabel}
                      </span>
                    </div>
                  </div>

                  {/* Informacje pod grafiką */}
                  <div className="p-4 space-y-2">
                    <div className="min-h-[44px]">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 uppercase tracking-tight">
                        {asset.title}
                      </h4>
                      {asset.subcategory && (
                        <p className="text-[11px] text-[#1B64A5] font-semibold truncate mt-0.5">
                          {asset.subcategory}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Proporcje: {asset.dimensionsHint || '16:9'}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {isLocal ? 'Plik lokalny AI' : isBase64 ? 'Plik z dysku' : 'URL zewnętrzny'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stopka karty z przyciskami akcji */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(asset)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#1B64A5] hover:bg-[#154d80] text-white font-semibold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Edytuj / Zmień</span>
                  </button>

                  {asset.defaultImageUrl && asset.imageUrl !== asset.defaultImageUrl && (
                    <button
                      onClick={() => handleRestoreDefaultSingle(asset)}
                      className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                      title="Przywróć domyślne zdjęcie"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EDYCJI GRAFIKI */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#1B64A5] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edycja grafiki: {editingAsset.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingAsset.locationLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-6">
              {/* Podgląd na żywo */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Podgląd aktualnie wybranej grafiki:
                </span>
                <div className="relative aspect-[16/10] max-h-56 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                  {newImageUrl ? (
                    <img
                      src={newImageUrl}
                      alt="Podgląd"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Brak adresu grafiki
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                    Podgląd na żywo
                  </div>
                </div>
              </div>

              {/* Tytuł / Etykieta powiązana */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nazwa / Podpis powiązanego elementu:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-[#1B64A5] focus:outline-none"
                />
              </div>

              {/* Źródło grafiki - URL i Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Adres URL zdjęcia lub plik:
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://... lub /images/..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-[#1B64A5] focus:outline-none"
                    />
                  </div>

                  <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    <Upload className="w-4 h-4 text-[#1B64A5]" />
                    <span>Wgraj z dysku</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Możesz wkleić dowolny adres URL z Internetu, wskazać ścieżkę lokalną lub wybrać własny plik JPG/PNG/WebP ze swojego komputera.
                </p>
              </div>

              {/* Szybki wybór ze sprawdzonych fotografii stomatologicznych */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Szybki wybór ze sprawdzonej biblioteki stomatologicznej DentaNova:
                  </span>
                  {editingAsset.defaultImageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewImageUrl(editingAsset.defaultImageUrl!)}
                      className="text-[11px] text-[#1B64A5] hover:underline font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Ustaw zdjęcie domyślne
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50">
                  {PRESET_DENTAL_GALLERY.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewImageUrl(preset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all p-0.5 group cursor-pointer ${
                        newImageUrl === preset.url 
                          ? 'border-[#1B64A5] ring-2 ring-sky-300' 
                          : 'border-transparent hover:border-sky-400'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Przyciski modala */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1B64A5] hover:bg-[#154d80] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Zapisz nową grafikę</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POWIĘKSZONEGO PODGLĄDU */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h4 className="text-sm font-bold">{previewAsset.title}</h4>
                <p className="text-xs text-slate-400">{previewAsset.locationLabel}</p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/60 max-h-[70vh] overflow-hidden">
              <img
                src={previewAsset.imageUrl}
                alt={previewAsset.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] truncate max-w-md">
                Źródło: {previewAsset.imageUrl}
              </span>
              <button
                onClick={() => {
                  const toEdit = previewAsset;
                  setPreviewAsset(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1B64A5] text-white text-xs font-semibold hover:bg-[#154d80]"
              >
                Zmień tę grafikę
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
