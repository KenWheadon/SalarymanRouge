// Main Game Engine
class SalarymanRoguelike {
  constructor() {
    this.gameState = {
      currentScreen: "newspaper",
      generation: 1,
      energy: CONFIG.energy.starting_energy,
      maxEnergy: CONFIG.energy.starting_energy,
      money: CONFIG.economy.starting_money,
      day: 1,
      currentJob: null,
      currentHour: 0,
      items: [],
      geneModifications: [],
      energyDrainInterval: null,
    };

    this.screens = {
      newspaper: document.getElementById("newspaper-screen"),
      work: document.getElementById("work-screen"),
      shop: document.getElementById("shop-screen"),
      death: document.getElementById("death-screen"),
      rebirth: document.getElementById("rebirth-screen"),
    };

    this.currentMinigame = null;
    this.init();
  }

  init() {
    this.loadGameState();
    this.setupUI();
    this.setupEventListeners();
    this.showScreen("newspaper");
    this.updateUI();
  }

  // Image loading with fallback
  createImageWithFallback(src, className = "") {
    const wrapper = document.createElement("div");
    wrapper.className = `image-wrapper ${className}`;

    const img = new Image();
    img.onload = () => wrapper.appendChild(img);
    img.onerror = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.textContent = src.split("/").pop().split(".")[0];
      wrapper.appendChild(placeholder);
    };

