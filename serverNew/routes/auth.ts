import express from "express";
import bcrypt from "bcrypt";
import { getUserCollection } from '../Db/databaseOperations';
import {MongoClient} from "mongodb";

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";

const client = new MongoClient(uri);
client.connect();

export const db = client.db("CoffeeAppDB");

const router = express.Router();

// Middleware für JSON-Parsing
router.use(express.json());

// /register
router.post('/register', async (req, res) => {
  try {
    const {username, email, password} = req.body;

    //==== Eingabe prüfen ====
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all fields'
      });
    }
    // ==== Existenz prüfen ====
    const users = await getUserCollection();
    const existingUser = await users.findOne({username}); // gibt es den username in der Collection users?

    if (existingUser) {
      return res.status(400).json({success: false, message: 'Benutzer existiert bereits.'});
    }

    //==== Passwort hashen ====
    const hashedPassword = await bcrypt.hash(password, 10);

    //==== in DB speichern ====
    const result = await users.insertOne({username, email, password: hashedPassword});

    //==== Session aktivieren ====
    req.session.userId = result.insertedId.toString();
    req.session.username = username;

    res.status(201).json({success: true, message: ' Benutzer erfolgreich registriert.'});
  }

  catch (error) {
    console.error("Fehler bei der Registrierung: ", error);
    res.status(500).json({success: false, message: 'Fehler bei der Registrierung.'});

  }

})
export default router;

// /login

// /logout

