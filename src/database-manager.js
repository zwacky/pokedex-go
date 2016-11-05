'use strict';

const _ = require('lodash');
const similar = require('string-similarity');

const DB = {
	POKEMONS: require('../db/pokemons.json'),
	RARITIES: require('../db/rarities.json'),
	TYPES: require('../db/types.json'),
	MOVES: require('../db/moves.json'),
};
const LANGUAGE_SORTING = {
	en: 1,
	de: 2,
	es: 3,
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
		const pokemon = _(DB.POKEMONS)
			.filter(pkmn => _(pkmn.alternateNames)
				.filter((entry, key) => entry.toUpperCase() === pokemonName.toUpperCase())
				.value()
				.length !== 0
			)
			.first();

		if (pokemon) {
			const language = determineLanguage(pokemonName, pokemon.alternateNames);
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
			result.name = pokemon.alternateNames[language];

			resolve(result);
		} else {
			console.log('reject', pokemonName);
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
	let language = null;
	return new Promise((resolve, reject) => {
		findPokemon(pokemonName)
			.then(defendingPkmn => {
				const list = _(DB.POKEMONS)
					.map((attackingPkmn, key) => {
						const dps = {
							primary: calculateStepDPS(attackingPkmn, defendingPkmn, 'primary'),
							secondary: calculateStepDPS(attackingPkmn, defendingPkmn, 'secondary'),
						};

						// decide the language of the requested pokemon name
						language = language === null ?
							determineLanguage(pokemonName, defendingPkmn.alternateNames) :
							language;

						return {
							key,
							name: attackingPkmn.alternateNames[language] || attackingPkmn.name,
							alternateNames: attackingPkmn.alternateNames,
							types: attackingPkmn.types,
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
				const language = determineLanguage(pokemonName, pkmn.alternateNames);
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
								entry.name = entry.alternateNames[language];
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

/**
 * finds on lehvenstein algorithm the similarity of
 *
 * @param string inputName
 * @return Array<Pokemon>
 */
function findSimilarPokemons(inputName) {
	const SIMILARITY = 0.5;
	return new Promise((resolve, reject) => {
		const matches = _(DB.POKEMONS)
			.map(pkmn => pkmn.alternateNames.en)
			.flatten()
			.uniqBy()
			.filter(pkmnName => similar.compareTwoStrings(inputName.toUpperCase(), pkmnName.toUpperCase()) > SIMILARITY)
			.value();
		return (matches.length > 0) ?
			resolve(matches) :
			reject();
	});
}

function calculateDPS(defendingPkmn, attackingPkmn, moveName) {
	const move = DB.MOVES[moveName];
	const effectivenessTimes = {
		pro: hasEffectiveness(move.TYPE, _.toUpper(defendingPkmn.types), 'EFFECTIVE'),
		contra: hasEffectiveness(move.TYPE, _.toUpper(defendingPkmn.types), 'NOT_EFFECTIVE'),
	};

	let dps = parseFloat(move.DPS);

	// checking for STAB bonus
	dps *= Math.pow(1.25, (attackingPkmn.types.indexOf(move.TYPE) !== -1) ? 1 : 0);

	// checking for effective bonuses
	dps *= Math.pow(1.25, effectivenessTimes.pro);
	dps *= Math.pow(0.8, effectivenessTimes.contra);

	return dps;

	function hasEffectiveness(moveType, defendingTypes, effectiveType) {
		return (DB.TYPES[moveType][effectiveType] || [])
			.filter(type => defendingTypes.indexOf(type) !== -1)
			.length;
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

function determineLanguage(pokemonName, alternateNames) {
	return _(alternateNames)
		.map((item, key) => {
			return { lang: key, name: item };
		})
		.filter(item => item.name.toUpperCase() === pokemonName.toUpperCase())
		.map(item => item.lang)
		.sortBy(lang => (lang in LANGUAGE_SORTING) ? LANGUAGE_SORTING[lang] : 5)
		.first();
}

module.exports = {
	findPokemon,
	findBestOpponents,
	findDpsMoves,
	findSimilarPokemons,
};
