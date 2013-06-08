describe("Dice", function() {
  var dice;

  describe("roll", function() {
    it('returns a random number between 1 and 6', function() {
      dice = new Ludo.Dice();
      var rolled = dice.roll();
      rolled.should.be.within(1, 6);
    });
    it('returns a number thats not always the same', function() {
      var lastDieRolled = 0,
          differentNumber = false,
          rolled;

      for (var i = 1; i <= 100; i++) {
        rolled = (new Ludo.Dice()).roll();
        if(lastDieRolled !== 0 && rolled != lastDieRolled) {
          differentNumber = true;
          break;
        }
        else {
          lastDieRolled = rolled;
        }
      }

      differentNumber.should.equal(true);
    });
    it('returns the number that was rolled if the dice was already rolled', function() {
      dice = new Ludo.Dice();
      dice.roll().should.equal(dice.roll());
    });
  });

  describe("rolled", function() {
    it('returns the face value of the die', function() {
      dice = new Ludo.Dice();
      dice.roll().should.equal(dice.rolled);
    });
    it('returns false if the dice was not rolled', function() {
      dice = new Ludo.Dice();
      dice.rolled.should.equal(false);
    });
  });
});
