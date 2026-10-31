# Wdrożenie DentaNova na własnym serwerze (Ubuntu + Docker + Cloudflare Tunnel)

Aplikacja to statyczna strona (React + Vite) serwowana przez nginx w kontenerze Docker. Na świat wystawia ją Cloudflare Tunnel, więc nie trzeba otwierać żadnych portów na routerze.

## 1. Pobranie i uruchomienie

```bash
git clone https://github.com/rohael/dentanova-demo.git
cd dentanova-demo
docker compose up -d --build
```

Sprawdzenie na serwerze:

```bash
curl -I http://127.0.0.1:8095
```

Powinno zwrócić `HTTP/1.1 200 OK`.

## 2. Ustawienia lokalne (opcjonalnie)

Repozytorium zawiera tylko wzory. Twoje prawdziwe ustawienia trzymasz w plikach, które są w `.gitignore`, więc `git pull` ich nie nadpisze, a `git push` ich nie wyśle.

| Wzór w repo | Twój plik na serwerze | Do czego |
| --- | --- | --- |
| `.env.example` | `.env` | adres i port aplikacji |
| `docker-compose.override.example.yml` | `docker-compose.override.yml` | dodatkowe sieci, np. dla Cloudflare Tunnel |

### Dostęp z innych urządzeń w sieci lokalnej

Domyślnie aplikacja nasłuchuje tylko na `127.0.0.1`. Żeby otworzyć ją z laptopa czy telefonu w tej samej sieci:

```bash
cp .env.example .env
sed -i 's/^DENTANOVA_BIND=.*/DENTANOVA_BIND=0.0.0.0/' .env
docker compose up -d
```

Potem: `http://<IP-serwera>:8095`.

### Zajęty port

Zmień `DENTANOVA_PORT` w `.env` i uruchom `docker compose up -d`.

## 3. Wystawienie na świat przez Cloudflare Tunnel

W panelu Cloudflare: **Zero Trust → Networks → Tunnels → (Twój tunel) → Public Hostname → Add a public hostname**:

| Pole | Wartość |
| --- | --- |
| Subdomain | np. `dentanova` |
| Domain | Twoja domena w Cloudflare |
| Type | `HTTP` |
| URL | zależnie od tego, jak działa `cloudflared` (poniżej) |

- **`cloudflared` jako usługa systemowa** (zainstalowany na Ubuntu): URL = `localhost:8095`
- **`cloudflared` jako kontener Docker**: podłącz aplikację do sieci kontenera `cloudflared` i użyj URL = `dentanova-demo:80`:

```bash
docker network ls                      # znajdź sieć cloudflared
cp docker-compose.override.example.yml docker-compose.override.yml
# w docker-compose.override.yml wpisz nazwę sieci zamiast NAZWA_SIECI_CLOUDFLARED
docker compose up -d
```

## 4. Aktualizacja po zmianach w kodzie

```bash
cd dentanova-demo
git pull
docker compose up -d --build
```

## Uwagi

- Dane (rezerwacje, grafiki) zapisują się w przeglądarce odwiedzającego (`localStorage`), więc każdy widzi własną kopię demo. Serwer nie przechowuje danych.
- Panel personelu ma jawne hasło demo (`admin123`). To celowe w wersji pokazowej. Nie używaj tego kodu produkcyjnie bez prawdziwego uwierzytelniania.
