AFRAME.registerComponent('override-tycho-material', {
  schema: {
    viewOpacityThresholds: {type: 'vec2', default: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', default: {x: 2.6, y: 3.4} }
  },

  uniforms: {
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/Tycho_Color2Alpha2_v1.png")},
    viewOpacityThresholds: {type: 'vec2', value: {x: 0.0, y: 0.3} },
    distanceOpacityThresholds: {type: 'vec2', value: {x: 2.6, y: 3.4} }
  },

  init: function () {

    const vertexShader = `
varying vec2 vUv;
varying float opacityExponent;
varying float hueOffset;

uniform vec2 viewOpacityThresholds;
uniform vec2 distanceOpacityThresholds;

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

    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    vec3 worldNormalSmooth = normalize(worldPosition.xyz);

    vec3 I = normalize( cameraPosition - worldPosition.xyz );

    float viewAngleFine = dot( I, worldNormal );
    float viewAngleSmooth = dot( I, worldNormalSmooth );
    float vertexDistance = length(position.xyz);

    hueOffset = mapClamped( viewAngleSmooth, -0.6, 1.0, 0.0, 1.0 );
    hueOffset = pow( hueOffset, 1.9 );
    hueOffset = mapClamped( hueOffset, 0.0, 1.0, -0.1, 0.5 );

    opacityExponent = map( viewAngleSmooth, -14.5, 0.3, 1.0, 0.0 ) + mapClamped( viewAngleFine, -1.4, -0.5, 1.7, 0.0 );
    opacityExponent += map( vertexDistance, 6.5, 7.4, -0.7, -1.2 );
    opacityExponent = mapClamped( opacityExponent, 0.0, 1.0, 7.1, 1.0 );

    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
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

  varying float opacityExponent;
  varying float hueOffset;

  void main () {

    vec4 srcImg = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y));
    vec3 srcTexture = srcImg.rgb;
    float srcAlpha = srcImg.a;

    

    vec3 srcTexHsv = rgb2hsv( srcTexture );
    vec3 srcTexHueShifted = srcTexHsv + vec3( hueOffset + 2.0, 0.0, 0.0 );
    srcTexHueShifted = mod( srcTexHueShifted, vec3( 1.0, 2.0, 2.0 ));

    srcTexHueShifted = hsv2rgb( srcTexHueShifted );

    float opacity = clamp(pow( srcAlpha, 5.1 ) * 1.2, 0.0, 1.0);

    vec3 rgbOut = srcTexHueShifted;
    rgbOut *= 1.0;
    rgbOut = mix(rgbOut, smoothstep(0.0, 1.0, rgbOut), 1.0);
    rgbOut = mix( rgbOut, vec3(1.0), pow(opacity, 2.0) );


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

          node.material = fresMaterial;
          node.material.depthTest = false;
          // node.material.blending = THREE.AdditiveBlending;
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
    this.uniforms.distanceOpacityThresholds.value = this.data.distanceOpacityThresholds;
  },

  tick: function (t) {
  }

});