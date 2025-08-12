// db/spots.ts
import { Db, MongoClient} from 'mongodb';
import dotenv from 'dotenv/config';

// Verbindung zur MongoDB-Datenbank herstellen
const uri: string = process.env.MONGODB_URI || '';
const dbName = "CoffeeAppDB";                       // Name der Datenbank
const collectionName = "SpotsAddedByUsers";         // Name der Collection für Spots
const client = new MongoClient(uri);                // MongoDB-Client erstellen
let db: Db;                                         // Variable zum Speichern der DB-Instanz

// Direkt beim Start verbinden und db setzen
client.connect()
    .then(() => {
        db = client.db(dbName);
    });

// Klasse für Datenbankoperationen
export class DatabaseOperations {

    // Holt die Users-Collection
    async getUserCollection() {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('Users');
    }

    // Holt alle Spots eines bestimmten Benutzers anhand der userId
    async getSpotsByUserId(userId: string) {
        try {
            const collection = db.collection(collectionName);
            const spots = await collection.find({ userId }).toArray();
            // map() kopiert jedes Dokument in ein neues Objekt
            return spots.map(spot => ({...spot}));
        } catch (error) {
            throw error;
        }
    }

    // Erstellt einen neuen Spot in der Datenbank
    async createSpot(
        userId: string,
        osmType: 'node'|'way'|'relation',
        osmId: number,
        lat: number,
        lon: number,
        name: string,
        amenity: string,
        address: string,
        tags: Record<string, string>
    ) {
        try {
            // Locker typisiert, damit _id auch ein String oder ein Objekt sein kann
            const collection = db.collection<any>(collectionName);

            // Erzeugt eine eindeutige ID aus OSM-Typ und OSM-ID
            const id = `${osmType}:${osmId}`;

            // Fügt das Dokument ein
            return await collection.insertOne({
                userId,
                _id: id,
                lat,
                lon,
                geometry: { type: 'Point', coordinates: [lon, lat] }, // GeoJSON-Format [lon, lat]
                name,
                amenity,
                address,
                tags,
                source: 'openstreetmap',
                addedAt: new Date(),
                updatedAt: new Date()
            });
        } catch (error) {
            throw error;
        }
    }

}
