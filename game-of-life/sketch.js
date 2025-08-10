const CELL_SIZE = 10; // px
let cols = 100;
let rows = 60;
let grid;          // current state (Uint8Array for speed)
let nextGrid;      // next state buffer
let running = false;
let generation = 0;
let frameLimiter = 60; // updates per second
// let acc = 0;           // time accumulator for step pacing (not needed)
let fpsCounter = 0;    // how many generations occurred in the last 0.1s window
let fpsElapsed = 0;    // ms accumulated since last FPS update

// DOM elements
let $generation, $fps, $toggle, $random, $fillAll, $clearAll, $applySize, $cols, $rows, $speed, $speedValue;
let canvas;

function setup() {
	// Read potential initial values from HTML
	$cols = document.getElementById('cols');
	$rows = document.getElementById('rows');
	$speed = document.getElementById('speed');
	$speedValue = document.getElementById('speedValue');
	$generation = document.getElementById('generation');
	$fps = document.getElementById('fps');
	$toggle = document.getElementById('toggleRun');
	$random = document.getElementById('randomize');
	$fillAll = document.getElementById('fillAll');
	$clearAll = document.getElementById('clearAll');
	$applySize = document.getElementById('applySize');

	// Initialize values
	cols = clampInt(parseInt($cols.value, 10), 5, 300);
	rows = clampInt(parseInt($rows.value, 10), 5, 300);
	frameLimiter = clampInt(parseInt($speed.value, 10), 1, 60);
	// Set initial frame rate based on speed
	frameRate(frameLimiter);
	if ($speedValue) $speedValue.textContent = String(frameLimiter);

	const w = cols * CELL_SIZE;
	const h = rows * CELL_SIZE;

	const holder = document.getElementById('canvas-holder');
	canvas = createCanvas(w, h);
	canvas.parent(holder);

	// Pixel density 1 to keep crisp grid lines
	pixelDensity(1);

	initGrid(cols, rows);
	drawGrid();

	// Events
	$toggle.addEventListener('click', toggleRun);
	$random.addEventListener('click', () => { randomize(); generation = 0; updateGeneration(); drawGrid(); });
	$fillAll.addEventListener('click', () => { fillAll(1); generation = 0; updateGeneration(); drawGrid(); });
	$clearAll.addEventListener('click', () => { fillAll(0); generation = 0; updateGeneration(); drawGrid(); });
	$applySize.addEventListener('click', applyNewSize);
	$speed.addEventListener('input', () => {
		frameLimiter = clampInt(parseInt($speed.value, 10), 1, 60);
		frameRate(frameLimiter);
		if ($speedValue) $speedValue.textContent = String(frameLimiter);
	});

	// p5 draw loop should not loop unless running; we handle manually
	noLoop();
}

function initGrid(c, r) {
	grid = new Uint8Array(c * r);
	nextGrid = new Uint8Array(c * r);
}

function index(x, y) {
	return y * cols + x;
}

function wrap(v, max) {
	if (v < 0) return max - 1;
	if (v >= max) return 0;
	return v;
}

function step() {
	// Compute next generation with wrapping edges
	for (let y = 0; y < rows; y++) {
		// Removed per-row FPS reset
		// if ($fps) $fps.textContent = '0';
		for (let x = 0; x < cols; x++) {
			const i = index(x, y);
			const alive = grid[i];

			let n = 0;
			// sum neighbors (8)
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					if (dx === 0 && dy === 0) continue;
					const nx = wrap(x + dx, cols);
					const ny = wrap(y + dy, rows);
					n += grid[index(nx, ny)];
				}
			}

			// Conway rules
			let next = alive;
			if (alive) {
				next = (n === 2 || n === 3) ? 1 : 0;
			} else {
				next = (n === 3) ? 1 : 0;
			}
			nextGrid[i] = next;
		}
	}

	// swap buffers
	const tmp = grid;
	grid = nextGrid;
	nextGrid = tmp;
}

function draw() {
	if (running) {
		step();
		generation++;
		updateGeneration();
		drawGrid();
		fpsCounter++;
		fpsElapsed += deltaTime;
		console.log(`Generation: ${generation}, fps counter: ${fpsCounter}, fps elapsed: ${fpsElapsed}`);
		// Update the FPS pill every 0.1s with the measured generations per second
		if (fpsElapsed >= 100) {
			if ($fps) $fps.textContent = String(Math.round(fpsCounter * 1000 / fpsElapsed));
			fpsCounter = 0;
			fpsElapsed = 0;
		}
	}
}

function drawGrid() {
	background(255);

	// Draw alive cells (single blue to match the Start button)
	noStroke();
	fill('#3dbb39ff');
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			if (grid[index(x, y)]) {
				rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
			}
		}
	}

	// Grid lines (subtle)
	stroke('#e0e0e0ff');
	strokeWeight(1);
	for (let x = 0; x <= cols; x++) {
		const xx = x * CELL_SIZE + 0.5; // crisp lines
		line(xx, 0, xx, rows * CELL_SIZE);
	}
	for (let y = 0; y <= rows; y++) {
		const yy = y * CELL_SIZE + 0.5;
		line(0, yy, cols * CELL_SIZE, yy);
	}
}

function mouseDragged() {
	toggleCellUnderMouse();
}

function mousePressed() {
	toggleCellUnderMouse();
}

function toggleCellUnderMouse() {
	if (!canvas) return;
	// Only if mouse is within canvas bounds
	if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;
	const gx = Math.floor(mouseX / CELL_SIZE);
	const gy = Math.floor(mouseY / CELL_SIZE);
	const i = index(gx, gy);
	grid[i] = grid[i] ? 0 : 1;
	drawGrid();
}

function toggleRun() {
	running = !running;
	if (running) {
		loop();
		$toggle.textContent = 'Stop Simulation';
		$toggle.classList.remove('primary');
		$toggle.classList.add('danger');
	} else {
		noLoop();
		$toggle.textContent = 'Start Simulation';
		$toggle.classList.remove('danger');
		$toggle.classList.add('primary');
		// Reset accumulators and FPS on stop
		// acc = 0;
		// fpsCounter = 0;
		// fpsElapsed = 0;
		if ($fps) $fps.textContent = '0';
	}
}

function randomize() {
	for (let i = 0; i < grid.length; i++) {
		grid[i] = Math.random() < 0.35 ? 1 : 0;
	}
}

function fillAll(val) {
	grid.fill(val ? 1 : 0);
}

function updateGeneration() {
	if ($generation) $generation.textContent = String(generation);
}

function applyNewSize() {
	// Stop if running
	if (running) toggleRun();

	const newCols = clampInt(parseInt($cols.value, 10), 5, 300);
	const newRows = clampInt(parseInt($rows.value, 10), 5, 300);
	cols = newCols; rows = newRows;
	generation = 0; updateGeneration();

	resizeCanvas(cols * CELL_SIZE, rows * CELL_SIZE);
	initGrid(cols, rows);
	drawGrid();
}

function clampInt(n, min, max) {
	if (Number.isNaN(n)) return min;
	return Math.max(min, Math.min(max, n | 0));
}
