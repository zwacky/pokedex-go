'use strict';

const graphApi = require('./graph-api');

function receivedMessage(event) {
	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfMessage = event.timestamp;
	const message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	const messageId = message.mid;

	// You may get a text or attachment but not both
	const messageText = message.text;
	const messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches any special
		// keywords and send back the corresponding example. Otherwise, just echo
		// the text we received.
		switch (messageText) {
			case 'image':
				// sendImageMessage(senderID);
				break;

			case 'button':
				// sendButtonMessage(senderID);
				break;

			case 'generic':
				// sendGenericMessage(senderID);
				break;

			case 'receipt':
				// sendReceiptMessage(senderID);
				break;

			default:
				sendTextMessage(senderID, messageText);
		}
	} else if (messageAttachments) {
	sendTextMessage(senderID, "Message with attachment received");
	}
}

function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		},
	};

	graphApi.callSendAPI(messageData);
}

module.exports = {
	receivedMessage
};
