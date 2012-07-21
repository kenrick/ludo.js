if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(
    //The name of this module
    //"Game",

    //The array of dependencies
    ['../src/player'],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Player) {
        function Game () {
            this.players = [];
        }

        Game.prototype.addPlayer = function( player ) {
            if(this.players.length != 4) {
                this.players.push(player);
                return player;
            }
            
            return false;
        };

        Game.prototype.allReady = function() {
            var allReady = true;

            for (i = 0; i < 4; i++)
            {
                if(this.players[i].status !== 'ready')
                {
                    allReady = false;
                }
            }

            return allReady;
        };

        Game.prototype.start = function() {
            if(this.players.length === 4 && this.allReady())
                return true;

            return false;
        };

        return Game;
    }
);
