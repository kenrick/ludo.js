if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../src/game'], function(Game) {
	describe("Game Instance", function() {
		
		it("should be defined", function() {
	    	var game = new Game();
	    	expect(game).toBeDefined();
		});

		it("should have 4 players", function() {
	    	var game = new Game();

	    	expect(game.playerOne).toBeDefined();
	    	expect(game.playerTwo).toBeDefined();
	    	expect(game.playerThree).toBeDefined();
	    	expect(game.playerFour).toBeDefined();
		});

	});
});

