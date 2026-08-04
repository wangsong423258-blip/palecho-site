import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const MIMO_API_KEY = process.env.MIMO_API_KEY || "";
const MIMO_BASE_URL =
  process.env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1";
const MIMO_MODEL = process.env.MIMO_MODEL || "mimo-v2-pro";

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || "";
const DASHSCOPE_BASE_URL =
  process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/api/v1";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen-plus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const frontendHtml = path.join(
  projectRoot,
  "pages",
  "legacy",
  "PalEcho_website.html",
);
const uploadsDir = path.join(__dirname, "uploads");
const frontendDirectories = [
  path.join(projectRoot, "pages", "standalone"),
  path.join(projectRoot, "pages", "support"),
  path.join(projectRoot, "styles"),
  path.join(projectRoot, "scripts"),
  path.join(projectRoot, "assets", "images"),
  path.join(projectRoot, "assets", "icons"),
];
const brandAssets = [
  "favicon.ico",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "site.webmanifest",
];

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use("/uploads", express.static(uploadsDir));
frontendDirectories.forEach((directory) => {
  app.use(express.static(directory, { index: false }));
  app.use("/static", express.static(directory, { index: false }));
});
brandAssets.forEach((asset) => {
  app.get(`/${asset}`, (_req, res) => {
    res.sendFile(path.join(projectRoot, "assets", "icons", asset));
  });
});

const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "db.json");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
  sections: [],
  blocks: [],
  media: [],
  faqs: [],
  jobs: [],
  milestones: [],
  announcements: [],
  contacts: [],
};

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, defaultData);

async function loadDb() {
  await db.read();
  db.data ||= { ...defaultData };
}

async function saveDb() {
  await db.write();
}

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN is not set" });
  }
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";
  const token = bearer || req.headers["x-admin-token"] || "";
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

function buildUserContent({ question, profile, metrics, context }) {
  const blocks = [];

  if (profile && typeof profile === "object") {
    blocks.push(`用户画像：${JSON.stringify(profile)}`);
  }
  if (metrics && typeof metrics === "object") {
    blocks.push(`健康指标：${JSON.stringify(metrics)}`);
  }
  if (context && typeof context === "string") {
    blocks.push(`补充背景：${context}`);
  }

  blocks.push(`问题：${question}`);

  return blocks.join("\n");
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function withBlocks(sections, blocks) {
  return sections.map((section) => ({
    ...section,
    blocks: blocks
      .filter((block) => block.sectionId === section.id)
      .sort((a, b) => toNumber(a.order) - toNumber(b.order)),
  }));
}

app.post("/api/ai-health", async (req, res) => {
  console.log("[ai-health] request received", {
    hasQuestion: Boolean(req.body?.question),
  });
  if (!MIMO_API_KEY) {
    return res.status(500).json({
      error: "MIMO_API_KEY is not set",
    });
  }

  const { question, profile, metrics, context } = req.body || {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  const messages = [
    {
      role: "system",
      content:
        "你是专业的宠物健康管理助手，为猫狗等伴侣动物提供科学、审慎的健康建议。" +
        "输出要日常化、亲和，必须分条列出，不要写成一段话。" +
        "只输出 4-6 条要点，每条以“- ”开头。" +
        "不要使用“标题/总结/建议”等词作为小节标题。" +
        "不要替代兽医诊断，不给出紧急处置的具体医疗指令；若出现严重症状，明确建议尽快就医。",
    },
    {
      role: "user",
      content: buildUserContent({ question, profile, metrics, context }),
    },
  ];

  try {
    const resp = await fetch(
      `${MIMO_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MIMO_API_KEY}`,
        },
        body: JSON.stringify({
          model: MIMO_MODEL,
          messages,
          temperature: 0.7,
        }),
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      console.error("[ai-health] MiMo API error", data);
      return res.status(502).json({
        error: "MiMo API error",
        details: data,
      });
    }

    const content = data?.choices?.[0]?.message?.content ?? "";

    if (!content) {
      console.error("[ai-health] Empty response", data);
      return res.status(502).json({
        error: "Empty response from MiMo",
        details: data,
      });
    }

    return res.json({
      reply: content,
      request_id: data?.id || null,
    });
  } catch (err) {
    console.error("[ai-health] Server error", err);
    return res.status(500).json({
      error: "Server error",
      details: err?.message || String(err),
    });
  }
});

// Public APIs
app.get("/api/public/sections", async (_req, res) => {
  await loadDb();
  const sections = db.data.sections
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(withBlocks(sections, db.data.blocks));
});

app.get("/api/public/section/:slug", async (req, res) => {
  await loadDb();
  const section = db.data.sections.find(
    (item) => item.slug === req.params.slug && item.status === "PUBLISHED"
  );
  if (!section) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(withBlocks([section], db.data.blocks)[0]);
});

app.get("/api/public/faqs", async (req, res) => {
  await loadDb();
  const sectionSlug = req.query.sectionSlug;
  const faqs = db.data.faqs
    .filter((item) => item.status === "PUBLISHED")
    .filter((item) =>
      sectionSlug ? item.sectionSlug === String(sectionSlug) : true
    )
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(faqs);
});

app.get("/api/public/jobs", async (_req, res) => {
  await loadDb();
  const jobs = db.data.jobs
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(jobs);
});

app.get("/api/public/milestones", async (_req, res) => {
  await loadDb();
  const milestones = db.data.milestones
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(milestones);
});

app.get("/api/public/announcements", async (_req, res) => {
  await loadDb();
  const now = new Date();
  const announcements = db.data.announcements
    .filter((item) => item.status === "PUBLISHED")
    .filter((item) => {
      const startOk = item.startAt ? new Date(item.startAt) <= now : true;
      const endOk = item.endAt ? new Date(item.endAt) >= now : true;
      return startOk && endOk;
    })
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(announcements);
});

app.get("/api/public/site", async (_req, res) => {
  await loadDb();
  const now = new Date();
  const sections = db.data.sections
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  const faqs = db.data.faqs
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  const jobs = db.data.jobs
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  const milestones = db.data.milestones
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  const announcements = db.data.announcements
    .filter((item) => item.status === "PUBLISHED")
    .filter((item) => {
      const startOk = item.startAt ? new Date(item.startAt) <= now : true;
      const endOk = item.endAt ? new Date(item.endAt) >= now : true;
      return startOk && endOk;
    })
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));

  res.json({
    generatedAt: now.toISOString(),
    sections: withBlocks(sections, db.data.blocks),
    faqs,
    jobs,
    milestones,
    announcements,
  });
});

