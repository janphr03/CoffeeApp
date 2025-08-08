"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.db = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const databaseOperations_1 = require("../Db/databaseOperations");
const mongodb_1 = require("mongodb");
const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const client = new mongodb_1.MongoClient(uri);
client.connect();
exports.db = client.db("CoffeeAppDB");
exports.router = express_1.default.Router();
// /register
exports.router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        //==== Eingabe prüfen ====
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all fields'
            });
        }
        // ==== Existenz prüfen ====
        const users = (0, databaseOperations_1.getUserCollection)();
        const existingUser = await users.findOne({ username }); // gibt es den username in der Collection users?
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Benutzer existiert bereits.' });
        }
        //==== Passwort hashen ====
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        //==== in DB speichern ====
        const result = await users.insertOne({ username, email, password: hashedPassword });
        //==== Session aktivieren ====
        req.session.userId = result.insertedId;
        req.session.username = username;
        res.status(201).json({ success: true, message: ' Benutzer erfolgreich registriert.' });
    }
    catch (error) {
        console.error("Fehler bei der Registrierung: ", error);
        res.status(500).json({ success: false, message: 'Fehler bei der Registrierung.' });
    }
});
// /login
// /logout
exports.default = exports.router;
