var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const viberRouter = require('./routes/viber');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/viber', viberRouter);

// const debug = require('debug')('viber-channel:app.js:server');
app.post('/viber/webhook', (req, res) => {
  console.log('POST /viber/webhook');
  console.log(req.body);
  res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

module.exports = app;