let tourURL = 'tychoTour.json';

console.log('fetching the tour');

fetch(tourURL)
  .then(response => response.json())
  .then(json => loadTour(json));

let loadTour = (json) => {
  const stops = json["stops"]

  var sceneEl = document.querySelector('a-scene');
  
  // add the parent controller entity
  // var controllerEl = sceneEl.querySelector('#tour-controller');
  var controllerEl = document.getElementById('tour-controller');
  // var controllerEl = document.createElement('a-entity');

  // add a curve entity for each stop, and set its attributes 
  for (const stopKey in stops) {
    const stopValues = stops[stopKey];

    var curveEl = document.createElement('a-curve');
    const stopAttrs = stopValues["attributes"];
    
    for (const key in stopAttrs) {
      curveEl.setAttribute(key, stopAttrs[key]);
    }

    // add in the curve points for the current stop 
    var curvePts = stopValues["curvePoints"];
    
    for (const value of curvePts ) {
      var curvePtEl = document.createElement('a-curve-point');
      curvePtEl.setAttribute('position', value);
      curveEl.appendChild(curvePtEl);
    }
    controllerEl.appendChild(curveEl);
  }

  controllerEl.setAttribute("sound", "volume", "0.75");
  controllerEl.setAttribute('controller', '');
}