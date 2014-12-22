function Dice(options) {
  this.options = (options || {});
  this.rolled = this.options.rolled || false;
  this.used = false;
}

exports.Dice = Dice;

Dice.prototype.roll = function() {
  if (this.rolled === false) {
    this.rolled = Math.floor(6 * Math.random()) + 1;
  }

  return this.rolled;
};
