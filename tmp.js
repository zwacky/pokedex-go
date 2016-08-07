'use strict';


const graphApi = require('./src/graph-api');
const BASE_URL = 'https://pokedex-go.herokuapp.com';

// databaseManager.init();





// const intro = {
// 	recipient: {
// 		id: '1296144660426532'
// 	},
// 	message: {
// 		text: 'Hey there! I\'m PokéDex Go. How can I help you with?'
// 	}
// };


// const data = {
// 	recipient: {
// 		id: '1296144660426532'
// 	},
// 	message: {
// 		attachment: {
// 			type: 'template',
// 			payload: {
// 				template_type: 'generic',
// 				elements: [
// 					{
// 						title: 'lulzy',
// 						// image_url: 'http://petersapparel.parseapp.com/img/item100-thumb.png',
// 						subtitle: 'sub title lueluals',
// 						buttons: [
// 							{
// 								type: 'web_url',
// 								url: 'https://www.justwatch.com/us',
// 								title: 'JustWatch'
// 							},
// 						]
// 					},
// 					{
// 						title: 'lulzy',
// 						// image_url: 'http://petersapparel.parseapp.com/img/item100-thumb.png',
// 						subtitle: 'sub title lueluals',
// 						buttons: [
// 							{
// 								type: 'web_url',
// 								url: 'https://www.justwatch.com/us',
// 								title: 'JustWatch'
// 							},
// 						]
// 					}
// 				]
// 			}
// 		}
// 	},
// };





// // graphApi.callSendAPI(intro);
// // graphApi.callSendAPI(data);










// // pokemon types listing

// const intro = {
// 	recipient: {
// 		id: '1296144660426532'
// 	},
// 	message: {
// 		text: 'Hey there! I\'m PokéDex Go.'
// 	}
// };

// const start = {
// 	recipient: {
// 		id: '1296144660426532'
// 	},
// 	message: {
// 		text: 'Ask me about a Pokémon. You can try one of my suggestions here right away!',
// 		quick_replies: [
// 			{
// 				content_type: 'text',
// 				title: 'Bulbasaur',
// 				payload: 'a',
// 			},
// 			{
// 				content_type: 'text',
// 				title: 'Charmander',
// 				payload: 'b',
// 			},
// 			{
// 				content_type: 'text',
// 				title: 'Squirtle',
// 				payload: 'c',
// 			}
// 		]
// 	}
// };



// // graphApi.callSendAPI(intro)
// // 	.then(() => graphApi.callSendAPI(start));


// const BASE_URL = 'https://pokedex-go.herokuapp.com/pokemon';
// const POKEMON = require('./db/pokemons.json');

// const pokemon = POKEMON.SQUIRTLE;


// const message = {
// 	recipient: {
// 		id: '1296144660426532'
// 	},
// 	message: {
// 		attachment: {
// 			type: 'template',
// 			payload: {
// 				template_type: 'generic',
// 				elements: [
// 					{
// 						title: `${pokemon.name} (#00${pokemon['#']})`,
// 						image_url: `${BASE_URL}/${pokemon.name.toLowerCase()}.png`,
// 						subtitle: [`Types: ${pokemon.types.join(', ')}`,
// 							`Rarity: ${pokemon.rarity}`,
// 							// `Height: ${pokemon.height}`,
// 							// `Weight: ${pokemon.weight}`,
// 						].join(' · '),
// 						buttons: [
// 							{
// 								type: 'postback',
// 								title: 'Show Skills',
// 								payload: `${pokemon.name} skills`,
// 							}
// 						],
// 					},
// 					{
// 						image_url: `${BASE_URL}/${pokemon.name.toLowerCase()}.png`,
// 						title: 'Damage',
// 						subtitle: `200% to: Fire, Ground, Rock
// 50% to: Dragon, Grass, Water
// 50% from: Fire, Ice, Steel, Water
// 200% from: Electric, Grass`,
// 					},
// // 					{
// // 						title: `${squirtle.name} (#00${squirtle['#']})`,
// // 						image_url: 'https://lh3.googleusercontent.com/-Ygm1wuBzWL4/Vy1Qcix3LDI/AAAAAAAAGP0/uTg0CfxsGI4Y1okeCL7ZPLaZgZbvN5zpwCCo/s300/Screen%2Bshot%2B2016-05-06%2Bat%2B10.14.42%2BPM.png?refresh=900&resize_h=NaN&resize_w=NaN',
// // 						subtitle: `Types: ${squirtle.types.join(', ')}

