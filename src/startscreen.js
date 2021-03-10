
AFRAME.registerComponent('start-screen', {
  schema: {},

  init: function () {
    console.log("start screen...")
    var rig = document.getElementById("rig");
    var mainScene = document.getElementById('mainScene');

    var direction = new THREE.Vector3();
    this.el.sceneEl.camera.getWorldDirection( direction );
    console.log(direction)
    var newPos = {x: direction.x * 2, y: direction.y * 2, z: direction.z * 2}
    this.el.setAttribute("position", newPos);

    // create a method that handles
    var startTour = function(event) {
      console.log("clicked, setting up tour...")
      rig.setAttribute("look-controls", "pointerLockEnabled: true")
      rig.emit("starttour");
      this.el.setAttribute("visible", false)
    }
      // adding pointer lock rig
      // loading audio
      // turning off this object
    // add starttour event to controller
    mainScene.addEventListener('click', startTour.bind(this), this.once);
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
