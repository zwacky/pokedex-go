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

	it('should find pokemon in other languages', () => {
		const searches = [
			{name: 'Venusaur', translation: 'Bisaflor'},
			{name: 'Blastoise', translation: 'Turtok'},
			{name: 'Pidgey', translation: 'Taubsi'},
			{name: 'Zubat', translation: 'Zubat'},
			{name: 'Meowth', translation: 'Miaouss'},
			{name: 'Magnemite', translation: 'Magnéti'},
			{name: 'Grimer', translation: 'Sleima'},
			{name: 'Lickitung', translation: 'Excelangue'},
			{name: 'Farfetch\'d', translation: 'Porenta'},
		];
		const promises$ = searches
			.map(search => databaseManager.findPokemon(search.translation));

		return Promise.all(promises$)
			.then(results => {
				searches
					.forEach((item, index) => assert.equal(item.translation, results[index].name));
			});
	});

	it('should find the new johto pokemon', () => {
		const inclusiveIds = {
			from: 152,
			till: 251,
		};

		const filteredPkmn = _(POKEMONS)
			.filter(item => item['#'] >= inclusiveIds.from && item['#'] <= inclusiveIds.till)
			.value();

		assert.equal(100 === filteredPkmn.length, true);

	});

});
