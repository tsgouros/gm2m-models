AFRAME.registerComponent('clickhandler', {
  schema: {
    audioId: {default: 'audio1'},
    toggled: {default: false},
    selectedIconColor: {default: '#F33'},
  },

  init: function() {
    let data = this.data;
    let el = this.el;
    el.childNodes.forEach(childNode => {
      if(childNode.tagName !== undefined) {
        this.textEl = childNode;
      }
    });

    el.addEventListener('click', function() {
      // let currTime = new Date().getTime();
      // if (currTime - prevTime < 200) {
      //   return;
      // }

      let clickables = document.getElementsByClassName("clickable");
      for (let i = 0; i < clickables.length; i++) {
        let clickable = clickables.item(i);
        if(clickable.getAttribute("clickhandler", "toggled") && clickable !== el) {
          clickable.setAttribute("clickhandler", "toggled", false)
        }
      }
      el.setAttribute("clickhandler", "toggled", !data.toggled)

      // prevTime = currTime;

    });
  },

  toggleState: function() {
    const color = this.data.toggled ? this.data.selectedIconColor : "#FFF";
    this.el.setAttribute('color', color);

    this.textEl.setAttribute('visible', this.data.toggled);

    const audioEl = document.getElementById(this.data.audioId);
    if(this.data.toggled) {
      audioEl.play();
    } else {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  },

  update: function(oldData) {
    if(oldData.toggled !== this.data.toggled) {
      this.toggleState();
    }
  }
});