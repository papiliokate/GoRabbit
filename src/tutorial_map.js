export const tutorialMap = [
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'S', ' ', 'N', ' ', 'B>', 'T', 'C', ' ', ' ', 'T', 'W0','T'],
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', ' ', ' ', 'Uv', 'T', ' ', 'T'],
  ['T', 'E', ' ', ' ', ' ', 'W1', 'T', 'T', 'T', 'W0', 'T', ' ', 'T'],
  ['T', ' ', ' ', ' ', ' ', ' ', 'T', ' ', 'T', 'T', 'T', 'N', 'T'],
  ['T', ' ', ' ', ' ', ' ', ' ', 'T', ' ', 'T', 'T', 'T', ' ', 'T'],
  ['T', ' ', ' ', 'M', ' ', ' ', 'T', ' ', 'Pv',' ', ' ', ' ', 'T'],
  ['T', 'T', 'T', 'T', ' ', 'T', 'T', ' ', ' ', ' ', 'T', 'T', 'T'],
  ['T', 'W1', ' ', ' ', 'F^', ' ', 'N', ' ', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T']
];

export const getTutorialTriggers = (isTouch) => [
  { moveCount: 0, 
    msg: isTouch
        ? "Welcome to Go Rabbit!\n\nTap an adjacent empty square to move your Rabbit (🐇).\n\nYour first goal: tap the Nest (🪹) next to you to collect an Egg."
        : "Welcome to Go Rabbit!\n\nLeft-Click on an adjacent empty square to move your Rabbit (🐇).\n\nYour first goal: Left-Click the Nest (🪹) next to you to collect an Egg." },
  { check: (state) => state.eggs > 0 && state.rabbit.x < 5 && state.rabbit.y < 3,
    msg: isTouch
        ? "Great! You picked up an Egg.\n\nEggs are your ammo to solve puzzles. The path is blocked by a Beaver (🦫). Beavers slide forward to destroy Trees (🌲).\n\nTap directly on the Beaver to throw your Egg at it!"
        : "Great! You picked up an Egg.\n\nEggs are your ammo to solve puzzles. The path is blocked by a Beaver (🦫). Beavers slide forward to destroy Trees (🌲).\n\nLeft-Click directly on the Beaver to throw your Egg at it!" },
  { check: (state) => state.grid[1][5] !== 'B>',
    msg: "You cleared the path! Now walk forward and pick up the Lettuce (🥬)." },
  { check: (state) => state.lettuce > 0,
    msg: isTouch
        ? "You picked up Lettuce!\n\nLettuce attracts Turtles (🐢). See the Turtle blocking the path below? Tap on the empty space near you to throw Lettuce. Since the same tap could also be an instruction to move, the game will ask you to choose. Select 'Throw Lettuce', and the Turtle will walk down to eat it!"
        : "You picked up Lettuce!\n\nLettuce attracts Turtles (🐢). See the Turtle blocking the path below? Left-Click on the empty space near you to throw Lettuce. Since the same click could also be an instruction to move, the game will ask you to choose. Select 'Throw Lettuce', and the Turtle will walk down to eat it!" },
  { check: (state) => state.grid[2][9] !== 'Uv',
    msg: "Awesome! You safely lured the Turtle away.\n\nNow walk forward down the clear path." },
  { check: (state) => state.rabbit.x === 9 && state.rabbit.y === 2,
    msg: "Step onto the Warren (🕳️) below you. Your rabbit will run through its warren and come out elsewhere in the forest at the matching colored tunnel." },
  { check: (state) => state.rabbit.x === 11 && state.rabbit.y === 1,
    msg: "You came out of the warren!\n\nHead down the hall and grab the next Egg." },
  { check: (state) => state.eggs > 0 && Math.abs(state.rabbit.x - 11) < 2 && Math.abs(state.rabbit.y - 4) < 2,
    msg: isTouch
        ? "You grabbed another Egg. Head left!\n\nThe path is blocked by a Porcupine (🦔). Porcupines don't slide, but they rotate 90 degrees clockwise when hit by an Egg. They will eat you if you cross their line of sight! \n\nTap on the Porcupine to throw an Egg and make it face away, then walk past it."
        : "You grabbed another Egg. Head left!\n\nThe path is blocked by a Porcupine (🦔). Porcupines don't slide, but they rotate 90 degrees clockwise when hit by an Egg. They will eat you if you cross their line of sight! \n\nLeft-Click to throw an Egg at the Porcupine to make it face away, then walk past it." },
  { check: (state) => state.grid[6][8] !== 'Pv',
    msg: "Nice shot! The Porcupine rotated safely away. Keep following the path down to the next Nest." },
  { check: (state) => state.eggs > 0 && Math.abs(state.rabbit.x - 6) < 2 && Math.abs(state.rabbit.y - 8) < 2,
    msg: isTouch
        ? "You got the final Egg! The corridor is blocked by a Fox (🦊). Unlike Beavers, Foxes don't cut down trees—they slide until they hit a wall. Beware, Foxes will also eat you if you cross their line of sight!\n\nTap on the Fox to throw your Egg and slide it out of the way."
        : "You got the final Egg! The corridor is blocked by a Fox (🦊). Unlike Beavers, Foxes don't cut down trees—they slide until they hit a wall. Beware, Foxes will also eat you if you cross their line of sight!\n\nLeft-Click to throw your Egg at the Fox to slide it out of the way." },
  { check: (state) => state.grid[8][4] !== 'F^',
    msg: "You slid the Fox away! Step onto the next Warren (🕳️) to run to the final room." },
  { check: (state) => state.rabbit.x === 5 && state.rabbit.y === 3,
    msg: "You safely ran through the warren into the final room!\n\nWatch out: There is a Bear (🐻) nearby. Bears don't move, but if you step directly next to them (including diagonally), you will get eaten! Walk a wide path safely around it to reach the Door (🚪)." },
  { check: (state) => state.win === true,
    msg: "Congratulations, you won the tutorial!\n\nYou're ready to play Go Rabbit!" }
];

