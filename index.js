const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;


app.use(cors());


// MongoDb connection from here
const uri = `mongodb+srv://${process.env.MongodbUserName}:${process.env.MongodbPassword}@cluster0.85env82.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // My all of router is from here
    const HouseHunter = client.db("HouseHunter");
    const users = HouseHunter.collection('users');
















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Mongodb connectin end from here










app.get("/", (req,res)=>{
    res.send('HouseHunter server running well');
});

app.listen(port, ()=>{
    console.log(`House Hunter server running with ${port}`);
})