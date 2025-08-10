import express from "express";
import bcrypt from "bcrypt";
import { DatabaseOperations } from '../Db/databaseOperations';

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const router = express.Router();

const db =  new DatabaseOperations();

// Middleware für JSON-Parsing
router.use(express.json());

// Registrierung ============================================================================================================
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

    const users = await db.getUserCollection();

    //==== auf doppelten Username prüfen ====
    const existingUser = await users.findOne({username}); // gibt es den username in der Collection users?

    if (existingUser) {
      return res.status(400).json({success: false, message: 'Benutzer existiert bereits.'});
    }

    //==== auf doppelte Mail prüfen ====
    const existingEmail = await users.findOne({email}); // gibt es die email in der Collection users?

    if (existingEmail) {
        return res.status(400).json({success: false, message: 'Email existiert bereits.'});
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



// Login ============================================================================================================
router.post("/login", async (req, res) => {
  try{
    const {identifier, password} = req.body // identifier ist username oder email

    // ==== Eingabe prüfen ====
    if(!identifier || !password){
      return res.status(400).json({success: false, message: 'Bitte alle Felder ausfüllen.'});
    }

    // ==== Username / mail matchen  ====
    const users = await db.getUserCollection(); // Zugriff auf die User-Collection
    const user = await users.findOne({$or: [{username: identifier}, {email: identifier}]});// Suche nach username oder email

    if(!user){
      return res.status(400).json({success: false, message: 'Benutzer nicht gefunden.'});
    }

    // ==== Passwort prüfen ====
    const isPasswordValid = await bcrypt.compare(password, user.password); // Passwort wird mit dem in der DB gespeicherten Passwort verglichen
    if(!isPasswordValid){
      return res.status(400).json({success: false, message: 'Falsches Passwort.'});
    }

    // ==== Session aktivieren (darin wird automatisch der Cookie erzeugt) ====
    req.session.userId = user._id.toString(); // user._id ist ein Object
    req.session.username = user.username;

    return res.status(200).json({success: true, message: 'Erfolgreich eingeloggt.',  user: {id: user._id, username: user.username, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt}});
  }

  catch(err){
    console.error("Fehler beim Login: ", err);
    return res.status(500).json({success: false, message: 'Fehler beim Login.'});
  }
})



// Logout ============================================================================================================
router.post('/logout', (req, res) => {
  try {

    // Prüfen, ob eine Session existiert
    if (!req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Keine aktive Sitzung – Benutzer ist nicht eingeloggt.'
      });
    }

    // Session löschen
    req.session.destroy((err) => {
      if (err) {
        console.error('Fehler beim Beenden der Sitzung:', err);
        return res.status(500).json({success: false, message: 'Fehler beim Beenden der Sitzung.'});
      }
        res.clearCookie('connect.sid'); // Cookie löschen
        res.status(200).json({success: true, message: 'Erfolgreich ausgeloggt.'});
    });

  }
  catch (error) {
    console.error('Fehler beim Logout:', error);
    res.status(500).json({success: false, message: 'Fehler beim Logout'});
  }
});


export default router;