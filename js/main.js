'use strict';

//BOR constants
const chr3 = c3,
      doc3 = d3;

const defaultTemplate = {
  x: {
    label: {
      position: 'outer-left'
    },
    type: 'category'
  },
  y: {
    label: {
      text: 'Common scale',
      position: 'outer-middle'
    }
  },
  y2: {
    show: true,
    label: {
      text: 'CO scale',
      position: 'outer-middle'
    }
  }
}
const dayTemplate = JSON.parse(JSON.stringify(defaultTemplate)),
      hourTemplate = JSON.parse(JSON.stringify(defaultTemplate)),
      monthTemplate = JSON.parse(JSON.stringify(defaultTemplate)),
      ROW_SEP = '\n',
      CELL_SEP = '\t',
      DATE_SEP = '/',
      ROW_REGEX_REPL = [/,/g,'.'],
      HEADER_ROWS_NUM = 2,
      MIN_DAYS = 28,
      MAX_DAYS = 31,
      MAX_MONTHS = 12,
      MAX_HOURS = 24,
      hoursArr = Array(MAX_HOURS).fill().
                  map((v,i)=>doubleDigi(i)+':00'),
      daysArr = Array(MAX_DAYS).fill().
                  map((v,i)=>i+1),
      monthsArr = Array(MAX_MONTHS).fill().
                  map((v,i)=>getMonthText(Date.UTC(2017,i,1)));

dayTemplate.x.label.text = 'Day';
dayTemplate.x.categories = daysArr;
hourTemplate.x.label.text = 'Hour';
hourTemplate.x.categories = hoursArr;
monthTemplate.x.label.text = 'Month';
monthTemplate.x.categories = monthsArr;
//EOR

//BOR DOM and Files access/handle functions
function getEl(idStr) {
  return document.getElementById(idStr);
}

function getElsByClass(classStr) {
  return document.getElementsByClassName(classStr);
}

function appendOption(el, val, txt, classes = []) {
  let opt = document.createElement('option');
  opt.value = val;
  for(let c of classes) {
    opt.classList.add(c);
  }
  opt.appendChild(document.createTextNode(txt));
  el.appendChild(opt);
}

let dayEl    = getEl('chosen-day'),
    monthEl  = getEl('chosen-month'),
    yearEl   = getEl('chosen-year'),
    regionEl = getEl('chosen-region'),
    ctypeEl  = getEl('chart-type');

function prepSelects() {
  // year filling
  for (let i = yearEl.value; i <= (new Date()).getFullYear() - 1; i++) {
    appendOption(yearEl, i, i);
  }
  (yearEl.firstElementChild||yearEl.firstChild).remove();
  yearEl.lastElementChild.selected = true;

  // month filling
  for (let i = 1; i <= MAX_MONTHS; i++) {
    appendOption(monthEl, i, monthsArr[i-1]);
  }
  (monthEl.firstElementChild||monthEl.firstChild).remove();

  // day filling
  for (let i = 1; i <= MIN_DAYS; i++) {
    appendOption(dayEl, i, i);
  }
  // add class to variable days
  for (let i = MIN_DAYS + 1; i <= MAX_DAYS; i++) {
    appendOption(dayEl, i, i, ['monthly-var']);
  }
  (dayEl.firstElementChild||dayEl.firstChild).remove();
}

function changeDisplayedDays(y, m) {
  // hide days according to month
  let monthDays = daysInMonth(y, m),
      days2HideI = MAX_DAYS - monthDays,
      days2ShowI = monthDays - MIN_DAYS - 1;
  for (let i = days2ShowI; i >= 0; i--) {
    getElsByClass('monthly-var')[i].
      classList.remove('hidden');
  }
  for (let i = days2HideI + days2ShowI; i > days2ShowI; i--) {
    getElsByClass('monthly-var')[i].
      classList.add('hidden');
  }
}

function readFile(operatingFunc) {
  let filePath = `data/${regionEl.value}-${
    yearEl.value}.xls`;
  for(let f of getElsByClass('fetched-file')) {
    f.attributes.href.value = filePath;
  }

  fetch(filePath)
  .then(response => response.text())
  .then(operatingFunc);
}

