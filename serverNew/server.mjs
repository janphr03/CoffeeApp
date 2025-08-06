import express from 'express';
import mongo from './DB/mongo.mjs';



const app = express()
const port = 3000

// Mongo-DB Verbindungsdaten
app.get('/', async (req, res) => {
    console.log(await mongo.getUserData())
    res.send('Hello World!')
})

// DB-PW: XaTo1ON9ac0ZsGHp
const uri = "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@coffeeapp.nxw2owg.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeApp"



// startet den Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
