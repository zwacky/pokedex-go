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
			const modifiers = ['200_from', '0_from', '200_to'];

			const a = pokemon.types
				.map(type => DB.TYPES[type]);

			result = Object.assign({}, pokemon);
			result.rarity = DB.RARITIES[pokemon.rarity].name;
			result.types = pokemon.types
				.map(type => DB.TYPES[type].name);
			result.modifiers = pokemon.types
				.map(type => DB.TYPES[type])
				.reduce((obj, item) => {
					modifiers
						.forEach(modifier => {
							obj[modifier] = item[modifier].map(key => DB.TYPES[key].name);
						});
					return obj;
				}, {});

			resolve(result);
		} else {
			reject();
		}
	});
}

module.exports = {
	findPokemon,
};
