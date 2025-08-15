# ☕ CoffeeSpots

Eine moderne Web-Anwendung zum Entdecken und Verwalten von Coffee Spots mit interaktiver Karte und Favoriten-System.

![CoffeeSpots Banner](https://img.shields.io/badge/CoffeeSpots-☕-brown?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

## 🎯 Features

- 🗺️ **Interaktive Karte** - Entdecke Coffee Spots in deiner Umgebung
- ⭐ **Favoriten-System** - Speichere deine Lieblings-Cafés
- 🔐 **Benutzerauthentifizierung** - Sicheres Login/Register System
- 📱 **Responsive Design** - Optimiert für Desktop, Tablet und Mobile
- 🌍 **Standort-Integration** - GPS-basierte Suche
- 📊 **Beliebtheits-Counter** - Sieh wie beliebt Coffee Spots sind

## 🏗️ Architektur

```
CoffeeSpots/
├── client/          # React Frontend (TypeScript)
├── serverNew/       # Express.js Backend (TypeScript) 
├── docs/           # API-Dokumentation (OpenAPI)
└── *.bat           # Automation Scripts
```

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet Maps
- **Backend**: Express.js, TypeScript, MongoDB Atlas
- **Authentication**: Session-basiert mit bcrypt
- **API**: RESTful mit OpenAPI 3.0 Spezifikation

## 🚀 Quick Start

### Voraussetzungen
- [Node.js](https://nodejs.org/) (v16+)
- [Git](https://git-scm.com/)
- Windows Command Line / PowerShell

### Installation & Setup

1. **Repository klonen**
   ```bash
   git clone https://github.com/janphr03/CoffeeApp.git
   cd CoffeeApp
   ```

2. **Abhängigkeiten installieren**
   ```bash
   install.bat
   ```
   > ⏱️ Installiert alle npm-Pakete für Frontend und Backend

3. **Anwendung starten**
   ```bash
   start.bat
   ```
   > 🚀 Startet Backend (http://localhost:3000) und Frontend (http://localhost:5000)

Das war's! Die Anwendung läuft jetzt und ist bereit zur Nutzung. 🎉

## 🧪 Testing (Optional)

CoffeeSpots bietet umfassende Tests für Qualitätssicherung:

### 1. Integration Tests
```bash
integrationTests.bat
```
- ✅ API-Endpunkt Tests
- ✅ Datenbank-Integration
- ✅ Authentication-Flow
- ❗ **Nach dem Test**: Client mit `STRG+C` schließen

### 2. Unit Tests
```bash
unitTests.bat
```
- ✅ Komponenten-Tests
- ✅ Utility-Functions
- ✅ Business Logic

### 3. Browser Tests
```bash
browserTests.bat
```
- ✅ End-to-End Tests
- ✅ UI-Interaktionen
- ✅ Cross-Browser Kompatibilität
- ❗ **Nach dem Test**: Client mit `STRG+C` schließen

> 💡 **Tipp**: Alle Tests sind optional, aber empfohlen für die Entwicklung!

## 📖 Kompletter Workflow

### Erste Einrichtung
```bash
# 1. Abhängigkeiten installieren
install.bat

# 2. (Optional) Integration Tests ausführen
integrationTests.bat
# → Nach Test: STRG+C zum Schließen

# 3. (Optional) Unit Tests ausführen  
unitTests.bat

# 4. (Optional) Browser Tests ausführen
browserTests.bat
# → Nach Test: STRG+C zum Schließen

# 5. Anwendung starten
start.bat
```

### Entwicklung
```bash
# Für normale Entwicklung einfach:
start.bat
```

## 🌐 Verwendung

### URLs
- **Frontend**: http://localhost:3000
- **Backend-API**: http://localhost:5000/api
- **API-Dokumentation**: `docs/api/openapi.yaml`

### Hauptfunktionen
1. **Registrierung/Login** auf der Startseite
2. **Karte erkunden** - Coffee Spots in der Umgebung finden
3. **Favoriten hinzufügen** - Auf Herz-Symbol klicken
4. **Standort aktivieren** - Für personalisierte Ergebnisse
5. **Favoriten-Seite** - Alle gespeicherten Coffee Spots anzeigen

## 🔧 Entwicklung

### Projektstruktur
```
CoffeeSpots/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # React-Komponenten
│   │   ├── contexts/      # State Management
│   │   ├── hooks/         # Custom React Hooks
│   │   ├── pages/         # Route-Komponenten
│   │   └── services/      # API-Client
│   └── public/            # Statische Assets
│
├── serverNew/             # Express Backend
│   ├── routes/            # API-Routen
│   ├── Db/               # Datenbank-Operationen
│   ├── middleware/        # Express Middleware
│   └── tests/            # Backend Tests
│
├── docs/                  # Dokumentation
│   └── api/              # OpenAPI-Spezifikation
│
└── Scripts               # Automation
    ├── install.bat       # Setup
    ├── start.bat         # App starten
    ├── integrationTests.bat
    ├── unitTests.bat
    └── browserTests.bat
```

### API-Dokumentation
Die vollständige API ist in `docs/api/openapi.yaml` dokumentiert:

- **Authentication**: `/api/auth/*`
- **Spots Management**: `/api/spots/*`
- **OpenAPI 3.0** Format für Tool-Integration

### Environment Variables
Kopiere `.env.example` zu `.env` und konfiguriere:

```env
# Backend (.env in serverNew/)
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=5000

# Frontend (.env in client/)
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Scripts Übersicht

| Script | Zweck | Nachbehandlung |
|--------|-------|----------------|
| `install.bat` | Installiert alle Abhängigkeiten | - |
| `start.bat` | Startet die komplette Anwendung | - |
| `integrationTests.bat` | API & Datenbank Tests | `STRG+C` nach Test |
| `unitTests.bat` | Komponenten & Logic Tests | - |
| `browserTests.bat` | End-to-End UI Tests | `STRG+C` nach Test |

## 🤝 Mitwirken

1. **Fork** das Repository
2. **Feature Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Änderungen committen** (`git commit -m 'Add AmazingFeature'`)
4. **Branch pushen** (`git push origin feature/AmazingFeature`)
5. **Pull Request** öffnen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🆘 Troubleshooting

### Häufige Probleme

**"Port bereits in Verwendung"**
```bash
# Port 3000 oder 5000 freigeben
netstat -ano | findstr :3000
netstat -ano | findstr :5000
# Task beenden mit Task Manager
```

**"MongoDB Verbindungsfehler"**
- Prüfe `.env` Konfiguration in `serverNew/`
- Stelle sicher, dass MongoDB Atlas erreichbar ist
- Prüfe Netzwerkverbindung

**"npm install Fehler"**
```bash
# Cache leeren und neu installieren
npm cache clean --force
install.bat
```

## 🌟 Team

Entwickelt mit ❤️ vom CoffeeSpots Team

---

**Happy Coding & Coffee Drinking!** ☕✨
