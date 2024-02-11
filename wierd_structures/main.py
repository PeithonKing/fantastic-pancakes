import pygame
import numpy as np
import time
from utils import bresenham, LineSegment

# Initialize Pygame
pygame.init()

# Set the dimensions of the screen
screen_width = 1600
screen_height = 1200

x_res = screen_width // 5
y_res = screen_height // 5

screen = pygame.display.set_mode((screen_width, screen_height))

def show_matrix(array: np.ndarray) -> pygame.Surface:
    if screen_width % array.shape[1] or screen_height % array.shape[0]:
        raise ValueError("The array shape must be a multiple of the screen size")
    pixel_size = screen_width // array.shape[1], screen_height // array.shape[0]
    ones = np.ones(pixel_size, dtype=np.bool_)
    image = np.kron(array*255, ones)
    image =  pygame.surfarray.make_surface(image.T)
    screen.blit(image, (0, 0))

def apply_line(matrix, x0, y0, x1, y1):
    for x, y in bresenham(x0, y0, x1, y1):
        matrix[y%y_res, x%x_res] = 1 - matrix[y%y_res, x%x_res]
    
    return matrix


matrix = np.random.randint(0, 2, (y_res, x_res))
# matrix = np.zeros((y_res, x_res))

line = LineSegment(x_res, y_res)

# Game loop
running = True

paused = False

show_matrix(matrix)
pygame.display.flip()

while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                paused = not paused

    if not paused:
        apply_line(matrix, *line.get_coordinates())
        show_matrix(matrix)
        line.update(5)
    

    pygame.display.flip()  # Update the screen
    # time.sleep(0.05)  # Introduce a delay to maintain the frame rate

pygame.quit()