app.post("/api/public/contact", async (req, res) => {
  await loadDb();
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, message are required" });
  }
  const lead = {
    id: randomUUID(),
    name: String(name),
    email: String(email),
    phone: phone ? String(phone) : null,
    message: String(message),
    createdAt: nowIso(),
  };
  db.data.contacts.push(lead);
  await saveDb();
  res.json({ ok: true, id: lead.id });
});

app.post(
  "/api/public/ai-health/upload",
  upload.single("file"),
  async (req, res) => {
    await loadDb();
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "file is required" });
    }
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "only image files are allowed" });
    }
    const url = `/uploads/${file.filename}`;
    const media = {
      id: randomUUID(),
      filename: file.originalname,
      url,
      alt: "ai-health-upload",
      mime: file.mimetype,
      size: file.size,
      createdAt: nowIso(),
    };
    db.data.media.push(media);
    await saveDb();
    return res.json({ url });
  }
);

// Admin APIs
app.get("/api/admin/sections", requireAdmin, async (_req, res) => {
  await loadDb();
  const sections = db.data.sections
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(withBlocks(sections, db.data.blocks));
});

app.post("/api/admin/sections", requireAdmin, async (req, res) => {
  await loadDb();
  const { slug, title, subtitle, description, content, order, status } =
    req.body || {};
  if (!slug || !title) {
    return res.status(400).json({ error: "slug and title are required" });
  }
  if (db.data.sections.some((item) => item.slug === String(slug))) {
    return res.status(409).json({ error: "slug already exists" });
  }
  const section = {
    id: randomUUID(),
    slug: String(slug),
    title: String(title),
    subtitle: subtitle ? String(subtitle) : null,
    description: description ? String(description) : null,
    content: content ?? null,
    order: toNumber(order, 0),
    status: status || "PUBLISHED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.sections.push(section);
  await saveDb();
  res.json(section);
});

app.put("/api/admin/sections/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { slug, title, subtitle, description, content, order, status } =
    req.body || {};
  const section = db.data.sections.find((item) => item.id === id);
  if (!section) {
    return res.status(404).json({ error: "Not found" });
  }
  if (slug && db.data.sections.some((item) => item.slug === slug && item.id !== id)) {
    return res.status(409).json({ error: "slug already exists" });
  }
  if (slug !== undefined) section.slug = slug;
  if (title !== undefined) section.title = title;
  if (subtitle !== undefined) section.subtitle = subtitle;
  if (description !== undefined) section.description = description;
  if (content !== undefined) section.content = content;
  if (order !== undefined) section.order = toNumber(order, section.order);
  if (status !== undefined) section.status = status;
  section.updatedAt = nowIso();
  await saveDb();
  res.json(section);
});

