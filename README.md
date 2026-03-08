# 🍬 Jelly Shot Raffle — v3

> **Web3 dApp on OP_NET** · Provably fair on-chain raffle · $BGS Token · NFT Boost System

**~~Live Demo:~~** 

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎰 **Live Raffles** | Buy tickets with $BGS, provably fair OP_NET draw |
| 🪼 **Jelly Shooter Game** | Hold to charge sugar, release to launch — full physics engine |
| 🎁 **NFT Inventory** | Equip Motocat NFTs to unlock stat boosts in the game |
| 🔗 **NFT → Game Loop** | Legendary NFT = ×2.0 score multiplier, faster charge, bigger shake bonus |
| 🍬 **3 Themes** | Jelly Pastel / Light Minimalist / Cyber Neon — CSS Variables architecture |
| 📱 **Shake Sensor** | Shake your phone on mobile for bonus sugar injection |
| 💾 **Theme Persist** | `localStorage` remembers your theme preference |

---

## 🎮 NFT Boost System

Equip NFTs from your Inventory to activate stat boosts in Jelly Shooter:

| Rarity | Sugar Rate | Score Multi | Shake Bonus |
|---|---|---|---|
| 👑 Legendary | ×2.5 | ×2.0 | +20 |
| 💜 Epic | ×1.8 | ×1.5 | +16 |
| 🔵 Rare | ×1.4 | ×1.25 | +14 |
| 🩷 Uncommon | ×1.15 | ×1.1 | +12 |

> Equip multiple NFTs for **stacked bonuses** (additive 10% per extra NFT)

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/jellyshooterbgs-v3.git
cd jellyshooterbgs-v3

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
# → Opens at http://localhost:5173/jellyshooterbgs-v3/

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## 🌐 Deploy to GitHub Pages (One-time setup)

### Option A — GitHub Actions (Recommended, fully automatic)

1. Push this repo to GitHub:
```bash
git init
git add .
git commit -m "🍬 Initial commit — Jelly Shot Raffle v3"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jellyshooterbgs-v3.git
git push -u origin main
```

2. In your GitHub repo → **Settings** → **Pages**
3. Set **Source** to: `GitHub Actions`
4. Every push to `main` auto-deploys! ✅

### Option B — Manual deploy with gh-pages
```bash
npm run deploy
```

---

## 🏗️ Tech Stack

- **React 18** + **Vite 5** — Fast HMR, optimized builds
- **CSS Custom Properties** — Zero-hardcode 3-mode theming
- **OP_NET** — On-chain raffle smart contract integration
- **DeviceMotionEvent** — Mobile shake sensor for bonus sugar
- **GitHub Actions** — CI/CD pipeline to GitHub Pages

---

## 📁 Project Structure

```
jellyshooterbgs-v3/
├── .github/workflows/
│   └── deploy.yml          # Auto-deploy CI/CD
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx             # Main app (all views + game engine)
│   ├── main.jsx            # React entry point
│   └── index.css           # Base reset
├── index.html
├── vite.config.js          # base: '/jellyshooterbgs-v3/'
└── package.json
```

---

## 🎨 3-Mode Theme Architecture

```css
:root           /* theme-jelly  — Pastel Candy (default) */
.theme-light    /* Light Minimalist                       */
.theme-cyber    /* Dark Neon Hacker                       */
```

All colors use `var(--css-variable)` — zero hardcoded values in components.

`switchTheme(mode)` → updates React state + persists to `localStorage`.

---

*Built with 🍬 by Operative-07 × Gemini*
