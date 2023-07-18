const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


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


    // new user create route is here
    app.post('/createnewuser', async(req,res)=>{
        try {
          const data = req.body;
            console.log("body data",data);
            const availableUser = await users.findOne({email: data.email});
            console.log(availableUser);
            if(!availableUser){
                const result =await users.insertOne(data);
                res.send(result);
            }else{
                res.status(401).send({error: "already available this user", message:"alreadyHaveUser"});
            };
        } catch (error) {
            console.log("create new user route is not working!")
        };
    });

    // get User route is here
    app.get("/getnewuser", async(req,res)=>{
      try {
        const UserEmail = req.query.email;
        const result = await users.findOne({email: UserEmail});
        if(result){
          res.send(result);
        }else{
          res.send({error:"noUser"});
        }
      } catch (error) {
        console.log("get user route is not working!")
      }
    });

    // json web token create route is here
    app.post("/jwt", (req, res) => {
      try {
        const user = req.body;
        const accesstoken = process.env.DB_Access_token;
        const token = jwt.sign(user, accesstoken, {
          expiresIn: "1h",
        });
        res.send({ token });
      } catch (error) {
        console.log("create json token is not working");
      }
    });


















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