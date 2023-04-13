precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;

void main()
{
    // Use vRandom
    // gl_FragColor = vec4(vRandom, 1.0-vRandom, 0.6, 1.0);

    // Same color for all fragments
    // gl_FragColor = vec4(1.0, 0.6, 1.0, 1.0);

    // Color uniform
    gl_FragColor = vec4(uColor, 1.0);

    // Texture
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = textureColor;
}