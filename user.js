const mongoose = require('mongoose');
const user = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean,
});

module.exports = mongoose.model('User', user);
