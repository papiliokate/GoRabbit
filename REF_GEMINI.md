# Project Map: Go Rabbit

This file serves as a persistent context guide for the AI Assistant (Gemini) to minimize token usage by avoiding redundant codebase exploration.

## 🐇 Core Game: Go Rabbit
- **Type**: Grid-based isometric puzzle game.
- **Tech**: Vanilla JavaScript, Vite, CSS Grid, Firebase (Hosting).

## 🗺️ File Structure
- `src/game.js`: Main engine. Handles `GameMode`, level generation, movement, and entity behaviors.
- `src/style.css`: Styling for the isometric view and entity sprites.
- `index.html`: Base container.
- `firebase.json`: Deployment config.

## 🧩 Key Mechanics
- **Grid Entities**:
  - `R`: Rabbit (Player)
  - `T`: Tree (Impassable)
  - `L`: Log (Impassable)
  - `M`: Bear (Kills if adjacent)
  - `F`: Fox (Kills if in line-of-sight)
  - `P`: Porcupine (Shoots quills in LOS)
  - `N`: Nest (Collectible Eggs)
  - `W`: Warren (Teleporters)
  - `E`: Exit (Goal)
- **Input**: `WASD` for movement, `Right-Click` to throw eggs at hazards.
- **UI**: Buttons for **Easy**, **Medium**, **Hard**, and **Reset** (to restart the current level).

## 🛠️ Development Rules
- **Visuals First**: Always auto-launch the browser (`npm run dev -- --open`) when making visual changes.
- **Token Saving**: 
  - Consult this file before running `list_dir` or `grep_search`.
  - Use `Gemini 1.5 Flash` for routine code changes.
  - Summarize session progress here to keep context windows lean.

## 🚀 Active Goals
1. Transitioning from ASCII-style sprites to more polished billboards.
2. Refining isometric perspective logic.
