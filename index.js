const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Token verify function is here
const verifyToken = (req, res, next) => {
  const authorize = req.headers.authorize;
  if (!authorize) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized Access!" });
  }
  const token = authorize.split(" ")[1];
  jwt.verify(token, process.env.DB_Access_token, (error, decoded) => {
    if (error) {
      return res
        .status(403)
        .send({ error: true, message: "Invalid Token access" });
    }
    req.decoded = decoded;
    next();
  });
};

// MongoDb connection from here
const uri = `mongodb+srv://${process.env.MongodbUserName}:${process.env.MongodbPassword}@cluster0.85env82.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // My all of router is from here
    const HouseHunter = client.db("HouseHunter");
    const users = HouseHunter.collection("users");
    const AllHouses = HouseHunter.collection("allhouses");
    const BookingHouses = HouseHunter.collection("bookinghouses");

    // verfify House Owner function is here
    const verifyHouseOwner = async (req, res, next) => {
      const tokenEmail = req.decoded.email;
      const result = await users.findOne({ email: tokenEmail });
      if (result.role !== "HouseOwner") {
        return res
          .status(403)
          .send({ error: true, message: "unauthorize instractor access!" });
      }
      next();
    };
    // verfify House renter function is here
    const verifyHouseRenter = async (req, res, next) => {
      const tokenEmail = req.decoded.email;
      const result = await users.findOne({ email: tokenEmail });
      if (result.role !== "HouseRenter") {
        return res
          .status(403)
          .send({ error: true, message: "unauthorize instractor access!" });
      }
      next();
    };

    // filter house route is here
    app.post("/filterdata", async(req,res)=>{
      try {
        const filterData = req.body;
        const rentmonth = req.query.rent;
        if(rentmonth == "More5000"){
          const query ={...filterData,rentpermonth:{ $gte:500} }
          const result = await AllHouses.find(query).toArray();
          res.send(result);
        }else{
          const query ={...filterData,rentpermonth:{ $lt:500} }
          const result = await AllHouses.find(query).toArray();
          res.send(result);
        }
        const query ={...filterData}
        const result = await AllHouses.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log("filter houses route is not working!")
      }
    })

    // get houserenter house route is here
    app.get("/houserenterhouse", verifyToken, verifyHouseRenter, async(req,res)=>{
      try {
        const email = req.query.email;
        const result = await BookingHouses.find({bookingEmail: email}).toArray();
        res.send(result);
      } catch (error) {
        console.log("Houserenterhouse route is not wokring!")
      }
    })

    //Get all houses route is here
    app.get("/allhouses", async (req, res) => {
      try {
        const result = await AllHouses.find().toArray();
        res.send(result);
      } catch (error) {
        console.log("all houses route is not working!");
      }
    });
    // get single user houses route is here
    app.get(
      "/getsingleuserhouses",
      verifyToken,
      verifyHouseOwner,
      async (req, res) => {
        try {
          const email = req.query.email;
          const result = await AllHouses.find({ HouseEmail: email }).toArray();
          res.send(result);
        } catch (error) {
          console.log("get single user houses route is not working!");
        }
      }
    );

    //get single house by house owner route is here
    app.get("/gethouse", verifyToken, verifyHouseOwner, async (req, res) => {
      try {
        const houseID = req.query.id;
        const result = await AllHouses.findOne({ _id: new ObjectId(houseID) });
        res.send(result);
      } catch (error) {
        console.log("get single house route is not working");
      }
    });

    // new user create route is here
    app.post("/createnewuser", async (req, res) => {
      try {
        const data = req.body;
        console.log("body data", data);
        const availableUser = await users.findOne({ email: data.email });
        console.log(availableUser);
        if (!availableUser) {
          const result = await users.insertOne(data);
          res.send(result);
        } else {
          res.status(401).send({
            error: "already available this user",
            message: "alreadyHaveUser",
          });
        }
      } catch (error) {
        console.log("create new user route is not working!");
      }
    });

    // get User route is here
    app.get("/getnewuser", async (req, res) => {
      try {
        const UserEmail = req.query.email;
        const result = await users.findOne({ email: UserEmail });
        if (result) {
          res.send(result);
        } else {
          res.send({ error: "noUser" });
        }
      } catch (error) {
        console.log("get user route is not working!");
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

    // delete houses route is here
    app.delete(
      "/deleteuserroute",
      verifyToken,
      verifyHouseOwner,
      async (req, res) => {
        try {
          const houseid = req.query.id;
          const result = await AllHouses.deleteOne({
            _id: new ObjectId(houseid),
          });
          res.send(result);
        } catch (error) {
          console.log("delete route is not working!");
        }
      }
    );

    // new house create route is here
    app.post(
      "/createnewhouse",
      verifyToken,
      verifyHouseOwner,
      async (req, res) => {
        try {
          const data = req.body;
          const result = await AllHouses.insertOne(data);
          res.send(result);
        } catch (error) {
          console.log("create new house route is not working!");
        }
      }
    );

    // house data update by houseowner route is here
    app.patch(
      "/updatehouse",
      verifyToken,
      verifyHouseOwner,
      async (req, res) => {
        try {
          const updateID = req.query.id;
          const updateData = req.body;
          const query = { _id: new ObjectId(updateID) };
          const updateDoc = {
            $set: { ...updateData },
          };
          const result = await AllHouses.updateOne(query, updateDoc);
          res.send(result);
        } catch (error) {
          console.log("update route is not working");
        }
      }
    );

    //Booking house route is here
    app.post(
      "/bookinghouse",
      verifyToken,
      verifyHouseRenter,
      async (req, res) => {
        try {
          const data = req.body;
          const total = await BookingHouses.find({
            bookingEmail: data.bookingEmail,
          }).toArray();
          if (total.length >= 2) {
            res.send({error:"maxtwoError"});
          } else {
            const result = await BookingHouses.insertOne(data);
            res.send(result);
          }
        } catch (error) {
          console.log("Booking house route is not working!");
        }
      }
    );

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Mongodb connectin end from here

app.get("/", (req, res) => {
  res.send("HouseHunter server running well");
});

app.listen(port, () => {
  console.log(`House Hunter server running with ${port}`);
});
