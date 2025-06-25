// Game Configuration
const CONFIG = {
  // Energy System
  energy: {
    starting_energy: 3,
    drain_rate: 0.1, // energy per second
    max_energy: 10,
  },

  // Economic System
  economy: {
    starting_money: 0,
    day_1_salary: 100,
    newspaper_costs: {
      free_tabloid: 0,
      business_times: 200,
    },
  },

  // Newspapers and Jobs
  newspapers: {
    free_tabloid: {
      name: "Daily Gossip Rag",
      cost: 0,
      jobs: [
        {
          title: "Temp Office Worker",
          company: "Yamada Logistics",
          salary: 100,
          hours: 2,
          tasks: ["stapling", "pen_refill"],
        },
      ],
    },
    business_times: {
      name: "Business Weekly",
      cost: 200,
      locked_message: "Better jobs inside! (Need ¥200)",
      jobs: [
        {
          title: "Junior Analyst",
          company: "Sakura Corp",
          salary: 200,
          hours: 3,
          tasks: ["stapling", "pen_refill", "typing"],
        },
      ],
    },
  },

  // Shop Items
  shop_items: {
    pocket_protector: {
      name: "Pocket Protector",
      cost: 25,
      description: "Start pen tasks with 1 pen pre-filled",
      effect: "pen_task_bonus",
      image: "images/pocket_protector.png",
    },
  },

  // Gene Modifications
  gene_modifications: {
    basic_stamina: {
      name: "Enhanced Stamina Genes",
      cost: 75,
      description: "Your children will have +1 Energy",
      effect: "child_energy_bonus",
      bonus: 1,
      permanent: true,
      image: "images/gene_stamina.png",
    },
  },

  // Day Progression
  day_progression: {
    day_1: { hours: 2, difficulty: 1.0 },
    day_2: { hours: 5, difficulty: 1.2 },
    day_3: { hours: 7, difficulty: 1.5 },
  },

  // Minigame Settings
  minigames: {
    stapling: {
      required_clicks: 15, // Increased from 5
      base_energy_cost: 1,
      success_threshold: 0.8,
      stapler_speed: 1.5, // Slower movement for more difficulty
      miss_penalty: true, // Misses don't count toward progress
    },
    pen_refill: {
      required_pens: 12, // Increased from 4
      base_energy_cost: 2,
      holders_count: 4, // Increased from 2 - more holders to fill
      pens_per_holder: 3, // Each holder needs 3 pens to be full
    },
  },

  // Asset Management
  assets: {
    // UI Elements
    energy_bar_full: "images/energy_bar_full.png",
    energy_bar_empty: "images/energy_bar_empty.png",
    yen_coin: "images/yen_coin.png",

    // Work Environment
    newspaper: "images/newspaper.png",
    office_desk: "images/office_desk.png",
    papers_stack: "images/papers_stack.png",
    stapler: "images/stapler.png",
    pen_box: "images/pen_box.png",
    pen_holder: "images/pen_holder.png",
    pen: "images/pen.png",

    // Train Station
    train_station: "images/train_station.png",
    vending_machine: "images/vending_machine.png",
    gene_booth: "images/gene_booth.png",

    // Characters
    character_tired: "images/character_tired.png",
    character_child: "images/character_child.png",
    train: "images/train.png",

    // Effects
    placeholder: "images/placeholder.png",
    success_checkmark: "images/success_checkmark.png",
  },
};
