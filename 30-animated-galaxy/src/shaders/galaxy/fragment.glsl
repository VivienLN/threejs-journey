varying vec3 vColor;

void main()
{
    // Circle
    // float strength = 1.0 - distance(gl_PointCoord, vec2(.5));
    // strength = step(.5, strength);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // Diffuse
    // float strength = 1.0 - distance(gl_PointCoord, vec2(.5)) * 2.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // Light point (beware of performances)
    float strength = pow(1.0 - distance(gl_PointCoord, vec2(.5)), 10.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);

}