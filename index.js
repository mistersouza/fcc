const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config()

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected 🚀'))
  .catch((error) => console.error('DB Connection Failed ❌', error))

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const File = require('./models/file'); 

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/fileanalyse', upload.single('upfile'), (request, response) => {
  const { file } = request;

  if (!file) {
    return response.status(400).json({ error: 'No file uploaded' });
  }

  response.json({
    file
  });
});




const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
