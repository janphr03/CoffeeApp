// db/spots.ts
import { Db, MongoClient} from 'mongodb';

const uri: string = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "SpotsAddedByUsers";
const client = new MongoClient(uri);
let db: Db;
client.connect()
    .then(() => {
        db = client.db(dbName);
    });



export class DatabaseOperations {

    async getUserCollection() {
        await client.connect();
        const db = client.db(dbName);
        return db.collection('Users');
    }


    async getSpotsByUserId(userId: string) {
        try {
            const collection = db.collection(collectionName);
            const spots = await collection.find({ userId }).toArray();
            return spots.map(spot => spot.location);
        } catch (error) {
            throw error;
        }
    }


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
            // locker typisieren, damit _id auch string sein darf
            const collection = db.collection<any>(collectionName);

            const id = `${osmType}:${osmId}`; // ← korrekt interpoliert

            return await collection.insertOne({
                userId,
                _id: id,
                lat,
                lon,
                geometry: { type: 'Point', coordinates: [lon, lat] }, // [lon, lat]
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

