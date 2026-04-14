# ai-website-generator

以 **SiteSpec**（結構化 JSON）為單一真實來源，由 **renderer** 產出單頁靜態 HTML，並可透過 **GitHub Actions** 部署到 **GitHub Pages**。  
內容可由你手寫／編輯器維護，或由 **Dify、n8n、其他 AI 服務** 產出符合 schema 的 JSON 後寫入 `sites/<slug>/site-spec.json`，再觸發建置。

## 專案結構

| 路徑 | 說明 |
|------|------|
| `packages/site-spec` | `SiteSpec` 型別、JSON Schema、`validateSiteSpec`、fixtures |
| `packages/renderer` | `SiteSpec` → 單頁 HTML |
| `scripts/build-sites.mjs` | CI／本機：依 `sites/<slug>/site-spec.json` 產生 `index.html` |
| `.github/workflows/deploy-pages.yml` | 建置並部署 `sites/` 到 GitHub Pages |
| `infra/dify`、`infra/n8n`、`infra/github-pages` | 選用：AI／自動化與平台設定說明 |

更細的 Pages 與 n8n 說明請見 [infra/github-pages/README.md](infra/github-pages/README.md)、[infra/n8n/README.md](infra/n8n/README.md)。

## 本機開發

```bash
npm ci
npm run typecheck
npm test
```

從 `site-spec.json` 產生各子站 HTML：

```bash
npm run build:sites
```

只重建某一個 slug（與 CI 的 `SITE_SLUG` 相同）：

```bash
SITE_SLUG=demo-brand npm run build:sites
```

編譯 workspace（`site-spec`、`renderer` 的 `dist/`）：

```bash
npm run build
```

## 文件與變更紀錄

- 待辦與路線圖：[TODOS.md](TODOS.md)  
- 版本變更：[Changelog.md](Changelog.md)  

**約定**：每次有使用者可見或行為變更的提交，請同步更新 `Changelog.md`；規劃中或可追蹤事項寫入 `TODOS.md`。

## GitHub：`main` 直接 push，不必開 PR

此 repo 預設採 **小步直接合入 `main`**（不強制 Pull Request）。請在 GitHub 上確認 **沒有** 強制「一定要經過 PR 才能進 `main`」的規則：

1. 開啟 repo：**Settings** → **Rules** → **Rulesets**（或舊版 **Branches** → **Branch protection rules**）。  
2. 若針對 `main`（或 `*`）有規則，請檢查是否勾選類似：  
   - **Require a pull request before merging**  
   - **Require approvals**  
3. 若你希望 **完全直接 push**：請關閉上述選項，或刪除／停用該條 branch protection／ruleset。  
4. 若組織層級強制 PR，則無法僅靠本 repo 覆寫，需改 org policy 或另開不受限的 repo。

> 說明：是否「一定要開 PR」由 **GitHub 網頁上的分支／規則設定** 決定，無法只靠在本 repo 放某個檔案就自動關閉；此處為團隊約定 + 設定檢查清單。

## 授權

本專案以 [MIT License](LICENSE) 釋出。
