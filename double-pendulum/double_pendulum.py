import pygame  # noqa: D100
import math

# Constants
l1 = 200  # length of first pendulum
l2 = 200  # length of second pendulum
m1 = 1  # mass of first pendulum excluding weight of string
m2 = 1  # mass of second pendulum excluding weight of string
a1 = math.pi / 2  # angle formed by first pendulum and normal - angle1
a2 = math.pi / 8  # angle formed by second pendulum and normal - angle2
a1_v = 0  # angular velocity of pendulum1
a2_v = 0  # angular velocity of pendulum2
g = 1  # gravitational constant (realistic value not considered for simplicity)

px2 = None  # previous position of second pendulum sphere - x offset
py2 = None  # previous position of second pendulum sphere - y offset
cx, cy = 450, 50  # center of x and y for background

mr = 5  # mass - radius scale factor
width, height = 900, 600
BLACK = (0, 0, 0)

# Pygame initialization
pygame.init()
screen = pygame.display.set_mode((width, height))
clock = pygame.time.Clock()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Calculate acceleration using double pendulum equations
    num1 = -g * (2 * m1 + m2) * math.sin(a1)
    num2 = -m2 * g * math.sin(a1 - 2 * a2)
    num3 = -2 * math.sin(a1 - a2) * m2
    num4 = a2_v * a2_v * l2 + a1_v * a1_v * l1 * math.cos(a1 - a2)
    den = l1 * (2 * m1 + m2 - m2 * math.cos(2 * a1 - 2 * a2))
    a1_a = (num1 + num2 + num3 * num4) / den

    num1 = 2 * math.sin(a1 - a2)
    num2 = (a1_v * a1_v * l1 * (m1 + m2))
    num3 = g * (m1 + m2) * math.cos(a1)
    num4 = a2_v * a2_v * l2 * m2 * math.cos(a1 - a2)
    den = l2 * (2 * m1 + m2 - m2 * math.cos(2 * a1 - 2 * a2))
    a2_a = (num1 * (num2 + num3 + num4)) / den

    screen.fill((255, 255, 255))

    # Calculate pendulum positions
    x1 = cx + l1 * math.sin(a1)
    y1 = cy + l1 * math.cos(a1)

    x2 = x1 + l2 * math.sin(a2)
    y2 = y1 + l2 * math.cos(a2)

    # Draw pendulum
    pygame.draw.line(screen, BLACK, (cx, cy), (int(x1), int(y1)), 2)
    pygame.draw.circle(screen, BLACK, (int(x1), int(y1)), m1*mr)

    pygame.draw.line(screen, BLACK, (int(x1), int(y1)), (int(x2), int(y2)), 2)
    pygame.draw.circle(screen, BLACK, (int(x2), int(y2)), m2*mr)

    # Update angles and angular velocities
    a1_v += a1_a
    a2_v += a2_a
    a1 += a1_v
    a2 += a2_v

    px2 = x2
    py2 = y2

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
