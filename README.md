# Canteevo Backend

Backend API untuk Canteevo — aplikasi pemesanan makanan (food ordering / canteen), dibangun dengan [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), dan PostgreSQL.

## Tech Stack

- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL, via Prisma ORM 7
- **Auth:** JWT (Passport)
- **Validation:** class-validator, class-transformer, zod
- **Docs:** Swagger / OpenAPI
- **Logging:** Winston (nest-winston)

## Struktur Modul

| Modul        | Keterangan                       |
| ------------ | -------------------------------- |
| `auth`       | Registrasi, login, JWT strategy  |
| `merchant`   | Data merchant/tenant             |
| `category`   | Kategori menu                    |
| `menu-item`  | Item menu (menu makanan/minuman) |
| `cart`       | Keranjang belanja                |
| `order`      | Pemesanan                        |
| `promo-code` | Kode promo/diskon                |
| `review`     | Ulasan/rating                    |
| `prisma`     | Wrapper Prisma Client            |
| `logger`     | Konfigurasi Winston logger       |

Model data utama (lihat `prisma/schema.prisma`): `User`, `Admin`, `Merchant`, `Category`, `MenuItem`, `Nutrition`, `Review`, `CartItem`, `PromoCode`, `Order`, `OrderItem`.

## Prasyarat

- Node.js (disarankan versi LTS terbaru)
- PostgreSQL yang sudah jalan (lokal atau remote)
- npm

## Instalasi

```bash
npm install
```

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

| Variabel         | Keterangan                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Connection string PostgreSQL, format: `postgresql://user:password@host:port/db?schema=public` |
| `JWT_SECRET`     | Secret key untuk sign JWT (minimal 32 karakter)                                               |
| `JWT_EXPIRATION` | Masa berlaku token, mis. `24h`                                                                |
| `NODE_ENV`       | `development` / `production`                                                                  |
| `PORT`           | Port server, default `3000`                                                                   |
| `LOG_LEVEL`      | Level logging Winston, mis. `debug`                                                           |

## Setup Database

Jalankan migrasi Prisma ke database yang sudah dikonfigurasi di `DATABASE_URL`:

```bash
npx prisma migrate deploy
```

Generate Prisma Client (biasanya otomatis lewat `postinstall`, tapi bisa dijalankan manual):

```bash
npx prisma generate
```

Seed data awal (opsional):

```bash
npm run seed
```

Menghapus seluruh data (opsional, hati-hati):

```bash
npm run db:clear
```

## Menjalankan Aplikasi

```bash
# development (watch mode)
npm run start:dev

# development (tanpa watch)
npm run start

# production
npm run build
npm run start:prod
```

Setelah jalan, API bisa diakses di:

- Base URL: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api/docs`

## Testing

```bash
# unit test
npm run test

# e2e test
npm run test:e2e

# coverage
npm run test:cov
```

## Lint & Format

```bash
npm run lint
npm run format
```

## Catatan

- Global prefix API adalah `/api` (diset di `src/main.ts`).
- CORS terbuka penuh (`*`) saat `NODE_ENV` bukan `production`; di production, CORS dinonaktifkan by default — sesuaikan origin sesuai kebutuhan sebelum deploy.
- Semua request otomatis dapat `Request-ID` lewat middleware (`RequestIdMiddleware`) dan dicatat lewat `LoggerMiddleware`.
- Error handling terpusat lewat `GlobalExceptionFilter`.
