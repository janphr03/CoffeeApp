// db/spots.ts
import 'dotenv/config';
import { Db, MongoClient} from 'mongodb';

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
            const id = `${userId}:${osmType}:${osmId}`;

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

    // Löscht einen Spot aus den Favoriten eines Benutzers
    async deleteSpot(userId: string, spotId: string) {
        try {
            const collection = db.collection<any>(collectionName);
            // Die komplette _id ist jetzt userId:spotId
            const fullId = `${userId}:${spotId}`;
            console.log(`🗑️ Lösche Spot mit ID: "${fullId}"`);
            
            return await collection.deleteOne({ 
                _id: fullId 
            });
        } catch (error) {
            throw error;
        }
    }

    // Prüft, ob ein Spot bereits in den Favoriten eines Benutzers ist
    async isSpotFavorited(userId: string, spotId: string) {
        try {
            const collection = db.collection<any>(collectionName);
            // Die komplette _id ist jetzt userId:spotId
            const fullId = `${userId}:${spotId}`;
            console.log(`🔍 Prüfe Favoriten-Status für ID: "${fullId}"`);
            
            const spot = await collection.findOne({ 
                _id: fullId 
            });
            const isFavorited = spot !== null;
            console.log(`✅ Favoriten-Status für "${fullId}": ${isFavorited}`);
            
            return isFavorited;
        } catch (error) {
            throw error;
        }
    }

    // Zählt, wie oft ein Spot als Favorit hinzugefügt wurde (für Bewertungsanzeige)
    async getFavoritesCountForSpot(spotId: string): Promise<number> {
        try {
            console.log(`🔍 Zähle Favoriten für Spot-ID: "${spotId}"`);
            const collection = db.collection<any>(collectionName);
            
            // Debug: Zeige ALLE Dokumente in der Collection
            const allDocuments = await collection.find({}).toArray();
            console.log(`🔍 ALLE Dokumente in der Collection:`, allDocuments.map(doc => ({
                _id: doc._id,
                userId: doc.userId,
                name: doc.name
            })));
            
            // Da die _id jetzt das Format "userId:osmType:osmId" hat, 
            // müssen wir alle Dokumente finden, die mit ":spotId" enden
            const pattern = new RegExp(`:${spotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
            
            const count = await collection.countDocuments({ 
                _id: { $regex: pattern }
            });
            console.log(`📊 Favoriten-Anzahl für "${spotId}": ${count}`);
            
            // Debug: Zeige alle Dokumente die dem Pattern entsprechen
            const documents = await collection.find({ _id: { $regex: pattern } }).toArray();
            console.log(`🔍 Gefundene Dokumente für Pattern "${pattern}":`, documents.map(doc => ({
                _id: doc._id,
                userId: doc.userId,
                name: doc.name
            })));
            
            return count;
        } catch (error) {
            console.error('❌ Fehler beim Zählen der Favoriten für Spot:', spotId, error);
            return 0; // Fallback: 0 Favoriten bei Fehler
        }
    }

}
