AFRAME.registerShader('custom-shader', {
  schema: {
    color: {type: 'color', is: 'uniform', default: 'red'}
  },

  vertexShader:
`
  varying float viewAngle;

  void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

    vec3 I = normalize( cameraPosition - worldPosition.xyz );

    viewAngle = dot( I, worldNormal );

    gl_Position = projectionMatrix * mvPosition;
  }
`,

  fragmentShader:
`
  // Use medium precision.
  precision mediump float;

  // This receives the color value from the schema, which becomes a vec3 in the shader.
  uniform vec3 color;
  varying float viewAngle;

  void main () {
    gl_FragColor = vec4( color, viewAngle);
  }
`

});