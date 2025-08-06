"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
const port = 3000;
const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots API ist erreichbar!');
});
app.listen(port, async () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);
    const client = new mongodb_1.MongoClient(uri);
    try {
        // Verbindung aufbauen und Konstanten erstellen
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const userId = "Alex";
        const location = "Bielefeld ohne Schreibfehler";
        // 1️⃣ Spot für Jan einfügen
        const insertResult = await collection.insertOne({
            userId, location, createdAt: new Date()
        });
        console.log("Neuer Spot eingefügt:", insertResult.insertedId);
        // 2️⃣ Alle Spots von Jan abfragen
        const spots = await collection.find({ userId }).toArray();
        const locations = spots.map(spot => spot.location);
        console.log(`Orte von ${userId}:`, locations);
    }
    catch (error) {
        console.error("Fehler beim DB-Zugriff:", error);
    }
    finally {
        await client.close();
    }
});
