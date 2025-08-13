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
        const userId = req.session?.userId; // user ID aus Session

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
        const userId = req.session?.userId; // userId wird aus Session gezogen
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
                _id: `${userId}:${osmType}:${osmId}`,
                elementLat, elementLng, name, amenity, address, tags
            }
        });
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        return res.status(500).json({ success: false, message: 'Error adding spot' });
    }
});

// DELETE /api/spots/:spotId - Spot aus Favoriten entfernen
router.delete('/:spotId', async (req: Request, res: Response) => {
    try {
        const userId = req.session?.userId;
        const { spotId } = req.params;

        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Spot löschen
        const result = await spotsDB.deleteSpot(userId, spotId);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Spot not found or not owned by user'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Spot removed from favorites successfully'
        });
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Spots:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error removing spot from favorites' 
        });
    }
});

// GET /api/spots/check/:spotId - Prüft, ob ein Spot favorisiert ist
router.get('/check/:spotId', async (req: Request, res: Response) => {
    try {
        const userId = req.session?.userId;
        const { spotId } = req.params;

        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Prüfe, ob Spot favorisiert ist
        const isFavorited = await spotsDB.isSpotFavorited(userId, spotId);

        return res.status(200).json({
            success: true,
            isFavorited: isFavorited
        });
    } catch (error) {
        console.error('❌ Fehler beim Prüfen des Favoriten-Status:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error checking favorite status' 
        });
    }
});

// GET /api/spots/favorites-count/:spotId - Anzahl der Favoriten für einen Spot
router.get('/favorites-count/:spotId', async (req: Request, res: Response) => {
    try {
        const { spotId } = req.params;
        console.log(`🔍 Backend: Erhalte Favoriten-Anzahl-Request für Spot-ID: "${spotId}"`);

        if (!spotId) {
            console.warn('⚠️ Backend: Keine Spot-ID bereitgestellt');
            return res.status(400).json({
                success: false,
                message: 'Spot ID ist erforderlich'
            });
        }

        // Zähle, wie oft der Spot in der SpotsAddedByUsers Collection vorkommt
        const favoritesCount = await spotsDB.getFavoritesCountForSpot(spotId);
        console.log(`✅ Backend: Favoriten-Anzahl für "${spotId}": ${favoritesCount}`);

        return res.status(200).json({
            success: true,
            spotId: spotId,
            favoritesCount: favoritesCount
        });
    } catch (error) {
        console.error(`❌ Backend: Fehler beim Abrufen der Favoriten-Anzahl:`, error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching favorites count' 
        });
    }
});

export default router;