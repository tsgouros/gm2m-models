// Use medium precision.
  precision mediump float;

  // This receives the color value from the schema, which becomes a vec3 in the shader.
  uniform vec3 color;
  varying float viewAngle;

  void main () {
    gl_FragColor = vec4( color, viewAngle);
  }