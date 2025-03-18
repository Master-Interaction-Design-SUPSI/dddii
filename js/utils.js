export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  distance(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  normalize() {
    const len = this.length();
    if (len === 0) return new Vector2();
    return new Vector2(this.x / len, this.y / len);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  static fromAngle(angle, length = 1) {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

export class Color {
  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromArray(arr) {
    if (arr.length === 3) {
      return new Color(arr[0], arr[1], arr[2]);
    } else if (arr.length === 4) {
      return new Color(arr[0], arr[1], arr[2], arr[3]);
    }
    throw new Error('Invalid array length for color');
  }

  toArray() {
    return [this.r, this.g, this.b];
  }

  toArray4() {
    return [this.r, this.g, this.b, this.a];
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  lerp(color, t) {
    return new Color(
      this.r + (color.r - this.r) * t,
      this.g + (color.g - this.g) * t,
      this.b + (color.b - this.b) * t,
      this.a + (color.a - this.a) * t
    );
  }

  clamp() {
    return new Color(
      Math.max(0, Math.min(1, this.r)),
      Math.max(0, Math.min(1, this.g)),
      Math.max(0, Math.min(1, this.b)),
      Math.max(0, Math.min(1, this.a))
    );
  }

  addVariation(amount) {
    return new Color(
      this.r + (Math.random() * 2 - 1) * amount,
      this.g + (Math.random() * 2 - 1) * amount,
      this.b + (Math.random() * 2 - 1) * amount,
      this.a
    ).clamp();
  }
}

export class CanvasUtils {
  static resizeCanvas(canvas) {
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    
    // Always set the canvas to full window size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    const gl = canvas.getContext('webgl2');
    if (gl) {
      // Always use full viewport - we'll handle aspect ratio in the shader and coordinate mapping
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    return true;
  }

  static createCanvasElement() {
    const canvas = document.createElement('canvas');
    return canvas;
  }

  static extractImageData(image) {
    const canvas = this.createCanvasElement();
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

export function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}