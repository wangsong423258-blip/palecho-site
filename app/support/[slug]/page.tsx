import { notFound } from "next/navigation";
import SupportArticleView from "./SupportArticleView";

type Article = {
  category: string;
  title: string;
  summary: string;
  steps: string[];
};

const articles: Record<string, Article> = {
  "smart-device": { category: "智能硬件设备", title: "智能硬件设备", summary: "查看设备连接、佩戴、充电及使用帮助。", steps: ["确认设备已经开机，并保持在手机附近。", "在 PalEcho 应用中打开蓝牙与附近设备权限。", "按照设备页面提示完成配对与首次同步。"] },
  "ai-health": { category: "AI 健康助手", title: "AI 健康助手", summary: "了解健康分析、异常提醒及报告功能。", steps: ["进入健康页面，确认设备数据已经完成同步。", "打开健康助手，选择需要了解的健康记录。", "健康分析仅作为日常管理参考，如有异常请及时寻求专业帮助。"] },
  "health-data": { category: "健康数据管理", title: "健康数据管理", summary: "查看数据同步、健康档案和历史记录。", steps: ["在健康快照中查看当日数据。", "进入健康档案，按日期回顾历史变化。", "数据未更新时，请先检查设备连接和同步状态。"] },
  "device-connection": { category: "常见问题", title: "设备无法连接怎么办？", summary: "从设备电量、蓝牙权限与网络环境开始排查。", steps: ["确认设备电量充足，并重新启动设备。", "检查手机蓝牙和 PalEcho 应用的相关权限。", "将设备放在手机附近，重新打开应用并尝试连接。", "仍然无法连接时，请提交支持工单并附上设备型号。"] },
  "missing-health-data": { category: "常见问题", title: "为什么没有健康数据？", summary: "检查设备佩戴、同步状态和账户绑定情况。", steps: ["确认设备已经正确佩戴，传感区域没有被遮挡。", "查看最近同步时间，保持网络连接并等待同步完成。", "确认当前账户与绑定设备时使用的账户一致。"] },
  "location-drift": { category: "常见问题", title: "定位出现偏差怎么办？", summary: "了解室内外环境对位置更新结果的影响。", steps: ["确认手机和设备已经获得定位权限。", "移动到开阔环境后等待位置重新更新。", "如果偏差持续出现，请记录时间和地点并提交工单。"] },
  "report-not-updated": { category: "常见问题", title: "健康报告没有更新怎么办？", summary: "确认数据已经同步，并检查报告生成时间。", steps: ["打开设备页面，确认最新数据已经完成同步。", "检查报告页面显示的生成时间，稍后重新进入页面。", "问题持续时，请提交工单并提供报告日期。"] },
  "battery-life": { category: "常见问题", title: "设备续航时间异常怎么办？", summary: "查看充电状态、使用环境与定位设置。", steps: ["清洁充电触点，并完成一次完整充电。", "检查是否开启持续定位或其他高频功能。", "记录异常发生时间与使用情况，必要时提交工单。"] },
  "account-login": { category: "常见问题", title: "账号无法登录怎么办？", summary: "通过登录方式、验证码和账户状态逐项确认。", steps: ["确认使用的是注册时的手机号或邮箱。", "检查验证码是否过期，并重新获取。", "仍无法登录时，请通过工单提供账户信息。"] },
  "membership-benefits": { category: "常见问题", title: "会员权益没有生效怎么办？", summary: "确认购买账户与当前登录账户保持一致。", steps: ["检查当前登录账户是否为完成购买的账户。", "在会员页面刷新权益状态。", "支付成功但权益仍未生效时，请附上订单信息提交工单。"] },
  "replace-device": { category: "常见问题", title: "设备更换后如何重新绑定？", summary: "先解除旧设备，再按照引导完成新设备绑定。", steps: ["在设备设置中解除旧设备绑定。", "让新设备保持开机并靠近手机。", "进入添加设备流程，根据页面提示完成绑定。"] },
};

const titles: Record<string, string> = {
  "digital-pet": "数字宠物功能",
  "store-orders": "商城与订单",
  "account-membership": "账户与会员",
  location: "定位与防丢",
  "system-update": "系统更新",
  "first-pairing": "首次绑定设备",
  "wear-device": "正确佩戴设备",
  "health-snapshot": "查看健康快照",
  "read-report": "阅读健康报告",
  "use-ai-health": "使用 AI 健康助手",
  "pet-profile": "创建宠物健康档案",
  geofence: "设置电子围栏",
  "manage-membership": "管理账户与会员",
  "ticket-status": "查询工单进度",
  feedback: "意见与建议",
  "service-policy": "服务说明",
  "update-2026-08": "Mira 功能升级",
  "update-2026-07": "健康快照功能上线",
  "update-2026-06": "新增设备支持",
  "data-encryption": "数据加密",
  privacy: "隐私保护",
  permissions: "权限管理",
  "cloud-sync": "云端同步",
  "data-export": "数据导出",
  "data-delete": "数据删除",
};

export function generateStaticParams() {
  return [...Object.keys(articles), ...Object.keys(titles)].map((slug) => ({ slug }));
}

export default async function SupportArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = titles[slug];
  const article = articles[slug] ?? (title ? {
    category: "官方支持内容",
    title,
    summary: `查看“${title}”相关的使用说明与解决方案。`,
    steps: ["打开 PalEcho 应用并进入对应功能页面。", "按照页面中的提示完成设置或检查。", "如果问题仍未解决，请提交支持工单。"],
  } : null);

  if (!article) notFound();

  return <SupportArticleView article={article} />;
}
