// --- Save parameters to localStorage ---
function saveParamsToLocalStorage(params) {
    try {
        localStorage.setItem('simParams', JSON.stringify(params));
    } catch (e) { }
}

// --- Load parameters from localStorage ---
function loadParamsFromLocalStorage() {
    try {
        const data = localStorage.getItem('simParams');
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) { return null; }
}

// --- Set form values from params object ---
function setFormValues(params) {
    if (!params) return;
    document.getElementById('initial_females_multiplier').value = params.initial_females_multiplier || 1;
    document.getElementById('initial_females_exponent').value = params.initial_females_exponent || 6;
    document.getElementById('years').value = params.years || 100;
    document.getElementById('initial_males').value = params.initial_males || 1;
    document.getElementById('initial_man_age').value = params.initial_man_age || 20;
    document.getElementById('daily_attempted_fertility').value = params.daily_attempted_fertility || 1;
    document.getElementById('male_fertility_min').value = params.male_fertility_min || 18;
    document.getElementById('male_fertility_max').value = params.male_fertility_max || 45;
    document.getElementById('female_fertility_min').value = params.female_fertility_min || 18;
    document.getElementById('female_fertility_max').value = params.female_fertility_max || 40;
    document.getElementById('max_age').value = params.max_age || 80;
    document.getElementById('fertility_rate').value = params.fertility_rate || 0.3;
    document.getElementById('male_birth_loss_rate').value = params.male_birth_loss_rate || 0;
    document.getElementById('female_birth_loss_rate').value = params.female_birth_loss_rate || 0;
    document.getElementById('female_death_rate').value = params.female_death_rate || 0.01;
    document.getElementById('male_death_rate').value = params.male_death_rate || 0.01;
    updateDisplays();
}

// --- Update value displays for sliders and exponent ---
function updateDisplays() {
    document.getElementById('initial_females_exp_val').textContent = document.getElementById('initial_females_exponent').value;
    document.getElementById('years_val').textContent = document.getElementById('years').value;
    document.getElementById('initial_man_age_val').textContent = document.getElementById('initial_man_age').value;
    document.getElementById('daily_attempted_fertility_val').textContent = document.getElementById('daily_attempted_fertility').value;
    document.getElementById('max_age_val').textContent = document.getElementById('max_age').value;
    document.getElementById('fertility_rate_val').textContent = document.getElementById('fertility_rate').value;
    document.getElementById('male_birth_loss_rate_val').textContent = document.getElementById('male_birth_loss_rate').value;
    document.getElementById('female_birth_loss_rate_val').textContent = document.getElementById('female_birth_loss_rate').value;
    document.getElementById('female_death_rate_val').textContent = document.getElementById('female_death_rate').value;
    document.getElementById('male_death_rate_val').textContent = document.getElementById('male_death_rate').value;
    document.getElementById('initial_males_val').textContent = document.getElementById('initial_males').value;
}

// --- Attach event listeners to all sliders/inputs for live value update ---
[...document.querySelectorAll('input[type=range], input[type=number]')].forEach(el => {
    // Use the global patched updateDisplays (set later) at invocation time
    el.addEventListener('input', () => window.updateDisplays());
});

// --- Custom slider progress color for WebKit browsers ---
function updateSliderProgress(slider) {
    if (!slider) return;
    const min = Number(slider.min) || 0;
    const max = Number(slider.max) || 100;
    const val = Number(slider.value);
    const percent = ((val - min) * 100) / (max - min);
    slider.style.setProperty('--progress', percent + '%');
}

function updateAllSliderProgress() {
    document.querySelectorAll('.form-range').forEach(updateSliderProgress);
}

document.querySelectorAll('.form-range').forEach(slider => {
    updateSliderProgress(slider);
    slider.addEventListener('input', function () {
        updateSliderProgress(slider);
    });
});

// Also update on page load and after parameter changes
window.addEventListener('DOMContentLoaded', updateAllSliderProgress);

// Preserve original updateDisplays to avoid recursion when patching
const __originalUpdateDisplays = updateDisplays;

