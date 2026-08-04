(() => {
    "use strict";

    const experience = document.getElementById("echo-experience");
    const scroll = document.getElementById("echo-scroll");
    const stage = document.getElementById("echo-stage");
    const canvas = document.getElementById("echo-particles");
    if (!experience || !scroll || !stage || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    const closeButton = document.getElementById("echo-close");
    const intro = document.getElementById("echo-intro");
    const bubbles = document.getElementById("echo-bubbles");
    const create = document.getElementById("echo-create");
    const scrollCue = document.getElementById("echo-scroll-cue");
    const uploadZone = document.getElementById("echo-upload-zone");
    const uploadInput = document.getElementById("echo-upload-input");
    const uploadComplete = document.getElementById("echo-upload-complete");
    const stepIndex = document.getElementById("echo-step-index");
    const stepTitle = document.getElementById("echo-step-title");
    const stepCopy = document.getElementById("echo-step-copy");
    const sheet = document.getElementById("echo-sheet");
    const sheetBackdrop = document.getElementById("echo-sheet-backdrop");
    const sheetCamera = document.getElementById("echo-sheet-camera");
    const sheetLibrary = document.getElementById("echo-sheet-library");
    const sheetCancel = document.getElementById("echo-sheet-cancel");
    const analysis = document.getElementById("echo-analysis");
    const ready = document.getElementById("echo-ready");
    const wake = document.getElementById("echo-wake");
    const connection = document.getElementById("echo-connection");
    const connectionLines = Array.from(document.querySelectorAll(".echo-connection-line"));
    const home = document.getElementById("echo-home");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const steps = [
        { numeral: "01 / 03", title: "正面", copy: "记录它最熟悉的模样。" },
        { numeral: "02 / 03", title: "侧面", copy: "描绘它独特的轮廓。" },
        { numeral: "03 / 03", title: "背面", copy: "补全属于它的每一个细节。" }
    ];
    const bubblePhrases = [
        "有人离开家乡。",
        "有人奔赴另一座城市。",
        "有人在外求学。",
        "有人经常出差。",
        "但每天，",
        "总有一个生命，在等待你的归来。",
        "有人离开家乡。",
        "有人奔赴另一座城市。",
        "有人在外求学。",
        "有人经常出差。",
        "但每天，",
        "在等待你的归来。"
    ];
    let isOpen = false;
    let restoreScrollY = 0;
    let closingTimer = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;
    let particles = [];
    let frame = 0;
    let scrollProgress = 0;
    let renderedProgress = 0;
    let lastFrame = performance.now();
    let introStartedAt = -Infinity;
    let currentStep = 0;
    let flowState = "story";
    let bubblesReady = false;
    let bubbleWave = 0;
    let bubbleInterval = 0;
    let bubbleReadyTimer = 0;
    let createShown = false;
    const bubbleTimers = new Set();

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
    const random = (index, offset = 0) => {
        const value = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
        return value - Math.floor(value);
    };
    const later = (callback, delay) => {
        const timer = window.setTimeout(() => {
            bubbleTimers.delete(timer);
            callback();
        }, delay);
        bubbleTimers.add(timer);
        return timer;
    };

    const buildTextPoints = () => {
        if (!canvasWidth || !canvasHeight) return;
        const mask = document.createElement("canvas");
        const maskContext = mask.getContext("2d", { willReadFrequently: true });
        const maskWidth = Math.min(1600, Math.max(760, Math.round(canvasWidth * 1.55)));
        const maskHeight = Math.min(600, Math.max(300, Math.round(canvasHeight * 0.52)));
        mask.width = maskWidth;
        mask.height = maskHeight;

        const fontSize = Math.min(maskWidth * 0.093, maskHeight * 0.28);
        maskContext.clearRect(0, 0, maskWidth, maskHeight);
        maskContext.fillStyle = "#000";
        maskContext.textAlign = "center";
        maskContext.textBaseline = "middle";
        maskContext.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Inter", sans-serif`;
        maskContext.fillText("距离，不是不爱的理由。", maskWidth / 2, maskHeight / 2);

        const image = maskContext.getImageData(0, 0, maskWidth, maskHeight);
        const candidates = [];
        for (let y = 0; y < maskHeight; y += 2) {
            for (let x = 0; x < maskWidth; x += 2) {
                if (image.data[(y * maskWidth + x) * 4 + 3] > 90) candidates.push({ x, y });
            }
        }

        const maxCount = canvasWidth < 700 ? 6800 : 14500;
        const stride = Math.max(1, Math.floor(candidates.length / maxCount));
        const scale = Math.min(canvasWidth * 0.9 / maskWidth, 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        particles = candidates
            .filter((_, index) => index % stride === 0)
            .slice(0, maxCount)
            .map((point, index) => {
                const angle = random(index, 1) * Math.PI * 2;
                const radius = Math.pow(random(index, 2), 0.5);
                return {
                    homeX: centerX + (point.x - maskWidth / 2) * scale,
                    homeY: centerY + (point.y - maskHeight / 2) * scale,
                    ambientX: centerX + Math.cos(angle) * canvasWidth * (0.16 + radius * 0.66),
                    ambientY: centerY + Math.sin(angle) * canvasHeight * (0.12 + radius * 0.48),
                    phase: random(index, 3) * Math.PI * 2,
                    speed: 0.25 + random(index, 4) * 1.05,
                    alpha: 0.52 + random(index, 5) * 0.42,
                    size: random(index, 6) > 0.86 ? 1.65 : 1.05
                };
            });
    };

    const resizeCanvas = () => {
        const rect = stage.getBoundingClientRect();
        canvasWidth = Math.max(1, Math.floor(rect.width));
        canvasHeight = Math.max(1, Math.floor(rect.height));
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.floor(canvasWidth * pixelRatio);
        canvas.height = Math.floor(canvasHeight * pixelRatio);
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        buildTextPoints();
    };

    const renderParticles = (time) => {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        const introAmount = reduceMotion ? 1 : ease(clamp((time - introStartedAt - 720) / 1250));
        const disassemble = ease(map(renderedProgress, 0.17, 0.32));
        const visibility = 1 - ease(map(renderedProgress, 0.22, 0.34));
        context.fillStyle = "#1f1f1d";

        for (let index = 0; index < particles.length; index += 1) {
            const particle = particles[index];
            const driftX = reduceMotion ? 0 : Math.sin(time * 0.00014 * particle.speed + particle.phase) * 1.25;
            const driftY = reduceMotion ? 0 : Math.cos(time * 0.00012 * particle.speed + particle.phase) * 0.9;
            const formedX = particle.homeX + driftX;
            const formedY = particle.homeY + driftY;
            const departX = canvasWidth / 2 + (particle.ambientX - canvasWidth / 2) * 1.18;
            const departY = particle.ambientY - canvasHeight * 0.08;
            const x = mix(mix(particle.ambientX, formedX, introAmount), departX, disassemble);
            const y = mix(mix(particle.ambientY, formedY, introAmount), departY, disassemble);
            const alpha = particle.alpha * (0.28 + introAmount * 0.72) * visibility;
            if (alpha < 0.01) continue;
            context.globalAlpha = alpha;
            context.beginPath();
            context.arc(x, y, particle.size, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    };

    const setVisible = (element, visible) => {
        if (!element) return;
        element.classList.toggle("is-visible", visible);
        element.setAttribute("aria-hidden", visible ? "false" : "true");
    };

    const clearBubbleLoop = (removeBubbles = true) => {
        window.clearInterval(bubbleInterval);
        bubbleInterval = 0;
        bubbleTimers.forEach((timer) => window.clearTimeout(timer));
        bubbleTimers.clear();
        if (removeBubbles && bubbles) bubbles.replaceChildren();
    };

    const spawnBubbleWave = () => {
        if (!isOpen || flowState !== "story" || scrollProgress >= 0.3 || !bubbles) return;
        const mobile = window.innerWidth < 700;
        const count = mobile ? 12 : 16;
        const containerRect = bubbles.getBoundingClientRect();
        const gap = mobile ? 8 : 12;
        const occupied = Array.from(bubbles.querySelectorAll(".echo-bubble")).map((item) => {
            const rect = item.getBoundingClientRect();
            return {
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top,
                right: rect.right - containerRect.left,
                bottom: rect.bottom - containerRect.top
            };
        });
        const titleSafeArea = {
            left: containerRect.width * (mobile ? 0.1 : 0.16),
            top: containerRect.height * 0.38,
            right: containerRect.width * (mobile ? 0.9 : 0.84),
            bottom: containerRect.height * 0.62
        };
        const overlaps = (first, second) => !(
            first.right + gap <= second.left ||
            first.left >= second.right + gap ||
            first.bottom + gap <= second.top ||
            first.top >= second.bottom + gap
        );

        for (let index = 0; index < count; index += 1) {
            const seed = index + bubbleWave * 37;
            const bubble = document.createElement("p");
            const phraseIndex = (index + bubbleWave * 2) % bubblePhrases.length;
            bubble.className = "echo-bubble";
            bubble.textContent = bubblePhrases[phraseIndex];
            bubble.style.left = "-1000px";
            bubble.style.top = "-1000px";
            bubble.style.setProperty("--alpha", String(0.8 + random(seed, 30) * 0.18));
            bubble.style.setProperty("--travel", "-4px");
            bubbles.appendChild(bubble);

            const width = bubble.offsetWidth;
            const height = bubble.offsetHeight;
            let placement = null;
            for (let attempt = 0; attempt < 180; attempt += 1) {
                const x = random(seed + attempt * 7, bubbleWave + 41) *
                    Math.max(1, containerRect.width - width);
                const y = random(seed + attempt * 11, bubbleWave + 53) *
                    Math.max(1, containerRect.height - height);
                const candidate = {
                    left: x,
                    top: y,
                    right: x + width,
                    bottom: y + height
                };
                if (overlaps(candidate, titleSafeArea)) continue;
                if (occupied.some((rect) => overlaps(candidate, rect))) continue;
                placement = candidate;
                break;
            }

            if (!placement) {
                bubble.remove();
                continue;
            }

            bubble.style.left = `${placement.left}px`;
            bubble.style.top = `${placement.top}px`;
            occupied.push(placement);

            const delay = reduceMotion ? 0 : index * 90;
            later(() => bubble.classList.add("is-entered"), delay + 20);
            later(() => bubble.classList.add("is-leaving"), delay + (reduceMotion ? 3600 : 2900));
            later(() => bubble.remove(), delay + (reduceMotion ? 4200 : 3700));
        }
        bubbleWave += 1;
    };

    const startBubbleLoop = () => {
        if (!bubblesReady || bubbleInterval || flowState !== "story" || scrollProgress >= 0.3) return;
        spawnBubbleWave();
        if (!reduceMotion) bubbleInterval = window.setInterval(spawnBubbleWave, 5400);
    };

    const updateStory = () => {
        if (!isOpen || flowState !== "story") return;
        const maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
        scrollProgress = clamp(scroll.scrollTop / maxScroll);
        const introVisible = scrollProgress < 0.42;
        const createVisible = scrollProgress >= 0.22;
        createShown = createVisible;

        setVisible(intro, introVisible);
        setVisible(create, createVisible);
        canvas.style.opacity = introVisible ? "1" : "0";
        scrollCue?.classList.toggle("is-hidden", scrollProgress > 0.035);

        const introExit = ease(map(scrollProgress, 0.16, 0.42));
        if (intro) {
            intro.style.transform = `translateY(${-32 * introExit}px) scale(${1 - introExit * 0.018})`;
            intro.style.filter = `blur(${introExit * 1.4}px)`;
        }

        if (introVisible && bubblesReady) startBubbleLoop();
        else if (!introVisible) clearBubbleLoop(true);
    };

    const animate = (time) => {
        const delta = Math.min(36, time - lastFrame);
        lastFrame = time;
        renderedProgress += (scrollProgress - renderedProgress) * Math.min(1, delta * 0.0065);
        renderParticles(time);
        frame = window.requestAnimationFrame(animate);
    };

    const updateStep = () => {
        const step = steps[currentStep];
        if (!step) return;
        stepIndex.textContent = step.numeral;
        stepTitle.textContent = step.title;
        stepCopy.textContent = step.copy;
        uploadComplete.classList.remove("is-visible");
        uploadComplete.textContent = "";
    };

    const resetFlow = () => {
        create.classList.remove("is-processing", "is-ready");
        analysis.classList.remove("is-visible", "is-second");
        ready.classList.remove("is-visible", "show-action");
        connection.classList.remove("is-visible");
        connectionLines.forEach((line) => line.classList.remove("is-visible"));
        home.classList.remove("is-active", "expanded");
        stage.classList.remove("flow-active");
        uploadInput.value = "";
        uploadZone.disabled = false;
        updateStep();
    };

    const openEcho = () => {
        if (isOpen) return;
        window.clearTimeout(closingTimer);
        window.clearTimeout(bubbleReadyTimer);
        clearBubbleLoop(true);
        restoreScrollY = window.scrollY;
        isOpen = true;
        currentStep = 0;
        flowState = "story";
        createShown = false;
        bubblesReady = false;
        bubbleWave = 0;
        resetFlow();
        document.body.classList.add("echo-open");
        experience.classList.remove("is-closing");
        experience.classList.add("is-open");
        experience.setAttribute("aria-hidden", "false");
        scroll.scrollTop = 0;
        scrollProgress = 0;
        renderedProgress = 0;
        introStartedAt = performance.now();
        updateStory();
        bubbleReadyTimer = window.setTimeout(() => {
            bubblesReady = true;
            startBubbleLoop();
        }, reduceMotion ? 20 : 2150);
        window.setTimeout(() => closeButton?.focus({ preventScroll: true }), reduceMotion ? 10 : 520);
    };

    const closeSheet = () => {
        sheet.classList.remove("is-open");
        sheetBackdrop.classList.remove("is-open");
        sheet.setAttribute("aria-hidden", "true");
    };

    const closeEcho = () => {
        if (!isOpen) return;
        isOpen = false;
        window.clearTimeout(bubbleReadyTimer);
        clearBubbleLoop(true);
        closeSheet();
        experience.classList.add("is-closing");
        experience.classList.remove("is-open");
        experience.setAttribute("aria-hidden", "true");
        document.body.classList.remove("echo-open");
        closingTimer = window.setTimeout(() => {
            experience.classList.remove("is-closing");
            window.scrollTo({ top: restoreScrollY, behavior: "instant" });
            const launch = document.querySelector("[data-echo-last-launch='true']");
            launch?.focus({ preventScroll: true });
            launch?.removeAttribute("data-echo-last-launch");
        }, reduceMotion ? 10 : 500);
    };

    const openSheet = () => {
        if (flowState !== "story" || !create.classList.contains("is-visible")) return;
        sheet.classList.add("is-open");
        sheetBackdrop.classList.add("is-open");
        sheet.setAttribute("aria-hidden", "false");
        sheetCamera?.focus({ preventScroll: true });
    };

    const chooseUpload = (camera) => {
        closeSheet();
        uploadInput.setAttribute("accept", "image/*");
        if (camera) uploadInput.setAttribute("capture", "environment");
        else uploadInput.removeAttribute("capture");
        uploadInput.click();
    };

    const handleUpload = () => {
        const file = uploadInput.files?.[0];
        if (!file) return;
        uploadComplete.textContent = `✓ ${steps[currentStep].title}已完成`;
        uploadComplete.classList.add("is-visible");
        uploadZone.disabled = true;
        window.setTimeout(() => {
            currentStep += 1;
            uploadInput.value = "";
            uploadInput.removeAttribute("capture");
            uploadZone.disabled = false;
            if (currentStep < steps.length) updateStep();
            else beginAnalysis();
        }, reduceMotion ? 20 : 600);
    };

    const beginAnalysis = () => {
        flowState = "processing";
        clearBubbleLoop(true);
        stage.classList.add("flow-active");
        create.classList.add("is-processing");
        analysis.classList.add("is-visible");
        analysis.setAttribute("aria-hidden", "false");
        window.setTimeout(() => analysis.classList.add("is-second"), reduceMotion ? 20 : 650);
        window.setTimeout(showReady, reduceMotion ? 60 : 1500);
    };

    const showReady = () => {
        flowState = "ready";
        analysis.classList.remove("is-visible", "is-second");
        analysis.setAttribute("aria-hidden", "true");
        create.classList.remove("is-processing");
        create.classList.add("is-ready");
        ready.classList.add("is-visible");
        ready.setAttribute("aria-hidden", "false");
        window.setTimeout(() => {
            ready.classList.add("show-action");
            wake?.focus({ preventScroll: true });
        }, reduceMotion ? 20 : 1000);
    };

    const showHome = () => {
        flowState = "home";
        connection.classList.remove("is-visible");
        connection.setAttribute("aria-hidden", "true");
        home.classList.add("is-active");
        home.setAttribute("aria-hidden", "false");
        window.setTimeout(() => home.classList.add("expanded"), reduceMotion ? 20 : 1000);
    };

    const wakeEcho = () => {
        if (flowState !== "ready") return;
        flowState = "connecting";
        ready.classList.remove("show-action", "is-visible");
        ready.setAttribute("aria-hidden", "true");
        connection.classList.add("is-visible");
        connection.setAttribute("aria-hidden", "false");
        window.setTimeout(() => connectionLines[0]?.classList.add("is-visible"), reduceMotion ? 10 : 180);
        window.setTimeout(() => connectionLines[1]?.classList.add("is-visible"), reduceMotion ? 20 : 720);
        window.setTimeout(showHome, reduceMotion ? 70 : 1700);
    };

    document.addEventListener("click", (event) => {
        const launch = event.target.closest("[data-echo-launch]");
        if (!launch || experience.contains(launch)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelector("[data-echo-last-launch='true']")?.removeAttribute("data-echo-last-launch");
        launch.setAttribute("data-echo-last-launch", "true");
        openEcho();
    }, true);

    closeButton?.addEventListener("click", closeEcho);
    scroll.addEventListener("scroll", updateStory, { passive: true });
    uploadZone?.addEventListener("click", openSheet);
    sheetBackdrop?.addEventListener("click", closeSheet);
    sheetCancel?.addEventListener("click", closeSheet);
    sheetCamera?.addEventListener("click", () => chooseUpload(true));
    sheetLibrary?.addEventListener("click", () => chooseUpload(false));
    uploadInput?.addEventListener("change", handleUpload);
    wake?.addEventListener("click", wakeEcho);

    document.addEventListener("keydown", (event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            if (sheet.classList.contains("is-open")) closeSheet();
            else closeEcho();
        }
        if (event.key === "Tab") {
            const scope = sheet.classList.contains("is-open") ? sheet : experience;
            const focusable = Array.from(scope.querySelectorAll(
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

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(stage);
    resizeCanvas();
    frame = window.requestAnimationFrame(animate);

    window.addEventListener("pagehide", () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(bubbleReadyTimer);
        clearBubbleLoop(true);
        resizeObserver.disconnect();
    }, { once: true });
})();
