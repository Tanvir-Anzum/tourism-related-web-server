const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
// require('dotenv').config()
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukmrv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

// console.log(uri)

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const port = process.env.PORT || 5000
const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Heroku works!')
})

async function run() {
  try {
    await client.connect()
    const EventsCollection = client.db('volunteerNetwork').collection('events')
    const ordersCollection = client.db('volunteerNetwork').collection('orders')
    const usersCollection = client.db('volunteerNetwork').collection('users')
    const reviewCollection = client.db('volunteerNetwork').collection('review')

    // add Events
    app.post('/addEvent', async (req, res) => {
      console.log(req.body)
      const result = await EventsCollection.insertOne(req.body)
      console.log(result)
      res.send(result)
    })

    // get search events
    app.get('/searchEvent', async (req, res) => {
      const result = await EventsCollection.find({
        title: { $regex: req.query.search },
      }).toArray()
      res.send(result)
      console.log(result)
    })

    // add volunteer

    app.post('/orders', async (req, res) => {
      console.log(req.body)
      console.log('dekhi')
      const result = await ordersCollection.insertOne(req.body)
      res.send(result)
    })

    // get all volunteer

    // get all events

    app.get('/allEvents', async (req, res) => {
      const result = await EventsCollection.find({}).toArray()
      res.send(result)
    })
    app.get('/orders', async (req, res) => {
      const result = await ordersCollection.find({}).toArray()
      res.send(result)
    })

    // delete event

    app.delete('/deleteEvent/:id', async (req, res) => {
      console.log(req.params.id)
      console.log('ses eta')
      const result = await EventsCollection.deleteOne({
        _id: ObjectId(req.params.id),
      })
      res.send(result)
    })
    app.delete('/orders/:id', async (req, res) => {
      console.log(req.params.id)
      console.log('ses eta')
      const query = {
        _id: ObjectId(req.params.id),
      }
      console.log(query)
      const result = await ordersCollection.deleteOne(query)
      console.log(result)
      res.json(result)
    })


          // reviews

           app.post('/reviews', async (req, res) => {
             const review = req.body
             const result = await reviewCollection.insertOne(review)
             res.json(result)
           })

            app.get('/reviews', async (req, res) => {
              const result = await reviewCollection.find({}).toArray()
              res.send(result)
            })

       app.post('/users', async (req, res) => {
         const user = req.body
         const result = await usersCollection.insertOne(user)
         console.log(result)
         res.json(result)
       })



        app.put('/users', async (req, res) => {
          const user = req.body
          const filter = { email: user.email }
          const options = { upsert: true }
          const updateDoc = { $set: user }
          const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
          )
          res.json(result)
        })


          app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: {role: 'admin'} }
            const result = await usersCollection.updateOne(
              filter,
              updateDoc
            )
            res.json(result)
          })
       

          // checking if user is admin
           
          app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
              isAdmin = true
            }
            res.json({ admin: isAdmin })
          })


    // my events

    app.get('/allEvents/:email', async (req, res) => {
      const result = await EventsCollection.find({
        email: req.params.email,
      }).toArray()
      res.send(result)
    })
    app.get('/orders/:email', async (req, res) => {
      const result = await ordersCollection
        .find({
          email: req.params.email,
        })
        .toArray()
      res.send(result)
    })
    app.get('/singleItem/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(req.params.id) }
      const result = await EventsCollection.findOne(query)
      res.json(result)
    })
  } finally {
  }
}
run().catch(console.dir)

// add addVolunteer

// get all volunteer

app.listen(process.env.PORT || port)
