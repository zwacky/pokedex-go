'use strict';

const graphApi = require('./graph-api');
const databaseManager = require('./database-manager');
const _ = require('lodash');

const BASE_URL = 'https://pokedex-go.herokuapp.com';
const BEST_AGAINST = 'BEST AGAINST';
const BEST_MOVES = 'BEST MOVES OF';


function receivedMessage(event) {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log('Received message for user %d and page %d at %d with message:', senderId, recipientId, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;
  const messageText = (
    message.text ||
    ((event && event.postback) ? event.postback.payload : null)
  ) + '';
  const messageAttachments = message.attachments;

  if (messageText) {
    if (messageText.toUpperCase() === 'HI') {
      sendIntroductionMessage(senderId);
    } else if (messageText.toUpperCase() === 'HELP') {
      sendTextMessage(senderId, `Help is not implemented yet.`);
    } else if (messageText.toUpperCase().indexOf('BEST AGAINST') === 0) {
      const targetPkmn = messageText.toUpperCase().substr(BEST_AGAINST.length + 1);
      databaseManager.findBestOpponents(targetPkmn, 30)
        .then(opponents => sendBestOpponents(senderId, opponents))
        .catch(err => {
          sendTextMessage(senderId, `Error occurred. Inform an admin - will get some fixin' soon! 😞`);
        });
    } else if (messageText.toUpperCase().indexOf(BEST_MOVES) === 0) {
      const targetPkmn = messageText.toUpperCase().substr(BEST_MOVES.length + 1);
      databaseManager.findDpsMoves(targetPkmn)
        .then(moves => sendPokemonMoves(senderId, moves))
        .catch(err => {
          sendTextMessage(senderId, `Error occurred. Inform an admin - will get some fixin' soon! 😞`);
        });
	} else if (messageText.toUpperCase() === 'UNSUBSCRIBE') {
		sendTextMessage(senderId, `Hey there, I only message you when you ask me a question. I will never message you in form of a subscription, therefore there is nothing to unsubscribe from. I value your privacy!`);
    } else {
      databaseManager.findPokemon(messageText.toUpperCase())
        .then((pokemon) => sendPokemonDetail(senderId, pokemon))
        .catch(err => {
          databaseManager.findSimilarPokemons(messageText.toUpperCase())
            // check if there is similar pokemon with that name
            .then(matches => sendSimilarPokemonNames(senderId, 'Did you mean one of these Pokémon?', matches))
            // no pokemon found with that name
            .catch(() => sendTextMessage(senderId, `Didn't find anything about ${messageText}. 😞`));
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
 * sends a suggestion of similar sounding pokemon names to select.
 *
 * @param string recipientId
 * @param string messageText
 * @param Array<string> similarPokemonNames
 * @return Promise
 */
function sendSimilarPokemonNames(recipientId, messageText, similarPokemonNames) {
  const callToAction = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      quick_replies: similarPokemonNames
        .map((pkmnName, index) => ({
          content_type: 'text',
          title: pkmnName,
          payload: index,
        }))
    }
  };

  graphApi.callSendAPI(callToAction);
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
            url: `${BASE_URL}/pokemon/${pokemon.alternateNames.en.replace(' ', '_').toUpperCase()}.png`,
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
              {
                type: 'postback',
                title: `Best Moves of ${pokemon.name}`,
                payload: `best moves of ${pokemon.name}`,
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
  const entries = [];
  const groups = opponents.reduce((obj, item) => {
    // we only take the first type of any pokemon for grouping
    obj[item.types[0]] = (_.isArray(obj[item.types[0]])) ?
      obj[item.types[0]] :
      [];
    obj[item.types[0]].push(item);
    return obj;
  }, []);

  Object.keys(groups)
    .slice(0, 3)
    .forEach((group, groupIndex) => {
      const entry = groups[group]
        .slice(0, 3)
        .map((pkmn, index) => `${pkmn.name} (DPS: ${pkmn.totalDps.toFixed(2)})`)
        .join('\n');
      entries.push(`#${groupIndex+1}: ${group}`);
      entries.push(entry);
    });

  const messages = entries.map(entry => {
    return {
      recipient: {
        id: recipientId
      },
      message: {
        text: entry
      }
    };
  });

  const messages$ = messages.reduce((promise, item) => {
    return promise
      .then(() => graphApi.callSendAPI(item));
  }, Promise.resolve());
}

function sendPokemonMoves(recipientId, moves) {
  const moveTypes = [
    {title: 'Primary:', key: 'primary'},
    {title: 'Secondary:', key: 'secondary'},
  ];
  const messages = _(moveTypes)
    .map(moveType => {
      return [moveType.title].concat(
        moves[moveType.key].map((move, index) => {
          const entry = `${move.TOTAL_DPS.toFixed(1)} DPS - ${move.name} (${move.type})`;
          return (index === 0) ?
            `${entry} 🏆` :
            entry;
        })
      );
    })
    .flatten()
    .map(text => {
      return {
        recipient: {
          id: recipientId
        },
        message: {
          text
        }
      };
    })
    .value();

    const messages$ = messages.reduce((promise, item) => {
      return promise
        .then(() => graphApi.callSendAPI(item));
    }, Promise.resolve());
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
