const LIMIT_SHIP = 5;
const GAME_SIZE = 10;

function randomNumber() {
  return "@" + Math.round(Math.random() * 100);
}

function range(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function clearConsole() {
  for(var i = 0; i < process.stdout.getWindowSize()[1]; i++) {
      console.log('\r\n');
  }
}

function getRangeField(max, offset) {
  const field = [];
  const maxW = (max - (offset.w - 1));
  const maxH = (max - (offset.h - 1));
  for (let i = 1; i <= maxW; i++) {
    for (let j = 1; j <= maxH; j++) {
      field.push({x: i, y: j});
    }
  }
  // field.forEach((f, i) => {
  //   console.log(`${i}: {${f.x}, ${f.y}}`);
  // });
  const result = [];
  for (let index = 0; index < (maxW * maxH); index++) {
    let pick = range(0, field.length - 1);
    let fromField = field[pick];
    field.splice(pick, 1);
    result.push(fromField);
  }
  // result.forEach((f, i) => {
  //   console.log(`${i}: {${f.x}, ${f.y}}`);
  // });
  return result;
}

class Game {
  constructor() {
    this.size = GAME_SIZE;
    this.players = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }

  getPlayer(playerID) {
    return this.players.find((player) => player.id === playerID);
  }
  
  dropBomb(x, y) {
    let hit = false;
    this.players.forEach((player) => {
      player.ships.forEach((ship) => {
        let response = ship.wasHit(x, y);
        if (response) {
          hit = true;
          console.log(`${response.name} was hit\t{${x}, ${y}}.`);
        }
      });
    });
    if (!hit) {
      // console.log(`Bad luck\t{${x}, ${y}}.`);
    }
  }

  printMap () {
    // clearConsole();
    let numbers = [];
    for (let index = 1; index <= this.size; index++) {
      numbers.push(index % 10);
    }
    console.log(`\n   ${numbers.join(' ')}`);
    for (let index = 1; index <= this.size; index++) {
      let line = new Array(this.size).fill('░');
      this.players.forEach((players) => {
        players.getShips().forEach((ship) => {
          if (index >= ship.coords.y && index <= (ship.coords.y + (ship.size.h - 1))) {
            let char = '█';
            if (ship.size.w === 1 && ship.size.h === 1) {
              char = ship.hp.join('');
            }
            let boat = new Array(ship.size.w).fill(char).join('').split('');
            if (boat.length > 1) {
              boat[0] = ship.hp[0];
              boat[boat.length - 1] = ship.hp[ship.hp.length - 1];
            } else if (ship.size.h > 1) {
              if (ship.coords.y === index) {
                boat[0] = ship.hp[0];
              }
              if ((ship.coords.y + (ship.size.h - 1)) === index) {
                boat[0] = ship.hp[0]; // =
              }
            }
            line.splice(ship.coords.x - 1, boat.length, ...boat);
          }
        })
      });
      console.log(`${index % 10}  ${line.join(' ')}`);
    }
  }

};

class Ship {
  constructor(name, player, coords, size) {
    this.id = randomNumber();
    this.name = name;
    this.added = false;

    const direction = Math.round(Math.random());
    // const direction = 1;

    if (size) {
      this.size = size;
    } else {
      this.size = {
        w: (direction === 0) ? 1 : range(1, LIMIT_SHIP),
        h: (direction === 1) ? 1 : range(1, LIMIT_SHIP)
      };
    }

    if (coords) {
      this.coords = coords;
    } else {
      this.coords = {
        x: range(1, game.size - this.size.w),
        y: range(1, game.size - this.size.h)
      };
    }

    this.player = player;
    let myPlayer = game.getPlayer(this.player);

    // First ship
    if (!myPlayer.ships.length) {
      console.log(`Ship [${this.name}] added here [${this.coords.x}, ${this.coords.y}] as the first ship.`);
      this.added = true;
    } else {
      // console.log(`ships: ${myPlayer.ships.length}`);
      const ranges = getRangeField(game.size, this.size);
      let rangesIndex = 0;
      let hitAnotherShip = myPlayer.isOverlappingWithShips(this.size, this.coords);
      while (hitAnotherShip && rangesIndex < (ranges.length - 1)) {
        // console.log(`Ship [${this.name}] is overlapping with [${hitAnotherShip.name}] for the ${rangesIndex} time.`);
        this.coords = ranges[rangesIndex];
        // console.log(`this.coords`, this.coords, rangesIndex, ranges.length);
        // console.log(ranges);
        hitAnotherShip = myPlayer.isOverlappingWithShips(this.size, this.coords);
        rangesIndex++;
      }
      // console.log('ranges', ranges.length);
      if(rangesIndex >= (ranges.length - 1)) {
        // console.log(`There's no more room for this ship [${this.name}] ${this.added}.`);
      } else {
        if (rangesIndex >= 1) {
          console.log(`Ship [${this.name}] added here [${this.coords.x}, ${this.coords.y}] after trying ${rangesIndex + 1} times.`);
        } else {
          console.log(`Ship [${this.name}] added here [${this.coords.x}, ${this.coords.y}].`);
        }
        this.added = true;
      }
    }

    this.hp = [];
    for (let index = 0; index < Math.max(this.size.h, this.size.w); index++) {
      this.hp[index] = '1';
    }
  }
  
  isOverlapping(size, coords) {
    let result = false
    for (let index = 0; index < Math.max(size.w, size.h); index++) {
      let a = coords.x + ((size.w > size.h) ? index : 0);
      let b = coords.y + ((size.w < size.h) ? index : 0);
      if (this.isInRange(a, b)) {
        result = {x: a, y: b};
      }
    }
    return result;
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
  
  addShip (name, coords, size) {
    this.ships.push(new Ship(name, this.id, coords, size));
  }

  isOverlappingWithShips(size, coords) {
    let result = false;
    this.getShips().forEach((ship) => {
      if (ship.isOverlapping(size, coords)) {
        result = ship;
      }
    });
    return result;
  }

  getShips () {
    return this.ships.filter((ship) => {
      return ship.added;
    });
  }
}

const game = new Game();

const player1 = new Player('Nombre Del Player Rodríguez');
game.addPlayer(player1);

for (let index = 0; index < 4; index++) {
  // player1.addShip(`SS Anne #${index+1}`);
  player1.addShip(`SS Anne #${index+1}`, { x: 2, y: 2 });
}
// player1.addShip(`SS Anne #5`, { x: 10, y: 7 }, { w: 1, h: 3 });
// player1.addShip(`SS Anne #6`, { x: 9, y: 9 }, { w: 3, h: 1 });


for (let index = 0; index < 20; index++) {
  game.dropBomb(range(1,game.size), range(1,game.size));
}

game.printMap();
console.log(`\nYou have ${player1.getShips().length} ships.\n`);
// player1.getShips().forEach((ship) => {
//   console.log(ship.name, ship.coords, ship.size);
// });