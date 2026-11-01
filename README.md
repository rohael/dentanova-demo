# DentaNova – demo strony i systemu rezerwacji dla gabinetu stomatologicznego

> **Projekt koncepcyjny.** Marka „DentaNova”, lekarze, pacjenci, adres i numery telefonów są fikcyjne. Zdjęcia pochodzą z Unsplash i grafik wygenerowanych na potrzeby demo.

**🔗 Zobacz na żywo: [dentanova.rohaelarch.pl](https://dentanova.rohaelarch.pl)** · działa na moim homelabie (Docker + nginx + Cloudflare Tunnel)

Szybki prototyp pokazujący, jak może wyglądać nowoczesna strona kliniki stomatologicznej z rezerwacją wizyt online i panelem dla personelu. Zbudowany metodą **AI-assisted development (vibe coding)**: architekturę, model danych i wymagania zaprojektowałem sam, kod powstał i został zweryfikowany z pomocą asystentów AI.

## Co potrafi

**Strona dla pacjentów**
- karuzela usług (chirurgia, implanty, protetyka, tomografia 3D),
- cennik usług i promocje,
- prezentacja zespołu lekarzy z grafikiem przyjęć,
- formularz rezerwacji wizyty z wyborem usługi, lekarza, dnia i godziny,
- formularz kontaktowy.

**Panel personelu**
- zarządzanie lekarzami i ich grafikami (dni, godziny, gabinety),
- przegląd i obsługa rezerwacji,
- menedżer grafik strony.

**Backend (szkic)**
- schemat bazy dla Cloudflare D1 (SQLite) i kod Workera,
- powiadomienia e-mail przez Resend.

## Stack

React · TypeScript · Vite · Tailwind CSS · Cloudflare Workers + D1 (szkic)

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Demo działa bez backendu: dane zapisują się lokalnie w przeglądarce.

## Uwaga dotycząca bezpieczeństwa

To demo, nie system produkcyjny. Przed jakimkolwiek wdrożeniem ustaw własny `ADMIN_AUTH_TOKEN` (kod Workera ma domyślną wartość tylko na potrzeby pokazu) oraz klucze w zmiennych środowiskowych, nigdy w kodzie.

## Autor

**Piotr Roniek** – IT Team Lead, AI-assisted builder
[linkedin.com/in/piotrroniek](https://linkedin.com/in/piotrroniek)
