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
  const { url } = request.body
  
  if (!url) 
    return response.json({ error: 'URL is required', status: 400 });
  if (!(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(url)))
    return response.json({ error: 'invalid url' })
  
  response.json({
    original_url: url,
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
