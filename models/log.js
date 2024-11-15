const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    exercise: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
        },
    ],
});

module.exports = mongoose.model('Log', logSchema);
