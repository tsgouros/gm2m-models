AFRAME.registerComponent('ar-text',{
  schema: {
    title: {type: 'string', default: 'Shock wave'},
    description: {type: 'string', default: 'The shock wave from the explosion'},
    audio: {type: 'string', default: 'audio1'},
    isModelTitle: {type: 'boolean', default: false},
  },

  init:function(){
    let icon = document.createElement('a-plane');
    icon.setAttribute("render-order", "ui");
    icon.setAttribute("color", "#FFF");
    icon.setAttribute("material", "shader: flat; src: #sheet; transparent: true; depth-test: false;");
    icon.setAttribute("spritesheet-animation", "rows: 6; columns: 6; frameDuration: 0.05; loop: true;");
    icon.setAttribute('look-at', '[camera]');
    icon.setAttribute("position", { x: 0, y: 0, z: 0});
    icon.setAttribute("scale", { x: 2, y: 2, z: 2});
    icon.classList.add('clickable');
    icon.setAttribute('clickhandler', 'audioId: ' + this.data.audio + ';');

    let text = document.createElement('a-text');
    text.setAttribute("visible", false);
    text.setAttribute("value", this.data.title);
    text.setAttribute("material", "shader: flat; depth-test: false;");
    text.setAttribute("look-at", "[camera]");
    text.setAttribute("position", { x: 0.5, y: 0, z: 0});
    text.setAttribute("scale", { x: 1.5, y: 1.5, z: 1.5});
    text.setAttribute("render-order", "texts");

    let bodyText = document.createElement('a-text');
    bodyText.setAttribute("value", this.data.description);
    bodyText.setAttribute("position", { x: 0.025, y: -0.16, z: 0});
    bodyText.setAttribute('wrap-count', 20);
    bodyText.setAttribute("material", "shader: flat; depth-test: false;");
    bodyText.setAttribute('line-height', 60);
    bodyText.setAttribute("scale", { x: 0.2, y: 0.2, z: 0.2});
    bodyText.setAttribute('baseline', 'top');
    bodyText.setAttribute("render-order", "texts");

    this.el.appendChild(icon);
    icon.appendChild(text);
    text.appendChild(bodyText);

    this.icon = icon;
    this.text = text;
    this.bodyText = bodyText;
  },

});