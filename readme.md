# Framer Framed

**Framer Framed** is een server-rendered webapplicatie gebouwd met [Node.js](https://nodejs.org/), [LiquidJS](https://liquidjs.com/), en de  webserver [Tinyhttp](https://tinyhttp.v1rtl.site/).  
Het doel van dit project is om een flexibele en uitbreidbare basis te bieden voor een dynamische website met herbruikbare templates, componenten en een lichte Node.js-backend voor het archief van Framer Framed.

---

## 🔧 Installatie & Starten

1. **Clone de repository**

   ```bash
   git clone https://github.com/Liamvanbart1/framer-framed.git
   cd framer-framed
   ```

2. **Installeer dependencies**

   Zorg dat je Node.js (versie 18 of hoger) hebt geïnstalleerd.

   ```bash
   npm install
   ```

3. **Start de ontwikkelserver**

   ```bash
   npm run dev
   ```

   De applicatie draait nu op:  
   [http://localhost:3000](http://localhost:3000)

---

## 📁 Projectstructuur

```
.
├── client/                 # Frontend assets (JS, CSS)
├── public/                 # Publieke assets (zoals afbeeldingen)
│   └── fonts/              # Fonts (in gitignore zetten)
├── server/                 # Servercode, views, componenten en layouts
│   ├── components/         # Herbruikbare Liquid componenten
│   ├── layouts/            # Layout templates (zoals base.liquid)
│   └── views/              # Pagina-templates
├── package.json            # Projectconfiguratie en scripts
├── vite.config.js          # Vite build-configuratie
└── ...
```

### Belangrijkste mappen en bestanden

- **client/**  
  Bevat alle frontend-bestanden.  
  - `index.js`: Regelt zoekfunctionaliteit en UI-interactie.
  - `index.css`: Importeert globale en component CSS.
  - `typography.css`: roept fonts aan die in `fonts/` zitten.

- **server/**  
  Bevat de server, views en componenten.  
  - `server.js`: De hoofdserver, regelt routes en data ophalen.
  - `components/`: Herbruikbare Liquid componenten (zoals relation, event-list, footer).
  - `layouts/`: Layouts voor pagina's (`base.liquid`, `homepage.liquid`).
  - `views/`: Pagina-templates voor verschillende routes.

- **public/**
  - `fonts/`: plaats voor font bestanden. (.otf of .ttf)  
  - `images/`: Statische assets zoals afbeeldingen en logo.

- **package.json**  
  Bevat scripts om te starten, bouwen en ontwikkelen.

- **vite.config.js**  
  Regelt de build van client-bestanden naar de `dist/` map.

---

## 🧾 Belangrijke scripts

- `npm run dev`  
  Start de ontwikkelserver (client & server in watch-modus).

- `npm run build`  
  Bouwt de client-bestanden naar de `dist/` map.

- `npm start`  
  Start alleen de server (gebruik na build).

---

## 🖥 Hoe werkt het?

- **Server**  
  De server draait op [Tinyhttp](https://tinyhttp.v1rtl.site/) en gebruikt [LiquidJS](https://liquidjs.com/) voor server-side rendering van templates.
- **Routing**  
  Routes worden gedefinieerd in [`server/server.js`](server/server.js).  
  Elke route rendert een Liquid-template uit [`server/views/`](server/views/).
- **Componenten**  
  Herbruikbare componenten staan in [`server/components/`](server/components/).
- **Frontend**  
  De client-side JavaScript (`client/index.js`) regelt zoekfunctionaliteit en UI-interactie.  
  CSS wordt opgebouwd uit losse component-styles en globale styles.

---

## 🔍 Zoekfunctionaliteit

- De zoekbalk in de header en op de homepage maakt een request naar `/search` op de server.
- De server haalt resultaten op uit een externe API en stuurt deze terug als JSON.
- Resultaten worden client-side getoond en linken door naar detailpagina's.

---

## ✏ Aanpassingen maken

- **Nieuwe pagina toevoegen?**  
  Maak een nieuwe `.liquid` file aan in [`server/views/`](server/views/) en voeg een route toe in [`server/server.js`](server/server.js).
- **Component aanpassen?**  
  Pas de betreffende `.liquid` en `.css` files aan in [`server/components/`](server/components/).
- **Styling aanpassen?**  
  Bewerk de CSS in [`server/views/`](server/views/) of in de component-specifieke CSS-bestanden.

---

## 🛠️ Gebruikte technologieën

- Node.js
- LiquidJS
- Tinyhttp
- Vite (voor frontend build)
- ESModules

---

## 📣 Vragen of feedback?

Neem contact op met de oorspronkelijke auteur.

---
