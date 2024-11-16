const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI,{})
  .then(() => console.log('DB Connected 🚀'))
  .catch(() => console.error('DB Connection Failed ❌'))
  
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
      message: "Whoops, couldn't fetch users 🤖", error
    })
  }
})

app.post('/api/users', async (request, response) => {
  const { username } = request.body;

  if (!username) {
    return response.status(400).json({ 
      message: "Gotta have a username! 💥"
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
    return response.status(500).json({ message: "Something's off, try again 💀" })
  }
})

app.post('/api/users/:_id/exercises', async (request, response) => {
  const { _id: userId } = request.params
  const { description, duration, date } = request.body; 

  if (!description || !duration) {
    return response.status(400).json({ 
      message: "Missing description or duration 😱"
    })
  }

  try {
    const user = await User.findById(userId);
    if (!user) 
      return response.status(404).json({message: 'User not found. Try again 🔍'});

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
    return response.status(500).json({ message: "Whoops, error logging exercise 🛑", error })
  }
})

app.get('/api/users/:_id/logs', async (request, response) => {
  const {_id: userId } = request.params
  const { from, to, limit } = request.query;

  try {
    const user = await User.findById(userId); 
    if (!user) return response.status(404).json({
      message: "User not found! Check again 🔎"
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
      message: "No logs found. Did you exercise today? 🏃‍♂️"
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
      message: "Something broke, we're on it! ⚡", error
    })
  }
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port ' + listener.address().port + ' 🎧');
})