    img.src = src;
    return wrapper;
  }

  setupUI() {
    this.setupNewspaperScreen();
    this.setupShopScreen();
    this.setupEnergyBar();
    this.setupMoneyDisplay();
  }

  setupEnergyBar() {
    const energySegments = document.getElementById("energy-segments");
    energySegments.innerHTML = "";

    for (let i = 0; i < this.gameState.maxEnergy; i++) {
      const segment = document.createElement("div");
      segment.className = "energy-segment";
      energySegments.appendChild(segment);
    }

    this.updateEnergyBar();
  }

  setupMoneyDisplay() {
    const moneyIcon = document.querySelector(".money-icon");
    const icon = this.createImageWithFallback(CONFIG.assets.yen_coin);
    moneyIcon.appendChild(icon);
  }

  updateEnergyBar() {
    const segments = document.querySelectorAll(".energy-segment");
    const currentEnergy = Math.ceil(this.gameState.energy);

    segments.forEach((segment, index) => {
      segment.classList.remove("full", "draining");

      if (index < currentEnergy - 1) {
        segment.classList.add("full");
      } else if (index === currentEnergy - 1 && this.gameState.energy > index) {
        segment.classList.add("draining");
      }
    });
  }

  updateUI() {
    document.getElementById("money-amount").textContent = this.gameState.money;
    this.updateEnergyBar();
  }

  setupNewspaperScreen() {
    const container = document.getElementById("newspaper-container");
    container.innerHTML = "";

    Object.entries(CONFIG.newspapers).forEach(([key, newspaper]) => {
      const newspaperEl = document.createElement("div");
      newspaperEl.className = "newspaper";

      if (newspaper.cost > this.gameState.money) {
        newspaperEl.classList.add("locked");
      }

      // Newspaper header
      const header = document.createElement("div");
      header.className = "newspaper-header";

      const name = document.createElement("div");
      name.className = "newspaper-name";
      name.textContent = newspaper.name;

      const cost = document.createElement("div");
      cost.className = "newspaper-cost";
      cost.textContent = newspaper.cost === 0 ? "FREE" : `¥${newspaper.cost}`;

      header.appendChild(name);
      header.appendChild(cost);
      newspaperEl.appendChild(header);

      // Job preview
      if (newspaper.jobs) {
        const job = newspaper.jobs[0]; // Show first job
        const preview = document.createElement("div");
        preview.className = "job-preview";

        const title = document.createElement("div");
        title.className = "job-title";
        title.textContent = job.title;

        const details = document.createElement("div");
        details.className = "job-details";
        details.innerHTML = `
                    <div>${job.company}</div>
                    <div>¥${job.salary}/day - ${job.hours} hours</div>
                `;

        preview.appendChild(title);
        preview.appendChild(details);
        newspaperEl.appendChild(preview);
      } else if (newspaper.locked_message) {
        const message = document.createElement("div");
        message.className = "job-details";
        message.textContent = newspaper.locked_message;
        newspaperEl.appendChild(message);
      }

      // Add click handler
      if (newspaper.cost <= this.gameState.money) {
        newspaperEl.addEventListener("click", () =>
          this.selectJob(key, newspaper)
        );
      }

      container.appendChild(newspaperEl);
    });
  }

  setupShopScreen() {
    // Setup general store
    const itemsList = document.getElementById("items-list");
    itemsList.innerHTML = "";

    Object.entries(CONFIG.shop_items).forEach(([key, item]) => {
      const itemEl = this.createShopItem(key, item, "item");
      itemsList.appendChild(itemEl);
    });

    // Setup gene booth
    const genesList = document.getElementById("genes-list");
    genesList.innerHTML = "";

    Object.entries(CONFIG.gene_modifications).forEach(([key, gene]) => {
      const geneEl = this.createShopItem(key, gene, "gene");
      genesList.appendChild(geneEl);
    });
  }

  createShopItem(key, item, type) {
    const itemEl = document.createElement("div");
    itemEl.className = "shop-item";

    const isOwned =
      type === "item"
        ? this.gameState.items.includes(key)
        : this.gameState.geneModifications.includes(key);

    const canAfford = this.gameState.money >= item.cost;

    if (canAfford && !isOwned) {
      itemEl.classList.add("affordable");
    }

    if (isOwned) {
      itemEl.classList.add("purchased");
    }

    const header = document.createElement("div");
    header.className = "item-header";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = item.name + (isOwned ? " (Owned)" : "");

    const cost = document.createElement("div");
    cost.className = "item-cost";
    cost.textContent = `¥${item.cost}`;

    header.appendChild(name);
    header.appendChild(cost);

    const description = document.createElement("div");
    description.className = "item-description";
    description.textContent = item.description;

    itemEl.appendChild(header);
    itemEl.appendChild(description);

    // Add click handler
    if (!isOwned && canAfford) {
      itemEl.addEventListener("click", () =>
        this.purchaseItem(key, item, type)
      );
    }

    return itemEl;
  }

  setupEventListeners() {
    document
      .getElementById("continue-home-btn")
      .addEventListener("click", () => {
        this.nextDay();
      });

    document
      .getElementById("next-generation-btn")
      .addEventListener("click", () => {
        this.showRebirth();
      });

    document
      .getElementById("start-new-life-btn")
      .addEventListener("click", () => {
        this.startNewGeneration();
      });
  }

  selectJob(newspaperKey, newspaper) {
    if (newspaper.cost > this.gameState.money) return;

    // Deduct newspaper cost
    this.gameState.money -= newspaper.cost;
    this.gameState.currentJob = newspaper.jobs[0];
    this.gameState.currentHour = 0;

    this.showScreen("work");
    this.startWorkDay();
  }

  startWorkDay() {
    const job = this.gameState.currentJob;
    const dayConfig = CONFIG.day_progression[`day_${this.gameState.day}`] || {
      hours: job.hours,
      difficulty: 1.0,
    };

    // Update work header
    document.getElementById(
      "work-title"
    ).textContent = `${job.title} - ${job.company}`;
    document.getElementById("current-hour").textContent =
      this.gameState.currentHour + 1;
    document.getElementById("total-hours").textContent = dayConfig.hours;

    // Start energy drain
    this.startEnergyDrain();

    // Start first task
    this.startNextTask();
  }

  startEnergyDrain() {
    if (this.gameState.energyDrainInterval) {
      clearInterval(this.gameState.energyDrainInterval);
    }

    this.gameState.energyDrainInterval = setInterval(() => {
      this.gameState.energy -= CONFIG.energy.drain_rate;
      this.updateEnergyBar();

      if (this.gameState.energy <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  stopEnergyDrain() {
    if (this.gameState.energyDrainInterval) {
      clearInterval(this.gameState.energyDrainInterval);
      this.gameState.energyDrainInterval = null;
    }
  }

  startNextTask() {
    const job = this.gameState.currentJob;
    const dayConfig = CONFIG.day_progression[`day_${this.gameState.day}`] || {
      hours: job.hours,
      difficulty: 1.0,
    };

    if (this.gameState.currentHour >= dayConfig.hours) {
      this.completeWorkDay();
      return;
    }

    // Select random task
    const availableTasks = job.tasks;
    const taskType =
      availableTasks[Math.floor(Math.random() * availableTasks.length)];

    this.gameState.currentHour++;
    document.getElementById("current-hour").textContent =
      this.gameState.currentHour;

    // Start minigame
    const workArea = document.getElementById("work-area");

    if (taskType === "stapling") {
      this.currentMinigame = new StaplingGame(workArea, (result) =>
        this.onTaskComplete(result)
      );
    } else if (taskType === "pen_refill") {
      this.currentMinigame = new PenGame(
        workArea,
        (result) => this.onTaskComplete(result),
        this.gameState.items
      );
    }
  }

  onTaskComplete(result) {
    // Clean up current minigame
    if (this.currentMinigame) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }

    // Brief pause before next task
    setTimeout(() => {
      this.startNextTask();
    }, 1000);
  }

  completeWorkDay() {
    this.stopEnergyDrain();

    // Award salary
    this.gameState.money += this.gameState.currentJob.salary;
    this.updateUI();

    // Show shop screen
    this.showScreen("shop");
    this.setupShopScreen(); // Refresh shop with current money
  }

  purchaseItem(key, item, type) {
    if (this.gameState.money < item.cost) return;

    this.gameState.money -= item.cost;

    if (type === "item") {
      this.gameState.items.push(key);
    } else if (type === "gene") {
      this.gameState.geneModifications.push(key);
    }

    this.updateUI();
    this.setupShopScreen(); // Refresh shop
  }

  nextDay() {
    this.gameState.day++;
    this.showScreen("newspaper");
    this.setupNewspaperScreen();
    this.saveGameState();
  }

  gameOver() {
    this.stopEnergyDrain();

    if (this.currentMinigame) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }

    this.showScreen("death");
  }

  showRebirth() {
    // Calculate inherited bonuses
    const inheritedStats = document.getElementById("inherited-stats");
    inheritedStats.innerHTML = "";

    let energyBonus = 0;
    this.gameState.geneModifications.forEach((modKey) => {
      const mod = CONFIG.gene_modifications[modKey];
      if (mod && mod.effect === "child_energy_bonus") {
        energyBonus += mod.bonus;
      }
    });

    if (energyBonus > 0) {
      const statLine = document.createElement("div");
      statLine.className = "stat-line";
      statLine.innerHTML = `
                <span>Base Energy:</span>
                <span>${CONFIG.energy.starting_energy} + <span class="stat-bonus">${energyBonus}</span></span>
            `;
      inheritedStats.appendChild(statLine);
    }

    this.showScreen("rebirth");
  }

  startNewGeneration() {
    // Calculate new starting energy
    let energyBonus = 0;
    this.gameState.geneModifications.forEach((modKey) => {
      const mod = CONFIG.gene_modifications[modKey];
      if (mod && mod.effect === "child_energy_bonus") {
        energyBonus += mod.bonus;
      }
    });

    // Reset for new generation
    this.gameState.generation++;
    this.gameState.energy = CONFIG.energy.starting_energy + energyBonus;
    this.gameState.maxEnergy = CONFIG.energy.starting_energy + energyBonus;
    this.gameState.money = CONFIG.economy.starting_money;
    this.gameState.day = 1;
    this.gameState.currentJob = null;
    this.gameState.currentHour = 0;
    this.gameState.items = []; // Items are lost
    // Gene modifications persist

    this.setupEnergyBar();
    this.showScreen("newspaper");
    this.setupNewspaperScreen();
    this.updateUI();
    this.saveGameState();
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      screen.classList.add("hidden");
    });

    this.screens[screenName].classList.remove("hidden");
    this.gameState.currentScreen = screenName;
  }

  saveGameState() {
    localStorage.setItem("salarymanRoguelike", JSON.stringify(this.gameState));
  }

  loadGameState() {
    const saved = localStorage.getItem("salarymanRoguelike");
    if (saved) {
      const loadedState = JSON.parse(saved);
      // Merge with default state to handle new properties
      this.gameState = { ...this.gameState, ...loadedState };
    }
  }
}

// Start the game when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.game = new SalarymanRoguelike();
});
