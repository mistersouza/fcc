require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to DB', error))

app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let Url = require('./models/url');
let counter = 1;

app.post('/api/shorturl', async (request, response) => {
  const { url } = request.body;

  try {
    const validUrl = new URL(url)

    const urlEntry = await Url.create({
      url: validUrl.href,
      shortUrl: counter
    })

    counter++; 

    return response.json({
      original_url: urlEntry.url,
      short_url : urlEntry.shortUrl
    })
  } catch (error) {
    return response.json({ error: "invalid url"})
  }
});

app.get('/api/shorturl/:short_url', (request, response) => {
  const { short_url } = request.params

  Url.findOne({ shortUrl: short_url })

})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
