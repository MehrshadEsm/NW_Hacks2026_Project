export default class Enemy {
  constructor(hp = 50) {
    this.hp = hp;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }

  attack() {
    return Math.floor(Math.random() * 6) + 1; // simple enemy attack
  }
}
