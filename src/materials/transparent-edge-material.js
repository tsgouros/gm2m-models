AFRAME.registerComponent('transparent-edge-material', {
  schema: {
    opaqueAngle: {type: 'float', default: 1.0 },
    transparentAngle: {type: 'float', default: 0.0 },
    brightnessOffset: {type: 'float', default: 0.0 },
    contrast: {type: 'float', default: 1.0 },
    gamma: {type: 'float', default: 1.0 },
    saturation: {type: 'float', default: 1.0 },
    hueOffset: {type: 'float', default: 0.0 },
    makeViewAngleSymmetric: {type: 'bool', default: true},
    depthTest: {type: 'bool', default: false},
    side: {type: 'string', default: 'double', oneOf: ['front', 'back', 'double']},
    // alphaEncoding: {type: 'string', default: 'linear', oneOf: ['linear', 'sRGB' ]},
    // emissiveEncoding: {type: 'string', default: 'linear', oneOf: ['linear', 'sRGB' ]},
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

  // sourced from https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
  vec3 rgb2hsv(vec3 c)
  {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c)
  {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  uniform float opaqueAngle;
  uniform float transparentAngle;

  uniform sampler2D emissionTex;
  uniform sampler2D alphaTex;

  uniform float brightnessOffset;
  uniform float contrast;
  uniform float gamma;
  uniform float saturation;
  uniform float hueOffset;

  varying vec2 vUv;
  varying float viewAngle;

  void main () {

    vec3 emissionRgb = texture2D(emissionTex, vUv).rgb;

    vec3 gammaRgb = pow(emissionRgb, vec3(gamma));
    vec3 contrastRgb = (gammaRgb - vec3(0.5)) * vec3(contrast) + vec3(0.5);
    vec3 contrastHsv = rgb2hsv(contrastRgb);

    vec3 saturationHsv = contrastHsv * vec3(1.0, saturation, 1.0);
    vec3 hueBrightnessHsv = saturationHsv + vec3(hueOffset, 0.0, brightnessOffset);

    vec3 outputColor = hsv2rgb(hueBrightnessHsv);

    float alphaFromTex = texture2D(alphaTex, vUv).a;
    float edgeFadedAlpha = smoothstep(transparentAngle, opaqueAngle, viewAngle);
    float outputAlpha = alphaFromTex * edgeFadedAlpha;

    gl_FragColor = vec4( outputColor, outputAlpha );
  }
`;

  this.uniforms = {
    opaqueAngle: {type: 'float' },
    transparentAngle: {type: 'float' },
    brightnessOffset: {type: 'float' },
    contrast: {type: 'float' },
    gamma: {type: 'float' },
    saturation: {type: 'float' },
    hueOffset: {type: 'float' },
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
    // this.uniforms.emissionTex.encoding = THREE.LinearEncoding;
    // this.uniforms.alphaTex.encoding = THREE.LinearEncoding;

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
    const encodingValues = {
      'linear': THREE.LinearEncoding,
      'sRGB': THREE.sRGBEncoding,
    }

    this.uniforms.opaqueAngle.value = this.data.opaqueAngle;
    this.uniforms.transparentAngle.value = this.data.transparentAngle;
    this.uniforms.brightnessOffset.value = this.data.brightnessOffset;
    this.uniforms.contrast.value = this.data.contrast;
    this.uniforms.gamma.value = this.data.gamma;
    this.uniforms.saturation.value = this.data.saturation;
    this.uniforms.hueOffset.value = this.data.hueOffset;
    this.uniforms.makeViewAngleSymmetric.value = this.data.makeViewAngleSymmetric ? 1 : 0;
    this.shaderMaterial.depthTest = this.data.depthTest;
    this.shaderMaterial.side = sideValues[this.data.side];
    // this.uniforms.emissionTex.encoding = encodingValues[this.data.emissiveEncoding];
    // this.uniforms.emissionTex.needsUpdate = true;
    // this.uniforms.alphaTex.encoding = encodingValues[this.data.alphaEncoding];
    // this.uniforms.alphaTex.needsUpdate = true;
  },

  // tick: function (t) {
  // }

});