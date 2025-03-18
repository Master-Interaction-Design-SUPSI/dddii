export class Shader {
  constructor(gl, type, source) {
    this.gl = gl;
    this.type = type;
    this.source = source;
    this.shader = null;
  }

  compile() {
    const gl = this.gl;
    this.shader = gl.createShader(this.type);
    gl.shaderSource(this.shader, this.source);
    gl.compileShader(this.shader);
    
    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(this.shader);
      gl.deleteShader(this.shader);
      throw new Error(`Failed to compile shader: ${error}`);
    }
    
    return this.shader;
  }
}

export class ShaderProgram {
  constructor(gl, vertexShader, fragmentShader) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.program = null;
  }

  link() {
    const gl = this.gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(this.program);
      gl.deleteProgram(this.program);
      throw new Error(`Failed to link program: ${error}`);
    }
    
    return this.program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name) {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name) {
    return this.gl.getUniformLocation(this.program, name);
  }
}

export class WebGLRenderer {
  constructor(gl) {
    this.gl = gl;
    this.program = null;
    this.attribLocations = {};
    this.uniformLocations = {};
  }

  async loadShader(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load shader from ${path}`);
    }
    return await response.text();
  }

  async init() {
    try {
      const vertexSource = await this.loadShader('shaders/vertex.glsl');
      const fragmentSource = await this.loadShader('shaders/fragment.glsl');
      
      const vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource);
      
      const compiledVertexShader = vertexShader.compile();
      const compiledFragmentShader = fragmentShader.compile();
      
      const shaderProgram = new ShaderProgram(this.gl, compiledVertexShader, compiledFragmentShader);
      this.program = shaderProgram.link();
      
      shaderProgram.use();
      
      this.attribLocations = {
        position: shaderProgram.getAttribLocation('a_position'),
        color: shaderProgram.getAttribLocation('a_color')
      };
      
      this.uniformLocations = {
        resolution: shaderProgram.getUniformLocation('u_resolution'),
        time: shaderProgram.getUniformLocation('u_time'),
        pointSize: shaderProgram.getUniformLocation('u_pointSize')
      };
      
      return this;
    } catch (error) {
      console.error('Error initializing WebGL:', error);
      throw error;
    }
  }

  setBlendMode() {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
  
  getMaxPointSize() {
    return this.gl.getParameter(this.gl.ALIASED_POINT_SIZE_RANGE)[1];
  }
}

export async function initWebGL(gl) {
  const renderer = new WebGLRenderer(gl);
  return await renderer.init();
}