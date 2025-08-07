import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import authRoutes from  './routes/auth';
import spotsRoutes from './routes/spots';

// npm install --legacy-peer-deps  das ist der Install den man noch ausführen muss

const app = express();
const port = 3000;

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";

// CORS configuration definiert wo server läuft
app.use(cors({
    origin: 'http://localhost:3001', // Frontend URL muss andere Port als Backend sein
    credentials: true
}));

// Session configuration
app.use(session({
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
app.use(express.json());

// Routes definieren
app.use('/api/auth', authRoutes);
app.use('/api/spots', spotsRoutes);
app.use('/api/auth', authRoutes);

// native Homepage Route
app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots API ist erreichbar!');
});

//========== Startet den server der Einstiegspunkt für die App ===========
app.listen(port, async () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);

    // Test DB connection wird geöfnnet und direkt wieder geschlossen kann also entfertn werden
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    } finally {
        await client.close();
    }
});