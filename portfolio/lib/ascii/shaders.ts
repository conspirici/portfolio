export const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_quadVertex;
in vec2 a_position;
in vec2 a_size;
in vec4 a_uvRect;
in vec4 a_color;
in vec4 a_animState;

uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform float u_cellSizeMultiplier;

out vec2 v_uv;
out vec4 v_color;
out float v_glow;
out float v_blur;

void main() {
    // 1. Calculate cover scale
    float scaleX = u_resolution.x / u_imageResolution.x;
    float scaleY = u_resolution.y / u_imageResolution.y;
    float scale = max(scaleX, scaleY);
    
    // 2. Size of the image on screen in pixels
    vec2 renderSize = u_imageResolution * scale;
    
    // 3. Offset to center the image on the canvas
    vec2 offset = (u_resolution - renderSize) * 0.5;
    
    // 4. Position of this cell on screen
    vec2 pixelPos = a_position * renderSize + offset;
    vec2 quadSize = a_size * renderSize * u_cellSizeMultiplier;
    vec2 finalPixelPos = pixelPos + a_quadVertex * quadSize;
    
    // 5. Convert to NDC (-1 to 1)
    vec2 ndc = (finalPixelPos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
    
    v_uv = a_uvRect.xy + a_quadVertex * a_uvRect.zw;
    v_color = vec4(a_color.rgb, a_color.a * (1.0 + a_animState.x));
    v_glow = a_animState.y;
    v_blur = a_animState.z;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
in vec4 v_color;
in float v_glow;
in float v_blur;

uniform sampler2D u_atlas;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_gamma;
uniform float u_bloomRadius;
uniform float u_globalOpacity;
uniform vec2 u_atlasSize;

out vec4 outColor;

void main() {
    float glyphAlpha = texture(u_atlas, v_uv).a;
    
    if (v_blur > 0.01) {
        float blurAmt = v_blur * u_bloomRadius;
        vec2 texel = 1.0 / u_atlasSize;
        float a = 0.0;
        a += texture(u_atlas, v_uv + vec2(-1.0, -1.0) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(1.0, -1.0) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(-1.0, 1.0) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(1.0, 1.0) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(0.0, -1.5) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(0.0, 1.5) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(-1.5, 0.0) * texel * blurAmt).a;
        a += texture(u_atlas, v_uv + vec2(1.5, 0.0) * texel * blurAmt).a;
        glyphAlpha = (glyphAlpha + a) / 9.0;
    }
    
    vec3 color = v_color.rgb;
    // boost saturation slightly
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, 1.6);
    // apply brightness/contrast/gamma
    color = pow(clamp((color - 0.5) * u_contrast + 0.5, 0.0, 1.0), vec3(1.0 / u_gamma)) * u_brightness;
    
    if (v_glow > 0.01) {
        glyphAlpha = clamp(glyphAlpha + v_glow * 0.5, 0.0, 1.0);
        color += vec3(v_glow * 0.5);
    }
    
    float finalAlpha = glyphAlpha * v_color.a * u_globalOpacity;
    outColor = vec4(color * finalAlpha, finalAlpha);
}
`;
