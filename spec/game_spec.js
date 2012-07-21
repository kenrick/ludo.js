if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../src/game'], function(Game, require) {
	describe("Game Instance", function() {

		it("should be defined", function() {
	    	var game = new Game();
	    	expect(game).toBeDefined();
		});

		
	});
});