function updateDisplaysAndSliders() {
    // Call the original display updater, then refresh slider progress
    if (typeof __originalUpdateDisplays === 'function') {
        __originalUpdateDisplays();
    }
    updateAllSliderProgress();
}
// Patch all updateDisplays calls to also update slider progress (for future calls)
window.updateDisplays = updateDisplaysAndSliders;

// --- Get responsive chart dimensions ---
function getChartDimensions(containerId) {
    const container = document.getElementById(containerId);
    const containerRect = container.getBoundingClientRect();

    // Account for padding and ensure minimum dimensions
    const width = Math.max(300, containerRect.width - 32);
    const height = Math.max(250, Math.min(500, width * 0.6));

    return { width, height };
}

// --- Simulation logic (pure JS, matches notebook logic) ---
function simulate_population_realistic(params) {
    const {
        initial_females,
        years,
        initial_males,
        initial_man_age,
        daily_attempted_fertility,
        male_fertility_min,
        male_fertility_max,
        female_fertility_min,
        female_fertility_max,
        max_age,
        fertility_rate,
        male_birth_loss_rate,
        female_birth_loss_rate,
        female_death_rate,
        male_death_rate
    } = params;

    let female_ages = Array(max_age + 1).fill(0);
    let male_ages = Array(max_age + 1).fill(0);

    // Distribute initial females across all ages
    for (let age = 0; age <= max_age; ++age) {
        female_ages[age] = Math.floor(initial_females / (max_age + 1));
    }
    female_ages[0] += initial_females - female_ages.reduce((a, b) => a + b, 0);

    // Set initial males at specified age
    male_ages[initial_man_age] = initial_males;

    let births_next_year = 0;
    let male_counts = [], female_counts = [];
    let male_ages_history = [], female_ages_history = [];

    for (let year = 0; year <= years; ++year) {
        // Apply annual death rates
        for (let age = 0; age <= max_age; ++age) {
            female_ages[age] = Math.ceil(female_ages[age] * (1 - female_death_rate));
            male_ages[age] = Math.ceil(male_ages[age] * (1 - male_death_rate));
        }

        // Age everyone by one year
        for (let age = max_age; age > 0; --age) {
            female_ages[age] = female_ages[age - 1];
            male_ages[age] = male_ages[age - 1];
        }
        female_ages[0] = 0;
        male_ages[0] = 0;

        // Add births from last year's pregnancies
        if (births_next_year > 0) {
            let girls = 0, boys = 0;
            for (let i = 0; i < births_next_year; ++i) {
                if (Math.random() < 0.5) girls++;
                else boys++;
            }
            girls = Math.floor(girls * (1 - female_birth_loss_rate));
            boys = Math.floor(boys * (1 - male_birth_loss_rate));
            female_ages[0] += girls;
            male_ages[0] += boys;
        }

        // Calculate fertile populations
        let fertile_women = 0;
        for (let a = female_fertility_min; a <= female_fertility_max; ++a) {
            fertile_women += female_ages[a] || 0;
        }
        fertile_women -= births_next_year; // Subtract pregnant women

        let fertile_men = 0;
        for (let a = male_fertility_min; a <= male_fertility_max; ++a) {
            fertile_men += male_ages[a] || 0;
        }

        // Calculate pregnancies for next year
        let pregnancies = Math.floor(Math.min(fertile_women, fertile_men * 365 * daily_attempted_fertility) * fertility_rate);
        births_next_year = pregnancies;

        // Record totals and age distributions
        male_counts.push(male_ages.reduce((a, b) => a + b, 0));
        female_counts.push(female_ages.reduce((a, b) => a + b, 0));
        male_ages_history.push([...male_ages]);
        female_ages_history.push([...female_ages]);
    }

    return { male_counts, female_counts, male_ages, female_ages, male_ages_history, female_ages_history };
}

