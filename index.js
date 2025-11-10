const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://fineease-db:dQW9RGbsoem0qkl0@cluster0.gpc8o8j.mongodb.net/?appName=Cluster0";

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
    await client.connect();
    
const db = client.db("TransactionDB");
    const transactionCollection = db.collection("transactions");

    console.log("✅ MongoDB Connected");

    app.post('/add-transaction', async (req, res) => {
      const data = req.body;
      const result = await transactionCollection.insertOne(data);
      res.send(result);
    });

app.get('/transactions', async (req, res) => {
      const result = await transactionCollection.find().toArray();
      res.send(result);
    });

    app.get('/my-transactions', async (req, res) => {
      const email = req.query.email;
      const result = await transactionCollection.find({ email }).toArray();
      res.send(result);
    });

      app.get('/transaction/:id', async (req, res) => {
      const id = req.params.id;
      const result = await transactionCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

     app.put('/transaction/update/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await transactionCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });


    app.delete('/transaction/:id', async (req, res) => {
      const id = req.params.id;
      const result = await transactionCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is runnig baby!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})