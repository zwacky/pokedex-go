'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const messagingManager = require('./src/messaging-manager');

const PORT = process.env.PORT || 5555;
const VALIDATION_TOKEN = process.env.POKEDEX_VALIDATION_TOKEN || '';

// body parser middleware
app.use(bodyParser.urlencoded({
	extended: true
}));

// base route
app.get('/', (req, res) => {
	res.status(200).send('works! 💪👌💯🙌');
});

app.get('/page-subscription', (req, res) => {
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
				if (messagingEvent.optin) {
					// receivedAuthentication(messagingEvent);
					console.log('receivedAuthentication');
				} else if (messagingEvent.message) {
					messagingManager.receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					// receivedDeliveryConfirmation(messagingEvent);
					console.log('receivedDeliveryConfirmation');
				} else if (messagingEvent.postback) {
					// receivedPostback(messagingEvent);
					console.log('receivedPostback');
				} else {
					console.log(`Webhook received unknown messagingEvent: ${messagingEvent}`);
				}
			});
		});

		// Assume all went well.
		res.sendStatus(200);
	}
});

app.listen(PORT, () => {
    console.log('listening on port', PORT);
});
