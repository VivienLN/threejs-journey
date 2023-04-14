precision mediump float;

uniform vec3 uColor;

varying float vVisible;

void main()
{
    // Light point (beware of performances)
    float alpha = step(.5, 1.0 - distance(gl_PointCoord, vec2(.5)) * 2.0);
    gl_FragColor = vec4(uColor, alpha * vVisible);

}