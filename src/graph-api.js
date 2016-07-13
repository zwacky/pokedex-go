'use strict';

const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.POKEDEX_PAGE_ACCESS_TOKEN || '';

/**
 * sends a message with the appropriate access_token.
 *
 * @params object messageData
 * @return promise
 */
function callSendAPI(messageData) {
	return new Promise((resolve, reject) => {
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
				resolve();
			} else {
				console.error("Unable to send message.");
				console.error(body);
				console.error(error);
				reject();
			}
		});
	});
}

module.exports = {
	callSendAPI
};
