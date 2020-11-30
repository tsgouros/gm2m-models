AFRAME.registerComponent('controller', {
  schema: {},

  init: function () { 
    this.update.bind(this);
    // this is where i will handle gathering all of the tour components.
    // once gathered, I will start the tour using the along path event.
    // this.alongPath = this.el.getAttribute("alongpath")

    // checks if we are viewing on a mobile device
    // check this out and see how to get click information,
    // maybe library...
    // this.canClick = !AFRAME.utils.device.isMobile();
    // console.log(this.canClick)
    // this.once is an options object to be passed
    // to the eventlisteners. This makes it where
    // an event is only called once per invoke. 
    this.once = {once : true};
        
    this.tours = [];
    this.numTours = 0;
    this.currentTour = 0;

    // getting all the tour objects.
    this.tours = Array.from(this.el.children).map(child => child.getAttribute("tour"))
    this.numTours = this.tours.length;

    console.log(this.tours);
    console.log(this.numTours);

    // Now I will create a method to handle changing to the next tour...
    var advanceTour = function() {
      // console.log("Advancing tour...");

      // Get the alongpath attribute from the camera entity.
      var el = document.getElementById("rig");
      var alongpath = el.getAttribute("alongpath");

      // the next tour, modding will go back to the beginning if needed.
      console.log("(AT)currentTour: ", this.currentTour)
      this.currentTour = (this.currentTour + 1) % this.numTours;
      console.log("(AT)new tour number: ", this.currentTour)

      // getting new tour information...
      var tour_name = this.tours[this.currentTour].tour_name;
      var dur = this.tours[this.currentTour].dur;

      // Change the curve, and restart the animation to follow the new
      // curve. The setAttribute function restarts the animation in
      // some way that simply modifying alongpath.curve does not.
      el.setAttribute("alongpath",
                      "curve: #" + tour_name +
                      "; dur: " + dur + ";");
    };
    let advanceTourBinded = advanceTour.bind(this);

    // setting a handler to handle clicks...
    var clickHandler = function(event) {
      console.log(document.getElementById('mainScene'))
      // console.log("click handler has been activated.")

      // First, stop listening for this event.  We'll start listening
      // again after the next segment is completed.
      document.getElementById('mainScene')
        .removeEventListener('click', clickHandler);

      // Advance to the next part of the tour.
      advanceTourBinded();

      // Listen for the end of the next segment of the tour.
      document.getElementById("rig")
        .addEventListener('movingended', moveEndHandler.bind(this), this.once);
    };

    // setting a handler to update info when a tour ends
    var moveEndHandler = function(event) {
      // console.log("moveEndHandler has been activated.");

      // Find the name of the path we just finished.
      var tour = this.tours[this.currentTour];
      console.log("(MEH)currentTour: ", this.currentTour)

      var mainRig = document.getElementById("rig");
      var mainScene = document.getElementById('mainScene');

      // UPDATING TEXT WOULD HAPPEN HERE.
      // Display the text for the (end of the) path.
      var textHolder = document.getElementById("textHolder");

      // Determine what text to show.  Note that if clicking is not
      // possible, there might be alternate text to display.
      var textVal = textHolder.getAttribute("text");
      textVal.value = tour.text;
      textHolder.setAttribute("text", textVal);

      // getting diretion to face the text 
      var direction = new THREE.Vector3();
      this.el.sceneEl.camera.getWorldDirection( direction );

      // Now we determine where to display the text.
      var pos = mainRig.getAttribute("position");
      var offset = tour.textOffset;
      var textPos = {x: pos.x + offset.x + direction.x,
                 y: pos.y + offset.y + direction.y,  // to accommodate camera rig
                 z: pos.z + offset.z + direction.z};
      var textRot = tour.textRotate;
      textHolder.setAttribute("position", textPos);
      // textHolder.setAttribute("rotation", textRot);
      console.log("rendering text at:", textPos, textRot, textHolder);

      // HANDLING SOUND WOULD HAPPEN BEFORE CHECKING CLICK.
      //console.log('this: ', this)

      // There is no sound to play.  If we can click, listen for one.
      if (true) { // this.canClick
        console.log('We can click')
        // if (tour.playWhile) advanceTourBinded();
          mainScene.addEventListener('click', clickHandler.bind(this), this.once);
      } else {
        // console.log("we here...")
        // // If we can't click, pause (if a pause is specified), then click.
        // var pause = tour.pauseDuration ? 
        //             tour.pauseDuration : 1000;
        // setTimeout(clickHandler.bind(this), pause);
      }
    };

    // setting up and starting going through all of the tours!
    document.getElementById("rig").setAttribute("alongpath",
                      "curve: #" + this.tours[0].tour_name +
                      "; dur: " + this.tours[0].dur + ";");
    document.getElementById("rig").addEventListener('movingended', moveEndHandler.bind(this), this.once);


  },

  update: function () {

  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
    // console.log("pos: ", document.getElementById("rig").getAttribute("position"))
    // console.log("rot: ", document.getElementById("rig").getAttribute("rotation"))
  }
});