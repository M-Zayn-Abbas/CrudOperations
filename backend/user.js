const mongoose = require('mongoose');

const userAuthSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'password cannot be blank']
    }
})

module.exports = mongoose.model('UserAuth',userAuthSchema)