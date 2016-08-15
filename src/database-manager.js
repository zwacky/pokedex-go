'use strict';

const _ = require('lodash');

const DB = {
	POKEMONS: require('../db/pokemons.json'),
	RARITIES: require('../db/rarities.json'),
	TYPES: require('../db/types.json'),
	MOVES: require('../db/moves.json'),
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

/**
 * finds the best opponents to a specific pokemon.
 *
 * @param string pokemonName
 * @param int limit
 * @return array
 */
function findBestOpponents(pokemonName, limit) {
	return new Promise((resolve, reject) => {
		findPokemon(pokemonName)
			.then(defendingPkmn => {
				const list = _(DB.POKEMONS)
					.map((attackingPkmn, key) => {
						const dps = {
							primary: calculateStepDPS(attackingPkmn, defendingPkmn, 'primary'),
							secondary: calculateStepDPS(attackingPkmn, defendingPkmn, 'secondary'),
						};

						return {
							key,
							name: attackingPkmn.name,
							primaryDps: getSingleDPS(dps.primary),
							secondaryDps: getSingleDPS(dps.secondary),
							totalDps: getSingleDPS(dps.primary) + getSingleDPS(dps.secondary),
						};

						function calculateStepDPS(attackingPkmn, defendingPkmn, moveType) {
							return attackingPkmn.moves[moveType].map(moveName => {
								return calculateDPS(defendingPkmn, attackingPkmn, moveName);
							});
						}

						function getSingleDPS(dpsArray) {
							return _.first(
								dpsArray
									.sort((a, b) => b - a)
								);
						}
					})
					.orderBy('totalDps', 'desc')
					.value()
					.slice(0, limit);
				resolve(list);
			})
			.catch(reject);
	});
}

/**
 * finds the best set of moves from primary and secondary for a specific pokemon.
 *
 * @param string pokemonName
 * @return Promise
 */
function findDpsMoves(pokemonName) {
	return new Promise((resolve, reject) => {
		findPokemon(pokemonName)
			.then(pkmn => {
				const pkmnDps = ['primary', 'secondary']
					.reduce((obj, moveType) => {
						obj[moveType] = pkmn.moves[moveType]
							.map(move => {
								const entry = _.assign(DB.MOVES[move]);
								const m = DB.MOVES[move];
								const dps = parseFloat(m.DPS);
								entry.TOTAL_DPS = (pkmn.types.map(t => t.toUpperCase()).indexOf(entry.TYPE) !== -1) ?
									dps * 1.25 :
									dps;
								entry.type = DB.TYPES[entry.TYPE].name;
								return entry;
							});
						return obj;
					}, {});
				// order primary and secondary attack after DPS desc
				['primary', 'secondary'].forEach(moveType => {
					pkmnDps[moveType].sort((a, b) => b.TOTAL_DPS - a.TOTAL_DPS);
				});
				resolve(pkmnDps);
			});
	});
}

function calculateDPS(defendingPkmn, attackingPkmn, moveName) {
	const move = DB.MOVES[moveName];
	const isEffective = hasEffectiveness(move.TYPE, _.toUpper(defendingPkmn.types), 'EFFECTIVE');
	const isNotEffective = hasEffectiveness(move.TYPE, _.toUpper(defendingPkmn.types), 'NOT_EFFECTIVE');

	let dps = parseFloat(move.DPS);

	// checking for STAB bonus
	if (attackingPkmn.types.indexOf(move.TYPE) !== -1) {
		dps *= 1.25;
	}
	// checking for very effective bonus
	if (isEffective) {
		dps *= 1.25;
	}
	// checking for not very effective bonus
	if (isNotEffective) {
		dps *= 0.8;
	}

	return dps;

	function hasEffectiveness(moveType, defendingTypes, effectiveType) {
		return (DB.TYPES[moveType][effectiveType] || [])
			.filter(type => defendingTypes.indexOf(type) !== -1)
			.length > 0;
	}
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
	findBestOpponents,
	findDpsMoves,
};
