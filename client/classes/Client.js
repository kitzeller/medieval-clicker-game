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

        socket.on('scene', function (mesh) {
            game = new Game('gameCanvas', mesh);
            // Add self
            game.addPlayer(socket);
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

        socket.on('other player movement', function (msg) {
            others[msg.id].mesh.position = msg.position;
        });

        socket.on('disconnect', function (msg) {
            console.log(others[msg])
            others[msg].mesh.dispose();
            delete others[msg];
        });

        socket.on('newPlayer', async function (msg) {
            others[msg.playerId] = msg;
            others[msg.playerId].mesh = await game.addOtherPlayer();
        });

        socket.on('currentPlayers',  function (players) {
            console.log(players);
            others = players;
            Object.keys(players).forEach(async function (id) {
                if (players[id].playerId === socket.id) {
                    // TODO....
                    // addPlayer(self, players[id]);
                } else {
                    players[id].mesh = await game.addOtherPlayer(players[id].position);
                    // addOtherPlayers(self, players[id]);
                }
            });
            $('#messages').append($('<li>').text((Object.keys(players).length - 1) + " player(s) are in the game."));
        });
    }
}
