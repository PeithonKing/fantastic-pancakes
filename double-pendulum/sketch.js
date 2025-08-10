// Double Pendulum in p5.js with UI controls
// Responsive design with proper canvas sizing

// Canvas dimensions
let canvasWidth, canvasHeight;
let isMobile = false;

// State
let running = false;
let l1 = 200; // px
let l2 = 200; // px
let m1 = 1;   // kg (unitless scale)
let m2 = 1;   // kg (unitless scale)
let a1 = Math.PI / 2; // rad
let a2 = Math.PI / 8; // rad
let a1_v = 0; // rad/frame
let a2_v = 0; // rad/frame
let g = 1;    // gravity
let mr = 5;   // radius scale
let damping = 0; // damping coefficient

// Pendulum origin point
let cx, cy;

// UI elements
let toggleBtn, resetBtn;
let sliders = {};
let labels = {};

function rad(deg) { return (deg * Math.PI) / 180; }
function deg(rad) { return (rad * 180) / Math.PI; }

function getCanvasSize() {
	// Check if mobile
	isMobile = window.innerWidth <= 768;
	
	if (isMobile) {
		// Mobile: use viewport width minus padding, fixed height
		canvasWidth = Math.min(window.innerWidth - 32, 500); // max 500px on mobile
		canvasHeight = 350;
	} else {
		// Desktop: use available container space
		const container = document.getElementById('canvas-container');
		const rect = container.getBoundingClientRect();
		
		// Account for sidebar (320px) + padding
		const availableWidth = window.innerWidth - 320 - 48; // sidebar + padding
		const availableHeight = window.innerHeight - 48; // padding
		
		canvasWidth = Math.max(400, Math.min(availableWidth, 800));
		canvasHeight = Math.max(400, Math.min(availableHeight, 600));
	}
	
	// Set pendulum origin
	cx = canvasWidth / 2;
	cy = 80; // from top
}

function setup() {
	getCanvasSize();
	
	const container = document.getElementById('canvas-container');
	const canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent(container);
	
	frameRate(60);
	pixelDensity(1);

	// Cache UI elements
	toggleBtn = document.getElementById('toggleBtn');
	resetBtn = document.getElementById('resetBtn');

	const ids = ['l1', 'l2', 'm1', 'm2', 'a1', 'a2', 'g', 'mr', 'damping'];
	for (const id of ids) {
		sliders[id] = document.getElementById(id);
		labels[id] = document.getElementById(id + 'Val');
	}
	
	// Initialize labels and values
	syncLabels();
	updateSlidersState();

	// Button handlers
	toggleBtn.addEventListener('click', () => {
		running = !running;
		toggleBtn.textContent = running ? 'Pause' : 'Start';
		updateSlidersState();
	});

	resetBtn.addEventListener('click', () => {
		// Reset angles and velocities to current slider values
		a1 = rad(parseFloat(sliders.a1.value));
		a2 = rad(parseFloat(sliders.a2.value));
		a1_v = 0;
		a2_v = 0;
	});

	// Slider change listeners
	sliders.l1.addEventListener('input', () => { 
		labels.l1.textContent = sliders.l1.value; 
		if (!running) l1 = parseFloat(sliders.l1.value); 
	});
	sliders.l2.addEventListener('input', () => { 
		labels.l2.textContent = sliders.l2.value; 
		if (!running) l2 = parseFloat(sliders.l2.value); 
	});
	sliders.m1.addEventListener('input', () => { 
		labels.m1.textContent = parseFloat(sliders.m1.value).toFixed(1); 
		if (!running) m1 = parseFloat(sliders.m1.value); 
	});
	sliders.m2.addEventListener('input', () => { 
		labels.m2.textContent = parseFloat(sliders.m2.value).toFixed(1); 
		if (!running) m2 = parseFloat(sliders.m2.value); 
	});
	sliders.a1.addEventListener('input', () => { 
		labels.a1.textContent = parseFloat(sliders.a1.value); 
		if (!running) a1 = rad(parseFloat(sliders.a1.value)); 
	});
	sliders.a2.addEventListener('input', () => { 
		labels.a2.textContent = parseFloat(sliders.a2.value); 
		if (!running) a2 = rad(parseFloat(sliders.a2.value)); 
	});
	sliders.g.addEventListener('input', () => { 
		labels.g.textContent = parseFloat(sliders.g.value).toFixed(2); 
		if (!running) g = parseFloat(sliders.g.value); 
	});
	sliders.mr.addEventListener('input', () => { 
		labels.mr.textContent = sliders.mr.value; 
		if (!running) mr = parseFloat(sliders.mr.value); 
	});
	sliders.damping.addEventListener('input', () => { 
		labels.damping.textContent = parseFloat(sliders.damping.value).toFixed(3); 
		if (!running) damping = parseFloat(sliders.damping.value); 
	});
}

function updateSlidersState() {
	const disabled = running;
	for (const id in sliders) sliders[id].disabled = disabled;
}

