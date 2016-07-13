'use strict';

const graphApi = require('./graph-api');
const POKEMON = require('../db/pokemon');

function receivedMessage(event) {
	const senderId = event.sender.id;
	const recipientId = event.recipient.id;
	const timeOfMessage = event.timestamp;
	const message = event.message;

	console.log('Received message for user %d and page %d at %d with message:', senderId, recipientId, timeOfMessage);
	console.log(JSON.stringify(message));

	const messageId = message.mid;

	const messageText = message.text;
	const messageAttachments = message.attachments;

	if (messageText) {

		// check if messageText matches any pokemon
		if (Object.keys(POKEMON).indexOf(messageText.toUpperCase()) !== -1) {
			// TODO check for length
			sendPokemonDetail(senderId, messageText.toUpperCase());
		} else if (messageText.toUpperCase() === 'HI') {
			sendIntroductionMessage(senderId);
		} else {
			sendTextMessage(senderId, `Didn't find anything about ${messageText}. 😞`);
		}

	}
}

/**
 * sends a basic message to a specific recipient.
 *
 * @param string recipientId
 * @param string messageText
 * @return Promise
 */
function sendTextMessage(recipientId, messageText) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		},
	};

	return graphApi.callSendAPI(messageData);
}

function sendPokemonDetail(recipientId, pokemonName) {


	const pokemon = POKEMON[pokemonName.toUpperCase()];

	const message = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'generic',
					elements: [
						{
							title: `${pokemon.name} (#00${pokemon['#']})`,
							image_url: 'https://lh3.googleusercontent.com/-Ygm1wuBzWL4/Vy1Qcix3LDI/AAAAAAAAGP0/uTg0CfxsGI4Y1okeCL7ZPLaZgZbvN5zpwCCo/s300/Screen%2Bshot%2B2016-05-06%2Bat%2B10.14.42%2BPM.png?refresh=900&resize_h=NaN&resize_w=NaN',
							subtitle: `Types: ${pokemon.types.join(', ')}

Height: ${pokemon.height}
Weight: ${pokemon.weight}`
						}
					]
				}
			}
		}
	};

}

/**
 * send first time users an introduction.
 *
 * @param object messagingEvent
 */
function sendIntroductionMessage(recipientId) {
	const introduction = {
		recipient: {
			id: recipientId
		},
		message: require('../messages/introduction.json')
	};

	const callToAction = {
		recipient: {
			id: recipientId
		},
		message: require('../messages/call-to-action.json')
	};

	graphApi.callSendAPI(introduction)
		.then(() => graphApi.callSendAPI(callToAction));
}


module.exports = {
	receivedMessage,
	sendIntroductionMessage,
};
