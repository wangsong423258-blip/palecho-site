"use client";

import { FormEvent, useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { getStoredLocale, localeNames, supportLocales, SupportLocale, translate } from "../i18n";

export default function TicketPage() {
  const [ticketNumber, setTicketNumber] = useState("");
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

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suffix = String(Date.now()).slice(-4);
    setTicketNumber(`PE-202608-${suffix}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="article-page">
      <header className="site-nav article-nav">
        <Link className="brand" href="/">PalEcho</Link>
        <Link className="article-back" href="/">← {tr("返回支持中心")}</Link>
        <div className="support-nav-actions">
          <select className="support-language" aria-label="Language" value={locale} onChange={(event) => setLanguage(event.target.value as SupportLocale)}>
            {supportLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
          </select>
        </div>
      </header>

      <div className="ticket-shell">
        <div className="breadcrumbs"><Link href="/">{tr("官方技术支持")}</Link><span>/</span><span>{tr("提交支持工单")}</span></div>
        {!ticketNumber ? (
          <section className="ticket-card">
            <div className="ticket-heading">
              <p>{tr("官方工单服务")}</p>
              <h1>{tr("提交支持工单")}</h1>
              <span>{tr("请尽可能完整地描述问题，我们会根据你提供的信息尽快处理。")}</span>
            </div>

            <div className="ticket-status" aria-label={tr("工单处理状态")}>
              {["待处理", "处理中", "已回复", "已解决"].map((status, index) => (
                <span key={status}><i>{String(index + 1).padStart(2, "0")}</i>{tr(status)}</span>
              ))}
            </div>

            <form onSubmit={submitTicket}>
              <div className="form-grid">
                <label>
                  <span>{tr("问题类型")}</span>
                  <select required defaultValue="">
                    <option value="" disabled>{tr("请选择问题类型")}</option>
                    <option>{tr("设备使用")}</option>
                    <option>{tr("健康数据")}</option>
                    <option>{tr("账户与会员")}</option>
                    <option>{tr("商城与订单")}</option>
                    <option>{tr("系统服务")}</option>
                    <option>{tr("其他问题")}</option>
                  </select>
                </label>
                <label>
                  <span>{tr("问题标题")}</span>
                  <input required placeholder={tr("请用一句话概括遇到的问题")} />
                </label>
              </div>
              <label>
                <span>{tr("问题描述")}</span>
                <textarea required rows={7} placeholder={tr("请描述问题发生的时间、操作步骤和当前情况")} />
              </label>
              <div className="form-grid">
                <label><span>{tr("设备型号（可选）")}</span><input placeholder={tr("例如：Pulse 01")} /></label>
                <label><span>{tr("账户信息（可选）")}</span><input placeholder={tr("手机号或邮箱")} /></label>
              </div>
              <label className="upload-field">
                <span>{tr("上传图片或视频（可选）")}</span>
                <input type="file" accept="image/*,video/*" multiple />
                <small>{tr("支持上传问题截图或相关视频，便于我们快速了解情况。")}</small>
              </label>
              <label>
                <span>{tr("联系方式")}</span>
                <input required placeholder={tr("方便我们回复你的手机号或邮箱")} />
              </label>
              <p className="form-note">{tr("请勿填写密码、支付验证码等敏感信息。提交即表示你同意我们使用上述信息处理本次支持请求。")}</p>
              <button className="primary-button ticket-submit" type="submit">{tr("提交工单")} <span className="arrow">→</span></button>
            </form>
          </section>
        ) : (
          <section className="ticket-card ticket-success">
            <span className="success-check" aria-hidden="true">✓</span>
            <p>{tr("工单提交成功")}</p>
            <h1>{tr("我们已经收到你的问题")}</h1>
            <span>{tr("请保存下方编号，后续可用于查询处理进度。")}</span>
            <div className="ticket-number">{ticketNumber}</div>
            <div className="current-status"><i /> {tr("当前状态：待处理")}</div>
            <p className="response-time">{tr("平均响应时间：15 分钟 · 服务时间：周一至周日 9:00–22:00")}</p>
            <Link className="secondary-button" href="/">{tr("返回支持中心")}</Link>
          </section>
        )}
      </div>
    </main>
  );
}
