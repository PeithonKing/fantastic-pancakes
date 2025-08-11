// Global variables
let lights = [];
let vehicles = [];
let mode = 'direct'; // 'direct' or 'crossed'
let connectionStrengths = {
    leftToLeft: 0,
    rightToLeft: 0,
    leftToRight: 0,
    rightToRight: 0
};
let currentTool = 'none'; // 'lights', 'vehicles', 'none'
let simulationRunning = false;

// UI Elements
let modeDirectRadio, modeCrossedRadio;
let polarityInhibitRadio, polarityExciteRadio;
let placeLightsBtn, placeVehiclesBtn, startSimBtn;

function updateConnectionStrengths() {
    const val = polarityExciteRadio && polarityExciteRadio.elt.checked ? 1 : -1; // Excite=+1, Inhibit=-1
    if (mode === 'direct') {
        connectionStrengths = { leftToLeft: val, rightToRight: val, leftToRight: 0, rightToLeft: 0 };
    } else {
        connectionStrengths = { leftToLeft: 0, rightToRight: 0, leftToRight: val, rightToLeft: val };
    }
}

function updateConnectionToggles() {
    // Only depends on mode now; strengths are set by polarity
    updateConnectionStrengths();
}

function toggleTool(tool) {
    if (currentTool === tool) {
        currentTool = 'none';
        updateButtonStates();
    } else {
        currentTool = tool;
        updateButtonStates();
    }
}

function updateButtonStates() {
    // Disable/enable radio buttons based on current state
    if (currentTool !== 'none' || simulationRunning) {
        modeDirectRadio.attribute('disabled', '');
        modeCrossedRadio.attribute('disabled', '');
        polarityInhibitRadio.attribute('disabled', '');
        polarityExciteRadio.attribute('disabled', '');
    } else {
        modeDirectRadio.removeAttribute('disabled');
        modeCrossedRadio.removeAttribute('disabled');
        polarityInhibitRadio.removeAttribute('disabled');
        polarityExciteRadio.removeAttribute('disabled');
        updateConnectionToggles();
    }

    // Update action buttons
    if (currentTool === 'lights') {
        placeLightsBtn.html('Stop Placing Lights');
        placeVehiclesBtn.html('Place Vehicles');
        placeVehiclesBtn.attribute('disabled', '');
        startSimBtn.attribute('disabled', '');
    } else if (currentTool === 'vehicles') {
        placeVehiclesBtn.html('Stop Placing Vehicles');
        placeLightsBtn.html('Place Lights');
        placeLightsBtn.attribute('disabled', '');
        startSimBtn.attribute('disabled', '');
    } else {
        placeLightsBtn.html('Place Lights');
        placeVehiclesBtn.html('Place Vehicles');
        placeLightsBtn.removeAttribute('disabled');
        placeVehiclesBtn.removeAttribute('disabled');
        startSimBtn.removeAttribute('disabled');
    }

    if (simulationRunning) {
        placeLightsBtn.attribute('disabled', '');
        placeVehiclesBtn.attribute('disabled', '');
        startSimBtn.html('Stop Simulation');
    } else {
        startSimBtn.html('Start Simulation');
    }
}

function toggleSimulation() {
    simulationRunning = !simulationRunning;
    if (simulationRunning) {
        currentTool = 'none';
    }
    updateButtonStates();
}

// p5 mousePressed is defined in render.js

// Prevent right-click context menu on canvas
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
        return false;
    }
});
