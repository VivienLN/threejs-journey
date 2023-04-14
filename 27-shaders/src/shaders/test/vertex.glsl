uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform vec2 uPhase;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;

varying float vRandom;
varying float vElevation;
varying vec2 vUv;

void main()
{
    float maxZ = .03;

    // All in one line
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    // Separated 
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // Wave effect
    modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime * -4.0) * maxZ;
    modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime * 2.0) * maxZ;
    // Random effect
    // modelPosition.z += aRandom * .06;

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vRandom = aRandom;
    vUv = uv;
    vElevation = modelPosition.z;
}