function buildTable(ths) {
  // update table headers
  let th = doc3.select('#data-head tr').selectAll('th').
    data(ths);
  th.exit().remove();
  th.enter().append('th');
  th.transition().duration(1000).delay((d,i) => i*100).
    text(col => col).style('background-color','#0275d8');

  let tr = doc3.select('#data-body').selectAll('tr');
  // create maximum rows number (31 days)
  tr = tr.data(Array(MAX_DAYS));
  tr.enter().insert('tr').attr('id', (d,i) => 'row-' + doubleDigi(i));
  tr.exit().remove();
}
//EOR

//BOR misc
/**
 * Returns the month string (long) according to current locale (undefined)
 * @param dt date
 * @return month string
 *
 */
function getMonthText(dt) {
  let mstr = new Intl.DateTimeFormat(undefined, {month: 'long'}).
              format(dt);
  return mstr[0].toLocaleUpperCase() + mstr.substr(1);
}

function doubleDigi(x) {
  return (x/10>=1 ? '' : '0') + x;
}

// https://stackoverflow.com/a/27810609/1326147
// this method considers years 0-99
// (new Date(y, m, 0)).getDate() is
function daysInMonth(y, m){
  // return (new Date(y, m, 0)).getDate(); // wrong in some leap years
  y = Number(y);
  m = Number(m);
  return m===2?y&3||!(y%25)&&y&15?28:29:30+(m+(m>>3)&1);
}

Number.prototype.round = function (decimals) {
    decimals = decimals || 2;
    return Number(Number(
          Math.round(this +'e'+ decimals) +'e-'+ decimals).
          toFixed(decimals));
}
//EOR

//BOR parses
let dchart;

function parseAndGen(text, parse) {
  let year  = yearEl.value,
      month = monthEl.value,
      day   = dayEl.value,
      dataRows = text.split(ROW_SEP),
      headers = dataRows[0].split(CELL_SEP),
      filtHeads = headers.filter(v => v).slice(1), // exclude date
      rowsArr = [filtHeads];

  let curTemplate;
  switch(parse.type) {
    case 'months':
      curTemplate = monthTemplate;
      buildTable(['Month', ...filtHeads]);
      break;
    case 'days':
      curTemplate = dayTemplate;
      buildTable(['Day', ...filtHeads]);
      break;
    case 'hours':
    default:
      curTemplate = hourTemplate;
      buildTable(['Hour', ...filtHeads]);
  }

  rowsArr.push(...parse.fun(dataRows, {
      y: year,
      m: doubleDigi(month),
      d: doubleDigi(day)
    })
  );

  dchart = chr3.generate({
    bindto: '#chart',
    data: {
      rows: rowsArr,
      axes: {
        CO: 'y2'
      },
      type: ctypeEl.value
    },
    axis: curTemplate,
    zoom: {
      enabled: true
    }
  });
}

function accVals(type, hashMap, rows, time) {
  let rowArr = rows.curArr.
    // empty column values get previous row values or 0
    map((v,i) => v === '' ? rows.prevArr[i]: Number(v));
  if(rowArr.length) {
    let numMissing = rows.prevArr.length - rowArr.length,
        hourArr = numMissing > 0 ? [...rowArr,
          // values missing at the end get previous row values
          ...Array(numMissing).fill(0).
            map((v,i) => rows.prevArr[i + rowArr.length])]:
          [...rowArr];
    // preserve the current row with all fields for next iteration
    rowArr = [...hourArr];
    let hashKey = time.y + (type === 'days' ? DATE_SEP + time.m: '') +
                  DATE_SEP + doubleDigi(rows.curNum);
    if(hashMap.has(hashKey)) {
      // add previous values to rowArr
      let typeOldArr = hashMap.get(hashKey);
      for(let i = typeOldArr.length - 1; i >= 0; i--) {
        hourArr[i] += typeOldArr[i];
      }
    }
    hashMap.set(hashKey, hourArr);
  } else {
    rowArr = rows.prevArr;
  }
  return rowArr;
}

