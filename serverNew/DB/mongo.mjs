// Datei: DB/findUser.js
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const client = new MongoClient(uri);

const username = "Jan";

export async function getUserData() {
    try {
        await client.connect();
        const db = client.db("CoffeeAppDB"); // <- das ist die DB wie im Screenshot
        const collection = db.collection("Users");

        const user = await collection.findOne({ name: username });

        if (user) {
            console.log("✅ Benutzer gefunden:", user);
        } else {
            console.log("❌ Kein Benutzer mit dem Namen gefunden.");
        }
    } catch (err) {
        console.error("Fehler beim Abrufen:", err);
    } finally {
        await client.close();
    }
}

export default { getUserData };




/*import {MongoClient} from "mongodb";

const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp";
const database = "CoffeeSpots";


const client = new MongoClient(uri);

async function run(){

    try {
        await client.connect()

        const database = database.collection("users");
        const meinEintrag = users.findOne({name: "Jan"});
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.close();
    }


    console.log(meinEintrag);
}*/