// --- uPlot chart setup ---
let uplot = null;
function drawChart(male, female) {
    const years = Array.from({ length: male.length }, (_, i) => i);
    const data = [years, male, female];

    const dimensions = getChartDimensions('chart');

    const opts = {
        title: "Population Over Time",
        width: dimensions.width,
        height: dimensions.height,
        scales: {
            x: { time: false },
            y: { range: [0, Math.max(...male, ...female) * 1.1] }
        },
        series: [
            {},
            {
                label: "Males",
                stroke: "#3b82f6",
                width: 3,
                fill: "rgba(59, 130, 246, 0.1)"
            },
            {
                label: "Females",
                stroke: "#ec4899",
                width: 3,
                fill: "rgba(236, 72, 153, 0.1)"
            }
        ],
        axes: [
            {
                label: "Year",
                size: 60,
                font: "12px Inter, sans-serif"
            },
            {
                label: "Population",
                size: 80,
                font: "12px Inter, sans-serif"
            }
        ],
        legend: {
            show: true,
            live: false
        },
        cursor: {
            show: true,
            sync: {
                key: "population"
            }
        }
    };

    if (uplot) {
        // Reset y-axis limits before updating data
        const yMax = Math.max(...male, ...female) * 1.1;
        uplot.setScale('y', { min: 0, max: yMax });
        uplot.setData(data);
    } else {
        // If chart doesn't exist, create it
        uplot = new uPlot(opts, data, document.getElementById('chart'));
    }
}

// --- Bar chart for age distribution ---
let uplotBar = null;
function drawBarChart(male_ages, female_ages) {
    const ages = Array.from({ length: male_ages.length }, (_, i) => i);
    const data = [ages, male_ages, female_ages];

    const dimensions = getChartDimensions('age-bar-chart');

    const opts = {
        title: "Age Distribution",
        width: dimensions.width,
        height: dimensions.height,
        scales: {
            x: { time: false },
            y: { range: [0, Math.max(...male_ages, ...female_ages) * 1.1] }
        },
        series: [
            {},
            {
                label: "Males",
                stroke: "#3b82f6",
                width: 2,
                fill: "rgba(59, 130, 246, 0.3)"
            },
            {
                label: "Females",
                stroke: "#ec4899",
                width: 2,
                fill: "rgba(236, 72, 153, 0.3)"
            }
        ],
        axes: [
            {
                label: "Age",
                size: 60,
                font: "12px Inter, sans-serif"
            },
            {
                label: "Count",
                size: 80,
                font: "12px Inter, sans-serif"
            }
        ],
        legend: {
            show: true,
            live: false
        },
        cursor: {
            show: true,
            sync: {
                key: "age-distribution"
            }
        }
    };

    if (uplotBar) {
        // Reset y-axis limits before updating data
        const yMax = Math.max(...male_ages, ...female_ages) * 1.1;
        uplotBar.setScale('y', { min: 0, max: yMax });
        uplotBar.setData(data);
    } else {
        // If chart doesn't exist, create it
        uplotBar = new uPlot(opts, data, document.getElementById('age-bar-chart'));
    }
}

// --- Age frequency year slider logic ---
let maleAgesHistory = [], femaleAgesHistory = [];
const ageYearSlider = document.getElementById('age-year-slider');
const ageYearSliderVal = document.getElementById('age-year-slider-val');
const ageYearSliderRow = document.getElementById('age-year-slider-row');

ageYearSlider.addEventListener('input', function () {
    const idx = Number(ageYearSlider.value) - 1;
    ageYearSliderVal.textContent = ageYearSlider.value;
    if (maleAgesHistory.length && femaleAgesHistory.length && idx >= 0 && idx < maleAgesHistory.length) {
        drawBarChart(maleAgesHistory[idx], femaleAgesHistory[idx]);
    }
});

