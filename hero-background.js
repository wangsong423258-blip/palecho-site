(function () {
    "use strict";

    const CONFIG = Object.freeze({
        dprLimit: 2,
        desktopParticles: { min: 124, max: 176 },
        tabletParticles: 86,
        mobileParticles: 54,
        pointerStopDelay: 460,
        pointerRecoverySeconds: 2.1,
        pointerRadius: 130,
        repulsion: 10,
        parallax: [8, 15, 24],
        glowCount: 4,
        glowParallaxRatio: 0.26,
        rippleDuration: [8000, 12000],
        rippleDelay: [8500, 14500],
        brandDelay: [17000, 28000],
        brandDuration: 900,
        colors: ["51,119,255", "72,137,255", "104,161,255", "93,116,244", "136,175,255", "67,130,238", "158,170,255", "184,211,255"],
        glowColors: ["58,124,255", "102,153,255", "160,195,255", "133,114,244"],
    });

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const damp = (current, target, smoothing, deltaSeconds) => (
        current + (target - current) * (1 - Math.exp(-smoothing * deltaSeconds))
    );

    const getContentAttenuation = (x, y, width, height) => {
        if (!width || !height) return 1;
        const nx = x / width;
        const ny = y / height;
        const zones = [
            { x: 0.5, y: 0.315, rx: 0.31, ry: 0.09, alpha: 0.56 },
            { x: 0.5, y: 0.545, rx: 0.38, ry: 0.105, alpha: 0.62 },
            { x: 0.5, y: 0.855, rx: 0.15, ry: 0.075, alpha: 0.58 },
        ];

        for (let index = 0; index < zones.length; index += 1) {
            const zone = zones[index];
            const dx = (nx - zone.x) / zone.rx;
            const dy = (ny - zone.y) / zone.ry;
            if (dx * dx + dy * dy < 1) return zone.alpha;
        }
        return 1;
    };

    const createGlowTexture = (rgb) => {
        const texture = document.createElement("canvas");
        texture.width = 256;
        texture.height = 256;
        const textureContext = texture.getContext("2d");
        const gradient = textureContext.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, `rgba(${rgb},0.9)`);
        gradient.addColorStop(0.28, `rgba(${rgb},0.42)`);
        gradient.addColorStop(0.68, `rgba(${rgb},0.1)`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);
        textureContext.fillStyle = gradient;
        textureContext.fillRect(0, 0, 256, 256);
        return texture;
    };

    const init = () => {
        const hero = document.querySelector(".hero-section");
        const container = document.getElementById("canvas-container");
        if (!hero || !container || container.dataset.livingBackgroundReady === "true") return null;

        container.dataset.livingBackgroundReady = "true";
        const canvas = document.createElement("canvas");
        canvas.className = "hero-living-canvas";
        canvas.setAttribute("aria-hidden", "true");
        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return null;
        container.appendChild(canvas);

        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const finePointerQuery = window.matchMedia("(pointer: fine)");
        let reducedMotion = motionQuery.matches;
        let width = 1;
        let height = 1;
        let dpr = 1;
        let particles = [];
        let glows = [];
        let ripples = [];
        let animationFrame = 0;
        let lastTime = performance.now();
        let nextRippleAt = lastTime;
        let nextBrandAt = lastTime + randomBetween(...CONFIG.brandDelay);
        let isDestroyed = false;

        const pointer = {
            inside: false,
            x: 0,
            y: 0,
            normalizedX: 0,
            normalizedY: 0,
            smoothedX: 0,
            smoothedY: 0,
            flowX: 0,
            flowY: 0,
            targetFlowX: 0,
            targetFlowY: 0,
            influence: 0,
            lastMove: 0,
            previousX: 0,
            previousY: 0,
            previousTime: 0,
        };

        const brandSignal = {
            active: false,
            startedAt: 0,
            count: 0,
        };

        const chooseParticleCount = () => {
            if (width < 640) return CONFIG.mobileParticles;
            if (width < 1024) return CONFIG.tabletParticles;

            const memory = navigator.deviceMemory || 8;
            const cores = navigator.hardwareConcurrency || 8;
            if (memory <= 4 || cores <= 4) return CONFIG.desktopParticles.min;
            const areaBasedCount = Math.round((width * height) / 13000);
            return clamp(areaBasedCount, CONFIG.desktopParticles.min, CONFIG.desktopParticles.max);
        };

        const findQuietPosition = () => {
            let x = Math.random() * width;
            let y = Math.random() * height;
            for (let attempt = 0; attempt < 8; attempt += 1) {
                if (getContentAttenuation(x, y, width, height) === 1 || Math.random() > 0.64) break;
                x = Math.random() * width;
                y = Math.random() * height;
            }
            return { x, y };
        };

        // 粒子初始化：按设备能力控制数量，并让三个深度层拥有独立尺寸、透明度与节奏。
        const createParticles = () => {
            const count = chooseParticleCount();
            particles = Array.from({ length: count }, (_, index) => {
                const layerRoll = Math.random();
                const layer = layerRoll < 0.45 ? 0 : layerRoll < 0.87 ? 1 : 2;
                const position = findQuietPosition();
                const speedRange = layer === 0 ? [1.05, 1.85] : layer === 1 ? [1.3, 2.45] : [1.55, 2.9];
                const size = layer === 0
                    ? randomBetween(1, 1.8)
                    : layer === 1
                        ? randomBetween(1.6, 2.8)
                        : randomBetween(2.8, 4);
                const baseAlpha = layer === 2
                    ? randomBetween(0.48, 0.7)
                    : layer === 1
                        ? randomBetween(0.54, Math.random() > 0.82 ? 0.88 : 0.76)
                        : randomBetween(0.46, Math.random() > 0.88 ? 0.8 : 0.67);
                const heading = Math.random() * Math.PI * 2;
                const speed = randomBetween(...speedRange);

                return {
                    x: position.x,
                    y: position.y,
                    vx: Math.cos(heading) * speed,
                    vy: Math.sin(heading) * speed,
                    speed,
                    size,
                    baseAlpha,
                    color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                    layer,
                    phase: Math.random() * Math.PI * 2,
                    phaseSecondary: Math.random() * Math.PI * 2,
                    breathSpeed: randomBetween(0.24, 0.58),
                    fieldScale: randomBetween(0.0017, 0.0034),
                    repulsionX: 0,
                    repulsionY: 0,
                    brandSlot: -1,
                    index,
                };
            });
        };

        // 光晕使用预渲染纹理，避免在每一帧创建大尺寸渐变。
        const createGlows = () => {
            glows = Array.from({ length: CONFIG.glowCount }, (_, index) => ({
                baseX: randomBetween(0.05, 0.95),
                baseY: randomBetween(0.05, 0.95),
                scale: randomBetween(0.64, 1.02),
                alpha: randomBetween(0.16, index === 2 ? 0.21 : 0.25),
                phase: Math.random() * Math.PI * 2,
                phaseSecondary: Math.random() * Math.PI * 2,
                period: randomBetween(40000, 80000),
                texture: createGlowTexture(CONFIG.glowColors[index % CONFIG.glowColors.length]),
            }));
        };

        const createRipple = (now, initialProgress = 0) => {
            const anchors = [
                [0.12, 0.2], [0.86, 0.23], [0.12, 0.7], [0.88, 0.72], [0.24, 0.9], [0.76, 0.1],
            ];
            const anchor = anchors[Math.floor(Math.random() * anchors.length)];
            const duration = randomBetween(...CONFIG.rippleDuration) * (reducedMotion ? 1.35 : 1);
            return {
                x: clamp(anchor[0] + randomBetween(-0.055, 0.055), 0.05, 0.95),
                y: clamp(anchor[1] + randomBetween(-0.055, 0.055), 0.06, 0.94),
                bornAt: now - duration * initialProgress,
                duration,
                rings: Math.random() > 0.28 ? 3 : 2,
                maxRadius: randomBetween(150, Math.min(330, Math.max(190, width * 0.2))),
                rotation: randomBetween(-0.12, 0.12),
                squash: randomBetween(0.94, 1.04),
                color: CONFIG.colors[1 + Math.floor(Math.random() * (CONFIG.colors.length - 1))],
            };
        };

        const resetBrandSignal = () => {
            brandSignal.active = false;
            brandSignal.count = 0;
            for (let index = 0; index < particles.length; index += 1) particles[index].brandSlot = -1;
        };

        // 品牌隐藏细节：极少数微光短暂产生抽象的信号弧线，不形成可识别图标。
        const startBrandSignal = (now) => {
            resetBrandSignal();
            brandSignal.count = Math.max(1, Math.ceil(particles.length * 0.008));
            brandSignal.startedAt = now;
            brandSignal.active = true;
            for (let slot = 0; slot < brandSignal.count; slot += 1) {
                particles[Math.floor(Math.random() * particles.length)].brandSlot = slot;
            }
        };

        const resize = () => {
            const bounds = hero.getBoundingClientRect();
            width = Math.max(1, Math.round(bounds.width));
            height = Math.max(1, Math.round(bounds.height));
            dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprLimit);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            createParticles();
            createGlows();
            resetBrandSignal();
            ripples = [createRipple(performance.now(), randomBetween(0.08, 0.42))];
            nextRippleAt = performance.now() + randomBetween(...CONFIG.rippleDelay);
        };

        const updatePointer = (now, deltaSeconds) => {
            const canInteract = finePointerQuery.matches && width >= 768 && !reducedMotion;
            const isMoving = canInteract && pointer.inside && now - pointer.lastMove < CONFIG.pointerStopDelay;
            const influenceTarget = isMoving ? 1 : 0;
            const recoverySmoothing = influenceTarget ? 5.4 : 1 / CONFIG.pointerRecoverySeconds;
            pointer.influence = damp(pointer.influence, influenceTarget, recoverySmoothing, deltaSeconds);
            pointer.smoothedX = damp(pointer.smoothedX, pointer.normalizedX * pointer.influence, 2.1, deltaSeconds);
            pointer.smoothedY = damp(pointer.smoothedY, pointer.normalizedY * pointer.influence, 2.1, deltaSeconds);
            pointer.flowX = damp(pointer.flowX, isMoving ? pointer.targetFlowX : 0, isMoving ? 4.2 : 1.15, deltaSeconds);
            pointer.flowY = damp(pointer.flowY, isMoving ? pointer.targetFlowY : 0, isMoving ? 4.2 : 1.15, deltaSeconds);
        };

        const drawGlows = (now) => {
            for (let index = 0; index < glows.length; index += 1) {
                const glow = glows[index];
                const progress = now / glow.period;
                const autonomousX = Math.sin(progress * Math.PI * 2 + glow.phase) * width * 0.08
                    + Math.cos(progress * Math.PI * 1.3 + glow.phaseSecondary) * width * 0.035;
                const autonomousY = Math.cos(progress * Math.PI * 1.55 + glow.phaseSecondary) * height * 0.07
                    + Math.sin(progress * Math.PI * 0.9 + glow.phase) * height * 0.03;
                const pointerX = pointer.smoothedX * CONFIG.parallax[0] * CONFIG.glowParallaxRatio;
                const pointerY = pointer.smoothedY * CONFIG.parallax[0] * CONFIG.glowParallaxRatio;
                const sizeBase = width < 640 ? Math.min(620, Math.max(380, width * 1.15)) : Math.min(1000, Math.max(600, width * 0.58));
                const size = sizeBase * glow.scale;
                const x = glow.baseX * width + autonomousX + pointerX;
                const y = glow.baseY * height + autonomousY + pointerY;
                const breathing = 0.88 + Math.sin(progress * Math.PI * 2.35 + glow.phaseSecondary) * 0.12;
                context.globalAlpha = glow.alpha * breathing;
                context.drawImage(glow.texture, x - size / 2, y - size / 2, size, size);
            }
            context.globalAlpha = 1;
        };

        // 自主运动由缓慢变化的噪声向量场驱动，形成连续弯曲而非整齐往返的轨迹。
        const drawParticles = (now, deltaSeconds) => {
            const timeSeconds = now * 0.001;
            const brandProgress = brandSignal.active
                ? (now - brandSignal.startedAt) / CONFIG.brandDuration
                : 0;
            const brandEnvelope = brandSignal.active && brandProgress < 1
                ? Math.sin(brandProgress * Math.PI) ** 2
                : 0;

            if (brandSignal.active && brandProgress >= 1) resetBrandSignal();

            for (let index = 0; index < particles.length; index += 1) {
                const particle = particles[index];
                const fieldAngle = Math.sin(particle.x * particle.fieldScale + timeSeconds * 0.045 + particle.phase) * 1.8
                    + Math.cos(particle.y * particle.fieldScale * 1.14 - timeSeconds * 0.038 + particle.phaseSecondary) * 1.35;
                const motionScale = reducedMotion ? 0.18 : 1;
                const targetVx = Math.cos(fieldAngle) * particle.speed * motionScale;
                const targetVy = (Math.sin(fieldAngle) * particle.speed + Math.sin(timeSeconds * 0.12 + particle.phase) * 0.22) * motionScale;
                particle.vx = damp(particle.vx, targetVx, 0.28, deltaSeconds);
                particle.vy = damp(particle.vy, targetVy, 0.28, deltaSeconds);
                particle.x += particle.vx * deltaSeconds;
                particle.y += particle.vy * deltaSeconds;

                const wrapMargin = 18;
                if (particle.x < -wrapMargin) particle.x = width + wrapMargin;
                if (particle.x > width + wrapMargin) particle.x = -wrapMargin;
                if (particle.y < -wrapMargin) particle.y = height + wrapMargin;
                if (particle.y > height + wrapMargin) particle.y = -wrapMargin;

                const parallaxStrength = CONFIG.parallax[particle.layer];
                let x = particle.x + pointer.smoothedX * parallaxStrength + pointer.flowX * (particle.layer + 1) * 0.6;
                let y = particle.y + pointer.smoothedY * parallaxStrength + pointer.flowY * (particle.layer + 1) * 0.6;

                // 鼠标局部排斥只改变渲染偏移，并通过阻尼在离开后缓慢归位。
                let repulsionTargetX = 0;
                let repulsionTargetY = 0;
                if (pointer.influence > 0.01 && pointer.inside && !reducedMotion) {
                    const dx = x - pointer.x;
                    const dy = y - pointer.y;
                    const distance = Math.hypot(dx, dy);
                    if (distance > 0.1 && distance < CONFIG.pointerRadius) {
                        const force = (1 - distance / CONFIG.pointerRadius) ** 2 * CONFIG.repulsion * pointer.influence;
                        repulsionTargetX = dx / distance * force;
                        repulsionTargetY = dy / distance * force;
                    }
                }
                particle.repulsionX = damp(particle.repulsionX, repulsionTargetX, repulsionTargetX ? 4.1 : 1.35, deltaSeconds);
                particle.repulsionY = damp(particle.repulsionY, repulsionTargetY, repulsionTargetY ? 4.1 : 1.35, deltaSeconds);
                x += particle.repulsionX;
                y += particle.repulsionY;

                if (particle.brandSlot >= 0 && brandEnvelope > 0) {
                    const slotPhase = brandSignal.count <= 1 ? 0.5 : particle.brandSlot / (brandSignal.count - 1);
                    x += Math.sin(slotPhase * Math.PI * 1.8 + particle.phase) * 5 * brandEnvelope;
                    y += Math.cos(slotPhase * Math.PI * 2.2 + particle.phaseSecondary) * 3 * brandEnvelope;
                }

                const breathing = 0.68 + 0.32 * Math.sin(timeSeconds * particle.breathSpeed + particle.phase);
                const quietZone = getContentAttenuation(x, y, width, height);
                const alpha = particle.baseAlpha * breathing * quietZone * (1 + brandEnvelope * 0.12);

                context.fillStyle = `rgb(${particle.color})`;
                if (particle.layer >= 1) {
                    context.globalAlpha = alpha * (particle.layer === 2 ? 0.36 : 0.2);
                    context.beginPath();
                    context.arc(x, y, particle.size * (particle.layer === 2 ? 3 : 2.4), 0, Math.PI * 2);
                    context.fill();
                }
                context.globalAlpha = Math.min(0.92, alpha * 1.18);
                context.beginPath();
                context.arc(x, y, particle.size, 0, Math.PI * 2);
                context.fill();
            }
            context.globalAlpha = 1;
        };

        // Echo 波纹拥有独立节奏，只在留白处保留一到两个极淡、缓慢扩散的信号。
        const drawRipples = (now) => {
            const maximumRipples = width < 768 ? 1 : 2;
            if (now >= nextRippleAt && ripples.length < maximumRipples) {
                ripples.push(createRipple(now));
                const delayMultiplier = reducedMotion ? 2.2 : 1;
                nextRippleAt = now + randomBetween(...CONFIG.rippleDelay) * delayMultiplier;
            }

            for (let index = ripples.length - 1; index >= 0; index -= 1) {
                const ripple = ripples[index];
                const progress = (now - ripple.bornAt) / ripple.duration;
                if (progress >= 1) {
                    ripples.splice(index, 1);
                    continue;
                }

                const easedProgress = 1 - (1 - progress) ** 3;
                const radius = 8 + ripple.maxRadius * easedProgress;
                const fade = Math.sin(progress * Math.PI) * (1 - progress * 0.42);
                let x = ripple.x * width;
                let y = ripple.y * height;
                if (pointer.influence > 0.01 && !reducedMotion) {
                    const distance = Math.hypot(pointer.x - x, pointer.y - y);
                    if (distance < 190) {
                        const offset = (1 - distance / 190) * pointer.influence * 1.8;
                        x += pointer.smoothedX * offset;
                        y += pointer.smoothedY * offset;
                    }
                }

                context.strokeStyle = `rgb(${ripple.color})`;
                context.lineWidth = 1.25;
                for (let ring = 0; ring < ripple.rings; ring += 1) {
                    const ringRadius = radius * (1 - ring * 0.13) - ring * 3.5;
                    if (ringRadius <= 0) continue;
                    context.globalAlpha = fade * (0.3 - ring * 0.045);
                    context.beginPath();
                    context.ellipse(
                        x,
                        y,
                        ringRadius,
                        ringRadius * (ripple.squash + ring * 0.008),
                        ripple.rotation + ring * 0.018,
                        0,
                        Math.PI * 2,
                    );
                    context.stroke();
                }
            }
            context.globalAlpha = 1;
        };

        const render = (now) => {
            if (isDestroyed) return;
            const deltaSeconds = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;
            updatePointer(now, deltaSeconds);

            context.clearRect(0, 0, width, height);
            drawGlows(now);
            drawParticles(now, deltaSeconds);
            drawRipples(now);

            if (!reducedMotion && now >= nextBrandAt && !brandSignal.active) {
                startBrandSignal(now);
                nextBrandAt = now + randomBetween(...CONFIG.brandDelay);
            }
            animationFrame = window.requestAnimationFrame(render);
        };

        const onPointerMove = (event) => {
            if (!finePointerQuery.matches || reducedMotion || width < 768) return;
            const bounds = hero.getBoundingClientRect();
            const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
                && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
            pointer.inside = inside;
            if (!inside) return;

            const now = performance.now();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            const elapsed = Math.max(16, now - pointer.previousTime);
            pointer.targetFlowX = clamp((x - pointer.previousX) / elapsed * 8, -3.5, 3.5);
            pointer.targetFlowY = clamp((y - pointer.previousY) / elapsed * 8, -3.5, 3.5);
            pointer.previousX = x;
            pointer.previousY = y;
            pointer.previousTime = now;
            pointer.x = x;
            pointer.y = y;
            pointer.normalizedX = clamp((x / width - 0.5) * 2, -1, 1);
            pointer.normalizedY = clamp((y / height - 0.5) * 2, -1, 1);
            pointer.lastMove = now;
        };

        const onPointerLeave = () => {
            pointer.inside = false;
            pointer.targetFlowX = 0;
            pointer.targetFlowY = 0;
        };

        // 标签页隐藏时完全暂停帧循环，恢复后从新的时间基准继续。
        const onVisibilityChange = () => {
            if (document.hidden) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            } else if (!animationFrame && !isDestroyed) {
                lastTime = performance.now();
                animationFrame = window.requestAnimationFrame(render);
            }
        };

        const onMotionPreferenceChange = (event) => {
            reducedMotion = event.matches;
            pointer.inside = false;
            pointer.influence = 0;
            resetBrandSignal();
            nextRippleAt = performance.now() + randomBetween(...CONFIG.rippleDelay) * (reducedMotion ? 2.2 : 1);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(hero);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("blur", onPointerLeave);
        hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        motionQuery.addEventListener("change", onMotionPreferenceChange);

        resize();
        animationFrame = window.requestAnimationFrame(render);

        const destroy = () => {
            if (isDestroyed) return;
            isDestroyed = true;
            window.cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("blur", onPointerLeave);
            hero.removeEventListener("pointerleave", onPointerLeave);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            motionQuery.removeEventListener("change", onMotionPreferenceChange);
            canvas.remove();
            delete container.dataset.livingBackgroundReady;
        };

        window.addEventListener("pagehide", (event) => {
            if (!event.persisted) destroy();
        }, { once: true });

        return { destroy };
    };

    window.PalEchoHeroBackground = { init };
}());
