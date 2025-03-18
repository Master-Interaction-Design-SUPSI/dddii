#version 300 es

// Vertex attributes
in vec2 a_position;
in vec3 a_color;

// Uniform variables
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pointSize;

// Output to fragment shader
out vec3 v_color;

void main() {
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
  clipSpace.y *= -1.0;
  
  gl_Position = vec4(clipSpace, 0.0, 1.0);
  gl_PointSize = u_pointSize;
  v_color = a_color;
}