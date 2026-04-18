# Changelog

本檔遵循「**使用者或營運可感知**的變更才必寫」；純重構、註解、內部變數可省略或併入 **Internal**。

格式參考 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，版本號建議與 [package.json](package.json) 的 `version` 對齊。

## [0.2.0] — 2026-04-18

### Added

- **`@webomate/cli`** 新套件：`webomate init / validate / build / preview` 指令
- **多頁輸出** — `renderMultiPage()` 回傳 `RenderedPage[]`；`build-sites.mjs` 寫出子頁目錄
- **主題變體** — `buildThemeStyles()` 支援 `natural`、`minimal`、`business` 三種視覺風格
- **Pages schema** — `SiteSpec` 新增可選 `pages` 陣列；`SubPage` 型別匯出
- **Ajv JSON Schema draft-2020-12 驗證** — 以 `Ajv2020` 取代手工 regex；錯誤訊息中文化
- **ESLint + Prettier** — 強制套用至 `packages/*/src/**/*.ts`
- **GitHub Actions CI** — 每次 push/PR 執行 typecheck → lint → format:check → test
- **Dify chatflow 藍圖** — 更新至 v0.2.0 schema + DSL 匯出步驟
- **n8n 流水線說明** — 記錄三種 Write_Artifact 模式（本機、GitHub Contents API、S3）

### Fixed

- **CSS injection** — `theme.fontFamily` 在注入 CSS 前先過濾非字型字元
- **路徑穿越** — `build-sites.mjs` 驗證 `page.slug` 格式再用作目錄名稱
- **TypeScript narrowing** — `loadSpec` 的 `process.exit` 後補 `throw new Error("unreachable")`
- **CI action 版本** — `actions/checkout` 與 `setup-node` 從 `@v6`（不存在）修正為 `@v4`
- **AJV 錯誤訊息** — 移除錯誤字串中的原始 URL 值，避免反射原始輸入

### Tests

- 測試數量 25 → 54（橫跨 3 個 package）
- 新增 `packages/cli/src/cli.test.ts`：11 個整合測試，覆蓋所有 CLI 指令與錯誤路徑
- 新增 `packages/renderer/src/themes.ts` 單元測試
- 補充 `schema.test.ts`：`secondaryColor`、`minItems`、`tone` enum、`additionalProperties`、icon enum、style enum、pages slug、brandName empty 等情境

---

## [Unreleased]

### Added

- Cursor Cloud Agent：新增 [`.cursor/environment.json`](.cursor/environment.json)，VM 啟動後以 **`npm ci`** 更新依賴；搭配 [`.cursor/Dockerfile`](.cursor/Dockerfile)（**Node 22**）作為環境基底。
- 根目錄 [LICENSE](LICENSE)（**MIT**）。
- `packages/site-spec`：`validateSiteSpec` 單元測試（[schema.test.ts](packages/site-spec/src/schema.test.ts)）。

### Changed

- 產品敘述與 repo 結構收斂為 **SiteSpec → 靜態頁 → GitHub Pages**；選用 **Dify／n8n** 作為產出或遞送 SiteSpec 的管道，不再以即時通訊為預設入口。
- [`scripts/build-sites.mjs`](scripts/build-sites.mjs)：當設定了 **`SITE_SLUG`** 但未成功建置該 slug（缺 `site-spec.json` 等）時結束碼為 **1**，避免 CI 靜默成功。

### Fixed

- GitHub Actions：`deploy-pages.yml` 先前誤用 **不存在的** `configure-pages@v5.0.1`、`upload-pages-artifact@v4.0.1`（上游 Node 24 版為 **`v6.0.0`**；upload 之 `upload-artifact@v7` 變更發佈為 **`v5.0.0`**）。已改為 `actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`。
- **Monorepo `npm ci`**：發佈 `0.1.1` 後，`line-webhook` / `renderer` 仍依賴 `@webomate/*@0.1.0`，與工作區版本不一致，導致 CI 向 npm registry 抓套件而 **404**。已改為依賴 **`0.1.1`** 並更新 `package-lock.json`。

### Removed

- **`apps/line-webhook`** 與所有 LINE Webhook／`@line/bot-sdk` 依賴；workspace 僅保留 `packages/*`。
- n8n 範例 **`line-to-site-workflow.json`**，改為 **`http-site-spec-workflow.json`**（HTTP 接收 SiteSpec JSON）。

---

## [0.1.1] - 2026-04-14

### Added

- 根目錄 [README.md](README.md)（專案說明、本機指令、GitHub `main` 直推設定檢查）。
- [TODOS.md](TODOS.md)、[Changelog.md](Changelog.md) 作為後續維護約定入口。

### Changed

- GitHub Actions：升級 `checkout`、`setup-node`、`deploy-pages`；移除 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`。曾嘗試釘選不存在的 action patch 標籤（已於 **[Unreleased]** 改為 `configure-pages@v6`、`upload-pages-artifact@v5`）。

---

## [0.1.0] - 2026-04-14

### Added

- Monorepo 骨架：`site-spec`、`renderer`、`line-webhook`。
- `SiteSpec` JSON Schema、fixtures、`validateSiteSpec`。
- LINE Webhook：簽章驗證、文字事件處理、背景佇列、可選 Dify、Flex 預覽訊息。
- `sites/` 範例與 `scripts/build-sites.mjs`；GitHub Actions 部署 GitHub Pages（`deploy-pages.yml`）。
- `infra/dify`、`infra/n8n`、`infra/github-pages` 說明文件。

### Internal

- Vitest 對 `@webomate/*` 的 path alias；套件以 `dist` 作為 Node 執行入口。
