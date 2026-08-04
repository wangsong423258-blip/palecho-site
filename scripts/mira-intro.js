(() => {
  const root = document.getElementById("mira-intro");
  const canvas = document.getElementById("mira-canvas");
  const petCanvas = document.getElementById("pet-particle-canvas");
  const coreButton = document.getElementById("mira-core");
  if (!root || !canvas || !petCanvas || !coreButton) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const petCtx = petCanvas.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pets = [
    { id: "samoyed", x: .19, y: .23, controlX: .35, controlY: .3 },
    { id: "malamute", x: .18, y: .5, controlX: .34, controlY: .49 },
    { id: "golden", x: .2, y: .77, controlX: .36, controlY: .69 },
    { id: "british", x: .81, y: .23, controlX: .65, controlY: .3 },
    { id: "ragdoll", x: .82, y: .5, controlX: .66, controlY: .49 },
    { id: "orange", x: .8, y: .77, controlX: .64, controlY: .69 },
  ];
  const petRegions = [
    { id: "samoyed", x: .2, y: .22, rx: .12, ry: .19, color: "251,251,248", period: 4600, phase: .2 },
    { id: "malamute", x: .19, y: .51, rx: .12, ry: .18, color: "240,236,229", period: 4800, phase: 1.4 },
    { id: "golden", x: .22, y: .79, rx: .13, ry: .17, color: "247,239,224", period: 5000, phase: 2.5 },
    { id: "british", x: .8, y: .21, rx: .11, ry: .18, color: "242,245,245", period: 4500, phase: 3.1 },
    { id: "ragdoll", x: .81, y: .51, rx: .12, ry: .18, color: "250,248,242", period: 4900, phase: 4.2 },
    { id: "orange", x: .78, y: .79, rx: .12, ry: .17, color: "246,238,221", period: 4700, phase: 5.3 },
  ];
  const coreParticles = Array.from({ length: 620 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.pow(Math.random(), .7);
    const palettePosition = Math.random();
    return {
      angle,
      spread,
      phase: Math.random() * Math.PI * 2,
      drift: .12 + Math.random() * .3,
      size: .55 + Math.random() * 2,
      color: palettePosition < .5
        ? "245,252,251"
        : palettePosition < .78
          ? "168,220,221"
          : palettePosition < .93
            ? "85,127,151"
            : "156,170,212",
    };
  });
  const ambientParticles = Array.from({ length: 60 }, () => ({
    x: Math.random(), y: Math.random(), size: .4 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2, speed: .08 + Math.random() * .16,
  }));

  let width = 0;
  let height = 0;
  let dpr = 1;
  let activePet = "";
  let enteringAt = 0;
  let hoveredCore = false;
  let petMaskAlpha = null;
  let petOutlineCanvas = null;
  let petHighlightCanvas = null;
  let petParticles = [];
  const petImage = new Image();

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
    if (petImage.complete && petImage.naturalWidth) preparePetField();
  };

  const pointOnCurve = (pet, progress) => {
    const cx = width * .5;
    const cy = height * .48;
    const sx = width * pet.x;
    const sy = height * pet.y;
    const qx = width * pet.controlX;
    const qy = height * pet.controlY;
    const inverse = 1 - progress;
    return {
      x: inverse * inverse * sx + 2 * inverse * progress * qx + progress * progress * cx,
      y: inverse * inverse * sy + 2 * inverse * progress * qy + progress * progress * cy,
    };
  };

  const drawConnections = (time, exitProgress) => {
    pets.forEach((pet, index) => {
      const highlighted = activePet === pet.id;
      const start = pointOnCurve(pet, 0);
      const end = pointOnCurve(pet, 1);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(width * pet.controlX, height * pet.controlY, end.x, end.y);
      ctx.strokeStyle = `rgba(120,174,177,${highlighted ? .44 : .28})`;
      ctx.lineWidth = highlighted ? 1.2 : .82;
      ctx.stroke();

      if (index !== 1 && index !== 4) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y + (index % 2 ? -7 : 7));
        ctx.quadraticCurveTo(width * (pet.controlX + (index < 3 ? .01 : -.01)), height * (pet.controlY + .025), end.x, end.y);
        ctx.strokeStyle = "rgba(120,174,177,.11)";
        ctx.lineWidth = .65;
        ctx.stroke();
      }

      const speed = highlighted ? 1.15 : 1;
      const duration = 6.2 + (index % 3) * .62;
      const count = exitProgress > 0 ? 9 : 5;
      for (let dot = 0; dot < count; dot += 1) {
        let progress;
        if (exitProgress > 0) {
          progress = Math.min(1, exitProgress * 1.35 + dot * .035);
        } else {
          progress = ((time / 1000 * speed / duration) + dot / count + index * .12) % 1;
        }
        const point = pointOnCurve(pet, progress);
        const trailPoint = pointOnCurve(pet, Math.max(0, progress - .022));
        const warm = dot === 0 && index % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(trailPoint.x, trailPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = warm ? "rgba(232,201,143,.32)" : "rgba(233,255,255,.34)";
        ctx.lineWidth = highlighted ? 1.45 : 1.05;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(point.x, point.y, highlighted ? 1.55 : 1.12, 0, Math.PI * 2);
        ctx.fillStyle = warm ? "rgba(232,201,143,.78)" : "rgba(233,255,255,.82)";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  };

  const drawAmbient = (time) => {
    ambientParticles.forEach((particle, index) => {
      const x = particle.x * width + Math.sin(time * .00012 * particle.speed + particle.phase) * 8;
      const y = particle.y * height + Math.cos(time * .0001 * particle.speed + particle.phase) * 6;
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = index % 7 === 0 ? "rgba(232,201,143,.3)" : "rgba(248,255,255,.24)";
      ctx.fill();
    });
  };

  const maskContains = (x, y, margin = 0) => {
    if (!petMaskAlpha) return false;
    const inside = (sampleX, sampleY) => {
      const px = Math.max(0, Math.min(width - 1, Math.round(sampleX)));
      const py = Math.max(0, Math.min(height - 1, Math.round(sampleY)));
      return petMaskAlpha[py * width + px] > 38;
    };
    return inside(x, y)
      && (!margin || (inside(x - margin, y) && inside(x + margin, y) && inside(x, y - margin) && inside(x, y + margin)));
  };

  const preparePetField = () => {
    if (!width || !height || !petImage.naturalWidth) return;
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    maskCtx.drawImage(petImage, 0, 0, width, height);
    const source = maskCtx.getImageData(0, 0, width, height);
    const outline = maskCtx.createImageData(width, height);
    const highlight = maskCtx.createImageData(width, height);
    petMaskAlpha = new Uint8ClampedArray(width * height);

    for (let pixel = 3, sample = 0; pixel < source.data.length; pixel += 4, sample += 1) {
      petMaskAlpha[sample] = source.data[pixel];
    }

    const sampleAlpha = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return 0;
      return petMaskAlpha[y * width + x];
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const sample = y * width + x;
        const pixel = sample * 4;
        const alpha = petMaskAlpha[sample];
        if (alpha < 24) continue;
        const edge = sampleAlpha(x - 4, y) < 30
          || sampleAlpha(x + 4, y) < 30
          || sampleAlpha(x, y - 4) < 30
          || sampleAlpha(x, y + 4) < 30;
        const highlightEdge = sampleAlpha(x - 1, y) < 30
          || sampleAlpha(x + 1, y) < 30
          || sampleAlpha(x, y - 1) < 30
          || sampleAlpha(x, y + 1) < 30;
        const red = source.data[pixel];
        const green = source.data[pixel + 1];
        const blue = source.data[pixel + 2];
        const luminance = red * .2126 + green * .7152 + blue * .0722;
        const faceDetail = petRegions.some((region, index) => {
          const faceX = (region.x + (index < 3 ? region.rx * .22 : -region.rx * .18)) * width;
          const faceY = (region.y - region.ry * .4) * height;
          const dx = (x - faceX) / (width * .052);
          const dy = (y - faceY) / (height * .058);
          return dx * dx + dy * dy < 1 && luminance < 158;
        });
        if (!edge && !faceDetail) continue;
        outline.data[pixel] = edge ? 91 : 104;
        outline.data[pixel + 1] = edge ? 183 : 166;
        outline.data[pixel + 2] = edge ? 198 : 176;
        outline.data[pixel + 3] = Math.round(alpha * (edge ? .96 : .42));
        if (highlightEdge) {
          highlight.data[pixel] = 232;
          highlight.data[pixel + 1] = 255;
          highlight.data[pixel + 2] = 255;
          highlight.data[pixel + 3] = Math.round(alpha * .82);
        }
      }
    }

    petOutlineCanvas = document.createElement("canvas");
    petOutlineCanvas.width = width;
    petOutlineCanvas.height = height;
    petOutlineCanvas.getContext("2d").putImageData(outline, 0, 0);
    petHighlightCanvas = document.createElement("canvas");
    petHighlightCanvas.width = width;
    petHighlightCanvas.height = height;
    petHighlightCanvas.getContext("2d").putImageData(highlight, 0, 0);
    petParticles = [];
    const gridStep = Math.max(12, Math.min(17, width / 115));

    petRegions.forEach((region, petIndex) => {
      const minX = Math.max(0, (region.x - region.rx) * width);
      const maxX = Math.min(width, (region.x + region.rx) * width);
      const minY = Math.max(0, (region.y - region.ry) * height);
      const maxY = Math.min(height, (region.y + region.ry) * height);
      let row = 0;
      for (let y = minY; y <= maxY; y += gridStep * .9) {
        const offset = row % 2 ? gridStep * .5 : 0;
        for (let x = minX + offset; x <= maxX; x += gridStep) {
          if (!maskContains(x, y, 5) || Math.random() < .62) continue;
          const palettePosition = Math.random();
          const color = palettePosition < .46
            ? region.color
            : palettePosition < .64
              ? "242,231,213"
              : palettePosition < .78
                ? "255,255,255"
                : "120,174,177";
          petParticles.push({
            petIndex,
            baseX: x + (Math.random() - .5) * 1.8,
            baseY: y + (Math.random() - .5) * 1.8,
            phase: Math.random() * Math.PI * 2,
            speed: .000065 + Math.random() * .000075,
            amplitude: 2 + Math.random() * 3.5,
            size: .78 + Math.random() * 1.25,
            alpha: .76 + Math.random() * .2,
            color,
            structural: false,
          });
        }
        row += 1;
      }

      const structureStep = Math.max(4.5, Math.min(7, width / 285));
      for (let y = minY; y <= maxY; y += structureStep) {
        for (let x = minX; x <= maxX; x += structureStep) {
          const px = Math.max(0, Math.min(width - 1, Math.round(x)));
          const py = Math.max(0, Math.min(height - 1, Math.round(y)));
          const pixel = (py * width + px) * 4;
          const luminance = source.data[pixel] * .2126
            + source.data[pixel + 1] * .7152
            + source.data[pixel + 2] * .0722;
          if (!maskContains(x, y, 2) || luminance > 172 || Math.random() < .42) continue;
          petParticles.push({
            petIndex,
            baseX: x,
            baseY: y,
            phase: Math.random() * Math.PI * 2,
            speed: .00005 + Math.random() * .00005,
            amplitude: 1.2 + Math.random() * 2,
            size: .95 + Math.random() * 1.15,
            alpha: .86 + Math.random() * .12,
            color: Math.random() < .38 ? "232,255,255" : "105,190,200",
            structural: true,
          });
        }
      }
    });
    root.classList.add("pet-effects-ready");
  };

  const drawPetParticles = (time) => {
    petCtx.clearRect(0, 0, width, height);
    if (!petOutlineCanvas || !petHighlightCanvas || !petParticles.length) return;
    const motions = petRegions.map((region, index) => ({
      breath: reduceMotion ? 1 : 1 + Math.sin(time / region.period * Math.PI * 2 + index) * .006,
      driftX: reduceMotion ? 0 : Math.sin(time * .000085 + region.phase) * 3.2,
      driftY: reduceMotion ? 0 : Math.cos(time * .000068 + region.phase) * 2.4,
      layoutScale: width < 700 ? 1.05 : 1.1,
      layoutShiftX: (index < 3 ? -1 : 1) * width * (width < 700 ? .012 : .026),
    }));

    petRegions.forEach((region, index) => {
      const active = activePet === region.id;
      const motion = motions[index];
      const centerX = region.x * width;
      const centerY = region.y * height;
      const targetCenterX = centerX + motion.layoutShiftX + motion.driftX;
      const targetCenterY = centerY + motion.driftY;
      petCtx.save();
      petCtx.beginPath();
      petCtx.ellipse(targetCenterX, targetCenterY, region.rx * width * 1.2, region.ry * height * 1.2, 0, 0, Math.PI * 2);
      petCtx.clip();
      petCtx.translate(targetCenterX, targetCenterY);
      petCtx.scale(motion.breath * motion.layoutScale, motion.breath * motion.layoutScale);
      petCtx.translate(-centerX, -centerY);
      petCtx.globalAlpha = active ? 1 : .94;
      petCtx.shadowColor = active ? "rgba(233,255,255,.86)" : "rgba(168,220,221,.68)";
      petCtx.shadowBlur = active ? 11 : 7;
      petCtx.drawImage(petOutlineCanvas, 0, 0, width, height);
      petCtx.globalAlpha = active ? .96 : .88;
      petCtx.shadowColor = "rgba(232,255,255,.7)";
      petCtx.shadowBlur = active ? 8 : 4;
      petCtx.drawImage(petHighlightCanvas, 0, 0, width, height);
      petCtx.restore();
    });

    const rendered = petParticles.map((particle) => {
      const region = petRegions[particle.petIndex];
      const motion = motions[particle.petIndex];
      const active = activePet === region.id;
      const centerX = region.x * width;
      const centerY = region.y * height;
      const sourceBaseX = centerX + (particle.baseX - centerX) * motion.breath;
      const sourceBaseY = centerY + (particle.baseY - centerY) * motion.breath;
      const flowX = reduceMotion ? 0 : Math.sin(time * particle.speed + particle.phase) * particle.amplitude;
      const flowY = reduceMotion ? 0 : Math.cos(time * particle.speed * .76 + particle.phase) * particle.amplitude * .62;
      const candidateX = sourceBaseX + flowX;
      const candidateY = sourceBaseY + flowY;
      const sourceX = maskContains(candidateX, candidateY, 1) ? candidateX : sourceBaseX;
      const sourceY = maskContains(candidateX, candidateY, 1) ? candidateY : sourceBaseY;
      const x = centerX + (sourceX - centerX) * motion.layoutScale + motion.layoutShiftX + motion.driftX;
      const y = centerY + (sourceY - centerY) * motion.layoutScale + motion.driftY;
      const pulse = reduceMotion ? 1 : .94 + Math.sin(time * .0008 + particle.phase) * .06;
      return { ...particle, x, y, flowX, flowY, active, pulse };
    });

    petCtx.beginPath();
    rendered.forEach((particle, index) => {
      if (index % 6) return;
      petCtx.moveTo(particle.x - particle.flowX * .75, particle.y - particle.flowY * .75);
      petCtx.lineTo(particle.x, particle.y);
    });
    petCtx.strokeStyle = "rgba(168,220,221,.24)";
    petCtx.lineWidth = .72;
    petCtx.stroke();

    rendered.forEach((particle, index) => {
      petCtx.beginPath();
      petCtx.arc(particle.x, particle.y, particle.size * (particle.active ? 1.14 : 1), 0, Math.PI * 2);
      petCtx.fillStyle = `rgba(${particle.color},${particle.alpha * particle.pulse * (particle.active ? 1 : .96)})`;
      if (index % 17 === 0) {
        petCtx.shadowColor = `rgba(${particle.color},.5)`;
        petCtx.shadowBlur = 5;
      }
      petCtx.fill();
      petCtx.shadowBlur = 0;
    });
  };

  const drawRing = (cx, cy, radius, tilt, rotation, color, dash, exitProgress, compression = .43, lineWidth = 1) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt + rotation);
    ctx.scale(1, compression);
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.lineDashOffset = rotation * 34;
    const openedRadius = radius * (1 + exitProgress * 1.1);
    ctx.arc(0, 0, openedRadius, .12, Math.PI * 1.88);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  };

  const drawCore = (time, exitProgress) => {
    const cx = width * .5;
    const cy = height * .48;
    const baseRadius = Math.max(145, Math.min(260, width * .135));
    const breath = reduceMotion ? 1 : 1 + Math.sin(time / 6500 * Math.PI * 2) * .006;
    const hoverBoost = hoveredCore ? 1.015 : 1;
    const radius = baseRadius * breath * hoverBoost;

    [
      { x: -.07, y: .02, scale: 1, alpha: .34 },
      { x: .06, y: -.045, scale: .82, alpha: .22 },
      { x: .015, y: .07, scale: .66, alpha: .17 },
    ].forEach((cloud) => {
      const cloudX = cx + radius * cloud.x;
      const cloudY = cy + radius * cloud.y;
      const cloudRadius = radius * cloud.scale;
      const halo = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudRadius * 1.12);
      halo.addColorStop(0, `rgba(245,252,251,${cloud.alpha + (hoveredCore ? .025 : 0)})`);
      halo.addColorStop(.45, `rgba(168,220,221,${cloud.alpha * .5})`);
      halo.addColorStop(1, "rgba(115,181,192,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, cloudRadius * 1.08, cloudRadius * .86, cloud.x * 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    const ringLight = hoveredCore ? .44 : .34;
    drawRing(cx, cy, radius * 1.08, .21, time / 28000 * Math.PI * 2, `rgba(233,255,255,${ringLight * .94})`, [18, 8, 4, 13], exitProgress, .5, 1.15);
    drawRing(cx, cy, radius * 1.2, -.31, -time / 34000 * Math.PI * 2, `rgba(115,181,192,${ringLight * .88})`, [5, 11, 22, 7], exitProgress, .38, 1.05);
    drawRing(cx, cy, radius * 1.33, -.49, -time / 39000 * Math.PI * 2, `rgba(168,220,221,${ringLight * .9})`, [7, 14, 25, 9], exitProgress, .46, 1.08);
    drawRing(cx, cy, radius * 1.46, .72, time / 44000 * Math.PI * 2, `rgba(115,181,192,${ringLight * .8})`, [12, 5, 3, 18], exitProgress, .34, 1);
    drawRing(cx, cy, radius * 1.59, .98, time / 51000 * Math.PI * 2, `rgba(156,170,212,${ringLight * .72})`, [3, 12, 16, 22], exitProgress, .42, .95);
    drawRing(cx, cy, radius * 1.72, -1.17, -time / 58000 * Math.PI * 2, `rgba(168,220,221,${ringLight * .58})`, [24, 11, 5, 17], exitProgress, .29, .9);

    coreParticles.forEach((particle) => {
      const organic = 1
        + Math.sin(particle.angle * 3 + time * .00028 + particle.phase) * .045
        + Math.sin(particle.angle * 5 - time * .00016 + particle.phase * .7) * .024;
      const localRadius = radius * particle.spread * organic;
      const angle = particle.angle + Math.sin(time * .00008 + particle.phase) * particle.drift;
      const x = cx + Math.cos(angle) * localRadius;
      const y = cy + Math.sin(angle) * localRadius * .82;
      const edge = 1 - particle.spread;
      const opacity = (.28 + edge * .64) * (1 - exitProgress * .28);
      ctx.beginPath();
      ctx.arc(x, y, particle.size * (edge + .55), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color},${opacity})`;
      ctx.fill();
    });
  };

  const frame = (time) => {
    ctx.clearRect(0, 0, width, height);
    const exitProgress = enteringAt ? Math.min(1, (time - enteringAt) / 760) : 0;
    drawPetParticles(time);
    drawAmbient(time);
    drawConnections(time, exitProgress);
    drawCore(time, exitProgress);
    requestAnimationFrame(frame);
  };

  const setPointer = (event) => {
    if (reduceMotion || enteringAt) return;
    const normalizedX = event.clientX / width - .5;
    const normalizedY = event.clientY / height - .5;
    root.style.setProperty("--pointer-x", `${normalizedX * 8}px`);
    root.style.setProperty("--pointer-y", `${normalizedY * 8}px`);
    root.style.setProperty("--core-x", `${normalizedX * 14}px`);
    root.style.setProperty("--core-y", `${normalizedY * 14}px`);
  };

  root.querySelectorAll(".pet-hotspot").forEach((hotspot) => {
    hotspot.addEventListener("pointerenter", () => {
      activePet = hotspot.dataset.pet || "";
      root.dataset.activePet = activePet;
    });
    hotspot.addEventListener("pointerleave", () => {
      activePet = "";
      delete root.dataset.activePet;
    });
  });

  coreButton.addEventListener("pointerenter", () => { hoveredCore = true; });
  coreButton.addEventListener("pointerleave", () => { hoveredCore = false; });
  coreButton.addEventListener("click", () => {
    if (enteringAt) return;
    enteringAt = performance.now();
    root.classList.add("is-entering");
    window.setTimeout(() => { window.location.href = "/home.html"; }, 1080);
  });
  window.addEventListener("pointermove", setPointer, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pageshow", () => {
    if (root.classList.contains("is-entering")) {
      root.classList.remove("is-entering");
      enteringAt = 0;
    }
  });

  petImage.addEventListener("load", preparePetField, { once: true });
  petImage.src = "/mira-pet-lineart-v5.png";
  resize();
  requestAnimationFrame(frame);
})();
