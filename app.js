"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// body parser middleware
app.use(bodyParser.urlencoded({
	extended: true
}));

// base route
app.get('/', (req, res) => {
	res.status(200).send('works! 💪👌💯🙌');
});

app.get('/incoming-request', (req, res) => {
	res.status(200).send('💩');
});
