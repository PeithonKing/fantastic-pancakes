# Game of Life

Here is an implementation for the **Conways Game of Life** in Python using [PyGame](https://www.pygame.org/news) library.

## Rules

(These rules have been taken from [Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules). Visit the link for more information)

The Game of Life, created by British mathematician John Horton Conway in 1970, is a cellular automaton. It's a zero-player game where initial state determines evolution. It's interactive by creating an initial configuration and observing its evolution. Turing complete, simulating universal constructors and Turing machines.

Game of Life universe: infinite 2D grid, cells alive or dead. Each cell interacts with 8 neighbors, horizontal, vertical, diagonal. Steps involve transitions at each time step. The rules are as follows:

1. Live cell with <2 or >3 neighbors dies.
2. Live cell with 2 or 3 neighbors survives.
3. Dead cell with 3 neighbors revives.

## How to run

1. Clone the repository: `git clone www.github.com/PeithonKing/game_of_life.git`
2. *(Optional)* Create a virtual environment: `python -m venv venv`
3. *(Optional)* Activate the virtual environment: `source venv/bin/activate`
4. Change directory to the repository: `cd game_of_life`
5. Install the dependencies: `pip install -r requirements.txt`
6. Run the program: `python main.py`

**Note:** If you are doing the optional steps, you have to do all the optional steps. All or none.

## How to play

1. White cells are alive, black cells are dead. You will be provided with an all dead grid to start with.
2. Click on the cells to make them alive or dead. You can also drag the mouse to make multiple cells alive or dead at once.
3. Press `space` to start the simulation.
4. You can press `space` again to pause the simulation to make changes before starting again by hitting `space`.
5. You can also make the cells alive or dead while the simulation is running.
6. Press `s` to save the current state of the grid to a file called `f'save_{WIDTH}_{HEIGHT}_{SIZE}.npy'` where `WIDTH` and `HEIGHT` are the dimensions of the grid and `SIZE` is the size of each cell in pixels. You are expected to replace the `save` with a meaningful name after this.
7. In `main.py` you can change the `WIDTH`, `HEIGHT` and `SIZE` variables to change the dimensions of the grid and the size of each cell.
8. You can also change the `show_fps` variable to turn on or off the fps printing on the terminal.
9. The `init_stage` variable can take one of these 3 values:
	- **'blank'**: Generates a blank grid with all dead cells.
	- **'random'**: Randomly generates the initial state of the grid.
	- **name**: Loads the grid from the file `f'{name}_{WIDTH}_{HEIGHT}_{SIZE}.npy'`.