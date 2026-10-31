import React from 'react';
import { 
  Users, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { Doctor, Service } from '../types';

interface DoctorsSectionProps {
  doctors: Doctor[];
  services?: Service[];
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService?: (service: Service) => void;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  doctors,
  services = [],
  onSelectDoctor,
  onSelectService,
}) => {
  // Wyświetlamy tylko lekarzy z włączoną widocznością (isActive !== false)
  const visibleDoctors = doctors.filter((doctor) => doctor.isActive !== false);

  return (
    <section id="zespol" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek sekcji */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium mb-3 border border-slate-200">
              <Users className="w-3.5 h-3.5 text-[#1B64A5]" />
              Kadra Lekarska DentaNova
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              NASZ ZESPÓŁ
            </h2>
            <p className="text-slate-600 text-base mt-2 max-w-2xl leading-relaxed">
              Doświadczony zespół lekarzy specjalistów chirurgii stomatologicznej i szczękowo-twarzowej, implantologii, mikroskopowej endodoncji, ortodoncji oraz pedodoncji.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#1B64A5]" />
            <span>Weryfikacja w Centralnym Rejestrze Lekarzy RP</span>
          </div>
        </div>

        {/* Karty Lekarzy */}
        {visibleDoctors.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Brak widocznych profili lekarzy</h3>
            <p className="text-xs text-slate-500 mt-1">
              Wszystkie profile lekarzy są tymczasowo ukryte w panelu zarządzania gabinetem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleDoctors.map((doctor) => {
              const doctorServices = services.filter((s) => doctor.serviceIds?.includes(s.id));

              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden card-subtle flex flex-col justify-between group"
                >
                  <div>
                    {/* Zdjęcie lekarza */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      
                      {/* Rejestr PWZ & Gabinet - styl urzędowo-medyczny NIL */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200/90 text-[10px] font-mono text-slate-700 shadow-xs flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans font-medium">PWZ:</span>
                          <span className="font-bold text-slate-900 tracking-wider">{doctor.pwzNumber}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Aktywne prawo wykonywania zawodu (NIL)" />
                        </div>
                        {doctor.room && (
                          <div className="bg-slate-900/90 backdrop-blur-xs text-slate-200 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700 shadow-xs">
                            {doctor.room}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Treść */}
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B64A5] block">
                          {doctor.specialization}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 uppercase tracking-tight">
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {doctor.title}
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {doctor.bio}
                      </p>

                      {/* Powiązane usługi wykonywane przez tego specjalistę */}
                      {doctorServices.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-semibold text-[#1B64A5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5" />
                            Wykonywane zabiegi:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {doctorServices.map((srv) => (
                              <button
                                key={srv.id}
                                onClick={() => {
                                  if (onSelectService) {
                                    onSelectService(srv);
                                  }
                                  onSelectDoctor(doctor);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#1B64A5] border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer text-left"
                                title={`Umów zabieg: ${srv.name}`}
                              >
                                {srv.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dni przyjęć */}
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Dni przyjęć w klinice:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {doctor.workingDays.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Godziny: {doctor.workingHoursStart} - {doctor.workingHoursEnd}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Akcja: Umów wizytę u tego specjalisty */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => onSelectDoctor(doctor)}
                      className="btn-subtle w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#1B64A5] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Calendar className="w-4 h-4 text-slate-300" />
                      <span>Umów wizytę u tego specjalisty</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