function yearlyParse() {
  readFile(text => {
    let parseType = 'months';
    parseAndGen(text, {
      type: parseType,
      fun: (dataRows, time) => {
        let monthNum = 1,
            monthsMap = new Map(),
            // exclude date
            numCols = dataRows[0].split(CELL_SEP).filter(v => v).length - 1;
        // use header to create a dummy row with 0's
        let prevRowArr = Array(numCols).fill(0);
        // exclude first couple of rows
        for(let row of dataRows.slice(HEADER_ROWS_NUM)) {
          if(row.startsWith(time.y + DATE_SEP + doubleDigi(monthNum))){
            // remove date and convert values for accumulation
            let rowArr = row.replace(...ROW_REGEX_REPL).
                          split(CELL_SEP).slice(1);
            // limit row cells to header's number of columns
            rowArr.splice(numCols);
            prevRowArr = accVals(parseType, monthsMap, {
              curArr: rowArr,
              curNum: monthNum,
              prevArr: prevRowArr
            }, time);
          } else if(row.startsWith(time.y + DATE_SEP + doubleDigi(monthNum+1))) {
            // following month
            // remove date and convert values for accumulation
            let rowArr = row.replace(...ROW_REGEX_REPL).
                          split(CELL_SEP).slice(1);
            // limit row cells to header's number of columns
            rowArr.splice(numCols);
            prevRowArr = accVals(parseType, monthsMap, {
              curArr: rowArr,
              curNum: ++monthNum,
              prevArr: prevRowArr
            }, time);
          }
        }
        // do an average of each day's values and add to table
        for(let [date, dateVals] of monthsMap) {
          let month = date.substr(-2),
              monthStr = getMonthText(new Date(date + '/01')),
              monthDays = daysInMonth(...date.split(DATE_SEP));
          // divide by number of days of the month multiplied by 24 hours/rows
          let monthAvgs = dateVals.map(v => (v/(monthDays*24)).round());
          monthsMap.set(date, monthAvgs);

          let td = doc3.select(`#row-${doubleDigi(month - 1)}`).
                    selectAll('td').data([monthStr, ...monthAvgs]);
          td.exit().remove();
          td.enter().append('td');
          td.transition().duration(1000).delay((d,i) => i*100).
            text(cell => cell);
        }

        // remove rows used for other parsing types
        for(let i = monthsMap.size; i < MAX_DAYS; i++) {
          doc3.select(`#row-${i}`).selectAll('td').remove();
        }
        return [...monthsMap.values()];
      }
    });
  });
}

function monthlyParse() {
  readFile(text => {
    let parseType = 'days';
    parseAndGen(text, {
      type: parseType,
      fun: (dataRows, time) => {
        let dayNum = 1,
            daysMap = new Map(),
            // exclude date
            numCols = dataRows[0].split(CELL_SEP).filter(v => v).length - 1;
        // use header to create a dummy row with 0's
        let prevRowArr = Array(numCols).fill(0);
        // exclude first couple of rows
        for(let row of dataRows.slice(HEADER_ROWS_NUM)) {
          if(row.startsWith(time.y + DATE_SEP + time.m +
                            DATE_SEP + doubleDigi(dayNum))){
            // remove date and convert values for accumulation
            let rowArr = row.replace(...ROW_REGEX_REPL).
                          split(CELL_SEP).slice(1);
            // limit row cells to header's number of columns
            rowArr.splice(numCols);
            prevRowArr = accVals(parseType, daysMap, {
              curArr: rowArr,
              curNum: dayNum,
              prevArr: prevRowArr
            }, time);
          } else if(row.startsWith(time.y + DATE_SEP + time.m +
                    DATE_SEP + doubleDigi(dayNum + 1))) {
            // following day
            // remove date and convert values for accumulation
            let rowArr = row.replace(...ROW_REGEX_REPL).
                          split(CELL_SEP).slice(1);
            // limit row cells to header's number of columns
            rowArr.splice(numCols);
            prevRowArr = accVals(parseType, daysMap, {
              curArr: rowArr,
              curNum: ++dayNum,
              prevArr: prevRowArr
            }, time);
          }
        }
        // do an average of each day's values and add to table
        for(let [date, dateVals] of daysMap) {
          let dayAvgs = dateVals.map(v => (v/24).round()); //24 hours
          daysMap.set(date, dayAvgs);

          let day = date.substr(-2);
          let td = doc3.select(`#row-${doubleDigi(day - 1)}`).
                    selectAll('td').data([day, ...dayAvgs]);
          td.exit().remove();
          td.enter().append('td');
          td.transition().duration(1000).delay((d,i) => i*100).
            text(cell => cell);
        }

        // remove rows used for other parsing types
        for(let i = daysMap.size; i < MAX_DAYS; i++) {
          doc3.select(`#row-${i}`).selectAll('td').remove();
        }
        return [...daysMap.values()];
      }
    });
  });
}

