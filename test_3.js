function randomNumber() {
  return "@" + Math.round(Math.random() * 100);
}

function range(min, max) {
  return Math.round(Math.random() * max) + min;
}

class Game {
  constructor() {
    this.size = 30;
    this.players = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }
  
  dropBomb(x, y) {
    this.players.forEach((player) => {
      player.ships.forEach((ship) => {
        let response = ship.wasHit(x, y);
        if (response) {
          console.log(`${response.name} was hit\t{${x}, ${y}}`);
        }
      });
    });
  }
};

class Ship {
  constructor(name, player) {
    this.id = randomNumber();
    this.name = name;
    const direction = Math.round(Math.random());// 0 / 1
    this.size = {
      w: (direction === 0) ? 1 : range(1, 5),
      h: (direction === 1) ? 1 : range(1, 5)
    };
    this.coords = {
      x: range(1, game.size - this.size.w),
      y: range(1, game.size - this.size.h)
    };
    this.player = player;
    let myPlayer = game.players.find((player) => {
      return player.id === this.player;
    });
    myPlayer.ships.forEach((ship) => {
      while (ship.isOverlapping(this.size, this.coords)) {
        console.log('is overlapping!', this.size, this.coords);
        this.coords = {
          x: range(1, game.size - this.size.w),
          y: range(1, game.size - this.size.h)
        };
      }
    });
    this.hp = [];
    for (let index = 0; index < Math.max(this.size.h, this.size.w); index++) {
      this.hp[index] = '1';
    }
  }
  
  isOverlapping(size, coords) {
    for (let index = 0; index < Math.max(size.w, size.h); index++) {
      let a = coords.x + ((size.w > size.h) ? index : 0);
      let b = coords.y + ((size.w < size.h) ? index : 0);
      if (this.isInRange(a, b)) {
        return true;
      }
    }
    return false;
  }
  
  isInRange(a, b) {
    return (a >= (this.coords.x)
          && a <= (this.coords.x + this.size.w - 1)
          && b >= (this.coords.y)
          && b <= (this.coords.y + this.size.h - 1));
  };

  isDamaged(a, b) {
    if (this.isInRange(a, b)) {
      for (let index = 0; index < this.hp.length; index++) {
      if ( a === this.coords.x + ((this.size.w > this.size.h) ? index : 0)
          && b === this.coords.y + ((this.size.w < this.size.h) ? index : 0))  {
          if (this.hp[index] !== '0') {
            this.hp[index] = '0';
            return index;
          }
        }
      }
    }
    return -1;
  };

  wasHit(x, y) {
    if (this.isDamaged(x, y) >= 0) {
        return {
          name: this.name,
          player: this.player,
          hp: this.hp
        };
    }
    return false;
  };
}

class Player {
  constructor(name) {
    this.id = randomNumber();
    this.name = name;
    this.score = 0;
    this.isActive = false;
    this.isPlayer = true;
    this.ships = [];
  }
  addShip (ship) {
    this.ships.push(ship);
  }
}

const game = new Game();

const player1 = new Player('Nombre Del Player Rodríguez');
game.addPlayer(player1);

for (let index = 0; index < 60; index++) {
  player1.addShip(new Ship(`SS Anne #${index+1}`, player1.id));
}


game.dropBomb(8, 13);
game.dropBomb(2, 4);
game.dropBomb(8, 13);
