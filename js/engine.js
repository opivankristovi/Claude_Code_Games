// Renderer, post-processing, sky, day/night cycle and shared shader helpers.
'use strict';

TX.engine = (() => {
  const U = TX.util;
  const E = {
    renderer: null,
    composer: null,
    bloom: null,
    grade: null,
    renderPass: null,
    uniforms: null,
    quality: 'high',
    night: 0,
  };

  // Shared uniforms (same objects referenced by many materials)
  function sharedUniforms() {
    return {
      uTime: { value: 0 },
      uPlayer: { value: new THREE.Vector3(9999, 0, 9999) },
      uWind: { value: 1 },
    };
  }

  function init(canvas) {
    E.uniforms = sharedUniforms();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x87b7e8);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    E.renderer = renderer;

    const { EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass } = TX.addons;
    const composer = new EffectComposer(renderer);
    E.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    composer.addPass(E.renderPass);
    E.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.35, 0.6, 0.82);
    composer.addPass(E.bloom);
    E.grade = new ShaderPass(gradeShader());
    composer.addPass(E.grade);
    composer.addPass(new OutputPass());
    E.composer = composer;

    setQuality(localStorage.getItem('tx3d.quality') || 'high');
    window.addEventListener('resize', resize);
    resize();
  }

  function setQuality(q) {
    E.quality = q;
    localStorage.setItem('tx3d.quality', q);
    const dpr = window.devicePixelRatio || 1;
    const ratio = q === 'ultra' ? Math.min(dpr, 2) : q === 'high' ? Math.min(dpr, 1.5) : q === 'medium' ? 1 : 0.75;
    E.renderer.setPixelRatio(ratio);
    E.renderer.shadowMap.enabled = q !== 'low';
    E.bloom.enabled = q !== 'low';
    resize();
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    E.renderer.setSize(w, h, false);
    E.composer.setPixelRatio(E.renderer.getPixelRatio());
    E.composer.setSize(w, h);
    E.grade.uniforms.uResolution.value.set(w, h);
    if (E.camera) {
      E.camera.aspect = w / h;
      E.camera.updateProjectionMatrix();
    }
  }

  function render(scene, camera, opts = {}) {
    E.camera = camera;
    if (camera.aspect !== window.innerWidth / window.innerHeight) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    E.renderPass.scene = scene;
    E.renderPass.camera = camera;
    E.grade.uniforms.uTilt.value = opts.tilt ?? 0.6;
    E.composer.render();
  }

  // Color grade + vignette + tilt-shift depth of field (runs in linear HDR)
  const gradeShader = () => ({
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTilt: { value: 0.6 },
      uNight: { value: 0 },
      uFlash: { value: 0 },
      uFlashColor: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uTilt;
      uniform float uNight;
      uniform float uFlash;
      uniform vec3 uFlashColor;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        // tilt-shift: blur grows towards top and bottom edges
        float d = abs(vUv.y - 0.5);
        float blur = smoothstep(0.18, 0.5, d) * uTilt;
        if (blur > 0.01) {
          vec2 px = 1.0 / uResolution;
          vec3 acc = c; float tot = 1.0;
          for (int i = 0; i < 8; i++) {
            float a = float(i) * 0.785398;
            vec2 o = vec2(cos(a), sin(a)) * px * blur * 6.0;
            acc += texture2D(tDiffuse, vUv + o).rgb;
            acc += texture2D(tDiffuse, vUv + o * 2.0).rgb;
            tot += 2.0;
          }
          c = acc / tot;
        }
        // grade: gentle saturation, cool night
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(vec3(l), c, mix(1.12, 0.85, uNight));
        c *= mix(vec3(1.0), vec3(0.75, 0.85, 1.15), uNight * 0.6);
        // vignette
        vec2 v = (vUv - 0.5) * vec2(1.0, 0.85);
        c *= mix(1.0, smoothstep(0.85, 0.2, length(v)), 0.45);
        c = mix(c, uFlashColor * 2.0, uFlash);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });

  // ---- materials & helpers -------------------------------------------------

  let toonGradient = null;
  function toonMap() {
    if (toonGradient) return toonGradient;
    const data = new Uint8Array([70, 130, 190, 255]);
    toonGradient = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    toonGradient.minFilter = toonGradient.magFilter = THREE.NearestFilter;
    toonGradient.needsUpdate = true;
    return toonGradient;
  }

  // Inverted-hull outline as a child mesh sharing the geometry
  const outlineMats = new Map();
  function outlineMaterial(thickness, color = 0x1d1730) {
    const key = thickness + ':' + color;
    if (outlineMats.has(key)) return outlineMats.get(key);
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
    m.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         transformed += normalize(normal) * ${thickness.toFixed(4)};`
      );
    };
    outlineMats.set(key, m);
    return m;
  }
  function addOutline(mesh, thickness = 0.03) {
    const o = new THREE.Mesh(mesh.geometry, outlineMaterial(thickness));
    o.name = 'outline';
    o.raycast = () => {};
    mesh.add(o);
    return o;
  }

  // Inject wind sway (+ optional push-away-from-player) into a standard material.
  function addWind(material, { sway = 0.15, height = 1, push = 0, speed = 1.6 } = {}) {
    material.onBeforeCompile = (s) => {
      s.uniforms.uTime = E.uniforms.uTime;
      s.uniforms.uPlayer = E.uniforms.uPlayer;
      s.uniforms.uWind = E.uniforms.uWind;
      s.vertexShader = s.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
           uniform float uTime; uniform vec3 uPlayer; uniform float uWind;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vec3 basePos = vec3(0.0);
           #ifdef USE_INSTANCING
             basePos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
           #endif
           basePos = (modelMatrix * vec4(basePos, 1.0)).xyz;
           float hk = clamp(position.y * ${height.toFixed(3)}, 0.0, 1.5);
           hk *= hk;
           float ph = basePos.x * 0.35 + basePos.z * 0.27;
           float w = sin(uTime * ${speed.toFixed(3)} + ph) * 0.6 + sin(uTime * ${(speed * 2.3).toFixed(3)} + ph * 1.7) * 0.25;
           transformed.x += w * ${sway.toFixed(3)} * hk * uWind;
           transformed.z += w * ${(sway * 0.5).toFixed(3)} * hk * uWind;
           ${push > 0 ? `
           vec2 away = basePos.xz - uPlayer.xz;
           float dist = length(away);
           float pk = smoothstep(${push.toFixed(3)}, 0.0, dist) * hk;
           transformed.xz += normalize(away + 0.0001) * pk * 0.45;
           transformed.y -= pk * 0.25;` : ''}
          `
        );
    };
    return material;
  }

  // Soft round particle material (additive glow by default)
  function particleMaterial({ color = 0xffffff, size = 0.3, additive = true, opacity = 1 } = {}) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size },
        uOpacity: { value: opacity },
        uScale: { value: window.innerHeight / 2 },
      },
      vertexShader: `
        attribute float aAlpha;
        attribute float aSize;
        uniform float uSize; uniform float uScale;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * aSize * uScale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uOpacity;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor * (1.0 + a), a * vAlpha * uOpacity);
        }`,
    });
  }

  // Generic CPU particle system using THREE.Points
  class Particles {
    constructor(max, matOpts) {
      this.max = max;
      this.geo = new THREE.BufferGeometry();
      this.pos = new Float32Array(max * 3);
      this.alpha = new Float32Array(max);
      this.size = new Float32Array(max).fill(1);
      this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      this.geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
      this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
      this.mat = particleMaterial(matOpts);
      this.points = new THREE.Points(this.geo, this.mat);
      this.points.frustumCulled = false;
      this.items = [];
    }
    emit(p) {
      if (this.items.length >= this.max) this.items.shift();
      this.items.push(Object.assign({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 1, age: 0, size: 1, g: 0, drag: 0 }, p));
    }
    update(dt) {
      const it = this.items;
      for (let i = it.length - 1; i >= 0; i--) {
        const p = it[i];
        p.age += dt;
        if (p.age >= p.life) { it.splice(i, 1); continue; }
        p.vy -= p.g * dt;
        const dr = Math.max(0, 1 - p.drag * dt);
        p.vx *= dr; p.vy *= dr; p.vz *= dr;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.update) p.update(p, dt);
      }
      for (let i = 0; i < this.max; i++) {
        const p = it[i];
        if (p) {
          this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
          const k = p.age / p.life;
          this.alpha[i] = p.fade === 'in-out' ? Math.sin(k * Math.PI) : 1 - k;
          this.size[i] = p.size * (p.grow ? 1 + k * p.grow : 1);
        } else {
          this.alpha[i] = 0;
        }
      }
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.aAlpha.needsUpdate = true;
      this.geo.attributes.aSize.needsUpdate = true;
      this.mat.uniforms.uScale.value = window.innerHeight / 2;
    }
  }

  function canvasTexture(w, h, draw, { repeat = false, srgb = true } = {}) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  }

  // ---- sky & day/night ---------------------------------------------------------

  function makeSky() {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color() },
        uNight: { value: 0 },
        uTime: E.uniforms.uTime,
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: `
        uniform vec3 uTop, uHorizon, uSunColor, uSunDir;
        uniform float uNight, uTime;
        varying vec3 vDir;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uTop, pow(max(h, 0.0), 0.55));
          float sd = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunColor * (pow(sd, 900.0) * 6.0 + pow(sd, 12.0) * 0.35);
          // moon opposite the sun
          float md = max(dot(d, -normalize(uSunDir)), 0.0);
          col += vec3(0.85, 0.9, 1.0) * pow(md, 1600.0) * 4.0 * uNight;
          // stars
          vec3 sp = floor(d * 260.0);
          float s = step(0.9975, hash(sp)) * smoothstep(0.0, 0.3, h);
          s *= 0.6 + 0.4 * sin(uTime * 3.0 + hash(sp) * 40.0);
          col += vec3(s) * uNight * 1.5;
          // soft clouds
          vec2 cp = d.xz / max(d.y, 0.08) * 0.35 + vec2(uTime * 0.004, 0.0);
          float cl = 0.0;
          vec2 q = cp;
          for (int i = 0; i < 4; i++) { cl += (sin(q.x * 3.1 + sin(q.y * 2.3)) * 0.5 + 0.5) * pow(0.5, float(i)); q *= 2.07; q += 1.7; }
          cl = smoothstep(0.95, 1.45, cl) * smoothstep(0.02, 0.25, h);
          col = mix(col, mix(vec3(1.0), uSunColor, 0.25) * mix(1.0, 0.25, uNight), cl * 0.7);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat);
    sky.frustumCulled = false;
    sky.renderOrder = -1;
    return sky;
  }

  // Key frames over the day: t in [0, 1), 0 = midnight, 0.5 = noon
  const KEYS = [
    { t: 0.0, top: '#0b1430', hor: '#1d2a52', sun: '#6d7fbf', amb: 0.35, sunI: 0.35, fog: '#1a2546', night: 1 },
    { t: 0.22, top: '#1c2a5c', hor: '#ff9e6b', sun: '#ff9a5a', amb: 0.55, sunI: 0.9, fog: '#d9937a', night: 0.4 },
    { t: 0.3, top: '#4a90d9', hor: '#ffd3a1', sun: '#ffd9a8', amb: 0.9, sunI: 2.4, fog: '#cfdcea', night: 0 },
    { t: 0.5, top: '#3d8ae0', hor: '#bfe3ff', sun: '#fff5e6', amb: 1.0, sunI: 3.0, fog: '#c4dcf0', night: 0 },
    { t: 0.7, top: '#3f7fd0', hor: '#ffe0b0', sun: '#ffe2b8', amb: 0.9, sunI: 2.5, fog: '#d4dde6', night: 0 },
    { t: 0.79, top: '#2a3d7a', hor: '#ff8a5c', sun: '#ff8048', amb: 0.6, sunI: 1.1, fog: '#d0866e', night: 0.35 },
    { t: 0.88, top: '#101a3d', hor: '#36345e', sun: '#7b7fc4', amb: 0.4, sunI: 0.4, fog: '#252d55', night: 0.9 },
    { t: 1.0, top: '#0b1430', hor: '#1d2a52', sun: '#6d7fbf', amb: 0.35, sunI: 0.35, fog: '#1a2546', night: 1 },
  ];
  let _c1, _c2;
  function sampleDay(t) {
    if (!_c1) { _c1 = new THREE.Color(); _c2 = new THREE.Color(); }
    t = ((t % 1) + 1) % 1;
    let i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const k = U.smooth((t - a.t) / (b.t - a.t));
    const mix = (x, y) => _c1.set(x).lerp(_c2.set(y), k).clone();
    return {
      top: mix(a.top, b.top), hor: mix(a.hor, b.hor), sun: mix(a.sun, b.sun), fog: mix(a.fog, b.fog),
      amb: U.lerp(a.amb, b.amb, k), sunI: U.lerp(a.sunI, b.sunI, k), night: U.lerp(a.night, b.night, k),
    };
  }

  // Applies a time of day to a lighting rig {sky, sun, hemi, scene}
  function applyDay(rig, t, center) {
    const d = sampleDay(t);
    const ang = (t - 0.25) * Math.PI * 2; // sunrise at 0.25
    const sunDir = new THREE.Vector3(Math.cos(ang) * 0.8, Math.sin(ang), 0.45).normalize();
    // at night the "sun" light becomes moonlight from the opposite side
    const lightDir = sunDir.y > 0 ? sunDir : sunDir.clone().negate();
    rig.sky.material.uniforms.uTop.value.copy(d.top);
    rig.sky.material.uniforms.uHorizon.value.copy(d.hor);
    rig.sky.material.uniforms.uSunColor.value.copy(d.sun);
    rig.sky.material.uniforms.uSunDir.value.copy(sunDir);
    rig.sky.material.uniforms.uNight.value = d.night;
    rig.sun.color.copy(d.sun);
    rig.sun.intensity = d.sunI * 1.15;
    rig.sun.position.copy(center).addScaledVector(lightDir, 60);
    rig.sun.target.position.copy(center);
    rig.hemi.intensity = d.amb * 1.6;
    rig.hemi.color.copy(d.top).lerp(new THREE.Color(1, 1, 1), 0.55);
    rig.hemi.groundColor.set(d.night > 0.5 ? '#1a2238' : '#5b6b3a');
    if (rig.scene.fog) rig.scene.fog.color.copy(d.fog);
    E.night = d.night;
    E.grade.uniforms.uNight.value = d.night;
    E.bloom.strength = U.lerp(0.32, 0.9, d.night);
    E.bloom.threshold = U.lerp(0.85, 0.55, d.night);
    E.renderer.toneMappingExposure = U.lerp(1.05, 1.35, d.night);
    return d;
  }

  function lightingRig(scene, { shadowSize = 2048, shadowExtent = 26 } = {}) {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x556633, 1);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    const c = sun.shadow.camera;
    c.left = -shadowExtent; c.right = shadowExtent; c.top = shadowExtent; c.bottom = -shadowExtent;
    c.near = 1; c.far = 160;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);
    scene.add(sun.target);
    const sky = makeSky();
    scene.add(sky);
    return { hemi, sun, sky, scene };
  }

  function flash(color = 0xffffff, duration = 0.35, peak = 0.8) {
    E.grade.uniforms.uFlashColor.value.set(color);
    return U.tween(duration, (k) => {
      E.grade.uniforms.uFlash.value = peak * (1 - k);
    }, (t) => t);
  }

  return Object.assign(E, {
    init, render, resize, setQuality, toonMap, addOutline, addWind, particleMaterial, Particles,
    canvasTexture, lightingRig, applyDay, sampleDay, flash,
  });
})();
