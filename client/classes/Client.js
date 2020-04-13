import io from 'socket.io-client';
import * as $ from 'jquery';
import Game from './Game';

export default class Client {
    constructor() {
        const socket = io.connect(window.location.host);

        var game;
        var others = {};

        socket.on('connect', function() {
            console.log("Client Successfully Connected. Id: " + socket.id);
            $('#messages').append($('<li>').text('Welcome to a Medieval clicker game!'));
        });

        socket.on('scene', async function (mesh) {
            game = new Game('gameCanvas', mesh);
            // Add self
            await game.addPlayer(socket, mesh.initPos, mesh.name);
        });

        $('form').submit(function (e) {
            e.preventDefault(); // prevents page reloading
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function (msg) {
            $('#messages').append($('<li>').text(msg));
        });

        // TODO: Improve messaging system
        socket.on('other player movement', function (msg) {
            others[msg.id].player.addDestination(msg.position);
        });

        socket.on('other player run', function (msg) {
            others[msg.id].player.toggleRun();
        });

        socket.on('other stop moving', function (msg) {
            others[msg.id].player.stopMoving();
        });

        // TODO: Improve this, add particles, etc
        // TOOD: Decide whether resource meshes are global or by-user
        socket.on('update destroy mesh', function (msg) {
            if (game){
                game.scene.getMeshByID(msg.id).dispose();
            }
        });

        socket.on('disconnect', function (msg) {
            console.log(others[msg]);
            if (others[msg]){
                if (others[msg].mesh) others[msg].mesh.dispose();
                delete others[msg];
            }
        });

        socket.on('newPlayer', async function (msg) {
            others[msg.playerId] = msg;

            let playerObj = await game.addOtherPlayer(msg.position);
            others[msg.playerId].player = playerObj;
            others[msg.playerId].mesh = playerObj.player;
        });

        socket.on('currentPlayers',  function (players) {
            console.log(players);
            others = players;
            Object.keys(players).forEach(async function (id) {
                if (players[id].playerId === socket.id) {
                    // TODO: Nothing?
                } else {
                    let playerObj = await game.addOtherPlayer(players[id].position, players[id].nickname);
                    players[id].player = playerObj;
                    players[id].mesh = playerObj.player;
                }
            });
            $('#messages').append($('<li>').text((Object.keys(players).length - 1) + " player(s) are in the game."));
        });
    }
}
