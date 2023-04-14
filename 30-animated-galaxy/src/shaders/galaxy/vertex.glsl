uniform float uSize;
uniform float uTime;

attribute float aScale;

varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Rotate
    float angle = atan(modelPosition.x, modelPosition.z);
    float d = length(modelPosition.xz);
    float offsetAngle = 1.0 / d * uTime * .2;
    modelPosition.x = cos(angle + offsetAngle) * d;
    modelPosition.z = sin(angle + offsetAngle) * d;
    // modelPosition.y += rotation;
    // modelPosition.y = sin(rotation) * modelPosition.x - cos(rotation) * modelPosition.y;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Point size + random scale
    gl_PointSize = uSize * aScale;

    // Size attenuation
    // From https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/points.glsl.js
    // gl_PointSize *= ( scale / - mvPosition.z );
    gl_PointSize *= ( 1.0 / - viewPosition.z );

    vColor = color;
}