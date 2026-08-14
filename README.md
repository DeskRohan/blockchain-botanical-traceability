# BotaniChain — Blockchain-Based Botanical Traceability System

A decentralized and verifiable botanical supply chain traceability system designed for authenticating Ayurvedic herbs from origin/collection to final end-user products.

---

## 🌿 Overview

**BotaniChain** ensures transparency, authenticity, and quality assurance in the botanical and herbal product supply chain. By recording geo-tagged herb collection events, processing stages, quality test results, and batch transfers onto an immutable ledger, BotaniChain prevents adulteration and establishes verifiable proof of origin.

---

## 🚀 Features

- **Geo-Tagged Collection Registration**: Capture herb harvest location, altitude, collector details, and initial quality parameters.
- **Supply Chain Event Tracking**: Monitor batch transitions across Collectors, Processing Hubs, Testers, and Manufacturers.
- **Interactive Mapping**: Visualize harvest and transport locations using Leaflet & OpenStreetMap.
- **Role-Based Access Control**: Tailored dashboards for Collectors, Lab Analysts, Manufacturers, and Auditors.
- **Verifiable Audit Ledger**: Digital verification of batch records and quality certifications.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Leaflet Maps
- **Backend API**: Node.js, Express, TSX
- **Database / Auth**: Firebase Firestore & Firebase Auth
- **Design System**: Modern dark-mode UI with custom glassmorphism and reactive components

---

## 📦 Project Structure

```
blockchain-botanical-traceability/
├── server/               # Express API server & mock ledger store
│   ├── index.ts          # Express server endpoints
│   └── store.ts          # In-memory / Firestore store logic
├── src/                  # Frontend Application Source
│   ├── components/       # UI Components & Modules
│   ├── types/            # TypeScript Interface Definitions
│   ├── App.tsx           # Main Application Container
│   └── main.tsx          # Application Entry Point
├── public/               # Static assets & icons
├── .gitignore            # Git ignore specifications
├── .gitattributes        # Git repository attributes
├── package.json          # Project dependencies & scripts
├── tsconfig.json         # TypeScript compiler configuration
└── vite.config.ts        # Vite configuration
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/blockchain-botanical-traceability.git
   cd blockchain-botanical-traceability
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Environment:**
   Runs both the backend Express server and the Vite frontend concurrently:
   ```bash
   npm run start
   ```
   - Frontend app: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 📜 Available Scripts

- `npm run dev` — Starts frontend Vite dev server only
- `npm run server` — Starts Node.js/Express backend server only
- `npm run start` — Starts frontend and backend server concurrently
- `npm run build` — Compiles TypeScript and builds production asset bundle
- `npm run preview` — Locally previews production build

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
