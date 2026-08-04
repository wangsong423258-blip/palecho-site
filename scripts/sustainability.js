(() => {
  const story = document.getElementById("sustainability-story");
  const stage = story?.querySelector(".sustainability-stage");
  const heading = story?.querySelector(".sustainability-heading");
  const scrollPrompt = story?.querySelector(".sustainability-scroll-prompt");
  const items = Array.from(story?.querySelectorAll(".sustainability-item") ?? []);
  const progress = story?.querySelector(".sustainability-progress");
  const counter = document.getElementById("sustainability-counter");
  const ending = story?.querySelector(".sustainability-ending");

  if (!story || !stage || !heading || !scrollPrompt || !progress || !counter || !ending || !items.length) return;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smooth = (value) => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const mix = (from, to, amount) => from + (to - from) * amount;
  let frame = 0;

  const update = () => {
    frame = 0;
    const bounds = story.getBoundingClientRect();
    const scrollable = Math.max(1, bounds.height - window.innerHeight);
    const position = clamp(-bounds.top / scrollable);
    const titleMove = smooth((position - 0.105) / 0.135);
    const titleScale = mix(1, 0.5, titleMove);
    const initialTop = window.innerHeight * 0.36;
    const finalTop = Math.max(26, Math.min(window.innerWidth * 0.04, 52));

    heading.style.setProperty("--title-top", `${mix(initialTop, finalTop, titleMove).toFixed(2)}px`);
    heading.style.setProperty("--title-scale", titleScale.toFixed(4));
    heading.style.setProperty("--title-subtitle-opacity", (1 - titleMove * 0.28).toFixed(3));
    const promptExit = smooth((position - 0.025) / 0.06);
    scrollPrompt.style.setProperty("--scroll-prompt-opacity", (0.72 * (1 - promptExit)).toFixed(3));
    scrollPrompt.style.setProperty("--scroll-prompt-y", `${mix(0, -8, promptExit).toFixed(2)}px`);

    const contentStart = 0.25;
    const itemSpan = 0.075;
    let displayed = 1;

    items.forEach((item, index) => {
      const local = (position - (contentStart + itemSpan * index)) / itemSpan;
      const entering = smooth(local / 0.22);
      const leaving = smooth((local - 0.7) / 0.3);
      const opacity = clamp(entering * (1 - leaving));
      const movement = local < 0.22 ? mix(30, 0, entering) : local > 0.7 ? mix(0, -24, leaving) : 0;
      const scale = local < 0.22 ? mix(0.985, 1, entering) : local > 0.7 ? mix(1, 0.985, leaving) : 1;

      item.style.setProperty("--item-opacity", opacity.toFixed(3));
      item.style.setProperty("--item-y", `${movement.toFixed(2)}px`);
      item.style.setProperty("--item-scale", scale.toFixed(4));

      if (local >= 0.5 && index + 1 > displayed) displayed = index + 1;
    });

    const progressVisible = smooth((position - 0.205) / 0.045) * (1 - smooth((position - 0.88) / 0.05));
    const fill = clamp((position - contentStart) / (itemSpan * 7.7));
    progress.style.setProperty("--progress-opacity", (progressVisible * 0.35).toFixed(3));
    progress.style.setProperty("--progress-fill", `${(fill * 100).toFixed(2)}%`);
    counter.textContent = `${String(displayed).padStart(2, "0")} / 08`;

    const endingEntry = smooth((position - 0.87) / 0.075);
    ending.style.setProperty("--ending-opacity", endingEntry.toFixed(3));
    ending.style.setProperty("--ending-y", `${mix(24, 0, endingEntry).toFixed(2)}px`);
    ending.style.setProperty("--ending-scale", mix(0.985, 1, endingEntry).toFixed(4));
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
})();
