export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  init(data) {
    this.gameVersion = data?.version ?? "v0.1";
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#10131a");

    this.add
      .text(width / 2, height * 0.2, "DICE BALATRO", {
        fontFamily: "Arial",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.28, "Roguelike dice battler • Build multipliers • Beat floors", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    this.add
      .text(width - 12, height - 10, this.gameVersion, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#64748b",
      })
      .setOrigin(1, 1);

    const seedUI = this.createSeedInput(width / 2, height * 0.40);

    const btnY = height * 0.54;
    const gap = 64;

    const startBtn = this.createButton(width / 2, btnY, "Start Run  (Enter)", () => {
      const seed = seedUI.getSeed();
      this.scene.start("BattleScene", { seed, floor: 1 });
    });

    const howBtn = this.createButton(width / 2, btnY + gap, "How to Play  (H)", () => {
      this.openHowToPlayModal();
    });

    const quitBtn = this.createButton(width / 2, btnY + gap * 2, "Quit  (Esc)", () => {
      this.openQuitModal();
    });

    // Keyboard shortcuts
    this.input.keyboard.on("keydown-ENTER", () => startBtn.onClick());
    this.input.keyboard.on("keydown-H", () => howBtn.onClick());
    this.input.keyboard.on("keydown-ESC", () => {
      if (this._modalContainer) this.closeModal();
      else quitBtn.onClick();
    });

    this.add
      .text(width / 2, height * 0.92, "Tip: share seeds for identical runs.", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startBtn.container, howBtn.container, quitBtn.container],
      y: "+=4",
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: (_, t, targets) => targets.indexOf(t) * 80,
    });
  }

  createButton(x, y, label, onClick) {
    const container = this.add.container(x, y);
    const w = 360, h = 52;

    const bg = this.add.rectangle(0, 0, w, h, 0x1f2937, 1).setStrokeStyle(2, 0x334155, 1);
    const txt = this.add.text(0, 0, label, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#e2e8f0",
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on("pointerover", () => {
      bg.setFillStyle(0x0f172a, 1);
      bg.setStrokeStyle(2, 0x38bdf8, 1);
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: container, scale: 1.03, duration: 80 });
    });

    container.on("pointerout", () => {
      bg.setFillStyle(0x1f2937, 1);
      bg.setStrokeStyle(2, 0x334155, 1);
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: container, scale: 1.0, duration: 80 });
    });

    container.on("pointerdown", () => {
      this.tweens.add({ targets: container, scale: 0.98, duration: 60, yoyo: true });
      onClick();
    });

    return { container, onClick };
  }

  createSeedInput(x, y) {
    this.add.text(x, y - 26, "Seed (optional):", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#94a3b8",
    }).setOrigin(0.5);

    const w = 260, h = 36;

    const box = this.add.rectangle(x, y, w, h, 0x0b1220, 1).setStrokeStyle(2, 0x334155, 1);
    const valueText = this.add.text(x, y, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#e2e8f0",
    }).setOrigin(0.5);

    let seed = "";
    let focused = false;

    const update = () => {
      const shown = seed.length > 18 ? seed.slice(0, 18) + "…" : seed;
      valueText.setText(shown || "type here");
      valueText.setColor(seed ? "#e2e8f0" : "#64748b");
    };
    update();

    const setFocus = (f) => {
      focused = f;
      box.setStrokeStyle(2, f ? 0x38bdf8 : 0x334155, 1);
    };

    box.setInteractive({ useHandCursor: true });
    box.on("pointerdown", () => setFocus(true));

    this.input.on("pointerdown", (_, currentlyOver) => {
      if (!currentlyOver.includes(box)) setFocus(false);
    });

    this.input.keyboard.on("keydown", (e) => {
      if (!focused) return;

      if (e.key === "Backspace") {
        seed = seed.slice(0, -1);
        update();
        return;
      }
      if (e.key === "Enter" || e.key === "Escape") {
        setFocus(false);
        return;
      }
      if (/^[a-zA-Z0-9_-]$/.test(e.key)) {
        seed += e.key;
        update();
      }
    });

    return {
      getSeed: () => (seed.trim() ? seed.trim() : null),
    };
  }

  openHowToPlayModal() {
    this.openModal(
      [
        "HOW TO PLAY",
        "",
        "• Roll dice to attack, heal, or gain shields.",
        "• Build multipliers with combos & special dice.",
        "• Beat the enemy to reach the next floor.",
        "• After each fight, pick 1 of 3 rewards.",
        "",
        "Controls:",
        "• Mouse: click buttons",
        "• Enter: start run",
        "• Esc: close this screen",
      ].join("\n")
    );
  }

  openQuitModal() {
    this.openModal(
      [
        "QUIT",
        "",
        "Web games usually can’t close the tab automatically.",
        "You can safely close this page/window.",
        "",
        "Press Esc to go back.",
      ].join("\n")
    );
  }

  openModal(text) {
    if (this._modalContainer) return;

    const { width, height } = this.scale;
    const container = this.add.container(0, 0);
    this._modalContainer = container;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    overlay.setInteractive();

    const panelW = Math.min(560, width * 0.86);
    const panelH = Math.min(360, height * 0.7);

    const panel = this.add.rectangle(width / 2, height / 2, panelW, panelH, 0x0b1220, 1)
      .setStrokeStyle(2, 0x334155, 1);

    const body = this.add.text(width / 2, height / 2, text, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#e2e8f0",
      align: "left",
      wordWrap: { width: panelW - 48 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    const hint = this.add.text(width / 2, height / 2 + panelH / 2 - 22, "Press Esc or click outside to close", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#94a3b8",
    }).setOrigin(0.5);

    container.add([overlay, panel, body, hint]);
    overlay.on("pointerdown", () => this.closeModal());

    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 120 });
  }

  closeModal() {
    if (!this._modalContainer) return;
    const c = this._modalContainer;
    this._modalContainer = null;
    this.tweens.add({
      targets: c,
      alpha: 0,
      duration: 120,
      onComplete: () => c.destroy(true),
    });
  }
}
