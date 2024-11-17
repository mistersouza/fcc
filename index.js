const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
require('dotenv').config()

const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('DB Connected 🚀'))
.catch((error) => {
  console.error('DB Connection Failed ❌', error)
  process.exit(1)
})

let bucket;
mongoose.connection.once('open', () => {
  try {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS bucket initialized');
  } catch (error) {
    console.error('GridFS bucket initialization failed:', error);
  }
});

  
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const File = require('./models/file'); 

const upload = multer();

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/fileanalyse', upload.single('upfile'), async (request, response) => {
  try {
    const { file } = request;
    
    if (!file) {
      return response.status(400).json({ error: 'No file uploaded' });
    }

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(file.originalname);
    readableStream.pipe(uploadStream);

    await File.findOneAndUpdate(
      { gridFSFileId: uploadStream.id },
      {
        filename: file.originalname,
        contentType: file.mimetype,
        length: file.size
      }, 
      { upsert: true }
    );

    response.json({
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
  } catch (error) {
    console.error('Uploading file failed:', error);
    response.status(500).json({ error: 'File upload failed' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});