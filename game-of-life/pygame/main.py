import numpy as np
import pygame
import time
from utils import conv2d

COLOR_DIE = (0, 0, 0)
COLOR_ALIVE = (255, 255, 255)

def update(screen, cells, size):
    for i in range(cells.shape[0]):
        for j in range(cells.shape[1]):
            if cells[i, j] == 1:
                pygame.draw.rect(screen, COLOR_ALIVE, (j * size, i * size, size, size))
            elif cells[i, j] == 0:
                pygame.draw.rect(screen, COLOR_DIE, (j * size, i * size, size, size))
            else:
                raise ValueError(f'Disaster happened! Earth will be destroyed! {cells[i, j] = }')

def main():
    pygame.init()
    pygame.display.set_caption("Game of Life")
    WIDTH = 800
    HEIGHT = 600
    SIZE = 10
    show_fps = True
    init_stage = "random" # "blank", "random", name of a file
    init_stage = "spaceship1" # "blank", "random", name of a file
    save_path = "saved_states"
    # Uncomment the following lines to generate a random initial state
    # cells = np.zeros((HEIGHT//SIZE, WIDTH//SIZE))
    # cells = np.random.randint(0, 2, cells.shape)
    # cells = np.load(f'save_{WIDTH}_{HEIGHT}_{SIZE}.npy')
    if init_stage == "blank":
        cells = np.zeros((HEIGHT//SIZE, WIDTH//SIZE))
    elif init_stage == "random":
        cells = np.random.randint(0, 2, (HEIGHT//SIZE, WIDTH//SIZE))
    else:
        filename = f'{save_path}/{init_stage}_{WIDTH}_{HEIGHT}_{SIZE}.npy'
        try: cells = np.load(filename)
        except: raise ValueError(f'File {filename} does not exist')
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    screen.fill(COLOR_DIE)
    update(screen, cells, SIZE)
    pygame.display.flip()
    pygame.display.update()

    running = False
    if init_stage != "blank" and init_stage != "random":
        running = True

    if show_fps:
        t0 = time.time()
        i = 0

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                    
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE: # when `space` is pressed
                    running = not running
                    update(screen, cells, SIZE)
                    pygame.display.update()
                # if `s` is pressed, save the current state of the
                # game to a file named `save_<width>_<height>_<size>.npy`
                if event.key == pygame.K_s:
                    np.save(f'{save_path}/save_{WIDTH}_{HEIGHT}_{SIZE}.npy', cells)
            
            elif pygame.mouse.get_pressed()[0]:
                x, y = pygame.mouse.get_pos()
                x, y = x // SIZE, y // SIZE
                cells[y, x] = 1 - cells[y, x]
                update(screen, cells, SIZE)
                pygame.display.update()
                        
        screen.fill(COLOR_DIE)    
        
        if running:
            cells = conv2d(cells)
            update(screen, cells, SIZE)
            pygame.display.update()
        # elif show_fps:
        #     time.sleep(0.03)

        if show_fps:
            i += 1
            if time.time() - t0 >= 1:
                print(f'FPS: {i}')
                i = 0
                t0 = time.time()

if __name__ == '__main__':
    main()