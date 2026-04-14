# TODOS

可追蹤的後續工作與技術債。完成項目請勾選並在 [Changelog.md](Changelog.md) 留下對應說明（若對使用者或營運可見）。

## 產品與流程

- [ ] LINE：支援圖片／貼圖等非文字事件（或明確回覆「請用文字描述」）。
- [ ] LINE：群組／聊天室來源的 `userId` 與會話鍵策略（避免對話錯綁）。
- [ ] Dify：匯出實際 Chatflow YAML／應用 ID 到 `infra/dify/`（與 [chatflow-blueprint.md](infra/dify/chatflow-blueprint.md) 對齊）。
- [ ] n8n：依你的執行環境調整 `Write_Artifact`（本機檔案 vs S3 vs GitHub Contents API）。

## 站點與部署

- [ ] GitHub Pages：在 repo **Settings → Pages** 確認來源為 **GitHub Actions**，並驗證首次部署成功。
- [ ] 自訂網域（選用）：DNS、`CNAME`、HTTPS 與 `PUBLIC_BASE_URL` 一致化。
- [ ] `line-webhook` 生產部署（Fly／Render／Cloud Run 等）與 secret 管理流程文件化。

## 程式品質與維運

- [ ] 佇列：依使用者或固定 worker 數做有限併發（避免單一長任務塞滿全域佇列）。
- [ ] 觀測：結構化 log、request id、與 Dify／LINE 錯誤碼對照表。
- [ ] `SiteSpec`：以單一權威驗證（例如完整 JSON Schema + Ajv）對齊 `validateSiteSpec`。
- [ ] 測試：`apps/line-webhook` 簽章、payload 驗證、佇列行為的單元／整合測試。
- [ ] ESLint／Prettier（選用）：與 CI `npm run typecheck` 一併跑。

## 文件

- [ ] 補 `LICENSE` 並在 README 註明。
- [ ] 若有對外試用，補「隱私權／資料留存」與 LINE 官方帳號使用條款連結。
