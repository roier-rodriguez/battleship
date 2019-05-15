var express = require('express');
var router = express.Router();
var { Game } = require('../battleship');

var Battleship = new Game(30);
// var p1 = Battleship.addPlayer('Nombre Del Player Rodríguez');
// for (let index = 0; index < 5; index++) {
//   p1.addShip(`SS Anne #${index+1}`, Battleship);
// }
// Battleship.printMap();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Battleship',
    // ships:  Battleship.players[0].getShips(),
    size: Battleship.size
  });
});

router.post('/battleship/dropbomb/:x/:y', function(req, res, next) {
  Battleship.dropBomb(parseInt(req.params.x), parseInt(req.params.y));
  res.send('OK.');
});

router.post('/battleship/reset', function(req, res, next) {
  Battleship = new Game();
  Battleship.printMap();
  res.send('OK.');
});

module.exports = function(io) {

  io.on('connection', function(socket){
    
    console.log('this socket.id is ', socket.id);
    console.log('this are my players in the game:');
    console.log(Battleship.getPlayers().map(player => player.getName()));
    
    socket.on('playerName', function(name) {
      let id = socket.id;
      if (Battleship.hasPlayerWithName(name)) {
        id = Battleship.getPlayerByName(name).getID();
      } else {
        Battleship.addPlayer(id);
      }
      Battleship.getPlayer(id).setName(name);
      Battleship.getPlayer(id).createShips(Battleship, 5);
      socket.emit('playerNamed', id);
    });

    socket.on('get my ships', function(id) {
      if (Battleship.getPlayer(id)) {
        let ships = Battleship.getPlayer(id).getShips();
        socket.emit('here are your ships', ships)
      }
    });

    socket.on('dropbomb', function(coords){
      
      socket.emit('wasHit', false);

    });

  });

  return router;
};
