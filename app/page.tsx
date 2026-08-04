"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getStoredLocale, localeNames, supportLocales, SupportLocale, translate } from "./support/i18n";

type Item = {
  title: string;
  description: string;
  slug: string;
  icon: string;
  meta?: string;
  badge?: string;
  primary?: boolean;
};

type Section = {
  id: string;
  label: string;
  icon: string;
  title: string;
  description: string;
  type: "cards" | "questions" | "updates";
  items: Item[];
};

const sections: Section[] = [
  {
    id: "scope", label: "支持范围", icon: "◌", title: "支持范围",
    description: "PalEcho 为用户提供覆盖设备、数据、账户及平台服务的官方支持。", type: "cards",
    items: [
      { title: "智能硬件设备", description: "查看设备连接、佩戴、充电及使用帮助。", slug: "smart-device", icon: "⌁" },
      { title: "健康助手", description: "了解健康分析、异常提醒及报告功能。", slug: "ai-health", icon: "✦" },
      { title: "健康数据管理", description: "查看数据同步、健康档案和历史记录。", slug: "health-data", icon: "◒" },
      { title: "数字宠物功能", description: "了解陪伴互动、状态记录与日常功能。", slug: "digital-pet", icon: "◎" },
      { title: "商城与订单", description: "处理订单查询、配送与售后相关问题。", slug: "store-orders", icon: "□" },
      { title: "账户与会员", description: "管理登录信息、会员权益与账户设置。", slug: "account-membership", icon: "○" },
      { title: "定位与防丢", description: "查看定位权限、电子围栏与防丢帮助。", slug: "location", icon: "⌖" },
      { title: "系统更新", description: "了解版本更新、功能变化与使用要求。", slug: "system-update", icon: "↻" },
    ],
  },
  {
    id: "faq", label: "常见问题", icon: "?", title: "常见问题",
    description: "快速查看用户最常遇到的问题。", type: "questions",
    items: [
      { title: "设备无法连接怎么办？", description: "从设备电量、蓝牙权限与网络环境开始排查。", slug: "device-connection", icon: "" },
      { title: "为什么没有健康数据？", description: "检查佩戴、同步状态和账户绑定情况。", slug: "missing-health-data", icon: "" },
      { title: "定位出现偏差怎么办？", description: "了解定位权限与室内外环境的影响。", slug: "location-drift", icon: "" },
      { title: "健康报告没有更新怎么办？", description: "确认同步状态和报告生成时间。", slug: "report-not-updated", icon: "" },
      { title: "设备续航时间异常怎么办？", description: "查看充电状态、使用环境与定位设置。", slug: "battery-life", icon: "" },
      { title: "账号无法登录怎么办？", description: "通过登录方式、验证码和账户状态逐项确认。", slug: "account-login", icon: "" },
      { title: "会员权益没有生效怎么办？", description: "确认购买账户与当前登录账户保持一致。", slug: "membership-benefits", icon: "" },
      { title: "设备更换后如何重新绑定？", description: "先解除旧设备，再按照引导完成新设备绑定。", slug: "replace-device", icon: "" },
    ],
  },
  {
    id: "guides", label: "操作指南", icon: "≡", title: "操作指南",
    description: "从首次使用到日常管理，快速了解 PalEcho 的主要功能。", type: "cards",
    items: [
      { title: "首次绑定设备", description: "完成设备开机、配对与首次同步。", slug: "first-pairing", icon: "01", meta: "约 2 分钟" },
      { title: "正确佩戴设备", description: "了解合适的佩戴位置与日常检查。", slug: "wear-device", icon: "02", meta: "约 2 分钟" },
      { title: "查看健康快照", description: "快速了解宠物当日的状态变化。", slug: "health-snapshot", icon: "03", meta: "约 3 分钟" },
      { title: "阅读健康报告", description: "掌握报告中重点信息的查看方式。", slug: "read-report", icon: "04", meta: "约 3 分钟" },
      { title: "使用健康助手", description: "了解健康分析与日常提醒功能。", slug: "use-ai-health", icon: "05", meta: "约 2 分钟" },
      { title: "创建宠物健康档案", description: "建立完整、连续的健康记录。", slug: "pet-profile", icon: "06", meta: "约 3 分钟" },
      { title: "设置电子围栏", description: "为常用活动区域添加安全提醒。", slug: "geofence", icon: "07", meta: "约 2 分钟" },
      { title: "管理账户与会员", description: "查看账户设置和会员权益。", slug: "manage-membership", icon: "08", meta: "约 2 分钟" },
    ],
  },
  {
    id: "online", label: "在线支持", icon: "✉", title: "在线支持",
    description: "通过官方渠道提交问题并获得帮助。", type: "cards",
    items: [
      { title: "提交支持工单", description: "描述问题并上传相关图片，我们会尽快处理。", slug: "ticket", icon: "↗", primary: true },
      { title: "查询工单进度", description: "通过工单编号查看当前处理状态。", slug: "ticket-status", icon: "⌕" },
      { title: "意见与建议", description: "向 PalEcho 提交产品建议和使用反馈。", slug: "feedback", icon: "✎" },
      { title: "服务说明", description: "查看服务时间、响应规则及支持范围。", slug: "service-policy", icon: "ℹ" },
    ],
  },
  {
    id: "updates", label: "升级与维护", icon: "↻", title: "升级与维护",
    description: "查看最新版本、功能更新及维护安排。", type: "updates",
    items: [
      { title: "健康助手功能升级", description: "优化健康分析体验与提醒呈现方式。", slug: "update-2026-08", icon: "2026.08", badge: "功能更新" },
      { title: "健康快照功能上线", description: "支持更清晰地回顾每日健康状态。", slug: "update-2026-07", icon: "2026.07", badge: "功能更新" },
      { title: "新增设备支持", description: "更多设备已支持连接与健康数据同步。", slug: "update-2026-06", icon: "2026.06", badge: "维护公告" },
    ],
  },
  {
    id: "security", label: "数据安全", icon: "◇", title: "数据安全",
    description: "了解 PalEcho 如何保护设备数据、健康信息与账户安全。", type: "cards",
    items: [
      { title: "数据加密", description: "设备与平台之间的数据传输采用安全加密机制。", slug: "data-encryption", icon: "◇" },
      { title: "隐私保护", description: "清楚说明数据用途，并由用户自主决定授权。", slug: "privacy", icon: "◐" },
      { title: "权限管理", description: "用户可管理设备、账户及数据访问权限。", slug: "permissions", icon: "⊙" },
      { title: "云端同步", description: "查看不同设备间的健康记录同步说明。", slug: "cloud-sync", icon: "☁" },
      { title: "数据导出", description: "按需要申请导出个人和宠物相关数据。", slug: "data-export", icon: "↓" },
      { title: "数据删除", description: "用户可以申请删除账户及相关数据。", slug: "data-delete", icon: "×" },
    ],
  },
];

