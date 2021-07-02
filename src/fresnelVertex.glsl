varying float viewAngle;

  void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

    vec3 I = normalize( cameraPosition - worldPosition.xyz );

    viewAngle = dot( I, worldNormal );

    gl_Position = projectionMatrix * mvPosition;
  }