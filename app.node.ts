var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

import Saito from './saito';

var appNode = express();

appNode.use(logger('dev'));
appNode.use(express.json());
appNode.use(express.urlencoded({ extended: false }));
appNode.use(cookieParser());
appNode.use(express.static(path.join(__dirname, 'public')));

appNode.use('/', indexRouter);
appNode.use('/users', usersRouter);

console.log("testing 123");

// let saito = new Saito();
//
// saito.initialize().then(()=>{
//     console.log("xxxx");
// });

module.exports = appNode;