const localizeSections = (locale: SupportLocale): Section[] => sections.map((section) => ({
  ...section,
  label: translate(locale, section.label),
  title: translate(locale, section.title),
  description: translate(locale, section.description),
  items: section.items.map((item) => ({
    ...item,
    title: translate(locale, item.title),
    description: translate(locale, item.description),
    meta: item.meta ? translate(locale, item.meta) : item.meta,
    badge: item.badge ? translate(locale, item.badge) : item.badge,
  })),
}));

function SupportIcon({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`support-icon ${className}`} aria-hidden="true">{children}</span>;
}

function ItemLink({ item, style }: { item: Item; style: "card" | "question" | "update" }) {
  const href = item.slug === "ticket" ? "/support/ticket" : `/support/${item.slug}`;
  return (
    <Link href={href} className={`support-item support-item--${style} ${item.primary ? "is-primary" : ""}`}>
      {style === "update" ? <time>{item.icon}</time> : item.icon && <SupportIcon className={style === "card" && item.meta ? "step-icon" : ""}>{item.icon}</SupportIcon>}
      <span className="support-item-copy">
        {item.badge && <small className="update-badge">{item.badge}</small>}
        <strong>{item.title}</strong>
        <em>{item.description}</em>
        {item.meta && <small>{item.meta}</small>}
      </span>
      <span className="item-arrow" aria-hidden="true">→</span>
    </Link>
  );
}

