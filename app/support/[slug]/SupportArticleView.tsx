"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredLocale, localeNames, supportLocales, SupportLocale, translate } from "../i18n";

type Article = {
  category: string;
  title: string;
  summary: string;
  steps: string[];
};

export default function SupportArticleView({ article }: { article: Article }) {
  const [locale, setLocale] = useState<SupportLocale>("zh-CN");

  useEffect(() => {
    const syncLocale = () => setLocale(getStoredLocale());
    syncLocale();
    window.addEventListener("palecho-language-change", syncLocale);
    return () => window.removeEventListener("palecho-language-change", syncLocale);
  }, []);

  const tr = (value: string) => translate(locale, value);
  const setLanguage = (next: SupportLocale) => {
    window.localStorage.setItem("palecho_lang", next);
    setLocale(next);
    window.dispatchEvent(new Event("palecho-language-change"));
  };

  return (
    <main className="article-page">
      <header className="site-nav article-nav">
        <Link className="brand" href="/">PalEcho</Link>
        <Link className="article-back" href="/">← {tr("返回支持中心")}</Link>
        <div className="support-nav-actions">
          <select className="support-language" aria-label="Language" value={locale} onChange={(event) => setLanguage(event.target.value as SupportLocale)}>
            {supportLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
          </select>
          <Link className="nav-ticket" href="/support/ticket">{tr("提交工单")} <span className="arrow">→</span></Link>
        </div>
      </header>

      <div className="article-shell">
        <div className="breadcrumbs"><Link href="/">{tr("官方技术支持")}</Link><span>/</span><span>{tr(article.category)}</span></div>
        <article className="article-card">
          <div className="article-label"><span>{tr("官方解决方案")}</span><span>{tr("最近更新：2026.08")}</span></div>
          <div className="article-heading">
            <p>{tr(article.category)}</p>
            <h1>{tr(article.title)}</h1>
            <span>{tr(article.summary)}</span>
          </div>
          <div className="article-content">
            <h2>{tr("解决步骤")}</h2>
            <ol>
              {article.steps.map((step, index) => (
                <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{tr(step)}</p></li>
              ))}
            </ol>
          </div>
          <aside className="article-help">
            <div><strong>{tr("仍然需要帮助？")}</strong><span>{tr("提交工单并描述遇到的情况，我们会继续协助你。")}</span></div>
            <Link className="primary-button" href="/support/ticket">{tr("提交支持工单")} <span className="arrow">→</span></Link>
          </aside>
        </article>
      </div>
    </main>
  );
}
