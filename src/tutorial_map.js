export const tutorialMap = [
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'S', ' ', ' ', 'T', ' ', ' ', ' ', ' ', 'E', 'T'],
  ['T', ' ', ' ', ' ', 'T', ' ', 'Fv',' ', ' ', ' ', 'T'],
  ['T', ' ', 'N', ' ', 'T', ' ', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'T', 'T', 'Bv','T', ' ', ' ', ' ', ' ', ' ', 'T'],
  ['T', ' ', ' ', 'T', 'T', 'T', 'T', 'T', 'T', ' ', 'T'],
  ['T', 'W', ' ', ' ', 'T', ' ', ' ', ' ', 'M', ' ', 'T'],
  ['T', ' ', ' ', ' ', 'T', ' ', ' ', ' ', ' ', ' ', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'W', ' ', 'N', ' ', ' ', 'T'],
  ['T', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T']
];

export const tutorialTriggers = [
  { moveCount: 0, 
    msg: "Welcome to Go Rabbit!\n\nUse W/A/S/D to move your Rabbit (🐇) around the map.\n\nYour first goal: walk onto the Nest (🪹) below you to collect an Egg." },
  { check: (state) => state.eggs > 0 && state.rabbit.x < 4 && state.rabbit.y < 5,
    msg: "Great! You picked up an Egg.\n\nEggs are your ammo to solve puzzles. See the Beaver (🦫) at the bottom right blocking the path? Beavers slide forward to destroy Trees (🌲).\n\nClick directly on the Beaver to throw your Egg at it!" },
  { check: (state) => state.rabbit.x === 1 && state.rabbit.y === 6,
    msg: "You cleared the path!\n\nYou've stepped onto a Warren (🕳️). Warrens are tunnels that instantly teleport you to their matching partner on the map." },
  { check: (state) => state.rabbit.x > 4 && state.rabbit.y > 5,
    msg: "You just teleported through the Warren!\n\nWatch out: There is a Bear (🐻) nearby. Bears don't move, but if you step directly next to them (including diagonally), you will get eaten! Walk carefully around it." },
  { check: (state) => state.eggs > 0 && state.rabbit.x > 4 && state.rabbit.y > 5,
    msg: "You grabbed your second Egg.\n\nHead north. The final corridor is blocked by a Fox (🦊). Unlike Beavers, Foxes don't cut down trees—they just slide until they hit a wall. Also beware, Foxes will eat you if you cross their line of sight! Throw your Egg at the Fox to slide it out of the way." },
  { check: (state) => state.rabbit.y < 3 && state.rabbit.x > 4,
    msg: "Awesome! You slid the Fox away and navigated out of its sightline.\n\nStep onto the Door (🚪) to win the tutorial!" }
];
