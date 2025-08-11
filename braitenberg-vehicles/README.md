# Braitenberg Vehicles Simulation

**Try the web version:** [peithonking.github.io/fantastic-pancakes/braitenberg-vehicles](https://peithonking.github.io/fantastic-pancakes/braitenberg-vehicles/)

Inspired by [Braitenberg vehicles](https://www.usna.edu/Users/cs/crabbe/SI475/current/vehicles.pdf), this interactive simulation lets you explore the emergent behaviors of simple sensorimotor agents. The project focuses on vehicles 2a, 2b, 3a, and 3b, demonstrating how basic wiring between sensors and motors can produce lifelike, purposeful movement.

## What are Braitenberg Vehicles?
Braitenberg vehicles are thought experiments introduced by Valentino Braitenberg in his 1984 book "Vehicles: Experiments in Synthetic Psychology." These are simple robots with sensors (e.g., light sensors) and motors, where the wiring between them determines the vehicle's behavior. Despite their simplicity, these vehicles can exhibit surprisingly complex and lifelike behaviors such as aggression, fear, love, and exploration.

- **Vehicle 2a (Direct Excitatory):** Each sensor is connected to the motor on the same side, and more stimulus increases speed (e.g., both sensors excite their own-side motor).
- **Vehicle 2b (Crossed Excitatory):** Each sensor is connected to the opposite-side motor, and more stimulus increases speed (e.g., left sensor excites right motor).
- **Vehicle 3a (Direct Inhibitory):** Each sensor inhibits its own-side motor (more stimulus slows that side).
- **Vehicle 3b (Crossed Inhibitory):** Each sensor inhibits the opposite-side motor (more stimulus slows the opposite side).

## Features
- **Interactive UI:**
  - Choose connection mode: Direct or Crossed
  - Choose connection strength: Excite or Inhibit
  - Place light sources and vehicles interactively on the canvas
  - Start, pause, and reset the simulation
- **Realistic vehicle behavior:**
  - Vehicles respond to light sources according to the selected wiring
  - Vehicles can be added or removed dynamically
- **Mobile-friendly design**

## How the Simulation Works

### Vehicle Sensing and Movement
- Each vehicle has two sensors (left and right) that detect the strength of nearby light sources.
- The strength of a stimulus from a light source is calculated using an **inverse-square law**.
- The sensors are directional: a light source to the left of the vehicle affects the left sensor, and vice versa.
- The wiring (direct/crossed, excite/inhibit) determines how sensor readings affect the left and right wheel speeds.

### Noise and Realism
- To simulate real-world sensor noise, **smooth Perlin noise** is added to each sensor reading. This makes the vehicle's movement less deterministic and more lifelike.

### Kinematics

- The vehicle's position is updated by moving forward according to the average of the left and right wheel speeds. If \( s_l \) and \( s_r \) are the left and right wheel speeds, the forward velocity is:
  \[
  v = \frac{s_l + s_r}{2}
  \]
  The new position is calculated by moving in the direction the vehicle is facing:
  \[
  \vec{p}_{\text{new}} = \vec{p}_{\text{old}} + v \cdot \vec{f}
  \]
  where \( \vec{f} \) is the unit vector in the direction of the current heading angle \( \theta \).

- The angle (heading) is updated based on the difference between the left and right wheel speeds, simulating differential drive kinematics. The change in angle is:
  \[
  \Delta \theta = \frac{s_l - s_r}{d}
  \]
  where \( d \) is the distance between the wheels. The new heading is:
  \[
  \theta_{\text{new}} = \theta_{\text{old}} + \Delta \theta
  \]

- Vehicles wrap around the canvas edges (periodic boundary conditions), so if a vehicle moves beyond one edge, it reappears on the opposite side.


## How to Use
1. **Select Connection:** Choose Direct or Crossed wiring.
2. **Select Strength:** Choose Excite (stimulus increases speed) or Inhibit (stimulus decreases speed).
3. **Place Lights:** Click "Place Lights" and then click on the canvas to add yellow light sources.
4. **Place Vehicles:** Click "Place Vehicles" and left-click to add vehicles, right-click to remove them.
5. **Start Simulation:** Click "Start Simulation" to watch the vehicles move and interact with the lights.

## References
- [Wikipedia: Braitenberg vehicle](https://en.wikipedia.org/wiki/Braitenberg_vehicle)
- [Valentino Braitenberg, "Vehicles: Experiments in Synthetic Psychology" (1984)](https://www.usna.edu/Users/cs/crabbe/SI475/current/vehicles.pdf)

---

*This project is part of the fantastic-pancakes collection by [PeithonKing](https://github.com/PeithonKing/fantastic-pancakes).*
