// routes/spots.ts
import express, { Request, Response } from 'express';
import { SpotsDB } from '../Db/SpotsDB';

const router = express.Router();
const spotsDB = new SpotsDB();

// Middleware für JSON-Parsing
router.use(express.json());

// GET /spots/:userId → Gibt alle Orte des Nutzers zurück
router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    console.log('userId:', userId);

    try {
        const locations = await spotsDB.getSpotsByUserId(userId);
        res.status(200).json(locations);
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Abrufen der Spots' });
    }
});

// POST /spots → Fügt Spot für Nutzer ein (userId & location übergeben als Query-Parameter)
router.post('/', async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const location = req.query.location as string;

    if (!userId || !location) {
        return res.status(400).json({ message: 'Fehlender userId oder location' });
    }

    try {
        const result = await spotsDB.createSpot(userId, location);
        res.status(201).json({ message: '✅ Spot gespeichert', id: result.insertedId });
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        res.status(500).json({ message: 'Serverfehler beim Speichern des Spots' });
    }
});

export default router;