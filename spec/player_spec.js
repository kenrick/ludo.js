if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../src/player'], function(Player, require) {
	describe("Player Instance", function() {

		it("should be defined", function() {
	    	var player = new Player();
	    	expect(player).toBeDefined();
		});

		
	});
});