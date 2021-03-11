const vertexShader = `
varying float viewAngle;
varying vec3 vWorldPosition;
varying vec2 vUv;

  void main() {

    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

    vWorldPosition = worldPosition.xyz;

    vec3 I = normalize( cameraPosition - worldPosition.xyz );

    viewAngle = dot( I, worldNormal );

    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
// Use medium precision.
  precision mediump float;

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

  // This receives the color value from the schema, which becomes a vec3 in the shader.
  // uniform vec3 color;
  uniform vec2 opacityThresholds;
  uniform vec2 colorRampThresholds;
  uniform vec3 lowColor;
  uniform vec3 highColor;
  uniform float transparency;
  uniform float uTime;
  uniform sampler2D emissionTex;

  varying float viewAngle;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main () {

    vec3 srcTexture = texture2D(emissionTex, vec2(vUv.x, 1.0 - vUv.y)).rgb;

    float opacityNoise = smoothstep( -1.0, 1.0, mix(snoise( vWorldPosition * vec3( 1.0) + vec3( 0.0, 0.0, uTime * 0.2 ) ), snoise( vWorldPosition * vec3( 125.0 ) + vec3( 0.0, 0.0, uTime / 65.0 ) ), 0.25 )  ) * 0.5 + 0.0;

    opacityNoise = mix(opacityNoise, 1.0, smoothstep( 0.4, 0.9, viewAngle ) );

    float opacity = smoothstep( opacityThresholds.x, opacityThresholds.y, viewAngle);
    opacity *= opacityNoise;
    // opacity *= smoothstep( 0.2, 0.3, viewAngle );
    
    
    float colorRamp = smoothstep( colorRampThresholds.x, colorRampThresholds.y, opacity );
    
    float fineNoise = snoise( vWorldPosition * vec3( 100.0 ) );
    float smoothNoise = snoise ( vWorldPosition * vec3( 1.0 ) );
    float noiseMix = mix( fineNoise, smoothNoise, 0.7 );

    float colorNoise = smoothstep( -1.0, 0.7, noiseMix ) * 0.75 + 0.25;

    vec3 outputColor = mix( lowColor, highColor, colorRamp * colorNoise );

    float timeNoise = snoise( vWorldPosition * 0.1 + vec3(length(vWorldPosition) * 0.3 + uTime * -0.14) );
    timeNoise *= 0.3;
    timeNoise += 1.0;

    float finerTimeNoise = snoise( vWorldPosition * 77.0 + vec3(uTime) * 1.1 );
    finerTimeNoise *= 0.2;
    finerTimeNoise += 1.0;

    srcTexture *= 1.3;
    srcTexture = mix(srcTexture, smoothstep(0.0, 1.0, srcTexture), 0.5);
    srcTexture *= timeNoise * finerTimeNoise;

    opacity = mix( 1.0, opacity, transparency );

    gl_FragColor = vec4( srcTexture, 1.0 );
  }
`;

AFRAME.registerComponent('override-fresnel-material', {
  schema: {
    lowColor: {type: 'color', default: '#001122'},
    highColor: {type: 'color', default: '#bbddff'},
    opacityThresholds: {type: 'vec2', default: {x: 0.35, y: 0.5} },
    colorRampThresholds: {type: 'vec2', default: {x: 0.35, y: 0.5} },
    transparency: {type: 'float', default: 1 }
  },

  uniforms: {
    lowColor: {type: 'color', value: '#001122'},
    highColor: {type: 'color', value: '#bbddff'},
    opacityThresholds: {type: 'vec2', value: {x: 0.35, y: 0.5} },
    colorRampThresholds: {type: 'vec2', value: {x: 0.35, y: 0.5} },
    transparency: {type: 'float', value: 1 },
    uTime: {type: 'float', value: 0 },
    emissionTex: { type: 't' , value: new THREE.TextureLoader().load("../../textures/CloudSurfaceTexture.png")}
  },

  init: function () {

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
          // node.material.side = THREE.BackSide;

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
    this.uniforms.lowColor.value = new THREE.Color(this.data.lowColor);
    this.uniforms.highColor.value = new THREE.Color(this.data.highColor);
    this.uniforms.opacityThresholds.value = this.data.opacityThresholds;
    this.uniforms.colorRampThresholds.value = this.data.colorRampThresholds;
    this.uniforms.transparency.value = this.data.transparency;
  },

  tick: function (t) {
    this.uniforms.uTime.value = t / 1000;
  }

});