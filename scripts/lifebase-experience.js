(() => {
    "use strict";

    const experience = document.getElementById("lifebase-experience");
    const shell = document.getElementById("lifebase-shell");
    const intro = document.getElementById("lifebase-intro");
    const canvas = document.getElementById("lifebase-particles");
    const closeButton = document.getElementById("lifebase-close");
    const tabsRoot = experience?.querySelector(".lifebase-tabs");
    const liquid = document.getElementById("lifebase-liquid");
    const tabs = Array.from(experience?.querySelectorAll("[data-lifebase-tab]") || []);
    const panels = new Map(
        tabs.map((tab) => [
            tab.dataset.lifebaseTab,
            document.getElementById(tab.getAttribute("aria-controls"))
        ])
    );

    if (!experience || !shell || !intro || !canvas || !closeButton || !tabsRoot || !liquid) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobilePreference = window.matchMedia("(max-width: 900px)");
    let reducedMotion = motionPreference.matches;
    const lowPower =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);

    let activeKey = "pet";
    let isOpen = false;
    let restoreScrollY = 0;
    let introStartedAt = 0;
    let animationFrame = 0;
    let resizeFrame = 0;
    let liquidTimer = 0;
    let contentTimer = 0;
    let introTimer = 0;
    let closeTimer = 0;
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;

    const gatherEnd = 420;
    const holdEnd = 2420;
    const scatterEnd = 2770;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const mix = (from, to, amount) => from + (to - from) * amount;
    const smoothstep = (value) => {
        const t = clamp(value);
        return t * t * (3 - 2 * t);
    };
    const easeOutQuint = (value) => 1 - Math.pow(1 - clamp(value), 5);

    const updateOrientation = () => {
        tabsRoot.setAttribute("aria-orientation", mobilePreference.matches ? "horizontal" : "vertical");
    };

    const animateLiquid = () => {
        if (reducedMotion) return;
        window.clearTimeout(liquidTimer);
        liquid.classList.remove("is-moving");
        window.requestAnimationFrame(() => liquid.classList.add("is-moving"));
        liquidTimer = window.setTimeout(() => liquid.classList.remove("is-moving"), 350);
    };

    const activateTab = (key, options = {}) => {
        const nextTab = tabs.find((tab) => tab.dataset.lifebaseTab === key);
        const nextPanel = panels.get(key);
        if (!nextTab || !nextPanel) return;

        const previousKey = activeKey;
        const previousPanel = panels.get(previousKey);
        const changed = key !== previousKey;
        activeKey = key;

        tabsRoot.dataset.active = String(tabs.indexOf(nextTab));
        tabs.forEach((tab) => {
            const selected = tab === nextTab;
            tab.classList.toggle("is-active", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach((panel, panelKey) => {
            if (!panel) return;
            const selected = panelKey === key;
            panel.setAttribute("aria-hidden", String(!selected));
            panel.tabIndex = selected ? 0 : -1;
        });

        if (changed && previousPanel) {
            previousPanel.classList.remove("is-active");
            previousPanel.classList.add("is-leaving");
            window.setTimeout(() => previousPanel.classList.remove("is-leaving"), reducedMotion ? 120 : 430);
        }

        nextPanel.classList.remove("is-leaving");
        nextPanel.classList.add("is-active");

        if (changed && options.animate !== false) animateLiquid();
        if (options.focus) nextTab.focus({ preventScroll: true });
    };

    const buildParticles = () => {
        const bounds = intro.getBoundingClientRect();
        canvasWidth = Math.max(1, bounds.width);
        canvasHeight = Math.max(1, bounds.height);
        pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.35 : 2);
        canvas.width = Math.round(canvasWidth * pixelRatio);
        canvas.height = Math.round(canvasHeight * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const compact = canvasWidth < 620;
        const lines = compact ? ["我们为什么", "如此在意数据"] : ["我们为什么如此在意数据"];
        let fontSize = compact
            ? clamp(canvasWidth * 0.13, 38, 56)
            : clamp(canvasWidth * 0.065, 54, 86);
        const measureCanvas = document.createElement("canvas");
        const measureContext = measureCanvas.getContext("2d");
        const fontFamily = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Inter", sans-serif';
        measureContext.font = `600 ${fontSize}px ${fontFamily}`;

        let widestLine = Math.max(...lines.map((line) => measureContext.measureText(line).width));
        const maxTextWidth = canvasWidth * (compact ? 0.8 : 0.86);
        if (widestLine > maxTextWidth) {
            fontSize *= maxTextWidth / widestLine;
            measureContext.font = `600 ${fontSize}px ${fontFamily}`;
            widestLine = Math.max(...lines.map((line) => measureContext.measureText(line).width));
        }

        const lineHeight = fontSize * 1.28;
        const maskWidth = Math.ceil(widestLine + 24);
        const maskHeight = Math.ceil(lineHeight * lines.length + 16);
        const mask = document.createElement("canvas");
        mask.width = maskWidth;
        mask.height = maskHeight;
        const maskContext = mask.getContext("2d", { willReadFrequently: true });
        maskContext.clearRect(0, 0, maskWidth, maskHeight);
        maskContext.fillStyle = "#000";
        maskContext.font = `600 ${fontSize}px ${fontFamily}`;
        maskContext.textAlign = "center";
        maskContext.textBaseline = "middle";
        lines.forEach((line, index) => {
            const y = maskHeight / 2 + (index - (lines.length - 1) / 2) * lineHeight;
            maskContext.fillText(line, maskWidth / 2, y);
        });

        const image = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
        const sampleStep = 1;
        const candidates = [];
        for (let y = 1; y < maskHeight - 1; y += sampleStep) {
            for (let x = 1; x < maskWidth - 1; x += sampleStep) {
                if (image[(y * maskWidth + x) * 4 + 3] > 96) candidates.push({ x, y });
            }
        }

        for (let index = candidates.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
        }

        const particleLimit = compact
            ? (lowPower ? 4200 : 6800)
            : (lowPower ? 8000 : 14500);
        const selected = candidates.slice(0, Math.min(particleLimit, candidates.length));
        const originX = canvasWidth / 2 - maskWidth / 2;
        const originY = canvasHeight / 2 - maskHeight / 2;
        const edgeInset = compact ? 18 : 28;

        particles = selected.map((point) => {
            const targetX = originX + point.x;
            const targetY = originY + point.y;
            const edge = Math.floor(Math.random() * 4);
            let startX = targetX;
            let startY = targetY;
            if (edge === 0) {
                startX = -edgeInset;
                startY = Math.random() * canvasHeight;
            } else if (edge === 1) {
                startX = canvasWidth + edgeInset;
                startY = Math.random() * canvasHeight;
            } else if (edge === 2) {
                startX = Math.random() * canvasWidth;
                startY = -edgeInset;
            } else {
                startX = Math.random() * canvasWidth;
                startY = canvasHeight + edgeInset;
            }
            const vectorX = targetX - canvasWidth / 2;
            const vectorY = targetY - canvasHeight / 2;
            const vectorLength = Math.hypot(vectorX, vectorY) || 1;
            const drift = 11 + Math.random() * (compact ? 13 : 19);
            return {
                targetX,
                targetY,
                startX,
                startY,
                driftX: (vectorX / vectorLength) * drift + (Math.random() - 0.5) * 7,
                driftY: (vectorY / vectorLength) * drift + (Math.random() - 0.5) * 7,
                curveX: (Math.random() - 0.5) * (compact ? 18 : 34),
                curveY: (Math.random() - 0.5) * (compact ? 14 : 26),
                size: 1.04 + Math.random() * 0.86,
                opacity: 0.86 + Math.random() * 0.14,
                phase: Math.random() * Math.PI * 2
            };
        });
    };

    const renderParticles = (time) => {
        if (!isOpen || reducedMotion) return;
        const elapsed = time - introStartedAt;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = "#1f1f1d";

        let positionProgress = 1;
        let scatterProgress = 0;
        let opacity = 0.9;

        if (elapsed < gatherEnd) {
            positionProgress = easeOutQuint(elapsed / gatherEnd);
            opacity = 0.9 * clamp(elapsed / 150);
        } else if (elapsed < holdEnd) {
            positionProgress = 1;
            opacity = 0.9;
        } else {
            positionProgress = 1;
            scatterProgress = smoothstep((elapsed - holdEnd) / (scatterEnd - holdEnd));
            opacity = 0.9 * (1 - scatterProgress);
        }

        const breathStrength = elapsed >= gatherEnd && elapsed < holdEnd ? 0.28 : 0;
        particles.forEach((particle) => {
            const breathX = Math.sin(time * 0.006 + particle.phase) * breathStrength;
            const breathY = Math.cos(time * 0.005 + particle.phase) * breathStrength;
            const curveAmount = Math.sin(Math.PI * positionProgress);
            const x =
                mix(particle.startX, particle.targetX, positionProgress) +
                particle.curveX * curveAmount +
                particle.driftX * scatterProgress +
                breathX;
            const y =
                mix(particle.startY, particle.targetY, positionProgress) +
                particle.curveY * curveAmount +
                particle.driftY * scatterProgress +
                breathY;
            context.globalAlpha = Math.max(0, opacity * particle.opacity);
            context.fillRect(x, y, particle.size, particle.size);
        });
        context.globalAlpha = 1;

        if (elapsed < scatterEnd + 10) {
            animationFrame = window.requestAnimationFrame(renderParticles);
        } else {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        }
    };

    const startIntro = () => {
        introStartedAt = performance.now();
        if (!reducedMotion) {
            buildParticles();
            window.cancelAnimationFrame(animationFrame);
            animationFrame = window.requestAnimationFrame(renderParticles);
        }

        contentTimer = window.setTimeout(() => {
            if (!isOpen) return;
            experience.classList.add("is-content-visible");
            closeButton.focus({ preventScroll: true });
        }, reducedMotion ? 250 : holdEnd + 100);

        introTimer = window.setTimeout(() => {
            if (!isOpen) return;
            experience.classList.add("is-intro-complete");
        }, reducedMotion ? 470 : scatterEnd);
    };

    const openLifeBase = () => {
        if (isOpen) return;
        window.clearTimeout(closeTimer);
        restoreScrollY = window.scrollY;
        isOpen = true;
        shell.scrollTop = 0;
        activateTab("pet", { animate: false });
        experience.classList.remove("is-closing", "is-content-visible", "is-intro-complete");
        experience.inert = false;
        experience.setAttribute("aria-hidden", "false");
        document.body.classList.add("lifebase-open");
        experience.focus({ preventScroll: true });

        window.requestAnimationFrame(() => {
            experience.classList.add("is-open", "is-intro-active");
            startIntro();
        });
    };

    const closeLifeBase = () => {
        if (!isOpen) return;
        isOpen = false;
        experience.inert = true;
        window.clearTimeout(contentTimer);
        window.clearTimeout(introTimer);
        window.clearTimeout(liquidTimer);
        window.cancelAnimationFrame(animationFrame);
        experience.classList.add("is-closing");
        experience.classList.remove("is-open", "is-content-visible");

        closeTimer = window.setTimeout(() => {
            experience.classList.remove(
                "is-closing",
                "is-intro-active",
                "is-intro-complete"
            );
            experience.setAttribute("aria-hidden", "true");
            document.body.classList.remove("lifebase-open");
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            window.scrollTo({ top: restoreScrollY, behavior: "instant" });
            const launch = document.querySelector("[data-lifebase-last-launch='true']");
            launch?.focus({ preventScroll: true });
            launch?.removeAttribute("data-lifebase-last-launch");
        }, reducedMotion ? 180 : 380);
    };

    tabs.forEach((tab) => {
        const key = tab.dataset.lifebaseTab;
        tab.addEventListener("mouseenter", () => activateTab(key));
        tab.addEventListener("click", () => activateTab(key));
        tab.addEventListener("keydown", (event) => {
            const currentIndex = tabs.indexOf(tab);
            let nextIndex = currentIndex;
            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = tabs.length - 1;
            } else {
                return;
            }
            event.preventDefault();
            activateTab(tabs[nextIndex].dataset.lifebaseTab, { focus: true });
        });
    });

    document.addEventListener("click", (event) => {
        const target = event.target instanceof Element
            ? event.target.closest("[data-lifebase-launch]")
            : null;
        if (!target || experience.contains(target)) return;
        event.preventDefault();
        document
            .querySelector("[data-lifebase-last-launch='true']")
            ?.removeAttribute("data-lifebase-last-launch");
        target.setAttribute("data-lifebase-last-launch", "true");
        openLifeBase();
    }, true);

    closeButton.addEventListener("click", closeLifeBase);

    document.addEventListener("keydown", (event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeLifeBase();
            return;
        }

        if (event.key !== "Tab" || !experience.classList.contains("is-content-visible")) return;
        const focusable = Array.from(experience.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((element) => element.offsetParent !== null && element.getAttribute("aria-hidden") !== "true");
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
    });

    window.addEventListener("resize", () => {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => {
            updateOrientation();
            if (isOpen && !reducedMotion && !experience.classList.contains("is-intro-complete")) {
                buildParticles();
            }
        });
    }, { passive: true });

    if (typeof mobilePreference.addEventListener === "function") {
        mobilePreference.addEventListener("change", updateOrientation);
    }

    if (typeof motionPreference.addEventListener === "function") {
        motionPreference.addEventListener("change", (event) => {
            reducedMotion = event.matches;
            if (reducedMotion) {
                window.cancelAnimationFrame(animationFrame);
                context.clearRect(0, 0, canvasWidth, canvasHeight);
            }
        });
    }

    updateOrientation();
    activateTab("pet", { animate: false });
})();
