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
            this.playerOne = new Player();
            this.playerTwo = new Player();
            this.playerThree = new Player();
            this.playerFour = new Player();
        }

        return Game;
    }
);
