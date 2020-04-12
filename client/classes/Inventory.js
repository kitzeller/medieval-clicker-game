import {ItemsRegistry} from "./ItemsRegistry";

export class Inventory {

    constructor() {
        //...
        this.items = {};
        this.items[ItemsRegistry.ITEMS.ROCK] = 0;
        this.items[ItemsRegistry.ITEMS.WOOD] = 0;
    }

    addItem(item) {
        //...
        this.items[item] += 1;
    }

    removeItem(item) {
        //...
        this.items[item] -= 1;
    }

}

