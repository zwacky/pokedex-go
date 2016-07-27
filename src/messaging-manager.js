'use strict';

const graphApi = require('./graph-api');
const databaseManager = require('./database-manager');

const BASE_URL = 'https://pokedex-go.herokuapp.com';


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
		if (messageText.toUpperCase() === 'HI') {
			sendIntroductionMessage(senderId);
		} else if (messageText.toUpperCase() === 'HELP') {
			sendTextMessage(senderId, `Help is not implemented yet.`);
		} else {
			databaseManager.findPokemon(messageText.toUpperCase())
				.then((pokemon) => sendPokemonDetail(senderId, pokemon))
				.catch(err => {
					// no pokemon found with that name
					sendTextMessage(senderId, `Didn't find anything about ${messageText}. 😞`);
				});
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
 * @param object pokemonName
 */
function sendPokemonDetail(recipientId, pokemon) {
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
							title: `${pokemon.name} (#${('000' + pokemon['#']).slice(-4)})`,
							image_url: `${BASE_URL}/pokemon/${pokemon.name.toUpperCase()}.png`,
							subtitle: [
								`Types: ${pokemon.types.join(', ')}`,
							].join(' · '),
						},
						{
							title: `Receives 200% damage from`,
							subtitle: pokemon.modifiers['200_from'].join(' · '),
							image_url: `${BASE_URL}/cards/very-effective.png`,
						},
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
