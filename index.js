const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
require('dotenv').config()

const app = express();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected 🚀');
  } catch (error) {
    console.error('DB Connection Failed ❌', error);
    process.exit(1);
  }
})();

let bucket;
mongoose.connection.once('open', () => {
  try {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('🛠️ GridFS Bucket Ready to Go! 🚀');
  } catch (error) {
    console.error('⚡️ Something Went Wrong with the GridFS Bucket', error);
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
      return response.status(400).json({ error: '❌ Oops! No file uploaded. Please try again.' });
    }

    const cursor = bucket.find({ filename: file.originalname });
    const { length } = await cursor.toArray();
    if (length > 0) {
      return response.status(400).json({
        error: '🚫 This file is already chilling in our database!'
      });
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
      size: file.size,
      message: '🔥 File uploaded successfully, and it’s ready to go!'
    });
  } catch (error) {
    response.status(500).json({ error: '⚠️ Something went wrong during upload, please retry!' });
    // console.error('Uploading the file encountered a problem:e', error);
  }
});


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});