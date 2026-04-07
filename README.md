# 🎮 Potter Game Platform

An educational game portal with user authentication, an admin dashboard, and a beautiful **bookshelf-style** game library. Built with Node.js + Express, secured with JWT auth, and backed by Neon PostgreSQL.

## ✨ Features

- **🔐 Authentication** — Register / Login with JWT cookie-based auth
- **📚 Bookshelf UI** — Games displayed as colourful books on a shelf
- **🛡️ Security** — Helmet CSP headers, CORS, bcrypt password hashing, rate limiting
- **👑 Admin Panel** — Manage users and promote roles
- **🎮 5 Educational Games** — Each game is self-contained under `/games/`
- **🌐 Bilingual** — Chinese & English throughout

## 🕹️ Included Games

| Game | Description |
|------|-------------|
| 📖 **English Pronunciation Adventure** (英語發音冒險) | Practice English pronunciation interactively |
| 🔢 **Maths Master** (數學大師) | Arithmetic challenges and number puzzles |
| 🏰 **Vowel Quest** (元音城堡) | Learn and identify English vowel sounds |
| 🏯 **繁中道場 Shodo Dojo** | Traditional Chinese character writing practice |
| 🀄 **香港記憶配對 HK Memory Match** | Hong Kong–themed memory card matching game |

## 📁 Project Structure

```
Potter-Game-Platform/
├── public/
│   ├── css/               # Global stylesheets
│   ├── js/                # Client-side JavaScript
│   ├── games/
│   │   ├── english-pronunciation/
│   │   ├── maths-master/
│   │   ├── vowel-quest/
│   │   ├── shodo-dojo/
│   │   └── hk-memory-match/
│   ├── login.html         # Login / register page
│   ├── library.html       # Bookshelf game library
│   └── admin.html         # Admin dashboard
├── server/
│   ├── db/                # Database setup & queries
│   ├── middleware/         # Auth guard & game injector
│   ├── routes/            # Auth & admin API routes
│   └── index.js           # Express entry point
├── .env.example           # Environment variable template
├── render.yaml            # Render deploy config
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Neon PostgreSQL** database (or any PostgreSQL instance)

### Installation

```bash
# Clone the repo
git clone https://github.com/potterlam/Potter-Game-Platform.git
cd Potter-Game-Platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and ADMIN_EMAIL
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Random string (64+ chars) for signing JWTs |
| `ADMIN_EMAIL` | Email auto-promoted to admin on registration |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default `3000`) |
| `ALLOWED_ORIGIN` | *(Optional)* Restrict CORS in production |

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

## ☁️ Deploy to Render

A `render.yaml` is included for one-click deployment:

1. Connect the repo on [Render](https://render.com)
2. Set the required environment variables (`DATABASE_URL`, `ADMIN_EMAIL`)
3. `JWT_SECRET` is auto-generated
4. Deploy 🚀

## 🔒 Security

- **Helmet** with strict Content Security Policy
- **bcryptjs** for password hashing
- **Rate limiting** — 200 req/15 min globally, 15 req/15 min for auth endpoints
- **JWT** stored in HTTP-only cookies
- Protected game routes — authentication required to play

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT + bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Deployment:** Render

## 📜 License

MIT
