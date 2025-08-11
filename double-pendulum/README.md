# Double Pendulum


Python and p5.js implementations of a classic two-link pendulum. The system is simple to write down but quickly becomes chaotic: tiny changes in the initial angles produce very different trajectories.

**Try here:** [peithonking.github.io/fantastic-pancakes/double-pendulum](https://peithonking.github.io/fantastic-pancakes/double-pendulum/)

## Mathematical model (Lagrangian sketch)

Generalized coordinates are the angles from the downward vertical: θ₁, θ₂. Link lengths l₁, l₂; masses m₁, m₂; gravity g.

Kinetic energy

$$
T = \tfrac{1}{2} m_1 (l_1 \dot{\theta}_1)^2 + \tfrac{1}{2} m_2\left[(l_1 \dot{\theta}_1)^2 + (l_2 \dot{\theta}_2)^2 + 2 l_1 l_2 \, \dot{\theta}_1 \dot{\theta}_2 \cos(\theta_1 - \theta_2)\right].
$$

Potential energy (zero at the pivot height)

$$
V = -(m_1 + m_2) g l_1 \cos\theta_1 - m_2 g l_2 \cos\theta_2.
$$

The Lagrangian is $L = T - V$. Applying Euler–Lagrange to $\theta_1, \theta_2$ yields the standard equations of motion used in this code.

## Equations of motion (as implemented)

Let $a_1\equiv\theta_1,\ a_2\equiv\theta_2,\ a_{1v}\equiv\dot{\theta}_1,\ a_{2v}\equiv\dot{\theta}_2,\ a_{1a}\equiv\ddot{\theta}_1,\ a_{2a}\equiv\ddot{\theta}_2$. Then

$$
a_{1a} = \frac{-g(2m_1+m_2)\sin a_1 - m_2 g\sin(a_1-2a_2) - 2 m_2\sin(a_1-a_2)\left(a_{2v}^2 l_2 + a_{1v}^2 l_1\cos(a_1-a_2)\right)}{l_1\left(2m_1+m_2 - m_2\cos(2a_1-2a_2)\right)}
$$

$$
a_{2a} = \frac{2\sin(a_1-a_2)\left(a_{1v}^2 l_1 (m_1+m_2) + g (m_1+m_2)\cos a_1 + a_{2v}^2 l_2 m_2\cos(a_1-a_2)\right)}{l_2\left(2m_1+m_2 - m_2\cos(2a_1-2a_2)\right)}
$$

These match the expressions in both the Python (`double_pendulum.py`) and web (`sketch.js`) versions.

### Optional damping

To model friction/air drag, we add a linear damping term to each equation:

$$
a_{1a} \leftarrow a_{1a} - c\, a_{1v},\qquad a_{2a} \leftarrow a_{2a} - c\, a_{2v},\qquad c\ge 0.
$$

## Numerical integration

Angles are advanced with a simple explicit Euler step each frame (with $\Delta t=1$ frame):

$$
\begin{aligned}
a_{1v} &\leftarrow a_{1v} + a_{1a}\,\Delta t, &\qquad a_{2v} &\leftarrow a_{2v} + a_{2a}\,\Delta t, \\
a_1 &\leftarrow a_1 + a_{1v}\,\Delta t, &\qquad a_2 &\leftarrow a_2 + a_{2v}\,\Delta t.
\end{aligned}
$$

Euler is fine for visuals; higher-order (e.g., RK4 or symplectic) improves energy behavior.

## Coordinates and rendering

With the top pivot at $(c_x, c_y)$, screen coordinates are

$$
\begin{aligned}
x_1 &= c_x + l_1\sin a_1, &\qquad y_1 &= c_y + l_1\cos a_1, \\
x_2 &= x_1 + l_2\sin a_2, &\qquad y_2 &= y_1 + l_2\cos a_2.
\end{aligned}
$$

The web app overlays faint angle arcs (relative to vertical) and a small HUD with angles, velocities, and accelerations.

## Parameters and units

- l₁, l₂ in pixels; m₁, m₂ are unitless scale factors; g is a scalar. Values are chosen for stable, readable visuals rather than strict physical units.
- Damping c ∈ [0, 0.1] in the UI; c = 0 disables damping.

## Files

- `double_pendulum.py` — Python (Pygame)
- `index.html`, `sketch.js`, `styles.css` — Web (p5.js)


---

*This project is part of the fantastic-pancakes collection by [PeithonKing](https://github.com/PeithonKing/fantastic-pancakes).*
