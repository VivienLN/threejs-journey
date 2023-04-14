uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uSize;

attribute vec3 position;
attribute vec2 uv;
attribute float aElevation;
attribute float aVisible; // 0 or 1, because no boolean in GLSL

varying float vVisible;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z = aElevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uSize;

    // Size attenuation
    // From https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/points.glsl.js
    // gl_PointSize *= ( scale / - mvPosition.z );
    gl_PointSize *= ( 1.0 / - viewPosition.z );

    // Pass visible attribute to fragment
    vVisible = aVisible;
}