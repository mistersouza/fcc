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
const Log = require('./models/log')

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
  const { _id: userId } = request.params
  const { description, duration, date } = request.body; 

  if (!description || !duration) {
    return response.status(400).json({ 
      message: "We need both description and duration to proceed."
    })
  }

  try {
    const user = await User.findById(userId);
    if (!user) 
      return response.status(404).json({message: 'User not found'});

    const exerciseEntry = await Exercise.create({
      userId,
      description,
      duration,
      date: date ? new Date(date) : new Date()
    });

    await Log.findOneAndUpdate(
      { userId },
      {
        $push: { exercises: exerciseEntry._id },
        $inc: { count: 1 }
      },
      { upsert: true }
    ); 

    return response.json({
      _id: user._id,
      username: user.username,
      description: exerciseEntry.description,
      duration: exerciseEntry.duration,
      date: exerciseEntry.date.toDateString()
    })
  } catch (error) {
    return response.status(500).json({ message: "Oops something's gone wrong", error })
  }
})

app.get('/api/users/:_id/logs', async (request, response) => {
  const {_id: userId } = request.params
  const { from, to, limit } = request.query;

  try {
    const user = await User.findById(userId); 
    if (!user) return response.status(404).json({
      message: "User not found"
    })

    let log = await Log.findOne({ userId })
      .populate({
        path: 'exercises',
        match: {
          ...(from && { date: { $gte: new Date(from) } }),
          ...(to && { date: { $lte: new Date(to) } })
        },
        options: { limit: parseInt(limit) || 0}
    }); 
    if (!log) return response.status(404).json({
      message: "No exercise logged yet"
    })

    response.json({
      count: log.count,
      log: log.exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
    });

  } catch (error) {
    return response.status(500).json({
      message: "Oops something's gone wrong", error
    })
  }
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


