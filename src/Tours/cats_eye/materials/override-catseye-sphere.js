AFRAME.registerComponent('override-catseye-sphere', {
  schema: {
    
    opacity: {type: 'float', default: 0.4 }
  },

  uniforms: {
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/catseye_sphere.png")},
    opacity: { type: 'float', value: 0.4 },
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
  uniform float opacity;

  varying vec2 vUv;

  void main () {

    vec4 srcImg = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y));
    vec3 srcTexture = srcImg.rgb;
    float colorBW = dot(srcTexture, vec3(0.3, 0.5, 0.2));
    vec3 colorGraded = mix(srcTexture, vec3(colorBW), 0.0);
    float srcAlpha = srcImg.a * opacity;

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

    // After gltf model has loaded, modify its materials.
    el.addEventListener('model-loaded', function(ev){
      let mesh = el.getObject3D('mesh'); 
      if (!mesh){return;}
      //console.log(mesh);
      mesh.traverse(function(node){
        if (node.isMesh){
          node.material = fresMaterial;
          node.material.depthTest = false;
          node.material.side = THREE.DoubleSide;

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
    this.uniforms.opacity.value = this.data.opacity;
  },

  tick: function (t) {
  }

});