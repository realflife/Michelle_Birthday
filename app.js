// =========================================================================
// 💖 MICHELLE'S BIRTHDAY 3D INTERACTIVE SURPRISE (22.10) — REALISTIC 3D GIFTS 💖
// =========================================================================

(() => {
  const SECRET_PASSCODE = "2210";

  // DOM Elements
  const webglContainer = document.getElementById("webgl-container");
  const fxCanvas = document.getElementById("fx-canvas");
  const fxCtx = fxCanvas.getContext("2d", { alpha: true });

  const bgMusic = document.getElementById("bg-music");
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const musicIcon = document.getElementById("music-icon");
  const musicLabel = document.getElementById("music-label");

  const sceneLock = document.getElementById("scene-lock");
  const sceneHub = document.getElementById("scene-hub");
  const sceneGift1 = document.getElementById("scene-gift-1");
  const sceneGift2 = document.getElementById("scene-gift-2");
  const sceneGift3 = document.getElementById("scene-gift-3");

  const passcodeModal = document.getElementById("passcode-modal");
  const passcodeCard = document.getElementById("passcode-card");
  const openLockModalBtn = document.getElementById("open-lock-modal-btn");
  const closeLockModalBtn = document.getElementById("close-lock-modal-btn");
  const secretCodeInput = document.getElementById("secret-code-input");
  const pinSlots = Array.from(document.querySelectorAll(".pin-slot"));
  const keyBtns = Array.from(document.querySelectorAll(".key-btn"));
  const passcodeStatus = document.getElementById("passcode-status");

  const giftCardBtns = Array.from(document.querySelectorAll(".gift-card-btn"));
  const backBtns = Array.from(document.querySelectorAll(".back-to-hub-btn"));
  const bloomMoreBtn = document.getElementById("bloom-more-flowers-btn");

  // Gift 1 Interactive Wish Flowers Elements
  const wishFlowerBtns = Array.from(document.querySelectorAll(".wish-flower-btn"));
  const wishRevealBox = document.getElementById("wish-reveal-box");
  const flowerProgressBadge = document.getElementById("flower-progress-badge");

  // Gift 2 Cat Museum Elements
  const catFrameCards = Array.from(document.querySelectorAll(".cat-frame-card"));
  const feedCatBtn = document.getElementById("feed-cat-btn");
  const curatorSpeechText = document.getElementById("curator-speech-text");
  const photoLightbox = document.getElementById("photo-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeLightboxBtn = document.getElementById("close-lightbox-btn");

  // Gift 3 Bouquet & Video Elements
  const bouquetShowcase = document.getElementById("bouquet-showcase");
  const videoPopupCard = document.getElementById("video-popup-card");
  const showVideoPopupBtn = document.getElementById("show-video-popup-btn");
  const hideVideoPopupBtn = document.getElementById("hide-video-popup-btn");
  const surpriseVideo = document.getElementById("surprise-video");

  let currentScene = "lock";
  let isUnlocked = false;
  let gift3PopupTimer = null;

  // Separate Device State: Mobile (<= 640px) vs Desktop/iPad (> 640px)
  function isMobileViewport() {
    return window.innerWidth <= 640;
  }

  // Quality tier is fixed at load time (fur shells / sparkles / segments)
  const LOW_QUALITY = isMobileViewport();

  const layoutState = {
    photoBaseY: 0.25,
    chestBaseY: -0.15,
    gift1BaseY: 0.15,
    gift2BaseY: 0.15,
    gift3BaseY: 0.15
  };

  // =========================================================================
  // 1. MANUAL MUSIC CONTROL
  // =========================================================================
  function updateMusicButtonUI(playing) {
    if (playing) {
      musicToggleBtn.classList.add("playing");
      musicIcon.textContent = "🎵";
      musicLabel.textContent = "ปิดเพลงประกอบ";
    } else {
      musicToggleBtn.classList.remove("playing");
      musicIcon.textContent = "🔇";
      musicLabel.textContent = "เปิดเพลงวันเกิด";
    }
  }

  musicToggleBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.volume = 0.65;
      bgMusic.play().then(() => {
        updateMusicButtonUI(true);
      }).catch(() => {});
    } else {
      bgMusic.pause();
      updateMusicButtonUI(false);
    }
  });

  surpriseVideo.addEventListener("play", () => {
    if (!bgMusic.paused) {
      bgMusic.pause();
      updateMusicButtonUI(false);
    }
  });

  // =========================================================================
  // 2. FAST PRE-RENDERED SPRITE PARTICLE ENGINE
  // =========================================================================
  let particles2D = [];
  let fxCanvasDirty = false;
  const spriteCache = {};

  function getEmojiSprite(symbol) {
    if (spriteCache[symbol]) return spriteCache[symbol];
    const c = document.createElement("canvas");
    c.width = 48;
    c.height = 48;
    const ctx = c.getContext("2d");
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, 24, 24);
    spriteCache[symbol] = c;
    return c;
  }

  ["💖", "💕", "🌸", "🌷", "🌻", "🌹", "🌺", "🐾", "🐱", "😻", "🐟", "✨", "👑"].forEach(getEmojiSprite);

  function resizeFxCanvas() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeFxCanvas);
  resizeFxCanvas();

  function spawnBurstParticles(type = "heart", count = 20) {
    const symbols = {
      heart: ["💖", "💕", "🌸", "✨"],
      flower: ["🌸", "🌷", "🌻", "🌹", "🌺", "✨"],
      cat: ["🐾", "🐱", "😻", "🐟", "💖"],
      crown: ["👑", "🌸", "💖", "✨", "🌷"]
    }[type] || ["💖", "🌸", "✨"];

    const maxParticles = isMobileViewport() ? 26 : 40;
    const allowed = Math.min(count, maxParticles - particles2D.length);
    for (let i = 0; i < allowed; i++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      particles2D.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * (0.3 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 6 - 2,
        gravity: 0.13,
        scale: (isMobileViewport() ? 0.55 : 0.65) + Math.random() * 0.4,
        alpha: 1,
        sprite: getEmojiSprite(sym)
      });
    }
    fxCanvasDirty = true;
  }

  function stepParticles2D() {
    if (particles2D.length === 0) {
      if (fxCanvasDirty) {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        fxCanvasDirty = false;
      }
      return;
    }
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    for (let i = particles2D.length - 1; i >= 0; i--) {
      const p = particles2D[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= 0.016;
      if (p.alpha <= 0 || p.y > fxCanvas.height + 40) {
        particles2D.splice(i, 1);
        continue;
      }
      fxCtx.globalAlpha = p.alpha;
      const drawSize = 40 * p.scale;
      fxCtx.drawImage(p.sprite, p.x - drawSize * 0.5, p.y - drawSize * 0.5, drawSize, drawSize);
    }
    fxCtx.globalAlpha = 1;
  }

  // =========================================================================
  // 3. THREE.JS 3D WORLD — REALISTIC RENDERING PIPELINE
  // =========================================================================
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xffd6e8, 0.025);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.2, 60);
  camera.position.set(0, 1.15, 8.8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = false;
  // Realistic colour pipeline: linear lighting + sRGB output + filmic tone mapping
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  webglContainer.appendChild(renderer.domElement);

  const MAX_ANISO = Math.min(4, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

  // -------------------------------------------------------------------------
  // Studio environment map (built once in code, no HDR download needed)
  // -------------------------------------------------------------------------
  (function buildStudioEnvironment() {
    const envScene = new THREE.Scene();
    const domeGeo = new THREE.SphereGeometry(10, 32, 16);
    const domeColors = [];
    const top = new THREE.Color(0xfff4f8);
    const mid = new THREE.Color(0xffc9dd);
    const bottom = new THREE.Color(0xd98aa8);
    const tmp = new THREE.Color();
    const posAttr = domeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const t = posAttr.getY(i) / 10;
      if (t > 0) tmp.copy(mid).lerp(top, t);
      else tmp.copy(mid).lerp(bottom, -t);
      domeColors.push(tmp.r, tmp.g, tmp.b);
    }
    domeGeo.setAttribute("color", new THREE.Float32BufferAttribute(domeColors, 3));
    envScene.add(new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

    // Soft-box light panels that create believable reflections on gold, satin & glass eyes
    const panels = [
      { pos: [0, 8, 1], size: [7, 7], col: [3.2, 3.0, 2.9] },
      { pos: [6, 3.5, 6], size: [4, 3], col: [2.6, 2.4, 2.2] },
      { pos: [-7, 2.5, -4], size: [3, 4], col: [1.8, 1.4, 1.6] },
      { pos: [-5, 1.5, 7], size: [2.5, 2], col: [1.4, 1.3, 1.3] }
    ];
    panels.forEach((p) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(p.size[0], p.size[1]),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(p.col[0], p.col[1], p.col[2]), side: THREE.DoubleSide })
      );
      panel.position.set(p.pos[0], p.pos[1], p.pos[2]);
      panel.lookAt(0, 0, 0);
      envScene.add(panel);
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(envScene, 0.035);
    scene.environment = envRT.texture;
    pmrem.dispose();
  })();

  // Three-point lighting: soft fill + warm key + pink rim
  const ambientLight = new THREE.AmbientLight(0xffeef5, 0.35);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xfff3f8, 0xffc4d8, 0.55);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfff1e6, 0.95);
  dirLight.position.set(4, 9, 6);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xffc2dc, 0.6);
  rimLight.position.set(-5, 4, -8);
  scene.add(rimLight);

  // -------------------------------------------------------------------------
  // Shared helpers: canvas textures, rounded boxes, geometry merging
  // -------------------------------------------------------------------------
  function makeCanvasTexture(w, h, draw, opts = {}) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const tex = new THREE.CanvasTexture(c);
    if (opts.srgb !== false) tex.encoding = THREE.sRGBEncoding;
    if (opts.repeat) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
    tex.anisotropy = MAX_ANISO;
    return tex;
  }

  function roundedBoxGeometry(w, h, d, radius = 0.08, bevel = 0.035) {
    const W = w - bevel * 2;
    const H = h - bevel * 2;
    const r = Math.min(radius, W / 2, H / 2);
    const x = -W / 2;
    const y = -H / 2;
    const s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + W - r, y);
    s.quadraticCurveTo(x + W, y, x + W, y + r);
    s.lineTo(x + W, y + H - r);
    s.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
    s.lineTo(x + r, y + H);
    s.quadraticCurveTo(x, y + H, x, y + H - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(0.001, d - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 5
    });
    g.center();
    return g;
  }

  // Merge many indexed BufferGeometries (position/normal/uv) into one draw call
  function mergeGeometries(geos) {
    let vCount = 0;
    let iCount = 0;
    geos.forEach((g) => {
      vCount += g.attributes.position.count;
      iCount += g.index ? g.index.count : g.attributes.position.count;
    });
    const pos = new Float32Array(vCount * 3);
    const nor = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const idx = new Uint32Array(iCount);
    let vo = 0;
    let io = 0;
    geos.forEach((g) => {
      const p = g.attributes.position;
      pos.set(p.array, vo * 3);
      nor.set(g.attributes.normal.array, vo * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, vo * 2);
      if (g.index) {
        for (let i = 0; i < g.index.count; i++) idx[io++] = g.index.array[i] + vo;
      } else {
        for (let i = 0; i < p.count; i++) idx[io++] = i + vo;
      }
      vo += p.count;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
  }

  function heartShape(scale) {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 5 * scale, y + 5 * scale);
    shape.bezierCurveTo(x + 5 * scale, y + 5 * scale, x + 4 * scale, y, x, y);
    shape.bezierCurveTo(x - 6 * scale, y, x - 6 * scale, y + 7 * scale, x - 6 * scale, y + 7 * scale);
    shape.bezierCurveTo(x - 6 * scale, y + 11 * scale, x - 3 * scale, y + 15.4 * scale, x + 5 * scale, y + 19 * scale);
    shape.bezierCurveTo(x + 12 * scale, y + 15.4 * scale, x + 16 * scale, y + 11 * scale, x + 16 * scale, y + 7 * scale);
    shape.bezierCurveTo(x + 16 * scale, y + 7 * scale, x + 16 * scale, y, x + 10 * scale, y);
    shape.bezierCurveTo(x + 7 * scale, y, x + 5 * scale, y + 5 * scale, x + 5 * scale, y + 5 * scale);
    return shape;
  }

  function createHeartGeometry(scale = 0.04, depth = 0.22) {
    const geom = new THREE.ExtrudeGeometry(heartShape(scale), {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 8,
      bevelSize: scale * 1.2,
      bevelThickness: scale * 1.2
    });
    geom.center();
    geom.rotateZ(Math.PI);
    return geom;
  }

  const smallHeartGeo = createHeartGeometry(0.025, 0.11);

  const sharedHeartMats = [
    new THREE.MeshLambertMaterial({ color: 0xff4788 }),
    new THREE.MeshLambertMaterial({ color: 0xff7eb3 }),
    new THREE.MeshLambertMaterial({ color: 0xff9ec4 }),
    new THREE.MeshLambertMaterial({ color: 0xffd166 })
  ];

  const floatingHeartsGroup = new THREE.Group();
  scene.add(floatingHeartsGroup);
  const floatingHearts = [];

  for (let i = 0; i < 24; i++) {
    const mesh = new THREE.Mesh(smallHeartGeo, sharedHeartMats[i % sharedHeartMats.length]);
    mesh.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 9,
      1.5 - Math.random() * 24
    );
    const s = 0.65 + Math.random() * 0.9;
    mesh.scale.set(s, s, s);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    floatingHeartsGroup.add(mesh);
    floatingHearts.push({
      mesh,
      rotSpeed: (Math.random() - 0.5) * 0.018,
      floatSpeed: 0.9 + Math.random() * 1.1,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y
    });
  }

  // -------------------------------------------------------------------------
  // GROUP A: SCENE 1 (3D PHOTO FRAME + LOCKED TREASURE MAILBOX CHEST)
  // -------------------------------------------------------------------------
  const lockStageGroup = new THREE.Group();
  scene.add(lockStageGroup);

  const photoCardGroup = new THREE.Group();
  photoCardGroup.position.set(-1.95, 0.25, 0);
  photoCardGroup.rotation.y = 0.28;
  lockStageGroup.add(photoCardGroup);

  const frameBoxMat = new THREE.MeshLambertMaterial({ color: 0xfff8fb });
  const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.45, 3.05, 0.16), frameBoxMat);
  photoCardGroup.add(frameMesh);

  const rimMat = new THREE.MeshLambertMaterial({ color: 0xff6fa5 });
  const rimMesh = new THREE.Mesh(new THREE.BoxGeometry(2.58, 3.18, 0.1), rimMat);
  rimMesh.position.z = -0.04;
  photoCardGroup.add(rimMesh);

  const texLoader = new THREE.TextureLoader();
  const heroPhotoSrc = window.HERO_3D_PHOTO_B64 || "pic/web_IMG_2409.jpg";
  texLoader.load(heroPhotoSrc, (texture) => {
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;
    const photoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.15, 2.55),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    );
    photoPlane.position.set(0, 0.12, 0.09);
    photoCardGroup.add(photoPlane);
  });

  const topHeartMat = new THREE.MeshLambertMaterial({ color: 0xff2e79 });
  const topHeartMesh = new THREE.Mesh(smallHeartGeo, topHeartMat);
  topHeartMesh.position.set(0, 1.72, 0.1);
  topHeartMesh.scale.set(1.3, 1.3, 1.3);
  photoCardGroup.add(topHeartMesh);

  // Locked Pink Treasure Mailbox Chest
  const mailboxChestGroup = new THREE.Group();
  mailboxChestGroup.position.set(1.75, -0.15, 0.2);
  mailboxChestGroup.rotation.y = -0.25;
  lockStageGroup.add(mailboxChestGroup);

  const chestPinkMat = new THREE.MeshLambertMaterial({ color: 0xff5c97 });
  const chestGoldMat = new THREE.MeshLambertMaterial({ color: 0xffd166 });
  const chestWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfff0f6 });

  const chestBaseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.55, 1.75), chestPinkMat);
  mailboxChestGroup.add(chestBaseMesh);

  const bandGeo = new THREE.BoxGeometry(0.22, 1.58, 1.82);
  const bandLeft = new THREE.Mesh(bandGeo, chestGoldMat);
  bandLeft.position.x = -0.82;
  const bandRight = new THREE.Mesh(bandGeo, chestGoldMat);
  bandRight.position.x = 0.82;
  mailboxChestGroup.add(bandLeft, bandRight);

  const chestLidPivot = new THREE.Group();
  chestLidPivot.position.set(0, 0.77, -0.87);
  mailboxChestGroup.add(chestLidPivot);

  const lidCylGeo = new THREE.CylinderGeometry(0.88, 0.88, 2.52, 16, 1, false, 0, Math.PI);
  lidCylGeo.rotateZ(Math.PI / 2);
  const lidMesh = new THREE.Mesh(lidCylGeo, chestPinkMat);
  lidMesh.position.set(0, 0, 0.87);
  chestLidPivot.add(lidMesh);

  const slotPlate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.08), chestWhiteMat);
  slotPlate.position.set(0, 0.35, 0.89);
  mailboxChestGroup.add(slotPlate);

  const padlockGroup = new THREE.Group();
  padlockGroup.position.set(0, 0.65, 0.96);
  mailboxChestGroup.add(padlockGroup);

  const shackleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.055, 8, 16, Math.PI), chestGoldMat);
  shackleMesh.position.y = 0.24;
  padlockGroup.add(shackleMesh);

  const lockHeartBody = new THREE.Mesh(smallHeartGeo, chestGoldMat);
  lockHeartBody.scale.set(1.45, 1.45, 1.45);
  padlockGroup.add(lockHeartBody);

  const letterGroup = new THREE.Group();
  letterGroup.position.set(0, 0.2, 0);
  mailboxChestGroup.add(letterGroup);

  const envMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.08), chestWhiteMat);
  letterGroup.add(envMesh);

  const sealHeart = new THREE.Mesh(smallHeartGeo, topHeartMat);
  sealHeart.scale.set(0.6, 0.6, 0.6);
  sealHeart.position.set(0, 0, 0.06);
  letterGroup.add(sealHeart);

  // -------------------------------------------------------------------------
  // GROUP B: SCENE 2 (3 INTERACTIVE 3D GIFTS HUB AT Z = -18)
  // -------------------------------------------------------------------------
  const hubStageGroup = new THREE.Group();
  hubStageGroup.position.set(0, 0, -18);
  hubStageGroup.visible = false;
  scene.add(hubStageGroup);

  const GIFT_BOTTOM_Y = -0.65;

  // ---------- Procedural textures ----------
  const flowerPaperTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#ffc7dc");
    g.addColorStop(1, "#ffb2cf");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const cell = w / 3;
    for (let gy = 0; gy < 3; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const cx = (gx + 0.5) * cell + ((gy % 2) ? cell * 0.18 : -cell * 0.12);
        const cy = (gy + 0.5) * cell;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 8, 6, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#f6c45a";
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(246,196,90,0.85)";
        ctx.beginPath();
        ctx.arc(cx + cell * 0.42, cy + cell * 0.36, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, { repeat: [1.5, 1.5] });

  const catPaperTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#ffd3e3";
    ctx.fillRect(0, 0, w, h);
    const cell = w / 4;
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const cx = (gx + 0.5) * cell;
        const cy = (gy + 0.5) * cell;
        if ((gx + gy) % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.beginPath();
          ctx.arc(cx, cy, 9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(240,120,165,0.55)";
          ctx.beginPath();
          ctx.ellipse(cx, cy + 4, 8, 6.5, 0, 0, Math.PI * 2);
          ctx.fill();
          [[-8, -5], [-3, -10], [3, -10], [8, -5]].forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
    }
  }, { repeat: [1.6, 1.6] });

  // Fur strand density map (white dots = hair strands) — used as alpha for shell fur
  const furStrandTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 0.9 + Math.random() * 1.5;
      const b = 0.45 + Math.random() * 0.55;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(255,255,255,${b})`);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }, { srgb: false, repeat: [7, 7] });

  // Soft fur colour texture (cream with subtle strands)
  const furColorTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#fff3e8";
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * Math.PI;
      const l = 3 + Math.random() * 5;
      ctx.strokeStyle = Math.random() > 0.5 ? "rgba(230,205,188,0.45)" : "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  }, { repeat: [3, 3] });

  // Realistic amber cat iris (UV centre of +Z on a sphere is u = 0.25, v = 0.5)
  const catIrisTex = makeCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#24140c";
    ctx.fillRect(0, 0, w, h);
    const cx = w * 0.25;
    const cy = h * 0.5;
    const R = 66;
    const iris = ctx.createRadialGradient(cx, cy, 8, cx, cy, R);
    iris.addColorStop(0, "#5a2f0e");
    iris.addColorStop(0.35, "#c9822a");
    iris.addColorStop(0.75, "#e8b04a");
    iris.addColorStop(1, "#7a4a18");
    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,45,10,0.35)";
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
      ctx.lineTo(cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4));
      ctx.stroke();
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(50,24,8,0.85)";
    ctx.beginPath();
    ctx.arc(cx, cy, R - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#070403";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 30, 44, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const marbleTex = makeCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#fbf6f3";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = `rgba(${200 + Math.random() * 30},${160 + Math.random() * 30},${175 + Math.random() * 30},${0.12 + Math.random() * 0.16})`;
      ctx.lineWidth = 0.8 + Math.random() * 2.2;
      ctx.beginPath();
      const y0 = Math.random() * h;
      ctx.moveTo(0, y0);
      ctx.bezierCurveTo(w * 0.3, y0 + (Math.random() - 0.5) * 120, w * 0.6, y0 + (Math.random() - 0.5) * 120, w, y0 + (Math.random() - 0.5) * 60);
      ctx.stroke();
    }
  });

  const contactShadowTex = makeCanvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(120,30,70,0.42)");
    g.addColorStop(0.55, "rgba(120,30,70,0.16)");
    g.addColorStop(1, "rgba(120,30,70,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  const haloTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,226,160,0.75)");
    g.addColorStop(0.35, "rgba(255,190,200,0.32)");
    g.addColorStop(1, "rgba(255,150,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  const sparkleTex = makeCanvasTexture(64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,235,190,0.8)");
    g.addColorStop(1, "rgba(255,200,150,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 4); ctx.lineTo(32, 60);
    ctx.moveTo(4, 32); ctx.lineTo(60, 32);
    ctx.stroke();
  });

  const plaqueTextTex = makeCanvasTexture(512, 212, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,248,225,0.55)";
    ctx.font = "italic 700 78px Georgia, 'Times New Roman', serif";
    ctx.fillText("Michelle", w / 2 + 2, h * 0.42 + 2);
    ctx.fillStyle = "#6b4410";
    ctx.fillText("Michelle", w / 2, h * 0.42);
    ctx.font = "600 40px Georgia, serif";
    ctx.fillStyle = "#6b4410";
    ctx.fillText("♥  22 • 10  ♥", w / 2, h * 0.8);
  });

  // ---------- Shared PBR materials ----------
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcf73, metalness: 1, roughness: 0.2 });
  const makeSatin = (hex) => new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: 0.3,
    metalness: 0.05,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
    side: THREE.DoubleSide
  });
  const makePaper = (tex) => new THREE.MeshPhysicalMaterial({
    map: tex,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.42
  });

  // ---------- Satin bow (two curved loops + knot + V-cut tails) ----------
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const bowLoopGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0.1, 0.09, 0), V3(0.26, 0.17, 0), V3(0.4, 0.13, 0), V3(0.43, 0.02, 0), V3(0.3, -0.04, 0), V3(0.12, -0.03, 0)], true),
    LOW_QUALITY ? 28 : 48, 0.024, 8, true
  );
  const bowTailGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0.1, -0.02, 0.12), V3(0.2, -0.04, 0.3), V3(0.26, -0.05, 0.46)]),
    LOW_QUALITY ? 12 : 20, 0.07, 8, false
  );
  const bowKnotGeo = new THREE.SphereGeometry(0.06, 14, 12);

  function createSatinBow(mat, scale = 1) {
    const bow = new THREE.Group();
    const loopR = new THREE.Mesh(bowLoopGeo, mat);
    loopR.scale.set(1, 1, 4);
    loopR.rotation.z = 0.22;
    const loopL = new THREE.Mesh(bowLoopGeo, mat);
    loopL.scale.set(-1, 1, 4);
    loopL.rotation.z = -0.22;
    const knot = new THREE.Mesh(bowKnotGeo, mat);
    knot.scale.set(1, 0.9, 1.6);
    const tailR = new THREE.Mesh(bowTailGeo, mat);
    tailR.scale.set(1, 0.3, 1);
    tailR.position.y = -0.03;
    const tailL = new THREE.Mesh(bowTailGeo, mat);
    tailL.scale.set(-1, 0.3, 1);
    tailL.position.y = -0.03;
    bow.add(loopR, loopL, knot, tailR, tailL);
    bow.scale.setScalar(scale);
    return bow;
  }

  // ---------- Realistic wrapped gift box (rounded lid, satin ribbon bands) ----------
  function createRealisticGiftBox({ size, paperMat, ribbonMat, withBow = true, bowScale = 1 }) {
    const group = new THREE.Group();
    const hb = size * 0.72;
    const hl = size * 0.2;
    const baseCenterY = GIFT_BOTTOM_Y + hb / 2;
    const lidCenterY = GIFT_BOTTOM_Y + hb + hl / 2 - hl * 0.35;
    const lidTopY = lidCenterY + hl / 2;

    const base = new THREE.Mesh(roundedBoxGeometry(size, hb, size, 0.07, 0.03), paperMat);
    base.position.y = baseCenterY;
    const lid = new THREE.Mesh(roundedBoxGeometry(size * 1.06, hl, size * 1.06, 0.07, 0.035), paperMat);
    lid.position.y = lidCenterY;
    group.add(base, lid);

    const band = size * 0.16;
    const baseBandA = new THREE.Mesh(roundedBoxGeometry(band, hb * 0.995, size + 0.025, 0.02, 0.01), ribbonMat);
    const baseBandB = new THREE.Mesh(roundedBoxGeometry(size + 0.025, hb * 0.995, band, 0.02, 0.01), ribbonMat);
    baseBandA.position.y = baseBandB.position.y = baseCenterY;
    const lidBandA = new THREE.Mesh(roundedBoxGeometry(band, hl + 0.02, size * 1.06 + 0.025, 0.02, 0.01), ribbonMat);
    const lidBandB = new THREE.Mesh(roundedBoxGeometry(size * 1.06 + 0.025, hl + 0.02, band, 0.02, 0.01), ribbonMat);
    lidBandA.position.y = lidBandB.position.y = lidCenterY;
    group.add(baseBandA, baseBandB, lidBandA, lidBandB);

    if (withBow) {
      const bow = createSatinBow(ribbonMat, bowScale);
      bow.position.y = lidTopY + 0.05 * bowScale;
      group.add(bow);
    }
    return { group, lidTopY };
  }

  // ---------- Layered rose geometry (merged into one draw call) ----------
  function buildRoseGeometry() {
    const unit = new THREE.SphereGeometry(1, LOW_QUALITY ? 7 : 9, LOW_QUALITY ? 5 : 7);
    const parts = [];
    const core = unit.clone();
    core.applyMatrix4(new THREE.Matrix4().makeScale(0.05, 0.075, 0.05));
    core.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.07, 0));
    parts.push(core);
    const layers = [
      { n: 4, r: 0.028, tilt: 0.2, s: 0.75 },
      { n: 6, r: 0.06, tilt: 0.55, s: 0.95 },
      { n: 7, r: 0.095, tilt: 0.98, s: 1.12 }
    ];
    layers.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        const a = (i / L.n) * Math.PI * 2 + li * 0.5;
        const h = 0.2 * L.s;
        const m = new THREE.Matrix4().makeRotationY(a)
          .multiply(new THREE.Matrix4().makeTranslation(0, 0, L.r))
          .multiply(new THREE.Matrix4().makeRotationX(L.tilt))
          .multiply(new THREE.Matrix4().makeTranslation(0, h * 0.5, 0))
          .multiply(new THREE.Matrix4().makeScale(0.075 * L.s, h * 0.5, 0.026 * L.s));
        const p = unit.clone();
        p.applyMatrix4(m);
        parts.push(p);
      }
    });
    return mergeGeometries(parts);
  }

  function buildLeafGeometry(count) {
    const unit = new THREE.SphereGeometry(1, 8, 6);
    const parts = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.4;
      const m = new THREE.Matrix4().makeRotationY(a)
        .multiply(new THREE.Matrix4().makeRotationX(0.22))
        .multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.15))
        .multiply(new THREE.Matrix4().makeScale(0.065, 0.012, 0.16));
      const p = unit.clone();
      p.applyMatrix4(m);
      parts.push(p);
    }
    return mergeGeometries(parts);
  }

  const roseGeo = buildRoseGeometry();
  const leafGeo = buildLeafGeometry(4);
  const roseMats = [0xe8457c, 0xffa3c4, 0xffd3df].map((c) => new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.55, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.5
  }));
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4fa86e, roughness: 0.5, metalness: 0 });

  function createRose(matIndex, scale = 1, withLeaves = true) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(roseGeo, roseMats[matIndex % roseMats.length]));
    if (withLeaves) {
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.y = 0.01;
      g.add(leaves);
    }
    g.scale.setScalar(scale);
    return g;
  }

  // ---------- Soft contact shadows (no shadow map needed) ----------
  const shadowPlaneGeo = new THREE.PlaneGeometry(1, 1);
  shadowPlaneGeo.rotateX(-Math.PI / 2);
  function createContactShadow() {
    const m = new THREE.Mesh(shadowPlaneGeo, new THREE.MeshBasicMaterial({
      map: contactShadowTex, transparent: true, depthWrite: false, toneMapped: false
    }));
    m.renderOrder = -1;
    hubStageGroup.add(m);
    return m;
  }

  // =========================================================================
  // GIFT 1 3D: WRAPPED FLOWER GIFT BOX WITH REAL ROSES (Left)
  // =========================================================================
  const gift1Group = new THREE.Group();
  gift1Group.position.set(-3.1, 0.15, 0);
  hubStageGroup.add(gift1Group);

  (function buildFlowerGift() {
    const { group, lidTopY } = createRealisticGiftBox({
      size: 1.42,
      paperMat: makePaper(flowerPaperTex),
      ribbonMat: makeSatin(0xfff3f7),
      withBow: true,
      bowScale: 1.15
    });
    gift1Group.add(group);

    // Rose cluster tucked beside the bow
    [[-0.36, 0.2, 0, 1.25], [0.36, -0.18, 1, 1.15], [-0.12, -0.34, 2, 1.05], [0.22, 0.3, 0, 0.95]].forEach(([x, z, mi, s]) => {
      const rose = createRose(mi, s);
      rose.position.set(x, lidTopY - 0.01, z);
      rose.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
      gift1Group.add(rose);
    });

    // Roses scattered around the base like a little garden
    const ringR = 0.98;
    [-1.15, -0.45, 0.35, 1.05, 2.0, 3.6].forEach((a, i) => {
      const rose = createRose(i, 1.2);
      rose.position.set(Math.sin(a) * ringR, GIFT_BOTTOM_Y + 0.02, Math.cos(a) * ringR);
      rose.rotation.set(Math.cos(a) * 0.35, a, -Math.sin(a) * 0.35);
      gift1Group.add(rose);
    });
  })();

  // =========================================================================
  // GIFT 2 3D: CUTE & SASSY KAWAII MOCHI CAT ON A WRAPPED GIFT (Center)
  // =========================================================================
  let catHeadGroup = null;
  let catTailPivot = null;
  let catBody = null;
  let catEyes = [];
  let catBrows = [];
  let catEars = [];
  let catWavePivot = null;
  let catChinPaw = null;
  let catTongue = null;
  let catHover = false;

  function createFluffyCatGift() {
    const root = new THREE.Group();

    const { group: box, lidTopY } = createRealisticGiftBox({
      size: 1.26,
      paperMat: makePaper(catPaperTex),
      ribbonMat: makeSatin(0xff3f86),
      withBow: false
    });
    root.add(box);

    // Cute satin bow tucked on the front-right corner of the lid
    const cornerBow = createSatinBow(makeSatin(0xff3f86), 0.56);
    cornerBow.position.set(0.46, lidTopY + 0.03, 0.48);
    cornerBow.rotation.y = -0.62;
    root.add(cornerBow);

    // Soft velvety designer-toy materials (clean, appealing, no grainy alpha noise)
    const creamFurMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffaf5,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.14,
      clearcoatRoughness: 0.65
    });
    const gingerFurMat = new THREE.MeshPhysicalMaterial({
      color: 0xff9e58,
      roughness: 0.6,
      metalness: 0,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xd96824,
      roughness: 0.65,
      metalness: 0
    });
    const pinkPadMat = new THREE.MeshPhysicalMaterial({
      color: 0xff82a9,
      roughness: 0.4,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25
    });
    const noseMat = new THREE.MeshPhysicalMaterial({
      color: 0xff4f84,
      roughness: 0.2,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1
    });
    const tongueMat = new THREE.MeshPhysicalMaterial({
      color: 0xff5c8d,
      roughness: 0.28,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15
    });
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xff6b9d,
      transparent: true,
      opacity: 0.58
    });
    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0x6b2839,
      roughness: 0.5
    });
    const eyeDarkMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e0b16,
      roughness: 0.04,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    });
    const eyeAmberMat = new THREE.MeshBasicMaterial({ color: 0xffa652 });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const collarMat = new THREE.MeshPhysicalMaterial({ color: 0xff2e79, roughness: 0.38, clearcoat: 0.5 });

    const cat = new THREE.Group();
    cat.position.set(0, lidTopY, 0.02);
    root.add(cat);

    // 1. Plump Roly-Poly Mochi Body
    const bodyGeo = new THREE.SphereGeometry(0.41, LOW_QUALITY ? 22 : 30, LOW_QUALITY ? 18 : 24);
    catBody = new THREE.Mesh(bodyGeo, creamFurMat);
    catBody.scale.set(1.1, 0.92, 0.96);
    catBody.position.set(0, 0.34, -0.02);
    cat.add(catBody);

    // Ginger back saddle patch
    const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 16), gingerFurMat);
    saddle.scale.set(1.04, 0.78, 0.88);
    saddle.position.set(0, 0.38, -0.11);
    cat.add(saddle);

    // Fluffy chest ruff (3 sculpted teardrops on the chest)
    const chestCenter = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), creamFurMat);
    chestCenter.scale.set(1.25, 0.95, 0.75);
    chestCenter.position.set(0, 0.42, 0.32);
    cat.add(chestCenter);
    [-1, 1].forEach((dir) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 12), creamFurMat);
      tuft.rotation.x = Math.PI * 0.78;
      tuft.rotation.z = dir * 0.25;
      tuft.position.set(dir * 0.09, 0.36, 0.38);
      cat.add(tuft);
    });

    // 2. Chubby Hind Feet sticking out in front showing Pink Toe Beans!
    function createPawWithBeans(scale = 1) {
      const pawGroup = new THREE.Group();
      const basePaw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), creamFurMat);
      basePaw.scale.set(1.08, 0.9, 0.82);
      pawGroup.add(basePaw);

      const mainPad = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 12), pinkPadMat);
      mainPad.scale.set(1.22, 0.95, 0.48);
      mainPad.position.set(0, -0.022, 0.095);
      pawGroup.add(mainPad);

      const beanGeo = new THREE.SphereGeometry(0.026, 10, 10);
      [[-0.058, 0.032], [-0.02, 0.058], [0.02, 0.058], [0.058, 0.032]].forEach(([bx, by]) => {
        const bean = new THREE.Mesh(beanGeo, pinkPadMat);
        bean.scale.set(1, 1.1, 0.55);
        bean.position.set(bx, by, 0.096);
        pawGroup.add(bean);
      });
      pawGroup.scale.setScalar(scale);
      return pawGroup;
    }

    [-1, 1].forEach((dir) => {
      const hindFoot = createPawWithBeans(0.95);
      hindFoot.position.set(dir * 0.35, 0.13, 0.31);
      hindFoot.rotation.y = dir * 0.38;
      hindFoot.rotation.x = -0.15;
      hindFoot.rotation.z = -dir * 0.15;
      cat.add(hindFoot);
    });

    // 3. Red-Pink Satin Ribbon Collar + Big Shiny Golden Bell
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.042, 12, 36), collarMat);
    collar.rotation.x = Math.PI / 2 + 0.08;
    collar.position.set(0, 0.61, 0.02);
    cat.add(collar);

    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.078, 18, 16), goldMat);
    bell.position.set(0, 0.55, 0.37);
    cat.add(bell);
    const bellRing = new THREE.Mesh(new THREE.TorusGeometry(0.079, 0.01, 8, 24), goldMat);
    bellRing.position.copy(bell.position);
    cat.add(bellRing);
    const bellSlit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.025), mouthMat);
    bellSlit.position.set(0, 0.525, 0.435);
    cat.add(bellSlit);

    // 4. Big Squishy Mochi Head (Chibi Proportion — Bigger than Body!)
    catHeadGroup = new THREE.Group();
    catHeadGroup.position.set(0, 0.96, 0.06);
    catHeadGroup.rotation.z = 0.12; // Default sassy head tilt!
    cat.add(catHeadGroup);

    const headMain = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, LOW_QUALITY ? 24 : 34, LOW_QUALITY ? 20 : 28),
      creamFurMat
    );
    headMain.scale.set(1.24, 0.97, 1.04);
    catHeadGroup.add(headMain);

    // Extra-chubby lower mochi cheeks ("แก้มป่องย้วยๆ")
    [-1, 1].forEach((dir) => {
      const cheekPouch = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), creamFurMat);
      cheekPouch.scale.set(1.22, 0.88, 0.96);
      cheekPouch.position.set(dir * 0.31, -0.09, 0.09);
      catHeadGroup.add(cheekPouch);

      // Sculpted 3D cheek fluff tufts sticking out on each side
      [[-0.02, 0.22], [-0.09, 0.42]].forEach(([ty, rotZ], idx) => {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.075 - idx * 0.01, 0.19, 12), creamFurMat);
        tuft.position.set(dir * (0.54 - idx * 0.02), ty, 0.06);
        tuft.rotation.z = -dir * (Math.PI * 0.46 + rotZ);
        catHeadGroup.add(tuft);
      });
    });

    // Ginger-peach head cap patch + 3 cute caramel tabby forehead stripes ("แมวส้มจอมกวน")
    const gingerCap = new THREE.Mesh(new THREE.SphereGeometry(0.445, 26, 20), gingerFurMat);
    gingerCap.scale.set(1.2, 0.88, 1.0);
    gingerCap.position.set(0, 0.09, -0.03);
    catHeadGroup.add(gingerCap);

    // 3 Forehead tabby stripes
    [-0.11, 0, 0.11].forEach((sx, i) => {
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, i === 1 ? 0.19 : 0.15, 10), stripeMat);
      stripe.scale.set(1, 1, 0.4);
      stripe.position.set(sx, 0.26, 0.38 - Math.abs(sx) * 0.15);
      stripe.rotation.x = -0.52;
      stripe.rotation.z = -sx * 1.4;
      catHeadGroup.add(stripe);
    });

    // Cute 3D forehead fluff curl right between the brows
    const foreCurl = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 12), creamFurMat);
    foreCurl.position.set(0.02, 0.36, 0.34);
    foreCurl.rotation.x = 0.55;
    foreCurl.rotation.z = -0.3;
    catHeadGroup.add(foreCurl);

    // 5. Big Expressive Rounded Cat Ears + Inner Pink + Ear Tufts
    const outerEarGeo = new THREE.ConeGeometry(0.19, 0.34, 24);
    const innerEarGeo = new THREE.ConeGeometry(0.125, 0.24, 18);
    [-1, 1].forEach((dir) => {
      const ear = new THREE.Group();
      ear.position.set(dir * 0.35, 0.34, -0.01);
      ear.rotation.z = -dir * 0.42;
      ear.rotation.x = 0.08;
      ear.rotation.y = dir * 0.15;

      const outer = new THREE.Mesh(outerEarGeo, gingerFurMat);
      outer.scale.set(1.05, 1, 0.58);
      const earTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), gingerFurMat);
      earTip.position.set(0, 0.155, 0);
      const inner = new THREE.Mesh(innerEarGeo, pinkPadMat);
      inner.scale.set(1, 1, 0.42);
      inner.position.set(0, -0.02, 0.055);

      // Cute white ear-fluff tuft at the base of the ear
      const earFluff = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), creamFurMat);
      earFluff.scale.set(1.3, 0.7, 0.7);
      earFluff.position.set(-dir * 0.05, -0.1, 0.07);

      ear.add(outer, earTip, inner, earFluff);
      ear.userData.baseZ = ear.rotation.z;
      catHeadGroup.add(ear);
      catEars.push(ear);
    });

    // Jaunty Mini Golden Birthday Crown tilted between the ears!
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0.13, 0.44, 0.05);
    crownGroup.rotation.z = -0.22;
    crownGroup.rotation.x = 0.1;
    catHeadGroup.add(crownGroup);
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.095, 0.09, 18), goldMat);
    crownGroup.add(crownBase);
    for (let p = 0; p < 5; p++) {
      const ang = (p / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.08, 8), goldMat);
      spike.position.set(Math.cos(ang) * 0.095, 0.075, Math.sin(ang) * 0.095);
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), p % 2 === 0 ? noseMat : eyeSparkleMat);
      pearl.position.set(Math.cos(ang) * 0.095, 0.115, Math.sin(ang) * 0.095);
      crownGroup.add(spike, pearl);
    }

    // 6. Giant Glossy Kawaii "Boba" Eyes with Starlight Catchlights + Sassy Brows
    [-1, 1].forEach((dir) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(dir * 0.21, -0.01, 0.425);
      eyeGroup.rotation.y = dir * 0.24;
      eyeGroup.rotation.x = -0.05;

      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.112, 24, 20), eyeDarkMat);
      eyeball.scale.set(1.02, 1.12, 0.52);
      eyeGroup.add(eyeball);

      // Warm golden-amber crescent glow at bottom of iris
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.016, 8, 20, Math.PI), eyeAmberMat);
      crescent.rotation.z = Math.PI;
      crescent.position.set(0, -0.018, 0.052);
      eyeGroup.add(crescent);

      // Big upper-left starlight catchlight ("ตาแป๋วเป็นประกายวิบวับ")
      const catchBig = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), eyeSparkleMat);
      catchBig.scale.set(1.05, 1.15, 0.5);
      catchBig.position.set(-0.034, 0.044, 0.054);
      eyeGroup.add(catchBig);

      // Secondary lower-right catchlight
      const catchSmall = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), eyeSparkleMat);
      catchSmall.scale.set(1, 1, 0.5);
      catchSmall.position.set(0.036, -0.036, 0.054);
      eyeGroup.add(catchSmall);

      // Tiny middle-right sparkle dot
      const catchTiny = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), eyeSparkleMat);
      catchTiny.position.set(0.042, 0.025, 0.054);
      eyeGroup.add(catchTiny);

      catHeadGroup.add(eyeGroup);
      catEyes.push(eyeGroup);

      // Expressive floating eyebrow beans ("คิ้วกวนๆ")
      const brow = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), stripeMat);
      brow.scale.set(1.45, 0.65, 0.55);
      brow.position.set(dir * 0.20, 0.16, 0.435);
      brow.rotation.z = -dir * 0.14;
      brow.userData.baseY = 0.16;
      brow.userData.baseZ = -dir * 0.14;
      catHeadGroup.add(brow);
      catBrows.push(brow);
    });

    // 7. Rosy Pink Blush Cheeks with Cute Shine Dots
    [-1, 1].forEach((dir) => {
      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), blushMat);
      blush.scale.set(1.35, 0.78, 0.35);
      blush.position.set(dir * 0.34, -0.1, 0.385);
      blush.rotation.y = dir * 0.38;
      catHeadGroup.add(blush);

      const cheekShine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), eyeSparkleMat);
      cheekShine.position.set(dir * 0.33, -0.085, 0.415);
      catHeadGroup.add(cheekShine);
    });

    // 8. Plump ":3" Peanut Muzzle + Glossy Pink Nose + Cheeky Pink Tongue Blep ("แลบลิ้นแบร่~ กวนๆ")
    [-1, 1].forEach((dir) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.086, 16, 14), creamFurMat);
      puff.scale.set(1.18, 0.9, 0.85);
      puff.position.set(dir * 0.068, -0.1, 0.445);
      catHeadGroup.add(puff);
    });

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 12), noseMat);
    nose.scale.set(1.32, 0.88, 0.75);
    nose.position.set(0, -0.048, 0.505);
    catHeadGroup.add(nose);

    const mouthArcGeo = new THREE.TorusGeometry(0.038, 0.0085, 8, 16, Math.PI);
    [-1, 1].forEach((dir) => {
      const m = new THREE.Mesh(mouthArcGeo, mouthMat);
      m.rotation.z = Math.PI;
      m.position.set(dir * 0.038, -0.132, 0.495);
      catHeadGroup.add(m);
    });

    // Cheeky pink tongue sticking out ("แบร่~ 😜")
    catTongue = new THREE.Group();
    catTongue.position.set(0.032, -0.155, 0.482);
    catTongue.rotation.z = 0.22;
    catTongue.rotation.x = 0.28;
    const tongueMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 12), tongueMat);
    tongueMesh.scale.set(0.95, 1.28, 0.45);
    catTongue.add(tongueMesh);
    catHeadGroup.add(catTongue);

    // Crisp white whiskers (2 per side for clean kawaii look)
    const whiskerGeo = new THREE.CylinderGeometry(0.005, 0.0025, 0.28, 6);
    whiskerGeo.rotateZ(Math.PI / 2);
    [-1, 1].forEach((dir) => {
      [0.08, -0.08].forEach((tilt, k) => {
        const wk = new THREE.Mesh(whiskerGeo, whiskerMat);
        wk.position.set(dir * 0.42, -0.09 - k * 0.035, 0.36);
        wk.rotation.z = dir * tilt;
        wk.rotation.y = -dir * 0.32;
        catHeadGroup.add(wk);
      });
    });

    // 9. Front Paws:
    // Left Paw: Raised High Beckoning / Waving ("กวักมือกวนๆ โชว์อุ้งเท้ามังคุด")
    const armGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.32, 14);
    catWavePivot = new THREE.Group();
    catWavePivot.position.set(-0.32, 0.56, 0.2);
    cat.add(catWavePivot);

    const waveArm = new THREE.Mesh(armGeo, creamFurMat);
    waveArm.position.set(-0.08, 0.14, 0.05);
    waveArm.rotation.z = 0.42;
    catWavePivot.add(waveArm);

    const wavePaw = createPawWithBeans(0.92);
    wavePaw.position.set(-0.15, 0.31, 0.1);
    wavePaw.rotation.z = 0.25;
    wavePaw.rotation.y = -0.15;
    catWavePivot.add(wavePaw);

    // Right Paw: Tucked up touching its chubby cheek ("ท่าเท้าคางแบ๊วๆ กวนๆ")
    catChinPaw = new THREE.Group();
    catChinPaw.position.set(0.28, 0.54, 0.24);
    cat.add(catChinPaw);

    const chinArm = new THREE.Mesh(armGeo, creamFurMat);
    chinArm.position.set(0.03, 0.1, 0.06);
    chinArm.rotation.z = -0.25;
    chinArm.rotation.x = -0.35;
    catChinPaw.add(chinArm);

    const chinPawMesh = createPawWithBeans(0.88);
    chinPawMesh.position.set(0.01, 0.24, 0.15);
    chinPawMesh.rotation.z = -0.35;
    chinPawMesh.rotation.x = 0.2;
    catChinPaw.add(chinPawMesh);

    // 10. Big Fluffy Question-Mark Tail with Ginger Stripes & White Tip
    catTailPivot = new THREE.Group();
    catTailPivot.position.set(0.12, 0.18, -0.34);
    cat.add(catTailPivot);
    const tailCurve = new THREE.CatmullRomCurve3([
      V3(0, 0, 0),
      V3(0.32, 0.08, -0.05),
      V3(0.56, 0.34, 0.04),
      V3(0.52, 0.66, 0.12),
      V3(0.34, 0.82, 0.18)
    ]);
    const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 32, 0.088, 12, false), gingerFurMat);
    catTailPivot.add(tailMesh);

    // Tabby rings on tail + snowy white tail tip
    [0.35, 0.62].forEach((u) => {
      const pt = tailCurve.getPoint(u);
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.094, 12, 10), stripeMat);
      ring.scale.set(1, 0.55, 1);
      ring.position.copy(pt);
      catTailPivot.add(ring);
    });
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.098, 14, 12), creamFurMat);
    tailTip.position.copy(tailCurve.getPoint(1));
    catTailPivot.add(tailTip);

    return root;
  }

  const gift2Group = createFluffyCatGift();
  gift2Group.position.set(0, 0.15, 0.35);
  hubStageGroup.add(gift2Group);

  // =========================================================================
  // GIFT 3 3D: LUXURY VELVET HEART JEWELRY BOX ON A MARBLE PEDESTAL (Right)
  // =========================================================================
  const gift3Group = new THREE.Group();
  gift3Group.position.set(3.1, 0.15, 0);
  hubStageGroup.add(gift3Group);

  let heartLidPivot = null;
  let heartGem = null;
  let heartGlowLight = null;
  let heartHalo = null;
  let heartSparkles = null;
  const heartLid = { current: 0, target: 0 };
  let heartHover = false;
  let heartForceOpen = false;

  (function buildLuxuryHeartGift() {
    const root = new THREE.Group();
    root.scale.setScalar(1.12);
    gift3Group.add(root);

    // Marble pedestal (2 tiers with gold rims)
    const marbleMat = new THREE.MeshPhysicalMaterial({ map: marbleTex, roughness: 0.18, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.12 });
    const tierLow = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.9, 0.13, 48), marbleMat);
    tierLow.position.y = GIFT_BOTTOM_Y + 0.065;
    const tierHigh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.74, 0.12, 48), marbleMat);
    tierHigh.position.y = GIFT_BOTTOM_Y + 0.13 + 0.06;
    const rimLow = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.018, 8, 64), goldMat);
    rimLow.rotation.x = Math.PI / 2;
    rimLow.position.y = GIFT_BOTTOM_Y + 0.13;
    const rimHigh = new THREE.Mesh(new THREE.TorusGeometry(0.725, 0.016, 8, 64), goldMat);
    rimHigh.rotation.x = Math.PI / 2;
    rimHigh.position.y = GIFT_BOTTOM_Y + 0.25;
    root.add(tierLow, tierHigh, rimLow, rimHigh);
    const pedestalTop = GIFT_BOTTOM_Y + 0.25;

    // Heart box geometry (lying flat, then tilted toward the viewer on display)
    const hShape = heartShape(0.074);
    function heartSlab(depth, bevel) {
      const g = new THREE.ExtrudeGeometry(hShape, {
        depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
        bevelSegments: LOW_QUALITY ? 3 : 5, curveSegments: LOW_QUALITY ? 16 : 28
      });
      g.center();
      g.rotateZ(Math.PI);
      g.rotateX(-Math.PI / 2);
      g.computeBoundingBox();
      return g;
    }

    const velvetMat = new THREE.MeshPhysicalMaterial({
      color: 0xd0145a,
      roughness: 0.58,
      metalness: 0,
      bumpMap: furStrandTex,
      bumpScale: 0.0025,
      emissive: 0x2a0012
    });

    const baseH = 0.5;
    const lidH = 0.24;
    const baseGeo = heartSlab(0.36, 0.07);
    const lidGeo = heartSlab(0.12, 0.06);

    const display = new THREE.Group();
    display.rotation.x = 1.0;
    root.add(display);

    const base = new THREE.Mesh(baseGeo, velvetMat);
    base.position.y = baseH / 2;
    display.add(base);

    const zBack = lidGeo.boundingBox.min.z;
    heartLidPivot = new THREE.Group();
    heartLidPivot.position.set(0, baseH + 0.004, zBack);
    display.add(heartLidPivot);
    const lid = new THREE.Mesh(lidGeo, velvetMat);
    lid.position.set(0, lidH / 2, -zBack);
    heartLidPivot.add(lid);

    // Gold trims following the heart outline
    const outlinePts = hShape.getSpacedPoints(LOW_QUALITY ? 70 : 110);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    outlinePts.forEach((p) => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    function heartTrim(y, expand, radius) {
      const pts = outlinePts.map((p) => V3(-(p.x - cx) * expand, y, (p.y - cy) * expand));
      pts.pop();
      return new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), LOW_QUALITY ? 110 : 180, radius, 6, true),
        goldMat
      );
    }
    base.add(heartTrim(baseH / 2 - 0.03, 1.06, 0.026));
    base.add(heartTrim(-baseH / 2 + 0.03, 1.06, 0.022));
    lid.add(heartTrim(-lidH / 2 + 0.03, 1.06, 0.026));
    lid.add(heartTrim(lidH / 2 - 0.035, 1.0, 0.02));

    // Engraved gold name plaque on the lid
    const plaqueGeo = roundedBoxGeometry(0.62, 0.26, 0.03, 0.06, 0.01);
    plaqueGeo.rotateX(-Math.PI / 2);
    const plaque = new THREE.Mesh(plaqueGeo, goldMat);
    plaque.position.set(0.02, lidH / 2 + 0.012, 0.1);
    lid.add(plaque);
    const plaqueText = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.24),
      new THREE.MeshStandardMaterial({ map: plaqueTextTex, transparent: true, metalness: 0.4, roughness: 0.4 })
    );
    plaqueText.rotation.x = -Math.PI / 2;
    plaqueText.position.set(0.02, lidH / 2 + 0.029, 0.1);
    lid.add(plaqueText);

    // Pearl satin bow on the upper lobe
    const pearlBow = createSatinBow(makeSatin(0xfff7f0), 0.62);
    pearlBow.position.set(-0.38, lidH / 2 + 0.02, -0.22);
    pearlBow.rotation.y = 0.55;
    lid.add(pearlBow);

    // Hidden treasure: glowing pink heart gem on an ivory cushion (revealed when lid opens)
    const cushion = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 20, 14),
      new THREE.MeshPhysicalMaterial({ color: 0xfff1e8, roughness: 0.45, clearcoat: 0.3 })
    );
    cushion.scale.set(1, 0.18, 0.75);
    heartGem = new THREE.Group();
    heartGem.position.set(0, baseH + 0.02, 0.05);
    heartGem.add(cushion);
    const gemMesh = new THREE.Mesh(
      createHeartGeometry(0.022, 0.12),
      new THREE.MeshPhysicalMaterial({
        color: 0xff5c9d, roughness: 0.04, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.02,
        emissive: 0xff2e79, emissiveIntensity: 0.35
      })
    );
    gemMesh.position.y = 0.24;
    gemMesh.rotation.x = -1.0;
    heartGem.add(gemMesh);
    heartGem.scale.setScalar(0.001);
    display.add(heartGem);

    heartGlowLight = new THREE.PointLight(0xffc06b, 0, 3.2, 2);
    heartGlowLight.position.set(0, baseH + 0.35, 0.15);
    display.add(heartGlowLight);

    // Seat the tilted box so its tip rests on the pedestal
    display.position.set(0, pedestalTop + 0.58, -0.12);

    // Golden halo glow behind the box
    heartHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    heartHalo.position.set(0, 0.55, -0.55);
    heartHalo.scale.set(3.0, 3.0, 1);
    heartHalo.raycast = () => {};
    root.add(heartHalo);

    // Orbiting sparkles (single draw call)
    const sparkleCount = LOW_QUALITY ? 18 : 38;
    const sp = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.85 + Math.random() * 0.5;
      sp[i * 3] = Math.cos(a) * r;
      sp[i * 3 + 1] = -0.25 + Math.random() * 1.75;
      sp[i * 3 + 2] = Math.sin(a) * r;
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    heartSparkles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({
      map: sparkleTex, size: 0.09, color: 0xffe3a3, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    heartSparkles.raycast = () => {};
    root.add(heartSparkles);
  })();

  // Warm golden spotlight reserved for the special gift
  const heartSpot = new THREE.SpotLight(0xffd59a, 1.5, 14, 0.42, 0.75, 1.2);
  hubStageGroup.add(heartSpot);
  heartSpot.target = gift3Group;

  // Contact shadows for all three gifts
  const giftShadows = [createContactShadow(), createContactShadow(), createContactShadow()];
  const GIFT_SHADOW_WIDTH = [2.6, 2.0, 2.3];

  // -------------------------------------------------------------------------
  // Convert all authored sRGB colours to linear once (correct colour management)
  // -------------------------------------------------------------------------
  (function linearizeSceneColors() {
    const seen = new Set();
    scene.fog.color.convertSRGBToLinear();
    scene.traverse((o) => {
      if (o.isLight) {
        o.color.convertSRGBToLinear();
        if (o.groundColor) o.groundColor.convertSRGBToLinear();
      }
      if (!o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (seen.has(m)) return;
        seen.add(m);
        if (m.color) m.color.convertSRGBToLinear();
        if (m.emissive) m.emissive.convertSRGBToLinear();
      });
    });
  })();

  // -------------------------------------------------------------------------
  // RESPONSIVE 3D LAYOUT: SEPARATES MOBILE (<= 640px), IPAD/TABLET, AND DESKTOP
  // -------------------------------------------------------------------------
  function applyResponsive3DLayout() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    const mobile = isMobileViewport();
    const isTablet = !mobile && (w <= 1180 || aspect < 1.35);

    if (mobile) {
      camera.fov = 54;
      layoutState.photoBaseY = 0.72;
      layoutState.chestBaseY = -0.45;
      photoCardGroup.position.set(-0.82, layoutState.photoBaseY, -0.25);
      photoCardGroup.scale.set(0.64, 0.64, 0.64);

      mailboxChestGroup.position.set(0.76, layoutState.chestBaseY, 0.35);
      mailboxChestGroup.scale.set(0.72, 0.72, 0.72);

      layoutState.gift1BaseY = 0.72;
      layoutState.gift2BaseY = 1.18;
      layoutState.gift3BaseY = 0.72;

      gift1Group.position.set(-1.18, layoutState.gift1BaseY, 0);
      gift1Group.scale.set(0.56, 0.56, 0.56);

      gift2Group.position.set(0, layoutState.gift2BaseY, 0.25);
      gift2Group.scale.set(0.58, 0.58, 0.58);

      gift3Group.position.set(1.18, layoutState.gift3BaseY, 0);
      gift3Group.scale.set(0.56, 0.56, 0.56);
    } else if (isTablet) {
      // Dedicated iPad / Tablet 3D layout (both Portrait & Landscape)
      // Computes frustum half-width at hub (distance 7.8) so all 3 gifts stay 100% visible!
      camera.fov = aspect < 1.0 ? 52 : 48;
      const halfH = 7.8 * Math.tan((camera.fov * Math.PI) / 360);
      const halfW = halfH * aspect;

      const lockSpread = Math.min(1.8, Math.max(1.12, halfW * 0.5));
      const lockScale = Math.min(0.92, Math.max(0.72, halfW * 0.29));
      layoutState.photoBaseY = aspect < 1.0 ? 0.38 : 0.26;
      layoutState.chestBaseY = aspect < 1.0 ? -0.1 : -0.14;

      photoCardGroup.position.set(-lockSpread, layoutState.photoBaseY, 0);
      photoCardGroup.scale.setScalar(lockScale);

      mailboxChestGroup.position.set(lockSpread * 0.92, layoutState.chestBaseY, 0.2);
      mailboxChestGroup.scale.setScalar(lockScale);

      // Fit all 3 gifts inside [-halfW, +halfW] and lift above the bottom dock cards
      const spreadX = Math.min(2.45, Math.max(1.42, halfW * 0.58));
      const giftScale = Math.min(0.84, Math.max(0.62, halfW * 0.25));

      layoutState.gift1BaseY = aspect < 1.0 ? 0.52 : 0.42;
      layoutState.gift2BaseY = aspect < 1.0 ? 0.62 : 0.44;
      layoutState.gift3BaseY = aspect < 1.0 ? 0.52 : 0.42;

      gift1Group.position.set(-spreadX, layoutState.gift1BaseY, 0);
      gift1Group.scale.setScalar(giftScale);

      gift2Group.position.set(0, layoutState.gift2BaseY, 0.28);
      gift2Group.scale.setScalar(giftScale);

      gift3Group.position.set(spreadX, layoutState.gift3BaseY, 0);
      gift3Group.scale.setScalar(giftScale);
    } else {
      // Desktop widescreen layout
      camera.fov = 46;
      const halfH = 7.8 * Math.tan((camera.fov * Math.PI) / 360);
      const halfW = halfH * aspect;
      const spreadX = Math.min(2.95, halfW * 0.56);

      layoutState.photoBaseY = 0.25;
      layoutState.chestBaseY = -0.15;
      photoCardGroup.position.set(-1.95, layoutState.photoBaseY, 0);
      photoCardGroup.scale.set(1, 1, 1);

      mailboxChestGroup.position.set(1.75, layoutState.chestBaseY, 0.2);
      mailboxChestGroup.scale.set(1, 1, 1);

      layoutState.gift1BaseY = 0.36;
      layoutState.gift2BaseY = 0.36;
      layoutState.gift3BaseY = 0.36;

      gift1Group.position.set(-spreadX, layoutState.gift1BaseY, 0);
      gift1Group.scale.set(0.95, 0.95, 0.95);

      gift2Group.position.set(0, layoutState.gift2BaseY, 0.32);
      gift2Group.scale.set(0.95, 0.95, 0.95);

      gift3Group.position.set(spreadX, layoutState.gift3BaseY, 0);
      gift3Group.scale.set(0.95, 0.95, 0.95);
    }

    // Keep contact shadows and the special spotlight glued to their gifts
    const gifts = [gift1Group, gift2Group, gift3Group];
    const baseYs = [layoutState.gift1BaseY, layoutState.gift2BaseY, layoutState.gift3BaseY];
    gifts.forEach((g, idx) => {
      const s = g.scale.x;
      const sw = GIFT_SHADOW_WIDTH[idx] * s;
      giftShadows[idx].position.set(g.position.x, baseYs[idx] + GIFT_BOTTOM_Y * s + 0.012, g.position.z);
      giftShadows[idx].scale.set(sw, 1, sw * 0.72);
    });
    heartSpot.position.set(gift3Group.position.x + 0.8 * gift3Group.scale.x, 4.6, gift3Group.position.z + 2.6);

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  applyResponsive3DLayout();

  // =========================================================================
  // 4. SMOOTH INTERACTIVE POINTER LERP & UNIFIED 60FPS RENDER LOOP
  // =========================================================================
  const targetPointer = { x: 0, y: 0 };
  const smoothPointer = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const clickMouse = new THREE.Vector2();
  const hoverMouse = new THREE.Vector2();
  let pointerSeen = false;

  window.addEventListener("pointermove", (e) => {
    targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerSeen = true;
  }, { passive: true });

  renderer.domElement.addEventListener("click", (e) => {
    clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);

    if (currentScene === "lock") {
      const hits = raycaster.intersectObjects(mailboxChestGroup.children, true);
      if (hits.length > 0) openPasscodeModal();
    } else if (currentScene === "hub") {
      if (raycaster.intersectObjects(gift1Group.children, true).length > 0) { openGiftScene(1); return; }
      if (raycaster.intersectObjects(gift2Group.children, true).length > 0) { openGiftScene(2); return; }
      if (raycaster.intersectObjects(gift3Group.children, true).length > 0) { openGiftScene(3); return; }
    }
  });

  window.addEventListener("resize", () => {
    applyResponsive3DLayout();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  let frameCount = 0;
  let nextWinkAt = 1.8;
  let winkMode = "wink"; // alternates between cheeky one-eye wink and cute blink

  function masterTick() {
    requestAnimationFrame(masterTick);
    const elapsed = clock.getElapsedTime();
    frameCount++;

    smoothPointer.x += (targetPointer.x - smoothPointer.x) * 0.08;
    smoothPointer.y += (targetPointer.y - smoothPointer.y) * 0.08;

    stepParticles2D();

    for (let i = 0; i < floatingHearts.length; i++) {
      const h = floatingHearts[i];
      h.mesh.rotation.y += h.rotSpeed;
      h.mesh.position.y = h.baseY + Math.sin(elapsed * h.floatSpeed + h.floatOffset) * 0.24;
    }

    if (lockStageGroup.visible) {
      photoCardGroup.position.y = layoutState.photoBaseY + Math.sin(elapsed * 1.7) * 0.09;
      photoCardGroup.rotation.y = 0.28 + smoothPointer.x * 0.24;
      photoCardGroup.rotation.x = -smoothPointer.y * 0.14;

      mailboxChestGroup.position.y = layoutState.chestBaseY + Math.cos(elapsed * 1.7) * 0.08;
      mailboxChestGroup.rotation.y = -0.25 + smoothPointer.x * 0.24;
      mailboxChestGroup.rotation.x = -smoothPointer.y * 0.12;
    }

    if (hubStageGroup.visible) {
      gift1Group.rotation.y = Math.sin(elapsed * 0.9) * 0.25 + smoothPointer.x * 0.18;
      gift1Group.position.y = layoutState.gift1BaseY + Math.sin(elapsed * 1.6) * 0.04;

      gift2Group.rotation.y = Math.sin(elapsed * 1.1 + 0.8) * 0.2 + smoothPointer.x * 0.24;
      gift2Group.position.y = layoutState.gift2BaseY + Math.sin(elapsed * 1.8 + 1.2) * 0.04;

      gift3Group.rotation.y = Math.sin(elapsed * 0.7 + 2) * 0.25 + smoothPointer.x * 0.18;
      gift3Group.position.y = layoutState.gift3BaseY + Math.sin(elapsed * 1.4 + 2.4) * 0.03;

      // --- Cute & Sassy Cat Animation: groovy bounce, head tilt, wink, blep tongue & wave ---
      const groove = Math.sin(elapsed * 3.0);
      const bounce = Math.abs(Math.sin(elapsed * 3.0));
      if (catBody) {
        catBody.scale.set(1.1 + bounce * 0.03, 0.92 - bounce * 0.025, 0.96 + bounce * 0.02);
      }
      if (catHeadGroup) {
        const hoverTilt = catHover ? 0.1 : 0;
        catHeadGroup.position.y = 0.96 + bounce * 0.032;
        catHeadGroup.rotation.z = 0.13 + hoverTilt + groove * 0.11;
        catHeadGroup.rotation.y = smoothPointer.x * 0.3 + Math.sin(elapsed * 1.5) * 0.08;
        catHeadGroup.rotation.x = -smoothPointer.y * 0.14 + (catHover ? 0.08 : 0.02);
      }

      // Cheeky wink 😉 or cute blink + sassy eyebrow & tongue blep 😜
      const winkDur = winkMode === "wink" ? 0.48 : 0.18;
      if (catHover || elapsed > nextWinkAt) {
        const k = catHover ? 0.5 : (elapsed - nextWinkAt) / winkDur;
        if (k < 1) {
          const closeAmt = Math.sin(k * Math.PI);
          if (winkMode === "wink" || catHover) {
            // Left eye winks shut, right eye stays big & sparkling!
            if (catEyes[0]) catEyes[0].scale.y = Math.max(0.1, 1 - closeAmt * 0.88);
            if (catEyes[1]) catEyes[1].scale.y = 1 + closeAmt * 0.08;
            if (catBrows[0]) catBrows[0].position.y = catBrows[0].userData.baseY - closeAmt * 0.03;
            if (catBrows[1]) catBrows[1].position.y = catBrows[1].userData.baseY + closeAmt * 0.04;
          } else {
            catEyes.forEach((e) => { e.scale.y = Math.max(0.1, 1 - closeAmt * 0.9); });
          }
        } else {
          catEyes.forEach((e) => { e.scale.y = 1; });
          catBrows.forEach((b) => { b.position.y = b.userData.baseY; });
          winkMode = winkMode === "wink" ? "blink" : "wink";
          nextWinkAt = elapsed + 2.0 + Math.random() * 2.2;
        }
      } else {
        catEyes.forEach((e) => { e.scale.y = 1; });
      }

      // Cheeky tongue blep wiggle ("แบร่~ ดุ๊กดิ๊ก")
      if (catTongue) {
        const blepBoost = catHover ? 1.25 : 1.0;
        catTongue.scale.y = blepBoost + Math.sin(elapsed * 6.5) * 0.15;
        catTongue.rotation.z = 0.22 + Math.sin(elapsed * 4.2) * 0.12;
      }

      // Playful bouncy ears
      if (catEars.length === 2) {
        catEars[0].rotation.z = catEars[0].userData.baseZ + Math.sin(elapsed * 3.8) * 0.09;
        catEars[1].rotation.z = catEars[1].userData.baseZ - Math.cos(elapsed * 3.8) * 0.09;
      }

      // Beckoning "Nyan~" waving left paw + cheek-propping right paw
      if (catWavePivot) {
        const waveSpeed = catHover ? 7.0 : 4.4;
        catWavePivot.rotation.z = 0.12 + Math.sin(elapsed * waveSpeed) * 0.26;
        catWavePivot.rotation.x = Math.cos(elapsed * waveSpeed) * 0.12;
      }
      if (catChinPaw) {
        catChinPaw.position.y = 0.54 + bounce * 0.025;
        catChinPaw.rotation.z = groove * 0.06;
      }

      // Question-mark tail wagging happily
      if (catTailPivot) {
        catTailPivot.rotation.z = Math.sin(elapsed * 3.2) * 0.22;
        catTailPivot.rotation.y = Math.cos(elapsed * 2.4) * 0.16;
      }

      // --- Hover check for Gift 2 (Cat) & Gift 3 (Luxury Heart) ---
      if (currentScene === "hub" && pointerSeen && frameCount % 4 === 0) {
        hoverMouse.set(targetPointer.x, targetPointer.y);
        raycaster.setFromCamera(hoverMouse, camera);
        catHover = raycaster.intersectObjects(gift2Group.children, true).length > 0;
        heartHover = !catHover && raycaster.intersectObjects(gift3Group.children, true).length > 0;
        renderer.domElement.style.cursor = (catHover || heartHover) ? "pointer" : "";
      } else if (currentScene !== "hub" && (heartHover || catHover)) {
        heartHover = false;
        catHover = false;
        renderer.domElement.style.cursor = "";
      }
      heartLid.target = heartForceOpen ? 1.12 : (heartHover ? 0.38 : 0);
      heartLid.current += (heartLid.target - heartLid.current) * 0.1;
      if (heartLidPivot) heartLidPivot.rotation.x = -heartLid.current;
      const openness = Math.min(Math.max((heartLid.current - 0.12) / 0.6, 0), 1);
      if (heartGem) {
        heartGem.scale.setScalar(Math.max(0.001, openness));
        heartGem.children[1].rotation.y = elapsed * 1.2;
      }
      if (heartGlowLight) heartGlowLight.intensity = 2.4 * openness;
      if (heartHalo) {
        const pulse = 1 + Math.sin(elapsed * 1.8) * 0.06 + openness * 0.25;
        heartHalo.scale.set(3.0 * pulse, 3.0 * pulse, 1);
        heartHalo.material.opacity = 0.75 + openness * 0.25;
      }
      if (heartSparkles) {
        heartSparkles.rotation.y = elapsed * 0.35;
        heartSparkles.material.size = 0.08 + Math.sin(elapsed * 3.1) * 0.02;
      }
    }

    renderer.render(scene, camera);
  }
  masterTick();

  // =========================================================================
  // 5. PASSCODE MODAL & UNLOCK LOGIC (2210)
  // =========================================================================
  function openPasscodeModal() {
    passcodeModal.classList.add("open");
    passcodeModal.setAttribute("aria-hidden", "false");
    secretCodeInput.value = "";
    passcodeStatus.textContent = "";
    syncPinSlots("");
    if (!isMobileViewport()) {
      setTimeout(() => secretCodeInput.focus(), 100);
    }
  }

  function closePasscodeModal() {
    passcodeModal.classList.remove("open");
    passcodeModal.setAttribute("aria-hidden", "true");
  }

  openLockModalBtn.addEventListener("click", openPasscodeModal);
  closeLockModalBtn.addEventListener("click", closePasscodeModal);

  function syncPinSlots(val) {
    pinSlots.forEach((slot, idx) => {
      if (val[idx]) {
        slot.textContent = val[idx];
        slot.classList.add("filled");
      } else {
        slot.textContent = "♡";
        slot.classList.remove("filled");
      }
    });
  }

  function handleCodeChange(newVal) {
    const clean = newVal.replace(/\D/g, "").slice(0, 4);
    secretCodeInput.value = clean;
    syncPinSlots(clean);
    passcodeStatus.textContent = "";

    if (clean.length === 4) {
      verifyPasscode(clean);
    }
  }

  secretCodeInput.addEventListener("input", (e) => {
    handleCodeChange(e.target.value);
  });

  keyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      const cur = secretCodeInput.value;
      if (key === "clear") {
        handleCodeChange(cur.slice(0, -1));
      } else if (key === "enter") {
        verifyPasscode(cur);
      } else if (cur.length < 4) {
        handleCodeChange(cur + key);
      }
    });
  });

  function verifyPasscode(code) {
    if (code === SECRET_PASSCODE) {
      passcodeStatus.style.color = "#1ca65c";
      passcodeStatus.textContent = "💖 รหัสถูกต้อง! กำลังเปิดตู้จดหมาย 3D... 💖";
      spawnBurstParticles("heart", 22);
      setTimeout(() => {
        closePasscodeModal();
        playUnlockAndFlyToHub();
      }, 380);
    } else {
      passcodeStatus.style.color = "#e62e6b";
      passcodeStatus.textContent = "🥺 รหัสยังไม่ถูกน้า ลองใส่รหัสลับใหม่อีกครั้งนะ!";
      passcodeCard.classList.remove("shake");
      void passcodeCard.offsetWidth;
      passcodeCard.classList.add("shake");
    }
  }

  // =========================================================================
  // 6. 3D UNLOCK ANIMATION & CAMERA FLY-THROUGH TO 3 GIFTS HUB
  // =========================================================================
  function setActiveScreen(screenEl, sceneName) {
    [sceneLock, sceneHub, sceneGift1, sceneGift2, sceneGift3].forEach((el) => {
      el.classList.remove("active");
    });
    if (screenEl) {
      screenEl.classList.add("active");
    }
    currentScene = sceneName;
  }

  function playUnlockAndFlyToHub() {
    if (isUnlocked) return;
    isUnlocked = true;
    setActiveScreen(null, "transition");
    hubStageGroup.visible = true;

    gsap.to(padlockGroup.position, { y: 1.8, z: 2.2, duration: 0.5, ease: "back.in(1.5)" });
    gsap.to(padlockGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.5 });
    gsap.to(chestLidPivot.rotation, { x: -Math.PI * 0.68, duration: 0.75, ease: "back.out(1.5)" });
    gsap.to(letterGroup.position, { y: 1.45, duration: 0.75, delay: 0.15, ease: "back.out(1.6)" });

    gsap.to(camera.position, {
      x: 0,
      y: 1.0,
      z: -10.2,
      duration: 1.85,
      delay: 0.65,
      ease: "power2.inOut",
      onComplete: () => {
        lockStageGroup.visible = false;
        setActiveScreen(sceneHub, "hub");
        spawnBurstParticles("flower", 18);
      }
    });
  }

  // =========================================================================
  // 7. NAVIGATING BETWEEN THE 3 GIFTS & BACK TO HUB
  // =========================================================================
  function openGiftScene(giftNumber) {
    if (gift3PopupTimer) {
      clearTimeout(gift3PopupTimer);
      gift3PopupTimer = null;
    }

    heartForceOpen = giftNumber === 3;

    if (giftNumber === 1) {
      const targetX = gift1Group.position.x * 0.82;
      gsap.to(camera.position, { x: targetX, y: 0.65, z: -14.0, duration: 0.85, ease: "power2.out" });
      setActiveScreen(sceneGift1, "gift1");
      spawnBurstParticles("flower", 24);
    } else if (giftNumber === 2) {
      gsap.to(camera.position, { x: 0, y: 0.65, z: -14.0, duration: 0.85, ease: "power2.out" });
      setActiveScreen(sceneGift2, "gift2");
      spawnBurstParticles("cat", 20);
    } else if (giftNumber === 3) {
      const targetX = gift3Group.position.x * 0.82;
      gsap.to(camera.position, { x: targetX, y: 0.65, z: -14.0, duration: 0.85, ease: "power2.out" });
      setActiveScreen(sceneGift3, "gift3");
      spawnBurstParticles("flower", 24);

      bouquetShowcase.classList.remove("bloomed");
      videoPopupCard.classList.remove("popped", "visible");
      requestAnimationFrame(() => {
        bouquetShowcase.classList.add("bloomed");
      });

      gift3PopupTimer = setTimeout(() => {
        openGift3VideoPopup();
      }, 1350);
    }
  }

  function returnToGiftsHub() {
    if (gift3PopupTimer) {
      clearTimeout(gift3PopupTimer);
      gift3PopupTimer = null;
    }
    if (!surpriseVideo.paused) {
      surpriseVideo.pause();
    }
    heartForceOpen = false;
    gsap.to(camera.position, { x: 0, y: 1.0, z: -10.2, duration: 0.8, ease: "power2.out" });
    setActiveScreen(sceneHub, "hub");
  }

  giftCardBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const gId = parseInt(btn.getAttribute("data-gift"), 10);
      openGiftScene(gId);
    });
  });

  backBtns.forEach((btn) => {
    btn.addEventListener("click", returnToGiftsHub);
  });

  // =========================================================================
  // 8. GIFT 1 INTERACTIVE: 4 BLOOMING WISH FLOWERS
  // =========================================================================
  const FLOWER_WISHES = [
    "🌸 ดอกซากุระรอยยิ้ม: “ขอให้รอยยิ้มของน้องมิเชลสดใสเหมือนซากุระบาน ใครเห็นก็ตกหลุมรักและเอ็นดูเสมอเลยนะ!” 💖",
    "🌷 ดอกทิวลิปแสนอบอุ่น: “ขอให้ทุกที่ที่มิเชลก้าวไป มีแต่คนใจดี คอยซัพพอร์ตและมอบความอบอุ่นให้เสมอเลย!” 🥰",
    "🌻 ดอกทานตะวันพลังบวก: “ขอให้เรื่องเรียนและทุกโปรเจกต์ผ่านฉลุย มีพลังบวกสดใสเหมือนทานตะวันรับแสงเช้าทุกวันนะคนเก่ง!” ✨",
    "🌹 ดอกกุหลาบสมหวัง: “ขอให้วันเกิด 22.10 ปีนี้เป็นปีทอง สมหวังในทุกสิ่งที่อธิษฐานไว้ทุกประการเลยนะ!” 👑"
  ];

  const bloomedSet = new Set();

  wishFlowerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-flower"), 10);
      bloomedSet.add(idx);
      btn.classList.add("bloomed");
      const stateEl = btn.querySelector(".wf-state");
      if (stateEl) stateEl.textContent = "บานแล้ว ✨";

      if (wishRevealBox) {
        wishRevealBox.innerHTML = `<strong>${FLOWER_WISHES[idx]}</strong>`;
      }

      if (flowerProgressBadge) {
        if (bloomedSet.size === 4) {
          flowerProgressBadge.textContent = "👑 ครบ 4/4 ดอก! ปลดล็อกมงกุฎดอกไม้!";
          flowerProgressBadge.classList.add("completed");
          spawnBurstParticles("crown", 28);
        } else {
          flowerProgressBadge.textContent = `บานแล้ว ${bloomedSet.size}/4 ดอก 🌸`;
          spawnBurstParticles("flower", 16);
        }
      }
    });
  });

  bloomMoreBtn.addEventListener("click", () => {
    spawnBurstParticles("flower", 26);
  });

  // =========================================================================
  // 9. GIFT 2 INTERACTIVE: CAT CURATOR, PAW STAMP LIKES & ANGLE SWITCHER
  // =========================================================================
  const CAT_CURATOR_QUOTES = [
    "😻 “ง่ำๆ ขนมแมวเลียอร่อยจัง! ขออวยพรให้น้องมิเชลมีความสุขมากๆ น่ารักสดใสแบบนี้ตลอดไปเลยนะเหมียว~”",
    "🐾 “เหมียวแอบดูรูปตั้งแต่ตอนเด็กจนถึงชุดนักศึกษาเลย โตมาอย่างดีและน่ารักขึ้นทุกปีเลยนะเนี่ย!”",
    "🐱 “วันเกิด 22 ตุลาคมปีนี้ เหมียวขอเสกให้เกรดปังๆ มีแต่เรื่องให้ยิ้มกว้างๆ ทุกวันเลยนะเหมียว!”",
    "😽 “ขอบคุณที่แวะมาชมพิพิธภัณฑ์เหมียวนะ! กดปั๊มอุ้งเท้า 🐾 ให้รูปเยอะๆ ได้เลย เหมียวชอบมาก~”",
    "💖 “เหมียวรักน้องมิเชลที่สุดในสามโลกเลย! มีความสุขมากๆ สุขภาพแข็งแรงนะเหมียว!”"
  ];
  let curatorQuoteIdx = 0;

  if (feedCatBtn) {
    feedCatBtn.addEventListener("click", () => {
      if (curatorSpeechText) {
        curatorSpeechText.textContent = CAT_CURATOR_QUOTES[curatorQuoteIdx % CAT_CURATOR_QUOTES.length];
        curatorQuoteIdx++;
      }
      spawnBurstParticles("cat", 22);
    });
  }

  catFrameCards.forEach((card) => {
    const imgEl = card.querySelector(".museum-photo-box img");
    const stampOverlay = card.querySelector(".paw-stamp-overlay");
    const likeBtn = card.querySelector(".paw-like-btn");
    const countSpan = card.querySelector(".paw-count");
    const switchBtn = card.querySelector(".switch-angle-btn");
    const zoomBtn = card.querySelector(".zoom-photo-btn");

    // Paw Like Button
    if (likeBtn) {
      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        likeBtn.classList.add("liked");
        if (stampOverlay) {
          stampOverlay.classList.remove("stamped");
          void stampOverlay.offsetWidth;
          stampOverlay.classList.add("stamped");
        }
        if (countSpan) {
          const raw = parseInt(countSpan.textContent.replace(/\D/g, ""), 10) || 100;
          countSpan.textContent = `${raw + 1} ❤️`;
        }
        spawnBurstParticles("cat", 12);
      });
    }

    // Switch Angle Button (toggles between primary and bonus photo)
    if (switchBtn && imgEl) {
      let showingAlt = false;
      const primarySrc = card.getAttribute("data-photo");
      const altSrc = card.getAttribute("data-alt-photo");
      switchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!altSrc) return;
        showingAlt = !showingAlt;
        const nextSrc = showingAlt ? altSrc : primarySrc;
        imgEl.src = nextSrc;
        card.setAttribute("data-photo", nextSrc);
        spawnBurstParticles("cat", 10);
      });
    }

    // Zoom button or clicking on the photo opens Lightbox
    if (zoomBtn) {
      zoomBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        lightboxImg.src = card.getAttribute("data-photo");
        lightboxCaption.textContent = card.getAttribute("data-caption");
        photoLightbox.classList.add("open");
      });
    }

    card.addEventListener("click", () => {
      lightboxImg.src = card.getAttribute("data-photo");
      lightboxCaption.textContent = card.getAttribute("data-caption");
      photoLightbox.classList.add("open");
      spawnBurstParticles("cat", 12);
    });
  });

  closeLightboxBtn.addEventListener("click", () => {
    photoLightbox.classList.remove("open");
  });

  photoLightbox.addEventListener("click", (e) => {
    if (e.target === photoLightbox) {
      photoLightbox.classList.remove("open");
    }
  });

  // =========================================================================
  // 10. GIFT 3 INTERACTIVE: GIANT BOUQUET & VIDEO POPUP
  // =========================================================================
  function openGift3VideoPopup() {
    videoPopupCard.classList.add("visible");
    requestAnimationFrame(() => {
      videoPopupCard.classList.add("popped");
    });
    surpriseVideo.currentTime = 0;
    surpriseVideo.play().catch(() => {});
  }

  function hideGift3VideoPopup() {
    surpriseVideo.pause();
    videoPopupCard.classList.remove("popped");
    setTimeout(() => {
      videoPopupCard.classList.remove("visible");
    }, 380);
  }

  showVideoPopupBtn.addEventListener("click", openGift3VideoPopup);
  hideVideoPopupBtn.addEventListener("click", hideGift3VideoPopup);

  // Dev preview: open index.html?preview=hub to jump straight to the gift hub
  if (new URLSearchParams(window.location.search).get("preview") === "hub") {
    isUnlocked = true;
    lockStageGroup.visible = false;
    hubStageGroup.visible = true;
    camera.position.set(0, 1.0, -10.2);
    setActiveScreen(sceneHub, "hub");
  }
})();
