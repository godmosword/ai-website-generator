import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { spawnSync, execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distCli = path.resolve(__dirname, "../dist/cli.js");
const root = path.resolve(__dirname, "../../..");

function runCli(args: string[], cwd = root) {
  const result = spawnSync("node", [distCli, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env }
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

const validSpec = {
  slug: "test-site",
  brandName: "測試品牌",
  hero: { title: "標題", subtitle: "副標題", description: "描述" },
  sections: [{ id: "about", heading: "關於", body: "內容" }],
  ctas: [{ label: "了解更多", url: "https://example.com", style: "primary" }],
  links: [],
  contact: {},
  seo: { title: "測試", description: "SEO 描述", keywords: ["test"] },
  theme: {
    tone: "business",
    primaryColor: "#2563EB",
    secondaryColor: "#DBEAFE",
    fontFamily: "Noto Sans TC"
  }
};

describe("CLI (integration)", () => {
  let tmpDir: string;

  beforeAll(() => {
    if (!existsSync(distCli)) {
      execSync("npm run build", { cwd: root, stdio: "pipe" });
    }
  });

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "webomate-cli-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("init", () => {
    it("建立 sites/<slug>/site-spec.json", () => {
      const result = runCli(["init", "my-brand"], tmpDir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("已建立");
      const specPath = path.join(tmpDir, "sites", "my-brand", "site-spec.json");
      expect(existsSync(specPath)).toBe(true);
      const spec = JSON.parse(readFileSync(specPath, "utf8"));
      expect(spec.slug).toBe("my-brand");
    });

    it("無 slug 引數時使用預設 my-site", () => {
      const result = runCli(["init"], tmpDir);
      expect(result.status).toBe(0);
      const specPath = path.join(tmpDir, "sites", "my-site", "site-spec.json");
      expect(existsSync(specPath)).toBe(true);
    });
  });

  describe("validate", () => {
    it("合法 spec 回傳 exit 0 並輸出通過訊息", () => {
      const specPath = path.join(tmpDir, "site-spec.json");
      writeFileSync(specPath, JSON.stringify(validSpec, null, 2), "utf8");
      const result = runCli(["validate", specPath]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("驗證通過");
    });

    it("無效 spec 回傳 exit 1 並輸出錯誤", () => {
      const badSpec = { ...validSpec, ctas: [{ label: "x", url: "http://evil.com", style: "primary" }] };
      const specPath = path.join(tmpDir, "bad-spec.json");
      writeFileSync(specPath, JSON.stringify(badSpec, null, 2), "utf8");
      const result = runCli(["validate", specPath]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("驗證失敗");
    });

    it("檔案不存在回傳 exit 1", () => {
      const result = runCli(["validate", "/tmp/nonexistent-spec.json"]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("找不到檔案");
    });

    it("無效 JSON 回傳 exit 1", () => {
      const specPath = path.join(tmpDir, "bad-json.json");
      writeFileSync(specPath, "{ not valid json }", "utf8");
      const result = runCli(["validate", specPath]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("不是合法的 JSON");
    });

    it("無路徑引數回傳 exit 1", () => {
      const result = runCli(["validate"]);
      expect(result.status).toBe(1);
    });
  });

  describe("build", () => {
    it("輸出 index.html 至 spec 同目錄", () => {
      const specDir = path.join(tmpDir, "mysite");
      mkdirSync(specDir, { recursive: true });
      const specPath = path.join(specDir, "site-spec.json");
      writeFileSync(specPath, JSON.stringify(validSpec, null, 2), "utf8");
      const result = runCli(["build", specPath]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("已輸出");
      const outPath = path.join(specDir, "index.html");
      expect(existsSync(outPath)).toBe(true);
      expect(readFileSync(outPath, "utf8")).toContain("<!doctype html>");
    });

    it("無路徑引數回傳 exit 1", () => {
      const result = runCli(["build"]);
      expect(result.status).toBe(1);
    });
  });

  describe("help / unknown command", () => {
    it("無命令輸出 help 並 exit 0", () => {
      const result = runCli([]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("webomate");
    });

    it("未知命令輸出 help 並 exit 1", () => {
      const result = runCli(["unknown-cmd"]);
      expect(result.status).toBe(1);
    });
  });
});
