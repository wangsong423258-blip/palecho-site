(() => {
    "use strict";

    const page = document.getElementById("community");
    if (!page) return;

    const moduleButtons = Array.from(page.querySelectorAll("[data-community-module]"));
    const modulePanels = Array.from(page.querySelectorAll("[data-community-panel]"));
    const viewPanels = Array.from(page.querySelectorAll("[data-community-view]"));
    const storyCards = Array.from(page.querySelectorAll(".community-story-card"));
    const ecosystemCards = Array.from(page.querySelectorAll(".ecosystem-card"));
    const searchInput = document.getElementById("community-search-input");
    const searchResults = document.getElementById("community-search-results");
    const searchClear = document.getElementById("community-search-clear");
    const main = document.getElementById("community-main");
    const dialog = document.getElementById("community-dialog");
    const dialogContent = document.getElementById("community-dialog-content");
    const publishDialog = document.getElementById("community-publish-dialog");
    const toast = document.getElementById("community-toast");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let activeModule = "community";
    let activeView = "home";
    let transitionTimer = 0;
    let toastTimer = 0;

    const details = {
        "cat-zoomies": {
            tag: "猫咪行为",
            title: "为什么猫咪会凌晨跑酷？",
            copy: "猫咪在黎明与黄昏前后更活跃，这是它们自然节律的一部分。白天增加短时、高质量的互动游戏，并在睡前安排一次捕猎式玩耍，通常能让夜晚更安稳。",
            note: "如果夜间活动突然显著增加，并伴随叫声、食欲或排泄变化，建议及时咨询兽医。",
            image: "/community-sleeping-cat.jpg"
        },
        "food-change": {
            tag: "饮食建议",
            title: "狗狗换粮七天过渡法",
            copy: "第 1—2 天将新粮控制在四分之一，第 3—4 天调整到一半，第 5—6 天增加到四分之三，第 7 天再完全替换。每天记录食欲、饮水、精神状态和排便情况。",
            note: "幼犬、老年犬或肠胃敏感的狗狗，可以把过渡期延长到 10—14 天。",
            image: "/community-golden.jpg"
        },
        "summer-care": {
            tag: "健康知识",
            title: "夏季如何预防中暑？",
            copy: "避开正午散步，随身携带饮水，减少高温环境中的剧烈活动。短鼻犬、幼犬、老年犬和有心肺基础疾病的宠物需要更谨慎。",
            note: "持续喘气、流涎、步态不稳或精神沉郁都可能是危险信号，应立刻降温并尽快就医。",
            image: "/community-dog-owner.jpg"
        },
        "puppy-week": {
            tag: "新手经验",
            title: "幼犬第一周应该如何照顾？",
            copy: "先给它一个安静、稳定的小空间，不急着认识所有人，也不频繁更换食物。确认疫苗与驱虫记录，固定喂食和如厕节奏，再一点点建立安全感。",
            note: "真正有效的第一周，不是做得很多，而是让幼犬知道：这里安全、规律、值得信任。",
            image: "/community-puppies.jpg"
        },
        "cat-water": {
            tag: "健康知识",
            title: "猫咪一直喝水少怎么办？",
            copy: "把水碗放在安静且远离食物、猫砂的位置，尝试不同材质与宽度的容器，也可以通过湿粮增加日常水分摄入。多猫家庭最好准备多个饮水点。",
            note: "如果饮水或排尿量突然变化，请尽快就医排查泌尿系统与代谢问题。",
            image: "/community-cat-basket.jpg"
        },
        walking: {
            tag: "训练技巧",
            title: "第一次户外随行训练记录",
            copy: "从安静环境与短距离开始，让牵引绳保持自然松弛。当狗狗主动回头关注你时及时奖励。把一次训练控制在几分钟，比走得更远更重要。",
            note: "训练不是要求宠物服从，而是建立一套双方都能理解的沟通方式。",
            image: "/community-dog-owner.jpg"
        },
        "cat-sleep": {
            tag: "日常记录",
            title: "猫咪的十五小时睡眠观察",
            copy: "成年猫每天睡 12—16 小时并不少见。天气、年龄、活动量和家庭环境都会影响睡眠时长。更重要的是观察它醒来后的精神、食欲与互动意愿。",
            note: "记录变化，而不是只看一次数据。长期观察最能帮助你理解它的正常状态。",
            image: "/community-sleeping-cat.jpg"
        },
        "family-guide": {
            tag: "经验分享",
            title: "把养宠知识做成一本家庭手册",
            copy: "把每天的喂食量、常用药物、过敏信息、医院电话和紧急联系人写在固定位置。即使临时由家人照顾，也能保持一致的养护节奏。",
            note: "一份好手册不需要复杂，只需要准确、易找、每个人都看得懂。",
            image: "/community-reading-dog.jpg"
        },
        "stray-plan": {
            tag: "长期公益计划",
            title: "保护流浪动物计划",
            copy: "PalEcho 将与合作机构共同支持城市流浪动物的基础医疗、绝育、临时安置与领养回访，并定期公开项目进展与资源去向。",
            note: "救助不是把动物带走就结束，而是让它获得稳定、尊重且可持续的新生活。",
            image: "/community-adoption-dog.jpg"
        },
        volunteer: {
            tag: "志愿者招募",
            title: "公益义工招募",
            copy: "你可以参与救助站清洁、动物陪伴、领养日协助、公益摄影与科普传播。我们会根据经验与时间安排合适的任务，并提供基础培训。",
            note: "报名后，PalEcho 公益团队会在 3 个工作日内与你联系。",
            image: "/community-volunteer.jpg"
        },
        events: {
            tag: "近期活动",
            title: "这个月，一起见面",
            copy: "周末公益领养日、城市宠物健康讲座、社区文明养宠行动与 PalEcho 用户见面会将陆续开放报名。每场活动都提供清晰的时间、地点与参与说明。",
            note: "活动名额有限，我们会优先通知已完成实名信息的报名用户。",
            image: "/community-party-dog.jpg"
        },
        partners: {
            tag: "合作公益机构",
            title: "让长期合作产生长期改变",
            copy: "PalEcho 以透明、专业与可持续为合作原则，与动物保护组织共同开展救助、医疗、领养和公众教育项目。",
            note: "所有合作公益机构均统一使用 PalEcho Certified 官方认证徽章。",
            image: "/community-puppies.jpg"
        },
        "vet-chen": {
            tag: "官方认证兽医",
            title: "陈知远 · 犬猫内科",
            copy: "执业 11 年，专注犬猫内科、慢性病管理与影像诊断。陈医生希望用清晰、不过度医疗的方式，让宠物主人真正理解每一个诊疗选择。",
            note: "PalEcho Certified · 官方认证编号：PEC-V-0218",
            image: "/community-vet.jpg"
        },
        "vet-lin": {
            tag: "官方认证兽医",
            title: "林书雅 · 猫科与行为",
            copy: "专注猫科友善诊疗、应激管理与家庭行为支持，倡导从环境和长期关系出发理解猫咪。",
            note: "PalEcho Certified · 官方认证编号：PEC-V-0261",
            image: "/community-volunteer.jpg"
        },
        "vet-xu": {
            tag: "官方认证兽医",
            title: "许言 · 营养与体重管理",
            copy: "关注不同年龄与健康阶段的营养需求，擅长把专业方案转化为家庭真正能够长期执行的日常计划。",
            note: "PalEcho Certified · 官方认证编号：PEC-V-0307",
            image: "/community-dog-owner.jpg"
        }
    };

    const searchItems = [
        { icon: "🐶", title: "幼犬第一周应该如何照顾？", subtitle: "经验 · 幼犬 · 新手", action: "detail", value: "puppy-week" },
        { icon: "🐱", title: "猫咪一直喝水少怎么办？", subtitle: "健康 · 猫咪 · 饮水", action: "detail", value: "cat-water" },
        { icon: "🥣", title: "狗狗换粮七天过渡法", subtitle: "饮食 · 换粮 · 肠胃", action: "detail", value: "food-change" },
        { icon: "☀️", title: "夏季如何预防中暑？", subtitle: "健康 · 夏季 · 急救", action: "detail", value: "summer-care" },
        { icon: "＋", title: "官方合作宠物医院", subtitle: "医院 · 疫苗 · 预约", action: "view", value: "hospitals" },
        { icon: "✓", title: "官方认证兽医", subtitle: "健康 · 医生 · 认证", action: "view", value: "vets" },
        { icon: "🐾", title: "保护流浪动物计划", subtitle: "公益 · 救助 · 领养", action: "detail", value: "stray-plan" },
        { icon: "♡", title: "公益义工招募", subtitle: "公益 · 志愿者 · 活动", action: "detail", value: "volunteer" }
    ];

    const showToast = (message) => {
        if (!toast) return;
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add("is-visible");
        toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };

    const scrollToElement = (element) => {
        if (!element) return;
        element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    const switchModule = (name, shouldScroll = false) => {
        if (name === activeModule) {
            if (shouldScroll) scrollToElement(main);
            return;
        }

        window.clearTimeout(transitionTimer);
        const currentPanel = modulePanels.find((panel) => panel.dataset.communityPanel === activeModule);
        const nextPanel = modulePanels.find((panel) => panel.dataset.communityPanel === name);
        if (!nextPanel) return;

        if (currentPanel) currentPanel.classList.remove("is-active");
        moduleButtons.forEach((button) => {
            const isActive = button.dataset.communityModule === name;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        transitionTimer = window.setTimeout(() => {
            modulePanels.forEach((panel) => {
                const isActive = panel === nextPanel;
                panel.hidden = !isActive;
                panel.classList.toggle("is-active", isActive);
            });
            activeModule = name;
            if (shouldScroll) scrollToElement(main);
        }, reduceMotion ? 0 : 190);
    };

    const showView = (name) => {
        if (name === activeView && name !== "home") return;
        window.clearTimeout(transitionTimer);
        const current = viewPanels.find((view) => view.dataset.communityView === activeView);
        const next = viewPanels.find((view) => view.dataset.communityView === name);
        if (!next) return;

        if (current) current.classList.remove("is-active");
        transitionTimer = window.setTimeout(() => {
            viewPanels.forEach((view) => {
                const isActive = view === next;
                view.hidden = !isActive;
                view.classList.toggle("is-active", isActive);
            });
            activeView = name;
            window.scrollTo({ top: page.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
            if (name === "home") switchModule("ecosystem");
        }, reduceMotion ? 0 : 190);
    };

    const openDetail = (id) => {
        const detail = details[id];
        if (!detail || !dialog || !dialogContent) return;
        dialogContent.innerHTML = `
            <div class="dialog-cover"><img src="${detail.image}" alt="${detail.title}"/></div>
            <p class="community-section-kicker">${detail.tag}</p>
            <h2>${detail.title}</h2>
            <p>${detail.copy}</p>
            <div class="dialog-note">${detail.note}</div>
        `;
        if (typeof dialog.showModal === "function") dialog.showModal();
    };

    const closeDialog = (target) => {
        if (target?.open) target.close();
    };

    const applyStoryFilter = (category) => {
        let visibleCount = 0;
        storyCards.forEach((card) => {
            const visible = category === "全部" || card.dataset.category === category;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
                visibleCount += 1;
                card.classList.add("is-entering");
                requestAnimationFrame(() => card.classList.remove("is-entering"));
            }
        });
        document.getElementById("community-empty")?.classList.toggle("is-visible", visibleCount === 0);
    };

    const applyEcosystemFilter = (category) => {
        let visibleCount = 0;
        ecosystemCards.forEach((card) => {
            const visible = category === "全部" || card.dataset.ecosystemCategory === category;
            card.classList.toggle("is-hidden", !visible);
            if (visible) visibleCount += 1;
        });
        document.getElementById("ecosystem-empty")?.classList.toggle("is-visible", visibleCount === 0);
    };

    const sortStories = (sort) => {
        const feed = document.getElementById("community-feed");
        if (!feed) return;
        const orders = {
            featured: ["puppy-week", "cat-water", "walking", "cat-sleep", "food-change", "family-guide"],
            latest: ["cat-water", "puppy-week", "walking", "cat-sleep", "food-change", "family-guide"],
            popular: ["food-change", "cat-sleep", "cat-water", "walking", "family-guide", "puppy-week"]
        };
        const order = orders[sort] || orders.featured;
        order.forEach((id) => {
            const card = storyCards.find((item) => item.dataset.detailId === id);
            if (card) feed.appendChild(card);
        });
        storyCards.forEach((card) => {
            card.classList.add("is-entering");
            requestAnimationFrame(() => card.classList.remove("is-entering"));
        });
    };

    const renderSearch = (query) => {
        if (!searchResults || !searchClear) return;
        const normalized = query.trim().toLowerCase();
        searchClear.classList.toggle("is-visible", normalized.length > 0);
        if (!normalized) {
            searchResults.classList.remove("is-open");
            searchResults.innerHTML = "";
            return;
        }

        const matches = searchItems.filter((item) =>
            `${item.title} ${item.subtitle}`.toLowerCase().includes(normalized)
        );

        if (!matches.length) {
            searchResults.innerHTML = `<p class="community-search-empty">暂时没有找到相关内容，试试“健康”或“领养”。</p>`;
        } else {
            searchResults.innerHTML = matches.map((item) => `
                <button type="button" role="option" data-search-action="${item.action}" data-search-value="${item.value}">
                    <span aria-hidden="true">${item.icon}</span>
                    <span><strong>${item.title}</strong><small>${item.subtitle}</small></span>
                    <em>进入 →</em>
                </button>
            `).join("");
        }
        searchResults.classList.add("is-open");
    };

    moduleButtons.forEach((button) => {
        button.addEventListener("click", () => switchModule(button.dataset.communityModule));
    });

    page.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const saveButton = target.closest("[data-save]");
        if (saveButton) {
            event.stopPropagation();
            saveButton.classList.toggle("is-saved");
            saveButton.textContent = saveButton.classList.contains("is-saved") ? "♥" : "♡";
            showToast(saveButton.classList.contains("is-saved") ? "已收藏这条分享" : "已取消收藏");
            return;
        }

        const moduleTrigger = target.closest("[data-switch-module]");
        if (moduleTrigger) {
            switchModule(moduleTrigger.dataset.switchModule, true);
            const targetFilter = moduleTrigger.dataset.ecosystemTarget;
            if (targetFilter) {
                const filterButton = page.querySelector(`[data-ecosystem-filter="${targetFilter}"]`);
                if (filterButton) filterButton.click();
            }
            return;
        }

        const viewTrigger = target.closest("[data-open-community-view]");
        if (viewTrigger) {
            showView(viewTrigger.dataset.openCommunityView);
            return;
        }

        const detailTrigger = target.closest("[data-detail-id]");
        if (detailTrigger) {
            openDetail(detailTrigger.dataset.detailId);
            return;
        }

        const storyCard = target.closest(".community-story-card");
        if (storyCard) openDetail(storyCard.dataset.detailId);

        const ecosystemCard = target.closest(".ecosystem-card");
        if (ecosystemCard?.dataset.detailId) openDetail(ecosystemCard.dataset.detailId);
    });

    storyCards.forEach((card) => {
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDetail(card.dataset.detailId);
            }
        });
    });

    ecosystemCards.forEach((card) => {
        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            if (card.dataset.openCommunityView) showView(card.dataset.openCommunityView);
            else if (card.dataset.detailId) openDetail(card.dataset.detailId);
        });
    });

    page.querySelectorAll("[data-community-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            page.querySelectorAll("[data-community-filter]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            applyStoryFilter(button.dataset.communityFilter);
        });
    });

    page.querySelectorAll("[data-ecosystem-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            page.querySelectorAll("[data-ecosystem-filter]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            applyEcosystemFilter(button.dataset.ecosystemFilter);
        });
    });

    page.querySelectorAll("[data-feed-sort]").forEach((button) => {
        button.addEventListener("click", () => {
            page.querySelectorAll("[data-feed-sort]").forEach((item) => {
                item.classList.remove("is-active");
                item.setAttribute("aria-selected", "false");
            });
            button.classList.add("is-active");
            button.setAttribute("aria-selected", "true");
            sortStories(button.dataset.feedSort);
        });
    });

    page.querySelectorAll("[data-search-keyword]").forEach((button) => {
        button.addEventListener("click", () => {
            if (!searchInput) return;
            searchInput.value = button.dataset.searchKeyword;
            renderSearch(searchInput.value);
            searchInput.focus();
        });
    });

    searchInput?.addEventListener("input", () => renderSearch(searchInput.value));
    searchInput?.addEventListener("focus", () => renderSearch(searchInput.value));
    searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            searchResults?.classList.remove("is-open");
            searchInput.blur();
        }
        if (event.key === "Enter") {
            const firstResult = searchResults?.querySelector("[data-search-action]");
            if (firstResult instanceof HTMLElement) firstResult.click();
        }
    });

    searchClear?.addEventListener("click", () => {
        if (!searchInput) return;
        searchInput.value = "";
        renderSearch("");
        searchInput.focus();
    });

    searchResults?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest("[data-search-action]");
        if (!button) return;
        searchResults.classList.remove("is-open");
        if (button.dataset.searchAction === "detail") openDetail(button.dataset.searchValue);
        if (button.dataset.searchAction === "view") {
            switchModule("ecosystem");
            showView(button.dataset.searchValue);
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".community-search")) searchResults?.classList.remove("is-open");
    });

    page.querySelectorAll("[data-open-publish]").forEach((button) => {
        button.addEventListener("click", () => {
            if (typeof publishDialog?.showModal === "function") publishDialog.showModal();
        });
    });

    document.querySelectorAll(".community-dialog-close").forEach((button) => {
        button.addEventListener("click", () => closeDialog(button.closest("dialog")));
    });

    [dialog, publishDialog].forEach((item) => {
        item?.addEventListener("click", (event) => {
            if (event.target === item) closeDialog(item);
        });
    });

    publishDialog?.querySelector("[data-publish-submit]")?.addEventListener("click", () => {
        closeDialog(publishDialog);
        showToast("分享已提交，发布后会出现在最新内容中");
    });

    page.querySelectorAll("[data-toast]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            showToast(button.dataset.toast);
        });
    });

    const mapPins = Array.from(page.querySelectorAll("[data-hospital]"));
    const hospitalCards = Array.from(page.querySelectorAll("[data-hospital-card]"));
    mapPins.forEach((pin) => {
        pin.addEventListener("click", () => {
            const index = pin.dataset.hospital;
            mapPins.forEach((item) => item.classList.toggle("is-active", item === pin));
            hospitalCards.forEach((card) => card.classList.toggle("is-active", card.dataset.hospitalCard === index));
            if (window.innerWidth < 760) {
                const card = hospitalCards.find((item) => item.dataset.hospitalCard === index);
                scrollToElement(card);
            }
        });
    });

    if (window.location.hash === "#community") {
        page.classList.add("visible");
    }
})();
