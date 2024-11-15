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

const User = require('./models/user');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (request, response) => {
  return response.json({
    users: await User.find({}) 
  })
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


