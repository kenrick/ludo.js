if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(
    //The name of this module
    //"Game",

    //The array of dependencies
    [],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function () {
        function Game () {
            this.reports = [];
        }

        return Game;
    }
);
