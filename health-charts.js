(() => {
  const charts = {
    heart: {
      kind: "line",
      color: "#425f8a",
      min: 84,
      max: 100,
      motion: 0.32,
      values: [88, 89, 91, 90, 93, 92, 94, 91, 90, 92, 95, 93, 91, 92, 90, 89, 91, 94, 93, 92, 90, 91, 89, 92],
    },
    respiration: {
      kind: "line",
      color: "#3f628b",
      min: 16,
      max: 24,
      motion: 0.14,
      values: [19.1, 19.4, 20.1, 20.7, 20.3, 19.6, 19.2, 19.8, 20.6, 21.2, 20.8, 20.1, 19.5, 19.3, 19.9, 20.5, 20.9, 20.4, 19.8, 19.5, 20, 20.6, 20.2, 20],
    },
    temperature: {
      kind: "line",
      color: "#536784",
      min: 37.7,
      max: 38.8,
      motion: 0.018,
      values: [38.08, 38.12, 38.18, 38.2, 38.17, 38.14, 38.16, 38.22, 38.28, 38.31, 38.29, 38.26, 38.25, 38.28, 38.32, 38.35, 38.33, 38.3, 38.27, 38.25, 38.28, 38.31, 38.29, 38.3],
    },
    stress: {
      kind: "bars",
      color: "#58b84d",
      max: 35,
      values: [12, 16, 14, 19, 17, 13, 15, 11, 14, 13, 16, 12],
    },
    sleep: {
      kind: "bars",
      color: "#7166cc",
      max: 100,
      values: [18, 31, 64, 82, 58, 43, 71, 54, 88, 76, 39, 24],
    },
  };

  const fitCanvas = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
    const pixelHeight = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  };

  const grid = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = "rgba(64, 83, 105, .09)";
    ctx.lineWidth = 0.6;
    ctx.setLineDash([1.5, 3]);
    [0.28, 0.58].forEach((at) => {
      ctx.beginPath();
      ctx.moveTo(0, height * at);
      ctx.lineTo(width, height * at);
      ctx.stroke();
    });
    ctx.restore();
  };

  const drawLine = (canvas, spec, time) => {
    const { ctx, width, height } = fitCanvas(canvas);
    const phase = time * 0.00042;
    const values = spec.values.map((value, index) => value
      + Math.sin(index * 1.67 + phase) * spec.motion
      + Math.sin(index * 0.61 - phase * 1.3) * spec.motion * 0.42);
    const min = spec.min;
    const max = spec.max;
    const spread = Math.max(max - min, 0.1);
    const top = 4;
    const bottom = height - 4;
    const points = values.map((value, index) => ({
      x: (index / (values.length - 1)) * width,
      y: bottom - ((value - min) / spread) * (bottom - top),
    }));

    ctx.clearRect(0, 0, width, height);
    grid(ctx, width, height);

    const makePath = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        ctx.bezierCurveTo(midX, current.y, midX, next.y, next.x, next.y);
      }
    };

    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, "rgba(74, 100, 143, .16)");
    fill.addColorStop(1, "rgba(74, 100, 143, 0)");
    makePath();
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    makePath();
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 1.45;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    makePath();
    ctx.strokeStyle = "rgba(238, 249, 249, .74)";
    ctx.lineWidth = 2.1;
    ctx.setLineDash([7, 88]);
    ctx.lineDashOffset = -(time * 0.014) % 95;
    ctx.stroke();
    ctx.setLineDash([]);

    points.filter((_, index) => index % 6 === 0).forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
      ctx.fillStyle = spec.color;
      ctx.fill();
    });

    const travel = (time * 0.000085 + canvas.dataset.chart.length * 0.13) % 1;
    const pointIndex = travel * (points.length - 1);
    const from = points[Math.floor(pointIndex)];
    const to = points[Math.min(points.length - 1, Math.ceil(pointIndex))];
    const blend = pointIndex % 1;
    const tracerX = from.x + (to.x - from.x) * blend;
    const tracerY = from.y + (to.y - from.y) * blend;
    const pulse = 1.35 + Math.sin(time * 0.004) * 0.28;
    ctx.beginPath();
    ctx.arc(tracerX, tracerY, pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 252, 251, .96)";
    ctx.shadowColor = spec.color;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawBars = (canvas, spec, time) => {
    const { ctx, width, height } = fitCanvas(canvas);
    const max = spec.max;
    const gap = 3;
    const barWidth = (width - gap * (spec.values.length - 1)) / spec.values.length;

    ctx.clearRect(0, 0, width, height);
    grid(ctx, width, height);
    spec.values.forEach((value, index) => {
      const liveValue = value * (1 + Math.sin(time * 0.0011 + index * 0.78) * 0.045);
      const barHeight = Math.max(3, (liveValue / max) * (height - 5));
      const x = index * (barWidth + gap);
      const y = height - barHeight;
      const active = Math.floor(time / 850) % spec.values.length === index;
      ctx.fillStyle = active ? `${spec.color}ed` : index % 4 === 3 ? `${spec.color}88` : `${spec.color}bd`;
      ctx.shadowColor = active ? `${spec.color}77` : "transparent";
      ctx.shadowBlur = active ? 4 : 0;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, Math.min(2, barWidth / 2));
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const render = (time = 0) => {
    document.querySelectorAll(".metric-chart[data-chart]").forEach((canvas) => {
      const spec = charts[canvas.dataset.chart];
      if (!spec) return;
      if (spec.kind === "bars") drawBars(canvas, spec, time);
      else drawLine(canvas, spec, time);
    });
  };

  let resizeFrame;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame((time) => render(time));
  }, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    render();
    return;
  }

  let previous = 0;
  const animate = (time) => {
    if (time - previous >= 55) {
      render(time);
      previous = time;
    }
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
