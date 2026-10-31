import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Code2, 
  Lock, 
  Menu, 
  X
} from 'lucide-react';
import { DentaNovaLogo } from './DentaNovaLogo';

interface NavbarProps {
  currentView: 'public' | 'admin' | 'architecture';
  setCurrentView: (view: 'public' | 'admin' | 'architecture') => void;
  pendingCount: number;
  onBookClick: () => void;
  showPromotionsLink?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  pendingCount,
  onBookClick,
  showPromotionsLink = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (view: 'public' | 'admin' | 'architecture') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Pasek awaryjny / kontaktowy */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Pon-Pt: 9:00 - 18:00 | Sob-Nd: nieczynne
            </span>
            <span className="hidden sm:inline-block text-slate-500">|</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Klinika Stomatologiczna DentaNova
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="tel:+48000000000" 
              className="inline-flex items-center gap-1.5 text-white font-semibold hover:text-sky-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              +48 000 000 000
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-xs">Miasto XXX • ul. Przykładowa 1</span>
          </div>
        </div>
      </div>

      {/* Główny pasek nawigacji */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo i Brand DentaNova */}
          <div 
            onClick={() => handleNav('public')}
            className="cursor-pointer group py-1"
          >
            <DentaNovaLogo size="md" />
          </div>

          {/* Linki Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'public'
                  ? 'text-[#1B64A5] bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dla Pacjenta
            </button>

            <a
              href="#uslugi"
              onClick={() => setCurrentView('public')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Nasze Usługi
            </a>

            <a
              href="#zespol"
              onClick={() => setCurrentView('public')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Nasi Lekarze
            </a>

            <a
              href="#rezerwacja"
              onClick={() => setCurrentView('public')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1B64A5]" />
              Umów Wizytę
            </a>

            {showPromotionsLink && (
              <a
                href="#promocje"
                onClick={() => setCurrentView('public')}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Oferty
              </a>
            )}

            <a
              href="#kontakt"
              onClick={() => setCurrentView('public')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Kontakt
            </a>

            {/* Przycisk do Panelu Administratora */}
            <button
              onClick={() => handleNav('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer ${
                currentView === 'admin'
                  ? 'text-purple-700 bg-purple-50 font-semibold border border-purple-200'
                  : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              Panel Personelu
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Przycisk do Dokumentacji Architektury Cloudflare D1 / Worker */}
            <button
              onClick={() => handleNav('architecture')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                currentView === 'architecture'
                  ? 'text-sky-700 bg-sky-50 font-semibold border border-sky-200'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              D1 & Worker API
            </button>
          </nav>

          {/* CTA Rezerwacja */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView('public');
                onBookClick();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-semibold text-sm shadow-md shadow-[#1B64A5]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Umów wizytę online
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => handleNav('public')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            Strona Główna
          </button>
          <a
            href="#uslugi"
            onClick={() => handleNav('public')}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Nasze Usługi
          </a>
          <a
            href="#zespol"
            onClick={() => handleNav('public')}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Nasi Lekarze
          </a>
          <a
            href="#rezerwacja"
            onClick={() => handleNav('public')}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#1B64A5]" />
            Umów Wizytę
          </a>
          {showPromotionsLink && (
            <a
              href="#promocje"
              onClick={() => handleNav('public')}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Oferty
            </a>
          )}
          <a
            href="#kontakt"
            onClick={() => handleNav('public')}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Kontakt
          </a>
          <button
            onClick={() => handleNav('admin')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Panel Personelu (/admin)
            </span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNav('architecture')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-sky-700 bg-sky-50 flex items-center gap-2 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-sky-600" />
            Architektura Cloudflare D1 & Worker
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                handleNav('public');
                onBookClick();
              }}
              className="w-full py-3 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#1B64A5]/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Umów wizytę online
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
