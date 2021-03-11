AFRAME.registerComponent('override-tycho-halo-material', {
  schema: {
    noiseAmt: {type: 'float', default: 0.0},
    viewOpacityThresholds: {type: 'vec2', default: {x: 0.2, y: 0.1} }
  },

  uniforms: {
    noiseAmt: {type: 'float', value: 1.0},
    uTime: {type: 'float', value: 0 },
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/Tycho_Halo1_v1.png")},
    viewOpacityThresholds: {type: 'vec2', value: {x: 0.2, y: 0.1} }
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
          vec3 worldNormalSmooth = normalize(worldPosition.xyz);

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

          srcTexture *= 1.0;
          srcTexture = mix(srcTexture, smoothstep(0.0, 1.0, srcTexture), 0.0);

          gl_FragColor = vec4( srcTexture, viewAngleOpacity );
        }
      `;

    let haloMaterial  = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader
    });
    haloMaterial.transparent = true;

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
          node.material.blending = THREE.AdditiveBlending;
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
    this.uniforms.noiseAmt.value = this.data.noiseAmt;
    this.uniforms.viewOpacityThresholds.value = this.data.viewOpacityThresholds;
  },

  tick: function (t) {
    this.uniforms.uTime.value = t / 1000;
  }

});