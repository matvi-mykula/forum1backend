const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const User = require('./user');
const Message = require('./message');
//----------------------------------------- END OF IMPORTS---------------------------------------------------
mongoose.connect(
  'mongodb+srv://matvi_mykula:this1works@cluster0.o1l2bk9.mongodb.net/UserPractice?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('Mongoose Is Connected');
  }
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:3000', // <-- location of the react app were connecting to
    credentials: true,
  })
);
app.use(
  session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser('secretcode'));
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

//----------------------------------------- END OF MIDDLEWARE---------------------------------------------------

// Routes
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('No User Exists');
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        console.log('succesfully logged in');
        res.send(req.user);
        // res.send(req.user);
        console.log(req.user);
        // res.redirect('/profile');
      });
    }
  })(req, res, next);
});
app.post('/register', (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send('User Already Exists');
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        isAdmin: req.body.isAdmin,
      });
      await newUser.save();
      res.send('User Created');
    }
  });
});
app.get('/user', (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

app.get('/profile', (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

app.post('/logout', function (req, res, next) {
  req.logout(req.user, function (err) {
    if (err) {
      return next(err);
    }
  });
  res.clearCookie('connect.sid');
  res.send(req.user);
});

app.post('/postMessage', (req, res) => {
  console.log('posting message');
  console.log(req.body);
  const message = new Message({
    username: req.body.aName,
    message: req.body.aMessage,
    date: req.body.aDate,
  });
  message.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.json({ nessage: req.body });
  console.log('message logged');
});
app.get('/getMessages', (req, res) => {
  console.log('getting messages');
  return Message.find()
    .sort({ date: -1 })
    .exec(function (err, entries) {
      return res.end(JSON.stringify(entries));
    });
});

app.delete(`/delete/:id`, (req, res) => {
  console.log('delete in server');
  console.log(req.params);
  const id = req.params.id;
  return Message.deleteOne({ _id: ObjectId(id) }, (err, result) => {
    console.log(result);
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
  });
});

//----------------------------------------- END OF ROUTES---------------------------------------------------
//Start Server
app.listen(4000, () => {
  console.log('Server Has Started');
});
