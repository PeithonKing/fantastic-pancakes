let ball;
let k = 50; // You can change k to any value you want
let GRAVITY; // gravity vector, will be initialized in setup()
let rings = [];

function setup() {
    createCanvas(9 * k, 16 * k);
    frameRate(60); // Force FPS to 30
    background(34);
    GRAVITY = createVector(0, -3); // gravity vector, downward
    // Place ball near top center, random initial velocity, gravity acceleration
    let angle = random(0, TWO_PI);
    let vx = 15 * cos(angle);
    let vy = 15 * sin(angle);
    ball = new Ball(0, 50, vx, vy, color(255, 255, 255));
    for (let life = 7; life > 0; life--) {
        console.log(life);
        ring = new Ring(
            radius = 200 - life * 10,
            life = life,
            speed = 0.5 + life * 0.2
        );
        rings.push(ring);
    }
}

function draw() {
    background(34);
    translate(width/2, height/2);
    scale(1, -1);
    ball.update(deltaTime);
    // Ball-ring collision and bounce
    for (let ring of rings) {
        if (ring.life > 0 && ring.collidesWith(ball)) {
            // Calculate normal direction (radial)
            let normal = ball.pos.copy().normalize();
            // Reflect velocity about normal
            let vDotN = ball.vel.dot(normal);
            ball.vel.sub(p5.Vector.mult(normal, 2 * vDotN));
            // Move ball just outside the ring to prevent sticking
            // ball.pos = p5.Vector.mult(normal, ring.radius + ball.radius - 1);
            // Reduce ring life
            ring.life = max(0, ring.life - 1);
            // if ring life is 0, delete it
            if (ring.life === 0) {
                rings.splice(rings.indexOf(ring), 1);
            }
            break;
        }
    }
    ball.draw();
    for (let ring of rings) {
        ring.update(deltaTime);
        ring.draw();
    }
    console.log(1000/deltaTime);
}


// Ball class definition
class Ball {
    constructor(x, y, vx, vy, color) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.color = color;
        this.radius = 15;
    }

    update(dt) {
        dt /= 100;
        this.vel.add(p5.Vector.mult(GRAVITY, dt));
        this.pos.add(p5.Vector.mult(this.vel, dt));
    }

    draw() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }
}


// Ring class definition
class Ring {
    constructor(radius, life=7, speed=1) {
        this.radius = radius;
        this.sublife = 1; // number of sublifes per life
        this.life = life * this.sublife; // total life
        this.angle = 0*PI/180; // current rotation angle
        this.speed = speed; // angular speed (radians per ms)
        this.openingSize = 90*PI/180; // opening size in radians (e.g., 60 degrees)
    }

    getColor() {
        // VIBGYOR color mapping
        const colors = [
            color(148, 0, 211),   // Violet (7)
            color(75, 0, 130),    // Indigo (6)
            color(0, 0, 255),     // Blue (5)
            color(0, 255, 0),     // Green (4)
            color(255, 255, 0),   // Yellow (3)
            color(255, 127, 0),   // Orange (2)
            color(255, 0, 0),      // Red (1)
            color(34, 34, 34)      // Black (0)
        ];
        // Determine color index based on current life
        let colorIdx = constrain(Math.ceil(this.life / this.sublife), 0, 7);
        return colors[7 - colorIdx];
    }

    update(dt) {
        // Rotate the ring
        this.angle += this.speed * dt / 1000;
        this.angle %= TWO_PI;
    }

    draw() {
        noFill();
        stroke(this.getColor());
        strokeWeight(4);
        // Draw arc for ring with opening
        let start = this.angle;
        let end = (this.angle + TWO_PI - this.openingSize) % TWO_PI;
        arc(0, 0, this.radius * 2, this.radius * 2, start, end);
    }

    // Returns true if the ball collides with the ring (excluding the opening)
    collidesWith(ball) {
        // Ball's position in polar coordinates
        let r = ball.pos.mag();
        let theta = atan2(ball.pos.y, ball.pos.x);
        theta = (theta + TWO_PI) % TWO_PI;
        // Check if ball is within ring's thickness (approximate as a thin ring)
        let withinRing = abs(r - this.radius) < (ball.radius * 1.5);
        // Check if ball is inside the opening
        let gap = 0*PI/180;
        let openingStart = (this.angle + TWO_PI - this.openingSize + gap) % TWO_PI;
        let openingEnd = this.angle - gap;
        // console.log(openingStart*180/PI, openingEnd*180/PI, theta*180/PI);
        let inOpening = false;
        if (openingStart < openingEnd) {
            inOpening = theta >= openingStart && theta <= openingEnd;
        } else {
            inOpening = theta >= openingStart || theta <= openingEnd;
        }
        return withinRing && !inOpening;
    }
}
