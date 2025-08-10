// routes/spots.ts
import express, { Request, Response } from 'express';
import { requireAuth} from "../middleware/middleware";
import { DatabaseOperations } from '../Db/databaseOperations';

// Routen und DB-Operationen definieren
const router = express.Router();
const spotsDB = new DatabaseOperations();

// Middleware für JSON-Parsing
router.use(express.json());
router.use(requireAuth);

type osmType = 'node' | 'way' | 'relation'; // Union-Type definiert

// GET /api/spots - Alle Spots des authentifizierten Nutzers | req ist schon ein geparstes JS Objekt
router.get('/', async (req: Request, res: Response) => {

    try {
        const userId = req.session?.username; // user ID aus JSON-Body

        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const spots = await spotsDB.getSpotsByUserId(userId); // Spots laden die mit User-ID verknüpft

        res.status(200).json({
            success: true,
            spots: spots,
            user: userId
        });

    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Spots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spots'
        });
    }
});



// POST /api/spots - Neuen Spot hinzufügen und mit User verknüpfen
// req ist der Body der schon in ein JS Objekt umgewandelt wurde
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.session?.username; // userId wird aus JSON-Body gezogen
        const { osmType, osmId, elementLat, elementLng, name, amenity, address, tags = {}} = req.body;


        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Pflichtfelder prüfen
        if (!osmType || !osmId || !elementLat || !elementLng || !name || !amenity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }


        // Spot mit user ID in der DB erstellen
        const UserSpot = await spotsDB.createSpot(
            userId, osmType, osmId, elementLat, elementLng, name, amenity, address, tags
        );

        return res.status(201).json({
            success: true,
            message: 'Spot added successfully',
            insertedId: UserSpot.insertedId,
            spot: {
                userId,
                _id: `$osmType}:${osmId}`,
                elementLat, elementLng, name, amenity, address, tags
            }
        });
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        return res.status(500).json({ success: false, message: 'Error adding spot' });
    }
});

export default router;