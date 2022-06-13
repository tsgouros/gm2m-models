AFRAME.registerComponent('override-tycho-material', {
  schema: {
    viewOpacityThresholds: {type: 'vec2', default: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', default: {x: 2.6, y: 3.4} }
  },

  uniforms: {
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/Tycho_v3_4k.png")},
    viewOpacityThresholds: {type: 'vec2', value: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', value: {x: 2.6, y: 3.4} },
    objectPos: {type: 'vec3', value: {x: 0.0, y: 0.0, z: 0.0} }
  },

  init: function () {

    const vertexShader = `
varying vec2 vUv;
varying float opacityScalar;
varying float hueOffset;

uniform vec2 viewOpacityThresholds;
uniform vec2 distanceOpacityThresholds;

uniform vec3 objectPos;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float mapClamped(float value, float min1, float max1, float min2, float max2) {
  return clamp( map( value, min1, max1, min2, max2 ), min2, max2 );
}

float mapSmoothed(float value, float min1, float max1, float min2, float max2) {
  float smoothedValue = smoothstep( min1, max1, value );
  return map( smoothedValue, 0.0, 1.0, min2, max2 );
}

  void main() {

    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    //vec4 worldNormalFour = modelMatrix * vec4( normal, 1.0 );
    //vec3 worldNormal = worldNormalFour.xyz;
    vec3 objSpacePos = worldPosition.xyz - objectPos;

    vec3 worldNormal = normalize(mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal);
    vec3 worldNormalSmooth = normalize(objSpacePos.xyz);

    vec3 I = normalize( cameraPosition - worldPosition.xyz );

    float viewAngleFine = dot( I, worldNormal );
    float viewAngleSmooth = dot( I, worldNormalSmooth );
    float vertexDistance = length(position.xyz);

    hueOffset = map( viewAngleSmooth, -1.0, 1.0, -0.1, 0.5);

    opacityScalar = mapSmoothed( abs(viewAngleFine), 0.5, 1.0, 0.0, 1.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float mapClamped(float value, float min1, float max1, float min2, float max2) {
  return clamp( map( value, min1, max1, min2, max2 ), min2, max2 );
}

float mapSmoothed(float value, float min1, float max1, float min2, float max2) {
  float smoothedValue = smoothstep( min1, max1, value );
  return map( smoothedValue, 0.0, 1.0, min2, max2 );
}

// Use low precision.
  precision lowp float;

  // hsv/rgb conversions by sam hocevar
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


  uniform sampler2D emissionTex;

  varying vec2 vUv;

  varying float opacityScalar;
  varying float hueOffset;

  void main () {

    vec4 srcImg = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y));

    // scale source image into the range needed for the color and alpha ramps 
    float srcRamp = mapClamped(srcImg.r, 0.0, 1.0, 0.4, 0.9);

    // generate the color from the source ramp 
    vec3 saturatedColor = vec3(0.0, 0.053, 0.205);
    vec3 whiteColor = vec3(1.0);
    float colorRamp = mapSmoothed(srcRamp, 0.636, 1.0, 0.0, 1.0);

    // color before hue shift
    vec3 baseColor = mix(saturatedColor, whiteColor, colorRamp);

    vec3 baseColorHsv = rgb2hsv( baseColor );
    vec3 hueShiftedHsv = baseColorHsv + vec3( hueOffset + 2.5, 0.0, 0.0 );
    hueShiftedHsv = mod( hueShiftedHsv, vec3( 1.0, 2.0, 2.0 ));
    hueShiftedHsv *= vec3( 1.0, 1.3, 1.8 );

    vec3 hueShiftedRgb = hsv2rgb( hueShiftedHsv );

    vec3 rgbOut = mix(hueShiftedRgb, smoothstep(0.0, 1.0, hueShiftedRgb), vec3(1.0));

    // generate the alpha ramp from the source ramp
    float alphaRamp = mapClamped(srcRamp, 0.64, 0.827, 0.0, 1.0);

    //float opacity = pow(alphaRamp, (1.0 - opacityScalar) * 5.3 + 1.0) * opacityScalar;
    float opacity = alphaRamp * opacityScalar;

    gl_FragColor = vec4( rgbOut, opacity );
  }
`;

    let fresMaterial  = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader
    });
    fresMaterial.transparent = true;

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
          // fresMaterial.uniforms = this.uniforms;

          let objPos = new THREE.Vector3();
          node.getWorldPosition( objPos );
          comp.uniforms.objectPos.value = objPos;

          node.material = fresMaterial;
          node.material.depthTest = false;
          // node.material.blending = THREE.AdditiveBlending;
          //node.material.side = THREE.FrontSide;
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
    this.uniforms.viewOpacityThresholds.value = this.data.viewOpacityThresholds;
    this.uniforms.distanceOpacityThresholds.value = this.data.distanceOpacityThresholds;
  },

  tick: function (t) {
  }

});