function draw() {
	background(255);

	// Calculate pendulum positions
	let x1 = cx + l1 * Math.sin(a1);
	let y1 = cy + l1 * Math.cos(a1);
	let x2 = x1 + l2 * Math.sin(a2);
	let y2 = y1 + l2 * Math.cos(a2);

	// Draw faint angle markers
	noFill();
	stroke(0, 0, 0, 70);
	strokeWeight(1);
	
	const ref = Math.PI / 2;
	// a1 arc
	const r1Arc = Math.min(40, l1 * 0.3);
	const start1 = Math.min(ref, ref - a1);
	const end1 = Math.max(ref, ref - a1);
	arc(cx, cy, r1Arc * 2, r1Arc * 2, start1, end1);
	
	// a2 arc
	const r2Arc = Math.min(35, l2 * 0.25);
	const start2 = Math.min(ref, ref - a2);
	const end2 = Math.max(ref, ref - a2);
	arc(x1, y1, r2Arc * 2, r2Arc * 2, start2, end2);

	// Angle labels
	const mid1 = (start1 + end1) / 2;
	const mid2 = (start2 + end2) / 2;
	noStroke();
	fill(0, 0, 0, 150);
	textSize(10);
	textAlign(CENTER, CENTER);
	text('a1', cx + r1Arc * Math.cos(mid1), cy + r1Arc * Math.sin(mid1));
	text('a2', x1 + r2Arc * Math.cos(mid2), y1 + r2Arc * Math.sin(mid2));

	// Physics calculations
	const num1 = -g * (2 * m1 + m2) * Math.sin(a1);
	const num2 = -m2 * g * Math.sin(a1 - 2 * a2);
	const num3 = -2 * Math.sin(a1 - a2) * m2;
	const num4 = a2_v * a2_v * l2 + a1_v * a1_v * l1 * Math.cos(a1 - a2);
	const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
	let a1_a = (num1 + num2 + num3 * num4) / (den1 || 1e-9);

	const num1b = 2 * Math.sin(a1 - a2);
	const num2b = (a1_v * a1_v * l1 * (m1 + m2));
	const num3b = g * (m1 + m2) * Math.cos(a1);
	const num4b = a2_v * a2_v * l2 * m2 * Math.cos(a1 - a2);
	const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
	let a2_a = (num1b * (num2b + num3b + num4b)) / (den2 || 1e-9);

	// Apply damping
	a1_a -= damping * a1_v;
	a2_a -= damping * a2_v;

	// Draw pendulum
	stroke(0);
	strokeWeight(2);
	// Rods
	line(cx, cy, x1, y1);
	line(x1, y1, x2, y2);
	
	// Masses
	fill(0);
	circle(cx, cy, 8); // pivot point
	circle(x1, y1, m1 * mr * 2);
	circle(x2, y2, m2 * mr * 2);

	// Update physics if running
	if (running) {
		a1_v += a1_a;
		a2_v += a2_a;
		a1 += a1_v;
		a2 += a2_v;
	}

	// HUD
	drawHUD(a1_a, a2_a);
}

function drawHUD(a1_a, a2_a) {
	textAlign(LEFT, BASELINE);
	noStroke();
	fill(20, 20, 20);
	textSize(isMobile ? 10 : 11);
	
	const hudData = [
		['Angle 1 (a₁)', `${deg(a1).toFixed(1)}°`],
		['Angle 2 (a₂)', `${deg(a2).toFixed(1)}°`],
		["Velocity 1 (a₁')", `${a1_v.toFixed(3)} rad/f`],
		["Velocity 2 (a₂')", `${a2_v.toFixed(3)} rad/f`],
		["Accel 1 (a₁'')", `${a1_a.toFixed(3)} rad/f²`],
		["Accel 2 (a₂'')", `${a2_a.toFixed(3)} rad/f²`],
	];

	const hudX = 10;
	const hudY = canvasHeight - 15 - (hudData.length - 1) * (isMobile ? 14 : 16);
	const colGap = isMobile ? 120 : 180;
	
	for (let i = 0; i < hudData.length; i++) {
		text(hudData[i][0], hudX, hudY + i * (isMobile ? 14 : 16));
		text(hudData[i][1], hudX + colGap, hudY + i * (isMobile ? 14 : 16));
	}
}

function syncLabels() {
	labels.l1.textContent = sliders.l1.value;
	labels.l2.textContent = sliders.l2.value;
	labels.m1.textContent = parseFloat(sliders.m1.value).toFixed(1);
	labels.m2.textContent = parseFloat(sliders.m2.value).toFixed(1);
	labels.a1.textContent = sliders.a1.value;
	labels.a2.textContent = sliders.a2.value;
	labels.g.textContent = parseFloat(sliders.g.value).toFixed(2);
	labels.mr.textContent = sliders.mr.value;
	labels.damping.textContent = parseFloat(sliders.damping.value).toFixed(2);

	// Initialize state mirrors
	l1 = parseFloat(sliders.l1.value);
	l2 = parseFloat(sliders.l2.value);
	m1 = parseFloat(sliders.m1.value);
	m2 = parseFloat(sliders.m2.value);
	a1 = rad(parseFloat(sliders.a1.value));
	a2 = rad(parseFloat(sliders.a2.value));
	g = parseFloat(sliders.g.value);
	mr = parseFloat(sliders.mr.value);
	damping = parseFloat(sliders.damping.value);
}
