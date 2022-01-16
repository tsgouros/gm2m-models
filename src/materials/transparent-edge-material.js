AFRAME.registerComponent('transparent-edge-material', {
  schema: {
    opaqueAngle: {type: 'float', default: 1.0 },
    transparentAngle: {type: 'float', default: 0.0 },
    makeViewAngleSymmetric: {type: 'bool', default: true},
    depthTest: {type: 'bool', default: false},
    side: {type: 'string', default: 'double', oneOf: ['front', 'back', 'double']},
  },

  init: function () {

    const vertexShader = `
  varying vec2 vUv;
  varying float viewAngle;

  uniform int makeViewAngleSymmetric;

  void main() {

    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    // calculate angle between camera and normal
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    vec3 cameraView = normalize( cameraPosition - worldPosition.xyz );
    viewAngle = dot( cameraView, worldNormal );
    // make view angle symmetric, if necessary
    viewAngle = mix(viewAngle, abs(viewAngle), float(makeViewAngleSymmetric));

    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
// Use low precision.
  precision lowp float;

  uniform float opaqueAngle;
  uniform float transparentAngle;

  uniform sampler2D emissionTex;
  uniform sampler2D alphaTex;

  varying vec2 vUv;
  varying float viewAngle;

  void main () {

    vec3 emissionRgb = texture2D(emissionTex, vUv).rgb;
    vec3 outputColor = emissionRgb;

    float alphaFromTex = texture2D(alphaTex, vUv).a;
    float edgeFadedAlpha = smoothstep(transparentAngle, opaqueAngle, viewAngle);
    float outputAlpha = alphaFromTex * edgeFadedAlpha;

    gl_FragColor = vec4( outputColor, outputAlpha );
  }
`;

  this.uniforms = {
    opaqueAngle: {type: 'float' },
    transparentAngle: {type: 'float' },
    makeViewAngleSymmetric: {type: 'int', default: 0 },
    emissionTex: { type: 't' },
    alphaTex: { type: 't' },
  };

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    this.shaderMaterial.transparent = true;
    this.uniforms.emissionTex.encoding = THREE.LinearEncoding;
    this.uniforms.alphaTex.encoding = THREE.LinearEncoding;

    let el = this.el;
    let comp = this;
    comp.scene = el.sceneEl.object3D;  
    comp.modelLoaded = false;
    let compUniforms = this.uniforms;
    let thisShaderMaterial = this.shaderMaterial;

    // After gltf model has loaded, modify its materials.
    el.addEventListener('model-loaded', function(ev){
      let mesh = el.getObject3D('mesh'); 
      if (!mesh){return;}
      //console.log(mesh);
      mesh.traverse(function(node){
        if (node.isMesh){

          // get the emissive map: 
          compUniforms.emissionTex.value = node.material.emissiveMap;
          compUniforms.alphaTex.value = node.material.map;
          thisShaderMaterial.uniforms = compUniforms;

          node.material = thisShaderMaterial;
          
          // smooth normals
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
    const sideValues = {
      'double': THREE.DoubleSide,
      'front': THREE.FrontSide,
      'back': THREE.BackSide,
    }

    this.uniforms.opaqueAngle.value = this.data.opaqueAngle;
    this.uniforms.transparentAngle.value = this.data.transparentAngle;
    this.uniforms.makeViewAngleSymmetric.value = this.data.makeViewAngleSymmetric ? 1 : 0;
    this.shaderMaterial.depthTest = this.data.depthTest;
    this.shaderMaterial.side = sideValues[this.data.side];
  },

  // tick: function (t) {
  // }

});