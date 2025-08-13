"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const spots_1 = __importDefault(require("./routes/spots"));
// npm install --legacy-peer-deps  das ist der Install den man noch ausführen muss
// npm run dev  damit wird npm build & npm start ausgeführt
const app = (0, express_1.default)();
const port = 3000;
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI ist nicht in den Umgebungsvariablen definiert!');
    console.error('Bitte erstellen Sie eine .env Datei basierend auf .env.example');
    process.exit(1);
}
// CORS configuration definiert wo server läuft
app.use((0, cors_1.default)({
    origin: 'http://localhost:5000', // Frontend URL muss anderer Port als Backend sein
    credentials: true
}));
// Session configuration
app.use((0, express_session_1.default)({
    secret: 'coffee-app-secret-key-change-in-production', // Schlüssel für Session Cookies
    resave: false, // Session wird nicht bei jedem Request neu gespeichert
    saveUninitialized: false, // leere Sessions nicht speichern
    cookie: {
        secure: false, // Setze auf true, wenn HTTPS verwendet wird
        httpOnly: true, //
        maxAge: 60 * 60 * 1000
    }
}));
// konvertiert JSON in ein JavaScript Objekt
app.use(express_1.default.json());
// Routes definieren
app.use('/api/auth', auth_1.default);
app.use('/api/spots', spots_1.default);
// native Homepage Route
app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots API ist erreichbar!');
});
//========== Startet den server der Einstiegspunkt für die App ===========
app.listen(port, () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);
});