// --- Calculate button logic ---
const calcBtn = document.getElementById('calculate');
calcBtn.addEventListener('click', function () {
    // Disable button and show loading state
    calcBtn.disabled = true;
    const originalText = calcBtn.innerHTML;
    calcBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Calculating...';

    // Add visual feedback
    calcBtn.style.opacity = '0.7';

    setTimeout(() => {
        try {
            // Gather all parameters
            const params = {
                initial_females_multiplier: Number(document.getElementById('initial_females_multiplier').value),
                initial_females_exponent: Number(document.getElementById('initial_females_exponent').value),
                initial_females: Number(document.getElementById('initial_females_multiplier').value) * Math.pow(10, Number(document.getElementById('initial_females_exponent').value)),
                years: Number(document.getElementById('years').value),
                initial_males: Number(document.getElementById('initial_males').value),
                initial_man_age: Number(document.getElementById('initial_man_age').value),
                daily_attempted_fertility: Number(document.getElementById('daily_attempted_fertility').value),
                male_fertility_min: Number(document.getElementById('male_fertility_min').value),
                male_fertility_max: Number(document.getElementById('male_fertility_max').value),
                female_fertility_min: Number(document.getElementById('female_fertility_min').value),
                female_fertility_max: Number(document.getElementById('female_fertility_max').value),
                max_age: Number(document.getElementById('max_age').value),
                fertility_rate: Number(document.getElementById('fertility_rate').value),
                male_birth_loss_rate: Number(document.getElementById('male_birth_loss_rate').value),
                female_birth_loss_rate: Number(document.getElementById('female_birth_loss_rate').value),
                female_death_rate: Number(document.getElementById('female_death_rate').value),
                male_death_rate: Number(document.getElementById('male_death_rate').value)
            };

            // Run simulation
            const { male_counts, female_counts, male_ages, female_ages, male_ages_history, female_ages_history } = simulate_population_realistic(params);

            // Draw charts
            drawChart(male_counts, female_counts);

            // Store all years' age frequencies
            maleAgesHistory = male_ages_history;
            femaleAgesHistory = female_ages_history;

            // Update year slider
            ageYearSlider.min = 1;
            ageYearSlider.max = maleAgesHistory.length;
            ageYearSlider.value = maleAgesHistory.length;
            ageYearSliderVal.textContent = maleAgesHistory.length;
            ageYearSliderRow.style.display = 'flex';

            // Draw initial age distribution (final year)
            drawBarChart(maleAgesHistory[maleAgesHistory.length - 1], femaleAgesHistory[femaleAgesHistory.length - 1]);

            // Save to localStorage only after successful completion
            saveParamsToLocalStorage(params);

        } catch (error) {
            console.error('Simulation error:', error);
            alert('An error occurred during simulation. Please check your parameters and try again.');
        } finally {
            // Re-enable button
            calcBtn.disabled = false;
            calcBtn.innerHTML = originalText;
            calcBtn.style.opacity = '1';
        }
    }, 50); // Small delay to show loading state
});

// --- Reset button logic ---
const resetBtn = document.getElementById('reset-storage');
if (resetBtn) {
    resetBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to reset all parameters to their default values?')) {
            localStorage.removeItem('simParams');
            window.location.reload();
        }
    });
}

// --- Handle window resize ---
function handleResize() {
    if (uplot) {
        const dimensions = getChartDimensions('chart');
        uplot.setSize({ width: dimensions.width, height: dimensions.height });
    }

    if (uplotBar) {
        const dimensions = getChartDimensions('age-bar-chart');
        uplotBar.setSize({ width: dimensions.width, height: dimensions.height });
    }
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

// --- Initialize tooltips ---
function initializeTooltips() {
    // Enable Bootstrap tooltips for help icons
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            placement: 'top',
            trigger: 'hover focus'
        });
    });
}

// --- Initial setup on page load ---
window.addEventListener('DOMContentLoaded', function () {
    // Initialize displays
    updateDisplays();

    // Load saved parameters
    const params = loadParamsFromLocalStorage();
    if (params) {
        setFormValues(params);
    }

    // Initialize tooltips
    initializeTooltips();

    // Initialize mobile collapse functionality
    const collapseToggle = document.querySelector('.mobile-collapse-toggle');
    const parametersCollapse = document.getElementById('parametersCollapse');

    if (collapseToggle && parametersCollapse) {
        parametersCollapse.addEventListener('shown.bs.collapse', function () {
            const icon = collapseToggle.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-chevron-up';
            }
        });

        parametersCollapse.addEventListener('hidden.bs.collapse', function () {
            const icon = collapseToggle.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-chevron-down';
            }
        });
    }

    // Hide age slider initially
    ageYearSliderRow.style.display = 'none';

    // Run initial calculation after 500ms
    calcBtn.click();
});
