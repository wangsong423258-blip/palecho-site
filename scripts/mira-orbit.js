(() => {
  const root = document.querySelector(".mira-intro");
  const canvas = document.getElementById("mira-orbit-canvas");
  const petCanvas = document.getElementById("pet-flow-canvas");
  if (!root || !canvas || !petCanvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const petCtx = petCanvas.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const orbitPlanes = [
    [.84, .14, .08],
    [-.72, .58, .52],
    [.43, -.76, .96],
    [-.28, 1.04, 1.41],
    [.66, -.22, 1.88],
    [-.88, -.48, 2.35],
    [.16, .82, 2.79],
  ];
  const rings = orbitPlanes.map(([pitch, yaw, tilt], index) => ({
    count: 116,
    radius: .81 + (index % 2) * .018,
    flatten: .39 + (index % 3) * .012,
    tilt,
    pitch,
    yaw,
    phase: index * .14,
    speed: (index % 2 ? -1 : 1) * (.000021 + index * .000002),
  }));
  const nucleus = Array.from({ length: 440 }, () => ({
    angle: Math.random() * TAU,
    latitude: Math.acos(Math.random() * 2 - 1),
    radius: .07 + Math.cbrt(Math.random()) * .24,
    phase: Math.random() * TAU,
    size: .35 + Math.random() * 1.35,
    alpha: .3 + Math.random() * .5,
    speed: .000018 + Math.random() * .000035,
  }));
  const petSources = [
    {
      kind: "dog",
      element: root.querySelector(".particle-dog"),
      image: null,
      direction: -1,
      mask: { cx: .44, cy: .56, rx: .72, ry: .67 },
      particles: [],
      connections: [],
    },
    {
      kind: "cat",
      element: root.querySelector(".particle-cat"),
      image: null,
      direction: 1,
      mask: { cx: .48, cy: .42, rx: .68, ry: .64 },
      particles: [],
      connections: [],
    },
  ];
  const activePetPulses = [];
  const sampleCanvas = document.createElement("canvas");
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

  const pixelNoise = (x, y, seed) => {
    const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return value - Math.floor(value);
  };

  const buildPetParticles = (source, sourceIndex) => {
    const image = source.image;
    if (!image?.naturalWidth || !image?.naturalHeight || !sampleCtx) return;

    sampleCanvas.width = image.naturalWidth;
    sampleCanvas.height = image.naturalHeight;
    sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
    sampleCtx.drawImage(image, 0, 0);
    const pixels = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const mobileParticles = window.innerWidth <= 720;
    const step = 2;
    const particles = [];
    const connections = [];
    const darknessAt = (x, y) => {
      const safeX = Math.max(0, Math.min(sampleCanvas.width - 1, x));
      const safeY = Math.max(0, Math.min(sampleCanvas.height - 1, y));
      const index = (safeY * sampleCanvas.width + safeX) * 4;
      const pixelAlpha = pixels[index + 3] / 255;
      const pixelLuminance = (pixels[index] * .2126
        + pixels[index + 1] * .7152
        + pixels[index + 2] * .0722) / 255;
      return (1 - pixelLuminance) * pixelAlpha;
    };

    for (let y = 1; y < sampleCanvas.height - 1; y += step) {
      for (let x = 1; x < sampleCanvas.width - 1; x += step) {
        const darkness = darknessAt(x, y);
        if (darkness < .018) continue;
        const edgeStrength = mobileParticles
          ? Math.min(1, (
            Math.abs(darkness - darknessAt(x + step, y))
            + Math.abs(darkness - darknessAt(x - step, y))
            + Math.abs(darkness - darknessAt(x, y + step))
            + Math.abs(darkness - darknessAt(x, y - step))
          ) * 1.45)
          : 0;

        const nx = x / sampleCanvas.width;
        const ny = y / sampleCanvas.height;
        const catFace = source.kind === "cat" && nx < .62 && ny < .52;
        const dogFace = source.kind === "dog" && nx > .38 && ny < .66;
        const facialDensity = mobileParticles
          ? catFace ? .78 : dogFace ? .88 : 1
          : 1;
        const facialAlpha = mobileParticles
          ? catFace ? .76 : dogFace ? .88 : 1
          : 1;
        const maskDistance = Math.hypot(
          (nx - source.mask.cx) / source.mask.rx,
          (ny - source.mask.cy) / source.mask.ry,
        );
        const edgeFade = Math.max(0, Math.min(1, (1.2 - maskDistance) / .3));
        if (edgeFade <= .018) continue;

        const noise = pixelNoise(x, y, sourceIndex + 1);
        const density = (mobileParticles
          ? Math.min(.76, .1 + darkness * .28 + edgeStrength * .48)
          : Math.min(1, .42 + darkness * .85)) * facialDensity;
        if (noise > density) continue;

        particles.push({
          nx,
          ny,
          sx: x,
          sy: y,
          size: mobileParticles
            ? .19 + darkness * .24 + edgeStrength * .18 + (edgeStrength > .24 && noise < .012 ? .14 : 0)
            : .48 + darkness * 1.08 + (noise < .028 ? .82 : 0),
          alpha: (mobileParticles
            ? .16 + darkness * .3 + edgeStrength * .22
            : .28 + darkness * .7) * edgeFade * facialAlpha,
          phase: pixelNoise(y, x, sourceIndex + 7) * TAU,
          speed: .00032 + pixelNoise(x + y, y, sourceIndex + 11) * .00024,
          drift: .28 + pixelNoise(y + x, x, sourceIndex + 13) * .72,
          anchor: mobileParticles
            ? edgeStrength > .25 && darkness > .42 && noise < .08
            : darkness > .64 && noise < .38,
        });

      }
    }

    const connectionStep = mobileParticles ? 46 : 24;
    const maxSourceDistance = step * 6;
    for (let index = connectionStep; index < particles.length; index += connectionStep) {
      const point = particles[index];
      let nearestIndex = -1;
      let nearestDistance = maxSourceDistance;
      const searchStart = Math.max(0, index - 360);
      for (let candidateIndex = index - 1; candidateIndex >= searchStart; candidateIndex -= 1) {
        const candidate = particles[candidateIndex];
        const dx = point.sx - candidate.sx;
        const dy = point.sy - candidate.sy;
        if (Math.abs(dy) < step) continue;
        const distance = Math.hypot(dx, dy);
        if (distance < step * 1.4 || distance >= nearestDistance) continue;
        nearestDistance = distance;
        nearestIndex = candidateIndex;
      }
      if (nearestIndex >= 0) connections.push([nearestIndex, index]);
    }

    source.particles = particles;
    source.connections = connections;
  };

  petSources.forEach((source, index) => {
    const asset = source.element?.dataset.particleSource;
    if (!asset) return;
    source.image = new Image();
    source.image.addEventListener("load", () => buildPetParticles(source, index), { once: true });
    source.image.src = asset;
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerYaw = 0;
  let pointerPitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    petCanvas.width = Math.round(width * dpr);
    petCanvas.height = Math.round(height * dpr);
    petCanvas.style.width = `${width}px`;
    petCanvas.style.height = `${height}px`;
    petCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const rotatePoint = (x, y, z, pitch, yaw, roll) => {
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);
    const rollX = x * cosRoll - y * sinRoll;
    const rollY = x * sinRoll + y * cosRoll;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const pitchY = rollY * cosPitch - z * sinPitch;
    const pitchZ = rollY * sinPitch + z * cosPitch;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    return {
      x: rollX * cosYaw + pitchZ * sinYaw,
      y: pitchY,
      z: -rollX * sinYaw + pitchZ * cosYaw,
    };
  };

  const project = (point, cx, cy, baseRadius) => {
    const perspective = 1 / (1 - point.z * .00115);
    return {
      x: cx + point.x * perspective,
      y: cy + point.y * perspective,
      depth: Math.max(0, Math.min(1, .5 + point.z / (baseRadius * 2.2))),
    };
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    pointerYaw += (targetYaw - pointerYaw) * .045;
    pointerPitch += (targetPitch - pointerPitch) * .045;

    const mobileLayout = width <= 720;
    const cx = width * (mobileLayout ? .5 : .515);
    const cy = height * (mobileLayout ? .47 : .508);
    const baseRadius = mobileLayout
      ? Math.min(width * .29, height * .2)
      : Math.min(width * .43, height * .485);
    const autoYaw = reduceMotion ? 0 : time * .000025;

    rings.forEach((ring, ringIndex) => {
      const points = [];
      for (let index = 0; index < ring.count; index += 1) {
        const angle = index / ring.count * TAU + ring.phase + (reduceMotion ? 0 : time * ring.speed);
        const x = Math.cos(angle) * baseRadius * ring.radius;
        const y = Math.sin(angle) * baseRadius * ring.radius * ring.flatten;
        const rotated = rotatePoint(
          x,
          y,
          0,
          ring.pitch + pointerPitch,
          ring.yaw + pointerYaw + autoYaw,
          ring.tilt,
        );
        points.push({ ...project(rotated, cx, cy, baseRadius), anchor: index % 15 === 0, index });
      }

      ctx.beginPath();
      points.forEach((point, index) => {
        if (!index || index % 4) return;
        const previous = points[index - 1];
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = "rgba(0,0,0,.14)";
      ctx.lineWidth = .55;
      ctx.stroke();

      points.forEach((point) => {
        const opacity = (point.anchor ? .86 : .39) + point.depth * .14;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.anchor ? 1.55 : .52 + point.depth * .42, 0, TAU);
        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        ctx.fill();
      });
    });

    nucleus.forEach((particle) => {
      const angle = particle.angle + particle.phase * .12 + (reduceMotion ? 0 : time * particle.speed);
      const ripple = 1 + Math.sin(time * .00042 + particle.phase) * .035;
      const sphereRadius = baseRadius * particle.radius * ripple * (mobileLayout ? .62 : 1);
      const x = Math.cos(angle) * Math.sin(particle.latitude) * sphereRadius;
      const y = Math.sin(angle) * Math.sin(particle.latitude) * sphereRadius;
      const z = Math.cos(particle.latitude) * sphereRadius;
      const rotated = rotatePoint(x, y, z, pointerPitch * .52 + .1, pointerYaw * .52 + autoYaw * .7, .18);
      const point = project(rotated, cx, cy, baseRadius);
      ctx.beginPath();
      ctx.arc(point.x, point.y, particle.size * (.68 + point.depth * .62) * (mobileLayout ? .78 : 1), 0, TAU);
      ctx.fillStyle = `rgba(0,0,0,${particle.alpha * (.46 + point.depth * .72) * (mobileLayout ? .42 : 1)})`;
      ctx.fill();
    });

    petCtx.clearRect(0, 0, width, height);
    petSources.forEach((source) => {
      const rect = source.element?.getBoundingClientRect();
      if (!rect || !source.particles.length) return;
      const points = source.particles.map((particle) => {
        const motionTime = reduceMotion ? 0 : time;
        let x = rect.left + particle.nx * rect.width
          + Math.sin(motionTime * particle.speed + particle.phase) * particle.drift;
        let y = rect.top + particle.ny * rect.height
          + Math.cos(motionTime * particle.speed * .84 + particle.phase) * particle.drift * .68;
        let wake = 0;

        activePetPulses.forEach((pulse) => {
          const delay = source.kind === "dog" ? pulse.dogDelay : pulse.catDelay;
          const sweep = source.direction < 0 ? 1 - particle.nx : particle.nx;
          const progress = (time - pulse.start - delay - sweep * 500) / 1380;
          if (progress <= 0 || progress >= 1) return;
          const envelope = Math.sin(Math.PI * progress);
          const wave = Math.sin(progress * Math.PI * 2.18);
          x += source.direction * wave * envelope * 7.4;
          y += Math.sin(progress * Math.PI * 1.82 + particle.phase * .16) * envelope * 3.4;
          wake = Math.max(wake, envelope);
        });

        return { x, y, particle, wake };
      });

      petCtx.beginPath();
      source.connections.forEach(([fromIndex, toIndex]) => {
        const from = points[fromIndex];
        const to = points[toIndex];
        if (!from || !to) return;
        petCtx.moveTo(from.x, from.y);
        petCtx.lineTo(to.x, to.y);
      });
      petCtx.strokeStyle = mobileLayout ? "rgba(0,0,0,.082)" : "rgba(0,0,0,.12)";
      petCtx.lineWidth = mobileLayout ? .34 : .52;
      petCtx.stroke();

      points.forEach(({ x, y, particle, wake }, index) => {
        const breathing = reduceMotion ? 1 : .94 + Math.sin(time * .00105 + particle.phase) * .06;
        const radius = particle.size * breathing * (particle.anchor ? (mobileLayout ? 1.12 : 1.38) : 1) * (1 + wake * .26);
        const alpha = Math.min(1, particle.alpha * (breathing + wake * (mobileLayout ? .34 : .52)));

        if (wake > .08 && index % 3 === 0) {
          petCtx.beginPath();
          petCtx.arc(x - source.direction * 3.2, y, radius * (mobileLayout ? .56 : .72), 0, TAU);
          petCtx.fillStyle = `rgba(0,0,0,${alpha * wake * (mobileLayout ? .12 : .24)})`;
          petCtx.fill();
        }

        petCtx.beginPath();
        petCtx.arc(x, y, radius, 0, TAU);
        petCtx.fillStyle = `rgba(0,0,0,${alpha})`;
        petCtx.fill();
      });
    });

    while (activePetPulses.length && time - activePetPulses[0].start > 3300) {
      activePetPulses.shift();
    }

    requestAnimationFrame(draw);
  };

  root.addEventListener("pointermove", (event) => {
    targetYaw = (event.clientX / width - .5) * 1.05;
    targetPitch = (event.clientY / height - .5) * -.72;
  }, { passive: true });
  root.addEventListener("pointerleave", () => {
    targetYaw = 0;
    targetPitch = 0;
  });
  window.addEventListener("mira:life-pulse", (event) => {
    if (!event.detail) return;
    activePetPulses.push(event.detail);
    while (activePetPulses.length > 3) activePetPulses.shift();
  });
  window.addEventListener("resize", resize, { passive: true });

  resize();
  requestAnimationFrame(draw);
})();
