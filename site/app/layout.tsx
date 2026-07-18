import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "王诗琦｜UX / UI 设计师作品集",
  description:
    "王诗琦的 UX / UI 设计作品集，包含中国移动炫彩通话小程序、蘑菇丁 APP 改版与喵小甜 IP 全流程设计。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
