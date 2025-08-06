// @ts-ignore
import express, { Request, Response } from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

const uri: string = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";

// Middleware für JSON-Parsing
router.use(express.json());

// GET /spots/:userId → Gibt alle Orte des Nutzers zurück
router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    console.log('userId:', userId);

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const spots = await collection.find({ userId }).toArray();
        const locations = spots.map(spot => spot.location);
        res.status(200).json(locations);
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Abrufen der Spots' });
    } finally {
        await client.close();
    }
});

// POST /spots → Fügt Spot für Nutzer ein (userId & location übergeben als Query-Parameter)
router.post('/', async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const location = req.query.location as string;

    if (!userId || !location) {
        return res.status(400).json({ message: 'Fehlender userId oder location' });
    }

    const client = new MongoClient(uri);
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
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Speichern des Spots' });
    } finally {
        await client.close();
    }
});

export default router;

