if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../src/game', '../src/player'], function(Game, Player) {
	describe("Game Instance", function() {
		var game;

		beforeEach(function() {
		   game = new Game();
    	});

		it("should be defined", function() {
	    	expect(game).toBeDefined();
		});

		it("should be able to add a player by object", function() {
	    	game.addPlayer(new Player());
	    	expect(game.players[0]).toEqual(jasmine.any(Player));
		});

		it("should return Player if added successfully", function() {
	    	var player = game.addPlayer(new Player());
	    	expect(player).toEqual(jasmine.any(Player));
	    	expect(player).not.toBe(false);
		});
		
		it("should only have 4 players", function() {
	    	game.addPlayer(new Player());
	    	game.addPlayer(new Player());
	    	game.addPlayer(new Player());
	    	game.addPlayer(new Player());
	    	var nonPlayer = game.addPlayer(new Player());
	    	expect(nonPlayer).not.toEqual(jasmine.any(Player));
	    	expect(nonPlayer).toBe(false);
	    	expect(game.players.length).toBe(4);
		});

		it("should be able to start", function() {
	    	expect(game.start).toEqual(jasmine.any(Function));
		});

		it("should be able to check if all players are ready", function() {
	    	var player = new Player();
	    	player.ready();

	    	game.addPlayer(player);
	    	game.addPlayer(player);
	    	game.addPlayer(player);
	    	game.addPlayer(player);
	  
	    	expect(game.allReady()).toBe(true);
		});

		it("should have 4 ready players before starting", function() {
	    	var player = new Player();
	    	player.ready();

	    	game.addPlayer(player);
	    	game.addPlayer(player);
	    	game.addPlayer(player);
	    	expect(game.start()).toBe(false);

	    	game.addPlayer(player);

	    	expect(game.start()).toBe(true);
		});
				

	});
});

