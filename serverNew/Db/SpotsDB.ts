// db/spots.ts
import { MongoClient } from 'mongodb';

const uri: string = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const dbName = "CoffeeAppDB";
const collectionName = "Spots";

export class SpotsDB {
    async getSpotsByUserId(userId: string) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            const spots = await collection.find({ userId }).toArray();
            return spots.map(spot => spot.location);
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }

    async createSpot(userId: string, location: string) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            return await collection.insertOne({
                userId,
                location,
                createdAt: new Date()
            });
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    }
}