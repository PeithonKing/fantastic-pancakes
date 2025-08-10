// Double Pendulum in p5.js with UI controls
// Mirrors the Python/Pygame logic with start/pause & live-updating parameters

let widthPx = 900;
let heightPx = 600;

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

const cx = 450; // match Python version for familiarity
const cy = 50;

// UI elements
let toggleBtn, resetBtn;
let sliders = {};
let labels = {};

function rad(deg) { return (deg * Math.PI) / 180; }
function deg(rad) { return (rad * 180) / Math.PI; }

function setup() {
	const container = document.getElementById('canvas-container');
	const c = createCanvas(widthPx, heightPx);
	c.parent(container);
	frameRate(60);
	pixelDensity(1);

	// Cache UI
	toggleBtn = document.getElementById('toggleBtn');
	resetBtn = document.getElementById('resetBtn');

	const ids = ['l1', 'l2', 'm1', 'm2', 'a1', 'a2', 'g', 'mr', 'damping'];
	for (const id of ids) {
		sliders[id] = document.getElementById(id);
		labels[id] = document.getElementById(id + 'Val');
	}
	// Initialize labels
	syncLabels();
	// Ensure sliders are disabled while running
	updateSlidersState();

	// Button handlers
	toggleBtn.addEventListener('click', () => {
		running = !running;
		if (running) {
			toggleBtn.textContent = 'Pause';
		} else {
			toggleBtn.textContent = 'Start';
		}
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
	sliders.l1.addEventListener('input', () => { labels.l1.textContent = sliders.l1.value; if (!running) l1 = parseFloat(sliders.l1.value); });
	sliders.l2.addEventListener('input', () => { labels.l2.textContent = sliders.l2.value; if (!running) l2 = parseFloat(sliders.l2.value); });
	sliders.m1.addEventListener('input', () => { labels.m1.textContent = parseFloat(sliders.m1.value).toFixed(1); if (!running) m1 = parseFloat(sliders.m1.value); });
	sliders.m2.addEventListener('input', () => { labels.m2.textContent = parseFloat(sliders.m2.value).toFixed(1); if (!running) m2 = parseFloat(sliders.m2.value); });
	sliders.a1.addEventListener('input', () => { labels.a1.textContent = parseFloat(sliders.a1.value); if (!running) a1 = rad(parseFloat(sliders.a1.value)); });
	sliders.a2.addEventListener('input', () => { labels.a2.textContent = parseFloat(sliders.a2.value); if (!running) a2 = rad(parseFloat(sliders.a2.value)); });
	sliders.g.addEventListener('input', () => { labels.g.textContent = parseFloat(sliders.g.value).toFixed(2); if (!running) g = parseFloat(sliders.g.value); });
	sliders.mr.addEventListener('input', () => { labels.mr.textContent = sliders.mr.value; if (!running) mr = parseFloat(sliders.mr.value); });
	sliders.damping.addEventListener('input', () => { labels.damping.textContent = parseFloat(sliders.damping.value).toFixed(3); if (!running) damping = parseFloat(sliders.damping.value); });
}

function updateSlidersState() {
	const disabled = running;
	for (const id in sliders) sliders[id].disabled = disabled;
}

function draw() {
	background(255);

	// Pull sizes in case window is resized (keep fixed for now)
	const BLACK = [0, 0, 0];

	// Use same cx,cy as Python for consistency
	let x1 = cx + l1 * Math.sin(a1);
	let y1 = cy + l1 * Math.cos(a1);
	let x2 = x1 + l2 * Math.sin(a2);
	let y2 = y1 + l2 * Math.cos(a2);

	// Faint angle markers for a1 and a2 (relative to vertical/downwards)
	// a1: arc around (cx, cy), a2: arc around (x1, y1)
	noFill();
	stroke(0, 0, 0, 70);
	strokeWeight(2);
	// Reference vertical direction corresponds to angle PI/2 in p5
	const ref = Math.PI / 2;
	// a1 arc
	const r1Arc = Math.min(60, l1 * 0.4);
	const start1 = Math.min(ref, ref - a1);
	const end1 = Math.max(ref, ref - a1);
	arc(cx, cy, r1Arc * 2, r1Arc * 2, start1, end1);
	// a2 arc
	const r2Arc = Math.min(50, l2 * 0.35);
	const start2 = Math.min(ref, ref - a2);
	const end2 = Math.max(ref, ref - a2);
	arc(x1, y1, r2Arc * 2, r2Arc * 2, start2, end2);

	// Angle labels near arc midpoints
	const mid1 = (start1 + end1) / 2;
	const mid2 = (start2 + end2) / 2;
	noStroke();
	fill(0, 0, 0, 150);
	textSize(11);
	textAlign(CENTER, CENTER);
	text('a1', cx + r1Arc * Math.cos(mid1), cy + r1Arc * Math.sin(mid1));
	text('a2', x1 + r2Arc * Math.cos(mid2), y1 + r2Arc * Math.sin(mid2));

	// --- Physics update ---
	// Compute accelerations using same equations (always, for HUD)
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

	// Apply damping: damping is a velocity dependent force
	a1_a -= damping * a1_v;
	a2_a -= damping * a2_v;

	// Draw rods
	stroke(BLACK[0], BLACK[1], BLACK[2]);
	strokeWeight(2);
	line(cx, cy, x1, y1);
	fill(BLACK[0], BLACK[1], BLACK[2]);
	circle(x1, y1, m1 * mr * 2);
	line(x1, y1, x2, y2);
	circle(x2, y2, m2 * mr * 2);

	if (running) {
		// Integrate (simple Euler like Python)
		a1_v += a1_a;
		a2_v += a2_a;
		a1 += a1_v;
		a2 += a2_v;
	}

	// --- HUD ---
	textAlign(LEFT, BASELINE);
	noStroke();
	fill(20, 20, 20);
	textSize(12);
	const rowH = 18;
	const labels = [
		['Angle 1 (a₁, deg)', `${deg(a1).toFixed(2)}`],
		['Angle 2 (a₂, deg)', `${deg(a2).toFixed(2)}`],
		["Angular Velocity 1 (a₁', rad/frame)", `${a1_v.toFixed(4)}`],
		["Angular Velocity 2 (a₂', rad/frame)", `${a2_v.toFixed(4)}`],
		["Angular Acceleration 1 (a₁'', rad/frame²)", `${a1_a.toFixed(4)}`],
		["Angular Acceleration 2 (a₂'', rad/frame²)", `${a2_a.toFixed(4)}`],
	];
	// Place at bottom left
	const hudX = 10;
	const hudY = height - 12 - (labels.length - 1) * rowH;
	const colGap = 230;
	for (let i = 0; i < labels.length; ++i) {
		text(labels[i][0], hudX, hudY + i * rowH);
		text(labels[i][1], hudX + colGap, hudY + i * rowH);
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
