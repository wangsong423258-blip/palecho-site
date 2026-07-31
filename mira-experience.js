(() => {
    "use strict";

    const experience = document.getElementById("mira-experience");
    const scroll = document.getElementById("mira-scroll");
    const stage = document.getElementById("mira-stage");
    const canvas = document.getElementById("mira-particles");
    if (!experience || !scroll || !stage || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const heroScene = document.getElementById("mira-hero-scene");
    const reasonScene = document.getElementById("mira-reason-scene");
    const askScene = document.getElementById("mira-ask-scene");
    const protectTransition = document.getElementById("mira-protect-transition");
    const scrollCue = document.getElementById("mira-scroll-cue");
    const closeButton = document.getElementById("mira-close");
    const reasonSteps = Array.from(document.querySelectorAll(".mira-reason-step"));
    const reasonOrbit = document.querySelector(".mira-reason-orbit");
    const wordOrbitElements = Array.from(document.querySelectorAll("[data-mira-word-orbit]"));
    const primaryForm = document.getElementById("mira-form");
    const primaryInput = document.getElementById("mira-input");
    const chatForm = document.getElementById("mira-chat-form");
    const chatInput = document.getElementById("mira-chat-input");
    const chatLog = document.getElementById("mira-chat-log");
    const prompts = Array.from(document.querySelectorAll(".mira-prompt"));
    const uploadButtons = Array.from(document.querySelectorAll(".mira-upload-button"));
    const uploadInputs = Array.from(document.querySelectorAll(".mira-upload-input"));
    const uploadStatus = document.getElementById("mira-upload-status");
    const mediaUploadMenu = document.getElementById("mira-media-upload-menu");
    const mediaUploadChoices = Array.from(document.querySelectorAll(".mira-media-upload-menu button"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let restoreScrollY = 0;
    let isOpen = false;
    let closingTimer = 0;
    let scrollProgress = 0;
    let renderProgress = 0;
    let lastFrame = performance.now();
    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;
    let particles = [];
    let cosmicDust = [];
    let petsMask = null;
    let animationFrame = 0;
    let chatStarted = false;
    let introStartedAt = -Infinity;
    let activeMediaInput = null;
    let wordOrbits = [];
    let wordSwapAt = -Infinity;
    let wordSwapCount = 0;

    // The particle model belongs exclusively to the opening scene. Keeping these
    // boundaries ahead of the second scene prevents a partially assembled pet
    // from lingering behind "Inside Mira" when the user scrolls quickly.
    const introDuration = 2700;
    const particleExitStart = 0.012;
    const particleExitEnd = 0.2;
    const reasonParticleStart = 0.255;
    const reasonParticleEnd = 0.64;

    const wordOrbitDefinitions = [
        {
            id: "core",
            count: 8,
            mobileCount: 6,
            speed: 0.000018,
            radiusX: 0.285,
            radiusY: 0.205,
            maxX: 344,
            maxY: 178,
            words: [
                ["Perception", "感知"], ["Understanding", "理解"], ["Memory", "记忆"],
                ["Reasoning", "推理"], ["Learning", "学习"], ["Prediction", "预测"],
                ["Connection", "连接"], ["Protection", "守护"], ["Evolution", "进化"],
                ["Awareness", "觉察"], ["Insight", "洞察"], ["Intelligence", "智能"]
            ]
        },
        {
            id: "capability",
            count: 9,
            mobileCount: 6,
            speed: -0.000026,
            radiusX: 0.395,
            radiusY: 0.31,
            maxX: 500,
            maxY: 265,
            words: [
                ["Multimodal", "多模态"], ["Continuous Sensing", "连续感知"],
                ["Context Awareness", "情境理解"], ["Individual Modeling", "个体建模"],
                ["Individual Baseline", "个体基线"], ["Long-term Memory", "长期记忆"],
                ["Behavior Recognition", "行为识别"], ["Emotion Understanding", "情绪理解"],
                ["Anomaly Detection", "异常识别"], ["Trend Prediction", "趋势预测"],
                ["Data Fusion", "数据融合"], ["Real-time Insight", "实时洞察"],
                ["Adaptive Learning", "自适应学习"], ["Continual Learning", "持续学习"],
                ["Model Evolution", "模型进化"], ["Natural Dialogue", "自然对话"],
                ["Personalized Insight", "个性化洞察"], ["Proactive Care", "主动守护"],
                ["Privacy by Design", "隐私优先"]
            ]
        },
        {
            id: "life",
            count: 10,
            mobileCount: 7,
            speed: 0.000035,
            radiusX: 0.47,
            radiusY: 0.415,
            maxX: 590,
            maxY: 348,
            words: [
                ["Life Data", "生命数据"], ["Health Signals", "健康信号"],
                ["Vital Signs", "生命体征"], ["Heart Rate", "心率"], ["Respiration", "呼吸"],
                ["Body Temperature", "体表温度"], ["Activity", "活动"], ["Sleep", "睡眠"],
                ["Stress", "压力"], ["Emotion", "情绪"], ["Behavior", "行为"], ["Movement", "运动"],
                ["Environment", "环境"], ["Early Warning", "提前预警"],
                ["Companionship", "陪伴"], ["Empathy", "共情"], ["Trust", "信任"],
                ["Bond", "羁绊"], ["Human–Pet Connection", "人宠连接"],
                ["Seamless Communication", "无障碍沟通"], ["Understanding Life", "理解生命"],
                ["Always Learning", "持续学习"], ["Always Caring", "始终守护"]
            ]
        }
    ];

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const map = (value, inMin, inMax, outMin = 0, outMax = 1) => {
        const normalized = clamp((value - inMin) / (inMax - inMin));
        return outMin + (outMax - outMin) * normalized;
    };
    const ease = (value) => {
        const t = clamp(value);
        return t * t * (3 - 2 * t);
    };
    const mix = (from, to, amount) => from + (to - from) * amount;

    const randomSeed = (index, offset = 0) => {
        const value = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
        return value - Math.floor(value);
    };

    const makePetsMask = (image) => {
        const mask = document.createElement("canvas");
        const maskWidth = 1200;
        const maskHeight = 708;
        mask.width = maskWidth;
        mask.height = maskHeight;
        const maskContext = mask.getContext("2d");
        maskContext.drawImage(image, 0, 0, maskWidth, maskHeight);

        const pixels = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
        const points = [];
        for (let y = 0; y < maskHeight; y += 1) {
            for (let x = 0; x < maskWidth; x += 1) {
                const offset = (y * maskWidth + x) * 4;
                const luminance =
                    pixels[offset] * 0.2126 +
                    pixels[offset + 1] * 0.7152 +
                    pixels[offset + 2] * 0.0722;
                const ink = clamp((246 - luminance) / 190);
                if (ink < 0.08) continue;
                if (randomSeed(y * maskWidth + x, 31) > Math.pow(ink, 0.56)) continue;
                points.push({ x, y, ink });
            }
        }

        return {
            points,
            width: maskWidth,
            height: maskHeight
        };
    };

    const buildParticles = () => {
        if (!canvasWidth || !canvasHeight || !petsMask?.points.length) return;
        const count = canvasWidth < 700 ? 12000 : 30000;
        const mask = petsMask;
        const maskScale =
            Math.min(canvasWidth / mask.width, canvasHeight / mask.height) *
            (canvasWidth < 700 ? 1.06 : 0.96);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2 + (canvasWidth < 700 ? 4 : 12);
        const nextParticles = [];
        const safeWidth = Math.min(660, canvasWidth * (canvasWidth < 700 ? 0.86 : 0.44));
        const safeHeight = Math.min(600, canvasHeight * (canvasWidth < 700 ? 0.72 : 0.64));

        for (let index = 0; index < count; index += 1) {
            const pointIndex = Math.floor(randomSeed(index, 1) * mask.points.length);
            const point = mask.points[pointIndex];
            const mx = point.x;
            const my = point.y;
            const petSide = mx < mask.width * 0.57 ? -1 : 1;
            const outwardShift = canvasWidth * (canvasWidth < 700 ? 0.035 : 0.065) * petSide;
            const pointJitter = (randomSeed(index, 2) - 0.5) * 1.5;
            const homeX = centerX + (mx - mask.width / 2) * maskScale + outwardShift + pointJitter;
            const homeY = centerY + (my - mask.height / 2) * maskScale + pointJitter * 0.55;
            const safeX = Math.abs((homeX - centerX) / (safeWidth / 2));
            const safeY = Math.abs((homeY - (centerY + 16)) / (safeHeight / 2));
            const safeDistance = Math.max(safeX, safeY);
            const modelAlpha = mix(0.025, 1, ease(map(safeDistance, 0.76, 1.08)));
            const angleSeed = randomSeed(index, 3) * Math.PI * 2;
            const radiusSeed = Math.pow(randomSeed(index, 4), 0.54);
            const clearCenter = 0.18 + radiusSeed * 0.57;
            const ambientX = centerX + Math.cos(angleSeed) * canvasWidth * clearCenter;
            const ambientY = centerY + Math.sin(angleSeed) * canvasHeight * clearCenter * 0.64;
            const edge = Math.max(canvasWidth, canvasHeight) * 0.12;
            const edgeSide = index % 4;
            const edgeSeed = randomSeed(index, 5);
            const exitX = edgeSide === 1 ? canvasWidth + edge : edgeSide === 3 ? -edge : edgeSeed * canvasWidth;
            const exitY = edgeSide === 0 ? -edge : edgeSide === 2 ? canvasHeight + edge : edgeSeed * canvasHeight;
            const petCenterX =
                centerX +
                ((petSide < 0 ? 390 : 905) - mask.width / 2) * maskScale +
                outwardShift;
            const petCenterY = centerY + (380 - mask.height / 2) * maskScale;

            nextParticles.push({
                homeX,
                homeY,
                exitX,
                exitY,
                ambientX,
                ambientY,
                petCenterX,
                petCenterY,
                entryX: exitX,
                entryY: exitY,
                entryDelay: randomSeed(index, 6) * 0.62,
                entryBendX: (randomSeed(index, 11) - 0.5) * canvasWidth * 0.12,
                entryBendY: (randomSeed(index, 12) - 0.5) * canvasHeight * 0.1,
                phase: randomSeed(index, 7) * Math.PI * 2,
                drift: 0.35 + randomSeed(index, 8) * 1.7,
                modelAlpha,
                alpha: (0.46 + point.ink * 0.42) * (0.84 + randomSeed(index, 9) * 0.16),
                size: point.ink > 0.72
                    ? (randomSeed(index, 10) > 0.62 ? 2.05 : 1.32)
                    : (randomSeed(index, 10) > 0.87 ? 1.55 : 0.88)
            });
        }
        particles = nextParticles;

        const dustCount = canvasWidth < 700 ? 480 : 1250;
        cosmicDust = Array.from({ length: dustCount }, (_, index) => {
            const side = index % 4;
            const seed = randomSeed(index, 21);
            const dustEdge = Math.max(canvasWidth, canvasHeight) * 0.1;
            const fromX = side === 1 ? canvasWidth + dustEdge : side === 3 ? -dustEdge : seed * canvasWidth;
            const fromY = side === 0 ? -dustEdge : side === 2 ? canvasHeight + dustEdge : randomSeed(index, 22) * canvasHeight;
            const dustAngle = randomSeed(index, 23) * Math.PI * 2;
            const dustRadius = (0.16 + randomSeed(index, 24) * 0.47) * Math.min(canvasWidth, canvasHeight);
            return {
                fromX,
                fromY,
                targetX: centerX + Math.cos(dustAngle) * dustRadius,
                targetY: centerY + Math.sin(dustAngle) * dustRadius * 0.7,
                delay: randomSeed(index, 25) * 0.76,
                phase: randomSeed(index, 26) * Math.PI * 2,
                alpha: 0.07 + randomSeed(index, 27) * 0.18,
                size: randomSeed(index, 28) > 0.91 ? 1.8 : 0.65
            };
        });
    };

    const resizeCanvas = () => {
        const rect = stage.getBoundingClientRect();
        canvasWidth = Math.max(1, Math.floor(rect.width));
        canvasHeight = Math.max(1, Math.floor(rect.height));
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(canvasWidth * pixelRatio);
        canvas.height = Math.floor(canvasHeight * pixelRatio);
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        buildParticles();
    };

    const getParticlePosition = (particle, progress, time) => {
        const reasonPresence = Math.min(
            ease(map(progress, reasonParticleStart, 0.36)),
            1 - ease(map(progress, 0.56, reasonParticleEnd))
        );
        if (reasonPresence > 0) {
            const breath = reduceMotion ? 1 : 0.93 + Math.sin(time * 0.0008 + particle.phase) * 0.07;
            const drift = reduceMotion ? 0 : Math.sin(time * 0.0003 + particle.phase) * particle.drift * 0.45;
            return {
                x: particle.homeX + drift,
                y: particle.homeY + drift * 0.55,
                alpha: particle.alpha * particle.modelAlpha * reasonPresence * breath * 0.18
            };
        }
        const introClock = reduceMotion ? 1 : clamp((time - introStartedAt) / introDuration);
        const intro = ease(clamp((introClock - particle.entryDelay) / (1 - particle.entryDelay)));
        const petAngle = reduceMotion ? 0 : Math.sin(time * 0.00018 + particle.phase) * 0.008;
        const petDeltaX = particle.homeX - particle.petCenterX;
        const petDeltaY = particle.homeY - particle.petCenterY;
        const spinX = particle.petCenterX + petDeltaX * Math.cos(petAngle) - petDeltaY * Math.sin(petAngle);
        const spinY = particle.petCenterY + petDeltaX * Math.sin(petAngle) + petDeltaY * Math.cos(petAngle);
        const swirl = reduceMotion ? 0 : Math.sin(time * 0.00055 + particle.phase) * particle.drift * 0.8;
        const trajectory = Math.sin(Math.PI * intro);
        const assembledX = mix(particle.entryX, spinX + swirl, intro) + particle.entryBendX * trajectory;
        const assembledY = mix(particle.entryY, spinY + swirl * 0.6, intro) + particle.entryBendY * trajectory;
        const scatter = ease(map(progress, particleExitStart, particleExitEnd));
        const scatterDrift = reduceMotion ? 0 : Math.sin(time * 0.0003 + particle.phase) * particle.drift;
        const entryFade = reduceMotion ? 1 : ease(map(intro, 0.015, 0.24));
        const x = mix(assembledX, particle.exitX + scatterDrift, scatter);
        const y = mix(assembledY, particle.exitY + scatterDrift * 0.6, scatter);
        const alpha = particle.alpha * particle.modelAlpha * entryFade * (1 - scatter);

        return { x, y, alpha };
    };

    const renderCosmicDust = (time) => {
        if (renderProgress >= particleExitEnd || !cosmicDust.length) return;
        const introClock = reduceMotion ? 1 : clamp((time - introStartedAt) / introDuration);
        const fade = 1 - ease(map(renderProgress, particleExitStart, particleExitEnd));
        ctx.fillStyle = "#718078";
        cosmicDust.forEach((dust) => {
            const arrival = ease(clamp((introClock - dust.delay) / (1 - dust.delay)));
            if (arrival <= 0) return;
            const drift = reduceMotion ? 0 : Math.sin(time * 0.0004 + dust.phase) * 3;
            ctx.globalAlpha = dust.alpha * arrival * fade;
            ctx.fillRect(
                mix(dust.fromX, dust.targetX, arrival) + drift,
                mix(dust.fromY, dust.targetY, arrival) + drift * 0.5,
                dust.size,
                dust.size
            );
        });
    };

    const renderParticles = (time) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        const showReasonCompanions = renderProgress >= reasonParticleStart && renderProgress < reasonParticleEnd;
        const particlesCleared = renderProgress >= particleExitEnd && !showReasonCompanions;
        canvas.classList.toggle("is-cleared", particlesCleared);
        if (particlesCleared || !isOpen) return;
        renderCosmicDust(time);
        ctx.fillStyle = "#48514b";
        const progress = renderProgress;

        for (let i = 0; i < particles.length; i += 1) {
            const particle = particles[i];
            const position = getParticlePosition(particle, progress, time);
            if (position.alpha < 0.008) continue;
            ctx.globalAlpha = position.alpha;
            const size = particle.size;
            ctx.fillRect(position.x, position.y, size, size);
        }
        ctx.globalAlpha = 1;
    };

    const wordLabel = (slot, word, languageIndex) => {
        slot.wordIndex = word;
        slot.languageIndex = languageIndex;
        slot.label.textContent = slot.orbit.definition.words[word][languageIndex];
        slot.element.dataset.translation = slot.orbit.definition.words[word][1 - languageIndex];
        slot.element.lang = languageIndex === 0 ? "en" : "zh-CN";
    };

    const nextWordForSlot = (orbit, slot, salt) => {
        const pool = orbit.definition.words;
        const occupied = new Set(orbit.slots.map((item) => item.wordIndex));
        let wordIndex = (slot.index * 5 + salt * 7 + orbit.index * 3) % pool.length;
        for (let attempt = 0; attempt < pool.length; attempt += 1) {
            if (!occupied.has(wordIndex)) break;
            wordIndex = (wordIndex + 1) % pool.length;
        }
        return wordIndex;
    };

    const setupWordSystem = () => {
        wordOrbits = wordOrbitDefinitions.map((definition, index) => {
            const element = wordOrbitElements.find((orbit) => orbit.dataset.miraWordOrbit === definition.id);
            if (!element) return null;
            const orbit = { definition, element, index, slots: [] };
            for (let slotIndex = 0; slotIndex < definition.count; slotIndex += 1) {
                const word = document.createElement("span");
                const label = document.createElement("span");
                word.className = "mira-orbit-word";
                label.className = "mira-orbit-word-label";
                word.appendChild(label);
                element.appendChild(word);
                const slot = { element: word, label, orbit, index: slotIndex, wordIndex: -1, languageIndex: 0 };
                orbit.slots.push(slot);
                wordLabel(slot, (slotIndex + index * 2) % definition.words.length, (slotIndex + index) % 2);
            }
            return orbit;
        }).filter(Boolean);
    };

    const replaceOneOrbitWord = () => {
        const order = [1, 0, 2, 1, 2, 0];
        const orbit = wordOrbits[order[wordSwapCount % order.length]];
        if (!orbit) return;
        const visibleCount = canvasWidth < 700 ? orbit.definition.mobileCount : orbit.definition.count;
        const slot = orbit.slots[(wordSwapCount * 3 + orbit.index * 2) % visibleCount];
        const nextWord = nextWordForSlot(orbit, slot, wordSwapCount + 1);
        slot.label.classList.add("is-leaving");
        window.setTimeout(() => {
            wordLabel(slot, nextWord, (slot.languageIndex + 1) % 2);
            slot.label.classList.remove("is-leaving");
            slot.label.classList.add("is-entering");
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => slot.label.classList.remove("is-entering"));
            });
        }, reduceMotion ? 0 : 420);
        wordSwapCount += 1;
    };

    const renderReasonOrbit = (time) => {
        if (!reasonOrbit || !wordOrbits.length) return;
        const orbitEntry = ease(map(renderProgress, 0.29, 0.39));
        const orbitExit = 1 - ease(map(renderProgress, 0.56, 0.64));
        const presence = Math.min(orbitEntry, orbitExit);
        const mobile = canvasWidth < 700;

        wordOrbits.forEach((orbit) => {
            const { definition } = orbit;
            const visibleCount = mobile ? definition.mobileCount : definition.count;
            const radiusX = Math.min(canvasWidth * definition.radiusX, mobile ? definition.maxX * 0.52 : definition.maxX);
            const radiusY = Math.min(canvasHeight * definition.radiusY, mobile ? definition.maxY * 0.54 : definition.maxY);
            const spin = reduceMotion ? 0 : time * definition.speed;

            orbit.slots.forEach((slot, slotIndex) => {
                const visible = slotIndex < visibleCount && presence > 0.015;
                if (!visible) {
                    slot.element.style.visibility = "hidden";
                    return;
                }
                const angle = -Math.PI / 2 + (slotIndex * Math.PI * 2 / visibleCount) + spin;
                const depth = (Math.sin(angle) + 1) / 2;
                const x = Math.cos(angle) * radiusX;
                const y = Math.sin(angle) * radiusY;
                const scale = mix(0.965, 1.025, depth) * mix(0.9, 1, orbitEntry);
                const opacity = mix(0.35, 0.88, depth) * presence;
                slot.element.style.visibility = "visible";
                slot.element.style.setProperty("--mira-orbit-x", `${x.toFixed(2)}px`);
                slot.element.style.setProperty("--mira-orbit-y", `${y.toFixed(2)}px`);
                slot.element.style.setProperty("--mira-orbit-scale", scale.toFixed(3));
                slot.element.style.setProperty("--mira-orbit-opacity", opacity.toFixed(3));
            });
        });

        if (reduceMotion || presence < 0.25) {
            wordSwapAt = -Infinity;
            return;
        }
        if (wordSwapAt < 0) wordSwapAt = time + 1280;
        if (time >= wordSwapAt) {
            replaceOneOrbitWord();
            wordSwapAt = time + 1280 + (wordSwapCount % 3) * 180;
        }
    };

    const setScene = (scene, opacity, translateY = 0, scale = 1, interactive = false) => {
        if (!scene) return;
        const visible = opacity > 0.015;
        scene.style.opacity = String(opacity);
        scene.style.transform = `translateY(${translateY}px) scale(${scale})`;
        scene.setAttribute("aria-hidden", String(!visible));
        scene.classList.toggle("is-interactive", interactive && opacity > 0.98);
    };

    const updateStory = () => {
        const maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
        scrollProgress = clamp(scroll.scrollTop / maxScroll);

        const heroExit = ease(map(scrollProgress, 0.15, 0.27));
        const heroOpacity = 1 - heroExit;
        setScene(heroScene, heroOpacity, -24 * heroExit, 1 - 0.025 * heroExit);

        const reasonEnter = ease(map(scrollProgress, 0.24, 0.35));
        const reasonExit = ease(map(scrollProgress, 0.56, 0.64));
        const reasonOpacity = Math.min(reasonEnter, 1 - reasonExit);
        setScene(
            reasonScene,
            reasonOpacity,
            mix(28, -20, reasonEnter * reasonExit),
            mix(0.985, 1, reasonEnter)
        );

        const stageIndex = Math.min(3, Math.floor(map(scrollProgress, 0.35, 0.56, 0, 4)));
        reasonSteps.forEach((step, index) => step.classList.toggle("is-current", index === stageIndex));
        reasonOrbit?.classList.toggle(
            "is-impacting",
            scrollProgress >= 0.35 && scrollProgress < 0.43
        );

        const protectVisible = scrollProgress >= 0.58 && scrollProgress < 0.69;
        protectTransition?.classList.toggle("is-visible", protectVisible);
        protectTransition?.classList.toggle("is-point", scrollProgress >= 0.64);
        if (protectTransition && protectVisible && scrollProgress < 0.64) {
            const shrink = ease(map(scrollProgress, 0.58, 0.64));
            protectTransition.style.transform = `translate(-50%, -50%) scale(${mix(1, 0.42, shrink)})`;
        } else if (protectTransition) {
            protectTransition.style.transform = "";
        }

        if (!chatStarted) {
            const askEnter = ease(map(scrollProgress, 0.7, 0.78));
            setScene(askScene, askEnter, mix(24, 0, askEnter), mix(0.985, 1, askEnter), true);
        }

        scrollCue?.classList.toggle("is-hidden", scrollProgress > 0.05);
    };

    const animate = (time) => {
        const delta = Math.min(34, time - lastFrame);
        lastFrame = time;
        const smoothing = reduceMotion ? 1 : 1 - Math.pow(0.001, delta / 1000);
        renderProgress += (scrollProgress - renderProgress) * smoothing;
        renderParticles(time);
        renderReasonOrbit(time);
        animationFrame = window.requestAnimationFrame(animate);
    };

    const openMira = () => {
        if (isOpen) return;
        window.clearTimeout(closingTimer);
        restoreScrollY = window.scrollY;
        isOpen = true;
        // Let the modal become perceptible before the first particles cross the
        // viewport edge, so the four-direction assembly is never hidden inside
        // the opening fade.
        introStartedAt = performance.now() + (reduceMotion ? 0 : 180);
        lastFrame = performance.now();
        experience.setAttribute("aria-hidden", "false");
        document.body.classList.add("mira-open");
        canvas.classList.remove("is-cleared");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        scroll.scrollTop = 0;
        scrollProgress = 0;
        renderProgress = 0;
        updateStory();
        window.requestAnimationFrame(() => {
            experience.classList.remove("is-closing");
            experience.classList.add("is-open");
            closeButton?.focus({ preventScroll: true });
        });
    };

    const closeMira = () => {
        if (!isOpen) return;
        isOpen = false;
        experience.classList.add("is-closing");
        experience.classList.remove("is-open");
        closingTimer = window.setTimeout(() => {
            experience.classList.remove("is-closing");
            experience.setAttribute("aria-hidden", "true");
            document.body.classList.remove("mira-open");
            window.scrollTo({ top: restoreScrollY, behavior: "instant" });
            const launch = document.querySelector("[data-mira-last-launch='true']");
            launch?.focus({ preventScroll: true });
            launch?.removeAttribute("data-mira-last-launch");
        }, reduceMotion ? 10 : 500);
    };

    const normalizeApiBase = (value) => {
        if (!value) return "";
        let base = String(value).trim();
        if (!base) return "";
        if (base.startsWith("//")) base = `${window.location.protocol}${base}`;
        else if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
        return base.replace(/\/+$/, "");
    };

    const apiBase = normalizeApiBase(window.PALECHO_API_BASE) ||
        ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
        window.location.port !== "3001" ? "http://localhost:3001" : "");

    const appendMessage = (type, content) => {
        if (!chatLog) return null;
        const message = document.createElement("div");
        message.className = `mira-message ${type}`;
        if (content instanceof Node) message.appendChild(content);
        else message.textContent = content;
        chatLog.appendChild(message);
        chatLog.scrollTop = chatLog.scrollHeight;
        return message;
    };

    const activateChat = (seed = "") => {
        if (!chatStarted) {
            chatStarted = true;
            stage.classList.add("chat-active");
            window.setTimeout(() => stage.classList.add("ending-visible"), reduceMotion ? 10 : 850);
        }
        if (seed && chatInput) chatInput.value = seed;
        window.setTimeout(() => chatInput?.focus({ preventScroll: true }), reduceMotion ? 0 : 350);
    };

    const submitQuestion = async (question) => {
        const value = String(question || "").trim();
        if (!value) return;
        activateChat();
        appendMessage("user", value);
        if (chatInput) chatInput.value = "";
        if (primaryInput) primaryInput.value = "";

        const thinking = document.createElement("span");
        thinking.className = "mira-thinking";
        thinking.setAttribute("aria-label", "Mira 正在思考");
        thinking.innerHTML = "<i></i><i></i><i></i>";
        const thinkingMessage = appendMessage("assistant", thinking);

        try {
            const response = await fetch(`${apiBase}/api/ai-health`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: value })
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.error || "请求失败");
            thinkingMessage?.remove();
            appendMessage("assistant", payload?.reply || "我正在理解这段变化。可以再告诉我一些最近的饮食、活动和睡眠情况吗？");
        } catch {
            thinkingMessage?.remove();
            appendMessage(
                "assistant",
                "我已经记下这个问题。Mira 服务暂时未连接，但你仍可以继续整理症状、时间和生活变化；连接恢复后，我会基于这些信息一起判断。"
            );
        }
    };

    document.addEventListener("click", (event) => {
        const launch = event.target.closest('a[href="#digital-pet"], [data-mira-launch]');
        if (!launch || experience.contains(launch)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelector("[data-mira-last-launch='true']")?.removeAttribute("data-mira-last-launch");
        launch.setAttribute("data-mira-last-launch", "true");
        openMira();
    }, true);

    closeButton?.addEventListener("click", closeMira);
    scroll.addEventListener("scroll", updateStory, { passive: true });

    document.addEventListener("keydown", (event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeMira();
        }
        if (event.key === "Tab") {
            const focusable = Array.from(experience.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
            )).filter((element) => element.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    primaryInput?.addEventListener("input", () => {
        if (primaryInput.value.trim()) activateChat(primaryInput.value);
    });
    primaryInput?.addEventListener("focus", () => {
        if (primaryInput.value.trim()) activateChat(primaryInput.value);
    });

    primaryForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = primaryInput?.value || "";
        submitQuestion(value);
    });

    chatForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        submitQuestion(chatInput?.value || "");
    });

    prompts.forEach((prompt) => {
        prompt.addEventListener("click", () => {
            const question = prompt.dataset.question || prompt.textContent || "";
            activateChat(question);
            submitQuestion(question);
        });
    });

    uploadButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.uploadTarget || "");
            if (!target) return;
            if (button.dataset.uploadPicker === "media") {
                activeMediaInput = target;
                mediaUploadMenu?.classList.add("is-open");
                return;
            }
            activeMediaInput = null;
            mediaUploadMenu?.classList.remove("is-open");
            target.click();
        });
    });

    mediaUploadChoices.forEach((choice) => {
        choice.addEventListener("click", () => {
            if (!activeMediaInput) return;
            const camera = choice.dataset.uploadMode === "camera";
            activeMediaInput.setAttribute(
                "accept",
                camera ? "image/*" : (activeMediaInput.dataset.accept || "image/*")
            );
            if (camera) activeMediaInput.setAttribute("capture", "environment");
            else activeMediaInput.removeAttribute("capture");
            mediaUploadMenu?.classList.remove("is-open");
            activeMediaInput.click();
        });
    });

    uploadInputs.forEach((input) => {
        input.addEventListener("change", () => {
            const file = input.files?.[0];
            if (!file) return;
            const button = document.querySelector(`[data-upload-target="${input.id}"]`);
            uploadButtons.forEach((item) => item.classList.remove("is-ready"));
            button?.classList.add("is-ready");
            if (uploadStatus) uploadStatus.textContent = `已准备：${file.name}`;
            input.removeAttribute("capture");
            if (input.dataset.accept) input.setAttribute("accept", input.dataset.accept);
            activeMediaInput = null;
        });
    });

    const petsImage = new Image();
    petsImage.decoding = "async";
    petsImage.addEventListener("load", () => {
        petsMask = makePetsMask(petsImage);
        buildParticles();
        // If the image finished decoding only after Mira was opened, restart the
        // entry clock instead of showing an already assembled model instantly.
        if (isOpen && scrollProgress < particleExitStart) {
            introStartedAt = performance.now() + (reduceMotion ? 0 : 80);
        }
    });
    petsImage.src = "/mira-pets-model.png?v=20260731-1";

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(stage);
    setupWordSystem();
    resizeCanvas();
    updateStory();
    animationFrame = window.requestAnimationFrame(animate);

    window.addEventListener("pagehide", () => {
        window.cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
    }, { once: true });
})();
