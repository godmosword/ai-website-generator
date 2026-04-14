# GitHub Pages 發佈設定

## 一次性設定（在 GitHub 網頁操作）

1. 進入 repo **Settings → Pages**。
2. **Build and deployment** 來源選 **GitHub Actions**（不要選 branch）。
3. 第一次部署後，Pages 網址會類似 `https://<owner>.github.io/<repo>/`（依你的帳號與 repo 名稱而定）。

## 觸發方式

- **推送 `main`**：當 `sites/**`、`packages/**`、`scripts/**` 或本 workflow 變更時會自動建置並部署。
- **手動執行**：Actions → **Deploy GitHub Pages** → Run workflow，可選填 `slug` 只重建單一子站。

## n8n 觸發 GitHub Actions

建立 Personal Access Token（Fine-grained 或 classic）並授權 `actions:write`、`contents:read`（依你實際寫檔需求調整）。

HTTP Request 範例：

- **URL**：`https://api.github.com/repos/<OWNER>/<REPO>/actions/workflows/deploy-pages.yml/dispatches`
- **Method**：`POST`
- **Headers**：
  - `Accept: application/vnd.github+json`
  - `Authorization: Bearer <GITHUB_TOKEN>`
  - `X-GitHub-Api-Version: 2022-11-28`
- **Body**：

```json
{
  "ref": "main",
  "inputs": {
    "slug": "demo-brand"
  }
}
```

`slug` 可留空字串或省略 `inputs`，代表重建 `sites/` 底下所有子資料夾。

## LINE 預覽網址

`apps/line-webhook` 的 `PUBLIC_BASE_URL` 請設成 Pages 根路徑加上 `/sites` 或你實際託管靜態檔的路徑。若整包 `sites/` 就是 Pages 根目錄，則為：

`https://<owner>.github.io/<repo>/`

預覽連結會是：`https://<owner>.github.io/<repo>/<slug>/`
