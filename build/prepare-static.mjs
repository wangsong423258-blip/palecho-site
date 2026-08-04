import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { staticSourceFiles } from "../config/static-assets.mjs";

const root = process.cwd();
const output = resolve(root, "public");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(
  staticSourceFiles.map((file) =>
    copyFile(resolve(root, file), resolve(output, basename(file))),
  ),
);

const source = await readFile(resolve(root, "pages/index.html"), "utf8");
const introHtml = await readFile(resolve(root, "pages/intro.html"), "utf8");
const communityStart = source.indexOf("<!-- 社区与公益 -->");
const communityEnd = source.indexOf("<!-- 技术与能力 -->", communityStart);
const headEnd = source.indexOf("</head>") + "</head>".length;

if (communityStart < 0 || communityEnd < 0 || headEnd < 0) {
  throw new Error("Unable to prepare the standalone Community page.");
}

const homeHtml = (source.slice(0, communityStart) + source.slice(communityEnd))
  .replaceAll('href="/"', 'href="/home.html"');
const head = source
  .slice(0, headEnd)
  .replace("<title>PalEcho | The Next Sense</title>", "<title>Community | PalEcho</title>")
  .replace(
    "PalEcho 连接 Mira 的生命理解与 Echo 的数字陪伴，让真实宠物的健康、状态与成长始终与你靠近。",
    "PalEcho 官方社区生态：分享养宠经验、参与公益行动，找到值得信赖的专业支持。",
  );
const communityContent = source
  .slice(communityStart + "<!-- 社区与公益 -->".length, communityEnd)
  .replace('class="nav-section community-page"', 'class="community-page"');
const joinUsContent = await readFile(resolve(root, "pages/fragments/join-us-content.html"), "utf8");

const communityPage = `${head.replace("</head>", '<link rel="stylesheet" href="/page-return.css?v=20260731-1" />\n</head>')}
<body class="antialiased community-standalone">
<a class="page-return" href="/" aria-label="返回 PalEcho 首页"></a>
${communityContent}
<script src="/community-experience.js?v=20260731-3"></script>
</body>
</html>`;

const joinUsPage = `${head
  .replace("<title>PalEcho | The Next Sense</title>", "<title>加入我们 | PalEcho</title>")
  .replace('<meta name="theme-color" content="#ffffff" />', '<meta name="theme-color" content="#f5f5f1" />')
  .replace(
    "PalEcho 连接 Mira 的生命理解与 Echo 的数字陪伴，让真实宠物的健康、状态与成长始终与你靠近。",
    "加入 PalEcho，让科技与宠物生活同行。",
  )
  .replace('<meta property="og:title" content="PalEcho | The Next Sense" />', '<meta property="og:title" content="加入我们 | PalEcho" />')
  .replace('<meta property="og:description" content="Echo 映射真实宠物此刻的状态，让陪伴跨越距离，始终靠近。" />', '<meta property="og:description" content="加入 PalEcho，让科技与宠物生活同行。" />')
  .replace('<meta property="og:url" content="https://palecho.com" />', '<meta property="og:url" content="https://palecho.com/join-us.html" />')
  .replaceAll('https://palecho.com/og-pulse.png', 'https://palecho.com/og-join-us.png')
  .replace('<meta property="og:image:alt" content="Pulse — 让健康，一目了然。" />', '<meta property="og:image:alt" content="加入 PalEcho，让科技与宠物生活同行" />')
  .replace('<meta name="twitter:title" content="PalEcho | The Next Sense" />', '<meta name="twitter:title" content="加入我们 | PalEcho" />')
  .replace('<meta name="twitter:description" content="Echo 映射真实宠物此刻的状态，让陪伴跨越距离，始终靠近。" />', '<meta name="twitter:description" content="加入 PalEcho，让科技与宠物生活同行。" />')}
<body class="antialiased">
${joinUsContent}
</body>
</html>`;

await Promise.all([
  writeFile(resolve(output, "index.html"), introHtml),
  writeFile(resolve(output, "home.html"), homeHtml),
  writeFile(resolve(output, "community.html"), communityPage),
  writeFile(resolve(output, "join-us.html"), joinUsPage),
]);
