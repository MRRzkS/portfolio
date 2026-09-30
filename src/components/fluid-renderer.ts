import { isViewTransitionActive } from "@/lib/site-readiness";

export type FluidInput = {
  pointer: [number, number];
  velocity: [number, number];
  scroll: number;
  dark: number;
  energy: number;
  visible: boolean;
  requestRender?: () => void;
};

const vertex = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
`;
const simulation = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uPrevious;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uScroll;
  void main() {
    vec2 offset = vUv - uPointer;
    float reach = exp(-dot(offset, offset) * 12.0);
    vec2 curl = vec2(sin(vUv.y * 9.0 + uTime * 0.2), cos(vUv.x * 8.0 - uTime * 0.2));
    vec2 flow = curl * 0.0015 + uVelocity * reach * 0.045;
    flow.y += uScroll * 0.001;
    float ink = texture2D(uPrevious, clamp(vUv - flow, 0.001, 0.999)).r * 0.975;
    float splat = exp(-dot(offset, offset) * 65.0) * uEnergy * 0.075;
    gl_FragColor = vec4(vec3(clamp(ink + splat, 0.0, 1.0)), 1.0);
  }
`;
const display = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uInk;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uDark;
  void main() {
    float ink = texture2D(uInk, vUv).r;
    vec2 center = vec2(0.64 + (uPointer.x - 0.5) * 0.22, 0.55 + uScroll * 0.12);
    float gradient = exp(-length((vUv - center) * vec2(1.0, 0.7)) * 2.5);
    float fiber = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    vec3 paper = mix(vec3(0.966, 0.968, 0.980), vec3(0.08, 0.08, 0.09), uDark);
    vec3 tint = mix(vec3(0.79, 0.82, 0.87), vec3(0.17, 0.18, 0.21), uDark);
    float density = gradient * 0.3 + ink * 0.28;
    gl_FragColor = vec4(mix(paper, tint, density) + fiber * 0.008, 1.0);
  }
`;

// Dye is advected between two textures; pointer velocity supplies the flow and splats.
export function createFluidRenderer(canvas: HTMLCanvasElement, input: FluidInput, onFailure: () => void) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const programs: WebGLProgram[] = [];
  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  const buffers: WebGLBuffer[] = [];
  let frame = 0;
  let renderFrame: FrameRequestCallback | null = null;
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    delete input.requestRender;
    document.removeEventListener("visibilitychange", wake);
    document.removeEventListener("route-ready", wake);
    document.removeEventListener("theme-ready", wake);
    resizeObserver?.disconnect();
    canvas.removeEventListener("webglcontextlost", contextLost);
    gl!.useProgram(null);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.bindTexture(gl!.TEXTURE_2D, null);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, null);
    buffers.forEach((buffer) => gl!.deleteBuffer(buffer));
    framebuffers.forEach((buffer) => gl!.deleteFramebuffer(buffer));
    textures.forEach((texture) => gl!.deleteTexture(texture));
    programs.forEach((program) => gl!.deleteProgram(program));
    shaders.forEach((shader) => gl!.deleteShader(shader));
    if (!canvas.isConnected) gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }
  function contextLost(event: Event) { event.preventDefault(); dispose(); onFailure(); }
  function compile(source: string, type: number) {
    const shader = gl!.createShader(type)!;
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("Shader unavailable");
    return shader;
  }
  function program(fragment: string) {
    const result = gl!.createProgram()!;
    programs.push(result);
    gl!.attachShader(result, compile(vertex, gl!.VERTEX_SHADER));
    gl!.attachShader(result, compile(fragment, gl!.FRAGMENT_SHADER));
    gl!.linkProgram(result);
    if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) throw new Error("Shader unavailable");
    return result;
  }
  try {
    const simulationProgram = program(simulation);
    const displayProgram = program(display);
    const quad = gl.createBuffer()!;
    buffers.push(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const size = 160;
    for (let index = 0; index < 2; index++) {
      const texture = gl.createTexture()!;
      textures.push(texture);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const framebuffer = gl.createFramebuffer()!;
      framebuffers.push(framebuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Framebuffer unavailable");
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    let needsRender = true;
    let previousScroll = -1;
    let previousTheme = -1;
    let previousTime = 0;
    let readIndex = 0;
    const simulationUniforms = Object.fromEntries(["uPrevious", "uPointer", "uVelocity", "uTime", "uEnergy", "uScroll"].map((name) => [name, gl.getUniformLocation(simulationProgram, name)]));
    const displayUniforms = Object.fromEntries(["uInk", "uPointer", "uScroll", "uDark"].map((name) => [name, gl.getUniformLocation(displayProgram, name)]));
    function bindProgram(active: WebGLProgram) {
      gl!.useProgram(active);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      const position = gl!.getAttribLocation(active, "aPosition");
      gl!.enableVertexAttribArray(position);
      gl!.vertexAttribPointer(position, 2, gl!.FLOAT, false, 0, 0);
    }
    resizeObserver = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.min(700, bounds.width * Math.min(devicePixelRatio, 1.25)));
      canvas.height = Math.max(1, Math.min(850, bounds.height * Math.min(devicePixelRatio, 1.25)));
      needsRender = true;
      wake();
    });
    resizeObserver.observe(canvas);
    canvas.addEventListener("webglcontextlost", contextLost);
    renderFrame = (time: number) => {
      frame = 0;
      if (disposed) return;
      if (!input.visible || document.hidden || isViewTransitionActive()) return;
      if (time - previousTime < 32) { wake(); return; }
      previousTime = time;
      if (input.scroll !== previousScroll || input.dark !== previousTheme) {
        needsRender = true;
        input.energy = Math.max(input.energy, 0.12);
        previousScroll = input.scroll;
        previousTheme = input.dark;
      }
      if (!needsRender && input.energy < 0.002) return;
      const writeIndex = 1 - readIndex;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffers[writeIndex]);
      gl!.viewport(0, 0, size, size);
      bindProgram(simulationProgram);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, textures[readIndex]);
      gl!.uniform1i(simulationUniforms.uPrevious, 0);
      gl!.uniform2f(simulationUniforms.uPointer, ...input.pointer);
      gl!.uniform2f(simulationUniforms.uVelocity, ...input.velocity);
      gl!.uniform1f(simulationUniforms.uTime, time / 1000);
      gl!.uniform1f(simulationUniforms.uEnergy, input.energy);
      gl!.uniform1f(simulationUniforms.uScroll, input.scroll);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      readIndex = writeIndex;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas.width, canvas.height);
      bindProgram(displayProgram);
      gl!.bindTexture(gl!.TEXTURE_2D, textures[readIndex]);
      gl!.uniform1i(displayUniforms.uInk, 0);
      gl!.uniform2f(displayUniforms.uPointer, ...input.pointer);
      gl!.uniform1f(displayUniforms.uScroll, input.scroll);
      gl!.uniform1f(displayUniforms.uDark, input.dark);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      input.energy *= 0.92;
      input.velocity[0] *= 0.9;
      input.velocity[1] *= 0.9;
      needsRender = false;
      if (input.energy >= 0.002) wake();
    };
    input.requestRender = wake;
    document.addEventListener("visibilitychange", wake);
    document.addEventListener("route-ready", wake);
    document.addEventListener("theme-ready", wake);
    wake();
    return dispose;
  } catch {
    dispose();
    return null;
  }
  function wake() {
    if (!disposed && !frame && renderFrame && input.visible && !document.hidden && !isViewTransitionActive()) {
      frame = requestAnimationFrame(renderFrame);
    }
  }
}
