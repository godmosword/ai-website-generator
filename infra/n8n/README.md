# n8n Pipeline 匯入說明

## HTTP 寫入 SiteSpec（建議）

1. 匯入 [`http-site-spec-workflow.json`](./http-site-spec-workflow.json)。
2. 設定環境變數：
   - `GITHUB_WORKFLOW_DISPATCH_URL`（例如 `https://api.github.com/repos/<OWNER>/<REPO>/actions/workflows/deploy-pages.yml/dispatches`，細節見 [`../github-pages/README.md`](../github-pages/README.md)）
3. 若你使用 n8n Cloud，`Write_Artifact` 節點改為 S3／GitHub Contents API 等可寫入 repo 或物件儲存的方式（本機路徑 `/data/sites/...` 僅為自架範例）。
4. 啟用 Webhook 後，以 **POST** 呼叫公開網址，**Body** 為完整 **SiteSpec** JSON，或包一層 `{ "siteSpec": { ... } }`（需含 `slug` 等必填欄位）。流程會寫入 `sites/<slug>/site-spec.json` 並觸發 GitHub Actions 部署。

## 與 Dify 串接（選用）

若要在 n8n 內先呼叫 Dify 再寫檔：在 `Webhook_SiteSpec` 與 `Normalize_SiteSpec` 之間插入 **HTTP Request** 節點（對 Dify Chat/Messages API），並將回傳的 JSON 字串解析為 `siteSpec` 後再接既有寫檔節點；欄位命名請避免綁定特定即時通訊產品（例如使用 `sessionId` + `userMessage`）。