app.delete("/api/admin/sections/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.sections = db.data.sections.filter((item) => item.id !== id);
  db.data.blocks = db.data.blocks.filter((item) => item.sectionId !== id);
  await saveDb();
  res.json({ ok: true });
});

app.get("/api/admin/blocks", requireAdmin, async (req, res) => {
  await loadDb();
  const sectionId = req.query.sectionId;
  const blocks = db.data.blocks
    .filter((item) => (sectionId ? item.sectionId === String(sectionId) : true))
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(blocks);
});

app.post("/api/admin/blocks", requireAdmin, async (req, res) => {
  await loadDb();
  const { sectionId, type, title, body, data, order } = req.body || {};
  if (!sectionId || !type) {
    return res.status(400).json({ error: "sectionId and type are required" });
  }
  const sectionExists = db.data.sections.some(
    (item) => item.id === String(sectionId)
  );
  if (!sectionExists) {
    return res.status(400).json({ error: "sectionId not found" });
  }
  const block = {
    id: randomUUID(),
    sectionId: String(sectionId),
    type: String(type),
    title: title ? String(title) : null,
    body: body ? String(body) : null,
    data: data ?? null,
    order: toNumber(order, 0),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.blocks.push(block);
  await saveDb();
  res.json(block);
});

app.put("/api/admin/blocks/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { type, title, body, data, order } = req.body || {};
  const block = db.data.blocks.find((item) => item.id === id);
  if (!block) {
    return res.status(404).json({ error: "Not found" });
  }
  if (type !== undefined) block.type = type;
  if (title !== undefined) block.title = title;
  if (body !== undefined) block.body = body;
  if (data !== undefined) block.data = data;
  if (order !== undefined) block.order = toNumber(order, block.order);
  block.updatedAt = nowIso();
  await saveDb();
  res.json(block);
});

app.delete("/api/admin/blocks/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.blocks = db.data.blocks.filter((item) => item.id !== id);
  await saveDb();
  res.json({ ok: true });
});

app.get("/api/admin/faqs", requireAdmin, async (_req, res) => {
  await loadDb();
  const faqs = db.data.faqs
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(faqs);
});

app.post("/api/admin/faqs", requireAdmin, async (req, res) => {
  await loadDb();
  const { sectionSlug, question, answer, order, status } = req.body || {};
  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required" });
  }
  const faq = {
    id: randomUUID(),
    sectionSlug: sectionSlug ? String(sectionSlug) : null,
    question: String(question),
    answer: String(answer),
    order: toNumber(order, 0),
    status: status || "PUBLISHED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.faqs.push(faq);
  await saveDb();
  res.json(faq);
});

app.put("/api/admin/faqs/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { sectionSlug, question, answer, order, status } = req.body || {};
  const faq = db.data.faqs.find((item) => item.id === id);
  if (!faq) {
    return res.status(404).json({ error: "Not found" });
  }
  if (sectionSlug !== undefined) faq.sectionSlug = sectionSlug;
  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (order !== undefined) faq.order = toNumber(order, faq.order);
  if (status !== undefined) faq.status = status;
  faq.updatedAt = nowIso();
  await saveDb();
  res.json(faq);
});

app.delete("/api/admin/faqs/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.faqs = db.data.faqs.filter((item) => item.id !== id);
  await saveDb();
  res.json({ ok: true });
});

app.get("/api/admin/jobs", requireAdmin, async (_req, res) => {
  await loadDb();
  const jobs = db.data.jobs
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(jobs);
});

app.post("/api/admin/jobs", requireAdmin, async (req, res) => {
  await loadDb();
  const { title, location, type, description, order, status } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }
  const job = {
    id: randomUUID(),
    title: String(title),
    location: location ? String(location) : null,
    type: type ? String(type) : null,
    description: String(description),
    order: toNumber(order, 0),
    status: status || "PUBLISHED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.jobs.push(job);
  await saveDb();
  res.json(job);
});

