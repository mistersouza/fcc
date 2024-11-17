const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
require('dotenv').config()

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected 🚀'))
  .catch((error) => console.error('DB Connection Failed ❌', error))

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});




const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
