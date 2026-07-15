"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Folder from "./components/Folder";

type Project = {
  index: string;
  title: string;
  english: string;
  tagline: string;
  meta: string;
  period: string;
  image: string;
  altImage?: string;
  accent: string;
  overview: string;
  points: Array<[string, string]>;
};

const projects: Project[] = [
  {
    index: "01",
    title: "中国移动炫彩通话",
    english: "COLORFUL CALL",
    tagline: "让 AI 创作进入每一次通话",
    meta: "小程序搭建 · AIGC · 全链路体验",
    period: "2025.01—2026.04",
    image: "/project-color-call.png",
    accent: "#25a7f0",
    overview:
      "围绕新手门槛、创作体验与社交闭环，重构“探索—创作—分享—二次创作”的关键链路，并完成移动端视觉风格与页面规范。",
    points: [
      ["设计目标", "降低操作门槛、提升创作意愿、补全分享闭环"],
      ["我的职责", "体验策略、流程梳理、低/高保真原型、UI 规范与落地验收"],
      ["核心产出", "完整创作链路、移动端界面系统、开发协作与细节迭代"],
    ],
  },
  {
    index: "02",
    title: "蘑菇丁 APP 改版",
    english: "MOGUDING",
    tagline: "让实习求职更清晰、更高效",
    meta: "产品改版 · 求职体验 · 视觉系统",
    period: "2025.04—2025.09",
    image: "/project-moguding.png",
    accent: "#ff6a00",
    overview:
      "基于用户反馈与竞品分析，优化职位信息、企业信息和简历投递路径，并整理色彩、字体、图标与栅格规范，支持高保真方案落地。",
    points: [
      ["设计目标", "提高投递效率，增强信息可读性与简历完善意愿"],
      ["我的职责", "用户调研、链路规划、高保真原型、视觉升级与组件规范"],
      ["核心产出", "求职信息层级、职位可视化、活动专题与基础组件规则"],
    ],
  },
  {
    index: "03",
    title: "喵小甜 IP 全流程设计",
    english: "MIAO XIAOTIAN",
    tagline: "从角色语言到治愈系三维世界",
    meta: "IP 设计 · AIGC 场景 · 视觉叙事",
    period: "2025—2026",
    image: "/project-ip-scenes.png",
    altImage: "/project-ip-hero.png",
    accent: "#b8d56a",
    overview:
      "围绕亲和、探索与治愈感建立角色设定，并延展到厨房、森林与夜间秘境等场景，验证 IP 在多主题叙事与视觉传播中的一致性。",
    points: [
      ["设计目标", "塑造可识别、可延展、具有情绪陪伴感的原创角色"],
      ["我的职责", "角色设定、风格探索、场景构建、视觉叙事与输出整理"],
      ["核心产出", "角色视觉语言、三类核心场景、系列海报与延展方向"],
    ],
  },
];

