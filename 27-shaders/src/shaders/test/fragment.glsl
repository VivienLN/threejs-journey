precision mediump float;

varying float vRandom;

void main()
{
    // Use vRandom
    // gl_FragColor = vec4(vRandom, 1.0-vRandom, 0.6, 1.0);

    // Same color for all fragments
    gl_FragColor = vec4(1.0, 0.6, 1.0, 1.0);
}