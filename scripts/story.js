(() => {
  const canvas = document.getElementById("story-line");
  const story = document.getElementById("story");
  const scrollNote = document.querySelector(".scroll-note");
  const context = canvas?.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || !story || !context) return;

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0.12 },
  );
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 2) * 70}ms`;
    observer.observe(item);
  });

  let points = [];
  let pageHeight = 0;
  let pageWidth = 0;
  let ticking = false;

  const addLine = (x1, y1, x2, y2, steps = 24) => {
    for (let index = 1; index <= steps; index += 1) {
      const t = index / steps;
      points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
  };

  const addCurve = (start, controlA, controlB, end, steps = 54) => {
    for (let index = 1; index <= steps; index += 1) {
      const t = index / steps;
      const mt = 1 - t;
      points.push({
        x:
          mt * mt * mt * start.x +
          3 * mt * mt * t * controlA.x +
          3 * mt * t * t * controlB.x +
          t * t * t * end.x,
        y:
          mt * mt * mt * start.y +
          3 * mt * mt * t * controlA.y +
          3 * mt * t * t * controlB.y +
          t * t * t * end.y,
      });
    }
  };

  const stageCenter = (name) => {
    const element = document.querySelector(`[data-line-stage="${name}"]`);
    return element ? element.offsetTop + element.offsetHeight * 0.5 : 0;
  };

  const connectTo = (x, y) => {
    const start = points[points.length - 1];
    const bend = Math.max(90, Math.min(260, Math.abs(y - start.y) * 0.32));
    addCurve(
      start,
      { x: start.x, y: start.y + bend },
      { x, y: y - bend },
      { x, y },
      42,
    );
  };

  const buildPath = () => {
    pageWidth = Math.round(story.clientWidth);
    pageHeight = Math.round(story.scrollHeight);
    const mobile = pageWidth < 700;
    const spread = mobile ? Math.min(108, pageWidth * 0.28) : Math.min(315, pageWidth * 0.27);
    const center = pageWidth / 2;
    const left = center - spread;
    const right = center + spread;

    canvas.width = pageWidth;
    canvas.height = pageHeight;
    points = [{ x: center, y: 0 }];

    const opening = stageCenter("opening") * 0.42;
    connectTo(center, opening);
    addCurve(
      points[points.length - 1],
      { x: center - spread * 0.18, y: opening + 110 },
      { x: left, y: opening + 130 },
      { x: left, y: opening + 290 },
      44,
    );

    const dogY = stageCenter("dog");
    connectTo(left, dogY - 170);
    const dogStart = points[points.length - 1];
    addCurve(dogStart, { x: left - 44, y: dogY - 150 }, { x: left - 54, y: dogY - 42 }, { x: left - 10, y: dogY + 12 }, 24);
    addCurve(points[points.length - 1], { x: left + 8, y: dogY + 38 }, { x: left + 58, y: dogY + 42 }, { x: left + 63, y: dogY - 4 }, 22);
    addCurve(points[points.length - 1], { x: left + 69, y: dogY - 55 }, { x: left + 31, y: dogY - 106 }, { x: left + 10, y: dogY - 94 }, 18);
    addLine(left + 10, dogY - 94, left - 8, dogY - 150, 10);
    addLine(left - 8, dogY - 150, left - 38, dogY - 101, 10);
    addCurve(points[points.length - 1], { x: left - 94, y: dogY - 82 }, { x: left - 86, y: dogY - 22 }, { x: left - 10, y: dogY + 12 }, 28);

    const catY = stageCenter("cat");
    connectTo(right, catY - 145);
    addLine(right, catY - 145, right - 38, catY - 92, 12);
    addLine(right - 38, catY - 92, right - 52, catY - 150, 12);
    addCurve(points[points.length - 1], { x: right - 100, y: catY - 124 }, { x: right - 97, y: catY - 32 }, { x: right - 42, y: catY + 18 }, 28);
    addCurve(points[points.length - 1], { x: right - 5, y: catY + 52 }, { x: right + 74, y: catY + 38 }, { x: right + 73, y: catY - 24 }, 26);
    addCurve(points[points.length - 1], { x: right + 71, y: catY - 76 }, { x: right + 32, y: catY - 109 }, { x: right, y: catY - 145 }, 24);

    const heartY = stageCenter("heartbeat");
    connectTo(left, heartY);
    const wave = [
      [left + 42, heartY],
      [left + 62, heartY - 18],
      [left + 83, heartY + 34],
      [left + 108, heartY - 92],
      [left + 135, heartY + 72],
      [left + 160, heartY - 24],
      [center, heartY],
    ];
    wave.forEach(([x, y]) => addLine(points[points.length - 1].x, points[points.length - 1].y, x, y, 10));

    const lifeY = stageCenter("life");
    connectTo(right, lifeY - 70);
    addCurve(points[points.length - 1], { x: right + 115, y: lifeY - 10 }, { x: left - 100, y: lifeY + 42 }, { x: left, y: lifeY + 110 }, 68);

    const connectionY = stageCenter("connection");
    connectTo(center, connectionY - 80);
    addCurve(points[points.length - 1], { x: center - 150, y: connectionY - 210 }, { x: center - 190, y: connectionY + 105 }, { x: center, y: connectionY + 82 }, 42);
    addCurve(points[points.length - 1], { x: center + 190, y: connectionY + 105 }, { x: center + 150, y: connectionY - 210 }, { x: center, y: connectionY - 80 }, 42);

    const dataY = stageCenter("data");
    connectTo(left, dataY - 105);
    for (let index = 0; index < 7; index += 1) {
      const nextX = index % 2 ? right : left;
      const nextY = dataY - 105 + index * 40;
      addCurve(points[points.length - 1], { x: center, y: nextY - 24 }, { x: center, y: nextY + 24 }, { x: nextX, y: nextY + 40 }, 24);
    }

    const trajectoryY = stageCenter("trajectory");
    connectTo(right, trajectoryY - 130);
    addCurve(points[points.length - 1], { x: right + 75, y: trajectoryY + 10 }, { x: left - 65, y: trajectoryY - 6 }, { x: center, y: trajectoryY + 120 }, 62);

    const logoY = stageCenter("logo") - document.querySelector('[data-line-stage="logo"]').offsetHeight * 0.18;
    connectTo(center, logoY);
    const radius = mobile ? 58 : 92;
    for (let index = 1; index <= 70; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 70;
      points.push({ x: center + Math.cos(angle) * radius, y: logoY + Math.sin(angle) * radius * 0.58 });
    }
    addCurve(points[points.length - 1], { x: center + radius * 0.7, y: logoY + radius }, { x: center + 18, y: logoY + radius }, { x: center, y: logoY + radius * 1.45 }, 28);
  };

  const draw = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    const lineProgress = reducedMotion ? 1 : Math.min(1, scrollProgress * 1.055 + 0.025);
    const visibleCount = Math.max(2, Math.floor(points.length * lineProgress));

    context.clearRect(0, 0, pageWidth, pageHeight);
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < visibleCount; index += 1) {
      context.lineTo(points[index].x, points[index].y);
    }
    context.strokeStyle = "rgba(65, 105, 155, 0.24)";
    context.lineWidth = 1;
    context.stroke();

    if (visibleCount > 5 && !reducedMotion) {
      const tailStart = Math.max(0, visibleCount - 26);
      context.beginPath();
      context.moveTo(points[tailStart].x, points[tailStart].y);
      for (let index = tailStart + 1; index < visibleCount; index += 1) {
        context.lineTo(points[index].x, points[index].y);
      }
      context.strokeStyle = "rgba(105, 166, 245, 0.32)";
      context.lineWidth = 2;
      context.shadowColor = "rgba(105, 166, 245, 0.3)";
      context.shadowBlur = 8;
      context.stroke();
      context.shadowBlur = 0;
    }

    const peak = 0.67;
    const distance = Math.abs(scrollProgress - peak);
    const glow = Math.max(0, 1 - distance / 0.66);
    const afterPeak = Math.max(0, (scrollProgress - peak) / (1 - peak));
    document.documentElement.style.setProperty("--glow-opacity", `${0.035 + glow * 0.17}`);
    document.documentElement.style.setProperty("--glow-y", `${16 + scrollProgress * 68}%`);
    document.documentElement.style.setProperty("--glow-size", `${34 - afterPeak * 15}rem`);
    scrollNote?.classList.toggle("is-hidden", window.scrollY > Math.min(window.innerHeight * 0.62, 520));
    ticking = false;
  };

  const requestDraw = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(draw);
  };

  const resize = () => {
    buildPath();
    requestDraw();
  };

  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);
  buildPath();
  draw();
})();
