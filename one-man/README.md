# The Last Man on Earth — Population Simulation

What if a catastrophe wipes out all but one man? This interactive model lets you explore how long it could take to repopulate, given assumptions about fertility windows, attempt rates, pregnancy success, birth losses, mortality, and lifespan.

## Core idea

- Age-structured, two-sex model updated once per year.
- Pregnancies form this year and produce births next year (1-year lag).
- Each fertile man attempts a number of conceptions per day; each attempt has a success probability.
- A woman can carry at most one pregnancy per year; pregnant women are excluded from that year’s fertile pool.
- Death rates are applied annually to each age bucket; people age by one year; maximum age removes the oldest.

## Controls (inputs)

- Initial Females = multiplier × 10^exponent
- Years to simulate
- Initial Males and Initial Man Age
- Daily Attempted Fertility (attempts/day/man)
- Female Fertility Range [min, max]
- Male Fertility Range [min, max]
- Max Age (lifespan cap)
- Fertility Rate (probability of pregnancy per attempt)
- Birth Loss Rates: male/female (fraction not surviving to birth)
- Annual Death Rates: female/male

Tip: For the “one man” scenario, set Initial Males = 1 and choose an Initial Man Age within the male fertility range.

## Outputs

- Population Graph (uPlot): total males and total females vs year.
- Age Frequency chart: male/female counts per age for any simulated year (choose with the Year slider).

Use these to answer “how long to repopulate?” by reading the year where totals cross a target (e.g., 1e6, 1e8). You pick the threshold; the model shows the trajectory.

## Model mechanics (yearly step)

1. Apply sex-specific annual death rates to each age, rounding up (ceil).
2. Age everyone by one year; clear newborn buckets (age 0).
3. Resolve births from last year’s pregnancies:
   - Random 50/50 sex; apply sex-specific birth loss; add survivors to age 0.
4. Compute fertile pools:
   - Women in [female_min, female_max] minus last year’s pregnancies.
   - Men in [male_min, male_max].
5. New pregnancies this year:
   - Capacity = min(fertile_women, fertile_men × 365 × daily_attempts)
   - Pregnancies = floor(Capacity × fertility_rate)
   - Store for next year’s births.

Initialization:

- Females are spread roughly uniformly across ages 0..max_age.
- Initial males are placed at the chosen initial age.

## Assumptions and limitations

- Constant death rates across ages; no infant/elderly curve.
- Single gestation per woman per year; no twins modeled explicitly.
- Sex at birth is random 50/50.
- Rounding after deaths uses ceil (can bias counts slightly upward at small numbers).
- No pairing, logistics, geography, care constraints, or resource limits.
- No maternal health depletion or lactational amenorrhea; time step is 1 year.

These choices make the model simple and fast to explore scenarios, not a demographic forecast.

## Suggested baseline

- Initial Females: 1 × 10^6
- Initial Males: 1; Initial Man Age: 20
- Female fertility: 18–40; Male fertility: 18–45
- Daily attempts: 1; Fertility rate: 0.3
- Death rates: 0.01 (both sexes); Max age: 80

Then scan the Population Graph to read the year when totals reach your chosen target.

## Tech

- Vanilla JS + Bootstrap for UI
- uPlot for fast charts
- No backend; parameters saved in localStorage
