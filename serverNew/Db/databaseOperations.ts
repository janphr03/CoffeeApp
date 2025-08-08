// db/spots.ts
import { Db, MongoClient} from 'mongodb';

const uri: string = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";
const client = new MongoClient(uri);
let db: Db;
client.connect()
    .then(() => {
        db = client.db(dbName);
    });

export async function getUserCollection() {
    await client.connect();
    const db = client.db(dbName);
    return db.collection('Users');
}

export class DatabaseOperations {
    async getSpotsByUserId(userId: string) {
        try {
            const collection = db.collection(collectionName);
            const spots = await collection.find({ userId }).toArray();
            return spots.map(spot => spot.location);
        } catch (error) {
            throw error;
        }
    }

    async createSpot(userId: string, location: string) {
        try {
            const collection = db.collection(collectionName);

            return await collection.insertOne({
                userId,
                location,
                createdAt: new Date()
            });
        } catch (error) {
            throw error;
        }
    }
}