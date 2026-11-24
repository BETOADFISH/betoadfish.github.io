# Biology Lab: five simulated investigations

Open `index.html` in a current browser. The lab runs offline. Use the language control to switch between English and 简体中文. The interface follows the portfolio theme when embedded and the system appearance when opened independently.

Choose an experiment, set the conditions and run a sample or a gradient. Repeated runs add observations. A change to control conditions or seed creates a separate series. Select a series to view its graph and table. Samples can be selected in the table or graph to display their recorded values.

**Save experiment data** downloads all five experiments and their settings as JSON. **Load experiment data** validates a compatible JSON file before replacing the current experiment data. Previously saved notebook files are supported. Earlier notes remain in local storage but are not included in new experiment-data exports. **Export all series CSV** saves all series for the current experiment; **Save graph** saves the selected series as SVG. The browser also attempts to save data locally. Download a JSON backup to transfer data to another device.

In quadrat fieldwork, the random and edge strategies sample without replacement. Manual mode permits mouse, touch or keyboard selection. A full census samples all 100 cells; the edge strategy has 36 eligible cells.

**Reset this experiment** clears that experiment's measurements after confirmation while keeping its setup and seed. Other experiments are not reset. **Projection view** increases important text. Tables and graphs can scroll horizontally on narrow screens.

The five models produce simulated data for teaching, not real measurements. See `SCIENCE.md` for the equations, sources and limitations. Keep the HTML, CSS and JavaScript files together when opening the lab offline.
