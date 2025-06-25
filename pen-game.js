// Enhanced Pen Refilling Minigame Module
class PenGame {
  constructor(container, onComplete, playerItems = []) {
    this.container = container;
    this.onComplete = onComplete;
    this.playerItems = playerItems;
    this.pens = [];
    this.holders = [];
    this.draggedPen = null;
    this.isActive = false;
    this.startTime = null;
    this.requiredPens = CONFIG.minigames.pen_refill.required_pens;
    this.holdersCount = CONFIG.minigames.pen_refill.holders_count;
    this.pensPerHolder = CONFIG.minigames.pen_refill.pens_per_holder || 3;

    // Enhanced game state
    this.penColors = ["#0088ff", "#ff4444", "#44ff44", "#ff8800", "#8844ff"];
    this.dragPreview = null;
    this.completedHolders = 0;
    this.combo = 0;
    this.lastDropTime = 0;

    // Check for pocket protector bonus
    this.hasPocketProtector = playerItems.includes("pocket_protector");
    this.pensFilled = this.hasPocketProtector ? 1 : 0;

    this.init();
  }

  init() {
    this.container.innerHTML = "";
    this.container.className = "minigame-container pen-game-container";

    // Create enhanced UI
    this.createGameHeader();
    this.createPenArea();
    this.createProgressBar();

    // Start the minigame
    this.start();
  }

  createGameHeader() {
    const header = document.createElement("div");
    header.className = "pen-game-header";

    // Main instruction with better styling
    const instruction = document.createElement("div");
    instruction.className = "task-instruction enhanced";
    instruction.innerHTML = `
      <div class="instruction-icon">✏️</div>
      <div class="instruction-text">
        <div class="main-text">Fill the Pen Holders!</div>
        <div class="sub-text">Drag colorful pens to organize your desk</div>
      </div>
    `;
    this.instructionElement = instruction;
    header.appendChild(instruction);

    // Combo display
    const comboDisplay = document.createElement("div");
    comboDisplay.className = "combo-display";
    comboDisplay.innerHTML = `
      <div class="combo-text">Combo</div>
      <div class="combo-value">0</div>
    `;
    this.comboElement = comboDisplay;
    header.appendChild(comboDisplay);

    this.container.appendChild(header);
  }

  createProgressBar() {
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressLabel = document.createElement("div");
    progressLabel.className = "progress-label";
    progressLabel.textContent = "Progress";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressBar.appendChild(progressFill);

    const progressText = document.createElement("div");
    progressText.className = "progress-text";
    progressText.textContent = `${this.pensFilled}/${this.requiredPens}`;

    progressContainer.appendChild(progressLabel);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);

