# Skuld

Personlig app för att hålla koll på skulder mellan dig och en motpart – vem som är
skyldig vad, vad det gäller och hur skulden utvecklats över tid.
Körs på [skuld.alexcloud.se](https://skuld.alexcloud.se).

## Funktioner

- **Aktuellt saldo** med färgkodning (rött = hon skyldig mig, blått = jag skyldig henne, grönt = reglerat)
- **FIFO-allokering**: återbetalningar betalar automatiskt av äldsta öppna skuld → status per post (Ej / Delvis / Helt återbetald)
- **Bidirektionella skulder** – riktning härleds från vem som betalade
- Transaktionslista med sök och filter (period, kategori, status)
- Statistik och interaktiva grafer (saldo över tid, utgifter per månad, kategorier)
- Kronologisk tidslinje
- Kvittobilder, månadssammanfattning, snabbknappar
- Export: CSV + utskriftsvänlig PDF-rapport
- Mörkt/ljust tema, mobilanpassat

## Stack

Next.js 16 · TypeScript · Tailwind v4 · shadcn/Radix · Recharts · Framer Motion ·
Lucide · Directus (backend, avgränsat konto per bok).

## Utveckling

```bash
npm install
npm run dev
```

Kräver `.env` (se `.env.example`) med `DIRECTUS_INTERNAL_URL` och `DIRECTUS_PUBLIC_URL`.

## Drift

```bash
docker compose up -d --build
```

Container lyssnar på `PORT` (3003), ansluter till `caddy_net`, nås på `192.168.0.155:3003`.

## Datamodell (Directus)

- `skuld_books` – en bok per motpart (`partner_name`)
- `skuld_debts` – skulder (`amount`, `direction`, `category`, `payment_method`, `receipt`, …)
- `skuld_payments` – återbetalningar (`amount`, `direction`, `method`, …)

Saldo och återbetalningsstatus beräknas i appen via FIFO (`src/lib/fifo.ts`).
