const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://fineease-db:dQW9RGbsoem0qkl0@cluster0.gpc8o8j.mongodb.net/?appName=Cluster0";

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

    console.log(" MongoDB Connected Successfully");

  
    app.post('/add-transaction', async (req, res) => {
      try {
        const data = req.body;
        if (data.date) data.date = new Date(data.date);
        const result = await transactionCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        console.error(" Insert failed:", err);
        res.status(500).send({ error: "Insert failed" });
      }
    });

   
    app.get('/transactions', async (req, res) => {
      try {
        const result = await transactionCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error("Fetch all transactions failed:", err);
        res.status(500).send({ error: "Fetch failed" });
      }
    });

    
    app.get('/my-transactions', async (req, res) => {
      try {
        const email = req.query.email;
        const sortBy = req.query.sortBy || "date"; 
        const order = req.query.order === "asc" ? 1 : -1; 

        const sortOptions = {};
        sortOptions[sortBy] = order;

        const result = await transactionCollection
          .find({ email })
          .sort(sortOptions)
          .toArray();

        res.send(result);
      } catch (err) {
        console.error(" Fetch user transactions failed:", err);
        res.status(500).send({ error: "Fetch failed" });
      }
    });

    
    app.get('/transaction/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await transactionCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.error(" Fetch transaction failed:", err);
        res.status(500).send({ error: "Fetch failed" });
      }
    });

    
    app.put('/transaction/update/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        if (updatedData.date) updatedData.date = new Date(updatedData.date);
        const result = await transactionCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        res.send(result);
      } catch (err) {
        console.error(" Update failed:", err);
        res.status(500).send({ error: "Update failed" });
      }
    });

    
    app.delete('/transaction/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await transactionCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.error(" Delete failed:", err);
        res.status(500).send({ error: "Delete failed" });
      }
    });

    

    
    app.get('/reports/category', async (req, res) => {
      try {
        const result = await transactionCollection.aggregate([
          { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
          { $sort: { totalAmount: -1 } }
        ]).toArray();
        res.send(result);
      } catch (err) {
        console.error(" Category report failed:", err);
        res.status(500).send({ error: "Failed to generate category report" });
      }
    });

    
    app.get('/reports/monthly', async (req, res) => {
      try {
        const result = await transactionCollection.aggregate([
          { $addFields: { dateObj: { $toDate: "$date" } } },
          {
            $group: {
              _id: { $month: "$dateObj" },
              totalAmount: { $sum: "$amount" }
            }
          },
          {
            $project: {
              _id: {
                $arrayElemAt: [
                  [
                    "", "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ],
                  "$_id"
                ]
              },
              totalAmount: 1
            }
          },
          { $sort: { _id: 1 } }
        ]).toArray();
        res.send(result);
      } catch (err) {
        console.error(" Error generating monthly report:", err);
        res.status(500).send({ error: "Failed to generate monthly report" });
      }
    });

    
    app.get('/', (req, res) => {
      res.send(' Server is running smoothly!');
    });

  } catch (error) {
    console.error(" Error connecting MongoDB:", error);
  }
}

run().catch(console.dir);


app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
