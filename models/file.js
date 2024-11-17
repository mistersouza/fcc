const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  gridFSFileId: mongoose.Types.ObjectId,
  filename: String,
  contentType: String,
  length: Number,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('File', fileSchema);
