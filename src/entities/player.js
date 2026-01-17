import { rollDice } from "../utils/dice.js";

export default class Player {
  constructor(hp = 50) {
    this.hp = hp;
    this.dice = [];
  }

  roll() {
    this.dice = rollDice();
    return this.dice;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }
}
