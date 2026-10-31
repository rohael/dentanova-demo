import React, { useState } from 'react';
import { Sparkles, Tag, Calendar, Check, ArrowRight, Clock } from 'lucide-react';
import { Promotion } from '../types';
import { dentalStore } from '../services/storage';

interface PromotionsSectionProps {
  promotions: Promotion[];
  onSelectPromo: (promo: Promotion) => void;
  isEnabled?: boolean;
}

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotions,
  onSelectPromo,
  isEnabled,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isSectionActive = isEnabled ?? dentalStore.isPromotionsSectionEnabled();
  const activePromos = promotions.filter((p) => p.isActive);

  const copyPromoCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!isSectionActive || activePromos.length === 0) {
    return null;
  }

  return (
    <section id="promocje" className="py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek sekcji */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Aktualne Promocje & Pakiety
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Oferty specjalne gabinetu
            </h2>
            <p className="text-slate-600 text-base mt-2 max-w-2xl">
              Zarządzane dynamicznie przez recepcję w panelu Headless CMS. Ceny promocyjne naliczane są automatycznie podczas wizyty.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Wszystkie kody promocyjne aktywowane są przy rezerwacji
          </span>
        </div>

        {/* Siatka promocji */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePromos.map((promo) => (
            <div
              key={promo.id}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              {/* Odznaka */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg bg-sky-50 text-[#1B64A5] text-xs font-bold border border-sky-100">
                  {promo.badge}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Ważne do {promo.validUntil}
                </span>
              </div>

              {/* Tytuł i rabat */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1B64A5] transition-colors">
                  {promo.title}
                </h3>
                <p className="text-sm font-semibold text-[#1B64A5]">
                  {promo.discountText}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {promo.description}
                </p>
              </div>

              {/* Kod i akcja */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-300">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                      {promo.promoCode}
                    </span>
                  </div>
                  <button
                    onClick={(e) => copyPromoCode(promo.promoCode, e)}
                    className="text-xs font-medium text-[#1B64A5] hover:text-[#155289] px-2 py-1 rounded hover:bg-sky-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === promo.promoCode ? (
                      <>
                        <Check className="w-3 h-3 text-[#1B64A5]" />
                        Skopiowano
                      </>
                    ) : (
                      'Kopiuj kod'
                    )}
                  </button>
                </div>

                <button
                  onClick={() => onSelectPromo(promo)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-[#1B64A5] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Skorzystaj z oferty
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
