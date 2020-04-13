class Player {
    constructor(id, nickname, position) {
        this.playerId = id;
        this.nickname = nickname;
        this.position = position;

        this.health = 20;
        this.energy = 20;

        return this;
    }


}

module.exports = Player;
