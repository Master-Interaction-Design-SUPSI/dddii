#version 300 es

// Set float precision
precision highp float;

// Input from vertex shader
in vec3 v_color;

// Output color
out vec4 outColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distance = length(coord);
  
  if (distance < 0.5) {
    outColor = vec4(v_color, 1.0);
  } else {
    discard;
  }
}