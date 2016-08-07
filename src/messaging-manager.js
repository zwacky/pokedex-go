'use strict';

const graphApi = require('./graph-api');
const databaseManager = require('./database-manager');

const BASE_URL = 'https://pokedex-go.herokuapp.com';
const BEST_AGAINST = 'BEST AGAINST';


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
		} else if (messageText.toUpperCase().indexOf('BEST AGAINST') === 0) {
			const targetPkmn = messageText.toUpperCase().substr(BEST_AGAINST.length + 1);
			databaseManager.findBestOpponents(targetPkmn, 5)
				.then(opponents => sendBestOpponents(senderId, opponents))
				.catch(err => {
					sendTextMessage(senderId, `Error occurred. Inform an admin - will get some fixin' soon! 😞`);
				});
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
	const messages = [
		{
			recipient: {
				id: recipientId
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url: `${BASE_URL}/pokemon/${pokemon.name.toUpperCase()}.png`,
					}
				}
			}
		},
		{
			recipient: {
				id: recipientId
			},
			message: {
				text: `${pokemon.name} (Types: ${pokemon.types.join(' · ')})`
			}
		},
		{
			recipient: {
				id: recipientId
			},
			message: {
				text: `Receives 125% damage from: ${pokemon.modifiers.EFFECTIVE.join(' · ')}`,
			},
		},
		{
			recipient: {
				id: recipientId
			},
			message: {
				text: `Receives 80% damage from: ${pokemon.modifiers.NOT_EFFECTIVE.join(' · ')}`,
			}
		},
		{
			recipient: {
				id: recipientId
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: `More Infos?`,
						buttons: [
							{
								type: 'postback',
								title: `Best against ${pokemon.name}`,
								payload: `best against ${pokemon.name}`,
							},
						]
					}
				}
			}
		}
	];

	const messages$ = messages.reduce((promise, item) => {
		return promise
			.then(() => graphApi.callSendAPI(item));
	}, Promise.resolve());

	messages$
		.then(() => false);
}

function sendBestOpponents(recipientId, opponents) {
	const messages = opponents.map((opponent, index) => {
		return {
			recipient: {
				id: recipientId
			},
			message: {
				text: `#${index+1}: ${opponent.name} (DPS: ${opponent.totalDps.toFixed(2)})`
			}
		};
	});

	const messages$ = messages.reduce((promise, item) => {
		return promise
			.then(() => graphApi.callSendAPI(item));
	}, Promise.resolve());

	messages$
		.then(() => false);
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