function dailyParse() {
  readFile(text => {
    parseAndGen(text, {
      type: 'hours',
      fun: (dataRows, time) => {
        let rowsArr = [],
            // exclude date
            numCols = dataRows[0].split(CELL_SEP).filter(v => v).length - 1;
        // exclude first couple of rows
        for(let row of dataRows.slice(HEADER_ROWS_NUM)) {
          if(row.startsWith(time.y + DATE_SEP + time.m + DATE_SEP + time.d)){
            row = row.replace(...ROW_REGEX_REPL);
            let rowArr = row.split(CELL_SEP).slice(1) // remove date
              // assign -1 to any empty values
              .map(v => v === '' ? -1 : Number(v));
            // limit row cells to header's number of columns
            rowArr.splice(numCols);
            if(rowArr.length < numCols) {
              rowArr = [...rowArr,
                // assign -10 to values that are missing from the row
                ...Array(numCols - rowArr.length).fill(-10)];
            }
            let hour = row.substr(row.indexOf(' ') + 1,2);
            let td = doc3.select(`#row-${hour}`).selectAll('td').
              data([hour, ...rowArr]);
            td.exit().remove();
            td.enter().append('td');
            td.transition().duration(1000).delay((d,i) => i*100).
              text(cell => cell);

            rowsArr.push(rowArr);
          }
        }
        // remove rows used for other parsing types
        for(let i=24; i < MAX_DAYS; i++) {
          doc3.select(`#row-${i}`).selectAll('td').remove();
        }
        return rowsArr;
      }
    });
  });
}
//EOR

//BOR events
function monthChartOn() {
  dayEl.disabled = true;
  monthEl.disabled = true;
  dayEl.parentElement.style.opacity = '0.5';
  monthEl.parentElement.style.opacity = '0.5';

  regionEl.onchange =
    yearEl.onchange =
    () => yearlyParse();

  yearlyParse();
}

function dayChartOn() {
  dayEl.disabled = true;
  monthEl.disabled = false;
  dayEl.parentElement.style.opacity = '0.5';
  monthEl.parentElement.style.opacity = '1';

  regionEl.onchange =
    yearEl.onchange =
    monthEl.onchange =
    () => monthlyParse();

  monthlyParse();
}

function hourChartOn() {
  dayEl.disabled = false;
  monthEl.disabled = false;
  dayEl.parentElement.style.opacity = '1';
  monthEl.parentElement.style.opacity = '1';

  monthEl.onchange = yearEl.onchange = () => {
    changeDisplayedDays(yearEl.value, monthEl.value);
    dailyParse();
  };
  regionEl.onchange =
    dayEl.onchange =
    () => dailyParse();

  dailyParse();
}
//EOR

//BOR on ready
document.addEventListener('DOMContentLoaded', () => {
  prepSelects();

  let hourRad  = getEl('hour-radio'),
      dayRad   = getEl('day-radio'),
      monthRad = getEl('month-radio');

  if (hourRad.checked) {
    hourChartOn();
  } else if (dayRad.checked) {
    dayChartOn();
  } else if (monthRad.checked) {
    monthChartOn();
  }

  // events
  hourRad.addEventListener('change', hourChartOn, false);
  dayRad.addEventListener('change', dayChartOn, false);
  monthRad.addEventListener('change', monthChartOn, false);
  ctypeEl.addEventListener('change',
    () => dchart.transform(ctypeEl.value), false);
});
//EOR
