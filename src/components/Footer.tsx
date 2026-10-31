import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Code2, 
  ArrowUp
} from 'lucide-react';
import { DentaNovaLogo } from './DentaNovaLogo';

interface FooterProps {
  onNav: (view: 'public' | 'admin' | 'architecture') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Główna siatka */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & info */}
          <div className="lg:col-span-2 space-y-4">
            <DentaNovaLogo variant="dark" size="md" />

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              DentaNova – Klinika Stomatologiczna. Zaawansowana chirurgia stomatologiczna, chirurgia szczękowo-twarzowa, implantologia, protetyka oraz własna pracownia Tomografii Komputerowej 3D i RTG na miejscu.
            </p>

            <div className="pt-2 flex items-center gap-2 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Certyfikat ISO 9001:2026 i najwyższe standardy kliniczne</span>
            </div>
          </div>

          {/* Szybkie linki pacjenta */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Dla Pacjenta
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#uslugi" onClick={() => onNav('public')} className="hover:text-sky-400 transition-colors">
                  Nasze Usługi i Cennik
                </a>
              </li>
              <li>
                <a href="#zespol" onClick={() => onNav('public')} className="hover:text-sky-400 transition-colors">
                  Nasi Lekarze i PWZ
                </a>
              </li>
              <li>
                <a href="#promocje" onClick={() => onNav('public')} className="hover:text-sky-400 transition-colors">
                  Pakiety & Oferty
                </a>
              </li>
              <li>
                <a href="#kontakt" onClick={() => onNav('public')} className="hover:text-sky-400 transition-colors">
                  Kontakt i Dojazd
                </a>
              </li>
              <li>
                <a href="#rezerwacja" onClick={() => onNav('public')} className="hover:text-sky-400 transition-colors">
                  Rezerwacja online 24/7
                </a>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Kontakt & Dyżur
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="tel:+48000000000" className="text-white hover:text-sky-400 font-semibold">
                  +48 000 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>recepcja@dentanova.example</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>ul. Przykładowa 1, 00-000 Miasto</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Pon-Pt: 9:00 – 18:00 | Sob-Nd: nieczynne</span>
              </li>
            </ul>
          </div>

          {/* Dostęp personelu i architektura */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              System & Personel
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNav('admin')}
                  className="hover:text-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Panel Personelu (/admin)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('architecture')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Schemat D1 & Kod Worker</span>
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 mt-4 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Przewiń na górę strony</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Dolna linia praw autorskich */}
        <div className="pt-8 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 DentaNova – Klinika Stomatologiczna. Wszelkie prawa zastrzeżone.</p>
          <div className="flex items-center gap-4">
            <span>Stos technologiczny: React • Tailwind CSS • Cloudflare D1 • Workers • Resend API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
