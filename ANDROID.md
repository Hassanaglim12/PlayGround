# 📱 President Simulator — Android build guide

The game is a **pure HTML5 2D game** (no build step), so it runs anywhere. Three ways to play on Android phone/tablet:

## Option 1 — Instant (PWA, recommended, 30 seconds)
1. Host this folder (or open `index.html` via any static server).
2. On your Android phone open the URL in **Chrome**.
3. Menu (⋮) → **Add to Home screen** → **Install**.
4. The game launches fullscreen, offline-capable (service worker), portrait-optimized for phone & tablet.

## Option 2 — Play locally
```bash
# any static server, e.g.
npx serve .
# or
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## Option 3 — Build a real APK/AAB with Capacitor (Play Store ready)
```bash
npm i -g @capacitor/cli
npm init -y
npm i @capacitor/core @capacitor/android
npx cap init PresidentSim com.presidentsim.game
# copy game files into capacitor webDir, e.g. set webDir="." in capacitor.config.ts
npx cap add android
npx cap sync
# open in Android Studio:
npx cap open android
# then Build → Build APK(s). Icon: icon.svg, splash: navy #0a1428.
```
`manifest.json` + `sw.js` already make it installable; Capacitor just wraps the same WebView.

## Game features
- 🗺️ Interactive 2D world map: **193 countries**, pan (drag) / zoom (pinch/wheel), tap to select, search + region filter + sort
- 💰 Real economy: GDP (real 2023 nominal $B), population, tax rate, 4 budgets (health/edu/military/infra), revenue vs spending, trade income, war costs, inflation, unemployment, GDP growth
- 🤝 Relations −100…+100 per country: visits, aid, trade deals, alliances, sanctions, threats, war/peace; drift + event effects
- ⚔️ War system with military power (mil budget + GDP), monthly front score, victory/defeat, reparations
- 🗳️ Politics: approval, stability, prestige, elections every 48 months, bankruptcy/coup/uprising lose conditions, 20-year legend victory
- 🎲 40+ random events with 2–3 choices each
- 📜 6 instant decrees, auto-play mode, save/load (localStorage), offline PWA
