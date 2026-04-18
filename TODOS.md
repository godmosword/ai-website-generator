# TODOS

可追蹤的後續工作與技術債。完成項目請勾選並在 [Changelog.md](Changelog.md) 留下對應說明（若對使用者或營運可見）。

## 產品與內容

- [x] **多頁／多路由**：`SiteSpec.pages[]` + `renderMultiPage()` + 子頁目錄輸出（v0.2.0）
- [x] **主題與範本庫**：`buildThemeStyles()` 支援 `natural`、`minimal`、`business` 三種視覺風格（v0.2.0）
- [x] **CLI**：本機 `init` / `validate` / `build` / `preview` 一條龍，降低手動編 JSON 門檻（v0.2.0）
- [ ] Dify：匯出實際 Chatflow YAML／應用 ID 到 `infra/dify/`（與 [chatflow-blueprint.md](infra/dify/chatflow-blueprint.md) 對齊）。
- [ ] n8n：依你的執行環境調整 `Write_Artifact`（本機檔案 vs S3 vs GitHub Contents API）。

## 站點與部署

- [ ] GitHub Pages：在 repo **Settings → Pages** 確認來源為 **GitHub Actions**，並驗證首次部署成功。
- [ ] 自訂網域（選用）：DNS、`CNAME`、HTTPS 與對外宣傳的基底 URL 一致化。

## 程式品質與維運

- [x] `SiteSpec`：以完整 JSON Schema + Ajv draft-2020-12 取代手工 regex 驗證（v0.2.0）
- [x] 測試：renderer 邊界案例、`validateSiteSpec` 所有錯誤分支、CLI 整合測試（v0.2.0，54 tests）
- [x] ESLint／Prettier：已整合至 CI（v0.2.0）
- [ ] 觀測（若有對外 API）：結構化 log、request id、與上游 AI 服務錯誤碼對照表。

## 文件

- [x] 補 `LICENSE`（MIT）並在 README 註明。
- [ ] 若有對外試用或蒐集使用者內容，補「隱私權／資料留存」說明。