const capabilities = [
  {
    number: "01",
    title: "研究与问题定义",
    text: "从用户反馈、竞品和业务目标中找到真正影响体验的节点，把模糊问题转化为可验证的设计目标。",
    tags: "用户调研 / 竞品分析 / 体验地图",
  },
  {
    number: "02",
    title: "交互原型与验证",
    text: "从信息架构到高保真原型，用真实任务反复校准流程、层级和关键反馈，让方案经得起使用。",
    tags: "流程设计 / Figma 原型 / 可用性验证",
  },
  {
    number: "03",
    title: "视觉系统与交付",
    text: "把色彩、字体、图标和组件整理为可执行规则，并与开发协作跟进还原度与持续迭代。",
    tags: "UI 规范 / 组件系统 / 开发协作",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const workListRef = useRef<HTMLDivElement>(null);
  const aboutShowcaseRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(0);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  function moveHero(event: ReactPointerEvent<HTMLElement>) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) {
      heroRef.current?.style.setProperty("--pointer-x", `${(event.clientX - rect.left) / rect.width - 0.5}`);
      heroRef.current?.style.setProperty("--pointer-y", `${(event.clientY - rect.top) / rect.height - 0.5}`);
    }
  }

  function movePreview(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = workListRef.current?.getBoundingClientRect();
    if (!rect) return;
    workListRef.current?.style.setProperty("--preview-x", `${event.clientX - rect.left}px`);
    workListRef.current?.style.setProperty("--preview-y", `${event.clientY - rect.top}px`);
  }

  useEffect(() => {
    const root = aboutShowcaseRef.current;
    if (!root || window.matchMedia("(hover: none)").matches) return;
    const you = root.querySelector<HTMLElement>(".cursor-you");
    const shiqi = root.querySelector<HTMLElement>(".cursor-shiqi");
    const entries = Array.from(root.querySelectorAll<HTMLElement>(".about-entry"));
    if (!you || !shiqi) return;

    you.style.left = shiqi.style.left = "0px";
    you.style.right = shiqi.style.right = "auto";
    you.style.top = shiqi.style.top = "0px";

    const size = () => ({ width: root.clientWidth, height: root.clientHeight });
    let box = size();
    let youTarget = { x: box.width * .78, y: 85 };
    let youCurrent = { ...youTarget };
    let shiqiTarget = { x: box.width * .63, y: 235 };
    let shiqiCurrent = { ...shiqiTarget };
    let previewActive = false;
    let frame = 0;

    const setDefaultShiqi = () => {
      box = size();
      shiqiTarget = { x: box.width * .63, y: 235 };
      previewActive = false;
    };
    const setSafeShiqi = () => {
      box = size();
      shiqiTarget = { x: box.width - 95, y: box.height - 62 };
      previewActive = true;
    };
    const setYouTargetFromPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      youTarget = {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      };
    };
    const onMove = (event: PointerEvent) => setYouTargetFromPointer(event);
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const exits = [
        { distance: Math.abs(x), target: { x: -86, y: Math.max(0, Math.min(rect.height, y)) } },
        { distance: Math.abs(rect.width - x), target: { x: rect.width + 86, y: Math.max(0, Math.min(rect.height, y)) } },
        { distance: Math.abs(y), target: { x: Math.max(0, Math.min(rect.width, x)), y: -48 } },
        { distance: Math.abs(rect.height - y), target: { x: Math.max(0, Math.min(rect.width, x)), y: rect.height + 48 } },
      ];
      exits.sort((a, b) => a.distance - b.distance);
      youTarget = exits[0].target;
    };
    const maybeResetShiqi = () => window.setTimeout(() => {
      const hovered = root.querySelector(".about-entry:hover");
      const focused = document.activeElement instanceof HTMLElement && document.activeElement.closest(".about-entry");
      if (!hovered && !focused) setDefaultShiqi();
    }, 0);
    const onResize = () => {
      box = size();
      if (!previewActive) shiqiTarget = { x: box.width * .63, y: 235 };
    };
    const animate = (time: number) => {
      youCurrent.x += (youTarget.x - youCurrent.x) * .16;
      youCurrent.y += (youTarget.y - youCurrent.y) * .16;
      shiqiCurrent.x += (shiqiTarget.x - shiqiCurrent.x) * .055;
      shiqiCurrent.y += (shiqiTarget.y - shiqiCurrent.y) * .055;
      you.style.transform = `translate3d(${youCurrent.x - 59}px, ${youCurrent.y - 27}px, 0)`;
      const floatX = Math.sin(time / 1150) * 9;
      const floatY = Math.cos(time / 1450) * 7;
      const rotate = Math.sin(time / 1700) * 1.2;
      shiqi.style.transform = `translate3d(${shiqiCurrent.x - 59 + floatX}px, ${shiqiCurrent.y - 27 + floatY}px, 0) rotate(${rotate}deg)`;
      frame = window.requestAnimationFrame(animate);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    entries.forEach((entry) => {
      entry.addEventListener("pointerenter", setSafeShiqi);
      entry.addEventListener("pointerleave", maybeResetShiqi);
      entry.addEventListener("focus", setSafeShiqi);
      entry.addEventListener("blur", maybeResetShiqi);
    });
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      entries.forEach((entry) => {
        entry.removeEventListener("pointerenter", setSafeShiqi);
        entry.removeEventListener("pointerleave", maybeResetShiqi);
        entry.removeEventListener("focus", setSafeShiqi);
        entry.removeEventListener("blur", maybeResetShiqi);
      });
    };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("3619554001@qq.com");
      showNotice("邮箱已复制，期待你的消息 ✦");
    } catch {
      window.location.href = "mailto:3619554001@qq.com";
    }
  }

  return (
    <main>
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="返回首页">
          WSQ<span>©26</span>
        </a>
        <nav aria-label="主导航">
          <a href="#about">关于</a>
          <a href="#experience">实习经历</a>
          <a href="#capabilities">能力</a>
          <a href="#contact">联系</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
          {menuOpen ? "关闭" : "菜单"}<i />
        </button>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        {[
          ["关于我", "#about"],
          ["实习经历", "#experience"],
          ["专业能力", "#capabilities"],
          ["联系我", "#contact"],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}<span>↗</span>
          </a>
        ))}
      </div>

      <section
        ref={heroRef}
        onPointerMove={moveHero}
        className="hero"
        id="top"
      >
        <div className="desk-collage desk-collage-left" aria-hidden="true">
          <img className="desk-object desk-paper desk-static" src="/desk-paper.png" alt="" />
          <img className="desk-object desk-lamp" src="/desk-lamp.png" alt="" />
          <img className="desk-object desk-note" src="/desk-note.png" alt="" />
          <img className="desk-object desk-notebook desk-static" src="/desk-notebook.png" alt="" />
          <img className="desk-object desk-pen" src="/desk-pen.png" alt="" />
          <img className="desk-object desk-coffee" src="/desk-coffee.png" alt="" />
          <img className="desk-object desk-film" src="/desk-film.png" alt="" />
          <img className="desk-object desk-lighter" src="/desk-lighter.png" alt="" />
          <img className="desk-object desk-cream" src="/desk-cream.png" alt="" />
        </div>
        <div className="desk-collage desk-collage-right">
          <img className="desk-object desk-cursor" src="/desk-cursor.png" alt="" aria-hidden="true" />
          <Folder
            className="desk-folder"
            color="#25A7F0"
            size={2}
            items={[
              <img key="after-effects" className="folder-app-icon" src="/folder-after-effects.png" alt="After Effects" />,
              <img key="codex" className="folder-app-icon" src="/folder-codex-clean.png" alt="Codex" />,
              <img key="figma" className="folder-app-icon" src="/folder-figma.png" alt="Figma" />,
            ]}
          />
          <img className="desk-object desk-toolbar" src="/desk-toolbar.png" alt="" aria-hidden="true" />
        </div>
        <button className="desk-object desk-record" onClick={() => showNotice("当前播放：专注与好奇心 ♫")} aria-label="播放案头唱片">
          <span className="desk-record-vinyl"><img src="/desk-record-card.png" alt="" /><img src="/desk-record-disc.png" alt="" /></span>
          <span className="desk-record-copy"><small>Souleance</small><strong>Jazz et thé vert</strong><span className="desk-record-line" /><small>1:30 / 3:32</small></span>
        </button>
        <div className="airdrop-card-live" aria-label="灵感投送卡片">
          <div className="airdrop-heading"><strong>灵感投送</strong><small>我想和你分享一张设计便签</small></div>
          <div className="airdrop-content">清晰 · 好用 · 有趣</div>
          <div className="airdrop-actions"><button type="button" onClick={() => showNotice("这份灵感会继续留在案头")}>暂不</button><button type="button" onClick={() => showNotice("已收到这份灵感投送 ✦")}>接收</button></div>
        </div>

        <div className="hero-copy">
          <p className="hero-eyebrow">UX / UI DESIGNER · 王诗琦</p>
          <h1>Shiqi Wang</h1>
          <p className="hero-statement">Product Design <i>Verb &amp; Noun</i></p>
          <p className="hero-intro">I care about how people use products,<br />and whether every detail can naturally spark delight.</p>
          <div className="hero-actions">
            <a href="#experience">查看实习经历 <span>↓</span></a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer">查看简历 ↗</a>
          </div>
        </div>

        <div className="hero-status"><i /> 现居长春 · 寻找 UX / UI 机会</div>
        <a className="scroll-hint" href="#about">SCROLL TO EXPLORE <span>↓</span></a>
      </section>

      <section className="about" id="about">
        <div className="about-cooking about-shell">
          <h2>Currently cooking <span>☺</span></h2>
          <p>
            正在把观察、原型与视觉，慢慢煮成
            <b>让人愿意使用的体验</b>。
          </p>
          <small>你好，我是王诗琦，一名关注真实反馈与细节温度的 UX / UI 设计师。</small>
        </div>

        <div className="about-recent about-shell">
          <h2>Recently Made <span>▶</span><small>最近做过的事</small></h2>
          <div className="about-showcase" ref={aboutShowcaseRef}>
            <div className="about-list">
              <article className="about-entry" tabIndex={0} style={{ "--row-accent": "#25a7f0" } as CSSProperties}>
                <img className="about-entry-icon" src="/work-color-call.png" alt="炫彩通话项目缩略图" />
                <div><strong>炫彩通话小程序搭建</strong><span>UX / UI 设计实习 · 产品体验与界面优化</span></div>
                <figure className="about-entry-preview"><img src="/project-color-call.png" alt="炫彩通话小程序项目预览" /><figcaption>从需求理解到高保真交付，持续校准产品体验。</figcaption></figure>
              </article>
              <article className="about-entry" tabIndex={0} style={{ "--row-accent": "#ff7a1a" } as CSSProperties}>
                <img className="about-entry-icon" src="/work-moguding.png" alt="蘑菇丁项目缩略图" />
                <div><strong>蘑菇丁 APP 改版升级</strong><span>设计实践 · 信息梳理、原型与视觉呈现</span></div>
                <figure className="about-entry-preview"><img src="/project-moguding.png" alt="蘑菇丁 APP 改版项目预览" /><figcaption>把复杂信息整理成更清晰、更容易行动的界面。</figcaption></figure>
              </article>
              <article className="about-entry" tabIndex={0} style={{ "--row-accent": "#f3a9cf" } as CSSProperties}>
                <img className="about-entry-icon" src="/profile-source.png" alt="个人学习与设计记录" />
                <div><strong>长春理工大学</strong><span>视觉传达设计 · 本科 · 2023—2027</span></div>
                <figure className="about-entry-preview about-entry-preview-profile"><img src="/profile-source.png" alt="王诗琦个人照片" /><figcaption>视觉传达训练，让表达、秩序与细节成为设计习惯。</figcaption></figure>
              </article>
              <article className="about-entry" tabIndex={0} style={{ "--row-accent": "#b7d95a" } as CSSProperties}>
                <img className="about-entry-icon" src="/work-ip.png" alt="喵小甜 IP 项目缩略图" />
                <div><strong>喵小甜 IP 全链路设计</strong><span>AI × 产品体验 · 角色、场景与交互表达</span></div>
                <figure className="about-entry-preview"><img src="/project-ip-scenes.png" alt="喵小甜 IP 全链路设计预览" /><figcaption>持续尝试让新技术拥有更亲和、更有温度的表达。</figcaption></figure>
              </article>
            </div>
            <div className="about-cursors" aria-hidden="true">
              <span className="cursor-you"><i />You</span>
              <span className="cursor-shiqi"><i />Shiqi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="experience section-pad" id="experience">
        <div className="section-label"><span>02</span> EXPERIENCE / 实习经历</div>
        <div className="experience-head">
          <h2>在真实业务中，<br />让设计产生结果。</h2>
          <p>从用户问题、产品链路到视觉规范，我参与完整设计过程，也持续用数据验证方案是否真正有效。</p>
        </div>

        <div className="experience-list">
          <article className="experience-card">
            <header>
              <div><small>01 / 互联网 · 电子商务</small><h3>上海掌淘网络科技有限公司</h3><p>UI 设计实习生 · 设计部</p></div>
              <div className="experience-meta"><span>2025.04—2025.09</span><span>上海</span></div>
            </header>
            <div className="experience-body">
              <ol className="experience-notes">
                <li>参与蘑菇丁 App 的竞品分析与用户调研，围绕用户活跃、简历完善和投递意愿规划页面逻辑与视觉风格。</li>
                <li>负责产品视觉设计，建立色彩、字体与图标库规范，并协同开发完成高保真原型落地。</li>
                <li>针对“不知如何填写、不敢投递”的痛点，将简历流程改为分步引导、预填示例与实时激励反馈。</li>
              </ol>
              <aside className="experience-results">
                <p>WORK RESULTS / 工作成果</p>
                <div className="metric-grid">
                  <div className="metric metric-primary"><strong>42%→76%</strong><span>简历完整填写率</span></div>
                  <div className="metric"><strong>25%→8%</strong><span>单页放弃率</span></div>
                  <div className="metric"><strong>−60%</strong><span>平均填写时长</span></div>
                  <div className="metric metric-dark"><strong>21.38%→37.56%</strong><span>简历投递率 · +16.18 个百分点</span></div>
                </div>
              </aside>
            </div>
          </article>

          <article className="experience-card experience-card-alt">
            <header>
              <div><small>02 / 通信 · 数字体验</small><h3>重庆艾瑞数智科技有限公司</h3><p>UX 设计实习生 · 通信与传媒事业部</p></div>
              <div className="experience-meta"><span>2026.01—2026.04</span><span>浙江</span></div>
            </header>
            <div className="experience-body">
              <ol className="experience-notes">
                <li>参与炫彩通话小程序全链路体验设计，从体验策略到 UI / UX 关键方案输出。</li>
                <li>主导“探索—创作—分享—二次创作”链路闭环分析与优化，负责移动端 UI 与规范制定。</li>
                <li>建立色彩、字体和圆角规则，保证设计一致性，并支持团队后续复用与持续迭代。</li>
              </ol>
              <aside className="experience-results">
                <p>WORK RESULTS / 工作成果</p>
                <div className="metric-grid metric-grid-three">
                  <div className="metric metric-primary"><strong>35%</strong><span>用户七日留存率</span></div>
                  <div className="metric"><strong>30%</strong><span>用户作品分享率</span></div>
                  <div className="metric metric-dark"><strong>76%</strong><span>创作完成率 · 高于预期 16%</span></div>
                </div>
              </aside>
            </div>
          </article>
        </div>
      </section>

      <section className="capabilities section-pad" id="capabilities">
        <div className="section-label"><span>03</span> CAPABILITIES / 专业能力</div>
        <div className="capabilities-head">
          <h2>从问题出发，<br />把方案推向完成。</h2>
          <p>研究、原型与视觉不是三段孤立流程，而是一组持续校准方向的方法。</p>
        </div>
        <div className="capability-cards">
          {capabilities.map((item, index) => (
            <article key={item.number} style={{ "--tilt": `${[-2, 1.4, -1][index]}deg` } as CSSProperties}>
              <small>{item.number}</small><h3>{item.title}</h3><p>{item.text}</p><span>{item.tags}</span><i>↗</i>
            </article>
          ))}
        </div>
      </section>

      <footer className="contact" id="contact">
        <div className="section-label light"><span>04</span> CONTACT / 联系</div>
        <div className="contact-main"><p>如果你也在认真打磨一个产品，</p><h2>我们聊聊。</h2></div>
        <button className="email" onClick={copyEmail}>3619554001@qq.com <span>↗</span></button>
        <div className="contact-meta">
          <div><small>PHONE / WECHAT</small><a href="tel:19956642163">199 5664 2163</a></div>
          <div><small>LOCATION</small><p>吉林省长春市</p></div>
          <div><small>STATUS</small><p>寻找 UX / UI 设计机会</p></div>
          <a href="#top">回到顶部 ↑</a>
        </div>
        <div className="footer-signature">Shiqi Wang</div>
      </footer>

      <div className={`notice ${notice ? "show" : ""}`} role="status">{notice}</div>
    </main>
  );
}
