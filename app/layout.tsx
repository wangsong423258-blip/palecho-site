import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://palecho-mira.beifengchuixue.chatgpt.site"),
  title: "官方技术支持 | PalEcho",
  description: "PalEcho 官方帮助与支持中心，快速查找设备、健康数据、账户及平台服务的使用帮助。",
  openGraph: {
    title: "官方技术支持 | PalEcho",
    description: "快速查找设备、健康数据、账户及平台服务的使用帮助。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/support-og.png", width: 1728, height: 904, alt: "PalEcho 官方技术支持" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "官方技术支持 | PalEcho",
    description: "快速查找设备、健康数据、账户及平台服务的使用帮助。",
    images: ["/support-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
