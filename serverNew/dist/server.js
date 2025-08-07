"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const auth_1 = __importDefault(require("./routes/auth"));
const spots_1 = __importDefault(require("./routes/spots"));
// npm install --legacy-peer-deps  das ist der Install den man noch ausführen muss
const app = (0, express_1.default)();
const port = 3000;
const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
// CORS configuration definiert wo server läuft
app.use((0, cors_1.default)({
    origin: 'http://localhost:3001', // Frontend URL muss andere Port als Backend sein
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
        maxAge: 24 * 60 * 60 * 1000
    }
}));
// konvertiert JSON in ein JavaScript Objekt
app.use(express_1.default.json());
// Routes definieren
app.use('/api/auth', auth_1.default);
app.use('/api/spots', spots_1.default);
app.use('/api/auth', auth_1.default);
// native Homepage Route
app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots API ist erreichbar!');
});
//========== Startet den server der Einstiegspunkt für die App ===========
app.listen(port, async () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);
    // Test DB connection wird geöfnnet und direkt wieder geschlossen kann also entfertn werden
    const client = new mongodb_1.MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
    }
    catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
    finally {
        await client.close();
    }
});
