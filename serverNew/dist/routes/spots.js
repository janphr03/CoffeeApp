"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/spots.ts
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware/middleware");
const databaseOperations_1 = require("../Db/databaseOperations");
// Routen und DB-Operationen definieren
const router = express_1.default.Router();
const spotsDB = new databaseOperations_1.DatabaseOperations();
// Middleware für JSON-Parsing
router.use(express_1.default.json());
router.use(middleware_1.requireAuth);
// GET /api/spots - Alle Spots des authentifizierten Nutzers | req ist schon ein geparstes JS Objekt
router.get('/', async (req, res) => {
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
    }
    catch (error) {
        console.error('❌ Fehler beim Abrufen der Spots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spots'
        });
    }
});
// POST /api/spots - Neuen Spot hinzufügen
// req ist der Body der schon in ein JS Objekt umgewandelt wurde
router.post('/', async (req, res) => {
    try {
        const { location } = req.body; // location wird aus JSON-Body gezogen
        const userId = req.session?.username; // userId wird aus JSON-Body gezogen
        // gibt es eine Location die man hinzufügen kann?
        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Location is required'
            });
        }
        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const result = await spotsDB.createSpot(userId, location); // Spot wird hinzugefügt und als Objekt gespeichert
        res.status(201).json({
            success: true,
            message: 'Spot added successfully',
            spot: { _id: result.insertedId, userId, location }
        });
    }
    catch (error) {
        console.error('❌ Fehler beim Speichern des Spots:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding spot'
        });
    }
});
exports.default = router;
