'use strict';

const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.POKEDEX_PAGE_ACCESS_TOKEN || '';

function callSendApi(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: PAGE_ACCESS_TOKEN
		},
		method: 'POST',
		json: messageData,
	}, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			const recipientId = body.recipient_id;
			const messageId = body.message_id;
			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});
}

module.exports = {
	callSendApi
};
