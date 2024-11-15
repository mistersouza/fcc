require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (request, response) => {
  const { url } = request.body;

  if (!url)
    return response.status(400).json({ error: 'URL is required' });

  try {
    const cleanUrl = new URL(url).origin
    return response.json({
      original_url: cleanUrl,
    })
  } catch (error) {
    return response.json({ error: "Invalid URL"})
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