export default function SupportHomePage() {
  const [active, setActive] = useState("scope");
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState<SupportLocale>("zh-CN");
  const localizedSections = useMemo(() => localizeSections(locale), [locale]);
  const current = localizedSections.find((section) => section.id === active) ?? localizedSections[0];

  useEffect(() => {
    const syncLocale = () => setLocale(getStoredLocale());
    syncLocale();
    window.addEventListener("palecho-language-change", syncLocale);
    return () => window.removeEventListener("palecho-language-change", syncLocale);
  }, []);

  const setLanguage = (next: SupportLocale) => {
    window.localStorage.setItem("palecho_lang", next);
    setLocale(next);
    window.dispatchEvent(new Event("palecho-language-change"));
  };

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return localizedSections.flatMap((section) => section.items.map((item) => ({ ...item, category: section.label }))).filter((item) => `${item.title}${item.description}${item.category}`.toLowerCase().includes(keyword)).slice(0, 5);
  }, [localizedSections, query]);

  return (
    <main className="support-page">
      <header className="site-nav" aria-label={translate(locale, "网站导航")}>
        <Link className="brand" href="/">PalEcho</Link>
        <nav className="site-nav-links" aria-label={translate(locale, "主导航")}>
          <a href="/index.html#products">{translate(locale, "产品")}</a>
          <a href="/index.html#technology">{translate(locale, "技术与能力")}</a>
          <a href="/index.html#about">{translate(locale, "关于我们")}</a>
          <a className="is-current" href="#support">{translate(locale, "帮助中心")}</a>
        </nav>
        <div className="support-nav-actions">
          <select className="support-language" aria-label="Language" value={locale} onChange={(event) => setLanguage(event.target.value as SupportLocale)}>
            {supportLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
          </select>
          <Link className="nav-ticket" href="/support/ticket">{translate(locale, "提交工单")} <span>→</span></Link>
        </div>
      </header>

      <section className="support-hero" aria-labelledby="support-title">
        <p className="support-eyebrow">{translate(locale, "官方帮助中心")}</p>
        <h1 id="support-title">{translate(locale, "官方技术支持")}</h1>
        <p className="support-intro">{translate(locale, "查找设备、健康数据、账户、服务及系统相关的使用帮助。")}</p>
        <div className="search-wrap">
          <label className="support-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={translate(locale, "搜索帮助内容，例如：设备连接、健康报告、定位异常……")} aria-label={translate(locale, "搜索帮助内容")} />
            {query && <button type="button" onClick={() => setQuery("")} aria-label={translate(locale, "清除搜索")}>×</button>}
          </label>
          {query && (
            <div className="search-results" aria-live="polite">
              {results.length ? results.map((item) => <Link key={item.slug} href={item.slug === "ticket" ? "/support/ticket" : `/support/${item.slug}`} className="search-result">
                <span><small>{item.category}</small><strong>{item.title}</strong><em>{item.description}</em></span><i>→</i>
              </Link>) : <p>{translate(locale, "暂未找到匹配内容，请尝试更换关键词或提交支持工单。")}</p>}
            </div>
          )}
        </div>
      </section>

      <section className="support-directory" id="support" aria-labelledby="directory-title">
        <div className="section-intro">
          <p className="support-eyebrow">{translate(locale, "帮助目录")}</p>
          <h2 id="directory-title">{translate(locale, "查找支持内容")}</h2>
          <p>{translate(locale, "选择一个分类，查看对应的帮助与解决方案。")}</p>
        </div>
        <div className="support-layout">
          <nav className="support-tabs" aria-label={translate(locale, "支持内容分类")} role="tablist">
            {localizedSections.map((section) => <button key={section.id} type="button" role="tab" aria-selected={section.id === active} className={section.id === active ? "is-active" : ""} onClick={() => setActive(section.id)}>
              <SupportIcon>{section.icon}</SupportIcon><span>{section.label}</span>
            </button>)}
          </nav>
          <section className="support-panel" role="tabpanel" aria-label={current.label} key={current.id}>
            <header className="panel-header"><p>{current.label}</p><h2>{current.title}</h2><span>{current.description}</span></header>
            <div className={`support-items support-items--${current.type}`}>
              {current.items.map((item) => <ItemLink key={item.slug} item={item} style={current.type === "questions" ? "question" : current.type === "updates" ? "update" : "card"} />)}
            </div>
          </section>
        </div>
      </section>

      <section className="support-cta" aria-labelledby="cta-title">
        <p className="support-eyebrow">{translate(locale, "官方工单服务")}</p>
        <h2 id="cta-title">{translate(locale, "没有找到需要的内容？")}</h2>
        <p>{translate(locale, "如果仍未解决您的问题，我们随时为您提供帮助。")}</p>
        <Link className="ticket-button" href="/support/ticket"><SupportIcon>□</SupportIcon>{translate(locale, "提交支持工单")} <span>→</span></Link>
        <div className="service-notes"><span>{translate(locale, "平均响应时间：15 分钟")}</span><i /><span>{translate(locale, "服务时间：周一至周日 9:00–22:00")}</span></div>
      </section>
    </main>
  );
}
