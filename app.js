"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.POKEDEX_PORT || 5555;

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

app.listen(port, () => {
    console.log('listening on port', port);
});