    this.progressFill = progressFill;
    this.progressText = progressText;
    this.container.appendChild(progressContainer);
  }

  createImageWithFallback(src, className = "") {
    const wrapper = document.createElement("div");
    wrapper.className = `image-wrapper ${className}`;

    const img = new Image();
    img.onload = () => wrapper.appendChild(img);
    img.onerror = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder enhanced-placeholder";
      placeholder.innerHTML = `
        <div class="placeholder-icon">🏢</div>
        <div class="placeholder-text">${
          src.split("/").pop().split(".")[0]
        }</div>
      `;
      wrapper.appendChild(placeholder);
    };

    img.src = src;
    return wrapper;
  }

  createPenArea() {
    const penArea = document.createElement("div");
    penArea.className = "pen-area enhanced";

    // Enhanced office desk background
    const deskBg = this.createImageWithFallback(
      CONFIG.assets.office_desk,
      "office-desk enhanced"
    );
    penArea.appendChild(deskBg);

    // Create enhanced pen box
    this.createEnhancedPenBox(penArea);

    // Create enhanced pen holders
    this.createEnhancedPenHolders(penArea);

    this.container.appendChild(penArea);
  }

  createEnhancedPenBox(parent) {
    const penBoxContainer = document.createElement("div");
    penBoxContainer.className = "pen-box-container";

    const penBoxLabel = document.createElement("div");
    penBoxLabel.className = "pen-box-label";
    penBoxLabel.textContent = "📦 Pen Supply";

    const penBox = document.createElement("div");
    penBox.className = "pen-box enhanced";

    // Create colorful pens with better visuals
    for (let i = 0; i < 15; i++) {
      const pen = this.createEnhancedPen(i);
      penBox.appendChild(pen);
      this.pens.push(pen);
    }

    penBoxContainer.appendChild(penBoxLabel);
    penBoxContainer.appendChild(penBox);
    parent.appendChild(penBoxContainer);
  }

  createEnhancedPen(id) {
    const pen = document.createElement("div");
    pen.className = "pen enhanced";
    pen.draggable = true;
    pen.dataset.penId = id;

    // Random color for visual variety
    const colorIndex = id % this.penColors.length;
    const color = this.penColors[colorIndex];

    pen.style.setProperty("--pen-color", color);
    pen.innerHTML = `
      <div class="pen-tip"></div>
      <div class="pen-body"></div>
      <div class="pen-cap"></div>
    `;

    // Enhanced event listeners
    pen.addEventListener("dragstart", (e) => this.handleDragStart(e));
    pen.addEventListener("dragend", (e) => this.handleDragEnd(e));
    pen.addEventListener("mousedown", (e) => this.handleMouseDown(e));

    // Hover effects
    pen.addEventListener("mouseenter", (e) => this.handlePenHover(e));
    pen.addEventListener("mouseleave", (e) => this.handlePenLeave(e));

    return pen;
  }

  createEnhancedPenHolders(parent) {
    const holdersContainer = document.createElement("div");
    holdersContainer.className = "pen-holders enhanced";

    const holdersLabel = document.createElement("div");
    holdersLabel.className = "holders-label";
    holdersLabel.textContent = "🗂️ Pen Organizers";

    const holdersGrid = document.createElement("div");
    holdersGrid.className = "holders-grid";

    for (let i = 0; i < this.holdersCount; i++) {
      const holder = this.createEnhancedHolder(i);
      holdersGrid.appendChild(holder);
      this.holders.push(holder);

      // Add pocket protector bonus
      if (this.hasPocketProtector && i === 0) {
        this.addPenToHolder(holder, true);
      }
    }

    holdersContainer.appendChild(holdersLabel);
    holdersContainer.appendChild(holdersGrid);
    parent.appendChild(holdersContainer);
  }

  createEnhancedHolder(id) {
    const holder = document.createElement("div");
    holder.className = "pen-holder enhanced";
    holder.dataset.holderId = id;
    holder.dataset.pens = "0";

    // Holder label
    const label = document.createElement("div");
    label.className = "holder-label";
    label.textContent = `Holder ${id + 1}`;
    holder.appendChild(label);

    // Drop zone indicator
    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";
    dropZone.innerHTML = `
      <div class="drop-icon">⬇️</div>
      <div class="drop-text">Drop pens here</div>
    `;
    holder.appendChild(dropZone);

    // Pens container
    const pensContainer = document.createElement("div");
    pensContainer.className = "holder-pens";
    holder.appendChild(pensContainer);

    // Capacity indicator
    const capacityIndicator = document.createElement("div");
    capacityIndicator.className = "capacity-indicator";
    for (let i = 0; i < this.pensPerHolder; i++) {
      const slot = document.createElement("div");
      slot.className = "capacity-slot";
      capacityIndicator.appendChild(slot);
    }
    holder.appendChild(capacityIndicator);

    // Enhanced drop events
    holder.addEventListener("dragover", (e) => this.handleDragOver(e));
    holder.addEventListener("drop", (e) => this.handleDrop(e));
    holder.addEventListener("dragenter", (e) => this.handleDragEnter(e));
    holder.addEventListener("dragleave", (e) => this.handleDragLeave(e));

    return holder;
  }

  // Enhanced interaction methods
  handlePenHover(e) {
    if (!this.isActive) return;
    e.target.classList.add("hover");
  }

  handlePenLeave(e) {
    e.target.classList.remove("hover");
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  }

  handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove("drag-over");
    }
  }

  start() {
    this.isActive = true;
    this.startTime = Date.now();
    this.updateProgress();
    this.showStartAnimation();
  }

  showStartAnimation() {
    this.container.classList.add("game-start");
    setTimeout(() => {
      this.container.classList.remove("game-start");
    }, 1000);
  }

  handleDragStart(e) {
    if (!this.isActive) return;

    this.draggedPen = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";

    // Create drag preview
    this.createDragPreview(e.target);
  }

  createDragPreview(pen) {
    this.dragPreview = pen.cloneNode(true);
    this.dragPreview.className = "pen enhanced drag-preview";
    this.dragPreview.style.position = "fixed";
    this.dragPreview.style.pointerEvents = "none";
    this.dragPreview.style.zIndex = "1000";
    document.body.appendChild(this.dragPreview);
  }

  handleDragEnd(e) {
    e.target.classList.remove("dragging");
    this.draggedPen = null;

    // Remove drag preview
    if (this.dragPreview) {
      this.dragPreview.remove();
      this.dragPreview = null;
    }

    // Remove drag-over states from all holders
    this.holders.forEach((holder) => {
      holder.classList.remove("drag-over");
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Update drag preview position
    if (this.dragPreview) {
      this.dragPreview.style.left = e.clientX - 20 + "px";
      this.dragPreview.style.top = e.clientY - 30 + "px";
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    if (!this.draggedPen || !this.isActive) return;

    const holder = e.currentTarget;
    const currentPens = parseInt(holder.dataset.pens);

    if (currentPens >= this.pensPerHolder) {
      this.showError("Holder is full!");
      return;
    }

    this.movePenToHolder(this.draggedPen, holder);
  }

  handleMouseDown(e) {
    if (!this.isActive) return;

    const pen = e.target.closest(".pen");
    if (!pen) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const penRect = pen.getBoundingClientRect();

    const clone = pen.cloneNode(true);
    clone.className = "pen enhanced dragging mobile-drag";
    clone.style.position = "fixed";
    clone.style.left = penRect.left + "px";
    clone.style.top = penRect.top + "px";
    clone.style.zIndex = "1000";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);
    pen.classList.add("dragging");

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      clone.style.left = penRect.left + deltaX + "px";
      clone.style.top = penRect.top + deltaY + "px";

      // Highlight valid drop zones
      const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
      const holder = elementUnder?.closest(".pen-holder");

      this.holders.forEach((h) => h.classList.remove("drag-over"));
      if (holder && parseInt(holder.dataset.pens) < this.pensPerHolder) {
        holder.classList.add("drag-over");
      }
    };

    const handleMouseUp = (e) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
      const holder = elementUnder?.closest(".pen-holder");

      if (holder && parseInt(holder.dataset.pens) < this.pensPerHolder) {
        this.movePenToHolder(pen, holder);
      } else if (holder) {
        this.showError("Holder is full!");
      }

      clone.remove();
      pen.classList.remove("dragging");
      this.holders.forEach((h) => h.classList.remove("drag-over"));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  movePenToHolder(pen, holder) {
    const currentTime = Date.now();
    const timeSinceLastDrop = currentTime - this.lastDropTime;

    // Remove from pen box
    pen.remove();

    // Clone pen for holder (preserve styling)
    const holderPen = pen.cloneNode(true);
    holderPen.className = "pen enhanced placed";
    holderPen.draggable = false;
    holderPen.style.transform = "scale(0.8)";

    // Add to holder
    const pensContainer = holder.querySelector(".holder-pens");
    pensContainer.appendChild(holderPen);

    // Update holder state
    const currentPens = parseInt(holder.dataset.pens);
    const newPenCount = currentPens + 1;
    holder.dataset.pens = newPenCount.toString();

    // Update capacity indicator
    const capacitySlots = holder.querySelectorAll(".capacity-slot");
    if (capacitySlots[currentPens]) {
      capacitySlots[currentPens].classList.add("filled");
    }

    // Check if holder is full and celebrate
    if (newPenCount >= this.pensPerHolder) {
      holder.classList.add("full");
      this.completedHolders++;
      this.showHolderComplete(holder);
    }

    // Update combo system
    if (timeSinceLastDrop < 2000) {
      // Within 2 seconds
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastDropTime = currentTime;

    // Update progress and UI
    this.pensFilled++;
    this.updateProgress();
    this.updateCombo();
    this.showPenPlaced(holder);

    // Check completion
    if (this.pensFilled >= this.requiredPens) {
      this.complete();
    }
  }

  addPenToHolder(holder, isBonus = false) {
    const pen = document.createElement("div");
    pen.className = "pen enhanced placed" + (isBonus ? " bonus" : "");
    pen.style.setProperty("--pen-color", "#ffd700"); // Gold for bonus
    pen.innerHTML = `
      <div class="pen-tip"></div>
      <div class="pen-body"></div>
      <div class="pen-cap"></div>
    `;

    const pensContainer = holder.querySelector(".holder-pens");
    pensContainer.appendChild(pen);

    const currentPens = parseInt(holder.dataset.pens);
    holder.dataset.pens = (currentPens + 1).toString();

    // Update capacity indicator
    const capacitySlots = holder.querySelectorAll(".capacity-slot");
    if (capacitySlots[currentPens]) {
      capacitySlots[currentPens].classList.add("filled");
    }

    if (currentPens + 1 >= this.pensPerHolder) {
      holder.classList.add("full");
    }

    if (isBonus) {
      this.showBonusEffect(holder);
    }
  }

  updateProgress() {
    const progress = (this.pensFilled / this.requiredPens) * 100;
    this.progressFill.style.width = progress + "%";
    this.progressText.textContent = `${this.pensFilled}/${this.requiredPens}`;

    // Color progression
    if (progress < 30) {
      this.progressFill.className = "progress-fill low";
    } else if (progress < 70) {
      this.progressFill.className = "progress-fill medium";
    } else {
      this.progressFill.className = "progress-fill high";
    }
  }

  updateCombo() {
    this.comboElement.querySelector(".combo-value").textContent = this.combo;

    if (this.combo > 1) {
      this.comboElement.classList.add("active");
      if (this.combo >= 5) {
        this.comboElement.classList.add("high");
      }
    } else {
      this.comboElement.classList.remove("active", "high");
    }
  }

  showPenPlaced(holder) {
    holder.classList.add("pen-added");
    setTimeout(() => holder.classList.remove("pen-added"), 500);
  }

  showHolderComplete(holder) {
    holder.classList.add("complete-celebration");
    setTimeout(() => holder.classList.remove("complete-celebration"), 1000);
  }

  showBonusEffect(holder) {
    holder.classList.add("bonus-effect");
    setTimeout(() => holder.classList.remove("bonus-effect"), 1500);
  }

  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    this.container.appendChild(errorElement);

    setTimeout(() => errorElement.remove(), 2000);
  }

  showCompletionCelebration() {
    this.container.classList.add("completion-celebration");

    // Create celebration particles
    const particleContainer = document.createElement("div");
    particleContainer.className = "celebration-particles";

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "celebration-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 2 + "s";
      particleContainer.appendChild(particle);
    }

    this.container.appendChild(particleContainer);

    setTimeout(() => {
      particleContainer.remove();
      this.container.classList.remove("completion-celebration");
    }, 3000);
  }

  complete() {
    this.isActive = false;
    const completionTime = (Date.now() - this.startTime) / 1000;

    // Enhanced completion message
    this.instructionElement.innerHTML = `
      <div class="instruction-icon">🎉</div>
      <div class="instruction-text">
        <div class="main-text">Task Complete!</div>
        <div class="sub-text">All pens organized perfectly!</div>
      </div>
    `;
    this.instructionElement.classList.add("complete");

    // Show celebration
    this.showCompletionCelebration();

    // Calculate bonus score based on combo and time
    const timeBonus =
      completionTime < 60 ? Math.floor((60 - completionTime) * 10) : 0;
    const comboBonus = Math.max(this.combo - 1, 0) * 50;

    setTimeout(() => {
      this.onComplete({
        taskType: "pen_refill",
        completionTime: completionTime,
        success: true,
        bonus: this.hasPocketProtector ? "pocket_protector" : null,
        score: {
          base: 100,
          timeBonus: timeBonus,
          comboBonus: comboBonus,
          total: 100 + timeBonus + comboBonus,
        },
        stats: {
          maxCombo: this.combo,
          completedHolders: this.completedHolders,
        },
      });
    }, 2000);
  }

  destroy() {
    this.isActive = false;
    this.container.innerHTML = "";
  }

  static isAvailable() {
    return true;
  }

  static getTaskInfo() {
    return {
      name: "Organize Pen Holders",
      description:
        "Drag colorful pens to fill the organizer holders efficiently",
      energyCost: CONFIG.minigames.pen_refill.base_energy_cost,
      estimatedTime: "45-90 seconds",
      tips: [
        "Work quickly to build up combo bonuses",
        "Pocket protector gives you a head start",
        "Fill holders completely for maximum satisfaction",
      ],
    };
  }
}
