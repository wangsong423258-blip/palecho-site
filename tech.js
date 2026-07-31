(() => {
  "use strict";

  const tabs = Array.from(document.querySelectorAll("[data-capability]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  if (!tabs.length || !panels.length) return;

  const select = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.capability === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("pointerenter", () => select(tab.dataset.capability));
    tab.addEventListener("click", () => select(tab.dataset.capability));
    tab.addEventListener("focus", () => select(tab.dataset.capability));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
    });
  });
})();
