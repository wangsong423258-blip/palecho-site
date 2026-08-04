(() => {
  const i18n = window.PalEchoSupportI18n || { t: (value) => value, locale: () => "zh-CN" };
  const t = (value) => i18n.t(value);
  const data = {
    "smart-device": ["智能硬件设备", "查看设备连接、佩戴、充电及使用帮助。", "支持范围", ["确认设备已经开机，并保持在手机附近。", "在 PalEcho 应用中打开蓝牙与附近设备权限。", "按照设备页面提示完成配对与首次同步。"]],
    "device-connection": ["设备无法连接怎么办？", "从设备电量、蓝牙权限与网络环境开始排查。", "常见问题", ["确认设备电量充足，并重新启动设备。", "检查手机蓝牙和 PalEcho 应用的相关权限。", "将设备放在手机附近，重新打开应用并尝试连接。", "仍然无法连接时，请提交支持工单并附上设备型号。"]],
    "missing-health-data": ["为什么没有健康数据？", "检查设备佩戴、同步状态和账户绑定情况。", "常见问题", ["确认设备已经正确佩戴，传感区域没有被遮挡。", "查看最近同步时间，保持网络连接并等待同步完成。", "确认当前账户与绑定设备时使用的账户一致。"]],
    "location-drift": ["定位出现偏差怎么办？", "了解室内外环境对位置更新结果的影响。", "常见问题", ["确认手机和设备已经获得定位权限。", "移动到开阔环境后等待位置重新更新。", "如果偏差持续出现，请记录时间和地点并提交工单。"]],
    "battery-life": ["设备续航时间异常怎么办？", "查看充电状态、使用环境与定位设置。", "常见问题", ["清洁充电触点，并完成一次完整充电。", "检查是否开启持续定位或其他高频功能。", "记录异常发生时间与使用情况，必要时提交工单。"]]
  };
  const key = new URLSearchParams(location.search).get("article");
  const fallback = ["帮助内容", "查看该功能的使用说明与解决方案。", "官方支持内容", ["打开 PalEcho 应用并进入对应功能页面。", "按照页面中的提示完成设置或检查。", "如果问题仍未解决，请提交支持工单。"]];
  const item = data[key] || fallback;
  document.documentElement.lang = i18n.locale();
  document.title = `${t(item[0])} | PalEcho`;
  document.querySelector(".support-detail-back").textContent = `← ${t("返回支持中心")}`;
  document.querySelector(".support-crumb a").textContent = t("官方技术支持");
  document.getElementById("article-category").textContent = t(item[2]);
  document.getElementById("article-category-label").textContent = t(item[2]);
  document.getElementById("article-title").textContent = t(item[0]);
  document.getElementById("article-summary").textContent = t(item[1]);
  document.querySelector(".support-detail-label span:first-child").textContent = t("官方解决方案");
  document.querySelector(".support-detail-label span:last-child").textContent = t("最近更新：2026.08");
  document.querySelector(".support-steps h2").textContent = t("解决步骤");
  document.querySelector(".support-detail-help strong").textContent = t("仍然需要帮助？");
  document.querySelector(".support-detail-help span").textContent = t("提交工单并描述遇到的情况，我们会继续协助你。");
  const ticket = document.querySelector(".support-primary"); if (ticket) ticket.innerHTML = `${t("提交支持工单")} <span>→</span>`;
  document.querySelector("#article-steps").innerHTML = item[3].map((step, i) => `<li><b>${String(i + 1).padStart(2, "0")}</b><p>${t(step)}</p></li>`).join("");
})();
