const assert = require('chai').assert;
const similar = require('string-similarity');
const _ = require('lodash');
const databaseManager = require('../src/database-manager');


describe('similar strings', () => {

	it('it should check similar sounding pokemons', () => {
		const lvl = similar.compareTwoStrings('Dragonight', 'Drgon');

		const checks = [
			{input: 'Dragonight', finds: 'Dragonite'},
			{input: 'Ninetails', finds: 'Ninetales'},
			{input: 'Nintales', finds: 'Ninetales'},
			{input: 'Blastois', finds: 'Blastoise'},
			{input: 'Blastoist', finds: 'Blastoise'},
			{input: 'Venosaur', finds: 'Venusaur'},
			{input: 'Venausor', finds: 'Venusaur'},
			{input: 'Ivysor', finds: 'Ivysaur'},
			{input: 'Charizard X', finds: 'Charizard'},
			{input: 'Charzared', finds: 'Charizard'},
			{input: 'Caterpite', finds: 'Caterpie'},
			{input: 'Pickachu', finds: 'Pikachu'},
			{input: 'Pikatcho', finds: 'Pikachu'},
			{input: 'Pikatchou', finds: 'Pikachu'},
			{input: 'Pikachoo', finds: 'Pikachu'},
			{input: 'Magnetode', finds: 'Magneton'},
			{input: 'What is a Bulbasaur', finds: 'Bulbasaur'},
			{input: 'Balbasur', finds: 'Bulbasaur'},
			{input: 'Ratata', finds: 'Rattata'},
		];

		checks
			.forEach((item, index) => {
				databaseManager.findSimilarPokemons(item.input)
					.then(matches => assert.equal(matches.indexOf(item.finds) !== -1, true, `${item.input}: ${matches}`))
					.catch(err => console.log('error', err));
			});
	});
});
