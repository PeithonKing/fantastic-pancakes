import numpy as np
from perlin_noise import PerlinNoise

def bresenham(x0, y0, x1, y1):
    """Yield integer coordinates on the line from (x0, y0) to (x1, y1).

    Input coordinates should be integers.

    The result will contain both the start and the end point.
    """
    dx = x1 - x0
    dy = y1 - y0

    xsign = 1 if dx > 0 else -1
    ysign = 1 if dy > 0 else -1

    dx = abs(dx)
    dy = abs(dy)

    if dx > dy:
        xx, xy, yx, yy = xsign, 0, 0, ysign
    else:
        dx, dy = dy, dx
        xx, xy, yx, yy = 0, ysign, xsign, 0

    D = 2*dy - dx
    y = 0

    for x in range(dx + 1):
        yield x0 + x*xx + y*yx, y0 + x*xy + y*yy
        if D >= 0:
            y += 1
            D -= 2*dx
        D += 2*dy


class LineSegment:
    def __init__(self, x_max, y_max):
        self.x_max = x_max
        self.y_max = y_max
        np.random.seed(0)
        self.x0 = np.random.rand() * (x_max-1)
        self.y0 = np.random.rand() * (y_max-1)
        self.x1 = np.random.rand() * (x_max-1)
        self.y1 = np.random.rand() * (y_max-1)
        self.noisex0 = PerlinNoise(octaves=3, seed=1)
        self.noisex1 = PerlinNoise(octaves=3, seed=2)
        self.noisey0 = PerlinNoise(octaves=3, seed=3)
        self.noisey1 = PerlinNoise(octaves=3, seed=4)
        self.time = 0

        self.dx = 1
        self.dy = 1
        
        print(self.x0, self.y0, self.x1, self.y1)


    def update(self, alpha=5):
        t = self.time
        
        dx0, dy0 = alpha * self.noisex0(t), alpha * self.noisey0(t)
        dx1, dy1 = alpha * self.noisex1(t), alpha * self.noisey1(t)
        
        self.x0 += dx0
        self.y0 += dy0
        self.x1 += dx1
        self.y1 += dy1
        
        self.time += 0.005


    # def update(self, alpha=1):
        
    #     self.x0 += self.dx * alpha
    #     self.y0 += self.dy * alpha
    #     self.x1 += self.dx * alpha
    #     self.y1 += self.dy * alpha
        
    #     if max(self.x0, self.x1) >= self.x_max - abs(self.dx*alpha) or min(self.x0, self.x1) <= 0 - abs(self.dx*alpha):
    #         self.dx *= -1
    #     if max(self.y0, self.y1) >= self.y_max - abs(self.dy*alpha) or min(self.y0, self.y1) <= 0 - abs(self.dy*alpha):
    #         self.dy *= -1
        
    def get_coordinates(self):
        return int(self.x0), int(self.y0), int(self.x1), int(self.y1)

