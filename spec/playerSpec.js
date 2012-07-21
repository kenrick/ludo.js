if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../src/player'], function(Player) {
	describe("Player Instance", function() {
		var player;

		beforeEach(function() {
		   player = new Player();
    	});

		it("should be defined", function() {
	    	expect(player).toBeDefined();
		});

		it("should have a status", function() {
	    	expect(player.status).toBeDefined();
		});

		it("should have a status of `waiting` by default ", function() {
	    	expect(player.status).toEqual('waiting');
		});

		it("should be able to be ready", function() {
	    	expect(player.ready).toEqual(jasmine.any(Function));
	    	player.ready();
	    	expect(player.status).toEqual('ready');
		});

		
	});
});