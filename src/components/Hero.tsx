import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Star, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  HeartHandshake,
  Activity,
  ChevronLeft,
  ChevronRight,
  ScanLine,
  Layers,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Promotion, HeroSlide } from '../types';
import { dentalStore } from '../services/storage';

interface HeroProps {
  onBookClick: () => void;
  activePromotions: Promotion[];
  onSelectPromo: (promo: Promotion) => void;
  onSelectCategory?: (category: string) => void;
  isPromotionsSectionEnabled?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onBookClick,
  activePromotions,
  onSelectPromo,
  onSelectCategory,
  isPromotionsSectionEnabled,
}) => {
  const isSectionActive = isPromotionsSectionEnabled ?? dentalStore.isPromotionsSectionEnabled();
  // Wyświetlamy etykietkę TYLKO jeśli sekcja jest aktywna oraz dana promocja ma zaznaczony checkbox showInHeroBadge
  const badgePromo = isSectionActive 
    ? activePromotions.find((p) => p.isActive && p.showInHeroBadge) 
    : null;
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const loaded = dentalStore.getHeroSlides();
    const active = loaded.filter((s) => s.isActive);
    return active.length > 0 ? active : loaded;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Nasłuchiwanie zmian w repozytorium (np. edycja w panelu CMS personelu)
  useEffect(() => {
    const unsubscribe = dentalStore.subscribe(() => {
      const updated = dentalStore.getHeroSlides();
      const active = updated.filter((s) => s.isActive);
      setSlides(active.length > 0 ? active : updated);
    });
    return unsubscribe;
  }, []);

  // Automatyczna zmiana zdjęć co 5 sekund (pauzowana przy najechaniu kursorem)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentIndex]);

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    if (onSelectCategory && slides[index]?.serviceCategory) {
      onSelectCategory(slides[index].serviceCategory!);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Kolumna lewa: Treści i CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pigułka promocji na górze Hero (aktywna tylko gdy sekcja włączona i promocja zaznaczona do etykiety) */}
            {badgePromo && (
              <div 
                onClick={() => onSelectPromo(badgePromo)}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
                title={`Kliknij aby zobaczyć szczegóły oferty: ${badgePromo.title}`}
              >
                <span className="flex h-2 w-2 rounded-full bg-[#1B64A5]" />
                <span className="text-slate-500 font-normal">Oferta:</span>
                <span className="font-semibold text-slate-900">{badgePromo.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1B64A5] group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Specjalistyczna stomatologia.{' '}
              <span className="text-[#1B64A5]">
                Chirurgia, implanty, diagnostyka 3D.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              DentaNova – Klinika Stomatologiczna to zespół doświadczonych specjalistów, mikroskop Zeiss, tomograf CBCT 3D oraz bezbolesne zabiegi w bezpiecznej i komfortowej atmosferze.
            </p>

            {/* Kluczowe USP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1B64A5] shrink-0" />
                <span>Chirurgia stomatologiczna i szczękowo-twarzowa</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1B64A5] shrink-0" />
                <span>Implanty i sterowana odbudowa kości</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1B64A5] shrink-0" />
                <span>Własna pracownia Tomografii 3D i RTG na miejscu</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1B64A5] shrink-0" />
                <span>Leczenie pod mikroskopem & znieczulenie komputerowe</span>
              </div>
            </div>

            {/* Przyciski CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onBookClick}
                className="btn-subtle inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-bold text-base shadow-sm shadow-[#1B64A5]/20 cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                Zarezerwuj wizytę teraz
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="#uslugi"
                className="btn-subtle inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300/80 text-slate-700 font-semibold text-base hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-xs"
              >
                Zobacz Nasze Usługi
              </a>
            </div>

            {/* Pigułki / Przyciski opcji Hero do szybkiego przełączania zdjęć po prawej */}
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1B64A5]" />
                Wybierz specjalizację (zmień prezentację po prawej):
              </p>
              <div className="flex flex-wrap gap-2">
                {slides.map((slide, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => handleSelectSlide(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#1B64A5] text-white border-[#1B64A5] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-300'}`} />
                      {slide.specialtyTag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <span className="font-bold text-slate-900 ml-1">4.9 / 5.0</span>
                <span className="text-slate-500">(920+ opinii pacjentów)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <HeartHandshake className="w-4 h-4 text-[#1B64A5]" />
                <span>Gwarancja kliniczna na implanty i protetykę</span>
              </div>
            </div>

          </div>

          {/* Kolumna prawa: Dynamiczny panel ze zdjęciami i rotatorem */}
          <div className="lg:col-span-5 relative">
            
            {/* Główna karta z rotacją zdjęć */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 h-[460px] sm:h-[480px] group select-none card-subtle"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Animowana zmiana zdjęcia w panelu */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Cieniowanie gradientowe dla optymalnego kontrastu typografii */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/30" />
                </motion.div>
              </AnimatePresence>

              {/* Górne plakietki informacyjne */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <div className="px-2.5 py-1 rounded-md bg-white/95 text-xs font-semibold text-slate-900 flex items-center gap-1.5 shadow-xs border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B64A5]" />
                  <span className="text-slate-800 font-medium">{currentSlide.specialtyTag}</span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-slate-900/90 text-[11px] font-medium text-slate-200 border border-slate-700/80 shadow-xs">
                  {currentSlide.floatingBadge}
                </div>
              </div>

              {/* Przyciski nawigacyjne (poprzednie / następne zdjęcie) */}
              <button
                onClick={handlePrev}
                aria-label="Poprzednie zdjęcie"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Następne zdjęcie"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Środkowo-dolny opis aktualnego slajdu nałożony na zdjęcie */}
              <div className="absolute bottom-24 left-5 right-5 z-10 text-white pointer-events-none">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#1B64A5]/90 text-[11px] font-bold uppercase tracking-wider text-sky-100 mb-1.5 shadow-sm">
                  {currentSlide.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  {currentSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 drop-shadow line-clamp-2 mt-1 font-light">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Pasek postępu auto-przełączania na samej górze karty */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
                <div 
                  key={currentIndex}
                  className="h-full bg-sky-400 transition-all duration-100"
                  style={{
                    animation: isPaused ? 'none' : 'heroProgress 5s linear forwards'
                  }}
                />
              </div>

              {/* Dolny panel na karcie ze wskaźnikami i akcją */}
              <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-100 z-10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">DentaNova</p>
                    <span className="text-[10px] text-slate-400">• Miasto XXX</span>
                  </div>
                  {/* Wskaźniki kropek (dots) */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSlide(idx)}
                        aria-label={`Przejdź do zdjęcia ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentIndex
                            ? 'w-6 bg-[#1B64A5]'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-500 font-medium ml-1">
                      {currentIndex + 1} / {slides.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onBookClick}
                  className="px-4 py-2 rounded-xl bg-[#1B64A5] text-white font-bold text-xs hover:bg-[#155289] transition-all shrink-0 shadow-md shadow-[#1B64A5]/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Umów wizytę</span>
                </button>
              </div>

            </div>

            {/* Podpowiedź pod panelem z informacją o rotacji */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1B64A5]" />
                Automatyczna zmiana co 5s (zatrzymaj najeżdżając)
              </span>
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                className="text-[#1B64A5] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isPaused ? 'Wznów' : 'Wstrzymaj'}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Styl dla paska postępu */}
      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};
