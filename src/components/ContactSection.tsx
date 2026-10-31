import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { dentalStore } from '../services/storage';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamiczne zdjęcia placówki DentaNova edytowalne z panelu personelu
  const [clinicMedia, setClinicMedia] = useState(() => dentalStore.getClinicMedia());

  useEffect(() => {
    const unsub = dentalStore.subscribe(() => {
      setClinicMedia(dentalStore.getClinicMedia());
    });
    return unsub;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Imię i nazwisko jest wymagane.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Wprowadź prawidłowy adres e-mail.');
      return;
    }
    if (!message.trim()) {
      setError('Proszę wpisać treść wiadomości.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Rejestracja w webhookach / systemie
      dentalStore.logContactMessage({
        name,
        email,
        subject: subject || 'Zapytanie ogólne',
        message,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <section id="kontakt" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tytuł sekcji - styl wierny projektowi */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-wider uppercase">
            KONTAKT
          </h2>
          <div className="w-16 h-1 bg-[#1B64A5] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Kolumna lewa: Formularz kontaktowy */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="p-8 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-4">
                <div className="w-14 h-14 bg-sky-100 text-[#1B64A5] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Wiadomość została wysłana!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Dziękujemy za kontakt z Kliniką DentaNova. Nasz personel recepcji odpowie najszybciej jak to możliwe.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#1B64A5] text-white text-xs font-semibold hover:bg-[#155289] transition-colors cursor-pointer"
                >
                  Napisz kolejną wiadomość
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* IMIĘ I NAZWISKO */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    IMIĘ I NAZWISKO (WYMAGANE)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Anna Nowak"
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B64A5] transition-all"
                  />
                </div>

                {/* ADRES EMAIL */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ADRES EMAIL (WYMAGANE)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="np. anna.nowak@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B64A5] transition-all"
                  />
                </div>

                {/* TEMAT */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    TEMAT
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="np. Pytanie o konsultację chirurgiczną / tomografię 3D"
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B64A5] transition-all"
                  />
                </div>

                {/* TREŚĆ WIADOMOŚCI */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    TREŚĆ WIADOMOŚCI
                  </label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz tutaj treść swojego zapytania..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B64A5] transition-all resize-y"
                  />
                </div>

                {/* Przycisk wysyłki */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-[#1B64A5] hover:bg-[#155289] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#1B64A5]/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Wysyłanie...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Wyślij wiadomość</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Kolumna prawa: Zapraszamy (godziny) & Nasz adres */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Zapraszamy */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Zapraszamy:
              </h3>
              
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    PONIEDZIAŁEK
                  </span>
                  <span className="font-bold text-slate-900">
                    9:00 – 18:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    WTOREK
                  </span>
                  <span className="font-bold text-slate-900">
                    9:00 – 18:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    ŚRODA
                  </span>
                  <span className="font-bold text-slate-900">
                    9:00 – 18:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    CZWARTEK
                  </span>
                  <span className="font-bold text-slate-900">
                    9:00 – 18:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    PIĄTEK
                  </span>
                  <span className="font-bold text-slate-900">
                    9:00 – 18:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    SOBOTA
                  </span>
                  <span className="font-medium text-slate-400">
                    nieczynne
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    NIEDZIELA
                  </span>
                  <span className="font-medium text-slate-400">
                    nieczynne
                  </span>
                </div>
              </div>
            </div>

            {/* Nasz adres & telefon */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-slate-900">
                Nasz adres:
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      ul. Przykładowa 1
                    </p>
                    <p className="text-slate-600">
                      00-000 Miasto
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-slate-600" />
                  </div>
                  <a
                    href="tel:+48000000000"
                    className="font-bold text-[#1B64A5] hover:text-[#155289] transition-colors"
                  >
                    +48 000 000 000
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <a
                    href="mailto:recepcja@dentanova.example"
                    className="text-slate-700 hover:text-[#1B64A5] transition-colors"
                  >
                    recepcja@dentanova.example
                  </a>
                </div>
              </div>

              {/* Przycisk dojazdu / nawigacji */}
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Warszawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B64A5] hover:text-[#155289] transition-colors"
                >
                  <span>Pokaż lokalizację w Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Karta fotograficzna placówki DentaNova - edytowalna w Menedżerze Grafik */}
              {clinicMedia.length > 0 && (
                <div className="pt-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <div className="aspect-[16/9] bg-slate-100 overflow-hidden relative">
                      <img
                        src={clinicMedia[2]?.imageUrl || clinicMedia[0]?.imageUrl}
                        alt="Siedziba DentaNova"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs font-bold leading-tight drop-shadow-sm">
                          {clinicMedia[2]?.title || 'Nowoczesna Klinika DentaNova'}
                        </p>
                        <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                          {clinicMedia[2]?.description || 'Dedykowany parking dla pacjentów przy klinice'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
