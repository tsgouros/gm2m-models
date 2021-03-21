AFRAME.registerComponent('make-tour', {
  init: function () {

    const srcJson = {
  "stops": {

    "1": {
      "attributes": {
        "id": "one",
        "tour": {
          "audio": "#audio1",
          "dur": "3000",
          "text": "This 3D model reveals details of the turbulent debris created by an exploded star that was observed by the Danish astronomer Tycho Brahe in the year 1572."
        }
      },
      "curvePoints": [ "0.0 0.1 -0.1", "-0.0 -2.1 6.1", "-0.3 -1.8 8.6" ]
    },

    "2": {
      "attributes": {
        "id": "two",
        "tour": {
          "audio": "#audio2",
          "dur": "3000",
          "text": "A shock wave produced by the expanding debris from the explosion is outlined by the sharp blue-purple circular arcs of twenty million degree gas seen on the outer rim."
        }
      },
      "curvePoints": [ "-0.3 -1.8 8.6", "2.9 -1.4 6.3", "5.1 -1.8 2.6" ]
    },

    "3": {
      "attributes": {
        "id": "three",
        "tour": {
          "audio": "#audio3",
          "dur": "3000",
          "text": "The stellar debris, which has a temperature of about ten million degrees and is visible in X-rays, shows up as mottled fingers of gas."      }
      },
      "curvePoints": [ "5.1 -1.8 2.6", "3.6 2.1 0.1", "3.2 2.3 -2.7" ]
    },

    "4": {
      "attributes": {
        "id": "four",
        "tour": {
          "audio": "#audio4",
          "dur": "3000",
          "text": "The debris for Tycho is distributed in clumps  and its outer shock wave can be seen in smooth and continuous arcs."
        }
      },
      "curvePoints": [ "3.2 2.3 -2.7", "-1.2 -0.2 -5.7", "-3.8 0.0 -5.1" ]
    },

    "5": {
      "attributes": {
        "id": "five",
        "tour": {
          "audio": "#audio5",
          "dur": "3000",
          "text": "No central point source is detected in Tycho's supernova remnant. The absence of one is consistent with other evidence that Tycho is a Type Ia supernova, which is thought to signal the detonation and destruction of a white dwarf star."
        } 
      },
      "curvePoints": [ "-3.8 0.0 -5.1", "-5.3 -0.2 -1.1", "0.0 0.1 -0.1" ]
    }
  }
}

    const stops = srcJson["stops"]

    var sceneEl = document.querySelector('a-scene');
    
    // add the parent controller entity
    var controllerEl = document.createElement('a-entity');
    controllerEl.setAttribute('controller', '');
    controllerEl.setAttribute("sound", "volume", "0.75");

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

    sceneEl.appendChild(controllerEl);
  }
});