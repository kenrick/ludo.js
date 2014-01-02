describe("Token", function() {
  var token, player;

  beforeEach(function() {
    player = mockPlayer("Player1");
  });

  describe("intialize", function() {
    it('can accept the player it belongs to', function() {
      token = new Ludo.Token({player: player});
      token.player.should.equal(player);
    });
    it('can accept its position', function() {
      token = new Ludo.Token({position: 1});
      token.position.should.equal(1);
    });
  });
  describe("born", function() {
    it('sets active to true');
    it('calls moveTo with the startPoint coordinates');
    it('fires the token:born event');
  });
  describe("moveBy", function() {
    it('accepts a number to move the token by');
    it('calls moveTo with the coordinates that token should be at');
    it('returns the coordinates the token was moved to');
  });

  describe("moveTo", function() {
    it('fires the token:move event, passing the token and coordinates');
    it('updates the currentCoord with the new coordinates');
  });

  describe("killed", function() {
    it('sets active to false');
  });
});
