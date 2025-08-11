// Periodic boundary condition utility
function applyPBC(val, lower, upper) {
    const range = upper - lower;
    return ((val - lower) % range + range) % range + lower;
}
// render.js
// Contains all p5.js and rendering related code: setup, draw, classes, and mouse events

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    // Get UI elements
    modeDirectRadio = select('#mode-direct');
    modeCrossedRadio = select('#mode-crossed');
    polarityInhibitRadio = select('#polarity-inhibit');
    polarityExciteRadio = select('#polarity-excite');
    placeLightsBtn = select('#place-lights');
    placeVehiclesBtn = select('#place-vehicles');
    startSimBtn = select('#start-simulation');
    // Set up event listeners
    setupEventListeners();
    updateConnectionToggles();

    frameRate(60);
}

// Attach UI event handlers once elements are selected
function setupEventListeners() {
    // Mode radio buttons
    modeDirectRadio.changed(function () {
        mode = 'direct';
        updateConnectionToggles();
    });
    
    modeCrossedRadio.changed(function () {
        mode = 'crossed';
        updateConnectionToggles();
    });

    // Polarity radio buttons
    polarityInhibitRadio.changed(() => { updateConnectionStrengths(); });
    polarityExciteRadio.changed(() => { updateConnectionStrengths(); });

    // Action buttons
    placeLightsBtn.mousePressed(() => toggleTool('lights'));
    placeVehiclesBtn.mousePressed(() => toggleTool('vehicles'));
    startSimBtn.mousePressed(toggleSimulation);

    // Initialize UI
    updateButtonStates();
    updateConnectionStrengths();
}

function mousePressed(event) {
    if (event.button === 2) { // Right click
        event.preventDefault();
        if (currentTool === 'vehicles') {
            removeVehicleAt(mouseX, mouseY);
        } else if (currentTool === 'lights') {
            removeLightAt(mouseX, mouseY);
        }
        return false;
    }
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
    if (currentTool === 'lights') {
        lights.push(new Light(mouseX, mouseY));
    } else if (currentTool === 'vehicles') {
        vehicles.push(new Vehicle(mouseX, mouseY));
    }
}

function draw() {
    background(20, 25, 45);
    // Draw lights
    for (let light of lights) {
        light.display();
    }
    // Update and draw vehicles
    for (let vehicle of vehicles) {
        if (simulationRunning) {
            vehicle.update(lights, connectionStrengths);
        }
        vehicle.display();
    }
    // Draw cursor indicator
    if (currentTool === 'lights') {
        stroke(255, 255, 0);
        noFill();
        circle(mouseX, mouseY, 30);
    } else if (currentTool === 'vehicles') {
        stroke(0, 255, 0);
        noFill();
        circle(mouseX, mouseY, 25);
    }
}

class Light {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.intensity = 100;
    }
    display() {
        // Glow effect
        for (let i = 3; i > 0; i--) {
            fill(255, 255, 0, 30 / i);
            noStroke();
            circle(this.pos.x, this.pos.y, this.intensity * i * 0.3);
        }
        // Main light
        fill(255, 255, 0);
        noStroke();
        circle(this.pos.x, this.pos.y, 15);
    }
}

