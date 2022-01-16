AFRAME.registerComponent('override-catseye-xray', {
  schema: {
    viewOpacityThresholds: {type: 'vec2', default: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', default: {x: 2.6, y: 3.4} }
  },

  uniforms: {
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/catseye_xray.png")},
    viewOpacityThresholds: {type: 'vec2', value: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', value: {x: 2.6, y: 3.4} }
  },

  init: function () {

    const vertexShader = `
varying vec2 vUv;

  void main() {

    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
// Use low precision.
  precision lowp float;

  uniform sampler2D emissionTex;

  varying vec2 vUv;

  void main () {

    vec4 srcImg = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y));
    vec3 srcTexture = srcImg.rgb;
    float colorBW = dot(srcTexture, vec3(0.3, 0.5, 0.2));
    vec3 colorGraded = mix(srcTexture, vec3(colorBW), 0.0);
    float srcAlpha = srcImg.a;

    gl_FragColor = vec4( colorGraded, srcAlpha );
  }
`;

    let fresMaterial  = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader
    });
    fresMaterial.transparent = true;
    this.uniforms.emissionTex.encoding = THREE.LinearEncoding;

    let el = this.el;
    let comp = this;
    let data = this.data;
    comp.scene = el.sceneEl.object3D;  
    comp.modelLoaded = false;

    let thisComponent = this;

    // After gltf model has loaded, modify its materials.
    el.addEventListener('model-loaded', function(ev){
      let mesh = el.getObject3D('mesh'); 
      if (!mesh){return;}
      //console.log(mesh);
      mesh.traverse(function(node){
        if (node.isMesh){

          // get the emissive map: 
          // this.uniforms.emissionTex.value = node.material.emissiveMap;
          // fresMaterial.uniforms = this.uniforms;

          node.material = fresMaterial;
          node.material.depthTest = false;
          // node.material.blending = THREE.AdditiveBlending;
          node.material.side = THREE.DoubleSide;
          //node.material.side = THREE.FrontSide;

          const tempGeometry = new THREE.Geometry().fromBufferGeometry(node.geometry);

          tempGeometry.mergeVertices();
          tempGeometry.computeVertexNormals();
          tempGeometry.computeFaceNormals();

          node.geometry = new THREE.BufferGeometry().fromGeometry(tempGeometry);

        } 
      });
      comp.modelLoaded = true;
    });  
  },

  update: function (data) {
    this.uniforms.viewOpacityThresholds.value = this.data.viewOpacityThresholds;
    this.uniforms.distanceOpacityThresholds.value = this.data.distanceOpacityThresholds;
  },

  tick: function (t) {
  }

});