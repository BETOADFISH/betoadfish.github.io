# Biology Lab — five working investigations

Version 1.0.0 · 2026-10-05 · English student interface; Chinese teacher notes.

Open **index.html** in Chrome or Edge. No installation, account, local server, API key or internet connection is needed. Keep the HTML, CSS, JavaScript and assets in this folder in the same folder. If using the ZIP, extract the entire folder before opening the page.

The five experiments are usable simulations, not recordings or screenshots:

| Experiment | What you control | What you measure |
|---|---|---|
| Potato osmosis | Sucrose concentration; immersion time; balance division | Initial and final mass of fresh tissue, percentage change, local zero-change estimate |
| Enzyme initial rate | Hydrogen peroxide concentration; relative catalase loading | Oxygen amount over 0–10 s, estimated initial rate, substrate-response pattern |
| Beetroot membranes | Temperature; exposure time; rinsing | Absorbance of surrounding liquid as a pigment-leakage proxy |
| Photosynthesis & light | Photon flux density; CO₂ supply scenario; interval | Initial/final dissolved oxygen and net rate, including negative dark respiration |
| Quadrat fieldwork | Plant distribution; random/edge/manual sampling; sample count | Quadrat counts, running density-based population estimate, optional true-total reveal |

## Use

1. Choose an experiment in the left navigation. Enter a prediction in the notebook if useful.
2. Set a level and run one sample, or use **Run gradient** to collect the displayed number of fresh repeats at every preset level. Running again adds fresh samples rather than changing old values.
3. Expand **Control conditions & seed** to investigate another setting. A changed control or seed starts a separate series; earlier data remain available in **Data series**. Graphs and tables show only the selected series.
4. Inspect the graph and raw readings. Click a table sample or graph point to show that observation on the bench. Expand interpretation, hints or teacher notes when needed.
5. Write a conclusion with numerical evidence, a limitation and a next investigation. **Export all series CSV** downloads every series in the selected experiment. **Save graph** exports a self-contained SVG for the currently selected series.
6. **Save notebook** downloads all five modules, settings, notes and data as JSON. **Open notebook** validates a compatible file before offering to replace the current workspace. A file with altered readings, unsupported versions or invalid structure is rejected, leaving the current notebook intact.

In quadrat fieldwork, automatic strategies sample unique cells without replacement. Manual mode lets you choose an unsampled cell by mouse, touch or keyboard. Arrow keys move between available cells; Enter or Space selects. The first coordinate increases to the right, the second downwards. Sampling every cell is a census and reproduces the true population exactly. The edge-only method has 36 eligible cells, not 100.

**Reset this experiment** clears only that module’s data and notes after an inline confirmation. It preserves its setup and seed. Repeating the same sample sequence reproduces the same data. Other modules are not reset. A new seed retains earlier series and creates a new scenario. More replicates increase the sample count; simply revisiting the graph does not generate data.

**Projection view** increases important text without entering fullscreen or changing window focus. All controls also work with a keyboard. The table is an alternative to the graph. On narrower screens the record table may scroll horizontally within its own region.

## Files and data

The application consists of local files: the HTML, CSS, JavaScript and assets in this folder. There is no build step, package manager or network dependency. `models.js` contains the pure numerical functions and can also be loaded by Node for tests.

The page attempts local browser storage and reports failure visibly. Browser storage under `file://` is browser-dependent; clearing browser data or moving the folder may make previous local saves unavailable. Downloaded JSON is the portable backup. The app does not automatically submit or upload any data.

Use one browser tab for editing a notebook. This demo does not merge simultaneous edits from multiple tabs. Separate, downloaded notebook files are independent. Up to 40 series per experiment, 300 observations per continuous series, 100 distinct quadrats per field series and 2,000 total observations are accepted. Notebook import limit: 2 MiB.

CSV is UTF-8 with a BOM and includes sample IDs, series IDs, seeds, controls, fixed conditions, source grouping, model versions, raw readings and derived results. Each sample row also carries its group mean, n and sample SD when defined. SD is empty for n=1. Ecology instead records each cumulative estimate. CSV contains all series for that module, so filter by series before plotting a relationship. Precision retained in CSV can exceed the rounded display; calculations use the same underlying values.

The downloadable graph includes its settings, seed and model identifiers. JSON includes all settings and seeds, so neither it nor a static local application is a secure way to hide answers from students.

## Scientific scope

Every output is **Simulated data**. Numerical constants, variability and apparatus responses are teaching assumptions, not fits to real experiments. Read [SCIENCE.md](SCIENCE.md) for equations, sources, units and limitations. The models are for experiment design, data handling and discussion. They do not predict real measurements or certify completion of an examination-board practical.

The current five-module demo was explicitly authorised after an earlier plan-only, detailed osmosis design. It intentionally shortens that staged workflow: runs immediately generate paired or short-interval readings; students are not required to complete every manual lab step. It also uses a separately versioned random generator and a different, simpler series structure. It does not claim the earlier full planning specification has been implemented.

Future work would include student classroom trials, real-device iPad/Safari checks, scientifically calibrated models if appropriate, and more detailed practical-operation scaffolding. None is required to open this local demo.
