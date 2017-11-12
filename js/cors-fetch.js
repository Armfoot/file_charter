'use strict';

// Possible direct request to the server
// if CORS is allowed on the server, e.g.:
// Header set Access-Control-Allow-Origin "*"
// Header set Access-Control-Allow-Origin "http://other.site"
// Header set Access-Control-Allow-Methods: "POST"
// https://stackoverflow.com/a/32931094/1326147
// https://stackoverflow.com/a/10636765/1326147
/*
function readFile(operatingFunc) {
  fetch('http://qualar.apambiente.pt/excel_new.php', {
    // mode: 'no-cors', // this mode's response does not return data
    method: 'post',
    headers: {
      // 'Accept': 'application/json',
      // 'Content-Type': 'application/json'
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    // for json bodies: JSON.stringify({rede: x, ...})
    body: 'rede=2&estacao=3072&ano=' + // Entrecampos
          getEl('chosen-year').value +
          '&day0=1&month0=1&day1=31&month1=12'
  })
  .then(response => response.text())
  .then(operatingFunc);
}
*/
