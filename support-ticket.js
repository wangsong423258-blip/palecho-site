(() => {
  const form = document.getElementById("ticket-form");
  if (!form) return;
  const i18n = window.PalEchoSupportI18n || { t: (value) => value, locale: () => "zh-CN" };
  const t = (value) => i18n.t(value);
  document.documentElement.lang = i18n.locale();
  document.title = `${t("提交支持工单")} | PalEcho`;
  document.querySelector(".support-detail-back").textContent = `← ${t("返回支持中心")}`;
  document.querySelector(".support-crumb a").textContent = t("官方技术支持");
  document.querySelector(".support-crumb span:last-child").textContent = t("提交支持工单");
  document.querySelector(".support-ticket-heading p").textContent = t("官方工单服务");
  document.querySelector(".support-ticket-heading h1").textContent = t("提交支持工单");
  document.querySelector(".support-ticket-heading span").textContent = t("请尽可能完整地描述问题，我们会根据你提供的信息尽快处理。");
  document.querySelectorAll(".support-ticket-status span").forEach((item, index) => { const labels = ["待处理", "处理中", "已回复", "已解决"]; item.lastChild.textContent = t(labels[index]); });
  document.querySelector(".support-ticket-form").querySelectorAll("label").forEach((label) => {
    const text = label.firstChild;
    if (text?.nodeType === Node.TEXT_NODE) text.textContent = t(text.textContent.trim());
  });
  document.querySelector("select").querySelectorAll("option").forEach((option) => { option.textContent = t(option.textContent); });
  document.querySelector(".support-form-note").textContent = t("请勿填写密码、支付验证码等敏感信息。提交即表示你同意我们使用上述信息处理本次支持请求。");
  document.querySelector(".support-primary").innerHTML = `${t("提交工单")} <span>→</span>`;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const number = `PE-202608-${String(Date.now()).slice(-4)}`;
    document.getElementById("ticket-view").innerHTML = `<section class="support-success"><div class="support-success-check">✓</div><p>${t("工单提交成功")}</p><h1>${t("我们已经收到你的问题")}</h1><span>${t("请保存下方编号，后续可用于查询处理进度。")}</span><div class="support-ticket-number">${number}</div><p style="margin-top:28px;color:#92958f;font-size:12px">${t("平均响应时间：15 分钟 · 服务时间：周一至周日 9:00–22:00")}</p><a class="support-primary" style="margin-top:27px" href="/support/">${t("返回支持中心")}</a></section>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
