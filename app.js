'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const messagingManager = require('./src/messaging-manager');
const crypto = require('crypto');
const _ = require('lodash');

const PORT = process.env.PORT || 5555;
const VALIDATION_TOKEN = process.env.POKEDEX_VALIDATION_TOKEN || '';
const APP_SECRET = process.env.POKEDEX_APP_SECRET || '';

// middleware
app.use(bodyParser.json({
	verify: verifyRequestSignature
}));
app.use(express.static('public'));

// base route
app.get('/', (req, res) => {
	res.status(200).send('works! 💪👌💯🙌');
});

app.get('/webhook', (req, res) => {
	if (req.query['hub.mode'] === 'subscribe' &&
			req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log('validating webhook');
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log('failed validation.');
		res.sendStatus(403);
	}
});

app.post('/webhook', (req, res) => {
	const data = req.body;

	if (data.object === 'page') {
		data.entry.forEach(function(pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			// Iterate over each messaging event
			pageEntry.messaging.forEach((messagingEvent) => {
				if (messagingEvent.message) {
					messagingManager.receivedMessage(messagingEvent);
				} else if (messagingEvent.postback) {
					const matchesPayload = ['best against', 'best moves of']
						.filter(payload => messagingEvent.postback.payload.indexOf(payload) === 0)
						.length > 0;
					if (messagingEvent.postback.payload && matchesPayload) {
						messagingManager.receivedMessage(_.assign(messagingEvent, {message: {}}));
					} else {
						messagingManager.sendIntroductionMessage(messagingEvent.sender.id);
					}
				} else {
					console.log(`Webhook received unknown messagingEvent: ${messagingEvent}`);
				}
			});
		});

		// Assume all went well.
		res.sendStatus(200);
	} else {
		res.sendStatus(400);
	}
});

/*
* Verify that the callback came from Facebook. Using the App Secret from
* the App Dashboard, we can verify the signature that is sent with each
* callback in the x-hub-signature field, located in the header.
*
* https://developers.facebook.com/docs/graph-api/webhooks#setup
*
*/
function verifyRequestSignature(req, res, buf) {
	const signature = req.headers['x-hub-signature'];

	if (!signature) {
		// For testing, let's log an error. In production, you should throw an
		// error.
		console.error('Couldn\'t validate the signature.');
	} else {
		const elements = signature.split('=');
		const method = elements[0];
		const signatureHash = elements[1];

		const expectedHash = crypto.createHmac('sha1', APP_SECRET)
			.update(buf)
			.digest('hex');

		if (signatureHash != expectedHash) {
			throw new Error('Couldn\'t validate the request signature.');
		}
	}
}

app.listen(PORT, () => {
    console.log('listening on port', PORT);
});
