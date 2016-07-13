'use strict';

const graphApi = require('./graph-api');
const POKEMON = require('../db/pokemon');

const BASE_URL = 'https://pokedex-go.herokuapp.com/pokemon';

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

/**
 * sends infos about a pokemon.
 *
 * @param string recipientId
 * @param string pokemonName
 */
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
							image_url: `${BASE_URL}/${pokemonName.toLowerCase()}.png`,
							subtitle: [`Types: ${pokemon.types.join(', ')}`,
								`Rarity: ${pokemon.rarity}`,
								// `Height: ${pokemon.height}`,
								// `Weight: ${pokemon.weight}`,
							].join(' · ')
						}
					]
				}
			}
		}
	};

	graphApi.callSendAPI(message);

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