// // Height: ${squirtle.height}
// // Weight: ${squirtle.weight}`,
// // 						buttons: [
// // 							{
// // 								type: 'postback',
// // 								title: 'Show Weaknesses',
// // 								payload: `${squirtle.name} weakness`
// // 							}
// // 						]
// // 					}
// 				]
// 			}
// 		}
// 	}
// };

// // graphApi.callSendAPI(message);






const databaseManager = require('./src/database-manager');
// const pokemon = databaseManager.findPokemon('BULBASAUR')
// 	.then((pkmn) => console.log(pkmn));
	// .then(res => sendMessage(res))
	// .catch(err => console.log('not found :(', err));

const pokemon = databaseManager.findPokemon('BLASTOISE')
	.then(pkmn => sendMessageSingle(pkmn))
	.catch(err => console.log('[ERROR]', err));

// TODO
// console.log('get to 3 pokemon against x');

// databaseManager.findBestOpponents('PIDGEOT', 5)
// 	.then(enemies => {
// 		enemies.forEach((enemy, index) => {
// 			console.log(`#${index+1}: ${enemy.name} (DPS: ${enemy.totalDps.toFixed(2)})`);
// 		});

// 		console.log('(DPS calculated with STAB and types weaknesses)');
// 	});
	// .then(enemies => console.log(enemies));


// sendMessage(pokemon);

// databaseManager.findRarity(pokemon);

function sendMessageSingle(pokemon) {
	const messages = [
		{
			recipient: {
				id: '1296144660426532'
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
				id: '1296144660426532'
			},
			message: {
				text: `${pokemon.name} (Types: ${pokemon.types.join(' · ')})`
			}
		},
		{
			recipient: {
				id: '1296144660426532'
			},
			message: {
				text: `Receives 125% damage from: ${pokemon.modifiers.EFFECTIVE.join(' · ')}`,
			},
		},
		{
			recipient: {
				id: '1296144660426532'
			},
			message: {
				text: `Receives 80% damage from: ${pokemon.modifiers.NOT_EFFECTIVE.join(' · ')}`,
			}
		},
		{
			recipient: {
				id: '1296144660426532'
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
								payload: pokemon.name,
							},
							{
								type: 'postback',
								title: `${pokemon.name} Best Moves`,
								payload: pokemon.name,
							}
						]
					}
				}
			}
		}
		// {
		// 	recipient: {
		// 		id: '1296144660426532'
		// 	},
		// 	message: {
		// 		text: 'More Infos:',
		// 		quick_replies: [
		// 			{
		// 				content_type: 'text',
		// 				title: `Best against`,
		// 				payload: `Best agaubst ${pokemon.name}`,
		// 			}
		// 		]
		// 	}
		// }
	];



	const messages$ = messages.reduce((promise, item) => {
		return promise
			.then(() => graphApi.callSendAPI(item));
	}, Promise.resolve());

	messages$
		.then(() => console.log('all done'));




	// graphApi.callSendAPI(message);
}

function sendMessage(pokemon) {
	const message = {
		recipient: {
			id: '1296144660426532'
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'generic',
					elements: [
						{
							// title: `${pokemon.name} (#00${pokemon['#']})`,
							title: `${pokemon.name} (${pokemon.rarity})`,
							image_url: `${BASE_URL}/${pokemon.name.toLowerCase()}.png`,
							subtitle: [`Types: ${pokemon.types.join(', ')}`,
								// `Rarity: ${pokemon.rarity}`,
								// `Height: ${pokemon.height}`,
								// `Weight: ${pokemon.weight}`,
							].join(' · '),
						},
						{
							title: `Receives 200% damage from`,
							subtitle: pokemon.modifiers['200_from'].join(' · '),
							image_url: `https://pokedex-go.herokuapp.com/cards/very-effective.png`,
						},
	// 					{
	// 						title: `${squirtle.name} (#00${squirtle['#']})`,
	// 						image_url: 'https://lh3.googleusercontent.com/-Ygm1wuBzWL4/Vy1Qcix3LDI/AAAAAAAAGP0/uTg0CfxsGI4Y1okeCL7ZPLaZgZbvN5zpwCCo/s300/Screen%2Bshot%2B2016-05-06%2Bat%2B10.14.42%2BPM.png?refresh=900&resize_h=NaN&resize_w=NaN',
	// 						subtitle: `Types: ${squirtle.types.join(', ')}

	// Height: ${squirtle.height}
	// Weight: ${squirtle.weight}`,
	// 						buttons: [
	// 							{
	// 								type: 'postback',
	// 								title: 'Show Weaknesses',
	// 								payload: `${squirtle.name} weakness`
	// 							}
	// 						]
	// 					}
					]
				}
			}
		}
	};

	graphApi.callSendAPI(message);
}
