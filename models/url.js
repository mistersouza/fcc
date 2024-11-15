const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    shortUrl: {
        type: Number,
        required: true
    }
}, { collection: 'urls' });

module.exports = mongoose.model('Url', urlSchema);


