# n8n Pipeline 匯入說明

## 整體流程

```
Webhook → Normalize SiteSpec → Write_Artifact → Trigger Deploy
```

## 快速開始

1. 匯入 [`http-site-spec-workflow.json`](./http-site-spec-workflow.json)
2. 設定環境變數（見下方各模式說明）
3. 啟用 Webhook 後，以 **POST** 呼叫公開網址，Body 為完整 SiteSpec JSON，  
   或包一層 `{ "siteSpec": { ... } }`

---

## Write_Artifact 三種接法

### 模式 A：本機自架 n8n（寫入本機路徑）

適合：n8n self-hosted，與 build-sites.mjs 在同一台機器。

```json
{
  "node": "Write_Artifact",
  "type": "n8n-nodes-base.writeBinaryFile",
  "parameters": {
    "fileName": "/home/<user>/ai-website-generator/sites/{{$json.siteSpec.slug}}/site-spec.json",
    "dataPropertyName": "siteSpecJson"
  }
}
```

步驟：
1. 在 `Normalize_SiteSpec` 節點用 Set 將 `siteSpec` 序列化為 `siteSpecJson`（JSON.stringify）
2. `fileName` 指向 repo 內 `sites/<slug>/site-spec.json`
3. 接著用 **Execute Command** 或 **HTTP Request** 觸發 GitHub Actions

---

### 模式 B：GitHub Contents API（雲端寫入 repo）

適合：n8n Cloud 或任何無法存取本機路徑的環境。

```
PUT https://api.github.com/repos/<OWNER>/<REPO>/contents/sites/<slug>/site-spec.json
Authorization: Bearer <GITHUB_PAT>
Content-Type: application/json

{
  "message": "chore: update site-spec for <slug>",
  "content": "<base64 encoded JSON>",
  "sha": "<現有檔案 SHA，若是新增可省略>"
}
```

n8n 節點設定：
1. **HTTP Request** 節點，Method `PUT`
2. Header：`Authorization: Bearer {{ $env.GITHUB_PAT }}`
3. Body（JSON Expression）：
   ```js
   {
     message: `chore: update site-spec for ${$json.slug}`,
     content: Buffer.from(JSON.stringify($json.siteSpec, null, 2)).toString('base64')
   }
   ```
4. 寫入後 GitHub Actions 會自動觸發（若 workflow 監聽 `push` on `sites/**`）

---

### 模式 C：S3 / 物件儲存（搭配外部建站 Pipeline）

適合：自訂 CI/CD 從 S3 拉取 spec 再建站。

```
PUT s3://<bucket>/sites/<slug>/site-spec.json
Content-Type: application/json
```

n8n 節點設定：
1. **AWS S3** 節點（或 MinIO 用 HTTP Request）
2. Bucket：`{{ $env.S3_BUCKET }}`
3. Key：`sites/{{ $json.siteSpec.slug }}/site-spec.json`
4. Body：序列化後的 SiteSpec JSON

---

## 環境變數總覽

| 變數 | 說明 | 模式 |
|------|------|------|
| `GITHUB_WORKFLOW_DISPATCH_URL` | `https://api.github.com/repos/<OWNER>/<REPO>/actions/workflows/deploy-pages.yml/dispatches` | A, B |
| `GITHUB_PAT` | GitHub Personal Access Token（repo + workflow 權限） | A, B |
| `S3_BUCKET` | S3 bucket 名稱 | C |
| `S3_REGION` | S3 region | C |

細節見 [`../github-pages/README.md`](../github-pages/README.md)

---

## 與 Dify 串接（選用）

在 `Webhook_SiteSpec` 與 `Normalize_SiteSpec` 之間插入 **HTTP Request** 節點呼叫 Dify API，  
將回傳 JSON 解析後接既有寫檔節點。欄位命名建議使用 `sessionId` + `userMessage` 保持中立。

## 本機驗證

寫入後可用 CLI 確認格式正確：

```bash
node packages/cli/dist/cli.js validate sites/<slug>/site-spec.json
```
