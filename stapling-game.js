// Stapling Minigame Module
class StaplingGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.clicksRemaining = CONFIG.minigames.stapling.required_clicks;
    this.isActive = false;
    this.startTime = null;

    this.init();
  }

  init() {
    this.container.innerHTML = "";
    this.container.className = "minigame-container";

    // Create task instruction
    const instruction = document.createElement("div");
    instruction.className = "task-instruction";
    instruction.textContent = "Click to staple papers!";
    this.container.appendChild(instruction);

    // Create stapling area
    const staplingArea = document.createElement("div");
    staplingArea.className = "stapling-area";

    // Add office desk background
    const deskBg = this.createImageWithFallback(
      CONFIG.assets.office_desk,
      "office-desk"
    );
    staplingArea.appendChild(deskBg);

    // Create papers stack (no click handler - must hit moving stapler)
    const papersStack = this.createImageWithFallback(
      CONFIG.assets.papers_stack,
      "papers-stack"
    );
    staplingArea.appendChild(papersStack);

    // Create moving stapler cursor
    const staplerCursor = document.createElement("div");
    staplerCursor.className = "stapler-cursor";
    staplerCursor.style.left = "50px";
    staplerCursor.style.top = "50px";

    // Add stapler image
    const staplerImg = this.createImageWithFallback(CONFIG.assets.stapler);
    staplerCursor.appendChild(staplerImg);
    staplerCursor.addEventListener("click", () => this.handleStaplerClick());

    staplingArea.appendChild(staplerCursor);

    // Create progress display
    const progress = document.createElement("div");
    progress.className = "staple-progress";
    progress.textContent = `Papers to staple: ${this.clicksRemaining}`;
    staplingArea.appendChild(progress);

    this.container.appendChild(staplingArea);
    this.progressElement = progress;

    // Start the minigame
    this.start();
  }

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

  start() {
    this.isActive = true;
    this.startTime = Date.now();
    this.startStaplerMovement();
  }

  startStaplerMovement() {
    const staplerCursor = this.container.querySelector(".stapler-cursor");
    if (!staplerCursor) return;

    let direction = 1;
    let position = 50;
    const speed = CONFIG.minigames.stapling.stapler_speed || 1.5; // Slower speed
    const bounds = { min: 20, max: 320 };

    const moveStapler = () => {
      if (!this.isActive) return;

      position += direction * speed;

      // Bounce off edges
      if (position >= bounds.max || position <= bounds.min) {
        direction *= -1;
      }

      staplerCursor.style.left = position + "px";

      requestAnimationFrame(moveStapler);
    };

    moveStapler();
  }

  handleStaplerClick() {
    if (!this.isActive) return;

    const staplerCursor = this.container.querySelector(".stapler-cursor");
    const papersStack = this.container.querySelector(".papers-stack");

    if (!staplerCursor || !papersStack) return;

    // Get positions
    const staplerRect = staplerCursor.getBoundingClientRect();
    const papersRect = papersStack.getBoundingClientRect();

    // Check if stapler is over papers (with some tolerance)
    const tolerance = 40; // Slightly smaller tolerance for more difficulty
    const staplerCenter = staplerRect.left + staplerRect.width / 2;
    const papersCenter = papersRect.left + papersRect.width / 2;
    const distance = Math.abs(staplerCenter - papersCenter);

    if (distance <= tolerance) {
      // Success!
      this.handleSuccessfulStaple();
    } else {
      // Miss - show feedback but don't count
      this.showMissFeedback();
    }
  }

  handleSuccessfulStaple() {
    this.clicksRemaining--;
    this.progressElement.textContent = `Papers to staple: ${this.clicksRemaining}`;

    // Add success feedback
    this.showClickFeedback("✓", "#00ff00");

    if (this.clicksRemaining <= 0) {
      this.complete();
    }
  }

  showMissFeedback() {
    this.showClickFeedback("✗", "#ff0000");
  }

  showClickFeedback(symbol = "✓", color = "#00ff00") {
    const feedback = document.createElement("div");
    feedback.textContent = "✓";
    feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-size: 2em;
            font-weight: bold;
            pointer-events: none;
            z-index: 20;
            animation: fadeUpOut 0.8s ease-out forwards;
        `;

    // Add keyframe animation
    if (!document.querySelector("#stapling-feedback-style")) {
      const style = document.createElement("style");
      style.id = "stapling-feedback-style";
      style.textContent = `
                @keyframes fadeUpOut {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -70%) scale(1.5); }
                }
            `;
      document.head.appendChild(style);
    }

    this.container.appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);
  }

  complete() {
    this.isActive = false;
    const completionTime = (Date.now() - this.startTime) / 1000; // in seconds

    // Show completion message
    const completion = document.createElement("div");
    completion.className = "task-instruction";
    completion.textContent = "Task Complete!";
    completion.style.color = "#00ff00";
    this.container.appendChild(completion);

    // Call completion callback after a brief delay
    setTimeout(() => {
      this.onComplete({
        taskType: "stapling",
        completionTime: completionTime,
        success: true,
      });
    }, 1000);
  }

  // Cleanup method
  destroy() {
    this.isActive = false;
    this.container.innerHTML = "";
  }

  // Static method to check if task is available
  static isAvailable() {
    return true; // Stapling is always available
  }

  // Static method to get task info
  static getTaskInfo() {
    return {
      name: "Staple Papers",
      description: "Click to staple documents together",
      energyCost: CONFIG.minigames.stapling.base_energy_cost,
      estimatedTime: "30-60 seconds",
    };
  }
}
