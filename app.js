"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const PORT = process.env.POKEDEX_PORT || 5555;
const VALIDATION_TOKEN = process.env.POKEDEX_VALIDATION_TOKEN || '';

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
	if (req.query['hub.mode'] === 'subscribe' &&
			req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log('validating webhook');
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log('failed validation.');
		res.sendStatus(403);
	}
});

app.listen(PORT, () => {
    console.log('listening on port', PORT);
});
