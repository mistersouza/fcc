const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI,{})
  .then(() => console.log('Connected to MongoDB'))
  .catch(() => console.error('Error connecting to DB'))
  
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const User = require('./models/user')
const Exercise = require('./models/exercise')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (request, response) => {
  try {
    const users = await User.find({})
    return response.json(users)
  } catch (error) {
    return response.status(500).json({
      message: "Failed to retrieve users", error
    })
  }
})

app.post('/api/users', async (request, response) => {
  const { username } = request.body;

  if (!username) {
    return response.status(400).json({ 
      message: "We need a username to get you started"
    })
  }

  try {
    const userEntry = await User.findOneAndUpdate(
      { username },
      { username },
      { new: true, upsert: true },
    )

    return response.json({
      _id: userEntry._id,
      username: userEntry.username
    })
  } catch (error) {
    return response.status(500).json({ message: "Oops something's gone wrong" })
  }
})

app.post('/api/users/:_id/exercises', async (request, response) => {
  const { _id: id } = request.params
  let { description, duration, date } = request.body; 

  if (!description || !duration) {
    return response.status(400).json({ 
      message: "We need both description and duration to proceed."
    })
  }

  if (!date || date === null) date = Date.now(); 

  try {
    const exerciseEntry = await Exercise.create({
      userId: id,
      description,
      duration,
      date
    })
    return response.json(exerciseEntry)
  } catch (error) {
    return response.status(500).json({ message: "Oops something's gone wrong", error })
  }
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


