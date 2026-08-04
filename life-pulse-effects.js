(() => {
  const root = document.querySelector(".mira-intro");
  const canvas = document.querySelector("#life-effect-canvas");
  if (!root || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const mobileQuery = window.matchMedia("(max-width: 720px)");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const metricOrder = ["heart", "respiration", "temperature", "sleep", "stress", "location"];
  const metricSelectors = {
    heart: ".metric-heart",
    respiration: ".metric-respiration",
    temperature: ".metric-temperature",
    sleep: ".metric-sleep",
    stress: ".metric-stress",
    location: ".metric-location",
  };

  let width = 1;
  let height = 1;
  let ratio = 1;
  let geometry = null;
  let animationFrame = 0;
  let resizeFrame = 0;
  let activeHover = null;
  const pulseGroups = [];
  const hoverEffects = [];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const localRect = (element, rootRect) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left - rootRect.left,
      top: rect.top - rootRect.top,
      right: rect.right - rootRect.left,
      bottom: rect.bottom - rootRect.top,
      width: rect.width,
      height: rect.height,
      cx: rect.left - rootRect.left + rect.width / 2,
      cy: rect.top - rootRect.top + rect.height / 2,
    };
  };

  const makeRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  };

  const refreshGeometry = () => {
    const rootRect = root.getBoundingClientRect();
    const core = localRect(root.querySelector(".mira-core"), rootRect);
    const dog = localRect(root.querySelector(".particle-dog"), rootRect);
    const cat = localRect(root.querySelector(".particle-cat"), rootRect);
    const metrics = {};

    Object.entries(metricSelectors).forEach(([type, selector]) => {
      const card = root.querySelector(selector);
      const detail = card?.querySelector(type === "location" ? ".mini-map" : ".metric-chart");
      metrics[type] = {
        card: localRect(card, rootRect),
        detail: localRect(detail, rootRect),
      };
    });

    geometry = {
      core: core || { cx: width * 0.515, cy: height * 0.508 },
      dog,
      cat,
      metrics,
    };
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    refreshGeometry();
  };

  const petWakeDelay = (center, maxRadius, rect, faceX, faceY) => {
    if (!rect) return 520;
    const x = rect.left + rect.width * faceX;
    const y = rect.top + rect.height * faceY;
    const distance = Math.hypot(x - center.x, y - center.y);
    const radiusProgress = clamp((distance - 10) / maxRadius, 0.04, 0.96);
    const timeProgress = 1 - Math.pow(1 - radiusProgress, 1 / 1.55);
    return timeProgress * 2100;
  };

  const createPulseGroup = (time) => {
    refreshGeometry();
    const random = makeRandom(Math.floor(time * 10) ^ 0x51a7e);
    const particleCount = mobileQuery.matches ? 16 : 30;
    const particles = Array.from({ length: particleCount }, () => ({
      angle: random() * Math.PI * 2,
      radius: 18 + random() * Math.min(width, height) * 0.13,
      drift: 2 + random() * 6,
      size: 1 + random(),
      delay: 60 + random() * 200,
      life: 1400 + random() * 800,
      arc: (random() - 0.5) * 0.08,
    }));

    const center = { x: geometry.core.cx, y: geometry.core.cy };
    const maxRadius = width * 0.72;
    const group = {
      start: time,
      center,
      maxRadius,
      particles,
      dogWakeDelay: petWakeDelay(center, maxRadius, geometry.dog, 0.82, 0.42),
      catWakeDelay: petWakeDelay(center, maxRadius, geometry.cat, 0.22, 0.38),
      seed: random() * Math.PI * 2,
    };
    pulseGroups.push(group);
    window.dispatchEvent(new CustomEvent("mira:life-pulse", {
      detail: {
        start: group.start,
        dogDelay: group.dogWakeDelay,
        catDelay: group.catWakeDelay,
      },
    }));

    while (pulseGroups.length > 3) pulseGroups.shift();
    startLoop();
  };

  const makePulsePath = (shape, center, radius, phase) => {
    ctx.beginPath();
    if (shape === 0) {
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      return;
    }

    const steps = 120;
    for (let index = 0; index <= steps; index += 1) {
      const angle = (index / steps) * Math.PI * 2;
      let x;
      let y;

      if (shape === 1) {
        const membrane = 1
          + Math.sin(angle * 5 + phase) * 0.055
          + Math.sin(angle * 8 - phase * 0.7) * 0.025;
        x = center.x + Math.cos(angle) * radius * membrane;
        y = center.y + Math.sin(angle) * radius * membrane * 0.92;
      } else {
        const heartScale = radius / 17.5;
        x = center.x + 16 * Math.pow(Math.sin(angle), 3) * heartScale;
        y = center.y - (13 * Math.cos(angle)
          - 5 * Math.cos(angle * 2)
          - 2 * Math.cos(angle * 3)
          - Math.cos(angle * 4)) * heartScale;
      }

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const drawRings = (group, age) => {
    const delays = [0, 170, 340];
    const durations = [2100, 2250, 2400];
    delays.forEach((delay, index) => {
      const progress = (age - delay) / durations[index];
      if (progress <= 0 || progress >= 1) return;
      const radius = 10 + group.maxRadius * (1 - Math.pow(1 - progress, 1.55));
      makePulsePath(index, group.center, radius, group.seed + age * 0.00016);
      ctx.strokeStyle = `rgba(20,20,20,${(0.18 - index * 0.015) * Math.pow(1 - progress, 0.82)})`;
      ctx.lineWidth = 1.45 - index * 0.08;
      ctx.stroke();
    });
  };

  const drawRippleParticles = (group, age) => {
    group.particles.forEach((particle) => {
      const progress = (age - particle.delay) / particle.life;
      if (progress <= 0 || progress >= 1) return;
      const moved = particle.drift * easeOut(progress);
      const angle = particle.angle + particle.arc * progress;
      const radius = particle.radius + moved;
      const x = group.center.x + Math.cos(angle) * radius;
      const y = group.center.y + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,20,20,${0.175 * Math.sin(Math.PI * progress)})`;
      ctx.fill();
    });
  };

  const quadraticPoint = (start, control, end, progress) => {
    const inverse = 1 - progress;
    return {
      x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
      y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y,
    };
  };

  const drawConnections = (group, age) => {
    const local = age - 200;
    if (local < 0 || local > 1300 || !geometry?.dog || !geometry?.cat) return;
    const envelope = local < 200 ? local / 200 : local < 800 ? 1 : 1 - (local - 800) / 500;
    const start = group.center;
    const targets = [
      { x: geometry.dog.left + geometry.dog.width * 0.74, y: geometry.dog.top + geometry.dog.height * 0.45, bend: -34 },
      { x: geometry.dog.left + geometry.dog.width * 0.62, y: geometry.dog.top + geometry.dog.height * 0.64, bend: 26 },
      { x: geometry.cat.left + geometry.cat.width * 0.36, y: geometry.cat.top + geometry.cat.height * 0.43, bend: 34 },
      { x: geometry.cat.left + geometry.cat.width * 0.47, y: geometry.cat.top + geometry.cat.height * 0.61, bend: -24 },
    ];

    targets.forEach((target, lineIndex) => {
      const midpoint = { x: (start.x + target.x) / 2, y: (start.y + target.y) / 2 };
      const dx = target.x - start.x;
      const dy = target.y - start.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const control = {
        x: midpoint.x - (dy / length) * target.bend,
        y: midpoint.y + (dx / length) * target.bend,
      };
      const pointCount = mobileQuery.matches ? 16 : 24;
      for (let index = 0; index <= pointCount; index += 1) {
        const progress = index / pointCount;
        const point = quadraticPoint(start, control, target, progress);
        const pulse = 0.72 + 0.28 * Math.sin(age * 0.005 - progress * 8 + lineIndex);
        ctx.beginPath();
        ctx.arc(point.x, point.y, index % 6 === 0 ? 1.15 : 0.72, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${0.12 * envelope * pulse})`;
        ctx.fill();
      }
    });
  };

  const drawHeartbeat = (rect, progress, alpha) => {
    if (!rect) return;
    const shape = [0, 0, -0.08, 0.08, 0, 0, -0.55, 0.95, -0.25, 0, 0, -0.12, 0.1, 0];
    const visible = clamp(progress * (shape.length - 1), 0, shape.length - 1);
    ctx.beginPath();
    shape.forEach((value, index) => {
      if (index > visible + 1) return;
      const x = rect.left + (index / (shape.length - 1)) * rect.width;
      const y = rect.cy + value * rect.height * 0.36;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(20,20,20,${alpha})`;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const drawHealthResponse = (type, rect, progress) => {
    if (!rect) return;
    const fade = Math.sin(Math.PI * progress);
    const alpha = 0.105 * fade;

    if (type === "heart") {
      drawHeartbeat(rect, progress, alpha);
      return;
    }

    if (type === "respiration") {
      [0, 0.18].forEach((offset) => {
        const wave = (progress + offset) % 1;
        ctx.beginPath();
        ctx.ellipse(rect.cx, rect.cy, 5 + wave * rect.width * 0.48, 3 + wave * rect.height * 0.42, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(20,20,20,${alpha * (1 - wave)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      return;
    }

    if (type === "temperature") {
      const y = rect.top + rect.height * progress;
      const gradient = ctx.createLinearGradient(rect.left, 0, rect.right, 0);
      gradient.addColorStop(0, "rgba(20,20,20,0)");
      gradient.addColorStop(0.5, `rgba(20,20,20,${alpha})`);
      gradient.addColorStop(1, "rgba(20,20,20,0)");
      ctx.beginPath();
      ctx.moveTo(rect.left, y);
      ctx.lineTo(rect.right, y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }

    if (type === "sleep") {
      for (let index = 0; index < 9; index += 1) {
        const x = rect.left + ((index + 0.5) / 9) * rect.width;
        const rise = 4 + (index % 4) * 2.2;
        const y = rect.bottom - progress * rise;
        ctx.beginPath();
        ctx.arc(x, y, 0.75 + (index % 2) * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha * 0.8})`;
        ctx.fill();
      }
      return;
    }

    if (type === "stress") {
      for (let index = 0; index < 10; index += 1) {
        const x = rect.left + (index / 9) * rect.width;
        const y = rect.cy + Math.sin(index * 1.25 + progress * Math.PI * 2) * 3.5;
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha * 0.82})`;
        ctx.fill();
      }
      return;
    }

    [0, 0.22].forEach((offset) => {
      const ring = (progress + offset) % 1;
      ctx.beginPath();
      ctx.arc(rect.cx, rect.cy, 4 + ring * Math.min(rect.width, rect.height) * 0.46, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(20,20,20,${alpha * (1 - ring)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawHealthSequence = (group, age) => {
    metricOrder.forEach((type, index) => {
      const delay = 220 + index * 110;
      const duration = type === "location" ? 520 : 460;
      const progress = (age - delay) / duration;
      if (progress <= 0 || progress >= 1) return;
      drawHealthResponse(type, geometry.metrics[type]?.detail, progress);
    });
  };

  const hoverAnchor = (type) => {
    const dog = geometry?.dog;
    const cat = geometry?.cat;
    if (type === "location") return geometry?.metrics.location?.detail;
    if (type === "heart" && dog) return { cx: dog.left + dog.width * 0.58, cy: dog.top + dog.height * 0.69, width: 48, height: 18 };
    if (type === "respiration" && cat) return { cx: cat.left + cat.width * 0.47, cy: cat.top + cat.height * 0.63, width: 58, height: 30 };
    if (type === "temperature" && dog) return { cx: dog.left + dog.width * 0.5, cy: dog.top + dog.height * 0.62, width: dog.width * 0.52, height: dog.height * 0.38 };
    if (type === "sleep" && cat) return { cx: cat.left + cat.width * 0.48, cy: cat.top + cat.height * 0.6, width: 82, height: 66 };
    if (type === "stress" && dog) return { cx: dog.left + dog.width * 0.71, cy: dog.top + dog.height * 0.43, width: 64, height: 42 };
    return null;
  };

  const drawHoverEffect = (effect, time) => {
    const enter = clamp((time - effect.start) / 180, 0, 1);
    const leave = effect.leave ? clamp(1 - (time - effect.leave) / 480, 0, 1) : 1;
    const strength = enter * leave;
    if (strength <= 0) return;
    const anchor = hoverAnchor(effect.type);
    if (!anchor) return;
    const alpha = 0.08 * strength;
    const elapsed = (time - effect.start) * 0.001;

    if (effect.type === "heart") {
      const rect = { left: anchor.cx - anchor.width / 2, width: anchor.width, cy: anchor.cy, height: anchor.height };
      drawHeartbeat(rect, (elapsed * 0.65) % 1, alpha);
      return;
    }

    if (effect.type === "respiration") {
      for (let index = 0; index < 2; index += 1) {
        const wave = (elapsed * 0.28 + index * 0.5) % 1;
        ctx.beginPath();
        ctx.ellipse(anchor.cx, anchor.cy, 8 + wave * anchor.width * 0.42, 4 + wave * anchor.height * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(20,20,20,${alpha * (1 - wave)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      return;
    }

    if (effect.type === "temperature") {
      for (let index = 0; index < 18; index += 1) {
        const angle = (index / 18) * Math.PI * 2;
        const drift = Math.sin(elapsed * 1.3 + index) * 2;
        ctx.beginPath();
        ctx.arc(anchor.cx + Math.cos(angle) * (anchor.width * 0.5 + drift), anchor.cy + Math.sin(angle) * (anchor.height * 0.5 + drift), 0.75, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha * 0.72})`;
        ctx.fill();
      }
      return;
    }

    if (effect.type === "sleep") {
      for (let index = 0; index < (mobileQuery.matches ? 8 : 14); index += 1) {
        const phase = effect.seed + index * 2.14;
        const x = anchor.cx + Math.sin(phase) * anchor.width * 0.55;
        const y = anchor.cy + Math.cos(phase * 0.7) * anchor.height * 0.48 - ((elapsed * (3 + index % 4)) % 12);
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + (index % 3) * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha * 0.64})`;
        ctx.fill();
      }
      return;
    }

    if (effect.type === "stress") {
      for (let index = 0; index < 12; index += 1) {
        const angle = (index / 12) * Math.PI * 2;
        const wave = Math.sin(elapsed * 2 + index * 0.8) * 3;
        ctx.beginPath();
        ctx.arc(anchor.cx + Math.cos(angle) * (anchor.width * 0.46 + wave), anchor.cy + Math.sin(angle) * (anchor.height * 0.46 + wave), 0.75, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha * 0.72})`;
        ctx.fill();
      }
      return;
    }

    for (let index = 0; index < 2; index += 1) {
      const wave = (elapsed * 0.42 + index * 0.5) % 1;
      ctx.beginPath();
      ctx.arc(anchor.cx, anchor.cy, 5 + wave * Math.min(anchor.width, anchor.height) * 0.42, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(20,20,20,${alpha * (1 - wave)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const metricAt = (x, y) => metricOrder.find((type) => {
    const rect = geometry?.metrics[type]?.card;
    return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }) || null;

  const setHover = (type, time) => {
    if (type === activeHover?.type) return;
    if (activeHover && !activeHover.leave) activeHover.leave = time;
    activeHover = null;
    if (type) {
      activeHover = { type, start: time, leave: null, seed: Math.random() * Math.PI * 2 };
      hoverEffects.push(activeHover);
      while (hoverEffects.length > 3) hoverEffects.shift();
    }
    startLoop();
  };

  const frame = (time) => {
    animationFrame = 0;
    ctx.clearRect(0, 0, width, height);

    pulseGroups.forEach((group) => {
      const age = time - group.start;
      drawRings(group, age);
      drawRippleParticles(group, age);
      drawConnections(group, age);
      drawHealthSequence(group, age);
    });

    hoverEffects.forEach((effect) => drawHoverEffect(effect, time));

    while (pulseGroups.length && time - pulseGroups[0].start > 3100) pulseGroups.shift();
    for (let index = hoverEffects.length - 1; index >= 0; index -= 1) {
      if (hoverEffects[index].leave && time - hoverEffects[index].leave > 520) hoverEffects.splice(index, 1);
    }

    if (pulseGroups.length || hoverEffects.length) animationFrame = requestAnimationFrame(frame);
  };

  function startLoop() {
    if (!animationFrame) animationFrame = requestAnimationFrame(frame);
  }

  root.addEventListener("click", () => createPulseGroup(performance.now()), { passive: true });
  root.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rootRect = root.getBoundingClientRect();
    setHover(metricAt(event.clientX - rootRect.left, event.clientY - rootRect.top), performance.now());
  }, { passive: true });
  root.addEventListener("pointerleave", () => setHover(null, performance.now()), { passive: true });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }, { passive: true });

  if (reduceMotionQuery.matches) {
    root.addEventListener("click", () => {
      while (pulseGroups.length > 1) pulseGroups.shift();
    }, { passive: true });
  }

  resize();
})();
