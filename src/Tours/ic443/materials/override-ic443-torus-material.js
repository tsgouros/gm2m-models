AFRAME.registerComponent('override-ic443-torus-material', {
  schema: {
    viewOpacityThresholds: {type: 'vec2', default: {x: 0.9, y: 0.25} }
  },

  uniforms: {
    uTime: {type: 'float', value: 0 },
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/ic443_torus_v1.png")},
    viewOpacityThresholds: {type: 'vec2', value: {x: 0.9, y: 0.25} }
  },

  init: function () {

    const vertexShader = `
      varying vec2 vUv;
      varying float viewAngleOpacity;

      uniform vec2 viewOpacityThresholds;

        void main() {

          vUv = uv;

          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

          vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

          vec3 I = normalize( cameraPosition - worldPosition.xyz );

          float viewAngle = dot( I, worldNormal );

          viewAngleOpacity = smoothstep(viewOpacityThresholds.x, viewOpacityThresholds.y, viewAngle) * smoothstep(0.0, 0.1, viewAngle);

          gl_Position = projectionMatrix * mvPosition;
        }
      `;
    const fragmentShader = `
      // Use low precision.
        precision lowp float;

        uniform sampler2D emissionTex;

        varying vec2 vUv;
        varying float viewAngleOpacity;

        void main () {

          vec4 srcImg = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y));
          vec3 srcTexture = srcImg.rgb;
          float srcAlpha = srcImg.a;
          vec3 srcGrayscale = vec3( dot( srcTexture, vec3( 0.3, 0.5, 0.2 ) ) );

          // reduce the saturation
          srcTexture = mix( srcTexture, srcGrayscale, 0.3 );

          srcTexture *= 1.0;
          srcTexture = mix(srcTexture, smoothstep(0.0, 1.0, srcTexture), 0.0);

          gl_FragColor = vec4( srcTexture, srcAlpha * viewAngleOpacity * 0.5 );
        }
      `;

    let haloMaterial  = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader
    });
    haloMaterial.transparent = true;
    this.uniforms.emissionTex.encoding = THREE.linearEncoding;

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

          // get the emissive map: 
          // this.uniforms.emissionTex.value = node.material.emissiveMap;
          // haloMaterial.uniforms = this.uniforms;

          node.material = haloMaterial;
          // node.material.blending = THREE.AdditiveBlending;
          node.material.depthTest = false;
          // node.material.side = THREE.FrontSide;

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
  },

  tick: function (t) {
    this.uniforms.uTime.value = t / 1000;
  }

});