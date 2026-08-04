(() => {
    const store = document.getElementById("pet-shop");
    if (!store) return;

    const tabs = Array.from(store.querySelectorAll("[data-pal-store-tab]"));
    const panels = Array.from(store.querySelectorAll("[data-pal-store-panel]"));
    const stage = store.querySelector(".pal-store-stage");
    const shell = store.querySelector(".pal-store-shell");
    const closeButton = document.getElementById("pal-store-close");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeKey = "food";
    let resizeFrame = 0;
    let restoreScrollY = 0;
    let closingTimer = 0;
    let isOpen = false;

    const updateStageHeight = () => {
        if (!stage) return;
        const activePanel = panels.find((panel) => panel.classList.contains("is-active"));
        if (!activePanel) return;
        stage.style.height = `${activePanel.scrollHeight}px`;
    };

    const activate = (key) => {
        if (!key || key === activeKey) {
            updateStageHeight();
            return;
        }

        activeKey = key;
        tabs.forEach((tab) => {
            const selected = tab.dataset.palStoreTab === key;
            tab.classList.toggle("is-active", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach((panel) => {
            const selected = panel.dataset.palStorePanel === key;
            panel.classList.toggle("is-active", selected);
            panel.setAttribute("aria-hidden", String(!selected));
        });

        requestAnimationFrame(updateStageHeight);
    };

    tabs.forEach((tab, index) => {
        const key = tab.dataset.palStoreTab;
        tab.addEventListener("pointerenter", () => activate(key));
        tab.addEventListener("focus", () => activate(key));
        tab.addEventListener("click", () => activate(key));
        tab.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            let nextIndex = index;
            if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = tabs.length - 1;
            tabs[nextIndex].focus();
        });
    });

    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(updateStageHeight);
    });
    panels.forEach((panel) => resizeObserver.observe(panel));

    store.querySelectorAll("img").forEach((image) => {
        if (!image.complete) image.addEventListener("load", updateStageHeight, { once: true });
    });

    const openStore = () => {
        if (isOpen) return;
        window.clearTimeout(closingTimer);
        restoreScrollY = window.scrollY;
        isOpen = true;
        store.removeAttribute("inert");
        store.setAttribute("aria-hidden", "false");
        document.body.classList.add("pal-store-open");
        activate("food");
        if (shell) shell.scrollTop = 0;
        requestAnimationFrame(() => {
            store.classList.remove("is-closing");
            store.classList.add("is-open");
            updateStageHeight();
            closeButton?.focus({ preventScroll: true });
        });
    };

    const closeStore = () => {
        if (!isOpen) return;
        isOpen = false;
        store.classList.add("is-closing");
        store.classList.remove("is-open");
        closingTimer = window.setTimeout(() => {
            store.classList.remove("is-closing");
            store.setAttribute("aria-hidden", "true");
            store.setAttribute("inert", "");
            document.body.classList.remove("pal-store-open");
            window.scrollTo({ top: restoreScrollY, behavior: "instant" });
            const launch = document.querySelector("[data-pal-store-last-launch='true']");
            launch?.focus({ preventScroll: true });
            launch?.removeAttribute("data-pal-store-last-launch");
        }, reduceMotion ? 10 : 450);
    };

    document.addEventListener("click", (event) => {
        const launch = event.target.closest('a[href="#pet-shop"], [data-pal-store-launch]');
        if (!launch || store.contains(launch)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelector("[data-pal-store-last-launch='true']")?.removeAttribute("data-pal-store-last-launch");
        launch.setAttribute("data-pal-store-last-launch", "true");
        openStore();
    }, true);

    closeButton?.addEventListener("click", closeStore);

    document.addEventListener("keydown", (event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeStore();
            return;
        }
        if (event.key !== "Tab") return;
        const focusable = Array.from(store.querySelectorAll(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
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
    });

    updateStageHeight();
})();
