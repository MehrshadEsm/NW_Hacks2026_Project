// src/scenes/MenuScene.js
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  init(data) {
    // You can pass data from BootScene / previous scene
    this.gameVersion = data?.version ?? "v0.1";
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor("#10131a");

    // Title
    this.add
      .text(width / 2, height * 0.20, "DICE BALATRO", {
        fontFamily: "Arial",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height * 0.28, "Roguelike dice battler • Build multipliers • Beat floors", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    // Version label
    this.add
      .text(width - 12, height - 10, this.gameVersion, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#64748b",
      })
      .setOrigin(1, 1);

    // Seed input (optional, but great for hackathons)
    const seedUI = this.createSeedInput(width / 2, height * 0.40);

    // Buttons
    const btnY = height * 0.54;
    const gap = 64;

    const startBtn = this.createButton(width / 2, btnY, "Start Run  (Enter)", () => {
      const seed = seedUI.getSeed();
      // Pass seed into your run/battle scene so RNG is reproducible
      this.scene.start("BattleScene", { seed });
    });

    const howBtn = this.createButton(width / 2, btnY + gap, "How to Play  (H)", () => {
      this.openHowToPlayModal();
    });

    const quitBtn = this.createButton(width / 2, btnY + gap * 2, "Quit  (Esc)", () => {
      // In browsers you usually can't close the tab. So do a graceful "quit screen".
      this.openQuitModal();
    });

    // Keyboard shortcuts
    this.input.keyboard.on("keydown-ENTER", () => startBtn.onClick());
    this.input.keyboard.on("keydown-H", () => howBtn.onClick());
    this.input.keyboard.on("keydown-ESC", () => {
      // If modal open -> close it; else -> quit modal
      if (this._modalContainer) this.closeModal();
      else quitBtn.onClick();
    });

    // Small footer tip
    this.add
      .text(width / 2, height * 0.92, "Tip: You can share seeds with teammates for identical runs.", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    // Subtle animation
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

  // ---------- UI helpers ----------

  createButton(x, y, label, onClick) {
    const container = this.add.container(x, y);

    const w = 360;
    const h = 52;

    const bg = this.add
      .rectangle(0, 0, w, h, 0x1f2937, 1)
      .setStrokeStyle(2, 0x334155, 1);

    const txt = this.add.text(0, 0, label, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#e2e8f0",
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    const hoverIn = () => {
      bg.setFillStyle(0x0f172a, 1);
      bg.setStrokeStyle(2, 0x38bdf8, 1);
      this.input.setDefaultCursor("pointer");
      this.tweens.add({ targets: container, scale: 1.03, duration: 80, ease: "Quad.easeOut" });
    };

    const hoverOut = () => {
      bg.setFillStyle(0x1f2937, 1);
      bg.setStrokeStyle(2, 0x334155, 1);
      this.input.setDefaultCursor("default");
      this.tweens.add({ targets: container, scale: 1.0, duration: 80, ease: "Quad.easeOut" });
    };

    container.on("pointerover", hoverIn);
    container.on("pointerout", hoverOut);
    container.on("pointerdown", () => {
      this.tweens.add({ targets: container, scale: 0.98, duration: 60, yoyo: true });
      onClick();
    });

    // Expose for keyboard shortcuts
    const api = {
      container,
      onClick,
    };
    return api;
  }

  createSeedInput(x, y) {
    const label = this.add
      .text(x, y - 26, "Seed (optional):", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    const w = 260;
    const h = 36;

    const box = this.add
      .rectangle(x, y, w, h, 0x0b1220, 1)
      .setStrokeStyle(2, 0x334155, 1);

    const valueText = this.add
      .text(x, y, "", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);

    // Basic text input using keyboard events (no DOM required)
    let seed = "";

    const updateText = () => {
      const shown = seed.length > 18 ? seed.slice(0, 18) + "…" : seed;
      valueText.setText(shown || "type here");
      valueText.setColor(seed ? "#e2e8f0" : "#64748b");
    };
    updateText();

    const focusState = { focused: false };

    const setFocused = (focused) => {
      focusState.focused = focused;
      box.setStrokeStyle(2, focused ? 0x38bdf8 : 0x334155, 1);
    };

    box.setInteractive({ useHandCursor: true });
    box.on("pointerdown", () => setFocused(true));

    // Click outside to unfocus
    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (!currentlyOver.includes(box)) setFocused(false);
    });

    this.input.keyboard.on("keydown", (e) => {
      if (!focusState.focused) return;

      if (e.key === "Backspace") {
        seed = seed.slice(0, -1);
        updateText();
        return;
      }

      if (e.key === "Enter" || e.key === "Escape") {
        setFocused(false);
        return;
      }

      // Allow letters, numbers, underscore, dash (keeps it simple)
      if (/^[a-zA-Z0-9_-]$/.test(e.key)) {
        seed += e.key;
        updateText();
      }
    });

    return {
      getSeed: () => (seed.trim() ? seed.trim() : null),
      setSeed: (s) => {
        seed = String(s ?? "");
        updateText();
      },
    };
  }

  // ---------- Modals ----------

  openHowToPlayModal() {
    const lines = [
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
    ];
    this.openModal(lines.join("\n"));
  }

  openQuitModal() {
    const lines = [
      "QUIT",
      "",
      "In a browser build, games can’t always close the tab.",
      "You can safely close this page/window.",
      "",
      "Press Esc to go back.",
    ];
    this.openModal(lines.join("\n"));
  }

  openModal(text) {
    if (this._modalContainer) return;

    const { width, height } = this.scale;

    const container = this.add.container(0, 0);
    this._modalContainer = container;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    overlay.setInteractive(); // eat clicks

    const panelW = Math.min(560, width * 0.86);
    const panelH = Math.min(360, height * 0.70);

    const panel = this.add
      .rectangle(width / 2, height / 2, panelW, panelH, 0x0b1220, 1)
      .setStrokeStyle(2, 0x334155, 1);

    const body = this.add
      .text(width / 2, height / 2, text, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e2e8f0",
        align: "left",
        wordWrap: { width: panelW - 48 },
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    const closeHint = this.add
      .text(width / 2, height / 2 + panelH / 2 - 22, "Press Esc or click outside to close", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    container.add([overlay, panel, body, closeHint]);

    overlay.on("pointerdown", () => this.closeModal());

    // Fade-in
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
