const mongoose = require('mongoose');
const message = new mongoose.Schema({
  username: String,
  message: String,
  timeStamp: Date,
});

module.exports = mongoose.model('Message', message);
