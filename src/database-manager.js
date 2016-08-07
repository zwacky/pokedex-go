'use strict';

const _ = require('lodash');

const DB = {
	POKEMONS: require('../db/pokemons.json'),
	RARITIES: require('../db/rarities.json'),
	TYPES: require('../db/types.json'),
};

/**
 * finds one pokemon based of technical_name.
 *
 * @param string pokemonName
 * @return object
 */
function findPokemon(pokemonName) {
	return new Promise((resolve, reject) => {
		let result = null;

		const pokemon = DB.POKEMONS[pokemonName.toUpperCase()];

		if (pokemon) {
			const types = pokemon.types;
			const MODIFIERS = ['NORMAL', 'EFFECTIVE', 'NOT_EFFECTIVE'];

			const a = pokemon.types
				.map(type => DB.TYPES[type]);

			result = Object.assign({}, pokemon);
			// result.rarity = DB.RARITIES[pokemon.rarity].name;
			result.types = pokemon.types
				.map(type => DB.TYPES[type].name);
			result.modifiers = MODIFIERS.reduce((obj, item) => {
				obj[item] = getModifierTypes(pokemon, item);
				return obj;
			}, {});

			resolve(result);
		} else {
			reject();
		}
	});
}

function getModifierTypes(pokemon, modifier) {
	return _(pokemon.types)
		.map(type => DB.TYPES[type][modifier])
		.flatten()
		.uniq()
		.value()
		.map(mod => (DB.TYPES[mod]) ? DB.TYPES[mod].name : []);
}

module.exports = {
	findPokemon,
};
