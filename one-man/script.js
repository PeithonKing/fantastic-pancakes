// --- Save parameters to localStorage ---
function saveParamsToLocalStorage(params) {
  try {
    localStorage.setItem('simParams', JSON.stringify(params));
  } catch (e) {}
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
  document.getElementById('initial_females_multiplier').value = params.initial_females_multiplier || 10;
  document.getElementById('initial_females_exponent').value = params.initial_females_exponent || 4;
  document.getElementById('years').value = params.years || 25;
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
  document.getElementById('female_death_rate').value = params.female_death_rate || 0.2;
  document.getElementById('male_death_rate').value = params.male_death_rate || 0.2;
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
  el.addEventListener('input', updateDisplays);
});
updateDisplays();

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
  let female_ages = Array(max_age+1).fill(0);
  let male_ages = Array(max_age+1).fill(0);
  for (let age = 0; age <= max_age; ++age) {
    female_ages[age] = Math.floor(initial_females / (max_age+1));
  }
  female_ages[0] += initial_females - female_ages.reduce((a,b)=>a+b,0);
  male_ages[initial_man_age] = initial_males;
  let births_next_year = 0;
  let male_counts = [], female_counts = [];
  let male_ages_history = [], female_ages_history = [];
  for (let year = 0; year <= years; ++year) {
    for (let age = 0; age <= max_age; ++age) {
      female_ages[age] = Math.ceil(female_ages[age] * (1 - female_death_rate));
      male_ages[age] = Math.ceil(male_ages[age] * (1 - male_death_rate));
    }
    for (let age = max_age; age > 0; --age) {
      female_ages[age] = female_ages[age-1];
      male_ages[age] = male_ages[age-1];
    }
    female_ages[0] = 0;
    male_ages[0] = 0;
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
    let fertile_women = 0;
    for (let a = female_fertility_min; a <= female_fertility_max; ++a) fertile_women += female_ages[a]||0;
    fertile_women -= births_next_year;
    let fertile_men = 0;
    for (let a = male_fertility_min; a <= male_fertility_max; ++a) fertile_men += male_ages[a]||0;
    let pregnancies = Math.floor(Math.min(fertile_women, fertile_men*365*daily_attempted_fertility) * fertility_rate);
    births_next_year = pregnancies;
    male_counts.push(male_ages.reduce((a,b)=>a+b,0));
    female_counts.push(female_ages.reduce((a,b)=>a+b,0));
    male_ages_history.push([...male_ages]);
    female_ages_history.push([...female_ages]);
  }
  return {male_counts, female_counts, male_ages, female_ages, male_ages_history, female_ages_history};
}

// --- uPlot chart setup ---
let uplot = null;
function drawChart(male, female) {
  const years = Array.from({length: male.length}, (_,i)=>i);
  const data = [years, male, female];
  const opts = {
    title: "Population Simulation",
    width: document.getElementById('chart').offsetWidth-24,
    height: 400,
    scales: { x: { time: false } },
    series: [
      {},
      { label: "Males", stroke: "#1976d2", width: 2 },
      { label: "Females", stroke: "#e91e63", width: 2 }
    ],
    axes: [
      { label: "Year" },
      { label: "" }
    ],
    legend: { show: true }
  };
  if (uplot) {
    uplot.setData(data);
  } else {
    uplot = new uPlot(opts, data, document.getElementById('chart'));
  }
}

// --- Bar chart for age distribution ---
function drawBarChart(male_ages, female_ages) {
  const ages = Array.from({length: male_ages.length}, (_,i)=>i-1);
  const data = [ages, male_ages, female_ages];
  const opts = {
    title: "Population Frequency for each age",
    width: document.getElementById('age-bar-chart').offsetWidth-24,
    height: 320,
    scales: { x: { time: false } },
    series: [
      {},
      { label: "Males", stroke: "#1976d2", width: 2 },
      { label: "Females", stroke: "#e91e63", width: 2 }
    ],
    axes: [
      { label: "Age" },
      { label: "" }
    ],
    legend: { show: true },
    padding: [24, 12, 24, 12]
  };
  if (window.uplotBar) {
    window.uplotBar.destroy();
  }
  window.uplotBar = new uPlot(opts, data, document.getElementById('age-bar-chart'));
}

// --- Age frequency year slider logic ---
let maleAgesHistory = [], femaleAgesHistory = [];
const ageYearSlider = document.getElementById('age-year-slider');
const ageYearSliderVal = document.getElementById('age-year-slider-val');
const ageYearSliderRow = document.getElementById('age-year-slider-row');
ageYearSlider.addEventListener('input', function() {
  const idx = Number(ageYearSlider.value) - 1;
  ageYearSliderVal.textContent = ageYearSlider.value-1;
  if (maleAgesHistory.length && femaleAgesHistory.length) {
    drawBarChart(maleAgesHistory[idx], femaleAgesHistory[idx]);
  }
});

// --- Calculate button logic ---
const calcBtn = document.getElementById('calculate');
calcBtn.addEventListener('click', function() {
  calcBtn.disabled = true;
  calcBtn.textContent = 'Calculating...';
  setTimeout(() => {
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
    updateDisplays();
    const {male_counts, female_counts, male_ages, female_ages, male_ages_history, female_ages_history} = simulate_population_realistic(params);
    drawChart(male_counts, female_counts);
    // Store all years' age frequencies
    maleAgesHistory = male_ages_history;
    femaleAgesHistory = female_ages_history;
    // Update year slider
    ageYearSlider.min = 1;
    ageYearSlider.max = maleAgesHistory.length;
    ageYearSlider.value = maleAgesHistory.length;
    ageYearSliderVal.textContent = maleAgesHistory.length-1;
    ageYearSliderRow.style.display = '';
    drawBarChart(maleAgesHistory[maleAgesHistory.length-1], femaleAgesHistory[femaleAgesHistory.length-1]);
    calcBtn.disabled = false;
    calcBtn.textContent = 'Calculate';
    // Save to localStorage only after successful completion
    saveParamsToLocalStorage(params);
  }, 100);
});

// --- Initial chart and calculation on page load ---
window.addEventListener('DOMContentLoaded', function() {
  const params = loadParamsFromLocalStorage();
  if (params) setFormValues(params);
  calcBtn.click();
});
// --- Reset button logic ---
const resetBtn = document.getElementById('reset-storage');
if (resetBtn) {
  resetBtn.addEventListener('click', function() {
    localStorage.removeItem('simParams');
    window.location.reload();
  });
}
