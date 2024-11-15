require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const { URL } = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to DB', error))

app.use(express.json()); 
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

const initCounter = async () => {
  try {
    const latestUrlEntry = await Url.findOne().sort({ shortUrl: -1 }).limit(1);
    if (latestUrlEntry) counter = latestUrlEntry.shortUrl + 1;
  } catch (error) {
    console.error('Error initializing counter', error);
    
  }
}

initCounter()

app.post('/api/shorturl', async (request, response) => {
  const { url } = request.body;

  if (!validUrl.isWebUri(url))
    return response.json({
      error: "invalid url"
    })

  try {
      const parsedUrl = new URL(url);
      
      const urlEntry = await Url.create({
        url: parsedUrl.href,
        shortUrl: counter
      });
      
      counter++; 

      return response.json({
        original_url: urlEntry.url,
        short_url: urlEntry.shortUrl
      });

  } catch (error) {
    return response.status(500).json({ error: "Oops something's gone wrong" });
  }
});


app.get('/api/shorturl/:short_url', async (request, response) => {
  const { short_url } = request.params;

  try {
    const entry = await Url.findOne({ shortUrl: short_url });

    if (!entry) {
      return response.status(404).json({ error: 'URL not found' });
    }

    response.redirect(entry.url);
  } catch (error) {
    return response.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
