require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan');
const cors = require ('cors');

//SETUP MIDDLEWARE

const apiRouter = require('./api')
app.use(express.json())
app.use(cors());
app.use(morgan('dev'));
app.use('/api', apiRouter);

module.exports = app;