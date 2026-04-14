# n8n Pipeline 匯入說明

1. 匯入 [`line-to-site-workflow.json`](./line-to-site-workflow.json)。
2. 設定環境變數：
   - `DIFY_API_URL`
   - `GITHUB_WORKFLOW_DISPATCH_URL`（例如 `https://api.github.com/repos/<OWNER>/<REPO>/actions/workflows/deploy-pages.yml/dispatches`，細節見 [`../github-pages/README.md`](../github-pages/README.md)）
3. 在 `Call_Dify` 節點綁定 Header Auth（`Authorization: Bearer <DIFY_API_KEY>`）。
4. 若你使用 n8n Cloud，`Write_Artifact` 節點改為 S3 / GitHub API 寫檔節點。
5. 在 LINE webhook 收到需求後呼叫此 workflow，將 `userId` 與 `userText` 傳入。
