"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/spots.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const databaseOperations_1 = require("../Db/databaseOperations");
const router = express_1.default.Router();
const spotsDB = new databaseOperations_1.DatabaseOperations();
// Middleware für JSON-Parsing
router.use(express_1.default.json());
router.use(auth_1.requireAuth);
// GET /api/spots - Alle Spots des authentifizierten Nutzers
router.get('/', async (req, res) => {
    try {
        const userId = req.session?.username;
        // gibt es einen User?
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const spots = await spotsDB.getSpotsByUserId(userId);
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
router.post('/', async (req, res) => {
    try {
        const { location } = req.body;
        const userId = req.session?.username;
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
        const result = await spotsDB.createSpot(userId, location);
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
