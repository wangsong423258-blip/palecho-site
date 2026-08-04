(() => {
  const root = document.getElementById("support");
  if (!root) return;
  const supportI18n = window.PalEchoSupportI18n || { t: (value) => value, locale: () => "zh-CN" };
  const t = (value) => supportI18n.t(value);
  root.className = "support-hub";
  root.innerHTML = `
    <header class="support-hub-title">
      <p class="support-hub-eyebrow">官方帮助中心</p>
      <h2>官方技术支持</h2>
      <p class="support-hub-intro">查找设备、健康数据、账户、服务及系统相关的使用帮助。</p>
      <div class="support-search-area">
        <label class="support-search-box"><span class="support-search-symbol" aria-hidden="true">⌕</span><input id="support-search-input" type="search" placeholder="搜索帮助内容，例如：设备连接、健康报告、定位异常……" aria-label="搜索帮助内容"/><button class="support-search-clear" id="support-search-clear" type="button" aria-label="清除搜索">×</button></label>
        <div class="support-search-results" id="support-search-results" aria-live="polite"></div>
      </div>
    </header>
    <section class="support-directory" aria-labelledby="support-directory-title">
      <header class="support-directory-heading"><p class="support-hub-eyebrow">帮助目录</p><h3 id="support-directory-title">查找支持内容</h3><p>选择一个分类，查看对应的帮助与解决方案。</p></header>
      <div class="support-layout">
        <nav class="support-category-tabs" aria-label="支持内容分类" role="tablist">
          <button class="support-category-tab is-active" type="button" data-support-tab="scope" role="tab"><b>◌</b>支持范围</button>
          <button class="support-category-tab" type="button" data-support-tab="faq" role="tab"><b>?</b>常见问题</button>
          <button class="support-category-tab" type="button" data-support-tab="guide" role="tab"><b>≡</b>操作指南</button>
          <button class="support-category-tab" type="button" data-support-tab="online" role="tab"><b>✉</b>在线支持</button>
          <button class="support-category-tab" type="button" data-support-tab="updates" role="tab"><b>↻</b>升级与维护</button>
          <button class="support-category-tab" type="button" data-support-tab="security" role="tab"><b>◇</b>数据安全</button>
        </nav>
        <section class="support-panel" id="support-panel" role="tabpanel"></section>
      </div>
    </section>
    <footer class="support-cta"><p class="support-hub-eyebrow">官方工单服务</p><h3>没有找到需要的内容？</h3><p>如果仍未解决您的问题，我们随时为您提供帮助。</p><a class="support-ticket-button" href="/support/ticket"><span aria-hidden="true">□</span>提交支持工单 <span aria-hidden="true">→</span></a><div class="support-service-notes"><span>平均响应时间：15 分钟</span><i></i><span>服务时间：周一至周日 9:00–22:00</span></div></footer>
  `;

  const sections = {
    scope: { label: "支持范围", title: "支持范围", description: "PalEcho 为用户提供覆盖设备、数据、账户及平台服务的官方支持。", kind: "cards", items: [
      ["⌁", "智能硬件设备", "查看设备连接、佩戴、充电及使用帮助。", "/support/smart-device"], ["✦", "健康助手", "了解健康分析、异常提醒及报告功能。", "/support/ai-health"], ["◒", "健康数据管理", "查看数据同步、健康档案和历史记录。", "/support/health-data"], ["◎", "数字宠物功能", "了解陪伴互动、状态记录与日常功能。", "/support/digital-pet"], ["□", "商城与订单", "处理订单查询、配送与售后相关问题。", "/support/store-orders"], ["○", "账户与会员", "管理登录信息、会员权益与账户设置。", "/support/account-membership"], ["⌖", "定位与防丢", "查看定位权限、电子围栏与防丢帮助。", "/support/location"], ["↻", "系统更新", "了解版本更新、功能变化与使用要求。", "/support/system-update"]
    ] },
    faq: { label: "常见问题", title: "常见问题", description: "快速查看用户最常遇到的问题。", kind: "list", items: [
      ["设备无法连接怎么办？", "从设备电量、蓝牙权限与网络环境开始排查。", "/support/device-connection"], ["为什么没有健康数据？", "检查佩戴、同步状态和账户绑定情况。", "/support/missing-health-data"], ["定位出现偏差怎么办？", "了解定位权限与室内外环境的影响。", "/support/location-drift"], ["健康报告没有更新怎么办？", "确认同步状态和报告生成时间。", "/support/report-not-updated"], ["设备续航时间异常怎么办？", "查看充电状态、使用环境与定位设置。", "/support/battery-life"], ["账号无法登录怎么办？", "通过登录方式、验证码和账户状态逐项确认。", "/support/account-login"], ["会员权益没有生效怎么办？", "确认购买账户与当前登录账户保持一致。", "/support/membership-benefits"], ["设备更换后如何重新绑定？", "先解除旧设备，再按照引导完成新设备绑定。", "/support/replace-device"]
    ] },
    guide: { label: "操作指南", title: "操作指南", description: "从首次使用到日常管理，快速了解 PalEcho 的主要功能。", kind: "cards", guide: true, items: [
      ["01", "首次绑定设备", "完成设备开机、配对与首次同步。", "/support/first-pairing", "约 2 分钟"], ["02", "正确佩戴设备", "了解合适的佩戴位置与日常检查。", "/support/wear-device", "约 2 分钟"], ["03", "查看健康快照", "快速了解宠物当日的状态变化。", "/support/health-snapshot", "约 3 分钟"], ["04", "阅读健康报告", "掌握报告中重点信息的查看方式。", "/support/read-report", "约 3 分钟"], ["05", "使用健康助手", "了解健康分析与日常提醒功能。", "/support/use-ai-health", "约 2 分钟"], ["06", "创建宠物健康档案", "建立完整、连续的健康记录。", "/support/pet-profile", "约 3 分钟"], ["07", "设置电子围栏", "为常用活动区域添加安全提醒。", "/support/geofence", "约 2 分钟"], ["08", "管理账户与会员", "查看账户设置和会员权益。", "/support/manage-membership", "约 2 分钟"]
    ] },
    online: { label: "在线支持", title: "在线支持", description: "通过官方渠道提交问题并获得帮助。", kind: "cards", items: [
      ["↗", "提交支持工单", "描述问题并上传相关图片，我们会尽快处理。", "/support/ticket", "", true], ["⌕", "查询工单进度", "通过工单编号查看当前处理状态。", "/support/ticket-status"], ["✎", "意见与建议", "向 PalEcho 提交产品建议和使用反馈。", "/support/feedback"], ["ℹ", "服务说明", "查看服务时间、响应规则及支持范围。", "/support/service-policy"]
    ] },
    updates: { label: "升级与维护", title: "升级与维护", description: "查看最新版本、功能更新及维护安排。", kind: "updates", items: [
      ["2026.08", "健康助手功能升级", "优化健康分析体验与提醒呈现方式。", "功能更新", "/support/update-2026-08"], ["2026.07", "健康快照功能上线", "支持更清晰地回顾每日健康状态。", "功能更新", "/support/update-2026-07"], ["2026.06", "新增设备支持", "更多设备已支持连接与健康数据同步。", "维护公告", "/support/update-2026-06"]
    ] },
    security: { label: "数据安全", title: "数据安全", description: "了解 PalEcho 如何保护设备数据、健康信息与账户安全。", kind: "cards", items: [
      ["◇", "数据加密", "设备与平台之间的数据传输采用安全加密机制。", "/support/data-encryption"], ["◐", "隐私保护", "清楚说明数据用途，并由用户自主决定授权。", "/support/privacy"], ["⊙", "权限管理", "用户可管理设备、账户及数据访问权限。", "/support/permissions"], ["☁", "云端同步", "查看不同设备间的健康记录同步说明。", "/support/cloud-sync"], ["↓", "数据导出", "按需要申请导出个人和宠物相关数据。", "/support/data-export"], ["×", "数据删除", "用户可以申请删除账户及相关数据。", "/support/data-delete"]
    ] }
  };

  const allItems = Object.values(sections).flatMap((section) => section.items.map((item) => ({ title: item[1], description: item[2], href: item[section.kind === "updates" ? 4 : 3], category: section.label })));
  const resolveHref = (href) => href === "/support/ticket" ? "/support/ticket" : `/support/${href.split("/").pop()}`;
  const panel = document.getElementById("support-panel");
  const tabs = Array.from(document.querySelectorAll("[data-support-tab]"));
  const search = document.getElementById("support-search-input");
  const searchArea = document.querySelector(".support-search-area");
  const results = document.getElementById("support-search-results");
  const clear = document.getElementById("support-search-clear");

  function itemCards(items, guide) {
    return `<div class="support-panel-grid">${items.map((item) => `<a class="support-content-card ${item[5] ? "is-main" : ""}" href="${resolveHref(item[3])}"><b class="support-card-icon"${guide ? ' style="font-size:9px;font-weight:600"' : ""}>${item[0]}</b><span class="support-card-copy"><strong>${t(item[1])}</strong><em>${t(item[2])}</em>${item[4] ? `<small>${t(item[4])}</small>` : ""}</span><i class="support-card-arrow">→</i></a>`).join("")}</div>`;
  }
  function itemList(items) {
    return `<div class="support-panel-list">${items.map((item) => `<a class="support-list-item" href="${resolveHref(item[2])}"><span><strong>${t(item[0])}</strong><em>${t(item[1])}</em></span><i>→</i></a>`).join("")}</div>`;
  }
  function updateList(items) {
    return `<div class="support-update-list">${items.map((item) => `<a class="support-update-item" href="${resolveHref(item[4])}"><time>${item[0]}</time><span><small>${t(item[3])}</small><strong>${t(item[1])}</strong><em>${t(item[2])}</em></span><i>→</i></a>`).join("")}</div>`;
  }
  function render(name) {
    const section = sections[name];
    if (!section || !panel) return;
    const content = section.kind === "cards" ? itemCards(section.items, section.guide) : section.kind === "list" ? itemList(section.items) : updateList(section.items);
    panel.classList.remove("is-changing");
    panel.innerHTML = `<header class="support-panel-header"><p>${t(section.label)}</p><h4>${t(section.title)}</h4><span>${t(section.description)}</span></header>${content}`;
    requestAnimationFrame(() => panel.classList.add("is-changing"));
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.supportTab === name));
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => render(tab.dataset.supportTab)));
  function renderResults() {
    const query = search.value.trim().toLowerCase();
    searchArea.classList.toggle("has-query", Boolean(query));
    if (!query) { results.innerHTML = ""; return; }
    const matches = allItems.filter((item) => `${t(item.title)}${t(item.description)}${t(item.category)}`.toLowerCase().includes(query)).slice(0, 5);
    results.innerHTML = matches.length ? matches.map((item) => `<a class="support-search-result" href="${resolveHref(item.href)}"><span><small>${t(item.category)}</small><strong>${t(item.title)}</strong><em>${t(item.description)}</em></span><i>→</i></a>`).join("") : `<p class="support-search-empty">${t("暂未找到匹配内容，请尝试更换关键词或提交支持工单。")}</p>`;
  }
  if (search) search.addEventListener("input", renderResults);
  if (clear) clear.addEventListener("click", () => { search.value = ""; search.focus(); renderResults(); });
  const applyLocaleLabels = () => {
    const eyebrow = document.querySelectorAll(".support-hub-eyebrow");
    ["官方帮助中心", "帮助目录", "官方工单服务"].forEach((key, index) => { if (eyebrow[index]) eyebrow[index].textContent = t(key); });
    const title = document.querySelector(".support-hub-title h2"); if (title) title.textContent = t("官方技术支持");
    const intro = document.querySelector(".support-hub-intro"); if (intro) intro.textContent = t("查找设备、健康数据、账户、服务及系统相关的使用帮助。");
    const input = document.getElementById("support-search-input"); if (input) { input.setAttribute("placeholder", t("搜索帮助内容，例如：设备连接、健康报告、定位异常……")); input.setAttribute("aria-label", t("搜索帮助内容")); }
    const directoryTitle = document.getElementById("support-directory-title"); if (directoryTitle) directoryTitle.textContent = t("查找支持内容");
    const directoryCopy = document.querySelector(".support-directory-heading > p:last-child"); if (directoryCopy) directoryCopy.textContent = t("选择一个分类，查看对应的帮助与解决方案。");
    tabs.forEach((tab) => { const icon = tab.querySelector("b")?.textContent || ""; tab.innerHTML = `<b>${icon}</b>${t(tab.dataset.supportTab === "scope" ? "支持范围" : tab.dataset.supportTab === "faq" ? "常见问题" : tab.dataset.supportTab === "guide" ? "操作指南" : tab.dataset.supportTab === "online" ? "在线支持" : tab.dataset.supportTab === "updates" ? "升级与维护" : "数据安全")}`; });
    const ctaTitle = document.querySelector(".support-cta h3"); if (ctaTitle) ctaTitle.textContent = t("没有找到需要的内容？");
    const ctaCopy = document.querySelector(".support-cta > p:not(.support-hub-eyebrow)"); if (ctaCopy) ctaCopy.textContent = t("如果仍未解决您的问题，我们随时为您提供帮助。");
    const ctaLink = document.querySelector(".support-ticket-button"); if (ctaLink) ctaLink.innerHTML = `<span aria-hidden="true">□</span>${t("提交支持工单")} <span aria-hidden="true">→</span>`;
    const notes = document.querySelectorAll(".support-service-notes span"); if (notes[0]) notes[0].textContent = t("平均响应时间：15 分钟"); if (notes[1]) notes[1].textContent = t("服务时间：周一至周日 9:00–22:00");
    document.title = `${t("官方技术支持")} | PalEcho`;
  };
  applyLocaleLabels();
  render("scope");
})();
