// this is my test/idea js file for the tour component.
// this component will handle looking for the curve to follow.
// at the moment, the camera rig will have to include alongpath component,
// and all of the curve objects will be children of the rig/in the html.
// as of now, I think this will be the component that allows us to store 
// different tours, and there will be a main controller that will handle
// accessing info from the tour components to update the alongpath 
// component.

AFRAME.registerComponent('tour', {
  schema: {
    // schema will hold all relevant info about how to interact with the curve.
    dur: {type: 'int', default: 1000},
    audio: {type: 'audio', default: ''},
    playWhile: {type: 'boolean', default: false},
    text: {type: 'string', default: "No info for this tour!"}, // default: ''
    noClickText: {type: 'string'}, // default: ''
    pauseDuration: {type: 'int', default: 6000},
    textOffset: {type: 'vec3'}, // default: {x: 0, y: 0, z: 0}
    textRotate: {type: 'vec3'}, // default: {x: 0, y: 0, z: 0}
    tour_name: {type: 'string'}
  },

  init: function () { 
    // tour_name will be the curve's id name
    var tour_name = this.el.getAttribute("id")

    this.el.setAttribute("tour",
                      "tour_name: " + tour_name + ";" );
  },

  update: function () {

  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  }
});