app.put("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { title, location, type, description, order, status } = req.body || {};
  const job = db.data.jobs.find((item) => item.id === id);
  if (!job) {
    return res.status(404).json({ error: "Not found" });
  }
  if (title !== undefined) job.title = title;
  if (location !== undefined) job.location = location;
  if (type !== undefined) job.type = type;
  if (description !== undefined) job.description = description;
  if (order !== undefined) job.order = toNumber(order, job.order);
  if (status !== undefined) job.status = status;
  job.updatedAt = nowIso();
  await saveDb();
  res.json(job);
});

app.delete("/api/admin/jobs/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.jobs = db.data.jobs.filter((item) => item.id !== id);
  await saveDb();
  res.json({ ok: true });
});

app.get("/api/admin/milestones", requireAdmin, async (_req, res) => {
  await loadDb();
  const milestones = db.data.milestones
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(milestones);
});

app.post("/api/admin/milestones", requireAdmin, async (req, res) => {
  await loadDb();
  const { year, title, description, order } = req.body || {};
  if (!year || !title) {
    return res.status(400).json({ error: "year and title are required" });
  }
  const milestone = {
    id: randomUUID(),
    year: String(year),
    title: String(title),
    description: description ? String(description) : null,
    order: toNumber(order, 0),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.milestones.push(milestone);
  await saveDb();
  res.json(milestone);
});

app.put("/api/admin/milestones/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { year, title, description, order } = req.body || {};
  const milestone = db.data.milestones.find((item) => item.id === id);
  if (!milestone) {
    return res.status(404).json({ error: "Not found" });
  }
  if (year !== undefined) milestone.year = year;
  if (title !== undefined) milestone.title = title;
  if (description !== undefined) milestone.description = description;
  if (order !== undefined) milestone.order = toNumber(order, milestone.order);
  milestone.updatedAt = nowIso();
  await saveDb();
  res.json(milestone);
});

app.delete("/api/admin/milestones/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.milestones = db.data.milestones.filter((item) => item.id !== id);
  await saveDb();
  res.json({ ok: true });
});

app.get("/api/admin/announcements", requireAdmin, async (_req, res) => {
  await loadDb();
  const announcements = db.data.announcements
    .slice()
    .sort((a, b) => toNumber(a.order) - toNumber(b.order));
  res.json(announcements);
});

app.post("/api/admin/announcements", requireAdmin, async (req, res) => {
  await loadDb();
  const { title, body, startAt, endAt, order, status } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }
  const announcement = {
    id: randomUUID(),
    title: String(title),
    body: String(body),
    startAt: startAt ? new Date(startAt).toISOString() : null,
    endAt: endAt ? new Date(endAt).toISOString() : null,
    order: toNumber(order, 0),
    status: status || "PUBLISHED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.data.announcements.push(announcement);
  await saveDb();
  res.json(announcement);
});

app.put("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const { title, body, startAt, endAt, order, status } = req.body || {};
  const announcement = db.data.announcements.find((item) => item.id === id);
  if (!announcement) {
    return res.status(404).json({ error: "Not found" });
  }
  if (title !== undefined) announcement.title = title;
  if (body !== undefined) announcement.body = body;
  if (startAt !== undefined) {
    announcement.startAt = startAt ? new Date(startAt).toISOString() : null;
  }
  if (endAt !== undefined) {
    announcement.endAt = endAt ? new Date(endAt).toISOString() : null;
  }
  if (order !== undefined) announcement.order = toNumber(order, announcement.order);
  if (status !== undefined) announcement.status = status;
  announcement.updatedAt = nowIso();
  await saveDb();
  res.json(announcement);
});

app.delete("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  db.data.announcements = db.data.announcements.filter((item) => item.id !== id);
  await saveDb();
  res.json({ ok: true });
});

app.post(
  "/api/admin/media",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    await loadDb();
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "file is required" });
    }
    const url = `/uploads/${file.filename}`;
    const media = {
      id: randomUUID(),
      filename: file.originalname,
      url,
      alt: req.body?.alt ? String(req.body.alt) : null,
      mime: file.mimetype,
      size: file.size,
      createdAt: nowIso(),
    };
    db.data.media.push(media);
    await saveDb();
    return res.json(media);
  }
);

app.get("/api/admin/media", requireAdmin, async (_req, res) => {
  await loadDb();
  const media = db.data.media
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(media);
});

app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
  await loadDb();
  const { id } = req.params;
  const target = db.data.media.find((item) => item.id === id);
  if (!target) {
    return res.status(404).json({ error: "Not found" });
  }
  db.data.media = db.data.media.filter((item) => item.id !== id);
  const filePath = path.join(uploadsDir, path.basename(target.url));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await saveDb();
  res.json({ ok: true });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.sendFile(frontendHtml);
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
