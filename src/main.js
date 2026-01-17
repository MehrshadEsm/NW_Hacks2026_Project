import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  backgroundColor: "#ffffff",
  scene: {
    preload,
    create
  }
};

function preload() {
  this.load.image("enemy", "/assets/enemy.png");
}

function create() {
  this.add.text(540, 100, "DICE DUNGEON", {
    fontSize: "32px",
    color: "#000000"
  }).setOrigin(0.5);

  this.add.image(540, 460, "enemy");
}

new Phaser.Game(config);