class Vehicle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.angle = random(TWO_PI); // Facing as angle (radians)
        this.size = 20;
        this.d = 10; // wheelbase/size scalar
        this.k = 2.0; // strength scaling constant
        // Perlin noise parameters for sensor jitter
        this.noiseOffset = random(1000);
        this.noiseStep = 0.01;
        this.noiseAmp = 0.1;
        // this.lastSensors = { leftStrength: 0, rightStrength: 0, leftCount: 0, rightCount: 0 };
    }

    // lights: array of Light objects (with .pos)
    // connections: {leftToLeft, rightToLeft, leftToRight, rightToRight}
    update(lights, connections) {
        let leftStrength = 0;
        let rightStrength = 0;
        let leftCount = 0;
        let rightCount = 0;
        const facingVec = p5.Vector.fromAngle(this.angle);
        for (const light of lights || []) {
            const toLight = p5.Vector.sub(light.pos, this.pos);
            const d = toLight.mag();
            if (d === 0) continue;
            const act = this.activation(d);
            // z-component of 2D cross product facing x toLight
            const crossZ = facingVec.x * toLight.y - facingVec.y * toLight.x;
            if (crossZ < 0) {  // light on the left
                leftStrength += act;
                leftCount++;
            } else if (crossZ > 0) {  // light on the right
                rightStrength += act;
                rightCount++;
            } else {  // light right ahead
                leftStrength += act;
                rightStrength += act;
                leftCount++;
                rightCount++;
            }
        }
        leftStrength /= leftCount || 1;
        rightStrength /= rightCount || 1;

        // Add smooth Perlin noise to sensor data
        const nl = (noise(this.noiseOffset) - 0.5) * 2 * this.noiseAmp;
        const nr = (noise(this.noiseOffset + 10) - 0.5) * 2 * this.noiseAmp;
        leftStrength = (0 < leftStrength + nl && leftStrength + nl < 1) ? leftStrength + nl : leftStrength - nl;
        rightStrength = (0 < rightStrength + nr && rightStrength + nr < 1) ? rightStrength + nr : rightStrength - nr;
        this.noiseOffset += this.noiseStep;

        // console.log(`leftStrength = ${leftStrength}, rightStrength = ${rightStrength}`);
        // let leftStim =  ((connections.leftToLeft  * leftStrength + connections.rightToLeft  * rightStrength) + 2) % 1;
        // let rightStim = ((connections.leftToRight * leftStrength + connections.rightToRight * rightStrength) + 2) % 1;
        // console.log(`leftStim = ${leftStim}, rightStim = ${rightStim}`);
        // console.log(`ll = ${connections.leftToLeft}, lr = ${connections.rightToLeft}`);
        // console.log(`rl = ${connections.leftToRight}, rr = ${connections.rightToRight}`);

        console.log(`leftStrength = ${leftStrength}, rightStrength = ${rightStrength}`);
        let leftStim =  0.4 + (connections.leftToLeft  * leftStrength + connections.rightToLeft  * rightStrength);
        let rightStim =  0.4 + (connections.leftToRight * leftStrength + connections.rightToRight * rightStrength);
        console.log(`leftStim = ${leftStim}, rightStim = ${rightStim}`);
        console.log(`ll = ${connections.leftToLeft}, lr = ${connections.rightToLeft}`);
        console.log(`rl = ${connections.leftToRight}, rr = ${connections.rightToRight}`);

        const sl = leftStim * this.k;
        const sr = rightStim * this.k;
        console.log(`sl = ${sl}, sr = ${sr}`);

        // Kinematics: move forward by average speed along facing
        const forward = (sl + sr) / 2;
        const facing = p5.Vector.fromAngle(this.angle);
        let new_pos = p5.Vector.add(this.pos, facing.copy().mult(forward));

        // Rotation: positive angle rotates visually clockwise in p5 (y-down)
        const dTheta = (sl - sr) / this.d;
        let new_angle = this.angle + dTheta;

        // Wrap around edges using applyPBC
        new_pos.x = applyPBC(new_pos.x, 0, width);
        new_pos.y = applyPBC(new_pos.y, 0, height);
        new_angle = applyPBC(new_angle, 0, TWO_PI);

        this.pos = new_pos;
        this.angle = new_angle;
        console.log(`pos = (${this.pos.x}, ${this.pos.y}), angle = ${this.angle}`);
        console.log();
    }

    activation(d) {
        // Previous (Gaussian):
        // let c1 = 150;
        // return Math.exp(-((d / c1) ** 2));

        // New (inverse-square): 1 / (d + 1)^2
        // let c2 = 450;
        let c2 = 100;
        return c2*c2 / ((d + c2) ** 2);
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        // Vehicle body (triangle)
        fill(100, 255, 100);
        stroke(50, 200, 50);
        strokeWeight(2);
        triangle(-this.size / 2, -this.size / 3, -this.size / 2, this.size / 3, this.size / 2, 0);
        // Sensors (draw as lines)
        stroke(255, 100, 100);
        strokeWeight(1);
        line(0, 0, 15 * cos(-PI / 4), 15 * sin(-PI / 4)); // Left sensor
        line(0, 0, 15 * cos(PI / 4), 15 * sin(PI / 4));   // Right sensor
        pop();
    }
}

function removeVehicleAt(x, y) {
    for (let i = vehicles.length - 1; i >= 0; i--) {
        let d = dist(x, y, vehicles[i].pos.x, vehicles[i].pos.y);
        if (d < 20) {
            vehicles.splice(i, 1);
            break;
        }
    }
}

function removeLightAt(x, y) {
    for (let i = lights.length - 1; i >= 0; i--) {
        let d = dist(x, y, lights[i].pos.x, lights[i].pos.y);
        if (d < 15) {
            lights.splice(i, 1);
            break;
        }
    }
}


