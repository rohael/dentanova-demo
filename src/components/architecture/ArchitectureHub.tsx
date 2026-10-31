import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { D1_SCHEMA_SQL } from '../../services/d1Schema';
import { WORKER_HONO_CODE, WRANGLER_CONFIG, DEPLOYMENT_STEPS } from '../../services/workerCode';

export const ArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'d1' | 'worker' | 'wrangler' | 'deploy' | 'comparison'>('d1');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen pb-24">
      {/* Nagłówek */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Specyfikacja Architektury Cloudflare D1 + Worker + Pages
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Centrum Architektury & Wdrożenia
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-3xl">
            Kompletne kody źródłowe, migracje SQL dla Cloudflare D1 (Serverless SQLite), router Hono.js z integracją Resend API oraz instrukcja wdrożenia CLI Wrangler.
          </p>
        </div>
      </div>

      {/* Zakładki nawigacyjne */}
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-20 z-30 px-4 sm:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab('d1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'd1'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Schemat SQL Cloudflare D1</span>
          </button>

          <button
            onClick={() => setActiveTab('worker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'worker'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>2. Cloudflare Worker (Hono.js API)</span>
          </button>

          <button
            onClick={() => setActiveTab('wrangler')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wrangler'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>3. Konfiguracja wrangler.toml</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deploy'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>4. Instrukcja Wdrożenia Wrangler</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>WordPress vs Cloudflare Headless</span>
          </button>
        </div>
      </div>

      {/* Zawartość zakładek */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

        {/* 1. Schemat SQL D1 */}
        {activeTab === 'd1' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Cloudflare D1 (Serverless SQLite) - migrations/0001_initial_schema.sql</h3>
                <p className="text-xs text-slate-400">
                  Tabele: <code>services</code>, <code>doctors</code>, <code>promotions</code>, <code>blocked_slots</code>, <code>appointments</code>, <code>audit_logs</code> wraz z indeksami.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(D1_SCHEMA_SQL, 'd1')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'd1' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Skopiowano SQL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopiuj cały plik SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 overflow-x-auto shadow-xl">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {D1_SCHEMA_SQL}
              </pre>
            </div>
          </div>
        )}

        {/* 2. Cloudflare Worker (Hono.js) */}
        {activeTab === 'worker' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Backend API Cloudflare Worker - src/worker.ts (Hono.js)</h3>
                <p className="text-xs text-slate-400">
                  Obsługa walidacji terminów w D1, blokad lekarzy, transakcyjnej wysyłki Resend API i powiadomień Webhook dla personelu.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(WORKER_HONO_CODE, 'worker')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'worker' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Skopiowano Worker TS</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopiuj kod Worker TS</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 overflow-x-auto shadow-xl">
              <pre className="text-xs font-mono text-sky-300 leading-relaxed">
                {WORKER_HONO_CODE}
              </pre>
            </div>
          </div>
        )}

        {/* 3. wrangler.toml */}
        {activeTab === 'wrangler' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Konfiguracja środowiska - wrangler.toml</h3>
                <p className="text-xs text-slate-400">
                  Definiuje bazy Cloudflare D1, zmienne środowiskowe, ścieżki migracji i flagi zgodności.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(WRANGLER_CONFIG, 'wrangler')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'wrangler' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Skopiowano TOML</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopiuj wrangler.toml</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 overflow-x-auto shadow-xl">
              <pre className="text-xs font-mono text-amber-300 leading-relaxed">
                {WRANGLER_CONFIG}
              </pre>
            </div>
          </div>
        )}

        {/* 4. Instrukcja wdrożenia */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Instrukcja wdrożenia krok-po-kroku (CLI Wrangler)</h3>
              <p className="text-xs text-slate-400">
                Poniższe polecenia pozwalają spiąć projekt od zera i wdrożyć go w chmurze Cloudflare.
              </p>
            </div>

            <div className="space-y-4">
              {DEPLOYMENT_STEPS.map((step, idx) => (
                <div key={idx} className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400">{step.step}</span>
                    <button
                      onClick={() => copyToClipboard(step.command, `step-${idx}`)}
                      className="text-slate-400 hover:text-white p-1 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === `step-${idx}` ? (
                        <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Skopiowano</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-900 px-4 py-2.5 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800/80">
                    $ {step.command}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Porównanie: WordPress vs Headless Cloudflare */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Dlaczego zastępujemy 10-letniego WordPressa stosem Cloudflare?</h3>
              <p className="text-xs text-slate-400">
                Kluczowe przewagi architektury Headless CMS + Serverless D1 SQLite nad monolitycznym WordPressem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stary WordPress */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <ShieldAlert className="w-5 h-5" />
                  Stary system (WordPress 10 lat)
                </div>
                <ul className="space-y-2.5 text-xs text-rose-200/80">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Wolny czas ładowania (TTFB &gt; 1200ms):</strong> Ciężkie wtyczki PHP, bloat bazy MySQL, brak Edge cache.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Podatności bezpieczeństwa:</strong> Ryzyko włamań przez dziurawe wtyczki formularzy i logowania admina.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Brak walidacji terminów na żywo:</strong> Pacjenci rezerwowali zajęte godziny, recepcja musiała dzwonić i odkręcać błędy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Koszty hostingu VPS/dedykowanego:</strong> Opłaty za serwery LAMP/LEMP 100-300 zł miesięcznie.</span>
                  </li>
                </ul>
              </div>

              {/* Nowy Headless Stack */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <Sparkles className="w-5 h-5" />
                  Nowy system (Cloudflare D1 + React + Resend)
                </div>
                <ul className="space-y-2.5 text-xs text-emerald-200/80">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Błyskawiczna prędkość (&lt;30ms TTFB):</strong> Dystrybucja brzegowa (Cloudflare Global Edge) w 300+ miastach na świecie.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Maksymalne bezpieczeństwo (Zero Attack Surface):</strong> Brak publicznego serwera Apache/PHP, architektura bezserwerowa, ochrona Cloudflare DDoS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Inteligentna weryfikacja terminów w D1:</strong> Wykluczenie podwójnych rezerwacji i automatyczne respektowanie urlopów lekarzy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Darmowa eksploatacja (0 PLN):</strong> Hojny darmowy pakiet Cloudflare Workers, D1 oraz Resend w zupełności pokrywa ruch gabinetu!</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
