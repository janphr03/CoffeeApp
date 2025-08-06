// @ts-ignore
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/auth';

const app = express();
const port = 3000;

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // React dev server
  credentials: true
}));

// Session configuration
app.use(session({
  secret: 'coffee-app-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots API ist erreichbar!');
});

// Protected route example - requires authentication
app.get('/api/spots', requireAuth, async (req, res) => {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const spots = await collection.find({ userId: req.session?.username || "unknown" }).toArray();
        await client.close();
        
        res.json({
            success: true,
            spots: spots,
            user: req.session?.username
        });
    } catch (error) {
        console.error("Error fetching spots:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching spots"
        });
    }
});

// Protected route to add a new spot
app.post('/api/spots', requireAuth, async (req, res) => {
    try {
        const { location } = req.body;
        
        if (!location) {
            return res.status(400).json({
                success: false,
                message: "Location is required"
            });
        }
        
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const newSpot = {
            userId: req.session?.username,
            location,
            createdAt: new Date()
        };
        
        const result = await collection.insertOne(newSpot);
        await client.close();
        
        res.status(201).json({
            success: true,
            message: "Spot added successfully",
            spot: { _id: result.insertedId, ...newSpot }
        });
    } catch (error) {
        console.error("Error adding spot:", error);
        res.status(500).json({
            success: false,
            message: "Error adding spot"
        });
    }
});


app.listen(port, async () => {
    console.log(`🚀 CoffeeSpots-App läuft auf http://localhost:${port}`);

    // Connect to MongoDB with Mongoose for user authentication
    try {
        await mongoose.connect(uri, { dbName });
        console.log('✅ Connected to MongoDB with Mongoose');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB with Mongoose:', error);
    }

    // Legacy MongoDB client connection for existing spots functionality
    const client = new MongoClient(uri);
    try {
        // Verbindung aufbauen und Konstanten erstellen
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const userId = "Alex"
        const location = "neuer Test"


        // 1️⃣ Spot für Jan einfügen
        const insertResult = await collection.insertOne({
           userId,location, createdAt: new Date()
        });
        console.log("Neuer Spot eingefügt:", insertResult.insertedId);


        // 2️⃣ Alle Spots von Jan abfragen
        const spots = await collection.find({userId}).toArray();
        const locations = spots.map(spot => spot.location);
        console.log(`Orte von ${userId}:`, locations);
    } catch (error) {
        console.error("Fehler beim DB-Zugriff:", error);
    } finally {
        await client.close();
    }
});


