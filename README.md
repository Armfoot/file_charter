# Fetch raw time data into chart/table

This is a [C3][1]/[D3][2] example that uses hourly [air quality data][3] fetched from text files that is depicted into a graph/chart and a table.

Data from a specific date can be directly depicted or daily/monthly averages can be dynamically calculated and depicted by choosing the appropriate dropdowns.

## Usage

Access directly the [project Github page](//armfoot.github.io/file_charter) or clone/download the project and open index.html in a browser.

Use the `select` dropdowns for updating the chart/table values or changing the type of chart to depict. A few notes to consider:

* The chart can be zoomed by scrolling with the mouse wheel on the chart area.
* After zooming, the time axis can be shifted leftwards or rightwards by clicking on a chart's point and dragging it accordingly.
* After a selection is made in any of the closed/collapsed dropdowns the keyboard's left/right or up/down keys can be pressed to change the selected value and dynamically generate the respective data.
* **Hourly** data is the default source data (read directly from the respective source file).
* By clicking in one of the **Year** or **Month** radio buttons, an automatic sum and average is performed on source data.
* Before performing monthly or daily sums, if a row value is missing, the previous row's value is used. The value 0 is assumed if no previous value was found on the respective day.
* In the **Hourly** data, -1 is assigned to empty values before a non-empty value is found on the row, or -10 after these are found.
* Selecting a different **Type** only modifies the aspect and visualization of the chart.


### Instructions for developers

Several CSS/SASS and Lint packages can be installed by executing the [Node.js Package Manager](https://www.npmjs.com/get-npm) in the root (`package.json`'s folder):

    npm install

A `node_modules` will be created in the root with the downloaded packages and the following will be automatically executed after a successful install:

    npm run build

Console output may then be useful for linting:

- `npm run watch:lint` - lint errors output will be provided every time an HTML, JS or SASS file is saved.
- `npm run watch:css` - any `*.scss` change results in a new CSS file (SASS pre-processor) with the browser-specific prefixes added by the [autoprefixer](https://github.com/postcss/autoprefixer).

### IDE configuration

Your IDE may be further configured by using the following plugins:
- [`.editorconfig`](http://editorconfig.org/#download)
- [`.stylelintrc`](https://github.com/stylelint/stylelint/blob/master/docs/user-guide/complementary-tools.md#editor-plugins)
- [`.eslintrc`](http://eslint.org/docs/user-guide/integrations#editors)

## Structure

### CSS

[BEM-style](https://medium.com/@dte/understanding-css-selector-specificity-a02238a02a59) classes were used for retaining selectors' low specificity.

The only CSS file generated is `global.css`, which is a compilation of the several area-specific-styles (SCSS files) in the *SASS* folder.

### Javascript

[C3.js][1] and [D3.js (version 3.5.17)][2] libraries were used to respectively construct the chart and the table. These were not added as `devDependencies` in `package.json`, they are directly read from the `/vendor` folder.

`main.js` uses *strict* mode, ES6 features and the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to get the data-files.
Access to the DOM and auxiliar methods were separated into regions starting with `//BOR` and ending with `//EOR`.

`cors-fetch.js` is an alternative data-fetching method (currently commented) which performs a direct `POST` request to the server holding the data. For this method to be used by a different domain, a header must be set on the server (e.g. `Header set Access-Control-Allow-Origin "*"`).

### Data

All air quality data samples were downloaded from [qualar.apambiente.pt][3]. The header names on the top row of each file were modified to the respective chemical formulas.

[1]: //c3js.org
[2]: https://d3js.org/
[3]: //qualar.apambiente.pt
