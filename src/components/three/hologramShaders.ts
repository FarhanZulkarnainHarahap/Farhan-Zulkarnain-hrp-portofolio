export const hologramVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGlitchStrength;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vGlitch;

  float hash(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float cycle = mod(uTime, 4.5);
    float glitchWindow =
      smoothstep(3.55, 3.68, cycle) *
      (1.0 - smoothstep(4.12, 4.35, cycle));
    float sliceId = floor((position.y + 2.0) * 11.0);
    float activeSlice = step(0.72, hash(sliceId + floor(uTime * 18.0)));
    float distortion = glitchWindow * activeSlice * uGlitchStrength;

    transformed.x += distortion * sin(sliceId * 4.3 + uTime * 38.0);
    transformed.z += distortion * 0.35 * cos(sliceId * 2.1 + uTime * 27.0);
    transformed.y += sin(uTime * 1.7 + position.x * 4.0) * 0.004;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vGlitch = distortion;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const hologramFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vGlitch;

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vWorldNormal)), 2.2);

    float scanline = sin(gl_FragCoord.y * 1.55 - uTime * 16.0) * 0.5 + 0.5;
    float fineScanline = sin(gl_FragCoord.y * 4.2 + uTime * 6.0) * 0.5 + 0.5;
    float scanMask = mix(0.62, 1.0, scanline) * mix(0.88, 1.0, fineScanline);

    // Slightly offset channel phases create a compact RGB-split illusion.
    float channelOffset = 1.5 + fresnel * 2.5 + vGlitch * 65.0;
    float redPhase =
      sin((gl_FragCoord.y + channelOffset) * 1.55 - uTime * 16.0) * 0.5 + 0.5;
    float bluePhase =
      sin((gl_FragCoord.y - channelOffset) * 1.55 - uTime * 16.0) * 0.5 + 0.5;

    vec3 gradient = mix(
      uColorA,
      uColorB,
      clamp(vUv.y + fresnel * 0.22, 0.0, 1.0)
    );
    vec3 splitColor = vec3(
      gradient.r * mix(0.72, 1.25, redPhase),
      gradient.g * scanMask,
      gradient.b * mix(0.72, 1.28, bluePhase)
    );

    float glitchBand = step(
      0.92,
      hash(vec2(floor(gl_FragCoord.y * 0.12), floor(uTime * 24.0)))
    ) * min(1.0, vGlitch * 42.0);
    splitColor += vec3(0.7, 0.1, 1.0) * glitchBand;

    float pulse = 0.88 + sin(uTime * 2.2) * 0.08;
    float alpha =
      (0.28 + fresnel * 0.72) *
      scanMask *
      pulse *
      uOpacity;

    gl_FragColor = vec4(splitColor * (0.72 + fresnel * 1.35), alpha);
  }
`;
