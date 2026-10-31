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

## 2. Wystawienie na świat przez Cloudflare Tunnel

W panelu Cloudflare: **Zero Trust → Networks → Tunnels → (Twój tunel) → Public Hostname → Add a public hostname**:

| Pole | Wartość |
| --- | --- |
| Subdomain | np. `dentanova` |
| Domain | Twoja domena w Cloudflare |
| Type | `HTTP` |
| URL | zależnie od tego, jak działa `cloudflared` (poniżej) |

- **`cloudflared` jako usługa systemowa** (zainstalowany na Ubuntu): URL = `localhost:8095`
- **`cloudflared` jako kontener Docker**: dołącz oba kontenery do wspólnej sieci i użyj URL = `dentanova-demo:80`:

```bash
docker network create web 2>/dev/null || true
docker network connect web dentanova-demo
docker network connect web <nazwa-kontenera-cloudflared>
```

## 3. Aktualizacja po zmianach w kodzie

```bash
cd dentanova-demo
git pull
docker compose up -d --build
```

## Uwagi

- Dane (rezerwacje, grafiki) zapisują się w przeglądarce odwiedzającego (`localStorage`), więc każdy widzi własną kopię demo. Serwer nie przechowuje danych.
- Panel personelu ma jawne hasło demo (`admin123`). To celowe w wersji pokazowej. Nie używaj tego kodu produkcyjnie bez prawdziwego uwierzytelniania.
