// @ts-ignore
import express from 'express';
import mongo from './DB/mongo.js'; // .js bei ESModulen auch bei TS notwendig, wenn du kein Alias-System hast
const app = express();
const port = 3000;
// JSON-Parser Middleware
app.use(express.json());
/**
 * Test-Route zum Überprüfen der DB-Verbindung
 * Ruft Benutzer "Jan" aus der Collection "Users" ab
 */
app.get('/', async (req, res) => {
    try {
        const user = await mongo.getUserData();
        console.log('Antwort von DB:', user);
        res.status(200).json({
            message: '✅ DB-Verbindung erfolgreich!',
            user
        });
    }
    catch (error) {
        console.error('❌ Fehler beim DB-Zugriff:', error);
        res.status(500).json({
            message: '❌ Fehler bei der DB-Verbindung',
            error: error.message
        });
    }
});
// Server starten
app.listen(port, () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map