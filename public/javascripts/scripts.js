var socket = io();

var mapSize = 0;
var ships = [];

var button = document.getElementById('dropBomb');
button.addEventListener('click', function(){

    var x = document.getElementById('x').value || 0;
    var y = document.getElementById('y').value || 0;
    if (localStorage.getItem('socket.id')) {
        socket.emit('dropbomb', { id: localStorage.getItem('socket.id'), coords: {x: x, y: y} });
    } else {
        console.log(`You need to enter a name first.`);
    }
});

socket.on('wasHit', function(wasHit){
    console.log(`Was hit?: `, wasHit);
});

socket.on('shipHit', function(hit){
    let ship = ships.find((myShip) => myShip.id === hit.bomb.id);
    console.log(`your ship ${ship.name} were hit by ${hit.by}`);
});

socket.on('playerCreated', function(id){
    console.log(`frontend: a new player has been created with this id: ${id}.`);
});

var nameButton = document.getElementById('nameButton');
nameButton.addEventListener('click', function(){
    var name = document.getElementById('name').value || '';
    socket.emit('playerName', name);
});

socket.on('playerNamed', function(id){
    console.log(`frontend: the player now has this id: ${id}.`);
    localStorage.setItem('socket.id', id);
});

if (localStorage.getItem('socket.id')) {
    socket.emit('get my player', localStorage.getItem('socket.id'));
}

socket.on('here is your player', function(player){
    console.log(`frontend: here is your player: `, player);
    document.getElementById('name').value = player.name;
    document.getElementById('name').disabled = true;
    var shipsContainer = document.getElementById('ships');
    player.ships.forEach((ship) => {
        var div = document.createElement('div');
        div.style.top = + (ship.coords.y * mapSize) + "px";
        div.style.left = + (ship.coords.x * mapSize) + "px";
        div.style.width = + (ship.size.w * mapSize) + "px";
        div.style.height = + (ship.size.h * mapSize) + "px";
        div.classList.add('ship');

        h5 = document.createElement('h5');
        h5.innerText = ship.name;
        h5.classList.add('ship-name');
        div.appendChild(h5);

        shipsContainer.appendChild(div);
    });
    ships = player.ships;
});

socket.on('here is the size', function(size){
    console.log(`frontend: here here is the size: `, size);
    mapSize = size;
});

socket.on('player with same name', function(){
    console.log(`frontend: choose a different name`);
});

var resetButton = document.getElementById('reset');
resetButton.addEventListener('click', function(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `/battleship/reset`, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('finished.', xhr.responseText);
        }
    }
});