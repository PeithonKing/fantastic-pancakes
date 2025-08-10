# Game of Life

**Try the web version:** [peithonking.github.io/fantastic-pancakes/game_of_life](https://peithonking.github.io/fantastic-pancakes/game_of_life/)

(These rules have been taken from [Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules). Visit the link for more information)

The Game of Life, created by British mathematician John Horton Conway in 1970, is a cellular automaton. It's a zero-player game where initial state determines evolution. It's interactive by creating an initial configuration and observing its evolution. Turing complete, simulating universal constructors and Turing machines.

Game of Life universe: infinite 2D grid, cells alive or dead. Each cell interacts with 8 neighbors, horizontal, vertical, diagonal. Steps involve transitions at each time step. The rules are as follows:

1. Live cell with <2 or >3 neighbors dies.
2. Live cell with 2 or 3 neighbors survives.
3. Dead cell with 3 neighbors revives.

## Web version (p5.js)

- Interactive grid: click or drag to toggle cells.
- Adjust grid size, speed, and fill using the controls.
- Start, pause, randomize, or clear the simulation with buttons.
- See generation count and FPS in real time.

## Python version

See [pygame/README.md](https://github.com/PeithonKing/fantastic-pancakes/tree/main/game-of-life/pygame/README.md) for all instructions, controls, and advanced options for the Python (PyGame) version.
