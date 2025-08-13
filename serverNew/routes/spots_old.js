"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";
// Middleware für JSON-Parsing
router.use(express_1.default.json());
// GET /spots/:userId → Gibt alle Orte des Nutzers zurück
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('userId:', userId);
    const client = new mongodb_1.MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const spots = await collection.find({ userId }).toArray();
        const locations = spots.map(spot => spot.location);
        res.status(200).json(locations);
    }
    catch (error) {
        console.error('❌ Fehler beim Abrufen der Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Abrufen der Spots' });
    }
    finally {
        await client.close();
    }
});
// POST /spots → Fügt Spot für Nutzer ein (userId & location übergeben als Query-Parameter)
router.post('/', async (req, res) => {
    const userId = req.query.userId;
    const location = req.query.location;
    if (!userId || !location) {
        return res.status(400).json({ message: 'Fehlender userId oder location' });
    }
    const client = new mongodb_1.MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne({
            userId,
            location,
            createdAt: new Date()
        });
        res.status(201).json({ message: '✅ Spot gespeichert', id: result.insertedId });
    }
    catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Speichern des Spots' });
    }
    finally {
        await client.close();
    }
});
exports.default = router;
