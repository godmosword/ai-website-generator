# Changelog

本檔遵循「**使用者或營運可感知**的變更才必寫」；純重構、註解、內部變數可省略或併入 **Internal**。

格式參考 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，版本號建議與 [package.json](package.json) 的 `version` 對齊。

## [Unreleased]

### Added

- 根目錄 [README.md](README.md)（專案說明、本機指令、GitHub `main` 直推設定檢查）。
- [TODOS.md](TODOS.md)、[Changelog.md](Changelog.md) 作為後續維護約定入口。

### Changed

- GitHub Actions：升級 `checkout`、`setup-node`、`deploy-pages`；並釘選 `actions/configure-pages@v5.0.1`、`actions/upload-pages-artifact@v4.0.1`（上游已宣告 Node 24 / 相依 `upload-artifact@v7`），移除 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`，避免「強制在 Node 24 執行仍標 Node 20 的 action」之雙重提示。

### Fixed

### Removed

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
