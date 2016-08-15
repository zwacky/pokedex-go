'use strict';

const assert = require('chai').assert;
const _ = require('lodash');
const databaseManager = require('../src/database-manager');
const POKEMONS = require('../db/pokemons.json');
const TYPES = require('../db/types.json');

describe('database manager', () => {

    it('should find the right modifiers', () => {
		const MODIFIERS = ['EFFECTIVE', 'NOT_EFFECTIVE'];
		const promises$ = Object.keys(POKEMONS)
			.map(pokemonName => databaseManager.findPokemon(pokemonName));

		return Promise.all(promises$)
			.then(results => results.map(compareModifiers));

		function compareModifiers(pokemon) {
			const pokemonKey = pokemon.name.toUpperCase();
			MODIFIERS.forEach(modifier => {
				const controlModifier = _(POKEMONS[pokemonKey].types)
					.map(type => TYPES[type][modifier])
					.flatten()
					.uniq()
					.value();
				assert.equal(controlModifier.length, pokemon.modifiers[modifier].length);
			});
		}
    });

	it('should find pokemons dps moves', () => {
		const promises$ = Object.keys(POKEMONS)
			.map(pokemonName => databaseManager.findDpsMoves(pokemonName));

		return Promise.all(promises$)
			.then(results => results.map(compareMoves));

		function compareMoves(moves) {
			['primary', 'secondary'].forEach(moveType => {
				assert.equal(_.isObject(moves), true);
				assert.equal(moves[moveType].length > 0, true);
			});
		}
	});

});
